import { describe, expect, it } from "vitest";
import {
  canonicalFormId,
  canonicalSpeciesId,
  SUPPRESS_BASE_SPECIES,
} from "./canonical-species-id.ts";

describe("canonicalFormId", () => {
  it("drops the redundant PokeAPI variety suffix", () => {
    expect(canonicalFormId("tauros-paldea-combat-breed")).toBe("tauros-paldea-combat");
    expect(canonicalFormId("zygarde-10-power-construct")).toBe("zygarde-10");
    expect(canonicalFormId("squawkabilly-green-plumage")).toBe("squawkabilly-green");
    expect(canonicalFormId("urshifu-single-strike")).toBe("urshifu-single");
    expect(canonicalFormId("urshifu-rapid-strike")).toBe("urshifu-rapid");
    expect(canonicalFormId("ogerpon-wellspring-mask")).toBe("ogerpon-wellspring");
    expect(canonicalFormId("dudunsparce-two-segment")).toBe("dudunsparce-two");
    expect(canonicalFormId("basculin-red-striped")).toBe("basculin-red");
  });

  it("collapses the family-of- infix (maushold)", () => {
    expect(canonicalFormId("maushold-family-of-four")).toBe("maushold-four");
    expect(canonicalFormId("maushold-family-of-three")).toBe("maushold-three");
  });

  it("applies an explicit rename (minior meteor color drop)", () => {
    expect(canonicalFormId("minior-red-meteor")).toBe("minior-meteor");
  });

  it("normalizes the showdown gender forme suffix to the languages -female id", () => {
    expect(canonicalFormId("basculegion-f")).toBe("basculegion-female");
    expect(canonicalFormId("meowstic-f")).toBe("meowstic-female");
    expect(canonicalFormId("indeedee-f")).toBe("indeedee-female");
    expect(canonicalFormId("oinkologne-f")).toBe("oinkologne-female");
  });

  it("normalizes the per-gender mega forme suffix to the languages -female-mega / -male-mega id", () => {
    // gender メガは per-gender で忠実に写す（畳み込みは generate の判定・ADR 0046）。
    expect(canonicalFormId("meowstic-f-mega")).toBe("meowstic-female-mega");
    expect(canonicalFormId("meowstic-m-mega")).toBe("meowstic-male-mega");
  });

  it("passes a slug with no redundant suffix through unchanged (idempotent)", () => {
    expect(canonicalFormId("raichu-alola")).toBe("raichu-alola");
    expect(canonicalFormId("rotom-wash")).toBe("rotom-wash");
    expect(canonicalFormId("urshifu-single")).toBe("urshifu-single");
    expect(canonicalFormId("minior-meteor")).toBe("minior-meteor");
  });
});

describe("canonicalSpeciesId", () => {
  it("maps a showdown bare default forme to its explicit short canonical", () => {
    expect(canonicalSpeciesId("Urshifu")).toBe("urshifu-single");
    expect(canonicalSpeciesId("Deoxys")).toBe("deoxys-normal");
    expect(canonicalSpeciesId("Basculegion")).toBe("basculegion-male");
  });

  it("maps a base-suppressed bare default to its explicit canonical", () => {
    expect(canonicalSpeciesId("Indeedee")).toBe("indeedee-male");
    expect(canonicalSpeciesId("Meowstic")).toBe("meowstic-male");
    expect(canonicalSpeciesId("Oinkologne")).toBe("oinkologne-male");
    expect(canonicalSpeciesId("Zygarde")).toBe("zygarde-50");
    expect(canonicalSpeciesId("Landorus")).toBe("landorus-incarnate");
    expect(canonicalSpeciesId("Giratina")).toBe("giratina-altered");
    expect(canonicalSpeciesId("Keldeo")).toBe("keldeo-ordinary");
    expect(canonicalSpeciesId("Basculin")).toBe("basculin-red");
  });

  it("maps the showdown female gender forme to its -female languages id", () => {
    expect(canonicalSpeciesId("Basculegion-F")).toBe("basculegion-female");
    expect(canonicalSpeciesId("Meowstic-F")).toBe("meowstic-female");
    expect(canonicalSpeciesId("Indeedee-F")).toBe("indeedee-female");
    expect(canonicalSpeciesId("Oinkologne-F")).toBe("oinkologne-female");
  });

  it("rewrites a Class C vocabulary difference to the canonical spelling", () => {
    expect(canonicalSpeciesId("Necrozma-Dusk-Mane")).toBe("necrozma-dusk");
    expect(canonicalSpeciesId("Necrozma-Dawn-Wings")).toBe("necrozma-dawn");
    expect(canonicalSpeciesId("Greninja-Bond")).toBe("greninja-battle-bond");
  });

  it("applies CANONICAL_ID_OVERRIDE for bare defaults we split explicitly", () => {
    expect(canonicalSpeciesId("Gimmighoul")).toBe("gimmighoul-chest");
    expect(canonicalSpeciesId("Hoopa")).toBe("hoopa-confined");
    expect(canonicalSpeciesId("Castform")).toBe("castform-normal");
    expect(canonicalSpeciesId("Ogerpon")).toBe("ogerpon-teal");
  });

  it("drops redundant suffixes via canonicalFormId in the passthrough branch", () => {
    // showdown が接尾辞付きで emit しても canonicalFormId が短い canonical へ畳む。
    expect(canonicalSpeciesId("Tauros-Paldea-Combat")).toBe("tauros-paldea-combat");
    expect(canonicalSpeciesId("Ogerpon-Wellspring")).toBe("ogerpon-wellspring");
    expect(canonicalSpeciesId("Urshifu-Rapid-Strike")).toBe("urshifu-rapid");
    expect(canonicalSpeciesId("Dudunsparce-Three-Segment")).toBe("dudunsparce-three");
    expect(canonicalSpeciesId("Basculin-White-Striped")).toBe("basculin-white");
  });

  it("passes a base / already-explicit species through unchanged", () => {
    expect(canonicalSpeciesId("Raichu")).toBe("raichu");
    expect(canonicalSpeciesId("Charizard")).toBe("charizard");
    expect(canonicalSpeciesId("Rotom-Wash")).toBe("rotom-wash");
    expect(canonicalSpeciesId("Greninja")).toBe("greninja");
  });
});

describe("SUPPRESS_BASE_SPECIES", () => {
  it("lists species whose bare base name is suppressed (gender-dimorphic + ambiguous-start)", () => {
    expect([...SUPPRESS_BASE_SPECIES].sort()).toEqual([
      "basculegion",
      "basculin",
      "deoxys",
      "dudunsparce",
      "enamorus",
      "gimmighoul",
      "giratina",
      "gourgeist",
      "hoopa",
      "indeedee",
      "keldeo",
      "landorus",
      "lycanroc",
      "maushold",
      "meowstic",
      "ogerpon",
      "oinkologne",
      "oricorio",
      "pumpkaboo",
      "shaymin",
      "squawkabilly",
      "thundurus",
      "tornadus",
      "urshifu",
      "wormadam",
      "zygarde",
    ]);
  });
});
