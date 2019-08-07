import { getIn } from "immutable";
import produce from "immer";

export interface ProcessCellFunction {
  (neighbors: Array<Cell>): Cell;
}

export interface Cell {
  alive: boolean;
}

export type Grid = Array<Array<Cell>>;

export function isCell(cell: Cell | any): cell is Cell {
  return (cell as Cell).alive !== undefined;
}

export function stepCell(self: Cell, neighbors: Array<Cell>): Cell {
  const alive = neighbors.filter(cell => cell && cell.alive);

  if (self.alive && (alive.length === 2 || alive.length === 3)) {
    return {
      alive: true
    };
  }

  if (!self.alive && alive.length === 3) {
    return {
      alive: true
    };
  }

  return {
    alive: false
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
  [1, 1]
];

function neighbors(
  selectXFn: (z: number, dz: number) => number,
  selectYFn: (z: number, dz: number) => number,
  x: number,
  y: number,
  grid: Grid
): Array<Cell> {
  return deltaCoords.map(([dx, dy]) => {
    const x2 = selectXFn(x, dx);
    const y2 = selectYFn(y, dy);
    return (grid[x2] || [])[y2];
  });
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
  aliveChance: number = 0.1
): Grid {
  const grid: Grid = [];
  for (let x = 0; x < width; x++) {
    grid[x] = [];
    for (let y = 0; y < height; y++) {
      if (Math.random() < aliveChance) {
        grid[x][y] = {
          alive: true
        };
      } else {
        grid[x][y] = {
          alive: false
        };
      }
    }
  }

  return grid;
}
