/**
 * to-catalog.ts（serebii codegen 純関数）— Serebii 中間表現（`ParsedSpecies` / `ParsedItem`・
 * `scrape-serebii` の中間 JSON 由来）を catalog / regulation YAML への**転記材料**へ変換する純関数。
 * fs / YAML I/O は `scripts/serebii-to-catalog.ts`（薄い orchestrator・coverage 除外）が担う。
 *
 * 役割分担（層分離・本 phase の ADR）:
 * - **Serebii 由来（本関数が組む）**: エンティティ key の存在・技メタ（type/damageClass/power/accuracy/pp）・
 *   メガストーンのメガ先・per-reg 解禁（per-species `moves` / 予約 `items`）。
 * - **PokeAPI 由来（`materialize` が後段で埋める）**: 日英名 ja（全種別）・構造データ（dex/types/stats/
 *   abilities/category）・特性の en。本関数は名前欄を**空で残す**（未設定欄を materialize が PokeAPI names /
 *   raw から append/既存尊重で補完する・ADR 0027 / 本 phase の ja 取得元 ADR）。
 *
 * append/既存尊重は `planFields`（`../materialize.ts`）を呼び出し側が再利用する。本関数は「fresh な転記値」を
 * 組むことに専念し、既存値との突き合わせ・conflict 判定は持たない（純変換）。
 */
import type { ParsedItem, ParsedMove, ParsedSpecies } from "./parse.ts";

/**
 * moves.yaml の Serebii 由来欄（技メタ）。`en` は Serebii 表示名、`priority` は Serebii の Standard Moves
 * 表に列が無いため `0` 既定（実値は skill-authored で上書き＝materialize の append/既存尊重で保護）。`ja` は
 * 持たない（materialize が PokeAPI move names で補完）。
 */
export interface MoveCatalogFields {
  en: string;
  type: string;
  damageClass: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
}

/** `ParsedMove` → moves.yaml 転記欄（Serebii 由来の技メタ・ja は持たない）。 */
export function moveCatalogFields(m: ParsedMove): MoveCatalogFields {
  return {
    en: m.name,
    type: m.type,
    damageClass: m.damageClass,
    power: m.power,
    accuracy: m.accuracy,
    pp: m.pp,
    priority: 0,
  };
}

/** species.yaml の Serebii 由来欄（en のみ。ja / dex / types / stats / abilities は materialize が埋める）。 */
export interface SpeciesCatalogFields {
  en: string;
}

/** `ParsedSpecies` → species.yaml 転記欄（Serebii 表示名のみ）。 */
export function speciesCatalogFields(p: ParsedSpecies): SpeciesCatalogFields {
  return { en: p.en };
}

/** items.yaml の Serebii 由来欄（en + メガストーンのメガ先。ja / category は materialize が埋める）。 */
export interface ItemCatalogFields {
  en: string;
  megaStoneFor?: string;
}

/** `ParsedItem` → items.yaml 転記欄（メガストーンのみ `megaStoneFor` を持つ）。 */
export function itemCatalogFields(it: ParsedItem): ItemCatalogFields {
  return it.megaStoneFor === null
    ? { en: it.name }
    : { en: it.name, megaStoneFor: it.megaStoneFor };
}

/** 種族の特性 id（abilities.yaml に key を確保する対象。ja は materialize が補完）。 */
export function abilityIds(p: ParsedSpecies): string[] {
  return [...new Set(p.abilities)];
}

/**
 * ability id（kebab）→ 表示英名（`rough-skin` → `Rough Skin`）。Serebii 種族ページは特性を id でしか渡さ
 * ない（表示名を parse が捨てる）ため、新規 abilities エントリの en を id から決定論導出する。空の block map
 * （`{}` = flow・check:yaml-style 抵触）を作らないための非空欄でもある。ja は materialize が PokeAPI names で
 * 補完し、en の表記揺れは materialize の conflict 提示で突き合わせる（既存 catalog 46 件は本変換と完全一致）。
 */
export function abilityEnFromId(id: string): string {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** per-reg 習得技 id（重複なし・昇順）。Serebii Standard Moves 全件を per-species `moves` の正とする。 */
export function regMoveIds(p: ParsedSpecies): string[] {
  return [...new Set(p.moves.map((m) => m.id))].sort();
}

/** 2 つの id 配列を重複なし・昇順に併合する（per-reg `items` 予約キーへの append 用）。 */
export function sortedUnion(existing: readonly string[], fresh: readonly string[]): string[] {
  return [...new Set([...existing, ...fresh])].sort();
}

/**
 * メガフォルムの表示名一覧（diagnostic 用）。Serebii のメガ名（`Mega Garchomp` / `Mega Charizard X`）は
 * catalog のメガ種族 id 規約（`garchomp-mega` / `charizard-mega-x`）へ**決定論変換できない**（接頭辞 `Mega ` と
 * 接尾辞 `-mega` のずれ）。よって本関数はメガ id を導出せず**名前だけ**を返し、megaLinks / メガ種族エントリ /
 * per-reg `mega` の著述は authoring 層（survey-regulation skill・人手 / SubAgent）へエスカレーションする。
 */
export function megaFormNames(p: ParsedSpecies): string[] {
  return p.megas.map((m) => m.name);
}
