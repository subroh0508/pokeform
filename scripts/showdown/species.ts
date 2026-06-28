/**
 * scripts/showdown/species.ts — 種族構造 + 解禁 roster + learnset を抽出する。
 *
 * メガ・ゲンシカイキのフォルムは除外し、base 種族のみを返す（メガは mega.ts が担う）。
 * 出力は中間 JSON（`SpeciesRecord[]`）で、転記層 `src/codegen/showdown/species-fields.ts` が
 * SoT YAML（species-specs / <reg>/species.yaml / <reg>/species-moves.yaml / languages）へ写す。
 */

import { isMegaForme, learnsetNames, type ModdedDex, usableSpecies } from "./dex";

/** showdown から抽出した base 種族 1 体の中間レコード。 */
export interface SpeciesRecord {
  /** showdown の squashed id（参考・id 正規化は codegen が name から行う） */
  id: string;
  num: number;
  name: string;
  types: string[];
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  abilities: { [slot: string]: string };
  /** 覚えられる技の showdown 表示名（アルファベット順） */
  learnset: string[];
}

/** 使用可能な base 種族（メガ除外）を抽出する。 */
export function extractSpecies(dex: ModdedDex): SpeciesRecord[] {
  return usableSpecies(dex)
    .filter((species) => !isMegaForme(species))
    .map((species) => ({
      id: species.id,
      num: species.num,
      name: species.name,
      types: species.types,
      baseStats: species.baseStats,
      abilities: { ...species.abilities },
      learnset: learnsetNames(dex, species),
    }));
}
