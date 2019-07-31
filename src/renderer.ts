import { Layer, Tile, Map } from "./map";
import { Camera, RenderSpace } from "./camera";
import * as Game from "./game";

export interface RenderInstruction {
  color: string;
}

const renderInstructions: { [name: string]: RenderInstruction } = {
  wall: {
    color: "wall"
  },
  food: {
    color: "green"
  },
  boundary: {
    color: "red"
  },
  cell: {
    color: "blue"
  }
};

export class Renderer {
  readonly ctx: CanvasRenderingContext2D;
  readonly camera: Camera;

  constructor(context: CanvasRenderingContext2D, camera: Camera) {
    this.ctx = context;
    this.camera = camera;
  }

  renderObj(
    state: Game.State,
    renderSpace: RenderSpace,
    tileSize: number,
    obj: Tile | Game.Creature | Game.Food
  ) {
    const instructions = renderInstructions[obj.type];
    if (instructions) {
      const tx = (obj.x - renderSpace.x1) * tileSize + renderSpace.offsetX;
      const ty = (obj.y - renderSpace.y1) * tileSize + renderSpace.offsetY;
      this.ctx.fillStyle = instructions.color;
      this.ctx.fillRect(Math.round(tx), Math.round(ty), tileSize, tileSize);
    }
  }

  renderLayer(
    state: Game.State,
    renderSpace: RenderSpace,
    tileSize: number,
    layer: Layer
  ) {
    layer.forEach(this.renderObj.bind(this, state, renderSpace, tileSize));
  }

  render(state: Game.State, tileSize: number) {
    const renderSpace = this.camera.getRenderSpace(state.map, tileSize);
    this.ctx.clearRect(0, 0, this.camera.width, this.camera.height);
    if (state.map.layers) {
      state.map.layers.forEach(
        this.renderLayer.bind(this, state, renderSpace, tileSize)
      );
    }
    if (state.foods) {
      Object.entries(state.foods).forEach(([key, value]) =>
        this.renderObj(state, renderSpace, tileSize, value)
      );
    }
    if (state.creatures) {
      Object.entries(state.creatures).forEach(([key, value]) =>
        this.renderObj(state, renderSpace, tileSize, value)
      );
    }
  }
}
