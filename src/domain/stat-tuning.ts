import type { PointAllocation, StatKey, StatTable } from "../types/stats.ts";
import { calcHp, calcStat, type NatureMod, POINT_MAX_PER_STAT, POINT_TOTAL } from "./calc-stats.ts";
import { type DamageInput, maxDamage } from "./damage.ts";

/**
 * ステータス調整の**ポイント逆算**と**調整提案レポート**の純関数（I/O 非依存）。
 * 「素早さ □□ 抜き」「攻撃 ○○ の技を確定耐え」等の目標ラインから、合計 66 / 各 ≤32 の制約内で
 * 必要な能力ポイント配分を解探索する。実現不能（32 振りでも届かない）は `null` で報告する。
 * 逆算結果を `calc-stats` に通すと目標ラインを満たすことをテストで往復検証する（[[game-spec]]）。
 *
 * 解は一意でない（合計 66 の中で複数配分が成立する）ため、確定耐えは HP / 防御の**フロンティア**
 * （各 HP 振りに対する最小防御振り）を候補列挙し、余剰ポイントの振り先指針はレポートで添える。
 */

/** 単調増加な実数値関数 `realOf` が `target` 以上になる**最小の能力ポイント**を返す。届かなければ null。 */
export const minPointForTarget = (
  realOf: (point: number) => number,
  target: number,
  max: number = POINT_MAX_PER_STAT,
): number | null => {
  for (let p = 0; p <= max; p++) {
    if (realOf(p) >= target) return p;
  }
  return null;
};

/** 「素早さ □□ 抜き」の逆算結果（最小素早さ振りと到達実数値）。 */
export interface OutspeedResult {
  readonly speedPoint: number;
  readonly speed: number;
}

/**
 * 目標素早さ実数値 `targetSpeed` 以上に到達する最小の素早さ振りを逆算する。
 * 相手を「抜く」なら呼び出し側が `相手の素早さ + 1` を渡す。32 振りでも届かなければ null。
 */
export const solveOutspeed = (
  baseSpeed: number,
  natureMod: NatureMod,
  targetSpeed: number,
): OutspeedResult | null => {
  const realOf = (p: number): number => calcStat(baseSpeed, p, natureMod);
  const speedPoint = minPointForTarget(realOf, targetSpeed);
  if (speedPoint === null) return null;
  return { speedPoint, speed: realOf(speedPoint) };
};

/** 「攻撃 ○○ の技を確定耐え」逆算の入力（攻撃側の確定値 + 防御側の素種族・性格補正）。 */
export interface SurvivalInput {
  /** 防御側の HP 種族値。 */
  readonly baseHp: number;
  /** 防御側の防御系種族値（物理 = 防御 / 特殊 = 特防）。 */
  readonly baseDefense: number;
  /** 防御系への性格補正係数（×0.9 / 1.0 / 1.1）。 */
  readonly defenseNatureMod: NatureMod;
  /** 攻撃側の技威力・攻撃実数値・タイプ補正（防御実数値は逆算で差し替える）。 */
  readonly attacker: Omit<DamageInput, "defense">;
}

/** 確定耐えの 1 解（HP 振り・防御振りとその実数値・合計振り）。 */
export interface SurvivalSolution {
  readonly hpPoint: number;
  readonly defensePoint: number;
  readonly hp: number;
  readonly defense: number;
  /** HP 振り + 防御振りの合計。 */
  readonly total: number;
}

/**
 * 確定耐え（乱数最大でも耐える = HP > maxDamage）を満たす HP / 防御振りのフロンティアを逆算する。
 * 各 HP 振り（0..32）について耐えるのに必要な最小防御振りを求め、成立解を合計振りの昇順で返す。
 * HP 32 振り + 防御 32 振りでも耐えられなければ `null`（実現不能）。
 */
export const solveSurvival = (input: SurvivalInput): SurvivalSolution[] | null => {
  const { baseHp, baseDefense, defenseNatureMod, attacker } = input;
  const solutions: SurvivalSolution[] = [];
  for (let hpPoint = 0; hpPoint <= POINT_MAX_PER_STAT; hpPoint++) {
    const hp = calcHp(baseHp, hpPoint);
    const defensePoint = minPointForTarget((p) => {
      const defense = calcStat(baseDefense, p, defenseNatureMod);
      // 「耐える」= HP が乱数最大ダメージを上回る。realOf が単調増加になるよう符号を反転して扱う。
      return hp > maxDamage({ ...attacker, defense }) ? 1 : 0;
    }, 1);
    if (defensePoint === null) continue;
    const defense = calcStat(baseDefense, defensePoint, defenseNatureMod);
    solutions.push({ hpPoint, defensePoint, hp, defense, total: hpPoint + defensePoint });
  }
  if (solutions.length === 0) return null;
  return [...solutions].sort((a, b) => a.total - b.total);
};

/** 調整提案レポート（現状配分 vs 目標配分の差分・余剰ポイントと振り先候補）。 */
export interface TuningReport {
  readonly current: PointAllocation;
  readonly target: PointAllocation;
  /** 能力ごとの増減（target − current）。 */
  readonly deltas: StatTable<number>;
  /** 目標配分が消費するポイント合計。 */
  readonly used: number;
  /** 余剰ポイント（66 − used）。負なら予算超過。 */
  readonly surplus: number;
  /** 余剰の振り先候補（目標で 32 未満＝まだ伸ばせる能力）。 */
  readonly surplusCandidates: readonly StatKey[];
  /** 目標配分が制約（各 0..32・合計 ≤66）を満たすか。 */
  readonly feasible: boolean;
}

const STAT_KEYS: readonly StatKey[] = ["hp", "attack", "defense", "spAttack", "spDefense", "speed"];

/**
 * 現状配分 `current` と逆算で得た目標配分 `target` を突き合わせ、増減・余剰・振り先候補を整理する。
 * 余剰は合計 66 から目標消費分を引いた値で、振り先候補は目標でまだ 32 未満の能力。
 */
export const buildTuningReport = (
  current: PointAllocation,
  target: PointAllocation,
): TuningReport => {
  const deltas = {} as { [K in StatKey]: number };
  const surplusCandidates: StatKey[] = [];
  let used = 0;
  let withinPerStat = true;
  for (const key of STAT_KEYS) {
    deltas[key] = target[key] - current[key];
    used += target[key];
    if (target[key] < POINT_MAX_PER_STAT) surplusCandidates.push(key);
    if (target[key] < 0 || target[key] > POINT_MAX_PER_STAT) withinPerStat = false;
  }
  const surplus = POINT_TOTAL - used;
  return {
    current,
    target,
    deltas,
    used,
    surplus,
    surplusCandidates,
    feasible: withinPerStat && used <= POINT_TOTAL,
  };
};
