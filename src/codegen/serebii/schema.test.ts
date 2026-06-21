import { describe, expect, it } from "vitest";
import type { ParsedItems, ParsedMoveMaster, ParsedSpecies } from "./parse.ts";
import { validateItems, validateMoveMaster, validateSpecies } from "./schema.ts";

/** 健全な中間表現（各テストはこれを部分的に壊す）。 */
function validSpecies(): ParsedSpecies {
  return {
    en: "Garchomp",
    dex: 445,
    types: ["dragon", "ground"],
    abilities: ["sand-veil", "rough-skin"],
    stats: { H: 108, A: 130, B: 95, C: 80, D: 85, S: 102 },
    statTotal: 600,
    moves: [{ name: "Earthquake", id: "earthquake" }],
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

  it("returns stage 4 for a move with a malformed id shape (names-only; meta は validateMoveMaster が検証)", () => {
    const p: ParsedSpecies = {
      ...validSpecies(),
      moves: [{ name: "Bad Move", id: "Bad Move" }],
    };
    const result = validateSpecies(p);
    expect(result.stage).toBe(4);
    expect(result.issues).toEqual(["move id shape: Bad Move"]);
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

/** 健全な技マスター中間表現（各テストはこれを部分的に壊す）。 */
function validMoveMaster(): ParsedMoveMaster {
  return {
    name: "Earthquake",
    id: "earthquake",
    type: "ground",
    damageClass: "physical",
    power: 100,
    accuracy: 100,
    pp: 12,
    priority: 0,
  };
}

describe("validateMoveMaster", () => {
  it("returns stage 0 for a healthy move master", () => {
    expect(validateMoveMaster(validMoveMaster())).toEqual({
      stage: 0,
      missingFields: [],
      issues: [],
    });
  });

  it("accepts a status move (null power/accuracy) and negative priority", () => {
    const m: ParsedMoveMaster = {
      ...validMoveMaster(),
      id: "roar",
      damageClass: "status",
      power: null,
      accuracy: null,
      pp: 20,
      priority: -6,
    };
    expect(validateMoveMaster(m).stage).toBe(0);
  });

  it("returns stage 3 with every missing required field", () => {
    const m: ParsedMoveMaster = {
      name: "",
      id: "",
      type: "",
      damageClass: "",
      power: null,
      accuracy: null,
      pp: null,
      priority: null,
    };
    expect(validateMoveMaster(m)).toEqual({
      stage: 3,
      missingFields: ["id", "type", "damageClass", "pp", "priority"],
      issues: [],
    });
  });

  it("prioritises schema absence (stage 3) over health (stage 4)", () => {
    // pp 欠落 = stage 3。priority レンジ外でも欠落が優先される。
    const m: ParsedMoveMaster = { ...validMoveMaster(), pp: null, priority: 99 };
    expect(validateMoveMaster(m).stage).toBe(3);
  });

  it("returns stage 4 when pp is outside the Champions scale", () => {
    const m: ParsedMoveMaster = { ...validMoveMaster(), pp: 10 }; // 前作値 = スケール外
    const r = validateMoveMaster(m);
    expect(r.stage).toBe(4);
    expect(r.issues).toEqual(["pp out of scale: 10"]);
  });

  it("returns stage 4 for a malformed id, bad damageClass, negative power/accuracy, out-of-range priority", () => {
    const m: ParsedMoveMaster = {
      name: "Bad",
      id: "Bad Id",
      type: "fire",
      damageClass: "weird",
      power: -5,
      accuracy: -1,
      pp: 12,
      priority: 9,
    };
    const r = validateMoveMaster(m);
    expect(r.stage).toBe(4);
    expect(r.issues).toEqual([
      "move id shape: Bad Id",
      "damageClass: weird",
      "power negative: -5",
      "accuracy negative: -1",
      "priority out of range: 9",
    ]);
  });

  it("flags priority below the minimum range too", () => {
    const m: ParsedMoveMaster = { ...validMoveMaster(), priority: -8 };
    expect(validateMoveMaster(m).issues).toEqual(["priority out of range: -8"]);
  });
});
