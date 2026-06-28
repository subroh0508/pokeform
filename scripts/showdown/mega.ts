/**
 * scripts/showdown/mega.ts — メガシンカ・ゲンシカイキの構造 + linking を抽出する。
 *
 * メガは base 種族から分離した独立エンティティ（ADR 0036）。出力は使用可能なメガフォルムで、
 * baseSpecies / ability（固定スロット 0）/ 構造を持つ。転記層
 * `src/codegen/showdown/mega-fields.ts` が mega-specs / megaEvolvesTo / <reg>/mega.yaml /
 * languages へ写す。base→mega の解禁メンバーシップは baseSpecies で group 化して導出する。
 */

import { isMegaForme, type ModdedDex, usableSpecies } from "./dex";

/** showdown から抽出したメガフォルム 1 体の中間レコード。 */
export interface MegaRecord {
  /** showdown の squashed id（参考・id 正規化は codegen が name から行う） */
  id: string;
  num: number;
  name: string;
  /** base 種族の showdown 表示名（メガ membership / megaEvolvesTo の親） */
  baseSpecies: string;
  types: string[];
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  /** メガの固定特性（スロット 0） */
  ability: string;
}

/** 使用可能なメガフォルムを抽出する（num 昇順）。 */
export function extractMega(dex: ModdedDex): MegaRecord[] {
  return usableSpecies(dex)
    .filter((species) => isMegaForme(species))
    .map((species) => ({
      id: species.id,
      num: species.num,
      name: species.name,
      baseSpecies: species.baseSpecies,
      types: species.types,
      baseStats: species.baseStats,
      ability: species.abilities["0"] ?? "",
    }));
}
