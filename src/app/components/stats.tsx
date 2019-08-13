import * as React from "react";
import styled from "styled-components";

const Stat = styled.span.attrs({
  className: "tc",
})``;

export interface StatProps {
  name: string;
  value: any;
}

export interface StatsProps {
  stats: Array<StatProps>;
}

export function Stats(props: StatsProps) {
  const { stats } = props;

  return (
    <div className="flex flex-row justify-around">
      {stats.map(stat => (
        <Stat key={stat.name}>
          <strong>{stat.name}:</strong> <br /> {stat.value}
        </Stat>
      ))}
    </div>
  );
}
