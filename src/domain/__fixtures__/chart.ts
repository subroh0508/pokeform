import { typeDex } from "../../../data/generated/types.ts";
import { buildChart } from "../type-effectiveness.ts";

/** 生成済み TypeDex（第9世代準拠・全 18 タイプ）から構築した相性表。ドメインテスト共有 fixture。 */
export const chart = buildChart(typeDex);
