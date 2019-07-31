import * as Game from "./game";
import { Tile } from "./map";

const ctx: Worker = self as any;
let state: Game.State;

interface Message {
  type: "creature.execution";
  vision?: {
    [coords: number]: Game.Food | Game.Creature | Tile;
  };
  creature: Game.Creature;
}

ctx.onmessage = event => {
  const message: Message = event.data;
  console.log(message);
};
