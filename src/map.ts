export interface Tile {
  type: string;
  x: number;
  y: number;
}
export type Layer = Array<Tile>;

export class Map implements Map {
  readonly width: number;
  readonly height: number;
  readonly layers: Array<Layer> = [];

  constructor(width: number, height: number, tileSize: number) {
    this.width = width;
    this.height = height;

    this.generateBaseLayer();
  }

  generateBaseLayer() {
    const layer: Layer = [];
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (Map.isEdge(this, x, y)) {
          layer[y * this.width + x] = {
            type: "boundary",
            x,
            y
          };
        }
      }
    }

    this.layers.push(layer);
  }

  static isEdge(map: Map, x: number, y: number) {
    return x === 0 || y === 0 || x === map.width - 1 || y === map.height - 1;
  }
}
