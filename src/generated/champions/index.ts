// 生成物（scripts/generate.ts 出力）。手書き編集しない。data/champions・data/languages を直し再生成する。
import { championsMA } from "./m-a/index.ts";

export const regulationDex = {
  "champions-m-a": championsMA,
} as const;

export type RegulationDex = typeof regulationDex;
export type RegulationId = keyof RegulationDex;
