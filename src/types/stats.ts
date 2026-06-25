/**
 * 能力値まわりの基本型。種族値（BaseStats）・実数値（RealStats）・能力ポイント配分
 * （PointAllocation）を 6 能力（StatKey）で統一表現する。計算式は `src/domain/calc-stats.ts`。
 * 詳細は .claude/rules/game-spec.md（設計俯瞰は docs/design/individuals-and-parties.md）を参照。
 */

/** 6 能力のキー。HP のみ性格補正が掛からない（[[game-spec]]）。 */
export type StatKey = "hp" | "attack" | "defense" | "spAttack" | "spDefense" | "speed";

/** 6 能力を値 `T` で持つテーブル。BaseStats / RealStats / PointAllocation の共通形。 */
export type StatTable<T> = { readonly [K in StatKey]: T };

/** 種族値（各能力の素の値）。 */
export type BaseStats = StatTable<number>;

/** 算出済みの実数値（Lv50・個体値31 固定の確定値）。 */
export type RealStats = StatTable<number>;

/** 能力ポイントの取りうる値 0..32（1 能力あたり最大 32・[[game-spec]]）。 */
export type PointValue = Enumerate<33>;

/** 各能力への能力ポイント配分（合計 66・各 0..32）。 */
export type PointAllocation = StatTable<PointValue>;

/** `0 | 1 | ... | N-1` の数値リテラル union を生成する型レベルヘルパ。 */
type Enumerate<N extends number, Acc extends number[] = []> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;
