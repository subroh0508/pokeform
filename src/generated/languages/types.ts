// 生成物（scripts/generate.ts 出力）。手書き編集しない。data/champions・data/languages を直し再生成する。
import type { NameEntry } from "../../types/name.ts";

export const typeNames = {
  bug: {
    id: "bug",
    name: {
      en: "Bug",
      ja: "むし",
    },
  },
  dark: {
    id: "dark",
    name: {
      en: "Dark",
      ja: "あく",
    },
  },
  dragon: {
    id: "dragon",
    name: {
      en: "Dragon",
      ja: "ドラゴン",
    },
  },
  electric: {
    id: "electric",
    name: {
      en: "Electric",
      ja: "でんき",
    },
  },
  fairy: {
    id: "fairy",
    name: {
      en: "Fairy",
      ja: "フェアリー",
    },
  },
  fighting: {
    id: "fighting",
    name: {
      en: "Fighting",
      ja: "かくとう",
    },
  },
  fire: {
    id: "fire",
    name: {
      en: "Fire",
      ja: "ほのお",
    },
  },
  flying: {
    id: "flying",
    name: {
      en: "Flying",
      ja: "ひこう",
    },
  },
  ghost: {
    id: "ghost",
    name: {
      en: "Ghost",
      ja: "ゴースト",
    },
  },
  grass: {
    id: "grass",
    name: {
      en: "Grass",
      ja: "くさ",
    },
  },
  ground: {
    id: "ground",
    name: {
      en: "Ground",
      ja: "じめん",
    },
  },
  ice: {
    id: "ice",
    name: {
      en: "Ice",
      ja: "こおり",
    },
  },
  normal: {
    id: "normal",
    name: {
      en: "Normal",
      ja: "ノーマル",
    },
  },
  poison: {
    id: "poison",
    name: {
      en: "Poison",
      ja: "どく",
    },
  },
  psychic: {
    id: "psychic",
    name: {
      en: "Psychic",
      ja: "エスパー",
    },
  },
  rock: {
    id: "rock",
    name: {
      en: "Rock",
      ja: "いわ",
    },
  },
  shadow: {
    id: "shadow",
    name: {
      en: "Shadow",
      ja: "ダーク",
    },
  },
  steel: {
    id: "steel",
    name: {
      en: "Steel",
      ja: "はがね",
    },
  },
  stellar: {
    id: "stellar",
    name: {
      en: "Stellar",
      ja: "ステラ",
    },
  },
  unknown: {
    id: "unknown",
    name: {
      en: "???",
      ja: "？？？",
    },
  },
  water: {
    id: "water",
    name: {
      en: "Water",
      ja: "みず",
    },
  },
} as const satisfies Record<string, NameEntry>;

export type TypeNames = typeof typeNames;
