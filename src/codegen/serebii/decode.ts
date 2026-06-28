/**
 * decode.ts（serebii codegen 共有純関数）— 速報スクレイパー各 `parse-*` が共有する低レベル変換。
 *
 * Serebii Champions ページは **latin-1（ISO-8859-1）+ CRLF + 超長行**で、日本語名は**数値文字参照**
 * （`&#12522;&#12470;…` = リザードン）で埋め込まれる。本モジュールは (1) latin-1 デコード、(2) 表示名 →
 * 安定 kebab id、(3) 数値文字参照デコード後テキストからの日本語名抽出（速報経路の新責務）、(4) タイプ /
 * 種族値 / 特性の DOM 抽出ヘルパ（種族ページ・メガセクション共有）を担う。fs / fetch I/O は持たない
 * （`scripts/scrape-serebii.ts` が薄く配線する）。
 */
import type { CheerioAPI } from "cheerio";

/** 能力ポイント表記の種族値テーブル（H/A/B/C/D/S・showdown 側 `StatsTable` と同形）。 */
export interface SerebiiStats {
  H: number;
  A: number;
  B: number;
  C: number;
  D: number;
  S: number;
}

/** 18 タイプ id（ゲーム不変の定数。type 画像 alt / gif の素性確認に使う）。 */
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

/** 日本語名に現れる文字レンジ（ひらがな / カタカナ / 半角カナ / CJK 漢字 / 長音符）。 */
const JA_RUN = /[\u3040-\u30FF\u3400-\u9FFF\uFF66-\uFF9F]+/g;

/** latin-1（ISO-8859-1）バイト列を文字列へデコードする（Serebii は latin-1 + CRLF）。 */
export function decodeSerebiiHtml(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += String.fromCharCode(b);
  return out;
}

/**
 * 表示名 → 安定 kebab id。小文字化し、アポストロフィ（'・’）/ ピリオドは**除去**（`Forest's Curse`
 * → `forests-curse`）、残る非英数字の連続を単一ハイフンへ畳み、前後のハイフンを落とす。showdown 側
 * `kebabId` と同一規則（両経路で同じ id へ収束させる）。
 */
export function toId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/['.’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * cheerio デコード済みテキストから日本語名を抽出する。Serebii は「ローマ字 + 日本語」（`Lizardon
 * リザードン`）や記号混じりで提示するため、日本語文字レンジの連続のみを取り出して連結する
 * （ローマ字・コロン・改行を捨てる）。日本語が無ければ空文字。
 */
export function jaFromText(text: string): string {
  return (text.match(JA_RUN) ?? []).join("");
}

/**
 * `<b>label</b>` を含む行（`<b>Japan</b>: </td><td>Lizardon<br/>リザードン`）の最後の td から日本語名を
 * 取り出す。種族ページの `Japan` 行・技ページの `Japanese` 行が同形（ラベル + ローマ字 + カナ）のため共有。
 * 該当行が無ければ空文字。
 */
export function jaByLabel($: CheerioAPI, label: string): string {
  let ja = "";
  $("b").each((_, b) => {
    if ($(b).text().trim() !== label) return;
    ja = jaFromText($(b).closest("tr").find("td").last().text());
    return false; // 最初の該当行だけ採る
  });
  return ja;
}

/** `/pokedex-bw/type/<type>.gif` から type id を取り出す（VALID_TYPES のみ・技ページ用）。 */
export function typeFromGif(src: string): string | null {
  const t = /\/pokedex-bw\/type\/([a-z]+)\.gif/.exec(src)?.[1];
  return t && VALID_TYPES.has(t) ? t : null;
}

/** scope 内の type gif（`/pokedex-bw/type/<t>.gif`）から種族タイプを重複なしの出現順で集める（メガ用）。 */
export function typesFromGifs($: CheerioAPI): string[] {
  const types: string[] = [];
  $("img").each((_, img) => {
    const t = typeFromGif($(img).attr("src") ?? "");
    if (t && !types.includes(t)) types.push(t);
  });
  return types;
}

/** scope 内の `img.typeimg`（alt=`Fire-type`）から種族タイプを重複なしの出現順で集める。 */
export function typesFromImgAlt($: CheerioAPI): string[] {
  const types: string[] = [];
  $("img.typeimg").each((_, img) => {
    const t = ($(img).attr("alt") ?? "").replace(/-type$/i, "").toLowerCase();
    if (VALID_TYPES.has(t) && !types.includes(t)) types.push(t);
  });
  return types;
}

/** scope 内の `Abilities:` ブロックから特性名を kebab id へ正規化して集める。 */
export function abilitiesIn($: CheerioAPI): string[] {
  const ids: string[] = [];
  $("td").each((_, td) => {
    const $td = $(td);
    if (!/Abilit/.test($td.find("b").first().text())) return;
    $td.find("a[href*='/abilitydex/'] b").each((__, b) => {
      const id = toId($(b).text());
      if (id && !ids.includes(id)) ids.push(id);
    });
  });
  return ids;
}

/** `60` / `--` / 空のセル文字列を数値へ。`--` / 空は null。 */
export function cellNumber(text: string): number | null {
  const t = text.trim();
  if (t === "--" || t === "") return null;
  const n = Number.parseInt(t, 10);
  return Number.isNaN(n) ? null : n;
}

/** scope 内の最初の "Base Stats - Total: N" 行から Total と H/A/B/C/D/S を読む。無ければ statTotal=null。 */
export function statsIn($: CheerioAPI): { stats: SerebiiStats; statTotal: number | null } {
  const stats: SerebiiStats = { H: 0, A: 0, B: 0, C: 0, D: 0, S: 0 };
  let statTotal: number | null = null;
  $("tr").each((_, tr) => {
    const $tr = $(tr);
    const m = /Base Stats - Total:\s*(\d+)/.exec($tr.find("td").first().text());
    if (!m) return; // ヘッダ等の非該当行は読み飛ばす
    statTotal = Number(m[1]);
    const cells = $tr.find("td.fooinfo").slice(1); // 先頭 "Total" セルを落とし 6 値を取る
    const keys: (keyof SerebiiStats)[] = ["H", "A", "B", "C", "D", "S"];
    keys.forEach((k, i) => {
      stats[k] = cellNumber($(cells[i]).text()) ?? 0;
    });
    return false; // 最初の Base Stats 行だけ採る
  });
  return { stats, statTotal };
}
