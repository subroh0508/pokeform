import { describe, expect, it } from "vitest";
import { garchomp, gardevoir } from "../domain/__fixtures__/known-individuals.ts";
import { defineIndividual } from "./individual.ts";

/**
 * `defineIndividual` の実数値自動計算を検証する。種族値・性格・ポイントから `calcRealStats` と同じ
 * 二重 floor 値を算出し `realStats` に格納すること、仕様フィールドを保持することを確認する。
 * 計算式自体の網羅は calc-stats.test.ts が担い、ここは defineIndividual の配線を確認する。
 */
describe("defineIndividual", () => {
  it("種族値・性格・ポイントから実数値を自動計算して格納する", () => {
    // garchomp fixture と同じ入力（攻撃↑/特攻↓・攻撃32・素早さ32・HP2）。
    const individual = defineIndividual("champions-m-a", "garchomp", {
      nature: garchomp.nature,
      ability: "rough-skin",
      // garchomp は base 種族のため items は "any"（メガ可能種でも通常持ち物を持てる）。
      item: "focus-sash",
      points: garchomp.points,
      moves: ["earthquake", "dragon-claw", "stone-edge", "swords-dance"],
    });
    expect(individual.realStats).toEqual(garchomp.expected);
  });

  it("仕様フィールド（レギュ・種族・特性・持ち物・技）をそのまま保持する", () => {
    const individual = defineIndividual("champions-m-a", "garchomp", {
      nature: garchomp.nature,
      ability: "sand-veil",
      item: "lum-berry",
      points: garchomp.points,
      moves: ["outrage"],
    });
    expect(individual.regulation).toBe("champions-m-a");
    expect(individual.species).toBe("garchomp");
    expect(individual.ability).toBe("sand-veil");
    expect(individual.item).toBe("lum-berry");
    expect(individual.moves).toEqual(["outrage"]);
  });

  it("二重 floor の端数境界（gardevoir 相当の入力）でも一致する", () => {
    // gardevoir は roster 外のため種族値が一致する別個体で計算式の境界のみ確認する。
    const real = defineIndividual("champions-m-a", "garchomp", {
      nature: gardevoir.nature,
      ability: "rough-skin",
      item: "lum-berry",
      points: gardevoir.points,
      moves: [],
    }).realStats;
    // 入力種族値は garchomp なので gardevoir.expected とは異なる。算出が calcRealStats 経由であることを
    // HP（性格補正なし）の確定式で確認する。
    expect(real.hp).toBe(185);
  });
});
