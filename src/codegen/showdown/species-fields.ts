/**
 * species-fields.ts（showdown codegen 純関数）— 種族中間レコードを SoT YAML の転記材料へ写す。
 *
 * 出力先は species-specs.yaml（構造）/ <reg>/species.yaml（roster id 列挙）/
 * <reg>/species-moves.yaml（習得技 id 配列）/ languages/species.yaml（en）。id は showdown の
 * squashed id でなく **name から kebab 化**する（[`ids`](./ids.ts)）。fs/YAML I/O は
 * `scripts/sync-showdown.ts` が担い、本モジュールは純変換に専念する。
 */

import { kebabId, type ShowdownBaseStats, type StatsTable, toStatsTable, toTypeId } from "./ids.ts";

/** 種族中間レコード（`scripts/showdown/species.ts` の SpeciesRecord 相当・抽出層非依存に再定義）。 */
export interface SpeciesInput {
  num: number;
  name: string;
  types: string[];
  baseStats: ShowdownBaseStats;
  abilities: { [slot: string]: string };
  learnset: string[];
}

/** species-specs.yaml の構造フィールド（name 抜き・ADR 0035）。 */
export interface SpeciesStructuralFields {
  dex: number;
  types: string[];
  stats: StatsTable;
  abilities: string[];
}

/** 特性スロットの優先順（通常 0 → 1 → 隠れ特性 H → 特殊 S）。 */
const ABILITY_SLOT_ORDER = ["0", "1", "H", "S"] as const;

/** abilities スロットマップを優先順の kebab id 配列へ（重複は先勝ちで除去）。 */
export function orderedAbilityIds(abilities: { [slot: string]: string }): string[] {
  const ids: string[] = [];
  for (const slot of ABILITY_SLOT_ORDER) {
    const name = abilities[slot];
    if (name === undefined) continue;
    const id = kebabId(name);
    if (!ids.includes(id)) ids.push(id);
  }
  return ids;
}

/** 種族の安定 id（name 由来 kebab）。 */
export function speciesId(s: SpeciesInput): string {
  return kebabId(s.name);
}

/** species-specs.yaml の構造フィールドを組む。 */
export function speciesStructuralFields(s: SpeciesInput): SpeciesStructuralFields {
  return {
    dex: s.num,
    types: s.types.map(toTypeId),
    stats: toStatsTable(s.baseStats),
    abilities: orderedAbilityIds(s.abilities),
  };
}

/** languages/species.yaml の en 名材料。 */
export function speciesEnName(s: SpeciesInput): { en: string } {
  return { en: s.name };
}

/** <reg>/species-moves.yaml の習得技 id 配列（kebab・id 昇順）。 */
export function speciesMoveIds(s: SpeciesInput): string[] {
  return s.learnset.map(kebabId).sort((a, b) => a.localeCompare(b));
}
