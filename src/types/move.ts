import type { PokemonType } from "./type-chart.ts";

/**
 * 技の per-game 技メタ型 `MoveStats`。名前（id + 日英名・ゲーム非依存）は構造から分離し
 * `data/languages/moves.yaml`（`moveNames`）が SoT、技メタは Champions 固有値（`data/champions/
 * move-specs.yaml` が SoT・ADR 0034）。`MoveSpecsDex`/`MoveId` は `data/generated/champions/move-specs.ts`
 * が `as const satisfies Record<string, MoveStats>` から派生する。統一パターンは
 * .claude/rules/type-conventions.md を参照。
 */

/** 技の分類。`status`（変化技）は攻撃範囲分析の対象外（[[cli-and-io]] / coverage）。 */
export type DamageClass = "physical" | "special" | "status";

/**
 * 1 技の per-game 技メタ（type/damageClass/power/accuracy/pp/priority）。技の数値は Champions 固有調整が
 * あり得るためゲーム単位で持つ（SoT = `data/champions/move-specs.yaml`・ADR 0034）。攻撃範囲分析
 * （coverage）・ダメージ / 火力指数はこの dex を引く。`MoveId = keyof MoveSpecsDex`（move-specs が技 id の正本）。
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
