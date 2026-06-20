import { describe, expect, test } from "vitest";
import { baseDamage, LEVEL, maxDamage, minDamage } from "./damage.ts";

describe("baseDamage", () => {
  test("Lv50 既定（ガブリアス地震・攻撃200 → 防御115）", () => {
    // 22*100*200 = 440000 → floor(440000/115)=3826 → floor(3826/50)=76 → +2 = 78
    expect(baseDamage(100, 200, 115)).toBe(78);
  });

  test("レベル明示指定で値が変わる", () => {
    expect(LEVEL).toBe(50);
    // Lv100: floor(2*100/5)+2 = 42。42*100*200=840000 → floor(/115)=7304 → floor(/50)=146 → +2 =148
    expect(baseDamage(100, 200, 115, 100)).toBe(148);
  });
});

describe("maxDamage", () => {
  test("STAB なし・等倍（既定）は素ダメージと一致", () => {
    expect(maxDamage({ power: 100, attack: 200, defense: 115 })).toBe(78);
  });

  test("STAB ×1.5", () => {
    // 78 * 1.5 = 117
    expect(maxDamage({ power: 100, attack: 200, defense: 115, stab: true })).toBe(117);
  });

  test("タイプ相性 ×2", () => {
    expect(maxDamage({ power: 100, attack: 200, defense: 115, effectiveness: 2 })).toBe(156);
  });

  test("STAB + 抜群 ×2 の合成（floor 段階）", () => {
    // floor(78*1.5)=117 → floor(117*2)=234
    expect(maxDamage({ power: 100, attack: 200, defense: 115, stab: true, effectiveness: 2 })).toBe(
      234,
    );
  });

  test("無効（×0）は 0", () => {
    expect(maxDamage({ power: 100, attack: 200, defense: 115, effectiveness: 0 })).toBe(0);
  });
});

describe("minDamage", () => {
  test("乱数最小は max の 0.85 倍 floor", () => {
    // floor(78 * 0.85) = floor(66.3) = 66
    expect(minDamage({ power: 100, attack: 200, defense: 115 })).toBe(66);
  });
});
