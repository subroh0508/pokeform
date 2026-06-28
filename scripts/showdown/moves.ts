/**
 * scripts/showdown/moves.ts — 解禁 roster が覚える技の技メタを抽出する（calculatePP 適用）。
 *
 * 出力は使用可能な全種族の learnset の和集合。PP は基礎値でなく `realPP`（Champions 実 PP・
 * 8/12/16/20）を転記する。転記層 `src/codegen/showdown/moves-fields.ts` が move-specs.yaml /
 * languages へ写す。
 */

import { learnsetNames, type ModdedDex, realPP, usableSpecies } from "./dex";

/** showdown から抽出した技 1 件の中間レコード。 */
export interface MoveRecord {
  /** showdown の squashed id（参考・id 正規化は codegen が name から行う） */
  id: string;
  name: string;
  type: string;
  category: "Physical" | "Special" | "Status";
  basePower: number;
  /** 数値の命中率、または true（必中） */
  accuracy: number | true;
  /** Champions 実 PP（calculatePP 適用後） */
  pp: number;
  priority: number;
}

/** 使用可能な全種族の learnset 和集合を技メタとして抽出する（name 昇順）。 */
export function extractMoves(dex: ModdedDex): MoveRecord[] {
  const moveNames = new Set<string>();
  for (const species of usableSpecies(dex)) {
    for (const name of learnsetNames(dex, species)) moveNames.add(name);
  }
  return [...moveNames]
    .map((name) => dex.moves.get(name))
    .filter((move) => move.exists)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((move) => ({
      id: move.id,
      name: move.name,
      type: move.type,
      category: move.category,
      basePower: move.basePower,
      accuracy: move.accuracy,
      pp: realPP(dex, move),
      priority: move.priority,
    }));
}
