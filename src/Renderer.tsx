import { useState, useRef, useEffect } from "react";
import * as React from "react";
import * as hotkeys from "hotkeys";

const map = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 0, 1, 0, 1, 1, 1, 1, 0, 1,
  1, 1, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
  1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
];

const mapSize: number = 100;
const tileSize: number = 16;

for (let x: number = 0; x < mapSize; x++) {
  for (let y: number = 0; y < mapSize; y++) {
    if (x === 0 || y === 0 || x === mapSize - 1 || y === mapSize - 1) {
      map[y * mapSize + x] = 1;
    } else {
      map[y * mapSize + x] = Math.round(Math.random());
    }
  }
}

function getTile(x: number, y: number) {
  return map[y * mapSize + x];
}

class Camera {
  speed: number;
  x: number;
  y: number;
  width: number;
  height: number;
  maxX: number;
  maxY: number;

  constructor(mapSize: number, tileSize: number, width: number, height: number) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.maxX = mapSize * tileSize - width;
    this.maxY = mapSize * tileSize - height;
    this.speed = 256;
  }

  changeSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.maxX = mapSize * tileSize - width;
    this.maxY = mapSize * tileSize - height;
  }

  move(delta: number, dirx: number, diry: number) {
    this.x += dirx * this.speed * delta;
    this.y += diry * this.speed * delta;

    this.x = Math.max(0, Math.min(this.x, this.maxX));
    this.y = Math.max(0, Math.min(this.y, this.maxY));
  }

}

export default function Renderer() {
  const [frameCount, setFrameCount] = useState(0);
  const [timestamp, setTimestamp] = useState(0.0);
  const camera = new Camera(mapSize, tileSize, 100, 100);

  const [container, canvas] = useCanvas((ctx, ts, frame, canvas) => {
    var delta = (ts - timestamp) / 1000.0;
    setFrameCount(frame);
    setTimestamp(ts);
    camera.changeSize(canvas.current.width, canvas.current.height);

    let dirx = 0;
    let diry = 0;
    if (Keyboard.isDown(Keyboard.LEFT)) { dirx = -1; }
    if (Keyboard.isDown(Keyboard.RIGHT)) { dirx = 1; }
    if (Keyboard.isDown(Keyboard.UP)) { diry = -1; }
    if (Keyboard.isDown(Keyboard.DOWN)) { diry = 1; }

    this.camera.move(delta, dirx, diry);

    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
    const x1 = Math.floor(camera.x / tileSize);
    const x2 = x1 + (camera.width / tileSize);
    const y1 = Math.floor(camera.y / tileSize);
    const y2 = y1 + (camera.height / tileSize);
    const offsetX = -camera.x + x1 * tileSize;
    const offsetY = -camera.y + y1 * tileSize;
    console.log(x1, x2, y1, y2)

    for (let x = x1; x < x2; x++) {
      for (let y = y1; y < y2; y++) {
        const tile = getTile(x, y);
        switch (tile) {
          case 0: {
            ctx.fillStyle = "white";
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            break;
          }
          case 1: {
            ctx.fillStyle = "black";
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            break;
          }
          default:
            break;
        }

      }
    }
  })

  return (
    <div ref={container} id="canvas-container">
      <canvas ref={canvas} id="canvas" width="1024" height="640" />
    </div>
  );
}

interface StopFunction {
  (): void
}

interface DrawFunction {
  (ctx: CanvasRenderingContext2D, timestamp: number, frameId: number, canvas?: React.MutableRefObject<any>): void;
}

function useCanvas(draw: DrawFunction) {
  const canvas = useRef(null);
  const container = useRef(null);

  useEffect(() => {
    const ctx = canvas.current.getContext("2d");
    let frameId = window.requestAnimationFrame(renderFrame);

    function renderFrame(timestamp: number) {
      frameId = window.requestAnimationFrame(renderFrame);
      resizeCanvas();
      draw(ctx, timestamp, frameId, canvas);
    }

    function resizeCanvas() {
      canvas.current.width = container.current.clientWidth;
      canvas.current.height = container.current.clientHeight;
    }

    resizeCanvas();

    return () => window.cancelAnimationFrame(frameId);
  });

  return [container, canvas];
}
