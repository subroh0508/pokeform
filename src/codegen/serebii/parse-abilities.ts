/**
 * parse-abilities.ts（serebii codegen 純関数）— 特性ページ（`abilitydex/<id>.shtml`）から特性の
 * **英名 en + 日本語名 ja** を抽出する。showdown 側 `abilities` と対称（特性は構造データを持たず名前のみ）。
 *
 * ページ先頭の詳細表が「Name | Jp. Name」ヘッダ + 値行（`<td>Blaze</td><td>Blaze<br/>もうか</td>`）を持つ。
 * en は Name セル、ja は Jp. Name セルのカナ。id は en → kebab。
 */
import { load } from "cheerio";
import { jaFromText, toId } from "./decode.ts";

/** 特性 1 件（id + 名前のみ）。 */
export interface SerebiiAbility {
  id: string;
  en: string;
  ja: string;
}

/**
 * 特性ページ HTML → 特性中間表現。「Jp. Name」ヘッダセルを含む行の**直後の行**から en（先頭セル）と
 * ja（2 セル目のカナ）を取る。ヘッダ / 値行が無ければ en / ja は空（schema が欠落を検出する）。
 */
export function parseAbility(html: string): SerebiiAbility {
  const $ = load(html);
  let en = "";
  let ja = "";
  $("tr").each((_, tr) => {
    const isHeader = $(tr)
      .children("td")
      .toArray()
      .some((td) => $(td).text().trim() === "Jp. Name");
    if (!isHeader) return;
    const cells = $(tr).next("tr").children("td");
    en = cells.eq(0).text().trim();
    ja = jaFromText(cells.eq(1).text());
    return false; // 最初の該当ヘッダ行だけ採る
  });
  return { id: toId(en), en, ja };
}
