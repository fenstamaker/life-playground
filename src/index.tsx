import "core-js";
import * as React from "react";
import * as ReactDOM from "react-dom";
require("./css/index.css");

import Canvas from "./canvas";
import { Map } from "./map";
import * as Game from "./game";
import Worker from "worker-loader!./worker.ts";
import { worker } from "cluster";

declare global {
  interface Window {
    Game: any;
  }
}

type State = Readonly<Game.State>;

function useInterval(callback: () => void, delay: number) {
  const savedCallback = React.useRef<() => void>();

  // Remember the latest callback.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  React.useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function App() {
  const [state, setState] = React.useState(Game.initState());
  const [tileSize, setTileSize] = React.useState(8);

  useInterval(() => {
    setState(Game.tick(state));
  }, 100);

  window.Game = {
    setTileSize
  };

  return (
    <div id="container">
      <div id="canvas-container">
        <Canvas state={state} tileSize={tileSize} />
      </div>
      <div id="sidebar">
        {Object.values(state.creatures).map((creature, key) => (
          <div className="cell" key={key}>
            <strong>Ate: </strong> {creature.foodAte} <br />
            <strong>Energy: </strong> {creature.energy}
          </div>
        ))}
      </div>
    </div>
  );
}

const root = document.createElement("div");
root.setAttribute("id", "app");
document.body.appendChild(root);

ReactDOM.render(<App />, document.getElementById("app"));
