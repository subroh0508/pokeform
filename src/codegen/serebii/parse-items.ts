/**
 * parse-items.ts（serebii codegen 純関数）— 持ち物データセットを抽出する。showdown 側 `items` と対称。
 *
 * 2 ページを担う:
 * - `parseItemsRoster`（`pokemonchampions/items.shtml`）= 解禁持ち物の roster + category + メガストーン
 *   linking（megaStoneFor）。セクション見出し（`<u>Hold Items</u>` 等）で category を判定する。
 * - `parseItem`（`itemdex/<id>.shtml`）= 個別持ち物の **英名 en + 日本語名 ja**（速報の名前埋め）。
 *   日本語名は詳細表の「Japanese Name」列のひらがな。
 */
import { type CheerioAPI, load } from "cheerio";
import { jaFromText, toId } from "./decode.ts";

/** 解禁持ち物のカテゴリ（items.shtml のセクション区分）。 */
export type ItemCategory = "hold" | "berry" | "mega-stone";

/** 解禁持ち物 1 件（items.shtml の 1 行）。`megaStoneFor` はメガ先 base 種族 id（非メガストーンは null）。 */
export interface SerebiiItem {
  id: string;
  en: string;
  slug: string;
  category: ItemCategory;
  megaStoneFor: string | null;
}

/** itemdex 個別ページ由来の持ち物名（id + en + ja）。 */
export interface SerebiiItemName {
  id: string;
  en: string;
  ja: string;
}

/** items.shtml のセクション見出し（`<u>…</u>`）→ カテゴリ。未知見出しは持ち物表でないため無視する。 */
const ITEM_SECTIONS: Readonly<Record<string, ItemCategory>> = {
  "Hold Items": "hold",
  "Mega Stone": "mega-stone",
  Berries: "berry",
};

/** itemdex href（`/itemdex/<slug>.shtml`）から Serebii item slug を取り出す。slug 文字が無ければ ""。 */
export function slugFromHref(href: string | undefined): string {
  return /\/itemdex\/([a-z0-9-]+)\.shtml/.exec(href ?? "")?.[1] ?? "";
}

/**
 * メガストーン説明文（`A Charizard holding this stone…`）からメガ先 base 種族名を取り出し kebab id へ。
 * items.shtml はメガ先へのリンクを持たないため種族名は説明文からのみ得る。取れなければ null。
 */
export function megaTargetFromDesc(desc: string): string | null {
  const species = /\bAn? (?:special )?([A-Z][a-zA-Z]+) holding this/.exec(desc)?.[1];
  return species === undefined ? null : toId(species);
}

/** 1 つの `table.dextable` の各行から持ち物を抽出して `items` へ push する（ヘッダ行・非該当行はスキップ）。 */
function collectItemRows(
  $: CheerioAPI,
  $table: ReturnType<CheerioAPI>,
  category: ItemCategory,
  items: SerebiiItem[],
): void {
  $table.find("tr").each((_, tr) => {
    const $a = $(tr).find('td.fooinfo > a[href^="/itemdex/"]').first();
    if ($a.length === 0) return; // ヘッダ行（Picture/Name/Effect）・非該当行はスキップ
    const en = $a.text().trim();
    const desc = $(tr).find("td.fooinfo").eq(1).text();
    items.push({
      id: toId(en),
      en,
      slug: slugFromHref($a.attr("href")),
      category,
      megaStoneFor: category === "mega-stone" ? megaTargetFromDesc(desc) : null,
    });
  });
}

/**
 * 解禁持ち物ページ（items.shtml）HTML → 持ち物 roster。セクション見出し（`<u>Hold Items</u>` 等）の直後から
 * 次の見出し手前までの `table.dextable` を全て読む（1 セクションが複数表にまたがるため `.first()` では取りこぼす）。
 * id は表示名 → kebab、メガストーンのメガ先は説明セルから引く。
 */
export function parseItemsRoster(html: string): SerebiiItem[] {
  const $ = load(html);
  const items: SerebiiItem[] = [];
  $("font u").each((_, u) => {
    const category = ITEM_SECTIONS[$(u).text().trim()];
    if (!category) return; // 持ち物セクション以外の見出しは無視
    for (let $n = $(u).closest("div").next(); $n.length > 0; $n = $n.next()) {
      if ($n.is("div") && $n.find("font u").length > 0) break; // 次のセクション見出しで停止
      if ($n.is("table.dextable")) collectItemRows($, $n, category, items);
    }
  });
  return items;
}

/**
 * itemdex 個別ページ HTML → 持ち物名（id + en + ja）。en は `<title>`（`Serebii.net ItemDex - Leftovers`）、
 * ja は詳細表の「Japanese Name」列のひらがな。ヘッダ列が無ければ ja は空（schema が欠落を検出する）。
 */
export function parseItem(html: string): SerebiiItemName {
  const $ = load(html);
  const en = /ItemDex\s*-\s*(.+?)\s*$/.exec($("title").text())?.[1] ?? "";
  let ja = "";
  $("tr").each((_, tr) => {
    const headers = $(tr).children("td").toArray();
    const col = headers.findIndex((td) => $(td).text().trim() === "Japanese Name");
    if (col === -1) return;
    ja = jaFromText($(tr).next("tr").children("td").eq(col).text());
    return false; // 最初の該当ヘッダ行だけ採る
  });
  return { id: toId(en), en, ja };
}
