import { Grid, XY, Algorithm } from "../automata/simulator";
import { RenderSpace } from "./camera";
import { Cell } from "../automata/simulator";
import { GameOfLifeCell } from "../automata/game-of-life";
import { CreatureCell, CreatureStatus } from "../automata/creatures";

export interface RenderInstruction {
  color: string;
}

function isGameOfLifeCell(cell: Cell): cell is GameOfLifeCell {
  return (cell as GameOfLifeCell).tag === Algorithm.GameOfLife;
}

function isCreatureCell(cell: Cell): cell is CreatureCell {
  return (cell as CreatureCell).tag === Algorithm.Creatures;
}

export function render(
  ctx: CanvasRenderingContext2D,
  renderSpace: RenderSpace,
  grid: Grid,
  cellSize: number
) {
  ctx.clearRect(0, 0, renderSpace.width, renderSpace.height);
  grid.cells.forEach((cell, index) => {
    const [x, y] = XY(grid.width, index);
    const tx = (x - renderSpace.x1) * cellSize + renderSpace.offsetX;
    const ty = (y - renderSpace.y1) * cellSize + renderSpace.offsetY;

    if (isGameOfLifeCell(cell)) {
      if (cell.alive) {
        ctx.fillStyle = "black";
        ctx.fillRect(Math.round(tx), Math.round(ty), cellSize, cellSize);
      }
    }

    if (isCreatureCell(cell)) {
      if (cell.status === CreatureStatus.Creature) {
        ctx.fillStyle = "purple";
      }
      if (cell.status === CreatureStatus.Food) {
        ctx.fillStyle = "green";
      }
      if (cell.status !== CreatureStatus.Null) {
        const tx = (x - renderSpace.x1) * cellSize + renderSpace.offsetX;
        const ty = (y - renderSpace.y1) * cellSize + renderSpace.offsetY;
        ctx.fillRect(Math.round(tx), Math.round(ty), cellSize, cellSize);
      }
    }
  });
}
