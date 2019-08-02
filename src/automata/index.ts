export interface ProcessCellFunction {
  (neighbors: Array<Cell>): Cell;
}

export interface Cell {
  x: number;
  y: number;
  state: string;
}

export type Grid = Array<Array<Cell>>;

export function stepCell(self: Cell, neighbors: Array<Cell>): Cell {
  const alive = neighbors
    .map(cell => cell.state)
    .filter(state => state === "alive");

  if (self.state === "alive" && (alive.length === 2 || alive.length === 3)) {
    return {
      ...self,
      state: "alive"
    };
  }

  if (self.state === "dead" && alive.length === 3) {
    return {
      ...self,
      state: "alive"
    };
  }

  return {
    ...self,
    state: "dead"
  };
}

function diff(width: number, x: number, dx: number) {
  return (x + dx + width) % width;
  if (x === 0 && dx < 0) {
    return width - 1 + dx;
  }
  if (x === width - 1 && dx > 0) {
    return dx;
  }
  return x + dx;
}

function neighbors(x: number, y: number, grid: Grid): Array<Cell> {
  const width = grid.length;
  const height = grid[0].length;
  const diffX = diff.bind(this, width);
  const diffY = diff.bind(this, height);

  return [
    grid[diffX(x, -1)][diffY(y, -1)],
    grid[diffX(x, -1)][diffY(y, 0)],
    grid[diffX(x, -1)][diffY(y, 1)],
    grid[diffX(x, 0)][diffY(y, -1)],
    grid[diffX(x, 0)][diffY(y, 1)],
    grid[diffX(x, 1)][diffY(y, -1)],
    grid[diffX(x, 1)][diffY(y, 0)],
    grid[diffX(x, 1)][diffY(y, 1)]
  ];
}

export function step(grid: Grid): Grid {
  return grid.map((row, x) =>
    row.map((cell, y) => stepCell(cell, neighbors(x, y, grid)))
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
          x,
          y,
          state: "alive"
        };
      } else {
        grid[x][y] = {
          x,
          y,
          state: "dead"
        };
      }
    }
  }

  return grid;
}
