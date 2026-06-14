import { describe, expect, it } from "vitest";
import type { ParsedItem, ParsedMove, ParsedSpecies } from "./parse.ts";
import {
  abilityEnFromId,
  abilityIds,
  itemCatalogFields,
  megaAuthoring,
  megaSpeciesId,
  megaStoneSpeciesId,
  moveNameFields,
  moveStatsFields,
  regMoveIds,
  sortedUnion,
  speciesCatalogFields,
} from "./to-catalog.ts";

const mega = (name: string) => ({
  name,
  types: ["fire", "dragon"],
  abilities: ["tough-claws"],
  stats: { H: 78, A: 130, B: 111, C: 130, D: 85, S: 100 },
  statTotal: 634,
});

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

describe("moveNameFields", () => {
  it("carries only the Serebii display name (en・ja は materialize が補完)", () => {
    expect(moveNameFields(move({}))).toEqual({ en: "Earthquake" });
  });
});

describe("moveStatsFields", () => {
  it("maps Serebii move meta with priority defaulting to 0", () => {
    expect(moveStatsFields(move({}))).toEqual({
      type: "ground",
      damageClass: "physical",
      power: 100,
      accuracy: 100,
      pp: 10,
      priority: 0,
    });
  });

  it("carries null power/accuracy/pp for status/必中 moves", () => {
    const fields = moveStatsFields(
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

  it("includes megaStoneFor + megaSpecies for single mega stones", () => {
    expect(
      itemCatalogFields(
        item({
          name: "Garchompite",
          id: "garchompite",
          category: "mega-stone",
          megaStoneFor: "garchomp",
        }),
      ),
    ).toEqual({ en: "Garchompite", megaStoneFor: "garchomp", megaSpecies: "garchomp-mega" });
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
      megaStoneFor: "charizard",
      megaSpecies: "charizard-mega-x",
    });
  });

  it("omits megaSpecies when the derived id is not a catalog id shape (guard)", () => {
    // megaStoneFor が catalog id 形でないと megaSpecies は付けない（誤 id 注入防止）。
    expect(
      itemCatalogFields(
        item({
          name: "Weird Stone",
          id: "weird-stone",
          category: "mega-stone",
          megaStoneFor: "Foo Bar",
        }),
      ),
    ).toEqual({ en: "Weird Stone", megaStoneFor: "Foo Bar" });
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

describe("megaSpeciesId", () => {
  it("derives the single mega id (no suffix)", () => {
    expect(megaSpeciesId("garchomp", "Mega Garchomp")).toBe("garchomp-mega");
  });

  it("derives X/Y mega ids from the trailing branch suffix", () => {
    expect(megaSpeciesId("charizard", "Mega Charizard X")).toBe("charizard-mega-x");
    expect(megaSpeciesId("charizard", "Mega Charizard Y")).toBe("charizard-mega-y");
  });

  it("ignores the base display name (en≠slug regional forms stay intact)", () => {
    // base 表示名をパースせず baseSlug を使うので、表示名がスラグと異なっても破綻しない。
    expect(megaSpeciesId("lopunny", "Mega Lopunny")).toBe("lopunny-mega");
  });

  it("escalates (null) for non 'Mega ' forms like Primal", () => {
    expect(megaSpeciesId("kyogre", "Primal Kyogre")).toBeNull();
    expect(megaSpeciesId("groudon", "Groudon")).toBeNull();
  });

  it("escalates (null) when the derived id is not a catalog id shape", () => {
    expect(megaSpeciesId("", "Mega Charizard X")).toBeNull();
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

describe("megaAuthoring", () => {
  it("plans ids + species entries for X/Y megas and dedupes/sorts ids", () => {
    const p = species({
      en: "Charizard",
      megas: [mega("Mega Charizard Y"), mega("Mega Charizard X")],
    });
    expect(megaAuthoring("charizard", p)).toEqual({
      ids: ["charizard-mega-x", "charizard-mega-y"],
      speciesEntries: [
        { id: "charizard-mega-y", en: "Mega Charizard Y" },
        { id: "charizard-mega-x", en: "Mega Charizard X" },
      ],
      escalations: [],
    });
  });

  it("plans a single mega", () => {
    const p = species({ megas: [mega("Mega Garchomp")] });
    expect(megaAuthoring("garchomp", p)).toEqual({
      ids: ["garchomp-mega"],
      speciesEntries: [{ id: "garchomp-mega", en: "Mega Garchomp" }],
      escalations: [],
    });
  });

  it("is empty for species without mega forms", () => {
    expect(megaAuthoring("garchomp", species({}))).toEqual({
      ids: [],
      speciesEntries: [],
      escalations: [],
    });
  });

  it("separates undeterministic forms into escalations (no auto-author)", () => {
    const p = species({ megas: [mega("Primal Kyogre"), mega("Mega Kyogre")] });
    expect(megaAuthoring("kyogre", p)).toEqual({
      ids: ["kyogre-mega"],
      speciesEntries: [{ id: "kyogre-mega", en: "Mega Kyogre" }],
      escalations: ["Primal Kyogre"],
    });
  });
});
