import "core-js";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Formik, FormikErrors, Field, FormikProps } from "formik";
import * as NumericInput from "react-numeric-input";

import { initGrid, step } from "./automata/index";
import { CanvasRenderer } from "./canvas";

require("./css/index.css");
require("tachyons");

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
    <div className="cf ph3 ph5-ns pv2">
      <header className="">
        <h1 className="f2 lh-title fw9 mb3 mt0 pt3">Automata</h1>
      </header>
      <div {...props} />
    </div>
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
  const [frameRate, setFrameRate] = React.useState([0]);
  const [tickRate, setTickRate] = React.useState([0]);
  const [width, setWidth] = React.useState(125);
  const [height, setHeight] = React.useState(125);
  const [generation, setGeneration] = React.useState(1);
  const [wrapAround, setWrapAround] = React.useState(true);

  const [grid, setGrid] = React.useState(null);
  const [previousTickTime, setPreviousTickTime] = React.useState();

  const cellInput = React.useRef(cellSize);

  useInterval(() => {
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
    setGrid(step(wrapAround, grid));
    setGeneration(generation + 1);
  }, interval);

  function recalulateDimensions(cellSize: number) {
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
    const g = initGrid(w, h, aliveChance);
    setGrid(g);
    setGeneration(1);
  }

  React.useEffect(recalulateDimensions.bind(this, cellSize), [
    (canvasContainer.current || {}).clientWidth,
    (canvasContainer.current || {}).clientHeight,
    cellSize
  ]);

  return (
    <div className="w-100 mw9 sans-serif bg-white h-100">
      <div className="cf ph3 ph5-ns pv2 flex flex-column h-100">
        <header className="">
          <h1 className="f2 lh-title fw9 mb3 mt0 pt3">Automata</h1>
        </header>
        <div className="flex flex-column flex-auto">
          <div className="outline w-100 flex-auto" ref={canvasContainer}>
            <CanvasRenderer
              grid={grid}
              cellSize={cellSize}
              width={width}
              height={height}
              onFrameRate={fr => {
                if (frameRate.length >= 10) {
                  frameRate.shift();
                }
                frameRate.push(fr);
                setFrameRate(frameRate);
              }}
            />
          </div>
          <div className="outline pa3 w-100 mt3">
            <h2 className="f4 lh-title mt0 mb3">Stats</h2>
            <div className="flex flex-row justify-around">
              <span className="w-25 tc">
                <strong>Generation:</strong> <br /> {generation}
              </span>
              <span className="w-25 tc">
                <strong>Tick Framerate:</strong> <br />{" "}
                {Math.ceil(tickRate.reduce((a, b) => a + b, 0)) /
                  tickRate.length}{" "}
                fps
              </span>
              <span className="w-25 tc">
                <strong>Render Framerate:</strong> <br />{" "}
                {Math.ceil(frameRate.reduce((a, b) => a + b, 0)) /
                  frameRate.length}{" "}
                fps
              </span>
              <span className="w-25 tc">
                <strong>Wrap Around?:</strong> <br />{" "}
                {wrapAround ? "true" : "false"}
              </span>
            </div>
          </div>
          <div className="outline pa3 w-100 mt3">
            <h2 className="f4 lh-title mt0 mb3">Settings</h2>
            <Formik
              initialValues={{ cellSize, aliveChance, interval, wrapAround }}
              onSubmit={(values, actions) => {
                console.log(values);
                setCellSize(values.cellSize);
                setAliveChance(values.aliveChance);
                setInterval(values.interval);
                setWrapAround(values.wrapAround);
                recalulateDimensions(values.cellSize);
              }}
              validate={values => {
                let errors: FormikErrors<{
                  cellSize: string;
                  aliveChance: string;
                }> = {};
                if (!values.cellSize) {
                  errors.cellSize = "Cell Size Required";
                }
                if (values.cellSize < 2) {
                  errors.cellSize = "Cell Size must be 2 or greater";
                }
                if (values.cellSize > 20) {
                  errors.cellSize = "Cell Size must be under 20";
                }
                if (values.aliveChance <= 0.0) {
                  errors.aliveChance = "Must be above 0";
                }
                if (values.aliveChance >= 1) {
                  errors.aliveChance = "Must be below 1";
                }
                return errors;
              }}
              render={props => (
                <form className="center w-100" onSubmit={props.handleSubmit}>
                  <div className="mv3">
                    <label className="db fw6 lh-copy f6" htmlFor="cellSize">
                      Cell Size
                    </label>
                    <input
                      className="pa2 input-reset ba bg-transparent w-100"
                      type="number"
                      name="cellSize"
                      value={props.values.cellSize}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                    />
                    {props.errors.cellSize && (
                      <div className="red f6 mb2">{props.errors.cellSize}</div>
                    )}
                  </div>
                  <div className="mv3">
                    <label className="db fw6 lh-copy f6" htmlFor="aliveChance">
                      Chance for Cell to be Alive
                    </label>
                    <input
                      className="pa2 input-reset ba bg-transparent w-100"
                      type="number"
                      name="aliveChance"
                      value={props.values.aliveChance}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      step={0.01}
                    />
                    {props.errors.aliveChance && (
                      <div className="red f6 mb2">
                        {props.errors.aliveChance}
                      </div>
                    )}
                  </div>
                  <div className="mv3">
                    <label
                      className="db fw6 lh-copy f6"
                      htmlFor="updateInterval"
                    >
                      Update Interval (milliseconds)
                    </label>{" "}
                    <input
                      className="pa2 input-reset ba bg-transparent w-100"
                      type="number"
                      name="interval"
                      value={props.values.interval}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                    />
                    {props.errors.interval && (
                      <div className="red f6 mb2">{props.errors.interval}</div>
                    )}
                  </div>
                  <div className="mv3">
                    <label className="mr2 fw6 lh-copy f6" htmlFor="wrapAround">
                      Wrap Around?
                    </label>
                    <input
                      className="lh-copy f6"
                      type="checkbox"
                      name="wrapAround"
                      checked={props.values.wrapAround}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                    />
                    {props.errors.interval && (
                      <div className="red f6 mb2">{props.errors.interval}</div>
                    )}
                  </div>
                  <input
                    className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                    type="submit"
                    value="Reload"
                  />
                </form>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const root = document.createElement("div");
root.setAttribute("id", "app");
document.body.appendChild(root);

ReactDOM.render(<App />, document.getElementById("app"));
