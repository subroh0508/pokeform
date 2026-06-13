/**
 * schema.ts（serebii codegen 純関数）— パース結果（`ParsedSpecies`）の必須欄 / 件数・健全性を決定論で
 * 検証し、自己検証 exit code の源となる stage を判定する純関数。`scripts/scrape-serebii.ts` はこの stage を
 * そのまま exit code（3 / 4 / 0）に写す。
 *
 * - stage 3 = schema 欠落: dex / en / types≥1 / abilities≥1 / stats（Base Stats 行）/ moves≥1 のいずれか欠落。
 * - stage 4 = 件数・健全性: 種族値合計が Total 行と不一致 / id が catalog id 形（`^[a-z0-9]+(-[a-z0-9]+)*$`）
 *   不適合 / 技に type・damageClass 欠落。
 * - stage 0 = 健全。
 *
 * schema 欠落（stage 3）を健全性（stage 4）より優先する（必須欄が無ければ件数検証は無意味なため）。
 */
import { isCatalogIdShape } from "./normalize.ts";
import type { ParsedSpecies } from "./parse.ts";

/** 自己検証 stage（= exit code）。2（取得失敗）は取得層 `scrape-serebii.ts` が判定し本関数は扱わない。 */
export type Stage = 0 | 3 | 4;

/** 検証結果。`missingFields` は stage 3 の欠落欄、`issues` は stage 4 の健全性違反。 */
export interface ValidationResult {
  stage: Stage;
  missingFields: string[];
  issues: string[];
}

/** 種族値 6 値の合計（Total 行との突き合わせ用）。 */
function statSum(s: ParsedSpecies["stats"]): number {
  return s.H + s.A + s.B + s.C + s.D + s.S;
}

/** 必須欄の欠落を集める（stage 3 の源）。 */
function missingFieldsOf(p: ParsedSpecies): string[] {
  const missing: string[] = [];
  if (!p.en) missing.push("en");
  if (p.dex === null) missing.push("dex");
  if (p.types.length === 0) missing.push("types");
  if (p.abilities.length === 0) missing.push("abilities");
  if (p.statTotal === null) missing.push("stats");
  if (p.moves.length === 0) missing.push("moves");
  return missing;
}

/** 件数・健全性の違反を集める（stage 4 の源・必須欄が揃っている前提）。 */
function healthIssuesOf(p: ParsedSpecies): string[] {
  const issues: string[] = [];
  if (p.statTotal !== null && statSum(p.stats) !== p.statTotal) {
    issues.push(`stat sum ${statSum(p.stats)} != total ${p.statTotal}`);
  }
  for (const id of p.abilities) {
    if (!isCatalogIdShape(id)) issues.push(`ability id shape: ${id}`);
  }
  for (const m of p.moves) {
    if (!isCatalogIdShape(m.id)) issues.push(`move id shape: ${m.id}`);
    if (!m.type) issues.push(`move missing type: ${m.id}`);
    if (!m.damageClass) issues.push(`move missing damageClass: ${m.id}`);
  }
  return issues;
}

/** パース結果を検証し stage（exit code）を判定する。欠落（3）を健全性（4）より優先する。 */
export function validateSpecies(p: ParsedSpecies): ValidationResult {
  const missingFields = missingFieldsOf(p);
  if (missingFields.length > 0) return { stage: 3, missingFields, issues: [] };
  const issues = healthIssuesOf(p);
  if (issues.length > 0) return { stage: 4, missingFields: [], issues };
  return { stage: 0, missingFields: [], issues: [] };
}
