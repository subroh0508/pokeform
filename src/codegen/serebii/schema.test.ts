import { describe, expect, it } from "vitest";
import type { ParsedItems, ParsedSpecies } from "./parse.ts";
import { validateItems, validateSpecies } from "./schema.ts";

/** 健全な中間表現（各テストはこれを部分的に壊す）。 */
function validSpecies(): ParsedSpecies {
  return {
    en: "Garchomp",
    dex: 445,
    types: ["dragon", "ground"],
    abilities: ["sand-veil", "rough-skin"],
    stats: { H: 108, A: 130, B: 95, C: 80, D: 85, S: 102 },
    statTotal: 600,
    moves: [
      {
        name: "Earthquake",
        id: "earthquake",
        type: "ground",
        damageClass: "physical",
        power: 100,
        accuracy: 100,
        pp: 10,
      },
    ],
    megas: [],
  };
}

describe("validateSpecies", () => {
  it("returns stage 0 for a healthy species", () => {
    expect(validateSpecies(validSpecies())).toEqual({ stage: 0, missingFields: [], issues: [] });
  });

  it("returns stage 3 with every missing required field", () => {
    const empty: ParsedSpecies = {
      en: "",
      dex: null,
      types: [],
      abilities: [],
      stats: { H: 0, A: 0, B: 0, C: 0, D: 0, S: 0 },
      statTotal: null,
      moves: [],
      megas: [],
    };
    const result = validateSpecies(empty);
    expect(result.stage).toBe(3);
    expect(result.missingFields).toEqual(["en", "dex", "types", "abilities", "stats", "moves"]);
    expect(result.issues).toEqual([]);
  });

  it("prioritises schema-missing (stage 3) over health checks", () => {
    // stats 合計も壊れているが、moves 欠落（schema 欠落）が優先される。
    const p = { ...validSpecies(), moves: [], statTotal: 999 };
    expect(validateSpecies(p).stage).toBe(3);
  });

  it("returns stage 4 when the stat sum disagrees with the total", () => {
    const p = { ...validSpecies(), statTotal: 599 };
    const result = validateSpecies(p);
    expect(result.stage).toBe(4);
    expect(result.issues).toEqual(["stat sum 600 != total 599"]);
  });

  it("returns stage 4 for a malformed ability id", () => {
    const p = { ...validSpecies(), abilities: ["Sand Veil"] };
    const result = validateSpecies(p);
    expect(result.stage).toBe(4);
    expect(result.issues).toEqual(["ability id shape: Sand Veil"]);
  });

  it("returns stage 4 for a move missing id shape, type and damageClass", () => {
    const p: ParsedSpecies = {
      ...validSpecies(),
      moves: [
        {
          name: "Bad Move",
          id: "Bad Move",
          type: "",
          damageClass: "",
          power: null,
          accuracy: null,
          pp: null,
        },
      ],
    };
    const result = validateSpecies(p);
    expect(result.stage).toBe(4);
    expect(result.issues).toEqual([
      "move id shape: Bad Move",
      "move missing type: Bad Move",
      "move missing damageClass: Bad Move",
    ]);
  });
});

/** 健全な持ち物ページの中間表現（各テストはこれを部分的に壊す）。 */
function validItems(): ParsedItems {
  return {
    items: [
      {
        name: "Choice Scarf",
        id: "choice-scarf",
        slug: "choicescarf",
        category: "hold",
        megaStoneFor: null,
      },
      {
        name: "Charizardite X",
        id: "charizardite-x",
        slug: "charizarditex",
        category: "mega-stone",
        megaStoneFor: "charizard",
      },
    ],
  };
}

describe("validateItems", () => {
  it("returns stage 0 for a healthy items page", () => {
    expect(validateItems(validItems())).toEqual({ stage: 0, missingFields: [], issues: [] });
  });

  it("returns stage 3 when no items are parsed", () => {
    expect(validateItems({ items: [] })).toEqual({
      stage: 3,
      missingFields: ["items"],
      issues: [],
    });
  });

  it("returns stage 4 for a malformed item id (labelled by slug, falling back to name)", () => {
    const p: ParsedItems = {
      items: [
        {
          name: "Choice Scarf",
          id: "Choice Scarf",
          slug: "choicescarf",
          category: "hold",
          megaStoneFor: null,
        },
        { name: "No Slug", id: "No Slug", slug: "", category: "hold", megaStoneFor: null },
      ],
    };
    const result = validateItems(p);
    expect(result.stage).toBe(4);
    expect(result.issues).toEqual(["item id shape: choicescarf", "item id shape: No Slug"]);
  });

  it("returns stage 4 when a mega stone is missing its target species", () => {
    const p: ParsedItems = {
      items: [
        {
          name: "Weirdite",
          id: "weirdite",
          slug: "weirdite",
          category: "mega-stone",
          megaStoneFor: null,
        },
      ],
    };
    const result = validateItems(p);
    expect(result.stage).toBe(4);
    expect(result.issues).toEqual(["mega stone missing target: weirdite"]);
  });

  it("returns stage 4 when the mega target id is malformed", () => {
    const p: ParsedItems = {
      items: [
        {
          name: "Charizardite X",
          id: "charizardite-x",
          slug: "charizarditex",
          category: "mega-stone",
          megaStoneFor: "Charizard",
        },
      ],
    };
    const result = validateItems(p);
    expect(result.stage).toBe(4);
    expect(result.issues).toEqual(["mega target shape: Charizard"]);
  });
});
