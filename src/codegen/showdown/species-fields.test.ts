import { describe, expect, it } from "vitest";
import {
  orderedAbilityIds,
  resolveSpeciesId,
  type SpeciesInput,
  speciesEnName,
  speciesId,
  speciesMoveIds,
  speciesStructuralFields,
} from "./species-fields.ts";

const venusaur: SpeciesInput = {
  num: 3,
  name: "Venusaur",
  baseSpecies: "Venusaur",
  types: ["Grass", "Poison"],
  baseStats: { hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80 },
  abilities: { 0: "Overgrow", H: "Chlorophyll" },
  learnset: ["Sludge Bomb", "Giga Drain", "Acid Spray"],
};

describe("orderedAbilityIds", () => {
  it("orders slots 0 → 1 → H → S and kebab-ifies", () => {
    expect(
      orderedAbilityIds({ 0: "Sand Veil", 1: "Rough Skin", H: "Sand Force", S: "Mold Breaker" }),
    ).toEqual(["sand-veil", "rough-skin", "sand-force", "mold-breaker"]);
  });

  it("skips absent slots", () => {
    expect(orderedAbilityIds({ 0: "Overgrow", H: "Chlorophyll" })).toEqual([
      "overgrow",
      "chlorophyll",
    ]);
  });

  it("dedupes when two slots resolve to the same id", () => {
    expect(orderedAbilityIds({ 0: "Levitate", H: "Levitate" })).toEqual(["levitate"]);
  });
});

describe("speciesId", () => {
  it("derives a kebab id from the display name", () => {
    expect(speciesId({ ...venusaur, name: "Rotom-Wash" })).toBe("rotom-wash");
  });

  it("normalizes a showdown bare default forme to its short canonical id", () => {
    expect(speciesId({ ...venusaur, name: "Urshifu" })).toBe("urshifu-single");
  });
});

describe("resolveSpeciesId", () => {
  it("keeps the canonical id when it exists in languages (distinct forme)", () => {
    // rotom-wash は languages に在る distinct forme ゆえ畳まない。
    const inLanguages = (id: string): boolean => id === "rotom-wash";
    expect(
      resolveSpeciesId({ ...venusaur, name: "Rotom-Wash", baseSpecies: "Rotom" }, inLanguages),
    ).toBe("rotom-wash");
  });

  it("folds a cosmetic forme absent from languages down to its base", () => {
    // languages が純装飾（vivillon 模様）を除外し base だけ持つ結果を流用して base へ畳む。
    const inLanguages = (id: string): boolean => id === "vivillon";
    expect(
      resolveSpeciesId(
        { ...venusaur, name: "Vivillon-Archipelago", baseSpecies: "Vivillon" },
        inLanguages,
      ),
    ).toBe("vivillon");
  });

  it("returns the forme id unfolded when neither it nor its base is in languages (new id)", () => {
    // 新規 distinct 種は base も languages に無く、cosmetic と区別して畳まず generate へ顕在化させる。
    expect(
      resolveSpeciesId({ ...venusaur, name: "Newmon", baseSpecies: "Newmon" }, () => false),
    ).toBe("newmon");
  });
});

describe("speciesStructuralFields", () => {
  it("builds dex / lowercased types / stats table / ordered abilities", () => {
    expect(speciesStructuralFields(venusaur)).toEqual({
      dex: 3,
      types: ["grass", "poison"],
      stats: { H: 80, A: 82, B: 83, C: 100, D: 100, S: 80 },
      abilities: ["overgrow", "chlorophyll"],
    });
  });
});

describe("speciesEnName", () => {
  it("carries the showdown display name as en", () => {
    expect(speciesEnName(venusaur)).toEqual({ en: "Venusaur" });
  });
});

describe("speciesMoveIds", () => {
  it("kebab-ifies and sorts the learnset by id", () => {
    expect(speciesMoveIds(venusaur)).toEqual(["acid-spray", "giga-drain", "sludge-bomb"]);
  });
});
