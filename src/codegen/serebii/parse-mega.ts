/**
 * parse-mega.ts（serebii codegen 純関数）— 種族ページ（`pokedex-champions/<id>`）のメガセクション
 * （`<a name="mega">` 以降）からメガ形態の構造 / linking を抽出する。showdown 側 `mega` と対称。
 *
 * メガ id は Serebii 表示名（`Mega Charizard X`）ではなく **showdown と同じ語順の kebab**
 * （`charizard-mega-x`）へ正規化する（両経路を同一 SoT id へ収束させる）。base 種族 id は種族ページ
 * `<title>` 由来。メガセクションのタイプは type gif、特性は abilitydex リンク、種族値は Base Stats 行。
 */
import { load } from "cheerio";
import {
  abilitiesIn,
  jaFromText,
  type SerebiiStats,
  statsIn,
  toId,
  typesFromGifs,
} from "./decode.ts";

/** メガ形態 1 件の中間表現（技は base と共有のため持たない）。 */
export interface SerebiiMega {
  id: string;
  en: string;
  ja: string;
  baseSpecies: string;
  types: string[];
  ability: string;
  stats: SerebiiStats;
  statTotal: number | null;
}

/** 種族ページ `<title>`（`Charizard - #006 - …`）から base 種族の英名を取る。 */
function baseEnOf(html: string): string {
  return /^\s*(.+?)\s*-\s*#\d+\s*-/.exec(load(html)("title").text())?.[1] ?? "";
}

/**
 * Serebii メガ表示名 → showdown 語順の kebab id。`Mega <Base> [Branch]` は `<base>-mega[-branch]`、
 * `Primal <Base>` は `<base>-primal` へ写す。未知形（接頭辞無し）は素直に kebab（schema 健全性で escalation）。
 */
export function megaIdFor(baseEn: string, name: string): string {
  const base = toId(baseEn);
  const rest = /^Mega\s+(.*)$/i.exec(name)?.[1];
  if (rest !== undefined) {
    const branch = rest.toLowerCase().startsWith(baseEn.toLowerCase())
      ? rest.slice(baseEn.length).trim()
      : rest;
    return branch ? `${base}-mega-${toId(branch)}` : `${base}-mega`;
  }
  if (/^Primal\s+/i.test(name)) return `${base}-primal`;
  return toId(name);
}

/**
 * 種族ページ HTML → メガ形態中間表現の配列。`<a name="mega">` ごとに、次のメガ / 技アンカー手前までを
 * セクションとして切り出し、h3（メガ名）/ 種族値 / タイプ / 特性 / ja を読む。メガが無ければ空配列。
 */
export function parseMega(html: string): SerebiiMega[] {
  const $ = load(html);
  const baseEn = baseEnOf(html);
  const base = toId(baseEn);
  const megas: SerebiiMega[] = [];
  $("a[name='mega']").each((_, anchor) => {
    const section = $(anchor).nextUntil("a[name='mega'], a[name='attacks']");
    const sub = load(`<div>${$.html(section)}</div>`);
    const en = sub("h3").first().text().trim();
    const { stats, statTotal } = statsIn(sub);
    const abilities = abilitiesIn(sub);
    megas.push({
      id: megaIdFor(baseEn, en),
      en,
      ja: jaFromText(sub("h3").first().text()),
      baseSpecies: base,
      types: typesFromGifs(sub),
      ability: abilities[0] ?? "",
      stats,
      statTotal,
    });
  });
  return megas;
}
