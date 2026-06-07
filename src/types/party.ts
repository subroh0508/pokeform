/**
 * パーティ / 個体ファイルの**生（パース直後）** の形（軽量ランタイム型）と、パーティの
 * **型レベル制約**（同種族重複・タプル長 ≤6・レギュ整合）を提供する。名称はランタイム型では
 * まだ ID 正規化前の文字列で、正規化・検証は `src/io/load-party.ts` が行う（[[cli-and-io]]）。
 * 型レベル制約は codegen 生成 TS が `satisfies ConstrainParty<...>` で参照し、違反を tsc が弾く
 * （[[tsc-verification]]）。
 */

import type { RegulationId } from "../../data/generated/regulations.ts";
import type { SpeciesDex, SpeciesId } from "../../data/generated/species.ts";
import type { Invalid } from "./brand.ts";

/** 入力ファイルの記述言語（ファイル単位宣言・未指定の既定は ja）。 */
export type Lang = "ja" | "en";

// --- パーティのブランドエラー型（[[tsc-verification]]） -------------------------------------------

/** 同一種族 `S` がパーティ内で重複。2 体目以降の同種族で発生。 */
export type DuplicateSpeciesInParty<S extends string> =
  Invalid<`species '${S}' appears more than once in the party`>;
/** 種族 `S` がレギュレーション `R` で未解禁。`SpeciesDex[S]["regulations"]` に `R` を含まないとき発生。 */
export type NotLegalInRegulation<
  S extends string,
  R extends string,
> = Invalid<`species '${S}' is not legal in regulation '${R}'`>;
/** 参照先が有効な種族 ID でない（存在しないフォルム・参照切れ等）。 */
export type SpeciesNotFound<S extends string> = Invalid<`'${S}' is not a known species`>;
/** パーティが最大体数 6 を超過。`N` は実際の体数。 */
export type PartyTooLarge<N extends number> =
  Invalid<`party has ${N} members but the maximum is 6`>;

// --- 制約マップ（codegen 生成 TS が `satisfies ConstrainParty<T,R>` で参照する） -----------------

/** タプル長が 6 以下か。 */
type IsAtMost6<T extends readonly unknown[]> = T["length"] extends 0 | 1 | 2 | 3 | 4 | 5 | 6
  ? true
  : false;

/** 単一メンバー `H` を検証し、重複・未解禁・未知種族の各違反をブランド型へ写像する。 */
type ConstrainMember<
  H extends string,
  R extends RegulationId,
  Seen extends readonly string[],
> = H extends Seen[number]
  ? DuplicateSpeciesInParty<H>
  : H extends SpeciesId
    ? R extends SpeciesDex[H]["regulations"][number]
      ? H
      : NotLegalInRegulation<H, R>
    : SpeciesNotFound<H>;

/** メンバー列を先頭から走査し、各位置を `ConstrainMember` で写像する（重複検出のため `Seen` を引き継ぐ）。 */
type MapMembers<
  T extends readonly string[],
  R extends RegulationId,
  Seen extends readonly string[] = [],
> = T extends readonly [infer H extends string, ...infer Rest extends string[]]
  ? readonly [ConstrainMember<H, R, Seen>, ...MapMembers<Rest, R, [...Seen, H]>]
  : readonly [];

/**
 * パーティのメンバー列 `T`（種族 ID のタプル）をレギュレーション `R` の下で検証する制約型。
 * 体数超過なら全要素を `PartyTooLarge` へ、6 以下なら各メンバーを重複・未解禁・未知種族で写像する。
 * 生成 TS が `members satisfies ConstrainParty<typeof members, R>` と書くと、違反位置の素の文字列が
 * ブランド型へ代入不能になり tsc エラーになる。
 */
export type ConstrainParty<T extends readonly string[], R extends RegulationId> =
  IsAtMost6<T> extends true
    ? MapMembers<T, R>
    : { readonly [I in keyof T]: PartyTooLarge<T["length"] & number> };

/** メンバー列の同種族重複のみを検証する制約型（重複位置を `DuplicateSpeciesInParty` へ写像）。 */
export type UniqueSpecies<
  T extends readonly string[],
  Seen extends readonly string[] = [],
> = T extends readonly [infer H extends string, ...infer Rest extends string[]]
  ? readonly [
      H extends Seen[number] ? DuplicateSpeciesInParty<H> : H,
      ...UniqueSpecies<Rest, [...Seen, H]>,
    ]
  : readonly [];

/** パーティの型レベル仕様（宣言レギュ + 制約済みメンバー列）。 */
export interface PartySpec<T extends readonly SpeciesId[], R extends RegulationId> {
  readonly regulation: R;
  readonly members: ConstrainParty<T, R>;
}

/** 個体 YAML の生の形（名称は ID 正規化前の文字列）。 */
export interface IndividualFile {
  readonly lang?: Lang;
  readonly species: string;
  readonly nature: { readonly up: string; readonly down: string };
  readonly ability: string;
  readonly item: string;
  readonly points: Record<string, number>;
  readonly moves: readonly string[];
}

/** パーティ Markdown frontmatter の生の形。 */
export interface PartyFrontmatter {
  readonly party: string;
  readonly regulation: string;
  readonly lang?: Lang;
  /** 各メンバー個体ファイルへの相対パス。 */
  readonly members: readonly string[];
}
