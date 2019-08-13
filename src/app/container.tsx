import { useRef, useState, MutableRefObject, useEffect } from "react";
import * as React from "react";
import styled from "styled-components";

import { useInterval, usePaintInterval } from "../utils";
import { Simulator, Option, Options } from "../automata/simulator";
import { GameOfLifeSimulator } from "../automata/game-of-life";
import { Grid, Box, FlexBox } from "./components";
import { Config } from "./components/config";
import { Stats } from "./components/stats";
import { Canvas } from "./components/canvas";
import getRenderSpace from "../renderer/camera";
import { render } from "../renderer/render";
import console = require("console");
const GameOfLife = new GameOfLifeSimulator();

function initOptions(options: Options): object {
  const state: { [propName: string]: any } = {};

  for (let [key, option] of Object.entries(options)) {
    state[key] = option.default;
  }
  return state;
}

function getComputedSizes(element: Element, cellSize: number) {
  const computedStyle = window.getComputedStyle(element);
  const computedWidth =
    parseFloat(computedStyle.width) -
    parseFloat(computedStyle.paddingLeft) -
    parseFloat(computedStyle.paddingRight);

  const computedHeight =
    parseFloat(computedStyle.height) -
    parseFloat(computedStyle.paddingTop) -
    parseFloat(computedStyle.paddingBottom);

  const w = Math.ceil(computedWidth / cellSize);
  const h = Math.ceil(computedHeight / cellSize);
  return [w, h];
}

const globalOptions: Options = {
  cellSize: {
    type: "number",
    default: 10,
    min: 2,
    max: 20,
  },
  tickInterval: {
    type: "number",
    default: (1000 / 30) | 0,
  },
};

export function Container() {
  const canvasContainer = useRef(null);
  const canvas = useRef(null);
  const simulator: MutableRefObject<Simulator> = useRef(GameOfLife);
  const [renderSpace, setRenderSpace] = useState(null);

  // Times
  const [tickInterval, setTickInterval] = useState(
    globalOptions.tickInterval.default
  );
  const [previousTickTime, setPreviousTickTime] = useState();

  // Sizing
  const [cellSize, setCellSize] = useState(globalOptions.cellSize.default);
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);

  // Algorithms
  const [options, setOptions] = useState(
    initOptions(simulator.current.options)
  );
  // const [grid, setGrid] = useState(
  //   simulator.current.initGrid(width, height, options)
  // );
  const grid = useRef(simulator.current.initGrid(width, height, options));

  // Fun information
  const [generation, setGeneration] = useState(1);
  const [frameRate, setFrameRate] = React.useState([0]);
  const [tickRate, setTickRate] = React.useState([0]);

  // Game Tick
  usePaintInterval(() => {
    const timestamp = window.performance.now();
    if (previousTickTime) {
      const delta = timestamp - previousTickTime;
      setPreviousTickTime(timestamp);
      if (tickRate.length >= 10) {
        tickRate.shift();
      }
      tickRate.push(1 / (delta / 1000));
      setTickRate(tickRate);
    } else {
      setPreviousTickTime(timestamp);
    }
    const g = simulator.current.stepGrid(grid.current, options);
    grid.current = g;
    setGeneration(generation + 1);
    render(canvas.current.getContext("2d"), renderSpace, g, cellSize);
  }, tickInterval);

  function recalculateDimensions() {
    const [w, h] = getComputedSizes(canvasContainer.current, cellSize);
    const g = simulator.current.initGrid(w, h, options);

    grid.current = g;
    setWidth(w);
    setHeight(h);
    setGeneration(1);
    setRenderSpace(
      getRenderSpace(
        w,
        h,
        canvas.current.clientWidth,
        canvas.current.clientHeight,
        cellSize
      )
    );
  }

  React.useLayoutEffect(recalculateDimensions.bind(this), [
    (canvasContainer.current || {}).clientWidth,
    (canvasContainer.current || {}).clientHeight,
    cellSize,
  ]);

  const stats = [
    { name: "Generation", value: generation },
    { name: "Size", value: `${width} X ${height}` },
    {
      name: "Framerate",
      value: Math.ceil(tickRate.reduce((a, b) => a + b, 0) / tickRate.length),
    },
  ];

  return (
    <div className="w-100 mw9 sans-serif bg-white h-100">
      <div className="cf ph3 ph5-ns pv2 flex flex-column h-100">
        <header className="">
          <h1 className="f2 lh-title fw9 mb3 mt0 pt3">Automata</h1>
        </header>
        <Grid>
          <FlexBox ref={canvasContainer}>
            <Canvas
              canvasRef={canvas}
              width={width}
              height={height}
              cellSize={cellSize}
            />
          </FlexBox>
          <Box>
            Stats
            <Stats stats={stats} />
          </Box>
          <Box>
            Config
            <Config
              options={{
                ...simulator.current.options,
                ...globalOptions,
              }}
              values={{
                ...options,
                cellSize,
                tickInterval,
              }}
              onSubmit={values => {
                const { cellSize, tickInterval, ...rest } = values;
                setCellSize(cellSize);
                setTickInterval(tickInterval);
                setOptions(values);
                recalculateDimensions();
              }}
            />
          </Box>
        </Grid>
      </div>
    </div>
  );
}
