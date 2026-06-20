// 生成物（scripts/generate.ts 出力）。手書き編集しない。data/champions・data/languages を直し再生成する。
import type { MegaSpec } from "../../types/species.ts";

export const megaSpecsDex = {
  "charizard-mega-x": {
    dex: 6,
    id: "charizard-mega-x",
    types: ["fire", "dragon"],
    baseStats: {
      hp: 78,
      attack: 130,
      defense: 111,
      spAttack: 130,
      spDefense: 85,
      speed: 100,
    },
    ability: "tough-claws",
    baseSpecies: "charizard",
  },
  "charizard-mega-y": {
    dex: 6,
    id: "charizard-mega-y",
    types: ["fire", "flying"],
    baseStats: {
      hp: 78,
      attack: 104,
      defense: 78,
      spAttack: 159,
      spDefense: 115,
      speed: 100,
    },
    ability: "drought",
    baseSpecies: "charizard",
  },
  "garchomp-mega": {
    dex: 445,
    id: "garchomp-mega",
    types: ["dragon", "ground"],
    baseStats: {
      hp: 108,
      attack: 170,
      defense: 115,
      spAttack: 120,
      spDefense: 95,
      speed: 92,
    },
    ability: "sand-force",
    baseSpecies: "garchomp",
  },
  "gengar-mega": {
    dex: 94,
    id: "gengar-mega",
    types: ["ghost", "poison"],
    baseStats: {
      hp: 60,
      attack: 65,
      defense: 80,
      spAttack: 170,
      spDefense: 95,
      speed: 130,
    },
    ability: "shadow-tag",
    baseSpecies: "gengar",
  },
} as const satisfies Record<string, MegaSpec>;

export type MegaSpecsDex = typeof megaSpecsDex;
export type MegaSpecId = keyof MegaSpecsDex;
