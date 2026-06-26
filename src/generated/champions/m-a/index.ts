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
  starmie: {
    id: speciesSpecsDex.starmie.id,
    dex: speciesSpecsDex.starmie.dex,
    types: speciesSpecsDex.starmie.types,
    baseStats: speciesSpecsDex.starmie.baseStats,
    abilities: speciesSpecsDex.starmie.abilities,
    moves: speciesMoves.starmie,
    items: "any",
  },
  gengar: {
    id: speciesSpecsDex.gengar.id,
    dex: speciesSpecsDex.gengar.dex,
    types: speciesSpecsDex.gengar.types,
    baseStats: speciesSpecsDex.gengar.baseStats,
    abilities: speciesSpecsDex.gengar.abilities,
    moves: speciesMoves.gengar,
    items: "any",
    megaEvolvesTo: mega.gengar,
  },
  garchomp: {
    id: speciesSpecsDex.garchomp.id,
    dex: speciesSpecsDex.garchomp.dex,
    types: speciesSpecsDex.garchomp.types,
    baseStats: speciesSpecsDex.garchomp.baseStats,
    abilities: speciesSpecsDex.garchomp.abilities,
    moves: speciesMoves.garchomp,
    items: "any",
    megaEvolvesTo: mega.garchomp,
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
  dragonite: {
    id: speciesSpecsDex.dragonite.id,
    dex: speciesSpecsDex.dragonite.dex,
    types: speciesSpecsDex.dragonite.types,
    baseStats: speciesSpecsDex.dragonite.baseStats,
    abilities: speciesSpecsDex.dragonite.abilities,
    moves: speciesMoves.dragonite,
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
  tyranitar: {
    id: speciesSpecsDex.tyranitar.id,
    dex: speciesSpecsDex.tyranitar.dex,
    types: speciesSpecsDex.tyranitar.types,
    baseStats: speciesSpecsDex.tyranitar.baseStats,
    abilities: speciesSpecsDex.tyranitar.abilities,
    moves: speciesMoves.tyranitar,
    items: "any",
    megaEvolvesTo: mega.tyranitar,
  },
  lucario: {
    id: speciesSpecsDex.lucario.id,
    dex: speciesSpecsDex.lucario.dex,
    types: speciesSpecsDex.lucario.types,
    baseStats: speciesSpecsDex.lucario.baseStats,
    abilities: speciesSpecsDex.lucario.abilities,
    moves: speciesMoves.lucario,
    items: "any",
    megaEvolvesTo: mega.lucario,
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
  "charizard-mega-x": {
    id: megaSpecsDex["charizard-mega-x"].id,
    dex: megaSpecsDex["charizard-mega-x"].dex,
    types: megaSpecsDex["charizard-mega-x"].types,
    baseStats: megaSpecsDex["charizard-mega-x"].baseStats,
    abilities: [megaSpecsDex["charizard-mega-x"].ability],
    moves: speciesMoves.charizard,
    items: ["charizardite-x"],
  },
  "charizard-mega-y": {
    id: megaSpecsDex["charizard-mega-y"].id,
    dex: megaSpecsDex["charizard-mega-y"].dex,
    types: megaSpecsDex["charizard-mega-y"].types,
    baseStats: megaSpecsDex["charizard-mega-y"].baseStats,
    abilities: [megaSpecsDex["charizard-mega-y"].ability],
    moves: speciesMoves.charizard,
    items: ["charizardite-y"],
  },
  "gengar-mega": {
    id: megaSpecsDex["gengar-mega"].id,
    dex: megaSpecsDex["gengar-mega"].dex,
    types: megaSpecsDex["gengar-mega"].types,
    baseStats: megaSpecsDex["gengar-mega"].baseStats,
    abilities: [megaSpecsDex["gengar-mega"].ability],
    moves: speciesMoves.gengar,
    items: ["gengarite"],
  },
  "garchomp-mega": {
    id: megaSpecsDex["garchomp-mega"].id,
    dex: megaSpecsDex["garchomp-mega"].dex,
    types: megaSpecsDex["garchomp-mega"].types,
    baseStats: megaSpecsDex["garchomp-mega"].baseStats,
    abilities: [megaSpecsDex["garchomp-mega"].ability],
    moves: speciesMoves.garchomp,
    items: ["garchompite"],
  },
  "tyranitar-mega": {
    id: megaSpecsDex["tyranitar-mega"].id,
    dex: megaSpecsDex["tyranitar-mega"].dex,
    types: megaSpecsDex["tyranitar-mega"].types,
    baseStats: megaSpecsDex["tyranitar-mega"].baseStats,
    abilities: [megaSpecsDex["tyranitar-mega"].ability],
    moves: speciesMoves.tyranitar,
    items: ["tyranitarite"],
  },
  "lucario-mega": {
    id: megaSpecsDex["lucario-mega"].id,
    dex: megaSpecsDex["lucario-mega"].dex,
    types: megaSpecsDex["lucario-mega"].types,
    baseStats: megaSpecsDex["lucario-mega"].baseStats,
    abilities: [megaSpecsDex["lucario-mega"].ability],
    moves: speciesMoves.lucario,
    items: ["lucarionite"],
  },
} as const satisfies Record<string, PerRegSpecies>;

export type SpeciesDex = typeof speciesDex;
export type SpeciesId = keyof SpeciesDex;

export const championsMA = {
  id: "champions-m-a",
  name: regulationNames["champions-m-a"].name,
  period: {
    start: "2026-04-08",
    end: "2026-06-17",
  },
  species,
  items,
  mega: Object.values(mega).flat(),
  speciesDex,
} as const satisfies RegulationBase;
