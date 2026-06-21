// 生成物（scripts/generate.ts 出力）。手書き編集しない。data/champions・data/languages を直し再生成する。
import type { RegulationBase } from "../../../types/regulation.ts";
import type { PerRegSpecies } from "../../../types/species.ts";
import { regulationNames } from "../../languages/regulations.ts";
import { megaSpecsDex } from "../mega-specs.ts";
import { speciesSpecsDex } from "../species-specs.ts";
import { items } from "./items.ts";
import { mega } from "./mega.ts";
import { species } from "./species.ts";
import { speciesMoves } from "./species-moves.ts";

export { items, mega, species, speciesMoves };

export const speciesDex = {
  garchomp: {
    id: speciesSpecsDex.garchomp.id,
    dex: speciesSpecsDex.garchomp.dex,
    types: speciesSpecsDex.garchomp.types,
    baseStats: speciesSpecsDex.garchomp.baseStats,
    abilities: speciesSpecsDex.garchomp.abilities,
    moves: speciesMoves.garchomp,
    items: "any",
  },
  dragonite: {
    id: speciesSpecsDex.dragonite.id,
    dex: speciesSpecsDex.dragonite.dex,
    types: speciesSpecsDex.dragonite.types,
    baseStats: speciesSpecsDex.dragonite.baseStats,
    abilities: speciesSpecsDex.dragonite.abilities,
    moves: speciesMoves.dragonite,
    items: "any",
  },
  "rotom-wash": {
    id: speciesSpecsDex["rotom-wash"].id,
    dex: speciesSpecsDex["rotom-wash"].dex,
    types: speciesSpecsDex["rotom-wash"].types,
    baseStats: speciesSpecsDex["rotom-wash"].baseStats,
    abilities: speciesSpecsDex["rotom-wash"].abilities,
    moves: speciesMoves["rotom-wash"],
    items: "any",
  },
  charizard: {
    id: speciesSpecsDex.charizard.id,
    dex: speciesSpecsDex.charizard.dex,
    types: speciesSpecsDex.charizard.types,
    baseStats: speciesSpecsDex.charizard.baseStats,
    abilities: speciesSpecsDex.charizard.abilities,
    moves: speciesMoves.charizard,
    items: "any",
    megaEvolvesTo: mega.charizard,
  },
  dragapult: {
    id: speciesSpecsDex.dragapult.id,
    dex: speciesSpecsDex.dragapult.dex,
    types: speciesSpecsDex.dragapult.types,
    baseStats: speciesSpecsDex.dragapult.baseStats,
    abilities: speciesSpecsDex.dragapult.abilities,
    moves: speciesMoves.dragapult,
    items: "any",
  },
  hydreigon: {
    id: speciesSpecsDex.hydreigon.id,
    dex: speciesSpecsDex.hydreigon.dex,
    types: speciesSpecsDex.hydreigon.types,
    baseStats: speciesSpecsDex.hydreigon.baseStats,
    abilities: speciesSpecsDex.hydreigon.abilities,
    moves: speciesMoves.hydreigon,
    items: "any",
  },
  "charizard-mega-x": {
    id: megaSpecsDex["charizard-mega-x"].id,
    dex: megaSpecsDex["charizard-mega-x"].dex,
    types: megaSpecsDex["charizard-mega-x"].types,
    baseStats: megaSpecsDex["charizard-mega-x"].baseStats,
    abilities: [megaSpecsDex["charizard-mega-x"].ability],
    moves: speciesMoves.charizard,
    items: ["charizardite-x"],
  },
} as const satisfies Record<string, PerRegSpecies>;

export type SpeciesDex = typeof speciesDex;
export type SpeciesId = keyof SpeciesDex;

export const championsMB = {
  id: "champions-m-b",
  name: regulationNames["champions-m-b"].name,
  period: {
    start: "2026-06-17",
    end: null,
  },
  species,
  items,
  mega: Object.values(mega).flat(),
  speciesDex,
} as const satisfies RegulationBase;
