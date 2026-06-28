/**
 * parse-moves.ts（serebii codegen 純関数）— 技専用ページ（`attackdex-champions/<id>.shtml`）から
 * **技メタ + 日本語名 ja** を抽出する。showdown 側 `moves` と対称。Champions ページは PP を独自スケール
 * （8 / 12 / 16 / 20）で提示するため、showdown の `calculatePP` と整合する（schema が {8,12,16,20} を検証）。
 *
 * 表は先頭 `table.dextable`。type は type gif、damageClass は cat png（physical/special/other→status）、
 * PP / Base Power / Accuracy は「Power Points」ヘッダ直後の値行、priority は「Speed Priority」ヘッダ直後の
 * 値行の中央セル。ja は `<b>Japanese</b>` 行のカナ。
 */
import { type CheerioAPI, load } from "cheerio";
import { cellNumber, jaByLabel, toId, typeFromGif } from "./decode.ts";

/** 技マスター 1 件（move-specs 必須メタ + 名前）。`null` は変化技 / 可変威力 / schema 欠落（priority）。 */
export interface SerebiiMove {
  id: string;
  en: string;
  ja: string;
  type: string;
  damageClass: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number | null;
}

/** Serebii の cat 画像ファイル名 → catalog damageClass（変化技は `other` → `status`）。 */
const DAMAGE_CLASS: Readonly<Record<string, string>> = {
  physical: "physical",
  special: "special",
  other: "status",
};

/** cat 画像 `/pokedex-bw/type/<physical|special|other>.png` から damageClass を引く（未知は ""）。 */
function damageClassFromImg(src: string): string {
  const cat = /\/pokedex-bw\/type\/([a-z]+)\.png/.exec(src)?.[1] ?? "";
  return DAMAGE_CLASS[cat] ?? "";
}

/** accuracy セル: `--`（変化技）と `101`（必中）は null、それ以外は数値。 */
function accuracyNumber(text: string): number | null {
  const n = cellNumber(text);
  return n === 101 ? null : n;
}

/**
 * 技の power セル値を move-specs 規約へ写す。変化技は `0`、可変 / 固定威力技（Low Kick / Counter 等）は
 * `1` と表記されるため、いずれも `null`（威力なし）に倒す。実威力技は最小 10 以上で `0`/`1` を取らない。
 */
function movePower(raw: number | null): number | null {
  return raw !== null && raw <= 1 ? null : raw;
}

/**
 * `<b>label</b>` を含むヘッダ行の**直後の行**の各 td テキストを返す（技表は「ヘッダ行 → 値行」の 2 行 1 組）。
 * 見つからなければ空配列。値の位置は呼び出し側がインデックスで取る。
 */
function dataRowAfterHeader(
  $: CheerioAPI,
  $table: ReturnType<CheerioAPI>,
  label: string,
): string[] {
  let cells: string[] = [];
  $table.find("tr").each((_, tr) => {
    const hasLabel = $(tr)
      .children("td")
      .toArray()
      .some((td) => $(td).find("b").text().trim() === label);
    if (!hasLabel) return;
    cells = $(tr)
      .next("tr")
      .children("td")
      .toArray()
      .map((td) => $(td).text().trim());
    return false; // 最初の該当ヘッダ行だけ採る
  });
  return cells;
}

/**
 * 技専用ページ HTML → 技マスター中間表現。表示名は `<title>`（`<name> - AttackDex - Serebii.net`）から取り
 * kebab id へ。type / damageClass は先頭表の画像、PP / power / accuracy / priority は 2 段ヘッダの値行、
 * ja は `Japanese` 行のカナから取る。
 */
export function parseMove(html: string): SerebiiMove {
  const $ = load(html);
  const en = /^\s*(.+?)\s*-\s*AttackDex/.exec($("title").text())?.[1] ?? "";
  const $table = $("table.dextable").first();
  let type = "";
  let damageClass = "";
  $table.find("img").each((_, img) => {
    const src = $(img).attr("src") ?? "";
    type = type || (typeFromGif(src) ?? "");
    damageClass = damageClass || damageClassFromImg(src);
  });
  const stats = dataRowAfterHeader($, $table, "Power Points"); // [PP, Base Power, Accuracy]
  const prio = dataRowAfterHeader($, $table, "Speed Priority"); // [Crit, Speed Priority, Target]
  return {
    id: toId(en),
    en,
    ja: jaByLabel($, "Japanese"),
    type,
    damageClass,
    power: movePower(cellNumber(stats[1] ?? "")),
    accuracy: accuracyNumber(stats[2] ?? ""),
    pp: cellNumber(stats[0] ?? ""),
    priority: cellNumber(prio[1] ?? ""),
  };
}
