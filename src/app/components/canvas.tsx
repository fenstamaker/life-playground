import * as React from "react";

export interface GridProps {
  width: number;
  height: number;
  cellSize: number;
}

export interface CanvasProps extends GridProps {
  canvasRef: React.MutableRefObject<HTMLCanvasElement>;
}

function SVGGrid(props: GridProps) {
  const { cellSize, width, height } = props;

  return (
    <svg
      style={{ position: "absolute", zIndex: 1 }}
      width={width * cellSize}
      height={height * cellSize}
      xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          id="smallGrid"
          width={cellSize}
          height={cellSize}
          patternUnits="userSpaceOnUse">
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
          patternUnits="userSpaceOnUse">
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

export class Canvas extends React.Component<CanvasProps> {
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
          height: this.props.height * this.props.cellSize,
        }}>
        <canvas
          ref={this.props.canvasRef}
          id="canvas"
          width={this.props.width * this.props.cellSize}
          height={this.props.height * this.props.cellSize}
          style={{
            backgroundSize: `${this.props.cellSize}px ${this.props.cellSize}px`,
            position: "absolute",
          }}
        />
        <SVGGrid
          width={this.props.width}
          height={this.props.height}
          cellSize={this.props.cellSize}
        />
      </div>
    );
  }
}
