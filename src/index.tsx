import "core-js";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as NumericInput from "react-numeric-input";
require("./css/index.css");

import Canvas from "./canvas";
import { Map } from "./map";
import * as Game from "./game";
import Worker from "worker-loader!./worker.ts";
import { worker } from "cluster";
import { initGrid, step } from "./automata/index";

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

// function App() {
//   const [state, setState] = React.useState(Game.initState());
//   const [tileSize, setTileSize] = React.useState(8);

//   useInterval(() => {
//     setState(Game.tick(state));
//   }, 100);

//   window.Game = {
//     setTileSize
//   };

//   return (
//     <div id="container">
//       <div id="canvas-container">
//         <Canvas state={state} tileSize={tileSize} />
//       </div>
//       <div id="sidebar">
//         {Object.values(state.creatures).map((creature, key) => (
//           <div className="cell" key={key}>
//             <strong>Ate: </strong> {creature.foodAte} <br />
//             <strong>Energy: </strong> {creature.energy}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

function Automata() {
  const width = 200;
  const height = 140;
  const [aliveChance, setAliveChance] = React.useState(0.1);
  const [grid, setGrid] = React.useState(initGrid(width, height));
  const [cellSize, setCellSize] = React.useState(4);
  const [interval, setInterval] = React.useState(100);

  useInterval(() => {
    setGrid(step(grid));
  }, interval);

  return (
    <div id="container">
      <div id="canvas-container">
        <Canvas grid={grid} cellSize={cellSize} width={width} height={height} />
      </div>
      <div id="sidebar">
        <label>Alive Change Percentage:</label>
        <NumericInput
          step={0.01}
          precision={2}
          value={aliveChance}
          onChange={(v: number) => setAliveChance(v)}
        />
        <button onClick={() => setGrid(initGrid(width, height, aliveChance))}>
          Reload
        </button>
      </div>
    </div>
  );
}

const root = document.createElement("div");
root.setAttribute("id", "app");
document.body.appendChild(root);

ReactDOM.render(<Automata />, document.getElementById("app"));
