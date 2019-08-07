import { Layer, Tile, Map } from "./map";
import { RenderSpace } from "./camera";
import * as Game from "./automata/index";
import * as Life from "./automata/life";

export interface RenderInstruction {
  color: string;
}

export function render(
  grid: Game.Grid | Life.Grid,
  renderSpace: RenderSpace,
  cellSize: number,
  ctx: CanvasRenderingContext2D
) {
  ctx.clearRect(0, 0, renderSpace.width, renderSpace.height);
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      const cell: Game.Cell | Life.Cell = grid[x][y];
      if (Life.isCell(cell)) {
        if (cell.status === Life.Status.Creature) {
          ctx.fillStyle = "blue";
        }
        if (cell.status === Life.Status.Food) {
          ctx.fillStyle = "green";
        }
        if (cell.status !== Life.Status.Null) {
          const tx = (x - renderSpace.x1) * cellSize + renderSpace.offsetX;
          const ty = (y - renderSpace.y1) * cellSize + renderSpace.offsetY;
          ctx.fillRect(Math.round(tx), Math.round(ty), cellSize, cellSize);
        }
      } else {
        if (cell.alive) {
          const tx = (x - renderSpace.x1) * cellSize + renderSpace.offsetX;
          const ty = (y - renderSpace.y1) * cellSize + renderSpace.offsetY;
          ctx.fillStyle = "black";
          ctx.fillRect(Math.round(tx), Math.round(ty), cellSize, cellSize);
        }
      }
    }
  }
}
