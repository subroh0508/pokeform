import { describe, expect, it } from "vitest";
import { typeSpecsDex } from "../../data/generated/champions/type-specs.ts";
import { chart } from "./__fixtures__/chart.ts";
import { buildChart, effectiveness } from "./type-effectiveness.ts";

describe("buildChart", () => {
  it("typeSpecsDex から攻撃→防御の倍率表を構築する", () => {
    const built = buildChart(typeSpecsDex);
    expect(built.fire.grass).toBe(2);
    expect(built.fire.water).toBe(0.5);
    // 18 タイプすべてが攻撃キーに揃う
    expect(Object.keys(built)).toHaveLength(18);
  });
});

describe("effectiveness", () => {
  it("単タイプの代表セル（抜群 / 半減 / 等倍 / 無効）", () => {
    expect(effectiveness(chart, "fire", ["grass"])).toBe(2); // 抜群
    expect(effectiveness(chart, "fire", ["fire"])).toBe(0.5); // 半減
    expect(effectiveness(chart, "ground", ["electric"])).toBe(2); // 抜群
    expect(effectiveness(chart, "normal", ["ghost"])).toBe(0); // 無効
    expect(effectiveness(chart, "ground", ["flying"])).toBe(0); // 無効
  });

  it("複合タイプは積（×4 / ×0.25 / ×0）", () => {
    expect(effectiveness(chart, "ice", ["dragon", "ground"])).toBe(4); // ×4
    expect(effectiveness(chart, "fire", ["water", "rock"])).toBe(0.25); // ×0.25
    expect(effectiveness(chart, "ground", ["flying", "steel"])).toBe(0); // 一方が無効なら ×0
  });

  it("防御タイプが空なら等倍 (1)", () => {
    expect(effectiveness(chart, "fire", [])).toBe(1);
  });
});
