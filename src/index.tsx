import "core-js";
import * as React from "react";
import * as ReactDOM from "react-dom";
require("./css/index.css");

import Renderer from "./Renderer";

class App extends React.Component {
  render() {
    return (
      <div>
        <Renderer />
      </div>
    );
  }
}

const root = document.createElement("div");
root.setAttribute("id", "app");
document.body.appendChild(root);

ReactDOM.render(<App />, document.getElementById("app"));