import type { AbilityId } from "../../data/generated/abilities.ts";
import type { ItemId } from "../../data/generated/items.ts";
import type { MoveId } from "../../data/generated/moves.ts";
import type { BaseStats } from "./stats.ts";
import type { PokemonType } from "./type-chart.ts";

/**
 * **レギュレーション不変**の種族情報（種族値・タイプ・日英名・メガ先）。実数値計算・名前表示・
 * coverage はレギュ非依存のためこの派生 base view（`data/generated/species-base.ts` の
 * `speciesBaseDex`・全種族）を引く（per-reg 化の設計判断5・[[type-conventions]]）。
 * `megaEvolvesTo` は per-reg dex 側で legality を見るため素の `string`（自己参照を避ける）。
 */
export interface SpeciesBaseInfo {
  readonly dex: number;
  readonly id: string;
  readonly name: { readonly en: string; readonly ja: string };
  readonly types: readonly PokemonType[];
  readonly baseStats: BaseStats;
  /** メガシンカ先の種族 id（[[game-spec]] のメガ二重表現）。 */
  readonly megaEvolvesTo?: string;
}

/**
 * **per-regulation** 種族 dex のエントリ親型（統一パターンの XxxBase）。reg 不変フィールド
 * （`SpeciesBaseInfo`）に、**そのレギュの**習得技 `moves` / 特性 `abilities` / 持ち物 `items` を
 * 足したもの。同じ種族でも `moves` はレギュ間で異なりうる（per-reg 一本化・ADR 0021）。
 * 各 ID 参照は対応する Dex のキーに統一し、詳細は `Dex[Id]` ルックアップで取る（ID 単一ソース・
 * [[type-conventions]]）。種族粒度は「種族値が一意 = 1 種族」。生成物は
 * `data/generated/regulations/<id>/species.ts`（per-reg `speciesDex` / `SpeciesId`）が正本。
 */
export interface SpeciesBase extends SpeciesBaseInfo {
  readonly abilities: readonly AbilityId[];
  readonly moves: readonly MoveId[];
  readonly items: "any" | readonly ItemId[];
}

export type { SpeciesBaseDex, SpeciesBaseId } from "../../data/generated/species-base.ts";
/** 生成済みの reg 不変 base view（値）/ SpeciesBaseDex（型）/ SpeciesBaseId を re-export する。 */
export { speciesBaseDex } from "../../data/generated/species-base.ts";
