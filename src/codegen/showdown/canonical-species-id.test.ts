import { describe, expect, it } from "vitest";
import { canonicalFormId, canonicalSpeciesId } from "./canonical-species-id.ts";

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

  it("rewrites a Class C vocabulary difference to the canonical spelling", () => {
    expect(canonicalSpeciesId("Necrozma-Dusk-Mane")).toBe("necrozma-dusk");
    expect(canonicalSpeciesId("Necrozma-Dawn-Wings")).toBe("necrozma-dawn");
    expect(canonicalSpeciesId("Greninja-Bond")).toBe("greninja-battle-bond");
  });

  it("applies CANONICAL_ID_OVERRIDE for bare defaults we split explicitly", () => {
    expect(canonicalSpeciesId("Gimmighoul")).toBe("gimmighoul-chest");
    expect(canonicalSpeciesId("Hoopa")).toBe("hoopa-confined");
    expect(canonicalSpeciesId("Castform")).toBe("castform-normal");
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
