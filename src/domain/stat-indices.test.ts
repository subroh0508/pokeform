import { describe, expect, test } from "vitest";
import type { RealStats } from "../types/stats.ts";
import {
  bulkIndex,
  offenseIndex,
  physicalBulk,
  physicalOffense,
  specialBulk,
  specialOffense,
} from "./stat-indices.ts";

/** ガブリアス相当の実数値（calc-stats の既知個体と整合）。 */
const garchomp: RealStats = {
  hp: 185,
  attack: 200,
  defense: 115,
  spAttack: 90,
  spDefense: 105,
  speed: 154,
};

describe("bulkIndex / offenseIndex", () => {
  test("耐久指数は HP × 防御", () => {
    expect(bulkIndex(185, 115)).toBe(21275);
  });

  test("火力指数は 攻撃 × 威力", () => {
    expect(offenseIndex(200, 100)).toBe(20000);
  });

  test("0 振り境界（HP 0・威力 0）", () => {
    expect(bulkIndex(0, 115)).toBe(0);
    expect(offenseIndex(200, 0)).toBe(0);
  });
});

describe("physical/special 指数", () => {
  test("物理耐久は HP×防御・特殊耐久は HP×特防", () => {
    expect(physicalBulk(garchomp)).toBe(185 * 115);
    expect(specialBulk(garchomp)).toBe(185 * 105);
  });

  test("物理火力は攻撃×威力・特殊火力は特攻×威力", () => {
    expect(physicalOffense(garchomp, 100)).toBe(200 * 100);
    expect(specialOffense(garchomp, 100)).toBe(90 * 100);
  });
});
