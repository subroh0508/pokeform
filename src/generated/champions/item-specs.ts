// 生成物（scripts/generate.ts 出力）。手書き編集しない。data/champions・data/languages を直し再生成する。
import type { Assignable } from "../../types/assert.ts";
import type { ItemBase } from "../../types/item.ts";

export const itemSpecsDex = {
  "charizardite-x": {
    id: "charizardite-x",
    category: "mega-stones",
    megaStoneFor: "charizard",
    megaSpecies: "charizard-mega-x",
  },
  "rocky-helmet": {
    id: "rocky-helmet",
    category: "held-items",
  },
  "life-orb": {
    id: "life-orb",
    category: "held-items",
  },
  leftovers: {
    id: "leftovers",
    category: "held-items",
  },
  "assault-vest": {
    id: "assault-vest",
    category: "held-items",
  },
  "choice-scarf": {
    id: "choice-scarf",
    category: "choice",
  },
  "black-belt": {
    id: "black-belt",
    category: "type-enhancement",
  },
  "black-glasses": {
    id: "black-glasses",
    category: "type-enhancement",
  },
  "bright-powder": {
    id: "bright-powder",
    category: "held-items",
  },
  charcoal: {
    id: "charcoal",
    category: "type-enhancement",
  },
  "dragon-fang": {
    id: "dragon-fang",
    category: "type-enhancement",
  },
  "fairy-feather": {
    id: "fairy-feather",
    category: "held-items",
  },
  "focus-band": {
    id: "focus-band",
    category: "held-items",
  },
  "focus-sash": {
    id: "focus-sash",
    category: "held-items",
  },
  "hard-stone": {
    id: "hard-stone",
    category: "type-enhancement",
  },
  "kings-rock": {
    id: "kings-rock",
    category: "held-items",
  },
  "light-ball": {
    id: "light-ball",
    category: "species-specific",
  },
  magnet: {
    id: "magnet",
    category: "type-enhancement",
  },
  "mental-herb": {
    id: "mental-herb",
    category: "held-items",
  },
  "metal-coat": {
    id: "metal-coat",
    category: "type-enhancement",
  },
  "miracle-seed": {
    id: "miracle-seed",
    category: "type-enhancement",
  },
  "mystic-water": {
    id: "mystic-water",
    category: "type-enhancement",
  },
  "never-melt-ice": {
    id: "never-melt-ice",
    category: "type-enhancement",
  },
  "poison-barb": {
    id: "poison-barb",
    category: "type-enhancement",
  },
  "quick-claw": {
    id: "quick-claw",
    category: "held-items",
  },
  "scope-lens": {
    id: "scope-lens",
    category: "held-items",
  },
  "sharp-beak": {
    id: "sharp-beak",
    category: "type-enhancement",
  },
  "shell-bell": {
    id: "shell-bell",
    category: "held-items",
  },
  "silk-scarf": {
    id: "silk-scarf",
    category: "type-enhancement",
  },
  "silver-powder": {
    id: "silver-powder",
    category: "type-enhancement",
  },
  "soft-sand": {
    id: "soft-sand",
    category: "type-enhancement",
  },
  "spell-tag": {
    id: "spell-tag",
    category: "type-enhancement",
  },
  "twisted-spoon": {
    id: "twisted-spoon",
    category: "type-enhancement",
  },
  "white-herb": {
    id: "white-herb",
    category: "held-items",
  },
  "aspear-berry": {
    id: "aspear-berry",
    category: "medicine",
  },
  "babiri-berry": {
    id: "babiri-berry",
    category: "type-protection",
  },
  "charti-berry": {
    id: "charti-berry",
    category: "type-protection",
  },
  "cheri-berry": {
    id: "cheri-berry",
    category: "medicine",
  },
  "chesto-berry": {
    id: "chesto-berry",
    category: "medicine",
  },
  "chilan-berry": {
    id: "chilan-berry",
    category: "type-protection",
  },
  "chople-berry": {
    id: "chople-berry",
    category: "type-protection",
  },
  "coba-berry": {
    id: "coba-berry",
    category: "type-protection",
  },
  "colbur-berry": {
    id: "colbur-berry",
    category: "type-protection",
  },
  "haban-berry": {
    id: "haban-berry",
    category: "type-protection",
  },
  "kasib-berry": {
    id: "kasib-berry",
    category: "type-protection",
  },
  "kebia-berry": {
    id: "kebia-berry",
    category: "type-protection",
  },
  "leppa-berry": {
    id: "leppa-berry",
    category: "medicine",
  },
  "lum-berry": {
    id: "lum-berry",
    category: "medicine",
  },
  "occa-berry": {
    id: "occa-berry",
    category: "type-protection",
  },
  "oran-berry": {
    id: "oran-berry",
    category: "medicine",
  },
  "passho-berry": {
    id: "passho-berry",
    category: "type-protection",
  },
  "payapa-berry": {
    id: "payapa-berry",
    category: "type-protection",
  },
  "pecha-berry": {
    id: "pecha-berry",
    category: "medicine",
  },
  "persim-berry": {
    id: "persim-berry",
    category: "medicine",
  },
  "rawst-berry": {
    id: "rawst-berry",
    category: "medicine",
  },
  "rindo-berry": {
    id: "rindo-berry",
    category: "type-protection",
  },
  "roseli-berry": {
    id: "roseli-berry",
    category: "type-protection",
  },
  "shuca-berry": {
    id: "shuca-berry",
    category: "type-protection",
  },
  "sitrus-berry": {
    id: "sitrus-berry",
    category: "medicine",
  },
  "tanga-berry": {
    id: "tanga-berry",
    category: "type-protection",
  },
  "wacan-berry": {
    id: "wacan-berry",
    category: "type-protection",
  },
  "yache-berry": {
    id: "yache-berry",
    category: "type-protection",
  },
  "charizardite-y": {
    id: "charizardite-y",
    category: "mega-stones",
    megaStoneFor: "charizard",
    megaSpecies: "charizard-mega-y",
  },
  garchompite: {
    id: "garchompite",
    category: "mega-stones",
    megaStoneFor: "garchomp",
    megaSpecies: "garchomp-mega",
  },
  gengarite: {
    id: "gengarite",
    category: "mega-stones",
    megaStoneFor: "gengar",
    megaSpecies: "gengar-mega",
  },
} as const;

export type ItemSpecsDex = typeof itemSpecsDex;
export type ItemId = keyof ItemSpecsDex;

// 適合検証（megaSpecies が派生 SpeciesId を指すため inline satisfies を避け分離する）。
export type _ItemConforms = Assignable<Record<string, ItemBase>, ItemSpecsDex>;
