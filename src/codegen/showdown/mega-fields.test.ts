import { describe, expect, it } from "vitest";
import {
  groupMegaByBase,
  type MegaInput,
  megaBaseSpeciesId,
  megaEvolveBaseId,
  megaFormId,
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

  it("unifies both gender megas into a single meowstic-mega id (ADR 0045)", () => {
    // ♂♀の2形態はステータス一致ゆえ単一メガ形態へ統合する。
    expect(megaId(meowsticFemaleMega)).toBe("meowstic-mega");
    expect(megaId(meowsticMaleMega)).toBe("meowstic-mega");
    expect(megaFormId("Meowstic-F-Mega")).toBe("meowstic-mega");
    // 非 gender メガは canonicalFormId 素通り。
    expect(megaFormId("Charizard-Mega-X")).toBe("charizard-mega-x");
  });

  it("keeps the canonical (male) base as the mega-specs reverse pointer", () => {
    // mega-specs.baseSpecies は単一の逆参照ゆえ canonical（`meowstic-male`）に揃える。
    expect(megaBaseSpeciesId(meowsticFemaleMega)).toBe("meowstic-male");
    expect(megaBaseSpeciesId(meowsticMaleMega)).toBe("meowstic-male");
  });

  it("derives the gender-specific base for mega linking (F -> -female / M -> -male)", () => {
    // megaEvolvesTo / <reg>/mega.yaml は mega 名の gender から gender 別 base を導出し ♂♀両 base を紐付ける。
    expect(megaEvolveBaseId(meowsticFemaleMega)).toBe("meowstic-female");
    expect(megaEvolveBaseId(meowsticMaleMega)).toBe("meowstic-male");
    // 非 gender メガは megaBaseSpeciesId に一致（charizard）。
    expect(megaEvolveBaseId(charizardMegaX)).toBe("charizard");
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

  it("links the single unified mega under both gender bases (ADR 0045)", () => {
    // ♂♀両 base が単一 `meowstic-mega` へ紐付く（gender 別 base 導出・dedup）。
    expect(groupMegaByBase([meowsticMaleMega, meowsticFemaleMega])).toEqual({
      "meowstic-male": ["meowstic-mega"],
      "meowstic-female": ["meowstic-mega"],
    });
  });
});
