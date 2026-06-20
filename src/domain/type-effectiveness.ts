import type { PokemonType, TypeMultiplier } from "../types/type-chart.ts";

/**
 * タイプ相性の純関数（I/O 非依存）。第9世代準拠の静的相性表（攻撃→防御の基本倍率）を
 * もとに、単/複合タイプへの倍率を算出する。複合タイプは各倍率の積（テラス不可で変動要素なし）。
 * 相性表データは `src/generated/types.ts`（TypeDex）が唯一のソース。正本は
 * docs/plan/01-mvp/architecture.md / .claude/rules/game-spec.md。
 */

/** 攻撃タイプ → 防御タイプの倍率表（`chart[attack][defense]`）。 */
export type EffectivenessChart = {
  readonly [Attack in PokemonType]: { readonly [Defense in PokemonType]: TypeMultiplier };
};

/** TypeDex 風データ（各タイプの `damageTo`）から攻撃→防御の倍率表を構築する。 */
export const buildChart = (
  types: Readonly<
    Record<PokemonType, { readonly damageTo: Readonly<Record<PokemonType, TypeMultiplier>> }>
  >,
): EffectivenessChart => {
  const chart = {} as { [Attack in PokemonType]: { [Defense in PokemonType]: TypeMultiplier } };
  for (const attack of Object.keys(types) as PokemonType[]) {
    chart[attack] = { ...types[attack].damageTo };
  }
  return chart;
};

/**
 * 1 つの攻撃タイプが、防御側タイプ集合（単/複合）へ与える倍率。複合は積で算出する
 * （例: こおり → [ドラゴン, じめん] = 2 × 2 = ×4）。防御タイプが空なら等倍 (1)。
 */
export const effectiveness = (
  chart: EffectivenessChart,
  attack: PokemonType,
  defenders: readonly PokemonType[],
): number => defenders.reduce((mult, def) => mult * chart[attack][def], 1);
