/**
 * species-fields.ts（showdown codegen 純関数）— 種族中間レコードを SoT YAML の転記材料へ写す。
 *
 * 出力先は species-specs.yaml（構造）/ <reg>/species.yaml（roster id 列挙）/
 * <reg>/species-moves.yaml（習得技 id 配列）/ languages/species.yaml（en）。id は showdown の
 * squashed id でなく **name から kebab 化**する（[`ids`](./ids.ts)）。fs/YAML I/O は
 * `scripts/sync-showdown.ts` が担い、本モジュールは純変換に専念する。
 */

import { canonicalSpeciesId } from "./canonical-species-id.ts";
import { kebabId, type ShowdownBaseStats, type StatsTable, toStatsTable, toTypeId } from "./ids.ts";

/** 種族中間レコード（`scripts/showdown/species.ts` の SpeciesRecord 相当・抽出層非依存に再定義）。 */
export interface SpeciesInput {
  num: number;
  name: string;
  /** base 種族の showdown 表示名（cosmetic 模様フォルムを name SoT へ畳むため）。 */
  baseSpecies: string;
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

/** 種族の canonical id（name 由来・明示 slug へ正規化・[`canonical-species-id`](./canonical-species-id.ts)）。 */
export function speciesId(s: SpeciesInput): string {
  return canonicalSpeciesId(s.name);
}

/**
 * 名前 SoT（languages/species.yaml）が **cosmetic 模様フォルムを base へ畳んでいる結果を流用**して roster/specs id を
 * 決める。showdown は vivillon の模様（`vivillon-archipelago` 等）を個別 species として emit するが、languages は
 * PokeAPI の含有判定合成（`isDistinctForm`）で純装飾を除外し base（`vivillon`）だけを持つ。よって:
 * - `canonicalSpeciesId(name)` が languages に**在れば**そのまま採用（distinct forme = rotom-wash / FORM_INCLUDE の
 *   squawkabilly 各色 / floette-eternal 等は languages に在るので畳まれない）。
 * - **無ければ** languages が畳んだ cosmetic ゆえ base（`canonicalSpeciesId(baseSpecies)`）へ畳む（base は languages に
 *   在る）。これで構造側の id 集合が名前側（languages）に一致する。
 * - base も languages に無ければ **新規 distinct 種**（手順3・cosmetic と区別）ゆえ畳まず forme id を返し generate で
 *   名前欠落として顕在化させる（推測で base へ潰さない）。
 * `inLanguages` は languages/species.yaml の id 集合メンバシップ（呼び出し側 `sync-showdown.ts` が langMap から渡す）。
 */
export function resolveSpeciesId(s: SpeciesInput, inLanguages: (id: string) => boolean): string {
  const id = speciesId(s);
  if (inLanguages(id)) return id;
  const baseId = canonicalSpeciesId(s.baseSpecies);
  return inLanguages(baseId) ? baseId : id;
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
