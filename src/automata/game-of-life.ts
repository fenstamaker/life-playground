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
}

interface StepOptions {
  wrapAround: boolean;
}

export interface GameOfLifeCell extends Cell {
  tag: Algorithm.GameOfLife;
  test: number;
}

export class GameOfLifeSimulator implements Simulator {
  readonly name = Algorithm.GameOfLife;
  readonly options: Options = {
    wrapAround: { type: "boolean", default: true },
    aliveChance: {
      type: "number",
      default: 0.1,
      min: 0.1,
      max: 1.0,
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

  initGrid(width: number, height: number, { aliveChance }: GridOptions): Grid {
    const cells: GridCells = [];
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (Math.random() < aliveChance) {
          cells[I(width, x, y)] = {
            alive: true,
            tag: Algorithm.GameOfLife,
          } as GameOfLifeCell;
        } else {
          cells[I(width, x, y)] = {
            alive: false,
            tag: Algorithm.GameOfLife,
          } as GameOfLifeCell;
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
      cells: grid.cells.map((cell: GameOfLifeCell, i: number) => {
        const [x, y] = XY(grid.width, i);
        return this.stepCell(
          cell,
          this.neighbors(neighborsX, neighborsY, x, y, grid)
        );
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

  stepCell(self: GameOfLifeCell, neighbors: Array<Cell>): GameOfLifeCell {
    const alive = neighbors.filter(cell => cell && cell.alive);

    if (self.alive && (alive.length === 2 || alive.length === 3)) {
      return {
        alive: true,
        tag: Algorithm.GameOfLife,
      } as GameOfLifeCell;
    }

    if (!self.alive && alive.length === 3) {
      return {
        alive: true,
        tag: Algorithm.GameOfLife,
      } as GameOfLifeCell;
    }

    return {
      alive: false,
      tag: Algorithm.GameOfLife,
    } as GameOfLifeCell;
  }
}
