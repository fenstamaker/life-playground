import * as React from "react";
import classNames from "classnames";
import styled from "styled-components";

export const Grid = styled.div.attrs({
  className: "flex flex-column flex-auto",
})``;

export const Box = styled.div.attrs({
  className: "outline w-100 mw-100 pa3 mt3",
})``;

export const FlexBox = styled.div.attrs({
  className: "outline w-100 mw-100 overflow-hidden flex-auto",
})``;
