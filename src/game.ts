import { Map } from "./map";
import { createUnzip } from "zlib";
import { create } from "domain";

export interface Creature {
  id: string;
  type: string;
  x: number;
  y: number;
  foodAte: number;
  energy: number;
}

export interface Food {
  type: string;
  x: number;
  y: number;
}

export interface Foods {
  [coords: number]: Food;
}

export interface Creatures {
  [id: string]: Creature;
}

export interface State {
  map: Map;
  creatures: Creatures;
  foods: Foods;
}

export function initCreatures(map: Map): Creatures {
  const creatures: Creatures = {};

  const limit = Math.random() * 256;
  for (let i = 0; i < limit; i++) {
    const creature = {
      id: `${i}`,
      type: "cell",
      x: Math.floor(Math.random() * map.width),
      y: Math.floor(Math.random() * map.height),
      foodAte: 0,
      energy: Math.floor(Math.random() * 256)
    };
    creatures[i] = creature;
  }

  return creatures;
}

export function initFood(map: Map): Foods {
  const foods: Foods = {};

  for (let x = 0; x < map.width; x++) {
    for (let y = 0; y < map.height; y++) {
      if (!Map.isEdge(map, x, y)) {
        if (Math.random() > 0.9) {
          foods[y * map.width + x] = {
            type: "food",
            x,
            y
          };
        }
      }
    }
  }

  return foods;
}

export function initState(): State {
  const map = new Map(100, 75, 8);
  return {
    map,
    foods: initFood(map),
    creatures: initCreatures(map)
  };
}

export function tick(state: State): State {
  const creatures: Creatures = {};
  Object.values(state.creatures).forEach(c => {
    const creature = Object.assign({}, c);
    if (creature.energy <= 0 || Map.isEdge(state.map, creature.x, creature.y))
      return;
    const dx = Math.random() > 0.5 ? 1 : -1;
    const dy = Math.random() > 0.5 ? 1 : -1;
    if (
      Math.random() > 0.5 &&
      !Map.isEdge(state.map, creature.x + dx, creature.y)
    ) {
      creature.x += dx;
    } else if (!Map.isEdge(state.map, creature.x + dx, creature.y)) {
      creature.y += dy;
    }

    creature.x = Math.floor(creature.x);
    creature.y = Math.floor(creature.y);

    const index = creature.y * state.map.width + creature.x;
    if (state.foods[index]) {
      delete state.foods[index];
      creature.foodAte++;
      creature.energy += 10;
    } else {
      creature.energy--;
    }
    creatures[creature.id] = creature;
  });

  return { ...state, creatures };
}
