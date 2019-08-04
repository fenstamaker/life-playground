import { Map } from "./map";
import * as React from "react";
import getRenderSpace, { RenderSpace } from "./camera";
import * as Game from "./game";
import { Grid } from "./automata/index";
import { render } from "./renderer";

export interface CanvasProps {
  canvasRef: React.MutableRefObject<HTMLCanvasElement>;
  width: number;
  height: number;
  cellSize: number;
}

export interface CanvasRendererProps {
  grid: Grid;
  width: number;
  height: number;
  cellSize: number;
  onFrameRate: (frameRate: number) => void;
}
export class CanvasRenderer extends React.Component<CanvasRendererProps> {
  canvas: React.MutableRefObject<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D;
  frameRate: number;
  frameId: number;
  previousDrawTime: number;
  renderSpace: RenderSpace;

  constructor(props: CanvasRendererProps) {
    super(props);
    this.canvas = React.createRef();
    this.ctx = this.canvas.current
      ? this.canvas.current.getContext("2d")
      : null;
    this.frameRate = 0;
    this.frameId = window.requestAnimationFrame(this.renderFrame.bind(this));
  }

  componentDidUpdate(previousProps: CanvasRendererProps) {
    if (!this.ctx || !this.renderSpace) {
      this.ctx = this.canvas.current.getContext("2d");
    }

    this.renderSpace = getRenderSpace(
      this.props.width,
      this.props.height,
      this.canvas.current.clientWidth,
      this.canvas.current.clientHeight,
      this.props.cellSize
    );
  }

  renderFrame(timestamp: number) {
    this.frameId = window.requestAnimationFrame(this.renderFrame.bind(this));
    if (this.ctx && this.renderSpace) {
      if (this.previousDrawTime) {
        const delta = timestamp - this.previousDrawTime;
        this.previousDrawTime = timestamp;
        this.frameRate = 1 / (delta / 1000);
      } else {
        this.previousDrawTime = timestamp;
      }
      this.props.onFrameRate(this.frameRate);

      render(this.props.grid, this.renderSpace, this.props.cellSize, this.ctx);
    }
  }

  render() {
    return (
      <Canvas
        width={this.props.width}
        height={this.props.height}
        cellSize={this.props.cellSize}
        canvasRef={this.canvas}
      />
    );
  }
}

class Canvas extends React.Component<CanvasProps> {
  shouldComponentUpdate(nextProps: CanvasProps) {
    return (
      this.props.width !== nextProps.width ||
      this.props.height !== nextProps.height
    );
  }

  render() {
    return (
      <canvas
        ref={this.props.canvasRef}
        id="canvas"
        width={this.props.width * this.props.cellSize}
        height={this.props.height * this.props.cellSize}
        style={{
          backgroundSize: `${this.props.cellSize}px ${this.props.cellSize}px`
        }}
      />
    );
  }
}
