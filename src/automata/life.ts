import { Stats } from "fs";

export enum Status {
  Null,
  Food,
  Creature,
}

export interface Cell {
  status: Status;
  energy: number;
}

export type Grid = Array<Array<Cell>>;

export function isCell(cell: Cell | any): cell is Cell {
  return (cell as Cell).status !== undefined;
}

export function stepCell(self: Cell, neighbors: Array<Cell>): Cell {
  // if creature
  const food = neighbors.filter(x => x.status === Status.Food);
  const creatures = neighbors.filter(x => x.status === Status.Creature);

  let energy = self.energy;

  if (self.status === Status.Creature) {
    energy -= 0.1;
    if (food.length > 0) {
      energy += food.length;
    }
    if (creatures.length >= 4) {
      energy -= creatures.length;
    }

    if (energy > 0 && creatures.length >= 2 && creatures.length < 4) {
      return {
        ...self,
        energy,
      };
    }
  }

  if (self.status === Status.Food) {
    energy -= 0.1;
    if (energy > 0 && creatures.length === 0 && food.length < 9) {
      return {
        ...self,
        energy,
      };
    }
  }

  if (self.status === Status.Null) {
    if (creatures.length >= 2 && food.length >= 2) {
      return {
        status: Status.Creature,
        energy: 3,
      };
    }
    // if (creatures.length === 3) {
    //   return {
    //     status: Status.Creature,
    //     energy: 10
    //   };
    // }
    if (food.length === 3) {
      return {
        status: Status.Food,
        energy: 10,
      };
    }
  }

  return {
    status: Status.Null,
    energy: 0,
  };
}

const deltaCoords = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

function neighbors(
  selectXFn: (z: number, dz: number) => number,
  selectYFn: (z: number, dz: number) => number,
  x: number,
  y: number,
  grid: Grid
): Array<Cell> {
  return deltaCoords
    .map(([dx, dy]) => {
      const x2 = selectXFn(x, dx);
      const y2 = selectYFn(y, dy);
      return (grid[x2] || [])[y2];
    })
    .filter(x => x);
}

function neighborsSelectFn(wrapAround: boolean, size: number) {
  if (wrapAround) {
    return (z: number, dz: number) => (z + dz + size) % size;
  }
  return (z: number, dz: number) => z + dz;
}

export function step(
  wrapAround: boolean,
  width: number,
  height: number,
  grid: Grid
): Grid {
  const neighborsX = neighborsSelectFn(wrapAround, width);
  const neighborsY = neighborsSelectFn(wrapAround, height);
  return grid.map((row, x) =>
    row.map((cell, y) =>
      stepCell(cell, neighbors(neighborsX, neighborsY, x, y, grid))
    )
  );
}

export function initGrid(
  width: number,
  height: number,
  aliveChance: number = 0.0,
  foodChance: number = 0.1
): Grid {
  const grid: Grid = [];
  for (let x = 0; x < width; x++) {
    grid[x] = [];
    for (let y = 0; y < height; y++) {
      if (Math.random() < 0.1) {
        grid[x][y] = {
          status: Status.Creature,
          energy: 3,
        };
      } else if (Math.random() < foodChance) {
        grid[x][y] = {
          status: Status.Food,
          energy: 10,
        };
      } else {
        grid[x][y] = {
          status: Status.Null,
          energy: 0,
        };
      }
    }
  }

  return grid;
}
