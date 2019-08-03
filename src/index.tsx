import "core-js";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Grommet, Grid, Box, BoxProps, Chart, Heading } from "grommet";
import { grommet } from "grommet/themes";

import * as Game from "./game";
import { initGrid, step } from "./automata/index";
import { CanvasRenderer } from "./canvas";
const Worker = require("worker-loader!./worker");

require("./css/index.css");

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

function useWorker(callback: (e: MessageEvent) => void, worker: Worker) {
  const savedWorker = React.useRef<Worker>();
  const savedCallback = React.useRef<(e: MessageEvent) => void>();

  React.useEffect(() => {
    savedWorker.current = worker;
  }, [worker]);

  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    function tick(e: MessageEvent) {
      savedCallback.current(e);
    }
    savedWorker.current.onmessage = tick;
    return () => savedWorker.current.terminate();
  }, [false]);

  return (savedWorker.current || { postMessage: (): void => null }).postMessage;
}

function Wrapper(props: any) {
  return (
    <Grid fill={true}>
      <Box align="start" pad={{ horizontal: "large" }}>
        <h1>Automata</h1>
      </Box>
      <Box {...props} />
    </Grid>
  );
}

export interface AutomataProps {
  width: number;
  height: number;
  cellSize: number;
  updateInterval: number;
}

function App() {
  const canvasContainer = React.useRef(null);

  const [aliveChance, setAliveChance] = React.useState(0.1);
  const [cellSize, setCellSize] = React.useState(6);
  const [interval, setInterval] = React.useState(100);
  const [frameRate, setFrameRate] = React.useState(0);
  const [width, setWidth] = React.useState(125);
  const [height, setHeight] = React.useState(125);

  const [grid, setGrid] = React.useState(null);

  useInterval(() => {
    setGrid(step(grid));
  }, interval);

  React.useEffect(() => {
    const computedStyle = window.getComputedStyle(canvasContainer.current);
    const computedWidth =
      parseFloat(computedStyle.width) -
      parseFloat(computedStyle.paddingLeft) -
      parseFloat(computedStyle.paddingRight);

    const computedHeight =
      parseFloat(computedStyle.height) -
      parseFloat(computedStyle.paddingTop) -
      parseFloat(computedStyle.paddingBottom);

    const w = Math.floor(computedWidth / cellSize);
    const h = Math.floor(computedHeight / cellSize);
    setWidth(w);
    setHeight(h);
    const g = initGrid(w, h);
    setGrid(g);
  }, [
    (canvasContainer.current || {}).clientWidth,
    (canvasContainer.current || {}).clientHeight,
    cellSize
  ]);

  return (
    <Grommet theme={grommet} full={true}>
      <Wrapper align="stretch" pad={{ horizontal: "large" }}>
        <Grid
          areas={[
            { name: "information", start: [0, 0], end: [0, 0] },
            { name: "canvas", start: [1, 0], end: [1, 0] },
            { name: "performance", start: [0, 1], end: [1, 1] }
          ]}
          columns={["small", "flex"]}
          rows={["flex", "small"]}
          gap="small"
          fill={true}
        >
          <Box gridArea="information" background="light-5">
            <Heading level="3" margin="none">
              Settings
            </Heading>
          </Box>
          <Box
            gridArea="canvas"
            background="brand"
            pad="medium"
            ref={canvasContainer}
          >
            <CanvasRenderer
              grid={grid}
              cellSize={cellSize}
              width={width}
              height={height}
              onFrameRate={setFrameRate.bind(this)}
            />
          </Box>
          <Box gridArea="performance" background="light-3">
            <Heading level="3" margin="none">
              Performance
            </Heading>
            {Math.floor(frameRate)} fps
          </Box>
        </Grid>
      </Wrapper>
    </Grommet>
  );
}

const root = document.createElement("div");
root.setAttribute("id", "app");
document.body.appendChild(root);

ReactDOM.render(<App />, document.getElementById("app"));
