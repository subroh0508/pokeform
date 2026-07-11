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
 * gender メガの showdown forme id（`<base>-f-mega` / `<base>-m-mega`）。♂♀の2形態はステータス/タイプ/
 * 特性が完全一致するため単一メガ形態へ統合する（ADR 0045）。base 種族の gender 分割は維持し、メガ形態のみ畳む。
 */
const GENDER_MEGA_SUFFIX = /-(f|m)-mega$/;

/**
 * メガ形態名 → 安定 mega id。gender メガ（`Meowstic-F-Mega` / `Meowstic-M-Mega`）は単一 `<base>-mega`
 * （`meowstic-mega`）へ畳み、それ以外は `canonicalFormId` で正規化する（`charizard-mega-x` 等は no-op）。
 * `megaId`（mega レコード）と items 経路の `megaSpecies` リンクが同じ id へ収束する単一 SoT。
 */
export function megaFormId(name: string): string {
  const kebab = kebabId(name);
  if (GENDER_MEGA_SUFFIX.test(kebab)) return kebab.replace(GENDER_MEGA_SUFFIX, "-mega");
  return canonicalFormId(kebab);
}

/**
 * メガ形態の安定 id。gender メガは単一 `<base>-mega` へ統合、通常メガ（`charizard-mega-x` 等）は no-op。
 */
export function megaId(m: MegaInput): string {
  return megaFormId(m.name);
}

/**
 * mega base 限定の canonical 上書き。showdown が mega の baseSpecies を bare で持つが、実際に
 * メガ可能かつ roster に載る形態が特定 form のケースを補正する。`floette-mega` の base は showdown で
 * bare `Floette` だが、Champions でメガ可能かつ roster に載るのは AZ の `floette-eternal` のみ。
 * bare `floette` は別種として languages/species.yaml に実在するため `canonicalSpeciesId`（全域）では
 * 写せず、mega base 解決に限定して上書きする（gender メガの bare `Meowstic`→`meowstic-male` は
 * 別種を持たず全域 `DEFAULT_TO_EXPLICIT` で済むのと対照的なケース）。
 */
const MEGA_BASE_OVERRIDE: Record<string, string> = {
  floette: "floette-eternal",
};

/**
 * base 種族の安定 id。roster / megaEvolvesTo と同じ canonical species id へ写す（gender メガの
 * baseSpecies は showdown が bare `Meowstic`（=男）で持つため `meowstic-male` に揃い roster と一致する）。
 * 通常メガ（`Charizard` → `charizard` 等）は no-op。`floette` 等 bare base が roster form と食い違う
 * ケースだけ `MEGA_BASE_OVERRIDE` で roster 側へ揃える。
 */
export function megaBaseSpeciesId(m: MegaInput): string {
  const canonical = canonicalSpeciesId(m.baseSpecies);
  return MEGA_BASE_OVERRIDE[canonical] ?? canonical;
}

/**
 * メガが「どの base 種族から進化するか」（megaEvolvesTo / <reg>/mega.yaml の base キー）。gender メガは
 * showdown が baseSpecies を bare（`Meowstic`=男）でしか持たないため、mega 名の gender から gender 別 base
 * （F→`<base>-female` / M→`<base>-male`）を導出し、♂♀両 base を単一メガへ紐付ける（ADR 0045）。非 gender メガは
 * `megaBaseSpeciesId`（roster / megaEvolvesTo と同じ canonical・floette 等の override も込み）に一致する。
 */
export function megaEvolveBaseId(m: MegaInput): string {
  const gender = kebabId(m.name).match(GENDER_MEGA_SUFFIX)?.[1];
  if (gender) return `${kebabId(m.baseSpecies)}-${gender === "f" ? "female" : "male"}`;
  return megaBaseSpeciesId(m);
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
    const base = megaEvolveBaseId(m);
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
