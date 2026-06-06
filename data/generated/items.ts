// 生成物（scripts/generate.ts 出力）。手書き編集しない。raw/champions を直し再生成する。
import type { Assignable } from "../../src/types/assert.ts";
import type { ItemBase } from "../../src/types/item.ts";

export const itemDex = {
  "charizardite-x": {
    id: "charizardite-x",
    name: {
      en: "Charizardite X",
      ja: "リザードナイトＸ",
    },
    category: "mega-stones",
    megaStoneFor: "charizard",
  },
  "rocky-helmet": {
    id: "rocky-helmet",
    name: {
      en: "Rocky Helmet",
      ja: "ゴツゴツメット",
    },
    category: "held-items",
  },
  "life-orb": {
    id: "life-orb",
    name: {
      en: "Life Orb",
      ja: "いのちのたま",
    },
    category: "held-items",
  },
  leftovers: {
    id: "leftovers",
    name: {
      en: "Leftovers",
      ja: "たべのこし",
    },
    category: "held-items",
  },
  "assault-vest": {
    id: "assault-vest",
    name: {
      en: "Assault Vest",
      ja: "とつげきチョッキ",
    },
    category: "held-items",
  },
  "choice-scarf": {
    id: "choice-scarf",
    name: {
      en: "Choice Scarf",
      ja: "こだわりスカーフ",
    },
    category: "choice",
  },
} as const;

export type ItemDex = typeof itemDex;
export type ItemId = keyof ItemDex;

// 適合検証（megaStoneFor が派生 SpeciesId を指すため inline satisfies を避け分離する）。
export type _ItemConforms = Assignable<Record<string, ItemBase>, ItemDex>;
