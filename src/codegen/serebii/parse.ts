/**
 * parse.ts（serebii codegen 純関数）— Serebii Champions ページ HTML を中間表現へ抽出する純変換。
 * 種族ページは責務別に `parseSpeciesBase`（種族値 / タイプ / 特性 / dex / 英名）/ `parseMoves`（覚える技の
 * 名前一覧のみ）/ `parseMegas`（メガ形態）へ分解し、`parseSpeciesPage` が合成する。技そのものの技メタ
 * （威力 / 命中 / PP / priority）は技専用ページ由来の `parseMoveMaster` が SoT で、種族ページからは抽出
 * しない（ADR 0037）。fetch / fs I/O は持たない（`scripts/scrape-serebii.ts` が薄く配線する）。
 *
 * 実ページ確認で判明した前提（OVERVIEW「実装指針」）:
 * - ページは latin-1 + CRLF + 超長行 → `decodeSerebiiHtml` で latin-1 デコード（HTML エンティティ展開は
 *   cheerio が担う）。
 * - 種族タイプは `img.typeimg`（base 種族のみ・alt=`Dragon-type`）で一意に取れる（技テーブルの type 画像は
 *   typeimg クラスを持たない）。
 * - 技テーブルは `<a name="attacks">` 直後の `table.dextable`（"Standard Moves" 1 表 = 覚える技 全件）。
 *   各技は 2 行（技データ行 + 効果説明行）で、データ行は技名リンク `a[href*="/attackdex-champions/"]` を持つ。
 *   `parseMoves` はこのリンクの表示名から名前一覧（name / id）だけを取り、技メタは取らない。
 * - 技専用ページ（`parseMoveMaster`）では必中技 accuracy は `101`、変化技は power/accuracy `--` → `null`、
 *   変化技 cat 画像は `other.png` → `status`。
 */
import { type CheerioAPI, load } from "cheerio";
import { normalizeItemName, toCatalogId } from "./normalize.ts";

/** 種族値（能力ポイント表記に合わせた H/A/B/C/D/S）。 */
export interface ParsedStats {
  H: number;
  A: number;
  B: number;
  C: number;
  D: number;
  S: number;
}

/**
 * 覚える技 1 件（種族ページの Standard Moves 表 = **その種族が覚える技の名前一覧のみ**）。技メタ
 * （type/damageClass/power/accuracy/pp/priority）は技専用ページ由来の `ParsedMoveMaster` が SoT で、種族
 * ページからは副産物抽出しない（ADR 0037・技メタ取得を技専用ページへ一本化）。
 */
export interface ParsedMove {
  name: string;
  id: string;
}

/**
 * 技マスター 1 件（技専用ページ `attackdex-champions/<slug>.shtml` 由来）。種族ページ副産物（`ParsedMove`）と
 * 違い `priority` を持ち、技メタ全項目（move-specs 必須）を一次ソースから取る。`priority === null` は Speed
 * Priority 行が取れない（schema 欠落）。変化技は power / accuracy が null、可変威力技も power は null。
 */
export interface ParsedMoveMaster {
  name: string;
  id: string;
  type: string;
  damageClass: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number | null;
}

/** メガフォルム 1 件（種族値 / タイプ / 特性。技は base と共有のため持たない）。 */
export interface ParsedMega {
  name: string;
  types: string[];
  abilities: string[];
  stats: ParsedStats;
  statTotal: number | null;
}

/**
 * 種族 base 情報（種族値・タイプ・特性・en・dex）。メガ / 技を含まない base 種族の構造。
 * `statTotal === null` は Base Stats 行が無い（schema 欠落）。
 */
export interface ParsedSpeciesBase {
  en: string;
  dex: number | null;
  types: string[];
  abilities: string[];
  stats: ParsedStats;
  statTotal: number | null;
}

/** 種族ページ全体の中間表現（base 情報 + 覚える技の名前一覧 + メガ形態）。 */
export interface ParsedSpecies extends ParsedSpeciesBase {
  moves: ParsedMove[];
  megas: ParsedMega[];
}

/** 解禁持ち物のカテゴリ（items.shtml のセクション区分）。 */
export type ItemCategory = "hold" | "berry" | "mega-stone";

/**
 * 解禁持ち物 1 件（items.shtml の 1 行）。`slug` は Serebii 圧縮 slug（itemdex href 由来・診断 / クロス
 * チェック用）、`id` は catalog id（表示名 → kebab）。`megaStoneFor` はメガストーンのメガ先 base 種族 id
 * （説明文 "A Charizard holding this stone…" 由来）で、メガストーン以外は null。
 */
