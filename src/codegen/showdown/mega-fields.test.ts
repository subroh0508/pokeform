import { describe, expect, it } from "vitest";
import {
  groupMegaByBase,
  type MegaInput,
  megaBaseSpeciesId,
  megaEnName,
  megaId,
  megaStructuralFields,
} from "./mega-fields.ts";

const charizardMegaX: MegaInput = {
  num: 6,
  name: "Charizard-Mega-X",
  baseSpecies: "Charizard",
  types: ["Fire", "Dragon"],
  baseStats: { hp: 78, atk: 130, def: 111, spa: 130, spd: 85, spe: 100 },
  ability: "Tough Claws",
};

const charizardMegaY: MegaInput = {
  num: 6,
  name: "Charizard-Mega-Y",
  baseSpecies: "Charizard",
  types: ["Fire", "Flying"],
  baseStats: { hp: 78, atk: 104, def: 78, spa: 159, spd: 115, spe: 100 },
  ability: "Drought",
};

const garchompMega: MegaInput = {
  num: 445,
  name: "Garchomp-Mega",
  baseSpecies: "Garchomp",
  types: ["Dragon", "Ground"],
  baseStats: { hp: 108, atk: 170, def: 115, spa: 120, spd: 95, spe: 92 },
  ability: "Sand Force",
};

describe("megaId / megaBaseSpeciesId", () => {
  it("derive kebab ids from names", () => {
    expect(megaId(charizardMegaX)).toBe("charizard-mega-x");
    expect(megaBaseSpeciesId(charizardMegaX)).toBe("charizard");
  });
});

describe("megaStructuralFields", () => {
  it("builds dex / types / stats / ability / baseSpecies", () => {
    expect(megaStructuralFields(charizardMegaX)).toEqual({
      dex: 6,
      types: ["fire", "dragon"],
      stats: { H: 78, A: 130, B: 111, C: 130, D: 85, S: 100 },
      ability: "tough-claws",
      baseSpecies: "charizard",
    });
  });
});

describe("megaEnName", () => {
  it("carries the showdown display name as en", () => {
    expect(megaEnName(charizardMegaX)).toEqual({ en: "Charizard-Mega-X" });
  });
});

describe("groupMegaByBase", () => {
  it("groups by base species with id-sorted, deduped mega lists", () => {
    expect(groupMegaByBase([charizardMegaY, charizardMegaX, garchompMega])).toEqual({
      charizard: ["charizard-mega-x", "charizard-mega-y"],
      garchomp: ["garchomp-mega"],
    });
  });

  it("dedupes a repeated mega forme under the same base", () => {
    expect(groupMegaByBase([garchompMega, garchompMega])).toEqual({
      garchomp: ["garchomp-mega"],
    });
  });
});
