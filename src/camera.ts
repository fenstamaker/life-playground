import { Map } from "./map";

export interface RenderSpace {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  offsetX: number;
  offsetY: number;
}

export class Camera {
  x: number;
  y: number;
  width: number;
  height: number;
  maxX: number;
  maxY: number;
  speed: number;

  constructor(map: Map, width: number, height: number, tileSize: number) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.maxX = map.width * tileSize - width;
    this.maxY = map.width * tileSize - height;
  }

  getRenderSpace(map: Map, tileSize: number): RenderSpace {
    const x1 = Math.floor(this.x / tileSize);
    const y1 = Math.floor(this.y / tileSize);

    return {
      x1,
      x2: x1 + this.width / tileSize,
      y1,
      y2: y1 + this.height / tileSize,
      offsetX: -this.x + x1 * tileSize,
      offsetY: -this.y + y1 * tileSize
    };
  }
}
