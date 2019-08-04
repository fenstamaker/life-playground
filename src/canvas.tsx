import { Map } from "./map";
import * as React from "react";
import getRenderSpace, { RenderSpace } from "./camera";
import * as Game from "./game";
import { Grid } from "./automata/index";
import { render } from "./renderer";

export interface GridProps {
  width: number;
  height: number;
  cellSize: number;
}

export interface CanvasProps extends GridProps {
  canvasRef: React.MutableRefObject<HTMLCanvasElement>;
}

export interface CanvasRendererProps extends GridProps {
  grid: Grid;
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

function Grid(props: GridProps) {
  const { cellSize, width, height } = props;

  return (
    <svg
      style={{ position: "absolute", zIndex: 1 }}
      width={width * cellSize}
      height={height * cellSize}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="smallGrid"
          width={cellSize}
          height={cellSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`}
            fill="none"
            stroke="white"
            strokeWidth="1"
          />
          <path
            d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`}
            fill="none"
            stroke="lightgrey"
            strokeWidth="0.5"
          />
        </pattern>
        <pattern
          id="grid"
          width={cellSize * 10}
          height={cellSize * 10}
          patternUnits="userSpaceOnUse"
        >
          <rect
            width={cellSize * 10}
            height={cellSize * 10}
            fill="url(#smallGrid)"
          />
          <path
            d={`M ${cellSize * 10} 0 L 0 0 0 ${cellSize * 10}`}
            fill="none"
            stroke="gray"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

class Canvas extends React.Component<CanvasProps> {
  shouldComponentUpdate(nextProps: CanvasProps) {
    return (
      this.props.width !== nextProps.width ||
      this.props.height !== nextProps.height ||
      this.props.cellSize !== nextProps.cellSize
    );
  }

  render() {
    return (
      <div
        style={{
          position: "relative",
          width: this.props.width * this.props.cellSize,
          height: this.props.height * this.props.cellSize
        }}
      >
        <canvas
          ref={this.props.canvasRef}
          id="canvas"
          width={this.props.width * this.props.cellSize}
          height={this.props.height * this.props.cellSize}
          style={{
            backgroundSize: `${this.props.cellSize}px ${this.props.cellSize}px`,
            position: "absolute"
          }}
        />
        <Grid
          width={this.props.width}
          height={this.props.height}
          cellSize={this.props.cellSize}
        />
      </div>
    );
  }
}
