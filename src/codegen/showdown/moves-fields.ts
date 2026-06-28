/**
 * moves-fields.ts（showdown codegen 純関数）— 技中間レコードを move-specs.yaml / languages の
 * 転記材料へ写す。
 *
 * damageClass は showdown category（Physical/Special/Status）を小文字化。accuracy `true`（必中）→
 * `null`、power `0`（status 等）→ `null`。PP は抽出層で calculatePP 適用済みの実 PP をそのまま使う。
 */

import { kebabId, toTypeId } from "./ids.ts";

/** 技中間レコード（`scripts/showdown/moves.ts` の MoveRecord 相当・抽出層非依存に再定義）。 */
export interface MoveInput {
  name: string;
  type: string;
  category: "Physical" | "Special" | "Status";
  basePower: number;
  accuracy: number | true;
  pp: number;
  priority: number;
}

/** move-specs.yaml の技メタ欄（per-game 共有・ADR 0034/0035）。 */
export interface MoveStatsFields {
  type: string;
  damageClass: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
}

/** 技の安定 id（name 由来 kebab）。 */
export function moveId(m: MoveInput): string {
  return kebabId(m.name);
}

/** move-specs.yaml の技メタ欄を組む。 */
export function moveStatsFields(m: MoveInput): MoveStatsFields {
  return {
    type: toTypeId(m.type),
    damageClass: m.category.toLowerCase(),
    power: m.basePower === 0 ? null : m.basePower,
    accuracy: m.accuracy === true ? null : m.accuracy,
    pp: m.pp,
    priority: m.priority,
  };
}

/** languages/moves.yaml の en 名材料。 */
export function moveEnName(m: MoveInput): { en: string } {
  return { en: m.name };
}
