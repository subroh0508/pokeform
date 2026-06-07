// 生成物（scripts/generate.ts 出力）。手書き編集しない。raw/champions を直し再生成する。
import type { RegulationBase } from "../../../src/types/regulation.ts";

export const championsMB = {
  id: "champions-m-b",
  name: {
    en: "Champions Regulation M-B",
    ja: "チャンピオンズ レギュレーションM-B",
  },
  period: {
    start: "2026-06-17",
    end: null,
  },
  species: ["garchomp", "dragonite", "rotom-wash", "charizard", "dragapult", "hydreigon"],
  items: [
    "charizardite-x",
    "rocky-helmet",
    "life-orb",
    "leftovers",
    "assault-vest",
    "choice-scarf",
  ],
  mega: ["charizard-mega-x"],
} as const satisfies RegulationBase;
