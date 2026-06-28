/**
 * schema.ts（serebii codegen 純関数）— 各データセットのパース結果を決定論で検証し、自己検証 exit code の
 * 源となる stage を判定する。`scripts/scrape-serebii.ts` はこの stage をそのまま exit code（3 / 4 / 0）へ写す。
 *
 * - stage 3 = schema 欠落: 必須欄（id / en / ja / 構造 / メタ）のいずれか欠落。
 * - stage 4 = 件数・健全性: id 形不適合 / 種族値合計不一致 / PP スケール外 / priority レンジ外 等。
 * - stage 0 = 健全。
 *
 * schema 欠落（3）を健全性（4）より優先する（必須欄が無ければ件数検証は無意味なため）。取得失敗（2）は
 * 取得層が判定し本モジュールは扱わない。speculative な ja も必須欄（速報の名前埋めが本目的のため）。
 */
import { isCatalogIdShape } from "./id-shape.ts";
import type { SerebiiAbility } from "./parse-abilities.ts";
import type { SerebiiItem, SerebiiItemName } from "./parse-items.ts";
import type { SerebiiMega } from "./parse-mega.ts";
import type { SerebiiMove } from "./parse-moves.ts";
import type { SerebiiSpecies } from "./parse-species.ts";

/** 自己検証 stage（= exit code）。2（取得失敗）は取得層が判定し本関数は扱わない。 */
export type Stage = 0 | 3 | 4;

/** 検証結果。`missingFields` は stage 3 の欠落欄、`issues` は stage 4 の健全性違反。 */
export interface ValidationResult {
  stage: Stage;
  missingFields: string[];
  issues: string[];
}

/** Champions PP スケール（attackdex-champions は (pp/5+1)*4 = 8/12/16/20 で提示する）。 */
const MOVE_PP_SCALE: ReadonlySet<number> = new Set([8, 12, 16, 20]);
/** damageClass の許容値（cat 画像 physical/special/other → physical/special/status）。 */
const VALID_DAMAGE_CLASSES: ReadonlySet<string> = new Set(["physical", "special", "status"]);
/** priority の想定レンジ（trick-room -7 〜 helping-hand +5）。 */
const PRIORITY_MIN = -7;
const PRIORITY_MAX = 5;

/** missing / issues から stage を確定する（欠落 3 を健全性 4 より優先）。 */
function resolve(missingFields: string[], issues: string[]): ValidationResult {
  if (missingFields.length > 0) return { stage: 3, missingFields, issues: [] };
  if (issues.length > 0) return { stage: 4, missingFields: [], issues };
  return { stage: 0, missingFields: [], issues: [] };
}

/** 種族値 6 値の合計。 */
function statSum(s: SerebiiSpecies["stats"]): number {
  return s.H + s.A + s.B + s.C + s.D + s.S;
}

/** 種族データセットの検証（roster + 構造 + learnset + ja）。 */
export function validateSpecies(p: SerebiiSpecies): ValidationResult {
  const missing: string[] = [];
  if (!p.id) missing.push("id");
  if (!p.en) missing.push("en");
  if (!p.ja) missing.push("ja");
  if (p.dex === null) missing.push("dex");
  if (p.types.length === 0) missing.push("types");
  if (p.abilities.length === 0) missing.push("abilities");
  if (p.statTotal === null) missing.push("stats");
  if (p.moves.length === 0) missing.push("moves");
  const issues: string[] = [];
  if (p.statTotal !== null && statSum(p.stats) !== p.statTotal) {
    issues.push(`stat sum ${statSum(p.stats)} != total ${p.statTotal}`);
  }
  for (const id of [...p.abilities, ...p.moves]) {
    if (!isCatalogIdShape(id)) issues.push(`id shape: ${id}`);
  }
  return resolve(missing, issues);
}

