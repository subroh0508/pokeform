/**
 * parse.ts（serebii codegen 純関数）— Serebii Champions 種族ページ HTML を中間表現へ抽出する純変換。
 * cheerio で DOM を読み、種族値 / タイプ / 特性 / dex / 英名 / 使用可能技（Standard Moves 全行）/ メガ
 * セクションを取り出す。fetch / fs I/O は持たない（`scripts/scrape-serebii.ts` が薄く配線する）。
 *
 * 実ページ確認で判明した前提（OVERVIEW「実装指針」）:
 * - ページは latin-1 + CRLF + 超長行 → `decodeSerebiiHtml` で latin-1 デコード（HTML エンティティ展開は
 *   cheerio が担う）。
 * - 種族タイプは `img.typeimg`（base 種族のみ・alt=`Dragon-type`）で一意に取れる（技テーブルの type 画像は
 *   typeimg クラスを持たない）。
 * - 技テーブルは `<a name="attacks">` 直後の `table.dextable`（"Standard Moves" 1 表 = 使用可能技 全件）。
 *   各技は 2 行（技データ行 + 効果説明行）で、データ行は技名リンク `a[href*="/attackdex-champions/"]` を持つ。
 * - 必中技 accuracy は `101`、変化技は power/accuracy `--` → `null`。変化技 cat 画像は `other.png` → `status`。
 */
import { type CheerioAPI, load } from "cheerio";
import { toCatalogId } from "./normalize.ts";

/** 種族値（能力ポイント表記に合わせた H/A/B/C/D/S）。 */
export interface ParsedStats {
  H: number;
  A: number;
  B: number;
  C: number;
  D: number;
  S: number;
}

/** 使用可能技 1 件（name=表示名 / id=catalog id・power/accuracy/pp は変化技や必中で null）。 */
export interface ParsedMove {
  name: string;
  id: string;
  type: string;
  damageClass: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
}

/** メガフォルム 1 件（種族値 / タイプ / 特性。技は base と共有のため持たない）。 */
export interface ParsedMega {
  name: string;
  types: string[];
  abilities: string[];
  stats: ParsedStats;
  statTotal: number | null;
}

/** 種族ページ全体の中間表現。`statTotal === null` は Base Stats 行が無い（schema 欠落）。 */
export interface ParsedSpecies {
  en: string;
  dex: number | null;
  types: string[];
  abilities: string[];
  stats: ParsedStats;
  statTotal: number | null;
  moves: ParsedMove[];
  megas: ParsedMega[];
}

/** 18 タイプ id（ゲーム不変の定数。type 画像 src の素性確認に使う）。 */
const VALID_TYPES: ReadonlySet<string> = new Set([
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
]);

/** Serebii の cat 画像ファイル名 → catalog damageClass（変化技は `other` → `status`）。 */
const DAMAGE_CLASS: Readonly<Record<string, string>> = {
  physical: "physical",
  special: "special",
  other: "status",
};

/** latin-1（ISO-8859-1）バイト列を文字列へデコードする（Serebii は latin-1 + CRLF）。 */
export function decodeSerebiiHtml(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += String.fromCharCode(b);
  return out;
}

/** `60` / `--` / `101` 等のセル文字列を数値へ。`--` は null。 */
function cellNumber(text: string): number | null {
  const t = text.trim();
  if (t === "--" || t === "") return null;
  const n = Number.parseInt(t, 10);
  return Number.isNaN(n) ? null : n;
}

/** accuracy セル: `--`（変化技）と `101`（必中）は null、それ以外は数値。 */
function accuracyNumber(text: string): number | null {
  const n = cellNumber(text);
  return n === 101 ? null : n;
}

/** `/pokedex-bw/type/<type>.gif` から type id を取り出す（VALID_TYPES のみ）。 */
function typeFromGif(src: string): string | null {
  const t = /\/pokedex-bw\/type\/([a-z]+)\.gif/.exec(src)?.[1];
  return t && VALID_TYPES.has(t) ? t : null;
}

/** scope 内の type 画像（gif）から種族タイプを重複なしの出現順で集める。 */
function typesFromGifs($: CheerioAPI): string[] {
  const types: string[] = [];
  $("img").each((_, img) => {
    const t = typeFromGif($(img).attr("src") ?? "");
    if (t && !types.includes(t)) types.push(t);
  });
  return types;
}

/** scope 内の `Abilities:` ブロックから特性名を catalog id へ正規化して集める。 */
function abilitiesIn($: CheerioAPI): string[] {
  const ids: string[] = [];
  $("td").each((_, td) => {
    const $td = $(td);
    if (!/Abilities/.test($td.find("b").first().text())) return;
    $td.find("a[href*='/abilitydex/'] b").each((__, b) => {
      const id = toCatalogId($(b).text());
      if (id && !ids.includes(id)) ids.push(id);
    });
  });
  return ids;
}

