import type { AbilityId } from "../generated/champions/ability-specs.ts";
import type { ItemId } from "../generated/champions/item-specs.ts";
import { megaSpecsDex } from "../generated/champions/mega-specs.ts";
import type { MoveId } from "../generated/champions/move-specs.ts";
import { speciesSpecsDex } from "../generated/champions/species-specs.ts";
import type { BaseStats } from "./stats.ts";
import type { PokemonType } from "./type-chart.ts";

/**
 * **base 種族**の構造 spec（種族値・タイプ・特性・メガ先・図鑑番号）。**名前は持たない**（名前の SoT は
 * `data/languages/species.yaml`・ADR 0035）。`src/generated/champions/species-specs.ts`（`speciesSpecsDex`）が
 * 派生する。実数値計算・coverage はレギュ非依存のためこの spec（+ `MegaSpec`）を引き、表示名は
 * `languages/species.ts` / `languages/mega.ts` を引く（構造と名前を直交化・設計判断5 / [[type-conventions]]）。
 * `megaEvolvesTo` は per-reg dex 側で legality を見るため素の `string[]`（自己参照を避ける）。
 */
export interface SpeciesSpec {
  readonly dex: number;
  readonly id: string;
  readonly types: readonly PokemonType[];
  readonly baseStats: BaseStats;
  readonly abilities: readonly AbilityId[];
  /** メガシンカ先の種族 id の配列（1 種族複数メガ可・[[game-spec]] のメガ二重表現）。 */
  readonly megaEvolvesTo?: readonly string[];
}

/**
 * **メガ形態**の構造 spec（独立 spec エンティティ・ADR 0036）。base 種族から分離し、メガ専用の
 * 単一特性 `ability` と逆参照 `baseSpecies` を持つ。**名前は持たない**（SoT は `data/languages/mega.yaml`）。
 * `src/generated/champions/mega-specs.ts`（`megaSpecsDex`）が派生する。
 */
export interface MegaSpec {
  readonly dex: number;
  readonly id: string;
  readonly types: readonly PokemonType[];
  readonly baseStats: BaseStats;
  /** メガ形態の特性（メガは特性が 1 つに固定される）。 */
  readonly ability: AbilityId;
  /** メガシンカ元の base 種族 id（per-reg dex 側で legality を見るため素の `string`）。 */
  readonly baseSpecies: string;
}

/**
 * **per-regulation** 種族 dex のエントリ親型（統一パターンの XxxBase・reg-aware 型機構の正本）。base 種族の
 * 構造 spec（`SpeciesSpec`）に、**そのレギュの**習得技 `moves` / 持ち物 `items` を足したもの。同じ種族でも
 * `moves` はレギュ間で異なりうる（per-reg 一本化・ADR 0021）。各 ID 参照は対応する Dex のキーに統一する
 * （ID 単一ソース・[[type-conventions]]）。**名前は持たない**（種族名 SoT は languages・構造と直交・ADR 0035）。
 * 生成物は `src/generated/champions/<reg>/index.ts`（`speciesDex` を base/mega specs + species-moves +
 * per-reg mega から合成）が正本。
 */
export interface PerRegSpecies extends SpeciesSpec {
  readonly moves: readonly MoveId[];
  readonly items: "any" | readonly ItemId[];
}

export type { MegaSpecId, MegaSpecsDex } from "../generated/champions/mega-specs.ts";
export type {
  SpeciesSpecId,
  SpeciesSpecsDex,
} from "../generated/champions/species-specs.ts";
export { megaSpecsDex, speciesSpecsDex };

/**
 * base 種族 + メガ形態を統合した**reg 不変の構造ルックアップ**（実数値計算・名前なしタイプ参照・coverage の
 * 種族解決に使う）。`megaEvolvesTo` が base→mega を横断するため、両 dex を 1 つにまとめて id で引けるように
 * する（型の正本は per-reg のまま・本 dex は runtime ルックアップ専用）。
 */
export const speciesStructuralDex = { ...speciesSpecsDex, ...megaSpecsDex };
