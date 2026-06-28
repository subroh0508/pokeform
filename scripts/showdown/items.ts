/**
 * scripts/showdown/items.ts — 解禁持ち物の category / メガストーン linking を抽出する。
 *
 * champions mod の `megaStone` は base PS と異なりオブジェクト（例 `{"Venusaur":"Venusaur-Mega"}`）。
 * 転記層 `src/codegen/showdown/items-fields.ts` が item-specs / <reg>/items.yaml / languages へ写す。
 */

import { isUsableItem, itemCategory, type ModdedDex } from "./dex";

/** showdown から抽出した持ち物 1 件の中間レコード。 */
export interface ItemRecord {
  /** showdown の squashed id（参考・id 正規化は codegen が name から行う） */
  id: string;
  name: string;
  category: "megastone" | "berry" | "other";
  /** メガストーンの対応（mod により string か {元: メガ} オブジェクト・無ければ null） */
  megaStone: string | AnyObject | null;
  /** メガストーンが進化させる base 種族名（無ければ null） */
  megaEvolves: string | null;
}

/** 使用可能な持ち物を抽出する（name 昇順）。 */
export function extractItems(dex: ModdedDex): ItemRecord[] {
  return dex.items
    .all()
    .filter(isUsableItem)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((item) => ({
      id: item.id,
      name: item.name,
      category: itemCategory(item),
      megaStone: item.megaStone || null,
      megaEvolves: item.megaEvolves || null,
    }));
}
