import { describe, expect, test } from "vitest";
import type { PointAllocation } from "../types/stats.ts";
import { calcHp, calcStat } from "./calc-stats.ts";
import { maxDamage } from "./damage.ts";
import {
  buildTuningReport,
  minPointForTarget,
  solveOutspeed,
  solveSurvival,
} from "./stat-tuning.ts";

describe("minPointForTarget", () => {
  test("単調増加関数が target に届く最小ポイントを返す", () => {
    // realOf(p) = p*10 → target 25 は p=3（30）で初めて到達
    expect(minPointForTarget((p) => p * 10, 25)).toBe(3);
  });

  test("0 振りで既に満たすなら 0", () => {
    expect(minPointForTarget((p) => 100 + p, 100)).toBe(0);
  });

  test("32 振りでも届かなければ null", () => {
    expect(minPointForTarget((p) => p, 1000)).toBeNull();
  });
});

describe("solveOutspeed", () => {
  test("素早さ目標に届く最小振りを逆算し、calc-stats と往復整合する（ガブリアス・素早↑）", () => {
    // 素早さ無振り = calcStat(102,0,1.1)
    const target = calcStat(102, 16, 1.1); // 16 振り相当の実数値を目標に
    const result = solveOutspeed(102, 1.1, target);
    expect(result).not.toBeNull();
    if (result === null) return;
    // 逆算ポイントを calc-stats に通すと目標以上（往復整合）
    expect(calcStat(102, result.speedPoint, 1.1)).toBeGreaterThanOrEqual(target);
    expect(result.speed).toBeGreaterThanOrEqual(target);
    // 16 振りちょうどで届くので 16 を超えない
    expect(result.speedPoint).toBeLessThanOrEqual(16);
  });

  test("到達不能な素早さ目標は null", () => {
    expect(solveOutspeed(50, 0.9, 9999)).toBeNull();
  });
});

describe("solveSurvival", () => {
  const input = {
    baseHp: 108,
    baseDefense: 95,
    defenseNatureMod: 1 as const,
    attacker: { power: 120, attack: 200, stab: true },
  };

  test("確定耐えの解を合計振り昇順で返し、各解が calc-stats と往復整合する", () => {
    const solutions = solveSurvival(input);
    expect(solutions).not.toBeNull();
    if (solutions === null) return;
    expect(solutions.length).toBeGreaterThan(0);
    // 合計振り昇順
    let prevTotal = Number.NEGATIVE_INFINITY;
    for (const s of solutions) {
      expect(s.total).toBeGreaterThanOrEqual(prevTotal);
      prevTotal = s.total;
    }
    // 各解を calc-stats に通すと確定耐え（HP > 乱数最大ダメージ）が成立（往復整合）
    for (const s of solutions) {
      expect(calcHp(108, s.hpPoint)).toBe(s.hp);
      expect(calcStat(95, s.defensePoint, 1)).toBe(s.defense);
      expect(s.hp).toBeGreaterThan(maxDamage({ ...input.attacker, defense: s.defense }));
    }
  });

  test("32 振りでも耐えられない火力は null（実現不能）", () => {
    expect(
      solveSurvival({
        baseHp: 1,
        baseDefense: 1,
        defenseNatureMod: 0.9,
        attacker: { power: 250, attack: 500, stab: true, effectiveness: 4 },
      }),
    ).toBeNull();
  });
});

describe("buildTuningReport", () => {
  const current: PointAllocation = {
    hp: 0,
    attack: 32,
    defense: 0,
    spAttack: 0,
    spDefense: 0,
    speed: 32,
  };

  test("実現可能な目標: 増減・余剰・振り先候補を整理する", () => {
    const target: PointAllocation = {
      hp: 32,
      attack: 0,
      defense: 4,
      spAttack: 0,
      spDefense: 0,
      speed: 30,
    };
    const report = buildTuningReport(current, target);
    expect(report.feasible).toBe(true);
    expect(report.used).toBe(66);
    expect(report.surplus).toBe(0);
    expect(report.deltas.hp).toBe(32);
    expect(report.deltas.attack).toBe(-32);
    // 32 ちょうどの hp は振り先候補に含まれない、それ未満は含まれる
    expect(report.surplusCandidates).not.toContain("hp");
    expect(report.surplusCandidates).toContain("defense");
  });

  test("余剰がある目標: surplus は正", () => {
    const target: PointAllocation = {
      hp: 4,
      attack: 0,
      defense: 0,
      spAttack: 0,
      spDefense: 0,
      speed: 0,
    };
    const report = buildTuningReport(current, target);
    expect(report.surplus).toBe(62);
    expect(report.feasible).toBe(true);
  });

  test("合計が 66 超なら実現不能", () => {
    const target = {
      hp: 32,
      attack: 32,
      defense: 32,
      spAttack: 0,
      spDefense: 0,
      speed: 0,
    } as unknown as PointAllocation;
    expect(buildTuningReport(current, target).feasible).toBe(false);
  });

  test("1 能力が 32 超なら実現不能", () => {
    const target = {
      hp: 33,
      attack: 0,
      defense: 0,
      spAttack: 0,
      spDefense: 0,
      speed: 0,
    } as unknown as PointAllocation;
    expect(buildTuningReport(current, target).feasible).toBe(false);
  });

  test("負の振りは実現不能", () => {
    const target = {
      hp: -1,
      attack: 0,
      defense: 0,
      spAttack: 0,
      spDefense: 0,
      speed: 0,
    } as unknown as PointAllocation;
    expect(buildTuningReport(current, target).feasible).toBe(false);
  });
});