/** 技データセットの検証（技メタ + ja）。 */
export function validateMove(m: SerebiiMove): ValidationResult {
  const missing: string[] = [];
  if (!m.id) missing.push("id");
  if (!m.en) missing.push("en");
  if (!m.ja) missing.push("ja");
  if (!m.type) missing.push("type");
  if (!m.damageClass) missing.push("damageClass");
  if (m.pp === null) missing.push("pp");
  if (m.priority === null) missing.push("priority");
  const issues: string[] = [];
  if (!isCatalogIdShape(m.id)) issues.push(`move id shape: ${m.id}`);
  if (m.pp !== null && !MOVE_PP_SCALE.has(m.pp)) issues.push(`pp out of scale: ${m.pp}`);
  if (!VALID_DAMAGE_CLASSES.has(m.damageClass)) issues.push(`damageClass: ${m.damageClass}`);
  if (m.power !== null && m.power < 0) issues.push(`power negative: ${m.power}`);
  if (m.accuracy !== null && m.accuracy < 0) issues.push(`accuracy negative: ${m.accuracy}`);
  if (m.priority !== null && (m.priority < PRIORITY_MIN || m.priority > PRIORITY_MAX)) {
    issues.push(`priority out of range: ${m.priority}`);
  }
  return resolve(missing, issues);
}

/** 特性データセットの検証（id + en + ja）。 */
export function validateAbility(a: SerebiiAbility): ValidationResult {
  const missing: string[] = [];
  if (!a.id) missing.push("id");
  if (!a.en) missing.push("en");
  if (!a.ja) missing.push("ja");
  const issues = isCatalogIdShape(a.id) ? [] : [`ability id shape: ${a.id}`];
  return resolve(missing, issues);
}

/** 持ち物 roster（items.shtml）の検証（1 件も取れなければ欠落）。 */
export function validateItemsRoster(items: SerebiiItem[]): ValidationResult {
  if (items.length === 0) return { stage: 3, missingFields: ["items"], issues: [] };
  const issues: string[] = [];
  for (const it of items) {
    if (!isCatalogIdShape(it.id)) issues.push(`item id shape: ${it.slug || it.en}`);
    if (it.category === "mega-stone" && it.megaStoneFor === null) {
      issues.push(`mega stone missing target: ${it.id}`);
    }
    if (it.megaStoneFor !== null && !isCatalogIdShape(it.megaStoneFor)) {
      issues.push(`mega target shape: ${it.megaStoneFor}`);
    }
  }
  return resolve([], issues);
}

/** 持ち物個別（itemdex）の検証（id + en + ja）。 */
export function validateItem(n: SerebiiItemName): ValidationResult {
  const missing: string[] = [];
  if (!n.id) missing.push("id");
  if (!n.en) missing.push("en");
  if (!n.ja) missing.push("ja");
  const issues = isCatalogIdShape(n.id) ? [] : [`item id shape: ${n.id}`];
  return resolve(missing, issues);
}

/** メガデータセットの検証（種族ページのメガ群・メガ無しの空配列は健全）。 */
export function validateMega(megas: SerebiiMega[]): ValidationResult {
  const missing: string[] = [];
  const issues: string[] = [];
  for (const m of megas) {
    if (!m.id) missing.push(`id(${m.en})`);
    if (!m.en) missing.push("en");
    if (!m.baseSpecies) missing.push(`baseSpecies(${m.id})`);
    if (m.types.length === 0) missing.push(`types(${m.id})`);
    if (!m.ability) missing.push(`ability(${m.id})`);
    if (m.statTotal === null) missing.push(`stats(${m.id})`);
    if (m.statTotal !== null && statSum(m.stats) !== m.statTotal) {
      issues.push(`${m.id} stat sum ${statSum(m.stats)} != total ${m.statTotal}`);
    }
    if (m.id && !isCatalogIdShape(m.id)) issues.push(`mega id shape: ${m.id}`);
    if (m.baseSpecies && !isCatalogIdShape(m.baseSpecies)) {
      issues.push(`base shape: ${m.baseSpecies}`);
    }
    if (m.ability && !isCatalogIdShape(m.ability)) issues.push(`ability shape: ${m.ability}`);
  }
  return resolve(missing, issues);
}
