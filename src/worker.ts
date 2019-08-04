import { step, Grid } from "./automata";

const ctx: Worker = self as any;

let grid: Grid = null;

ctx.onmessage = e => {
  grid = e.data as Grid;
};
