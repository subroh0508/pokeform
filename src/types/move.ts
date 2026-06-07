import type { PokemonType } from "./type-chart.ts";

/**
 * 技エントリの親型（統一パターンの XxxBase）。子型・MoveDex・MoveId は
 * `data/generated/moves.ts` が `as const satisfies Record<string, MoveBase>` から派生する。
 * 統一パターンは .claude/rules/type-conventions.md を参照。
 */

/** 技の分類。`status`（変化技）は攻撃範囲分析の対象外（[[cli-and-io]] / coverage）。 */
export type DamageClass = "physical" | "special" | "status";

/** 1 技の構造的に共通な形。詳細（type/damageClass）は MoveDex[Id] でルックアップする。 */
export interface MoveBase {
  readonly id: string;
  readonly name: { readonly en: string; readonly ja: string };
  readonly type: PokemonType;
  readonly damageClass: DamageClass;
  /** 変化技は `null`。 */
  readonly power: number | null;
  readonly accuracy: number | null;
  readonly pp: number;
  readonly priority: number;
}
