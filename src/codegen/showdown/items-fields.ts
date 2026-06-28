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

import { kebabId } from "./ids.ts";

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
  megaSpecies?: string;
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
    return {
      megaStoneFor: kebabId(link.baseSpecies),
      megaSpecies: kebabId(link.megaSpecies),
      category: CATEGORY_MAP[i.category],
    };
  }
  return { category: CATEGORY_MAP[i.category] };
}

/** languages/items.yaml の en 名材料。 */
export function itemEnName(i: ItemInput): { en: string } {
  return { en: i.name };
}
