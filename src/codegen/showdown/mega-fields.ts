/**
 * mega-fields.ts（showdown codegen 純関数）— メガ中間レコードを mega-specs.yaml /
 * species-specs.megaEvolvesTo / <reg>/mega.yaml / languages の転記材料へ写す。
 *
 * メガは base 種族から分離した独立エンティティ（ADR 0036）。base→mega の membership は
 * baseSpecies で group 化して導出し、species-specs.megaEvolvesTo と <reg>/mega.yaml の双方で使う。
 */

import { kebabId, type ShowdownBaseStats, type StatsTable, toStatsTable, toTypeId } from "./ids.ts";

/** メガ中間レコード（`scripts/showdown/mega.ts` の MegaRecord 相当・抽出層非依存に再定義）。 */
export interface MegaInput {
  num: number;
  name: string;
  baseSpecies: string;
  types: string[];
  baseStats: ShowdownBaseStats;
  ability: string;
}

/** mega-specs.yaml の構造フィールド（name 抜き・ADR 0036）。 */
export interface MegaStructuralFields {
  dex: number;
  types: string[];
  stats: StatsTable;
  ability: string;
  baseSpecies: string;
}

/** メガ形態の安定 id（name 由来 kebab）。 */
export function megaId(m: MegaInput): string {
  return kebabId(m.name);
}

/** base 種族の安定 id（name 由来 kebab）。 */
export function megaBaseSpeciesId(m: MegaInput): string {
  return kebabId(m.baseSpecies);
}

/** mega-specs.yaml の構造フィールドを組む。 */
export function megaStructuralFields(m: MegaInput): MegaStructuralFields {
  return {
    dex: m.num,
    types: m.types.map(toTypeId),
    stats: toStatsTable(m.baseStats),
    ability: kebabId(m.ability),
    baseSpecies: kebabId(m.baseSpecies),
  };
}

/** languages/mega.yaml の en 名材料。 */
export function megaEnName(m: MegaInput): { en: string } {
  return { en: m.name };
}

/**
 * メガレコード群を base 種族 id → メガ id 配列へ group 化する（species-specs.megaEvolvesTo /
 * <reg>/mega.yaml 共通材料）。値は id 昇順、キーは挿入順。
 */
export function groupMegaByBase(megas: MegaInput[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const m of megas) {
    const base = kebabId(m.baseSpecies);
    const id = kebabId(m.name);
    const list = out[base] ?? [];
    if (!list.includes(id)) list.push(id);
    out[base] = list;
  }
  for (const base of Object.keys(out)) {
    out[base]?.sort((a, b) => a.localeCompare(b));
  }
  return out;
}
