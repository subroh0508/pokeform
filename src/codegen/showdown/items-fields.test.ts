import { describe, expect, it } from "vitest";
import {
  type ItemInput,
  itemEnName,
  itemId,
  itemStructuralFields,
  parseMegaLink,
} from "./items-fields.ts";

const leftovers: ItemInput = {
  name: "Leftovers",
  category: "other",
  megaStone: null,
  megaEvolves: null,
};

const charizarditeX: ItemInput = {
  name: "Charizardite X",
  category: "megastone",
  megaStone: { Charizard: "Charizard-Mega-X" },
  megaEvolves: "Charizard",
};

describe("itemId", () => {
  it("derives a kebab id from the item name", () => {
    expect(itemId({ ...leftovers, name: "King's Rock" })).toBe("kings-rock");
  });
});

describe("parseMegaLink", () => {
  it("reads base/mega from a mod megaStone object", () => {
    expect(parseMegaLink(charizarditeX)).toEqual({
      baseSpecies: "Charizard",
      megaSpecies: "Charizard-Mega-X",
    });
  });

  it("reads base from megaEvolves when megaStone is a string", () => {
    expect(
      parseMegaLink({
        name: "Venusaurite",
        category: "megastone",
        megaStone: "Venusaur-Mega",
        megaEvolves: "Venusaur",
      }),
    ).toEqual({ baseSpecies: "Venusaur", megaSpecies: "Venusaur-Mega" });
  });

  it("returns null for an empty megaStone object", () => {
    expect(
      parseMegaLink({ name: "X", category: "megastone", megaStone: {}, megaEvolves: null }),
    ).toBeNull();
  });

  it("returns null for a string megaStone without megaEvolves", () => {
    expect(
      parseMegaLink({ name: "X", category: "megastone", megaStone: "Mega", megaEvolves: null }),
    ).toBeNull();
  });

  it("returns null for a non-mega item", () => {
    expect(parseMegaLink(leftovers)).toBeNull();
  });
});

describe("itemStructuralFields", () => {
  it("builds mega linking + mega-stones category for a megastone (megaSpecies is an array)", () => {
    expect(itemStructuralFields(charizarditeX)).toEqual({
      megaStoneFor: "charizard",
      megaSpecies: ["charizard-mega-x"],
      category: "mega-stones",
    });
  });

  it("links a gender mega stone to both ♀♂ formes and canonicalizes megaStoneFor (ADR 0046)", () => {
    // meowsticite は 1 個で ♀♂両形態に対応するため megaSpecies は両形態の配列。megaStoneFor は bare
    // `Meowstic` を canonical `meowstic-male` へ（bare `meowstic` は SUPPRESS_BASE_SPECIES で roster 不在）。
    expect(
      itemStructuralFields({
        name: "Meowsticite",
        category: "megastone",
        megaStone: { Meowstic: "Meowstic-M-Mega" },
        megaEvolves: "Meowstic",
      }),
    ).toEqual({
      megaStoneFor: "meowstic-male",
      megaSpecies: ["meowstic-female-mega", "meowstic-male-mega"],
      category: "mega-stones",
    });
  });

  it("maps berry → berries and other → held-items without linking", () => {
    expect(itemStructuralFields({ ...leftovers, category: "berry" })).toEqual({
      category: "berries",
    });
    expect(itemStructuralFields(leftovers)).toEqual({ category: "held-items" });
  });
});

describe("itemEnName", () => {
  it("carries the showdown display name as en", () => {
    expect(itemEnName(leftovers)).toEqual({ en: "Leftovers" });
  });
});
