import { describe, expect, it } from "vitest";
import {
  genderMegaSiblingId,
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

  it("keeps gender megas per-gender (extraction is faithful; collapse is generate's job・ADR 0046)", () => {
    // 抽出は ♀♂を per-gender で忠実に写す。畳むかは generate が stats/types/ability/learnset 一致で判定する。
    expect(megaId(meowsticFemaleMega)).toBe("meowstic-female-mega");
    expect(megaId(meowsticMaleMega)).toBe("meowstic-male-mega");
    expect(megaFormId("Meowstic-F-Mega")).toBe("meowstic-female-mega");
    // 非 gender メガは canonicalFormId 素通り。
    expect(megaFormId("Charizard-Mega-X")).toBe("charizard-mega-x");
  });

  it("finds the gender mega sibling id for stone linking (1 stone -> ♀♂)", () => {
    expect(genderMegaSiblingId("meowstic-female-mega")).toBe("meowstic-male-mega");
    expect(genderMegaSiblingId("meowstic-male-mega")).toBe("meowstic-female-mega");
    // 非 gender メガは兄弟なし。
    expect(genderMegaSiblingId("charizard-mega-x")).toBeNull();
  });

  it("resolves the non-gender base canonical (charizard / floette-eternal override)", () => {
    expect(megaBaseSpeciesId(charizardMegaX)).toBe("charizard");
    expect(megaBaseSpeciesId(floetteMega)).toBe("floette-eternal");
  });

  it("derives the gender-specific base for mega linking (F -> -female / M -> -male)", () => {
    // per-gender メガは mega 名の gender から自分の gender base を導出する（ADR 0046）。
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

  it("writes the gender-specific base species id for a gender mega (ADR 0046)", () => {
    expect(megaStructuralFields(meowsticFemaleMega).baseSpecies).toBe("meowstic-female");
    expect(megaStructuralFields(meowsticMaleMega).baseSpecies).toBe("meowstic-male");
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

  it("links each per-gender mega under its own gender base (ADR 0046)", () => {
    // per-gender メガは各 gender base に自分の gender メガが紐付く（畳み込みは generate の判定）。
    expect(groupMegaByBase([meowsticMaleMega, meowsticFemaleMega])).toEqual({
      "meowstic-male": ["meowstic-male-mega"],
      "meowstic-female": ["meowstic-female-mega"],
    });
  });
});
