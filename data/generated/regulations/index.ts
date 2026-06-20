// 生成物（scripts/generate.ts 出力）。手書き編集しない。raw/champions を直し再生成する。
import { championsMA } from "./champions-m-a/index.ts";
import { championsMB } from "./champions-m-b/index.ts";

export const regulationDex = {
  "champions-m-a": championsMA,
  "champions-m-b": championsMB,
} as const;

export type RegulationDex = typeof regulationDex;
export type RegulationId = keyof RegulationDex;
