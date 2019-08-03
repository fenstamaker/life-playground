import { Map } from "./map";

export interface RenderSpace {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export default function getRenderSpace(
  mapWidth: number,
  mapHeight: number,
  width: number,
  height: number,
  tileSize: number
): RenderSpace {
  const x = 0;
  const y = 0;
  const maxX = mapWidth * tileSize - width;
  const maxY = mapHeight * tileSize - height;

  const x1 = Math.floor(x / tileSize);
  const y1 = Math.floor(y / tileSize);

  return {
    x1,
    x2: x1 + width / tileSize,
    y1,
    y2: y1 + height / tileSize,
    offsetX: -x + x1 * tileSize,
    offsetY: -y + y1 * tileSize,
    width,
    height
  };
}
