/**
 * mega-fields.ts（showdown codegen 純関数）— メガ中間レコードを mega-specs.yaml /
 * species-specs.megaEvolvesTo / <reg>/mega.yaml の転記材料へ写す（構造 + linking のみ）。
 * 名前（languages/mega.yaml）は showdown 経路では扱わない（PokeAPI pokemon-form form_names 経路が担う・ADR 0043）。
 *
 * メガは base 種族から分離した独立エンティティ（ADR 0036）。base→mega の membership は
 * baseSpecies で group 化して導出し、species-specs.megaEvolvesTo と <reg>/mega.yaml の双方で使う。
 */

import { canonicalFormId, canonicalSpeciesId } from "./canonical-species-id.ts";
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

/**
 * メガ形態の安定 id。name kebab を canonical form へ写す（gender メガ `meowstic-f-mega` →
 * `meowstic-female-mega` 等を languages/mega.yaml へ揃える）。通常メガ（`charizard-mega-x` 等）は no-op。
 */
export function megaId(m: MegaInput): string {
  return canonicalFormId(kebabId(m.name));
}

/**
 * base 種族の安定 id。roster / megaEvolvesTo と同じ canonical species id へ写す（gender メガの
 * baseSpecies は showdown が bare `Meowstic`（=男）で持つため `meowstic-male` に揃い roster と一致する）。
 * 通常メガ（`Charizard` → `charizard` 等）は no-op。
 */
export function megaBaseSpeciesId(m: MegaInput): string {
  return canonicalSpeciesId(m.baseSpecies);
}

/** mega-specs.yaml の構造フィールドを組む。 */
export function megaStructuralFields(m: MegaInput): MegaStructuralFields {
  return {
    dex: m.num,
    types: m.types.map(toTypeId),
    stats: toStatsTable(m.baseStats),
    ability: kebabId(m.ability),
    baseSpecies: megaBaseSpeciesId(m),
  };
}

/**
 * メガレコード群を base 種族 id → メガ id 配列へ group 化する（species-specs.megaEvolvesTo /
 * <reg>/mega.yaml 共通材料）。値は id 昇順、キーは挿入順。
 */
export function groupMegaByBase(megas: MegaInput[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const m of megas) {
    const base = megaBaseSpeciesId(m);
    const id = megaId(m);
    const list = out[base] ?? [];
    if (!list.includes(id)) list.push(id);
    out[base] = list;
  }
  for (const base of Object.keys(out)) {
    out[base]?.sort((a, b) => a.localeCompare(b));
  }
  return out;
}
