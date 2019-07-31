import { Map } from "./map";
import * as React from "react";
import { Renderer } from "./renderer";
import { Camera } from "./camera";
import * as Game from "./game";

export default function Canvas({
  state,
  tileSize
}: {
  state: Game.State;
  tileSize: number;
}) {
  const canvas: React.MutableRefObject<HTMLCanvasElement> = React.useRef(null);

  React.useEffect(() => {
    const ctx = canvas.current.getContext("2d");
    let frameId = window.requestAnimationFrame(renderFrame);

    const camera = new Camera(
      state.map,
      canvas.current.clientWidth,
      canvas.current.clientHeight,
      tileSize
    );
    const renderer = new Renderer(ctx, camera);

    function renderFrame(timestamp: number) {
      frameId = window.requestAnimationFrame(renderFrame);
      // game.tick(frameId, timestamp);
      renderer.render(state, tileSize);
    }

    return () => window.cancelAnimationFrame(frameId);
  });

  return (
    <canvas
      ref={canvas}
      id="canvas"
      width={state.map.width * tileSize}
      height={state.map.height * tileSize}
    />
  );
}
