// 生成物（scripts/generate.ts 出力）。手書き編集しない。data/champions・data/languages を直し再生成する。
import type { NameEntry } from "../../../src/types/name.ts";

export const typeNames = {
  normal: {
    id: "normal",
    name: {
      en: "Normal",
      ja: "ノーマル",
    },
  },
  fire: {
    id: "fire",
    name: {
      en: "Fire",
      ja: "ほのお",
    },
  },
  water: {
    id: "water",
    name: {
      en: "Water",
      ja: "みず",
    },
  },
  electric: {
    id: "electric",
    name: {
      en: "Electric",
      ja: "でんき",
    },
  },
  grass: {
    id: "grass",
    name: {
      en: "Grass",
      ja: "くさ",
    },
  },
  ice: {
    id: "ice",
    name: {
      en: "Ice",
      ja: "こおり",
    },
  },
  fighting: {
    id: "fighting",
    name: {
      en: "Fighting",
      ja: "かくとう",
    },
  },
  poison: {
    id: "poison",
    name: {
      en: "Poison",
      ja: "どく",
    },
  },
  ground: {
    id: "ground",
    name: {
      en: "Ground",
      ja: "じめん",
    },
  },
  flying: {
    id: "flying",
    name: {
      en: "Flying",
      ja: "ひこう",
    },
  },
  psychic: {
    id: "psychic",
    name: {
      en: "Psychic",
      ja: "エスパー",
    },
  },
  bug: {
    id: "bug",
    name: {
      en: "Bug",
      ja: "むし",
    },
  },
  rock: {
    id: "rock",
    name: {
      en: "Rock",
      ja: "いわ",
    },
  },
  ghost: {
    id: "ghost",
    name: {
      en: "Ghost",
      ja: "ゴースト",
    },
  },
  dragon: {
    id: "dragon",
    name: {
      en: "Dragon",
      ja: "ドラゴン",
    },
  },
  dark: {
    id: "dark",
    name: {
      en: "Dark",
      ja: "あく",
    },
  },
  steel: {
    id: "steel",
    name: {
      en: "Steel",
      ja: "はがね",
    },
  },
  fairy: {
    id: "fairy",
    name: {
      en: "Fairy",
      ja: "フェアリー",
    },
  },
} as const satisfies Record<string, NameEntry>;

export type TypeNames = typeof typeNames;
