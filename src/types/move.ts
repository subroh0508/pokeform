import type { PokemonType } from "./type-chart.ts";

/**
 * 技エントリの型。名前（id + 日英名）の親型 `MoveBase` と per-game 技メタ `MoveStats` を分離する（Phase 11）。
 * 名前はゲーム非依存（catalog/moves.yaml が SoT）、技メタは Champions 固有値（per-game `regulations/champions/
 * moves.yaml` が SoT・ADR 0034）。`MoveDex`/`MoveId` は `data/generated/moves.ts`（名前）、`MoveStats` の dex は
 * `data/generated/regulations/champions/moves.ts` が各々 `as const satisfies` から派生する。
 * 統一パターンは .claude/rules/type-conventions.md を参照。
 */

/** 技の分類。`status`（変化技）は攻撃範囲分析の対象外（[[cli-and-io]] / coverage）。 */
export type DamageClass = "physical" | "special" | "status";

/** 1 技の名前エントリ（id + 日英名・ゲーム非依存）。技メタは `MoveStats` へ分離（Phase 11）。 */
export interface MoveBase {
  readonly id: string;
  readonly name: { readonly en: string; readonly ja: string };
}

/**
 * 1 技の per-game 技メタ（type/damageClass/power/accuracy/pp/priority）。技の数値は Champions 固有調整が
 * あり得るためゲーム単位で持つ（SoT = per-game `regulations/champions/moves.yaml`・ADR 0034）。攻撃範囲分析
 * （coverage）・ダメージ / 火力指数はこの per-game dex を引く。
 */
export interface MoveStats {
  readonly type: PokemonType;
  readonly damageClass: DamageClass;
  /** 変化技は `null`。 */
  readonly power: number | null;
  readonly accuracy: number | null;
  readonly pp: number;
  readonly priority: number;
}
