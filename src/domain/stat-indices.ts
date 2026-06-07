import type { RealStats } from "../types/stats.ts";

/**
 * 耐久指数・火力指数の純関数（I/O 非依存・`calc-stats` の実数値上に実装）。
 * ステータス調整の壁打ちで「物理/特殊どちらの耐久に寄っているか」「火力の伸びしろ」を
 * 一目で比較するための無次元の指標。定義は .claude/rules/game-spec.md（耐久/火力指数）。
 *
 * - **耐久指数** = HP実数値 × 防御系実数値（物理 = HP×B / 特殊 = HP×D）。被ダメージは
 *   防御に反比例し HP に反比例するため、HP×防御 が大きいほど確定数が伸びる近似指標になる。
 * - **火力指数** = 攻撃系実数値 × 技威力。素ダメージ（乱数・タイプ補正前）に比例する近似指標。
 */

/** 耐久指数 = HP × 防御系実数値。物理 / 特殊で防御側の実数値を差し替えて使う。 */
export const bulkIndex = (hp: number, defense: number): number => hp * defense;

/** 物理耐久指数（HP × 防御）。 */
export const physicalBulk = (real: RealStats): number => bulkIndex(real.hp, real.defense);

/** 特殊耐久指数（HP × 特防）。 */
export const specialBulk = (real: RealStats): number => bulkIndex(real.hp, real.spDefense);

/** 火力指数 = 攻撃系実数値 × 技威力。素ダメージに比例する近似指標。 */
export const offenseIndex = (attack: number, power: number): number => attack * power;

/** 物理火力指数（攻撃 × 技威力）。 */
export const physicalOffense = (real: RealStats, power: number): number =>
  offenseIndex(real.attack, power);

/** 特殊火力指数（特攻 × 技威力）。 */
export const specialOffense = (real: RealStats, power: number): number =>
  offenseIndex(real.spAttack, power);
