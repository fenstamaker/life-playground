import { useState, useRef, useEffect } from "react";
import * as React from "react";
import * as Mousetrap from "mousetrap";

const map: Array<number> = [];

const mapSize: number = 200;
const mapSizeX: number = 200;
const mapSizeY: number = 100;
const tileSize: number = 8;

function createMap(mapSizeX: number, mapSizeY: number, tileSize: number) {
  for (let x: number = 0; x < mapSizeX; x++) {
    for (let y: number = 0; y < mapSizeY; y++) {
      if (x === 0 || y === 0 || x === mapSizeX - 1 || y === mapSizeY - 1) {
        map[y * mapSizeX + x] = 1;
      } else {
        map[y * mapSizeX + x] = Math.random() > 0.95 ? 2 : 0;
      }
    }
  }
}

function getTile(x: number, y: number) {
  if (x > mapSizeX - 1 || y > mapSizeY - 1) {
    return 0;
  }
  return map[y * mapSizeX + x];
}

interface Camera {
  x: number;
  y: number;
  width: number;
  height: number;
  maxX: number;
  maxY: number;
  speed: number;
}

function createCamera(
  mapSizeX: number,
  mapSizeY: number,
  tileSize: number,
  width: number,
  height: number
): Camera {
  return {
    x: 0,
    y: 0,
    width,
    height,
    maxX: mapSizeX * tileSize - width,
    maxY: mapSizeY * tileSize - height,
    speed: tileSize
  };
}

function changeCameraSize(width: number, height: number, state: Camera) {
  return {
    ...state,
    width,
    height,
    maxX: mapSizeX * tileSize - width,
    maxY: mapSizeY * tileSize - height
  };
}

function moveCamera(dx: number, dy: number, state: Camera) {
  const x = state.x + dx * state.speed;
  const y = state.y + dy * state.speed;

  return {
    ...state,
    x: Math.max(0, Math.min(x, state.maxX)),
    y: Math.max(0, Math.min(y, state.maxY))
  };
}

createMap(mapSizeX, mapSizeY, tileSize);

export default function Renderer() {
  const [frameCount, setFrameCount] = useState(0);
  const [timestamp, setTimestamp] = useState(0.0);
  const [camera, setCamera] = useState(
    createCamera(mapSizeX, mapSizeY, tileSize, 100, 100)
  );

  Mousetrap.bind("left", () => {
    console.log("left");
    setCamera(moveCamera.bind(this, -1, 0));
  });
  Mousetrap.bind("right", () => {
    setCamera(moveCamera.bind(this, 1, 0));
  });
  Mousetrap.bind("up", () => {
    setCamera(moveCamera.bind(this, 0, -1));
  });
  Mousetrap.bind("down", () => {
    setCamera(moveCamera.bind(this, 0, 1));
  });

  const [container, canvas] = useCanvas((ctx, ts, frame) => {
    setFrameCount(frame);
    setTimestamp(ts);
    setCamera(
      changeCameraSize.bind(this, canvas.current.width, canvas.current.height)
    );

    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
    const x1 = Math.floor(camera.x / tileSize);
    const x2 = x1 + camera.width / tileSize;
    const y1 = Math.floor(camera.y / tileSize);
    const y2 = y1 + camera.height / tileSize;
    const offsetX = -camera.x + x1 * tileSize;
    const offsetY = -camera.y + y1 * tileSize;

    for (let x = x1; x < x2; x++) {
      for (let y = y1; y < y2; y++) {
        const tile = getTile(x, y);
        const tx = (x - x1) * tileSize + offsetX;
        const ty = (y - y1) * tileSize + offsetY;
        switch (tile) {
          case 0: {
            ctx.fillStyle = "white";
            ctx.fillRect(Math.round(tx), Math.round(ty), tileSize, tileSize);
            break;
          }
          case 1: {
            ctx.fillStyle = "red";
            ctx.fillRect(Math.round(tx), Math.round(ty), tileSize, tileSize);
            break;
          }
          case 2: {
            ctx.fillStyle = "green";
            ctx.fillRect(Math.round(tx), Math.round(ty), tileSize, tileSize);
            break;
          }
          default:
            break;
        }
      }
    }
  });

  return (
    <div ref={container} id="canvas-container">
      <canvas
        ref={canvas}
        id="canvas"
        width={mapSizeX * tileSize}
        height={mapSizeY * tileSize}
      />
    </div>
  );
}

interface StopFunction {
  (): void;
}

interface DrawFunction {
  (
    ctx: CanvasRenderingContext2D,
    timestamp: number,
    frameId: number,
    canvas?: React.MutableRefObject<any>
  ): void;
}

function useCanvas(draw: DrawFunction) {
  const canvas = useRef(null);
  const container = useRef(null);

  useEffect(() => {
    const ctx = canvas.current.getContext("2d");
    let frameId = window.requestAnimationFrame(renderFrame);

    function renderFrame(timestamp: number) {
      frameId = window.requestAnimationFrame(renderFrame);
      //resizeCanvas();
      draw(ctx, timestamp, frameId, canvas);
    }

    function resizeCanvas() {
      canvas.current.width = container.current.clientWidth;
      canvas.current.height = container.current.clientHeight;
    }

    return () => window.cancelAnimationFrame(frameId);
  });

  return [container, canvas];
}
