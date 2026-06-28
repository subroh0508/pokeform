import { describe, expect, it } from "vitest";
import {
  abilityEnFromId,
  abilityIds,
  itemCatalogFields,
  megaStoneSpeciesId,
  moveMasterNameFields,
  moveNameFields,
  speciesCatalogFields,
} from "./catalog-fields.ts";
import type { ParsedItem, ParsedMove, ParsedMoveMaster, ParsedSpecies } from "./parse.ts";

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

describe("moveNameFields", () => {
  it("carries only the Serebii display name (en・ja は materialize が補完)", () => {
    expect(moveNameFields(move({}))).toEqual({ en: "Earthquake" });
  });
});

describe("speciesCatalogFields", () => {
  it("carries only the Serebii display name", () => {
    expect(speciesCatalogFields(species({ en: "Dragonite" }))).toEqual({ en: "Dragonite" });
  });
});

describe("itemCatalogFields", () => {
  const item = (over: Partial<ParsedItem>): ParsedItem => ({
    name: "Leftovers",
    id: "leftovers",
    slug: "leftovers",
    category: "hold",
    megaStoneFor: null,
    ...over,
  });

  it("omits category/megaStoneFor for non mega-stone items (category は materialize 委譲)", () => {
    expect(itemCatalogFields(item({}))).toEqual({ en: "Leftovers" });
  });

  it("includes category + megaStoneFor + megaSpecies for single mega stones", () => {
    expect(
      itemCatalogFields(
        item({
          name: "Garchompite",
          id: "garchompite",
          category: "mega-stone",
          megaStoneFor: "garchomp",
        }),
      ),
    ).toEqual({
      en: "Garchompite",
      category: "mega-stones",
      megaStoneFor: "garchomp",
      megaSpecies: "garchomp-mega",
    });
  });

  it("derives X/Y megaSpecies from the stone id suffix", () => {
    expect(
      itemCatalogFields(
        item({
          name: "Charizardite X",
          id: "charizardite-x",
          category: "mega-stone",
          megaStoneFor: "charizard",
        }),
      ),
    ).toEqual({
      en: "Charizardite X",
      category: "mega-stones",
      megaStoneFor: "charizard",
      megaSpecies: "charizard-mega-x",
    });
  });

  it("sets category for a Champions 固有 mega stone whose target can't be derived (megaStoneFor null)", () => {
    // Champions 固有ストーンで desc からメガ先を取れない場合でも category は Serebii 由来で確定する
    // （メガ pokemon 自体は別途 materialize 可・PokeAPI 非存在ゆえ category は Serebii が正）。
    expect(
      itemCatalogFields(
        item({
          name: "Mystery Stone",
          id: "mysterite",
          category: "mega-stone",
          megaStoneFor: null,
        }),
      ),
    ).toEqual({ en: "Mystery Stone", category: "mega-stones" });
  });

  it("omits megaSpecies when the derived id is not a catalog id shape (guard)", () => {
    // megaStoneFor が catalog id 形でないと megaSpecies は付けない（誤 id 注入防止）。category は付く。
    expect(
      itemCatalogFields(
        item({
          name: "Weird Stone",
          id: "weird-stone",
          category: "mega-stone",
          megaStoneFor: "Foo Bar",
        }),
      ),
    ).toEqual({ en: "Weird Stone", category: "mega-stones", megaStoneFor: "Foo Bar" });
  });
});

describe("megaStoneSpeciesId", () => {
  it("derives the single mega species (no suffix)", () => {
    expect(megaStoneSpeciesId("garchompite", "garchomp")).toBe("garchomp-mega");
  });

  it("derives X/Y mega species from the stone id suffix", () => {
    expect(megaStoneSpeciesId("charizardite-x", "charizard")).toBe("charizard-mega-x");
    expect(megaStoneSpeciesId("charizardite-y", "charizard")).toBe("charizard-mega-y");
  });

  it("escalates (null) when the derived id is not a catalog id shape", () => {
    expect(megaStoneSpeciesId("garchompite", "")).toBeNull();
  });
});

describe("abilityIds", () => {
  it("dedupes the species ability ids", () => {
    expect(abilityIds(species({ abilities: ["blaze", "blaze", "solar-power"] }))).toEqual([
      "blaze",
      "solar-power",
    ]);
  });
});

describe("abilityEnFromId", () => {
  it("title-cases kebab ability ids into display English names", () => {
    expect(abilityEnFromId("rough-skin")).toBe("Rough Skin");
    expect(abilityEnFromId("blaze")).toBe("Blaze");
    expect(abilityEnFromId("anger-point")).toBe("Anger Point");
  });
});

describe("moveMasterNameFields", () => {
  const base: ParsedMoveMaster = {
    name: "Quick Attack",
    id: "quick-attack",
    type: "normal",
    damageClass: "physical",
    power: 40,
    accuracy: 100,
    pp: 20,
    priority: 1,
  };

  it("uses the Serebii display name for the en name field", () => {
    expect(moveMasterNameFields(base)).toEqual({ en: "Quick Attack" });
  });
});
