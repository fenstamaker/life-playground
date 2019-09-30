import {
  Simulator,
  Option,
  Grid,
  GridCells,
  Cell,
  XY,
  I,
  Options,
  Algorithm,
} from "./simulator";

interface GridOptions {
  aliveChance: number;
  foodChance: number;
}

interface StepOptions {
  wrapAround: boolean;
}

export enum CreatureStatus {
  Null,
  Food,
  Creature,
}

export interface CreatureCell extends Cell {
  tag: Algorithm.Creatures;
  status: CreatureStatus;
  energy: number;
}

export class CreatureSimulator implements Simulator {
  readonly name = Algorithm.Creatures;
  readonly options: Options = {
    wrapAround: { type: "boolean", default: true },
    aliveChance: {
      type: "number",
      default: 0.1,
      min: 0.1,
      max: 1.0,
      step: 0.01,
    },
    foodChance: {
      type: "number",
      default: 0.1,
      min: 0.1,
      max: 1.0,
      step: 0.01,
    },
  };
  readonly deltaCoords = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  initGrid(
    width: number,
    height: number,
    { aliveChance, foodChance }: GridOptions
  ): Grid {
    const cells: GridCells = [];
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (Math.random() < 0.1) {
          cells[I(width, x, y)] = {
            alive: true,
            tag: Algorithm.Creatures,
            status: CreatureStatus.Creature,
            energy: 6,
          } as CreatureCell;
        } else if (Math.random() < foodChance) {
          cells[I(width, x, y)] = {
            alive: true,
            tag: Algorithm.Creatures,
            status: CreatureStatus.Food,
            energy: 10,
          } as CreatureCell;
        } else {
          cells[I(width, x, y)] = {
            alive: false,
            tag: Algorithm.Creatures,
            energy: 0,
            status: CreatureStatus.Null,
          } as CreatureCell;
        }
      }
    }

    return {
      width,
      height,
      cells,
    };
  }

  stepGrid(grid: Grid, { wrapAround }: StepOptions): Grid {
    const neighborsX = this.neighborsSelectFn(wrapAround, grid.width);
    const neighborsY = this.neighborsSelectFn(wrapAround, grid.height);
    return {
      ...grid,
      cells: grid.cells.map((cell: CreatureCell, i: number) => {
        const [x, y] = XY(grid.width, i);
        return this.stepCell(cell, this.neighbors(
          neighborsX,
          neighborsY,
          x,
          y,
          grid
        ) as Array<CreatureCell>);
      }),
    };
  }

  neighbors(
    selectXFn: (z: number, dz: number) => number,
    selectYFn: (z: number, dz: number) => number,
    x: number,
    y: number,
    grid: Grid
  ): GridCells {
    return this.deltaCoords.map(([dx, dy]) => {
      const x2 = selectXFn(x, dx);
      const y2 = selectYFn(y, dy);
      return grid.cells[I(grid.width, x2, y2)];
    });
  }

  neighborsSelectFn(wrapAround: boolean, size: number) {
    if (wrapAround) {
      return (z: number, dz: number) => (z + dz + size) % size;
    }
    return (z: number, dz: number) => z + dz;
  }

  stepCell(self: CreatureCell, neighbors: Array<CreatureCell>): CreatureCell {
    const food = neighbors.filter(
      cell => cell && cell.status === CreatureStatus.Food
    );
    const creatures = neighbors.filter(
      cell => cell && cell.status === CreatureStatus.Creature
    );
    const alive = neighbors.filter(cell => cell && cell.alive);

    let energy = self.energy;

    if (self.status === CreatureStatus.Creature) {
      energy -= 0.1;
      if (food.length > 0) {
        energy += food.length;
      }
      if (creatures.length >= 4) {
        energy -= creatures.length * 0.1;
      }
    }

    if (energy > 0 && creatures.length >= 2 && creatures.length < 4) {
      return {
        ...self,
        energy,
      };
    }

    if (self.status === CreatureStatus.Food) {
      energy -= 0.1;
      if (energy > 0 && creatures.length === 0 && food.length < 9) {
        return {
          ...self,
          energy,
        };
      }

      if (food.length === 3) {
        return {
          ...self,
          status: CreatureStatus.Food,
          energy: 10,
          alive: true,
        };
      }
    }

    if (!self.alive) {
      if (creatures.length >= 2 && food.length >= 1) {
        return {
          ...self,
          status: CreatureStatus.Creature,
          energy: 6,
          alive: true,
        };
      }

      if (food.length >= 3 && food.length < 4) {
        return {
          ...self,
          status: CreatureStatus.Food,
          energy: 10,
          alive: true,
        };
      }
    }

    return {
      alive: false,
      tag: Algorithm.Creatures,
      status: CreatureStatus.Null,
      energy: 0,
    } as CreatureCell;
  }
}
