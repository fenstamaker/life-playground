export enum Algorithm {
  None,
  GameOfLife,
  Creatures,
}

export interface Cell {
  alive: boolean;
}

export type GridCells = Array<Cell>;

export class Grid {
  width: number;
  height: number;
  cells: GridCells;
}

export function XY(width: number, index: number): Array<number> {
  return [index % width | 0, (index / width) | 0];
}

export function I(width: number, x: number, y: number): number {
  return x + y * width;
}

export interface Option {
  type: "string" | "boolean" | "number";
  default: any;
  min?: any;
  max?: any;
}

export interface Options {
  [optionName: string]: Option;
}

export interface Simulator {
  readonly name: Algorithm;
  readonly options: Options;

  initGrid(width: number, height: number, gridOptions: object): Grid;
  stepGrid(grid: Grid, stepOptions: object): Grid;
}

export const globalOptions: Options = {
  cellSize: { type: "number", default: 6, min: 2, max: 12 },
};
