import {
  Simulator,
  Option,
  Grid,
  GridCells,
  Cell,
  XY,
  I,
  Options,
  Algorithm,
} from "./simulator";

interface GridOptions {
  aliveChance: number;
}

interface StepOptions {
  wrapAround: boolean;
}

export enum CreatureStatus {
  Null,
  Food,
  Creature,
}

export interface CreatureCell extends Cell {
  tag: Algorithm.Creatures;
  status: CreatureStatus;
  energy: number;
}
