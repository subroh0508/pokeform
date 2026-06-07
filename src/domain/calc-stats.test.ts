import { describe, expect, test } from "vitest";
import type { NatureSpec } from "../types/nature.ts";
import { garchomp, gardevoir, knownIndividuals } from "./__fixtures__/known-individuals.ts";
import {
  calcHp,
  calcRealStats,
  calcStat,
  isValidPointAllocation,
  natureModFor,
  POINT_MAX_PER_STAT,
  POINT_TOTAL,
} from "./calc-stats.ts";

describe("calcHp", () => {
  test("ポイント 0 境界", () => {
    // (35*2 + 31 + 0) * 0.5 + 60 = 110.5 → floor 110
    expect(calcHp(35, 0)).toBe(110);
  });

  test("ポイント 32 境界", () => {
    // (35*2 + 31 + 64) * 0.5 + 60 = 142.5 → floor 142
    expect(calcHp(35, 32)).toBe(142);
  });

  test("性格補正は HP に掛からない（既知個体）", () => {
    expect(calcHp(108, 2)).toBe(185);
  });
});

describe("calcStat", () => {
  test("無補正（×1.0）", () => {
    // floor((95*2 + 31) * 0.5 + 5) = floor(115.5) = 115
    expect(calcStat(95, 0, 1)).toBe(115);
  });

  test("下げ補正（×0.9）", () => {
    // floor(floor((65*2 + 31) * 0.5 + 5) * 0.9) = floor(85 * 0.9) = floor(76.5) = 76
    expect(calcStat(65, 0, 0.9)).toBe(76);
  });

  test("上げ補正の二重 floor 境界", () => {
    // 内側 floor = 177、177 * 1.1 = 194.7 → 194。
    // 単一 floor（誤実装）なら floor(177.5 * 1.1) = floor(195.25) = 195 になる。
    expect(calcStat(125, 32, 1.1)).toBe(194);
    expect(calcStat(125, 32, 1.1)).not.toBe(195);
  });

  test("ポイント 0 / 32 境界で値が増える", () => {
    expect(calcStat(80, 0, 1)).toBeLessThan(calcStat(80, 32, 1));
  });
});

describe("natureModFor", () => {
  const nature: NatureSpec = { up: "attack", down: "spAttack" };

  test("上げ能力は ×1.1", () => {
    expect(natureModFor("attack", nature)).toBe(1.1);
  });

  test("下げ能力は ×0.9", () => {
    expect(natureModFor("spAttack", nature)).toBe(0.9);
  });

  test("それ以外は ×1.0", () => {
    expect(natureModFor("defense", nature)).toBe(1);
  });
});

describe("calcRealStats", () => {
  test.each(knownIndividuals)("既知個体 $name の実数値が一致する", (individual) => {
    expect(calcRealStats(individual, individual)).toEqual(individual.expected);
  });

  test("攻撃↑/特攻↓ で攻撃が上がり特攻が下がる（ガブリアス）", () => {
    const real = calcRealStats(garchomp, garchomp);
    expect(real.attack).toBe(200);
    expect(real.spAttack).toBe(90);
  });

  test("特攻↑ の二重 floor 境界（サーナイト）", () => {
    expect(calcRealStats(gardevoir, gardevoir).spAttack).toBe(194);
  });
});

describe("isValidPointAllocation", () => {
  test("定数の確認", () => {
    expect(POINT_TOTAL).toBe(66);
    expect(POINT_MAX_PER_STAT).toBe(32);
  });

  test("合計 66・各 ≤32 は正当", () => {
    expect(isValidPointAllocation(garchomp.points)).toBe(true);
  });

  test("合計が 66 でなければ不正", () => {
    expect(
      isValidPointAllocation({
        hp: 0,
        attack: 0,
        defense: 0,
        spAttack: 0,
        spDefense: 0,
        speed: 0,
      }),
    ).toBe(false);
  });

  test("合計 66 でも 1 能力が 32 超なら不正", () => {
    expect(
      isValidPointAllocation({
        hp: 0,
        attack: 33,
        defense: 33,
        spAttack: 0,
        spDefense: 0,
        speed: 0,
      }),
    ).toBe(false);
  });

  test("負の値は不正", () => {
    expect(
      isValidPointAllocation({
        hp: -1,
        attack: 33,
        defense: 34,
        spAttack: 0,
        spDefense: 0,
        speed: 0,
      }),
    ).toBe(false);
  });
});
