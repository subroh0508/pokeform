import type { PokemonType } from "../types/type-chart.ts";
import { type EffectivenessChart, effectiveness } from "./type-effectiveness.ts";

/**
 * パーティの技範囲（攻撃カバレッジの穴）と防御弱点（弱点集中）を集計する純関数群。
 * MVP の価値の核（設計俯瞰は docs/design/individuals-and-parties.md「分析が答える問い」）。
 * I/O 非依存: メンバーの「防御タイプ」「攻撃技タイプ」を受け取り集計する（メガ展開・名称解決は
 * 呼び出し側 = CLI が担う）。脆弱判定は防御弱点の集中（weakCount ≥ 閾値）で行う（[[cli-and-io]]）。
 */

/** 防御弱点が「集中」とみなされるメンバー数の閾値（これ以上で脆弱警告）。 */
export const VULNERABLE_WEAK_COUNT = 3;

/** 分析対象の 1 メンバー（種別解決・メガ展開済みのタイプ集合を持つ）。 */
export interface CoverageMember {
  readonly id: string;
  readonly name: string;
  /** 防御時に有効なタイプ（メガ個体はメガ先タイプ）。 */
  readonly defenseTypes: readonly PokemonType[];
  /** 攻撃技のタイプ集合（`damageClass != "status"` を抽出済み）。 */
  readonly attackTypes: readonly PokemonType[];
}

/** 攻撃タイプ A ごとの防御弱点集計。 */
export interface WeaknessRow {
  readonly type: PokemonType;
  /** 倍率 ≥ 2 のメンバー数。 */
  readonly weakCount: number;
  /** 倍率 ≤ 0.5（無効 0 を含む）のメンバー数。 */
  readonly resistCount: number;
  /** weakCount ≥ VULNERABLE_WEAK_COUNT。 */
  readonly vulnerable: boolean;
}

/** 攻撃カバレッジの穴（パーティ全体で等倍超を出せない防御タイプ）。 */
export interface CoverageHole {
  readonly type: PokemonType;
  /** パーティの攻撃技タイプ集合での最大倍率（< 2 が穴）。 */
  readonly bestMultiplier: number;
}

/** カバレッジ分析の結果。 */
export interface CoverageReport {
  readonly weaknesses: readonly WeaknessRow[];
  readonly holes: readonly CoverageHole[];
  /** いずれかの攻撃タイプで弱点が集中していれば true（脆弱・非0終了の根拠）。 */
  readonly vulnerable: boolean;
}

/** パーティ全体の攻撃技タイプ集合（重複排除）。 */
const arsenalOf = (members: readonly CoverageMember[]): readonly PokemonType[] => {
  const set = new Set<PokemonType>();
  for (const m of members) for (const t of m.attackTypes) set.add(t);
  return [...set];
};

/** 攻撃タイプごとの防御弱点（weakCount / resistCount / vulnerable）を集計する。 */
export const analyzeWeaknesses = (
  members: readonly CoverageMember[],
  chart: EffectivenessChart,
): readonly WeaknessRow[] => {
  const attackTypes = Object.keys(chart) as PokemonType[];
  return attackTypes.map((type) => {
    let weakCount = 0;
    let resistCount = 0;
    for (const m of members) {
      const mult = effectiveness(chart, type, m.defenseTypes);
      if (mult >= 2) {
        weakCount += 1;
      } else if (mult <= 0.5) {
        resistCount += 1;
      }
    }
    return { type, weakCount, resistCount, vulnerable: weakCount >= VULNERABLE_WEAK_COUNT };
  });
};

/** パーティが等倍超を出せない防御タイプ（攻撃カバレッジの穴）を列挙する。 */
export const findCoverageHoles = (
  members: readonly CoverageMember[],
  chart: EffectivenessChart,
): readonly CoverageHole[] => {
  const arsenal = arsenalOf(members);
  const defenseTypes = Object.keys(chart) as PokemonType[];
  const holes: CoverageHole[] = [];
  for (const def of defenseTypes) {
    let best = 0;
    for (const attack of arsenal) {
      const mult = chart[attack][def];
      if (mult > best) best = mult;
    }
    if (best < 2) holes.push({ type: def, bestMultiplier: best });
  }
  return holes;
};

/** 防御弱点と攻撃カバレッジの穴をまとめて分析する（CLI が結果を表に整形する）。 */
export const analyzeCoverage = (
  members: readonly CoverageMember[],
  chart: EffectivenessChart,
): CoverageReport => {
  const weaknesses = analyzeWeaknesses(members, chart);
  const holes = findCoverageHoles(members, chart);
  return { weaknesses, holes, vulnerable: weaknesses.some((w) => w.vulnerable) };
};
