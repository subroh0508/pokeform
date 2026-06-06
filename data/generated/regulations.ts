// 生成物（scripts/generate.ts 出力）。手書き編集しない。raw/champions を直し再生成する。
export const regulationDex = {
  "champions-m-a": {
    id: "champions-m-a",
    name: {
      en: "Champions Regulation M-A",
      ja: "チャンピオンズ レギュレーションM-A",
    },
    allow: [
      "garchomp",
      "dragonite",
      "salamence",
      "metagross",
      "rotom-wash",
      "charizard",
      "charizard-mega-x",
    ],
  },
  "champions-m-b": {
    id: "champions-m-b",
    name: {
      en: "Champions Regulation M-B",
      ja: "チャンピオンズ レギュレーションM-B",
    },
    allow: [
      "garchomp",
      "dragonite",
      "salamence",
      "metagross",
      "rotom-wash",
      "charizard",
      "charizard-mega-x",
      "mewtwo",
    ],
  },
} as const;

export type RegulationDex = typeof regulationDex;
export type RegulationId = keyof RegulationDex;
