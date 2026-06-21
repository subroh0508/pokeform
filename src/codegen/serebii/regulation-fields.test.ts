import { describe, expect, it } from "vitest";
import type { ParsedMove, ParsedSpecies } from "./parse.ts";
import { megaAuthoring, megaSpeciesId, regMoveIds, sortedUnion } from "./regulation-fields.ts";

const mega = (name: string) => ({
  name,
  types: ["fire", "dragon"],
  abilities: ["tough-claws"],
  stats: { H: 78, A: 130, B: 111, C: 130, D: 85, S: 100 },
  statTotal: 634,
});

const move = (over: Partial<ParsedMove>): ParsedMove => ({
  name: "Earthquake",
  id: "earthquake",
  ...over,
});

const species = (over: Partial<ParsedSpecies>): ParsedSpecies => ({
  en: "Garchomp",
  dex: 445,
  types: ["dragon", "ground"],
  abilities: ["sand-veil", "rough-skin"],
  stats: { H: 108, A: 130, B: 95, C: 80, D: 85, S: 102 },
  statTotal: 600,
  moves: [],
  megas: [],
  ...over,
});

describe("regMoveIds", () => {
  it("returns deduped, sorted per-reg move ids", () => {
    const p = species({
      moves: [move({ id: "earthquake" }), move({ id: "aerial-ace" }), move({ id: "earthquake" })],
    });
    expect(regMoveIds(p)).toEqual(["aerial-ace", "earthquake"]);
  });
});

describe("sortedUnion", () => {
  it("merges two id lists deduped and sorted", () => {
    expect(sortedUnion(["leftovers", "life-orb"], ["focus-sash", "leftovers"])).toEqual([
      "focus-sash",
      "leftovers",
      "life-orb",
    ]);
  });
});

describe("megaSpeciesId", () => {
  it("derives the single mega id (no suffix)", () => {
    expect(megaSpeciesId("garchomp", "Mega Garchomp")).toBe("garchomp-mega");
  });

  it("derives X/Y mega ids from the trailing branch suffix", () => {
    expect(megaSpeciesId("charizard", "Mega Charizard X")).toBe("charizard-mega-x");
    expect(megaSpeciesId("charizard", "Mega Charizard Y")).toBe("charizard-mega-y");
  });

  it("ignores the base display name (en≠slug regional forms stay intact)", () => {
    // base 表示名をパースせず baseSlug を使うので、表示名がスラグと異なっても破綻しない。
    expect(megaSpeciesId("lopunny", "Mega Lopunny")).toBe("lopunny-mega");
  });

  it("escalates (null) for non 'Mega ' forms like Primal", () => {
    expect(megaSpeciesId("kyogre", "Primal Kyogre")).toBeNull();
    expect(megaSpeciesId("groudon", "Groudon")).toBeNull();
  });

  it("escalates (null) when the derived id is not a catalog id shape", () => {
    expect(megaSpeciesId("", "Mega Charizard X")).toBeNull();
  });
});

describe("megaAuthoring", () => {
  it("plans ids + species entries for X/Y megas and dedupes/sorts ids", () => {
    const p = species({
      en: "Charizard",
      megas: [mega("Mega Charizard Y"), mega("Mega Charizard X")],
    });
    expect(megaAuthoring("charizard", p)).toEqual({
      ids: ["charizard-mega-x", "charizard-mega-y"],
      speciesEntries: [
        { id: "charizard-mega-y", en: "Mega Charizard Y" },
        { id: "charizard-mega-x", en: "Mega Charizard X" },
      ],
      escalations: [],
    });
  });

  it("plans a single mega", () => {
    const p = species({ megas: [mega("Mega Garchomp")] });
    expect(megaAuthoring("garchomp", p)).toEqual({
      ids: ["garchomp-mega"],
      speciesEntries: [{ id: "garchomp-mega", en: "Mega Garchomp" }],
      escalations: [],
    });
  });

  it("is empty for species without mega forms", () => {
    expect(megaAuthoring("garchomp", species({}))).toEqual({
      ids: [],
      speciesEntries: [],
      escalations: [],
    });
  });

  it("separates undeterministic forms into escalations (no auto-author)", () => {
    const p = species({ megas: [mega("Primal Kyogre"), mega("Mega Kyogre")] });
    expect(megaAuthoring("kyogre", p)).toEqual({
      ids: ["kyogre-mega"],
      speciesEntries: [{ id: "kyogre-mega", en: "Mega Kyogre" }],
      escalations: ["Primal Kyogre"],
    });
  });
});
