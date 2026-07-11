import { describe, expect, it } from "vitest";
import {
  groupMegaByBase,
  type MegaInput,
  megaBaseSpeciesId,
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

// gender メガ。showdown は baseSpecies を bare `Meowstic`（= 男）で持ち、name に性別 forme を含む。
const meowsticFemaleMega: MegaInput = {
  num: 678,
  name: "Meowstic-F-Mega",
  baseSpecies: "Meowstic",
  types: ["Psychic", "Fairy"],
  baseStats: { hp: 74, atk: 48, def: 76, spa: 103, spd: 106, spe: 124 },
  ability: "Competitive",
};

const meowsticMaleMega: MegaInput = {
  num: 678,
  name: "Meowstic-M-Mega",
  baseSpecies: "Meowstic",
  types: ["Psychic", "Fairy"],
  baseStats: { hp: 74, atk: 48, def: 76, spa: 103, spd: 106, spe: 124 },
  ability: "Prankster",
};

// showdown は floette-mega の baseSpecies を bare `Floette` で持つが、Champions でメガ可能かつ
// roster に載るのは AZ の `floette-eternal`。MEGA_BASE_OVERRIDE で roster 側へ揃える。
const floetteMega: MegaInput = {
  num: 670,
  name: "Floette-Mega",
  baseSpecies: "Floette",
  types: ["Fairy"],
  baseStats: { hp: 74, atk: 65, def: 67, spa: 125, spd: 128, spe: 92 },
  ability: "Flower Veil",
};

describe("megaId / megaBaseSpeciesId", () => {
  it("derive kebab ids from names", () => {
    expect(megaId(charizardMegaX)).toBe("charizard-mega-x");
    expect(megaBaseSpeciesId(charizardMegaX)).toBe("charizard");
  });

  it("normalizes gender mega ids to the languages -female / -male canonical", () => {
    expect(megaId(meowsticFemaleMega)).toBe("meowstic-female-mega");
    expect(megaId(meowsticMaleMega)).toBe("meowstic-male-mega");
  });

  it("routes the bare gender base species through canonicalSpeciesId (= -male)", () => {
    // showdown の baseSpecies は両性とも bare `Meowstic`（= 男）ゆえ base linking は `meowstic-male` に揃う。
    expect(megaBaseSpeciesId(meowsticFemaleMega)).toBe("meowstic-male");
    expect(megaBaseSpeciesId(meowsticMaleMega)).toBe("meowstic-male");
  });

  it("overrides the bare floette base to the roster form floette-eternal", () => {
    // bare `floette` は別種として実在するため全域では写せず、mega base 解決に限定して上書きする。
    expect(megaBaseSpeciesId(floetteMega)).toBe("floette-eternal");
    expect(megaStructuralFields(floetteMega).baseSpecies).toBe("floette-eternal");
    expect(groupMegaByBase([floetteMega])).toEqual({ "floette-eternal": ["floette-mega"] });
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

  it("writes the canonical base species id for a gender mega", () => {
    expect(megaStructuralFields(meowsticFemaleMega).baseSpecies).toBe("meowstic-male");
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

  it("groups both gender megas under the canonical -male base", () => {
    expect(groupMegaByBase([meowsticMaleMega, meowsticFemaleMega])).toEqual({
      "meowstic-male": ["meowstic-female-mega", "meowstic-male-mega"],
    });
  });
});
