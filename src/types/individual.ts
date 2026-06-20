import { calcRealStats } from "../domain/calc-stats.ts";
import type { RegulationDex, RegulationId } from "../generated/champions/index.ts";
import type { ItemId, ItemSpecsDex } from "../generated/champions/item-specs.ts";
import type { Invalid } from "./brand.ts";
import type { NatureSpec } from "./nature.ts";
import type { RegulationItemId } from "./regulation.ts";
import { type PerRegSpecies, speciesStructuralDex } from "./species.ts";
import type { PointAllocation, RealStats } from "./stats.ts";

/**
 * 育成済み個体の型レベル仕様（**レギュレーション + 種族**ジェネリック制約・型シグネチャの核心）と、
 * 実数値を自動計算する `defineIndividual`、不正を可読化する**ブランドエラー型**を提供する。検証は
 * 「tsc のみ」（Zod 不採用・[[tsc-verification]] / ADR 0010）。覚えない技・使えない特性は**宣言した
 * レギュレーション `R` の種族 dex**（`SpeciesDexOf<R>[S]`）ルックアップの union で弾き、合計66 は codegen
 * 算出値を `PointTotalMustBe66<N>` で検証する。同じ種族でも `R` ごとに習得技が異なりうる（per-reg 化・
 * ADR 0021）。実数値計算は reg 不変のため `speciesStructuralDex`（base + mega 統合の構造ルックアップ）から
 * 種族値を引く（設計判断5・ADR 0035）。
 */

// --- reg-aware な種族 dex アクセサ ----------------------------------------------------------------

/** レギュレーション `R` の種族 dex（legality の型正本・`RegulationDex[R]["speciesDex"]`）。 */
export type SpeciesDexOf<R extends RegulationId> = RegulationDex[R]["speciesDex"];
/** レギュレーション `R` で構築に使える種族 id（`R` の種族 dex のキー）。 */
export type SpeciesIdIn<R extends RegulationId> = keyof SpeciesDexOf<R> & string;
/**
 * `R` の種族 `S` のエントリ。`& PerRegSpecies` で `moves`/`abilities`/`items` キーの存在を tsc に保証する
 * （generic R での深い indexed access の限界回避）。narrow リテラル側は交差で温存される。`PerRegSpecies` は
 * `name` を持たない per-reg 型（種族名 SoT は languages・構造と直交・ADR 0035）。
 */
type SpeciesEntryOf<R extends RegulationId, S extends SpeciesIdIn<R>> = SpeciesDexOf<R>[S] &
  PerRegSpecies;

// --- ブランドエラー型（命名は能動的に「何が違うか」を表す・[[tsc-verification]]） -----------------

/** レギュ `R` の種族 `S` が覚えない技 `M`。`SpeciesEntryOf<R, S>["moves"]` に含まれない技で発生。 */
export type MoveNotLearnedBy<
  R extends RegulationId,
  S extends SpeciesIdIn<R>,
  M extends string,
> = Invalid<`move '${M}' is not learned by '${S & string}' in regulation '${R & string}'`>;
/** レギュ `R` の種族 `S` が持てない特性 `A`。`SpeciesEntryOf<R, S>["abilities"]` に含まれない特性で発生。 */
export type AbilityNotAvailable<
  R extends RegulationId,
  S extends SpeciesIdIn<R>,
  A extends string,
> = Invalid<`ability '${A}' is not available to '${S & string}' in regulation '${R & string}'`>;
/** レギュ `R` の種族 `S` が持てない持ち物 `I`。`SpeciesEntryOf<R, S>["items"]` 制約に外れた持ち物で発生。 */
export type ItemNotHoldableBy<
  R extends RegulationId,
  S extends SpeciesIdIn<R>,
  I extends string,
> = Invalid<`item '${I}' is not holdable by '${S & string}' in regulation '${R & string}'`>;
/** 能力ポイント合計が 66 でない。codegen が算出した合計 `N` を型に埋めて検証する。 */
export type PointTotalMustBe66<N extends number> = N extends 66
  ? unknown
  : Invalid<`point total must be 66 but is ${N}`>;

// --- 制約マップ（codegen 生成 TS が参照し、違反要素をブランド型へ写像する） ----------------------

/** 単一の技 `M` を `R` の種族 `S` で検証し、覚えない技ならブランド型へ写像する。 */
export type ValidMove<
  R extends RegulationId,
  S extends SpeciesIdIn<R>,
  M extends string,
> = M extends SpeciesEntryOf<R, S>["moves"][number] ? M : MoveNotLearnedBy<R, S, M>;

/** 技配列 `Ms` の各要素を検証し、覚えない技の位置だけブランド型へ写像する。 */
export type ValidMoves<
  R extends RegulationId,
  S extends SpeciesIdIn<R>,
  Ms extends readonly string[],
