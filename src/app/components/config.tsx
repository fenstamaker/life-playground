import * as React from "react";
import { Formik } from "formik";
import styled from "styled-components";

import { Option, Options } from "../../automata/simulator";

type values = { [propName: string]: any };

const InputContainer = styled.section.attrs({
  className: "tc",
})``;

const Label = styled.label.attrs({
  className: "db fw6 lh-copy",
})``;

const Input = styled.input.attrs({
  className: "input-reset w-100 ba bg-transparent pa2",
})``;

const Checkbox = styled.input.attrs({
  className: "w2",
  type: "checkbox",
})``;

export function Config(props: {
  options: Options;
  values: values;
  onSubmit: (newOptions: any) => void;
}) {
  const { options, values, onSubmit } = props;
  const initialValues: values = {};

  for (let [key, option] of Object.entries(options)) {
    initialValues[key] = values[key] || option.default;
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={props => (
        <form
          onSubmit={props.handleSubmit}
          className="center w-100 flex flex-row justify-around">
          {Object.entries(options).map(([key, option]) => (
            <InputContainer key={key}>
              <Label>{key}</Label>
              {option.type === "number" && (
                <Input
                  type="number"
                  name={key}
                  value={props.values[key]}
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  step={option.step || 1}
                />
              )}
              {option.type === "boolean" && (
                <Checkbox
                  name={key}
                  checked={props.values[key]}
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                />
              )}
            </InputContainer>
          ))}
          <input
            className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
            type="submit"
            value="Reload"
          />
        </form>
      )}
    />
  );
}
