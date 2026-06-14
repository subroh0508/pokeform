import { describe, expect, it } from "vitest";
import type { ParsedItem, ParsedMove, ParsedSpecies } from "./parse.ts";
import {
  abilityEnFromId,
  abilityIds,
  itemCatalogFields,
  megaFormNames,
  moveCatalogFields,
  regMoveIds,
  sortedUnion,
  speciesCatalogFields,
} from "./to-catalog.ts";

const move = (over: Partial<ParsedMove>): ParsedMove => ({
  name: "Earthquake",
  id: "earthquake",
  type: "ground",
  damageClass: "physical",
  power: 100,
  accuracy: 100,
  pp: 10,
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

describe("moveCatalogFields", () => {
  it("maps Serebii move meta with priority defaulting to 0 (no ja)", () => {
    expect(moveCatalogFields(move({}))).toEqual({
      en: "Earthquake",
      type: "ground",
      damageClass: "physical",
      power: 100,
      accuracy: 100,
      pp: 10,
      priority: 0,
    });
  });

  it("carries null power/accuracy/pp for status/必中 moves", () => {
    const fields = moveCatalogFields(
      move({
        name: "Swords Dance",
        id: "swords-dance",
        damageClass: "status",
        power: null,
        accuracy: null,
        pp: null,
      }),
    );
    expect(fields.power).toBeNull();
    expect(fields.accuracy).toBeNull();
    expect(fields.pp).toBeNull();
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

  it("omits megaStoneFor for non mega-stone items", () => {
    expect(itemCatalogFields(item({}))).toEqual({ en: "Leftovers" });
  });

  it("includes megaStoneFor for mega stones", () => {
    expect(
      itemCatalogFields(
        item({
          name: "Garchompite",
          id: "garchompite",
          category: "mega-stone",
          megaStoneFor: "garchomp",
        }),
      ),
    ).toEqual({ en: "Garchompite", megaStoneFor: "garchomp" });
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

describe("megaFormNames", () => {
  it("returns mega display names without deriving catalog ids", () => {
    const p = species({
      megas: [
        {
          name: "Mega Garchomp",
          types: ["dragon", "ground"],
          abilities: ["sand-force"],
          stats: { H: 108, A: 170, B: 115, C: 120, D: 95, S: 92 },
          statTotal: 700,
        },
      ],
    });
    expect(megaFormNames(p)).toEqual(["Mega Garchomp"]);
  });

  it("is empty when the species has no mega forms", () => {
    expect(megaFormNames(species({}))).toEqual([]);
  });
});
