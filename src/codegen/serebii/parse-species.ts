/**
 * parse-species.ts（serebii codegen 純関数）— Serebii Champions の**種族データセット**を抽出する。
 * showdown 側 `species`（roster + 構造 + learnset）と対称に、解禁 roster（`pokemonchampions/pokemon.shtml`）
 * と種族ページ（`pokedex-champions/<id>`: 構造 / 覚える技 / 日本語名 ja）を担う。メガセクションは
 * `parse-mega.ts` が同じ種族ページ HTML から抽出する（責務分離）。
 *
 * 速報経路の新責務は **ja 抽出**（`Other Names` の `Japan` 行のカタカナ）。技メタ（威力 / PP 等）は
 * 技専用ページ由来の `parse-moves.ts` が SoT で、種族ページからは覚える技の id 一覧のみ取る。
 */
import { type CheerioAPI, load } from "cheerio";
import {
  abilitiesIn,
  jaByLabel,
  type SerebiiStats,
  statsIn,
  toId,
  typesFromImgAlt,
} from "./decode.ts";

/** 種族ページの中間表現（roster は別途 `parseRoster`・メガは `parse-mega`）。 */
export interface SerebiiSpecies {
  id: string;
  en: string;
  ja: string;
  dex: number | null;
  types: string[];
  abilities: string[];
  stats: SerebiiStats;
  statTotal: number | null;
  moves: string[];
}

/**
 * base 種族スコープ（最初のメガアンカー手前まで）を cheerio へ読み込む。メガの特性 / 種族値 / ja を
 * base が拾わないよう `<a name="mega"` 手前で切る（メガは `parse-mega` が全文から抽出する）。
 */
export function baseScope(html: string): CheerioAPI {
  const cut = html.indexOf('<a name="mega"');
  return load(cut === -1 ? html : html.slice(0, cut));
}

/**
 * 覚える技の id 一覧を抽出する（Standard Moves テーブル = `a[name="attacks"]` 直後の `table.dextable`）。
 * 各技行は技名リンク `a[href*="/attackdex-champions/"]` を持つ。技メタは取らない（`parse-moves` が SoT）。
 * id は表示名 → kebab（圧縮 slug は復元不能なため・id 昇順で返す）。
 */
export function parseLearnset(html: string): string[] {
  const $ = baseScope(html);
  const ids: string[] = [];
  const $table = $("a[name='attacks']").nextAll("table.dextable").first();
  $table.find("tr").each((_, tr) => {
    const $link = $(tr).children("td").first().find("a[href*='/attackdex-champions/']");
    if ($link.length === 0) return; // 効果説明行・ヘッダ行はスキップ
    const id = toId($link.first().text());
    if (id && !ids.includes(id)) ids.push(id);
  });
  return ids.sort((a, b) => a.localeCompare(b));
}

/**
 * 種族ページ HTML → 種族中間表現。en / dex は `<title>`（`Charizard - #006 - …`）、ja は Other Names、
 * types / abilities / stats はメガ手前の base スコープ、moves は学習技テーブルから取る。
 */
export function parseSpecies(html: string): SerebiiSpecies {
  const $base = baseScope(html);
  const titleMatch = /^\s*(.+?)\s*-\s*#(\d+)\s*-/.exec($base("title").text());
  const en = titleMatch?.[1] ?? "";
  const dex = titleMatch ? Number(titleMatch[2]) : null;
  const { stats, statTotal } = statsIn($base);
  return {
    id: toId(en),
    en,
    ja: jaByLabel($base, "Japan"),
    dex,
    types: typesFromImgAlt($base),
    abilities: abilitiesIn($base),
    stats,
    statTotal,
    moves: parseLearnset(html),
  };
}

/**
 * 解禁種族一覧ページ（`pokemonchampions/pokemon.shtml`）→ 解禁 roster の種族 id 配列。各種族は
 * 種族ページへのリンク `a[href^="/pokedex-champions/<slug>/"]` を持つ。slug をそのまま id 採用（圧縮されて
 * いない kebab）。重複を除き id 昇順で返す。
 */
export function parseRoster(html: string): string[] {
  const $ = load(html);
  const ids: string[] = [];
  $("a").each((_, a) => {
    const slug = /\/pokedex-champions\/([a-z0-9-]+)\//.exec($(a).attr("href") ?? "")?.[1];
    if (slug && !ids.includes(slug)) ids.push(slug);
  });
  return ids.sort((a, b) => a.localeCompare(b));
}
