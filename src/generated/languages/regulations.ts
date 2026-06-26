// 生成物（scripts/generate.ts 出力）。手書き編集しない。data/champions・data/languages を直し再生成する。
import type { NameEntry } from "../../types/name.ts";

export const regulationNames = {
  "champions-m-a": {
    id: "champions-m-a",
    name: {
      en: "Champions Regulation M-A",
      ja: "チャンピオンズ レギュレーションM-A",
    },
  },
} as const satisfies Record<string, NameEntry>;

export type RegulationNames = typeof regulationNames;
