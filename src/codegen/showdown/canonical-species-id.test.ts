import { describe, expect, it } from "vitest";
import { canonicalSpeciesId } from "./canonical-species-id.ts";

describe("canonicalSpeciesId", () => {
  it("maps a showdown bare default forme to its explicit PokeAPI slug", () => {
    expect(canonicalSpeciesId("Urshifu")).toBe("urshifu-single-strike");
    expect(canonicalSpeciesId("Deoxys")).toBe("deoxys-normal");
    expect(canonicalSpeciesId("Basculegion")).toBe("basculegion-male");
  });

  it("rewrites a Class C vocabulary difference to the PokeAPI spelling", () => {
    expect(canonicalSpeciesId("Necrozma-Dusk-Mane")).toBe("necrozma-dusk");
    expect(canonicalSpeciesId("Ogerpon-Wellspring")).toBe("ogerpon-wellspring-mask");
    expect(canonicalSpeciesId("Greninja-Bond")).toBe("greninja-battle-bond");
  });

  it("applies CANONICAL_ID_OVERRIDE for PokeAPI-bare defaults we split explicitly", () => {
    expect(canonicalSpeciesId("Gimmighoul")).toBe("gimmighoul-chest");
  });

  it("passes a base / already-explicit species through unchanged", () => {
    expect(canonicalSpeciesId("Raichu")).toBe("raichu");
    expect(canonicalSpeciesId("Charizard")).toBe("charizard");
    expect(canonicalSpeciesId("Rotom-Wash")).toBe("rotom-wash");
    expect(canonicalSpeciesId("Greninja")).toBe("greninja");
  });
});