> = {
  readonly [I in keyof Ms]: ValidMove<R, S, Ms[I] & string>;
};

/** 特性 `A` を `R` の種族 `S` で検証し、使えない特性ならブランド型へ写像する。 */
export type ValidAbility<
  R extends RegulationId,
  S extends SpeciesIdIn<R>,
  A extends string,
> = A extends SpeciesEntryOf<R, S>["abilities"][number] ? A : AbilityNotAvailable<R, S, A>;

/**
 * 種族 `S` がメガ形態のとき、その形態に対応するメガストーン id（`ItemDex[I].megaSpecies` が `S` を指す）。
 * base 種族や非メガ形態では `never`（マッチ無し）。X/Y を区別するため `megaStoneFor`（base）ではなく
 * `megaSpecies`（メガ形態 SpeciesId）で引く。
 */
export type MegaStoneOf<S extends string> = {
  [I in ItemId]: ItemSpecsDex[I] extends { readonly megaSpecies: S } ? I : never;
}[ItemId];

/**
 * `R` の種族 `S` の持ち物制約から許容される持ち物 ID 集合。`"any"` は per-reg 解禁プールへ接続する
 * （per-reg item legality・ADR 0021）:
 * - **base（メガシンカ前）種族**: `RegulationItemId<R>`（R の解禁プール全件・全メガストーン含む）。
 * - **メガ形態種族**（charizard-mega-x 等・`MegaStoneOf<S>` が非 `never`）: 対応するメガストーン 1 個のみ
 *   （通常持ち物・他形態ストーン不可。`& RegulationItemId<R>` で R 未解禁ストーンも弾く）。
 */
export type HoldableItems<R extends RegulationId, S extends SpeciesIdIn<R>> = SpeciesEntryOf<
  R,
  S
>["items"] extends "any"
  ? [MegaStoneOf<S>] extends [never]
    ? RegulationItemId<R>
    : MegaStoneOf<S> & RegulationItemId<R>
  : Extract<SpeciesEntryOf<R, S>["items"], readonly ItemId[]>[number];

/** 持ち物 `I` を `R` の種族 `S` で検証し、持てない持ち物ならブランド型へ写像する。 */
export type ValidItem<R extends RegulationId, S extends SpeciesIdIn<R>, I extends string> =
  I extends HoldableItems<R, S> ? I : ItemNotHoldableBy<R, S, I>;

// --- 個体仕様（runtime API のシグネチャ・エディタ DX 向けの素 union） -----------------------------

/**
 * 個体の型レベル仕様。レギュ `R` と種族 `S` に応じて `ability` / `moves` を `SpeciesDexOf<R>[S]` の
 * union に絞り、使えない特性・覚えない技をエディタ補完と型エラーで弾く。能力ポイントは各 0..32
 * （`PointAllocation`）。codegen 生成 TS は本型ではなく上記ブランド制約マップを宣言レギュごとに
 * fan-out して使い、診断にブランド名と `R` を表面化させる。
 */
export interface IndividualSpec<R extends RegulationId, S extends SpeciesIdIn<R>> {
  readonly nature: NatureSpec;
  readonly ability: SpeciesEntryOf<R, S>["abilities"][number];
  readonly item: HoldableItems<R, S>;
  readonly points: PointAllocation;
  readonly moves: ReadonlyArray<SpeciesEntryOf<R, S>["moves"][number]>;
}

/** 確定した個体（仕様 + レギュ + 種族 + 自動計算した実数値）。 */
export interface Individual<R extends RegulationId, S extends SpeciesIdIn<R>>
  extends IndividualSpec<R, S> {
  readonly regulation: R;
  readonly species: S;
  readonly realStats: RealStats;
}

/**
 * 個体仕様から実数値（Lv50・個体値31 固定）を自動計算して確定個体を返す（公開 API・要求「実装値は
 * 自動計算」を充足）。レギュ `R` を明示し、`ability` / `item` / `moves` を `R` の種族プールで型検証する。
 * 種族値は reg 不変のため `speciesStructuralDex`（base + mega 統合）から引く（計算は純関数 `calcRealStats`・
 * [[game-spec]] の二重 floor）。型制約により不正な特性・技はコンパイル時に弾かれる。
 */
export const defineIndividual = <R extends RegulationId, S extends SpeciesIdIn<R>>(
  regulation: R,
  species: S,
  spec: IndividualSpec<R, S>,
): Individual<R, S> => {
  const base = speciesStructuralDex[species as keyof typeof speciesStructuralDex];
  const realStats = calcRealStats(
    { baseStats: base.baseStats },
    { nature: spec.nature, points: spec.points },
  );
  return { regulation, species, ...spec, realStats };
};
