import { Layer, Tile, Map } from "./map";
import { RenderSpace } from "./camera";
import * as Game from "./game";
import { Grid } from "./automata/index";

export interface RenderInstruction {
  color: string;
}

export function render(
  grid: Grid,
  renderSpace: RenderSpace,
  cellSize: number,
  ctx: CanvasRenderingContext2D
) {
  ctx.clearRect(0, 0, renderSpace.width, renderSpace.height);
  grid.forEach((column, x) =>
    column.forEach((cell, y) => {
      if (cell.state === "alive") {
        const tx = (x - renderSpace.x1) * cellSize + renderSpace.offsetX;
        const ty = (y - renderSpace.y1) * cellSize + renderSpace.offsetY;
        ctx.fillStyle = "black";
        ctx.fillRect(Math.round(tx), Math.round(ty), cellSize, cellSize);
      }
    })
  );
}