export interface ParsedItem {
  name: string;
  id: string;
  slug: string;
  category: ItemCategory;
  megaStoneFor: string | null;
}

/** items.shtml 全体の中間表現（Hold Items / Mega Stone / Berries の全行）。 */
export interface ParsedItems {
  items: ParsedItem[];
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

/** items.shtml のセクション見出し（`<u>…</u>`）→ カテゴリ。未知見出しは持ち物表ではないため無視する。 */
const ITEM_SECTIONS: Readonly<Record<string, ItemCategory>> = {
  "Hold Items": "hold",
  "Mega Stone": "mega-stone",
  Berries: "berry",
};

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

/**
 * base 種族スコープ（最初のメガアンカー手前まで）を cheerio へ読み込む。メガの特性 / 種族値を base が
 * 拾わないよう、`<a name="mega"` の手前で切り出す（メガは全文から `parseMegas` が抽出する）。
 */
function baseScope(html: string): CheerioAPI {
  const cut = html.indexOf('<a name="mega"');
  return load(cut === -1 ? html : html.slice(0, cut));
}

/**
 * Standard Moves テーブル（`a[name="attacks"]` 直後）から「その種族が覚える技の名前一覧」だけを抽出する。
 * 技メタ（type/damageClass/power/accuracy/pp）の副産物抽出は除去し、技メタは技専用ページ由来の
 * `parseMoveMaster` を SoT とする（ADR 0037）。
 */
export function parseMoves(html: string): ParsedMove[] {
  const $ = baseScope(html);
  const moves: ParsedMove[] = [];
  const $table = $("a[name='attacks']").nextAll("table.dextable").first();
  $table.find("tr").each((_, tr) => {
    const $link = $(tr).children("td").first().find("a[href*='/attackdex-champions/']");
    if ($link.length === 0) return; // 効果説明行・ヘッダ行はスキップ
    const name = $link.first().text().trim();
    moves.push({ name, id: toCatalogId(name) });
  });
  return moves;
}

/** メガセクション（`a[name="mega"]` 直後）を各フォルムへ抽出する。技は base と共有のため持たない。 */
export function parseMegas(html: string): ParsedMega[] {
  const $ = load(html);
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

/**
 * base 種族情報（種族値 / タイプ / 特性 / en / dex）を抽出する。メガの特性 / 種族値を拾わないよう
 * `baseScope` でメガ手前まで切り出してから読む（メガは `parseMegas` が全文から抽出する）。
 */
export function parseSpeciesBase(html: string): ParsedSpeciesBase {
  const $base = baseScope(html);
  const titleMatch = /^\s*(.+?)\s*-\s*#(\d+)\s*-/.exec($base("title").text());
  const en = titleMatch?.[1] ?? "";
  const dex = titleMatch ? Number(titleMatch[2]) : null;
  const types: string[] = [];
  $base("img.typeimg").each((_, img) => {
    const t = ($base(img).attr("alt") ?? "").replace(/-type$/i, "").toLowerCase();
    if (VALID_TYPES.has(t) && !types.includes(t)) types.push(t);
  });
  const { stats, statTotal } = statsIn($base);
  return { en, dex, types, abilities: abilitiesIn($base), stats, statTotal };
}

/**
 * メガストーン説明文（`One of a variety of mysterious Mega Stones. A Charizard holding this stone…`）から
 * メガ先 base 種族名を取り出し catalog id へ正規化する。items.shtml はメガ先への**リンクを持たない**ため、
 * 種族名は説明文（`A(n) [special] <Species> holding this`）からのみ得られる。取れなければ null。
 */
function megaTargetFromDesc(desc: string): string | null {
  const species = /\bAn? (?:special )?([A-Z][a-zA-Z]+) holding this/.exec(desc)?.[1];
  return species === undefined ? null : toCatalogId(species);
}

/** itemdex href（`/itemdex/<slug>.shtml`）から Serebii item slug を取り出す。slug 文字が無ければ ""。 */
export function slugFromHref(href: string | undefined): string {
  return /\/itemdex\/([a-z0-9-]+)\.shtml/.exec(href ?? "")?.[1] ?? "";
}

/** 1 つの `table.dextable` の各行から持ち物を抽出して `items` へ push する（ヘッダ行・非該当行はスキップ）。 */
function collectItemRows(
  $: CheerioAPI,
  $table: ReturnType<CheerioAPI>,
  category: ItemCategory,
  items: ParsedItem[],
): void {
  $table.find("tr").each((_, tr) => {
    const $a = $(tr).find('td.fooinfo > a[href^="/itemdex/"]').first();
    if ($a.length === 0) return; // ヘッダ行（Picture/Name/Effect）・非該当行はスキップ
    const name = $a.text().trim();
    const slug = slugFromHref($a.attr("href"));
    const desc = $(tr).find("td.fooinfo").eq(1).text();
    items.push({
      name,
      id: normalizeItemName(name),
      slug,
      category,
      megaStoneFor: category === "mega-stone" ? megaTargetFromDesc(desc) : null,
    });
  });
}

/**
 * 解禁持ち物ページ（items.shtml）HTML → 中間表現。セクション見出し（`<u>Hold Items</u>` 等）の直後から、
 * **次のセクション見出しの手前まで**の `table.dextable` を全て読む（Berries は 2 表に分割される等、1 セクションが
 * 複数表にまたがるため `.first()` では取りこぼす）。item slug は名前セル `td.fooinfo > a[href^="/itemdex/"]` から
 * 取り、表示名を catalog id へ正規化する。メガストーンのメガ先は説明セル（2 番目の `td.fooinfo`）から引く。
 */
export function parseItemsPage(html: string): ParsedItems {
  const $ = load(html);
  const items: ParsedItem[] = [];
  $("font u").each((_, u) => {
    const category = ITEM_SECTIONS[$(u).text().trim()];
    if (!category) return; // 持ち物セクション以外の見出しは無視
    for (let $n = $(u).closest("div").next(); $n.length > 0; $n = $n.next()) {
      if ($n.is("div") && $n.find("font u").length > 0) break; // 次のセクション見出しで停止
      if ($n.is("table.dextable")) collectItemRows($, $n, category, items);
    }
  });
  return { items };
}

/** cat 画像 `/pokedex-bw/type/<physical|special|other>.png` から damageClass を引く（未知は ""）。 */
function damageClassFromImg(src: string): string {
  const cat = /\/pokedex-bw\/type\/([a-z]+)\.png/.exec(src)?.[1] ?? "";
  return DAMAGE_CLASS[cat] ?? "";
}

/**
 * `<b>label</b>` を含むヘッダ行の**直後の行**の各 td テキストを返す（技マスター表は「ヘッダ行 → 値行」の
 * 2 行 1 組）。見つからなければ空配列。値の位置は呼び出し側がインデックスで取る。
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
 * 技マスターの power セル値を move-specs 規約へ写す。変化技は Serebii で `0`、可変 / 固定威力技（Low Kick /
 * Grass Knot / Counter / Night Shade 等）は `1` と表記されるため、いずれも `null`（威力なし）に倒す。実威力を
 * 持つ技は最小でも 10 以上で `0` / `1` を取らないため、`<= 1` を null 判定にしても実値を潰さない。
 */
function movePower(raw: number | null): number | null {
  return raw !== null && raw <= 1 ? null : raw;
}

/**
 * 技専用ページ（attackdex-champions）HTML → 技マスター中間表現。先頭の `table.dextable`（属性付きでも
 * cheerio の class セレクタで一意）が技情報表で、「Power Points / Base Power / Accuracy」「Base Critical Hit
 * Rate / Speed Priority / Pokémon Hit in Battle」の 2 段ヘッダ + 値行で構成される。表示名は `<title>`
 * （`<name> - AttackDex - Serebii.net`）から取り catalog id へ kebab 化する（圧縮 slug は復元不能なため）。
 */
export function parseMoveMaster(html: string): ParsedMoveMaster {
  const $ = load(html);
  const name = /^\s*(.+?)\s*-\s*AttackDex/.exec($("title").text())?.[1] ?? "";
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
    name,
    id: toCatalogId(name),
    type,
    damageClass,
    power: movePower(cellNumber(stats[1] ?? "")),
    accuracy: accuracyNumber(stats[2] ?? ""),
    pp: cellNumber(stats[0] ?? ""),
    priority: cellNumber(prio[1] ?? ""),
  };
}

/**
 * 種族ページ HTML → 中間表現。責務別に分解した `parseSpeciesBase`（base 情報）/ `parseMoves`（覚える技の
 * 名前一覧）/ `parseMegas`（メガ形態）を合成する薄い入口。値の妥当性検証は `schema.ts` に委ねる。
 */
export function parseSpeciesPage(html: string): ParsedSpecies {
  return { ...parseSpeciesBase(html), moves: parseMoves(html), megas: parseMegas(html) };
}
