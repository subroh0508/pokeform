import type {
  RegulationDex as _RegulationDex,
  RegulationId as _RegulationId,
} from "../generated/champions/index.ts";
import type { ItemId } from "../generated/champions/item-specs.ts";
import type { PerRegSpecies } from "./species.ts";

/**
 * レギュレーションエントリの親型（統一パターンの XxxBase）。1 レギュ = 1 ディレクトリで生成され
 * （`src/generated/champions/<reg>/index.ts`）、`champions/index.ts`（集約）が `regulationDex` に集約して
 * `RegulationDex` / `RegulationId` を派生する。解禁判定の正本（per-regulation 一本化・ADR 0021）。
 *
 * `speciesDex` は**そのレギュの種族 dex**（index.ts が base/mega specs + species-moves + per-reg mega を合成・
 * per-reg 習得技を含む legality の型正本）。
 * reg-aware 型機構（`SpeciesDexOf<R>` 等）はここから引く。解禁集合（`species` / `items` / `mega`）の
 * id は対応する Dex のキーに統一する（ID 単一ソース・[[type-conventions]]）。
 */
export interface RegulationBase {
  readonly id: string;
  readonly name: { readonly en: string; readonly ja: string };
  /** 開催期間。`start` 必須・`end` は開催中なら `null`。 */
  readonly period: { readonly start: string; readonly end: string | null };
  /** そのレギュの種族 dex（per-reg `moves`/`abilities`/`items` を含む legality の型正本）。種族名
   *  （`name`）は持たない（SoT は languages・構造と直交・ADR 0035）。 */
  readonly speciesDex: Readonly<Record<string, PerRegSpecies>>;
  /** 構築に使える base 種族（`speciesDex` のキー部分集合）。 */
  readonly species: readonly string[];
  /** 解禁持ち物。 */
  readonly items: readonly ItemId[];
  /** 解禁メガ先（base + メガストーンで展開・`speciesDex` にエントリを持つ）。 */
  readonly mega: readonly string[];
}

export type { RegulationDex, RegulationId } from "../generated/champions/index.ts";
/** 生成済みの regulationDex（値）/ RegulationDex（型）/ RegulationId を re-export する。 */
export { regulationDex } from "../generated/champions/index.ts";

/**
 * レギュレーション `R` の解禁持ち物プール（`RegulationBase.items` リテラルタプルの要素 union）。
 * `HoldableItems<R,S>` の base 種族分岐がグローバル `ItemId` でなく per-reg 解禁プールへ絞るために使う
 * （per-reg item legality・ADR 0021 の解禁判定モデルの忠実な適用）。
 */
export type RegulationItemId<R extends _RegulationId> = _RegulationDex[R]["items"][number];
