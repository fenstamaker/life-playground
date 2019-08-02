import { Map } from "./map";
import * as React from "react";
import { Renderer } from "./renderer";
import { Camera } from "./camera";
import * as Game from "./game";
import { Grid } from "./automata/index";

export default function Canvas({
  grid,
  width,
  height,
  cellSize
}: {
  grid: Grid;
  width: number;
  height: number;
  cellSize: number;
}) {
  const canvas: React.MutableRefObject<HTMLCanvasElement> = React.useRef(null);

  React.useEffect(() => {
    const ctx = canvas.current.getContext("2d");
    let frameId = window.requestAnimationFrame(renderFrame);

    const camera = new Camera(
      width,
      height,
      canvas.current.clientWidth,
      canvas.current.clientHeight,
      cellSize
    );
    const renderer = new Renderer(ctx, camera);

    function renderFrame(timestamp: number) {
      frameId = window.requestAnimationFrame(renderFrame);
      // game.tick(frameId, timestamp);
      renderer.render(grid, cellSize);
    }

    return () => window.cancelAnimationFrame(frameId);
  });

  return (
    <canvas
      ref={canvas}
      id="canvas"
      width={width * cellSize}
      height={height * cellSize}
    />
  );
}
