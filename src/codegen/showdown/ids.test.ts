import { describe, expect, it } from "vitest";
import { kebabId, toStatsTable, toTypeId } from "./ids.ts";

describe("kebabId", () => {
  it("lowercases a single word", () => {
    expect(kebabId("Garchomp")).toBe("garchomp");
  });

  it("preserves internal hyphens", () => {
    expect(kebabId("Rotom-Wash")).toBe("rotom-wash");
    expect(kebabId("Charizard-Mega-X")).toBe("charizard-mega-x");
  });

  it("turns spaces into hyphens", () => {
    expect(kebabId("Dragon Claw")).toBe("dragon-claw");
    expect(kebabId("Charizardite X")).toBe("charizardite-x");
  });

  it("strips apostrophes (straight and curly) before hyphenating", () => {
    expect(kebabId("King's Rock")).toBe("kings-rock");
    expect(kebabId("Farfetch’d")).toBe("farfetchd");
  });

  it("collapses runs of separators and trims edge hyphens", () => {
    expect(kebabId("Mr. Mime")).toBe("mr-mime");
    expect(kebabId("  Type: Null  ")).toBe("type-null");
  });
});

describe("toTypeId", () => {
  it("lowercases a showdown type name", () => {
    expect(toTypeId("Grass")).toBe("grass");
    expect(toTypeId("FIRE")).toBe("fire");
  });
});

describe("toStatsTable", () => {
  it("maps showdown baseStats to the H/A/B/C/D/S table", () => {
    expect(toStatsTable({ hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80 })).toEqual({
      H: 80,
      A: 82,
      B: 83,
      C: 100,
      D: 100,
      S: 80,
    });
  });
});
