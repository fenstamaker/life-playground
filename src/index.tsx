import "core-js";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Container } from "./app/container";

require("./css/index.css");
require("tachyons");

const root = document.createElement("div");
root.setAttribute("id", "app");
document.body.appendChild(root);

ReactDOM.render(<Container />, document.getElementById("app"));
