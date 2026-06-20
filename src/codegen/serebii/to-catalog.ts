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
import { isCatalogIdShape } from "./normalize.ts";
import type { ParsedItem, ParsedMove, ParsedSpecies } from "./parse.ts";

/**
 * catalog/moves.yaml の Serebii 由来名前欄。`en` は Serebii 表示名（`ja` は持たない＝materialize が PokeAPI move
 * names で補完）。技メタは Phase 11 で per-game の regulations/champions/moves.yaml へ分離した（ADR 0034）。
 */
export interface MoveNameFields {
  en: string;
}

/** `ParsedMove` → catalog/moves.yaml 名前欄（Serebii 表示名 en のみ・ja は materialize が補完）。 */
export function moveNameFields(m: ParsedMove): MoveNameFields {
  return { en: m.name };
}

/**
 * regulations/champions/moves.yaml の Serebii 由来技メタ欄（per-game 共有・Phase 11 / ADR 0034）。`priority` は
 * Serebii の Standard Moves 表に列が無いため `0` 既定（実値は skill-authored で上書き＝materialize の
 * append/既存尊重で保護）。技の数値は Champions 固有調整があり得るためゲーム単位で持つ。
 */
export interface MoveStatsFields {
  type: string;
  damageClass: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
}

/** `ParsedMove` → regulations/champions/moves.yaml 技メタ欄（Serebii 由来の type/damageClass/power 等）。 */
export function moveStatsFields(m: ParsedMove): MoveStatsFields {
  return {
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

/**
 * items.yaml の Serebii 由来欄（en + メガストーンのメガ先 `megaStoneFor`（base 種族）+ メガ形態
 * `megaSpecies`（Phase 7 新設のストーン→形態リンク）。ja / category は materialize が埋める）。
 */
export interface ItemCatalogFields {
  en: string;
  megaStoneFor?: string;
  megaSpecies?: string;
}

/** `ParsedItem` → items.yaml 転記欄（メガストーンのみ `megaStoneFor` / `megaSpecies` を持つ）。 */
export function itemCatalogFields(it: ParsedItem): ItemCatalogFields {
  if (it.megaStoneFor === null) return { en: it.name };
  const fields: ItemCatalogFields = { en: it.name, megaStoneFor: it.megaStoneFor };
  const megaSpecies = megaStoneSpeciesId(it.id, it.megaStoneFor);
  if (megaSpecies !== null) fields.megaSpecies = megaSpecies;
  return fields;
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
 * メガ表示名 → メガ形態 catalog 種族 id（決定論変換）。base slug は既知（呼び出し側が処理中の種族 slug を
 * 渡す）ため、メガ名の**枝サフィックス**（`""` / `"X"` / `"Y"`）だけ拾えば `<baseSlug>-mega[-x|-y]` を組める
 * （base 表示名をパースしないので en≠slug の地域フォルムでも破綻しない）。`Mega ` 接頭の無い形（Primal 等）や
 * catalog id 形にならないものは **`null`**（自動著述せず authoring へ escalation）。これは shape チェックの
 * ガードで、catalog 集合への membership 照合（`normalize.ts` の `normalizeAgainstCatalog`）より弱いが、誤 id を
 * 著述しない安全側に倒す点で同じ狙い（membership は下流の `check:regulation` / tsc に委ねる）。
 */
export function megaSpeciesId(baseSlug: string, megaName: string): string | null {
  const m = megaName.trim().match(/^Mega\s+.*?(?:\s+([XY]))?$/);
  if (m === null) return null; // `Mega ` 接頭が無い（Primal 等）→ escalation
  const suffix = m[1] ? `-${m[1].toLowerCase()}` : "";
  const id = `${baseSlug}-mega${suffix}`;
  return isCatalogIdShape(id) ? id : null;
}

/**
 * メガストーン id + メガ先 base 種族 id → メガ形態種族 id（`ItemBase.megaSpecies`・Phase 7 のストーン→形態
 * リンク）。ストーン id の枝サフィックス（`-x` / `-y`）で X/Y を区別する（`charizardite-x` → `charizard-mega-x`
 * / `garchompite` → `garchomp-mega`）。catalog id 形にならないものは `null`（誤 id 注入防止）。
 */
export function megaStoneSpeciesId(stoneId: string, megaStoneFor: string): string | null {
  const m = stoneId.match(/-([xy])$/);
  const suffix = m ? `-${m[1]}` : "";
  const id = `${megaStoneFor}-mega${suffix}`;
  return isCatalogIdShape(id) ? id : null;
}

/** 種族のメガ自動著述プラン（megaLinks / メガ先種族エントリ / per-reg `mega[]` の材料）。 */
export interface MegaAuthoring {
  /** メガ形態 id（昇順・重複なし）。megaLinks の値・per-reg `mega[]` に使う。 */
  ids: string[];
  /** catalog `pokemon` へ追加するメガ先種族エントリ（en のみ・構造は materialize が後埋め）。 */
  speciesEntries: { id: string; en: string }[];
  /** 決定論変換できなかったメガ名（Primal 等）。呼び出し側が diagnostic に残す（自動著述しない）。 */
  escalations: string[];
}

/**
 * 種族の全メガへ `megaSpeciesId` を適用し、自動著述プランへまとめる。`null`（Primal 等の決定論変換不能）は
 * `escalations` に分け、確実なものだけ `ids` / `speciesEntries` に積む（決定論で確実なものだけ自動化）。
 */
export function megaAuthoring(baseSlug: string, p: ParsedSpecies): MegaAuthoring {
  const speciesEntries: { id: string; en: string }[] = [];
  const escalations: string[] = [];
  for (const mega of p.megas) {
    const id = megaSpeciesId(baseSlug, mega.name);
    if (id === null) escalations.push(mega.name);
    else speciesEntries.push({ id, en: mega.name });
  }
  const ids = [...new Set(speciesEntries.map((e) => e.id))].sort();
  return { ids, speciesEntries, escalations };
}
