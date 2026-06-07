import type { ItemId } from "../../data/generated/items.ts";
import type { SpeciesBase } from "./species.ts";

/**
 * レギュレーションエントリの親型（統一パターンの XxxBase）。1 レギュ = 1 ディレクトリで生成され
 * （`data/generated/regulations/<id>/index.ts`）、`index.ts`（集約）が `regulationDex` に集約して
 * `RegulationDex` / `RegulationId` を派生する。解禁判定の正本（per-regulation 一本化・ADR 0021）。
 *
 * `speciesDex` は**そのレギュの種族 dex**（`./species.ts`・per-reg 習得技を含む legality の型正本）。
 * reg-aware 型機構（`SpeciesDexOf<R>` 等）はここから引く。解禁集合（`species` / `items` / `mega`）の
 * id は対応する Dex のキーに統一する（ID 単一ソース・[[type-conventions]]）。
 */
export interface RegulationBase {
  readonly id: string;
  readonly name: { readonly en: string; readonly ja: string };
  /** 開催期間。`start` 必須・`end` は開催中なら `null`。 */
  readonly period: { readonly start: string; readonly end: string | null };
  /** そのレギュの種族 dex（per-reg `moves`/`abilities`/`items` を含む legality の型正本）。 */
  readonly speciesDex: Readonly<Record<string, SpeciesBase>>;
  /** 構築に使える base 種族（`speciesDex` のキー部分集合）。 */
  readonly species: readonly string[];
  /** 解禁持ち物。 */
  readonly items: readonly ItemId[];
  /** 解禁メガ先（base + メガストーンで展開・`speciesDex` にエントリを持つ）。 */
  readonly mega: readonly string[];
}

export type { RegulationDex, RegulationId } from "../../data/generated/regulations/index.ts";
/** 生成済みの regulationDex（値）/ RegulationDex（型）/ RegulationId を re-export する。 */
export { regulationDex } from "../../data/generated/regulations/index.ts";
