import { step, Grid } from "./automata";

const ctx: Worker = self as any;

let grid: Grid = null;

ctx.onmessage = e => {
  grid = e.data as Grid;
};

const update = () => {
  if (grid) {
    grid = step(grid);
    ctx.postMessage(grid);
  }
  setTimeout(update, 500);
};

setTimeout(update, 250);
