/**
 * items-fields.ts（showdown codegen 純関数）— 持ち物中間レコードを item-specs.yaml /
 * <reg>/items.yaml / languages の転記材料へ写す。
 *
 * showdown の category は粗い（megastone/berry/other）ため、SoT の細かい category（PokeAPI 由来の
 * `held-items` / `type-enhancement` 等）は `scripts/sync-showdown.ts` の planFields が **既存尊重で
 * 保持**する。本モジュールは未登録持ち物向けの粗い category と、メガストーン linking
 * （megaStoneFor/megaSpecies）を組む。megaStone は champions mod ではオブジェクト
 * （`{"Charizard":"Charizard-Mega-X"}`）。
 */

import { canonicalSpeciesId } from "./canonical-species-id.ts";
import { kebabId } from "./ids.ts";
import { genderMegaSiblingId, megaFormId } from "./mega-fields.ts";

/** 持ち物中間レコード（`scripts/showdown/items.ts` の ItemRecord 相当・抽出層非依存に再定義）。 */
export interface ItemInput {
  name: string;
  category: "megastone" | "berry" | "other";
  megaStone: string | Record<string, string> | null;
  megaEvolves: string | null;
}

/** item-specs.yaml の構造フィールド（name 抜き）。メガストーンのみ linking を持つ。 */
export interface ItemStructuralFields {
  category: string;
  megaStoneFor?: string;
  /** メガストーンが生む**メガ形態** id 群。gender メガのストーン（meowsticite）は 1 個で ♀♂両形態に
   *  対応するため配列（`[<base>-female-mega, <base>-male-mega]`）・通常は 1 要素（ADR 0046）。 */
  megaSpecies?: readonly string[];
}

/** showdown の粗い category を SoT の category 語彙へ写す（未登録持ち物向けの既定値）。 */
const CATEGORY_MAP: Record<ItemInput["category"], string> = {
  megastone: "mega-stones",
  berry: "berries",
  other: "held-items",
};

/** 持ち物の安定 id（name 由来 kebab）。 */
export function itemId(i: ItemInput): string {
  return kebabId(i.name);
}

/**
 * megaStone（mod ではオブジェクト・base PS では文字列）から base 種族名・メガ形態名を取り出す。
 * オブジェクトは最初のエントリ `[base, mega]`、文字列はメガ形態名でペアの base は `megaEvolves`。
 * メガストーンでなければ null。
 */
export function parseMegaLink(i: ItemInput): { baseSpecies: string; megaSpecies: string } | null {
  if (i.megaStone && typeof i.megaStone === "object") {
    const entry = Object.entries(i.megaStone)[0];
    if (entry) return { baseSpecies: entry[0], megaSpecies: entry[1] };
  }
  if (typeof i.megaStone === "string" && i.megaEvolves) {
    return { baseSpecies: i.megaEvolves, megaSpecies: i.megaStone };
  }
  return null;
}

/** item-specs.yaml の構造フィールドを組む。 */
export function itemStructuralFields(i: ItemInput): ItemStructuralFields {
  const link = parseMegaLink(i);
  if (link) {
    // megaStoneFor は base 種族 id を canonical へ（bare `Meowstic`→`meowstic-male` / `Floette-Eternal`→
    // `floette-eternal`）。`kebabId` 直だと bare `meowstic`（SUPPRESS_BASE_SPECIES 抑制種で roster 不在）になる。
    // megaSpecies は mega レコードの `megaId` と同じ per-gender id へ（`megaFormId`）。gender メガのストーンは
    // 1 個で ♀♂両形態に対応するため兄弟形態も含めた配列にする（ADR 0046）。
    const mid = megaFormId(link.megaSpecies);
    const sibling = genderMegaSiblingId(mid);
    return {
      megaStoneFor: canonicalSpeciesId(link.baseSpecies),
      megaSpecies: sibling ? [mid, sibling].sort() : [mid],
      category: CATEGORY_MAP[i.category],
    };
  }
  return { category: CATEGORY_MAP[i.category] };
}

/** languages/items.yaml の en 名材料。 */
export function itemEnName(i: ItemInput): { en: string } {
  return { en: i.name };
}
