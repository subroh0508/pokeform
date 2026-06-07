import type { ItemId } from "../../data/generated/items.ts";
import type { SpeciesId } from "../../data/generated/species.ts";

/**
 * レギュレーションエントリの親型（統一パターンの XxxBase）。1 レギュ = 1 ファイルで生成され
 * （`data/generated/regulations/<id>.ts`）、`index.ts` が `regulationDex` に集約して
 * `RegulationDex` / `RegulationId` を派生する。解禁判定の正本（per-regulation 一本化・ADR 0021）。
 *
 * 解禁集合（`species` / `items` / `mega`）の id は対応する Dex のキーに統一する（ID 単一ソース・
 * [[type-conventions]]）。技は YAML に記録するが per-reg 型は生成しない（種族の習得技で legality を
 * 見るため per-reg 技型は不要・ADR 0021）。
 */
export interface RegulationBase {
  readonly id: string;
  readonly name: { readonly en: string; readonly ja: string };
  /** 開催期間。`start` 必須・`end` は開催中なら `null`。 */
  readonly period: { readonly start: string; readonly end: string | null };
  /** 構築に使える base 種族。 */
  readonly species: readonly SpeciesId[];
  /** 解禁持ち物。 */
  readonly items: readonly ItemId[];
  /** 解禁メガ先（base + メガストーンで展開）。 */
  readonly mega: readonly SpeciesId[];
}

export type { RegulationDex, RegulationId } from "../../data/generated/regulations/index.ts";
/** 生成済みの regulationDex（値）/ RegulationDex（型）/ RegulationId を re-export する。 */
export { regulationDex } from "../../data/generated/regulations/index.ts";
