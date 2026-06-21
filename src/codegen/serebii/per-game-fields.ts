/**
 * per-game-fields.ts（serebii codegen 純関数）— 技専用ページ由来の技マスター（`ParsedMoveMaster`）を
 * **per-game 技メタ**（`move-specs.yaml`・Champions 固有値）の転記材料へ変換する純関数。技の数値は Champions
 * 固有調整があり得るためゲーム単位で持つ（ADR 0034/0035）。技メタの取得は技専用ページに一本化し、種族ページ
 * からの副産物抽出は除去した（ADR 0037）。名前 en は [`catalog-fields`](./catalog-fields.ts) が担う。
 */
import type { ParsedMoveMaster } from "./parse.ts";

/**
 * move-specs.yaml の Serebii 由来技メタ欄（per-game 共有・ADR 0034/0035）。`priority` を含む技メタ全項目を
 * 技専用ページ（`ParsedMoveMaster`）から一次ソースで取る（種族ページ副産物の暫定値ではない・ADR 0037）。
 */
export interface MoveStatsFields {
  type: string;
  damageClass: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
}

/**
 * `ParsedMoveMaster` → move-specs.yaml 技メタ欄（技専用ページ由来・priority を含む全項目・ADR 0037）。技
 * マスター転記は**この値で move-specs を上書き是正**する（前作 PP 残存の根絶・後勝ち）。`priority === null` は
 * 0 へ倒す（検証済み技は priority を必ず持つ）。
 */
export function moveMasterStatsFields(m: ParsedMoveMaster): MoveStatsFields {
  return {
    type: m.type,
    damageClass: m.damageClass,
    power: m.power,
    accuracy: m.accuracy,
    pp: m.pp,
    priority: m.priority === null ? 0 : m.priority,
  };
}
