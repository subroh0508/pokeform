import type { ItemId } from "../../data/generated/items.ts";
import type { SpeciesDex, SpeciesId } from "../../data/generated/species.ts";
import { speciesDex } from "../../data/generated/species.ts";
import { calcRealStats } from "../domain/calc-stats.ts";
import type { Invalid } from "./brand.ts";
import type { NatureSpec } from "./nature.ts";
import type { PointAllocation, RealStats } from "./stats.ts";

/**
 * 育成済み個体の型レベル仕様（種族ジェネリック制約・型シグネチャの核心）と、実数値を自動計算する
 * `defineIndividual`、不正を可読化する**ブランドエラー型**を提供する。検証は「tsc のみ」（Zod 不採用・
 * [[tsc-verification]] / ADR 0010）。覚えない技・使えない特性は `SpeciesDex[S]` ルックアップの union で
 * 弾き、合計66 は codegen 算出値を `PointTotalMustBe66<N>` で検証する（型レベル算術を codegen へ逃がす）。
 */

// --- ブランドエラー型（命名は能動的に「何が違うか」を表す・[[tsc-verification]]） -----------------

/** 種族 `S` が覚えない技 `M`。`SpeciesDex[S]["moves"]` に含まれない技で発生。 */
export type MoveNotLearnedBy<
  S extends SpeciesId,
  M extends string,
> = Invalid<`move '${M}' is not learned by '${S & string}'`>;
/** 種族 `S` が持てない特性 `A`。`SpeciesDex[S]["abilities"]` に含まれない特性で発生。 */
export type AbilityNotAvailable<
  S extends SpeciesId,
  A extends string,
> = Invalid<`ability '${A}' is not available to '${S & string}'`>;
/** 種族 `S` が持てない持ち物 `I`。`SpeciesDex[S]["items"]` 制約に外れた持ち物で発生。 */
export type ItemNotHoldableBy<
  S extends SpeciesId,
  I extends string,
> = Invalid<`item '${I}' is not holdable by '${S & string}'`>;
/** 能力ポイント合計が 66 でない。codegen が算出した合計 `N` を型に埋めて検証する。 */
export type PointTotalMustBe66<N extends number> = N extends 66
  ? unknown
  : Invalid<`point total must be 66 but is ${N}`>;

// --- 制約マップ（codegen 生成 TS が参照し、違反要素をブランド型へ写像する） ----------------------

/** 単一の技 `M` を検証し、覚えない技ならブランド型へ写像する。 */
export type ValidMove<
  S extends SpeciesId,
  M extends string,
> = M extends SpeciesDex[S]["moves"][number] ? M : MoveNotLearnedBy<S, M>;

/** 技配列 `Ms` の各要素を検証し、覚えない技の位置だけブランド型へ写像する。 */
export type ValidMoves<S extends SpeciesId, Ms extends readonly string[]> = {
  readonly [I in keyof Ms]: ValidMove<S, Ms[I] & string>;
};

/** 特性 `A` を検証し、使えない特性ならブランド型へ写像する。 */
export type ValidAbility<
  S extends SpeciesId,
  A extends string,
> = A extends SpeciesDex[S]["abilities"][number] ? A : AbilityNotAvailable<S, A>;

/** 種族の持ち物制約から許容される持ち物 ID 集合（`"any"` は全 `ItemId`）。 */
export type HoldableItems<S extends SpeciesId> = SpeciesDex[S]["items"] extends "any"
  ? ItemId
  : Extract<SpeciesDex[S]["items"], readonly ItemId[]>[number];

/** 持ち物 `I` を検証し、持てない持ち物ならブランド型へ写像する。 */
export type ValidItem<S extends SpeciesId, I extends string> =
  I extends HoldableItems<S> ? I : ItemNotHoldableBy<S, I>;

// --- 個体仕様（runtime API のシグネチャ・エディタ DX 向けの素 union） -----------------------------

/**
 * 個体の型レベル仕様。種族 `S` に応じて `ability` / `moves` を `SpeciesDex[S]` の union に絞り、
 * 使えない特性・覚えない技をエディタ補完と型エラーで弾く。能力ポイントは各 0..32（`PointAllocation`）。
 * codegen 生成 TS は本型ではなく上記ブランド制約マップを使い、診断にブランド名を表面化させる。
 */
export interface IndividualSpec<S extends SpeciesId> {
  readonly nature: NatureSpec;
  readonly ability: SpeciesDex[S]["abilities"][number];
  readonly item: HoldableItems<S>;
  readonly points: PointAllocation;
  readonly moves: ReadonlyArray<SpeciesDex[S]["moves"][number]>;
}

/** 確定した個体（仕様 + 種族 + 自動計算した実数値）。 */
export interface Individual<S extends SpeciesId> extends IndividualSpec<S> {
  readonly species: S;
  readonly realStats: RealStats;
}

/**
 * 個体仕様から実数値（Lv50・個体値31 固定）を自動計算して確定個体を返す（公開 API・要求「実装値は
 * 自動計算」を充足）。計算は純関数 `calcRealStats`（[[game-spec]] の二重 floor）。型制約により不正な
 * 特性・技はコンパイル時に弾かれる。
 */
export const defineIndividual = <S extends SpeciesId>(
  species: S,
  spec: IndividualSpec<S>,
): Individual<S> => {
  const realStats = calcRealStats(
    { baseStats: speciesDex[species].baseStats },
    { nature: spec.nature, points: spec.points },
  );
  return { species, ...spec, realStats };
};
