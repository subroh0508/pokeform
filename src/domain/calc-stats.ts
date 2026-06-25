import type { NatureSpec } from "../types/nature.ts";
import type { BaseStats, PointAllocation, RealStats, StatKey } from "../types/stats.ts";

/**
 * 実数値計算（純関数・I/O 非依存）。Lv50・個体値31 固定を代入済みの確定式を実装する。
 * HP 以外は **二重 floor**（内側 floor 後に性格補正を掛けてさらに floor）。順序を変えると 1 ずれる。
 * 正本は .claude/rules/game-spec.md（設計俯瞰は docs/design/individuals-and-parties.md）。
 */

/** 性格補正係数（下げ ×0.9 / 無補正 ×1.0 / 上げ ×1.1）。 */
export type NatureMod = 0.9 | 1 | 1.1;

/** 能力ポイントの合計上限（[[game-spec]]）。 */
export const POINT_TOTAL = 66;
/** 1 能力あたりの能力ポイント上限（[[game-spec]]）。 */
export const POINT_MAX_PER_STAT = 32;

/**
 * HP の実数値。`floor((種族値×2 + 31 + ポイント×2) × 50/100 + 60)`。
 * HP には性格補正が掛からない。
 */
export const calcHp = (base: number, point: number): number =>
  Math.floor(((base * 2 + 31 + point * 2) * 50) / 100 + 60);

/**
 * HP 以外の実数値。`floor( floor((種族値×2 + 31 + ポイント×2) × 50/100 + 5) × 性格補正 )`。
 * **二重 floor**: 内側 floor の後に性格補正を掛け、さらに floor する。
 */
export const calcStat = (base: number, point: number, natureMod: NatureMod): number =>
  Math.floor(Math.floor(((base * 2 + 31 + point * 2) * 50) / 100 + 5) * natureMod);

/** 指定能力に対する性格補正係数を返す。上げ能力 ×1.1 / 下げ能力 ×0.9 / それ以外 ×1.0。 */
export const natureModFor = (stat: StatKey, nature: NatureSpec): NatureMod => {
  if (stat === nature.up) return 1.1;
  if (stat === nature.down) return 0.9;
  return 1;
};

/** calcRealStats の入力（種族エントリ）。種族値を持てばよい。 */
export interface CalcStatsEntry {
  readonly baseStats: BaseStats;
}

/** calcRealStats の入力（個体指定）。性格補正とポイント配分を持つ。 */
export interface CalcStatsSpec {
  readonly nature: NatureSpec;
  readonly points: PointAllocation;
}

/** 種族値・性格・ポイント配分から 6 能力の実数値を一括算出する。 */
export const calcRealStats = (entry: CalcStatsEntry, spec: CalcStatsSpec): RealStats => {
  const { baseStats } = entry;
  const { nature, points } = spec;
  return {
    hp: calcHp(baseStats.hp, points.hp),
    attack: calcStat(baseStats.attack, points.attack, natureModFor("attack", nature)),
    defense: calcStat(baseStats.defense, points.defense, natureModFor("defense", nature)),
    spAttack: calcStat(baseStats.spAttack, points.spAttack, natureModFor("spAttack", nature)),
    spDefense: calcStat(baseStats.spDefense, points.spDefense, natureModFor("spDefense", nature)),
    speed: calcStat(baseStats.speed, points.speed, natureModFor("speed", nature)),
  };
};

/**
 * 能力ポイント配分が正当か（合計 = 66 かつ 各能力 0..32）を実行時検証する。
 * 型（PointValue / PointAllocation）で弾けない外部入力（YAML 由来の生値など）向けの保険。
 */
export const isValidPointAllocation = (points: Record<StatKey, number>): boolean => {
  const values = Object.values(points);
  const total = values.reduce((sum, v) => sum + v, 0);
  return total === POINT_TOTAL && values.every((v) => v >= 0 && v <= POINT_MAX_PER_STAT);
};