/** scope 内の最初の "Base Stats - Total: N" 行から Total と H/A/B/C/D/S を読む。無ければ null。 */
function statsIn($: CheerioAPI): { stats: ParsedStats; statTotal: number | null } {
  const stats: ParsedStats = { H: 0, A: 0, B: 0, C: 0, D: 0, S: 0 };
  let statTotal: number | null = null;
  $("tr").each((_, tr) => {
    const $tr = $(tr);
    const m = /Base Stats - Total:\s*(\d+)/.exec($tr.find("td").first().text());
    if (!m) return; // ヘッダ等の非該当行は読み飛ばす
    statTotal = Number(m[1]); // m[1] は \d+（マッチ済み）。Number は undefined も受けるため添字検査を満たす
    // 先頭の "Total" セルも class="fooinfo" なので落とし、続く 6 セルを H/A/B/C/D/S に充てる。
    const cells = $tr.find("td.fooinfo").slice(1);
    const keys: (keyof ParsedStats)[] = ["H", "A", "B", "C", "D", "S"];
    keys.forEach((k, i) => {
      stats[k] = cellNumber($(cells[i]).text()) ?? 0;
    });
    return false; // 最初の Base Stats 行だけ採り、以降は走査しない
  });
  return { stats, statTotal };
}

/** Standard Moves テーブル（`a[name="attacks"]` 直後）の全技行を抽出する。 */
function movesIn($: CheerioAPI): ParsedMove[] {
  const moves: ParsedMove[] = [];
  const $table = $("a[name='attacks']").nextAll("table.dextable").first();
  $table.find("tr").each((_, tr) => {
    const $cells = $(tr).children("td");
    const $link = $cells.first().find("a[href*='/attackdex-champions/']");
    if ($link.length === 0) return; // 効果説明行・ヘッダ行はスキップ
    const name = $link.first().text().trim();
    const catSrc = $($cells[2]).find("img").attr("src") ?? "";
    const catName = /\/pokedex-bw\/type\/([a-z]+)\.(?:png|gif)/.exec(catSrc)?.[1] ?? "";
    moves.push({
      name,
      id: toCatalogId(name),
      type: typeFromGif($($cells[1]).find("img").attr("src") ?? "") ?? "",
      damageClass: DAMAGE_CLASS[catName] ?? "",
      power: cellNumber($($cells[3]).text()),
      accuracy: accuracyNumber($($cells[4]).text()),
      pp: cellNumber($($cells[5]).text()),
    });
  });
  return moves;
}

/** メガセクション（`a[name="mega"]` 直後）を各フォルムへ抽出する。技は base と共有のため持たない。 */
function megasIn($: CheerioAPI): ParsedMega[] {
  const megas: ParsedMega[] = [];
  $("a[name='mega']").each((_, anchor) => {
    const section = $(anchor).nextUntil("a[name='mega'], a[name='attacks']");
    const sub = load(`<div>${$.html(section)}</div>`);
    const name = sub("h3").first().text().trim();
    const { stats, statTotal } = statsIn(sub);
    megas.push({ name, types: typesFromGifs(sub), abilities: abilitiesIn(sub), stats, statTotal });
  });
  return megas;
}

/** 種族ページ HTML → 中間表現。値の妥当性検証は `schema.ts` に委ねる（本関数は抽出に専念）。 */
export function parseSpeciesPage(html: string): ParsedSpecies {
  // base 種族の欄（タイプ / 特性 / 種族値 / 技）はメガセクションより前にある。メガの特性 / 種族値を
  // base が拾わないよう、最初のメガアンカー手前までを base スコープとして切り出す（メガは全文から抽出）。
  const cut = html.indexOf('<a name="mega"');
  const $base = load(cut === -1 ? html : html.slice(0, cut));
  const titleMatch = /^\s*(.+?)\s*-\s*#(\d+)\s*-/.exec($base("title").text());
  const en = titleMatch?.[1] ?? "";
  const dex = titleMatch ? Number(titleMatch[2]) : null;
  const types: string[] = [];
  $base("img.typeimg").each((_, img) => {
    const t = ($base(img).attr("alt") ?? "").replace(/-type$/i, "").toLowerCase();
    if (VALID_TYPES.has(t) && !types.includes(t)) types.push(t);
  });
  const { stats, statTotal } = statsIn($base);
  return {
    en,
    dex,
    types,
    abilities: abilitiesIn($base),
    stats,
    statTotal,
    moves: movesIn($base),
    megas: megasIn(load(html)),
  };
}
