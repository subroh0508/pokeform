import type { NatureSpec } from "../../types/nature.ts";
import type { BaseStats, PointAllocation, RealStats } from "../../types/stats.ts";

/**
 * 既知個体の実数値照合 fixture（Lv50・個体値31 固定）。
 * expected は計算式（[[game-spec]]）を手計算で展開した確定値。テストはこれと calcRealStats を照合する。
 * 特に Gardevoir の spAttack は **二重 floor の境界**（単一 floor だと 195 になるが、二重 floor は 194）。
 */
export interface KnownIndividual {
  readonly name: string;
  readonly baseStats: BaseStats;
  readonly nature: NatureSpec;
  readonly points: PointAllocation;
  readonly expected: RealStats;
}

/**
 * ガブリアス: 攻撃↑/特攻↓、攻撃 32・素早さ 32・HP 2 振り（合計 66）。
 * 攻撃 200 / 特攻 90 で二重 floor と性格補正（×1.1 / ×0.9）・ポイント 0/32 境界を網羅。
 */
export const garchomp: KnownIndividual = {
  name: "garchomp",
  baseStats: { hp: 108, attack: 130, defense: 95, spAttack: 80, spDefense: 85, speed: 102 },
  nature: { up: "attack", down: "spAttack" },
  points: { hp: 2, attack: 32, defense: 0, spAttack: 0, spDefense: 0, speed: 32 },
  expected: { hp: 185, attack: 200, defense: 115, spAttack: 90, spDefense: 105, speed: 154 },
};

/**
 * サーナイト: 特攻↑/攻撃↓、特攻 32・素早さ 32・HP 2 振り（合計 66）。
 * 特攻 194 は二重 floor の端数境界（内側 floor 177 → ×1.1 = 194.7 → 194。単一 floor だと 177.5×1.1 → 195）。
 */
export const gardevoir: KnownIndividual = {
  name: "gardevoir",
  baseStats: { hp: 68, attack: 65, defense: 65, spAttack: 125, spDefense: 115, speed: 80 },
  nature: { up: "spAttack", down: "attack" },
  points: { hp: 2, attack: 0, defense: 0, spAttack: 32, spDefense: 0, speed: 32 },
  expected: { hp: 145, attack: 76, defense: 85, spAttack: 194, spDefense: 135, speed: 132 },
};

/** 照合対象の全既知個体。 */
export const knownIndividuals: readonly KnownIndividual[] = [garchomp, gardevoir];
