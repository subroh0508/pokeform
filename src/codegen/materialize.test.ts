import { describe, expect, it } from "vitest";
import {
  extractItemCategory,
  extractSpeciesStructural,
  planFields,
  type SpeciesStructural,
} from "./materialize.ts";

describe("extractSpeciesStructural", () => {
  it("maps PokeAPI stats/types/abilities and national dex", () => {
    const pokemon = {
      stats: [
        { base_stat: 108, stat: { name: "hp" } },
        { base_stat: 130, stat: { name: "attack" } },
        { base_stat: 95, stat: { name: "defense" } },
        { base_stat: 80, stat: { name: "special-attack" } },
        { base_stat: 85, stat: { name: "special-defense" } },
        { base_stat: 102, stat: { name: "speed" } },
      ],
      types: [{ type: { name: "dragon" } }, { type: { name: "ground" } }],
      abilities: [{ ability: { name: "sand-veil" } }, { ability: { name: "rough-skin" } }],
    };
    expect(extractSpeciesStructural(pokemon, { id: 445 })).toEqual({
      dex: 445,
      types: ["dragon", "ground"],
      stats: { H: 108, A: 130, B: 95, C: 80, D: 85, S: 102 },
      abilities: ["sand-veil", "rough-skin"],
    });
  });

  it("ignores stat names outside the 6 canonical stats", () => {
    const pokemon = {
      stats: [
        { base_stat: 50, stat: { name: "hp" } },
        { base_stat: 999, stat: { name: "accuracy" } },
      ],
      types: [{ type: { name: "normal" } }],
      abilities: [],
    };
    const out = extractSpeciesStructural(pokemon, { id: 1 });
    expect(out.stats).toEqual({ H: 50, A: 0, B: 0, C: 0, D: 0, S: 0 });
  });
});

describe("extractItemCategory", () => {
  it("reads the category name", () => {
    expect(extractItemCategory({ category: { name: "held-items" } })).toBe("held-items");
  });
});

describe("planFields", () => {
  const fresh: SpeciesStructural = {
    dex: 445,
    types: ["dragon", "ground"],
    stats: { H: 108, A: 130, B: 95, C: 80, D: 85, S: 102 },
    abilities: ["sand-veil", "rough-skin"],
  };

  it("fills only absent fields (append/既存尊重)", () => {
    const plan = planFields({ dex: 445, types: ["dragon", "ground"] }, fresh);
    expect(plan.fill).toEqual({
      stats: { H: 108, A: 130, B: 95, C: 80, D: 85, S: 102 },
      abilities: ["sand-veil", "rough-skin"],
    });
    expect(plan.conflicts).toEqual([]);
  });

  it("reports conflicts without overwriting hand-authored values", () => {
    const plan = planFields(
      // types は Champions 実態に合わせ手修正済み（raw と異なる）。
      { dex: 445, types: ["dragon"], stats: fresh.stats, abilities: fresh.abilities },
      fresh,
    );
    expect(plan.fill).toEqual({});
    expect(plan.conflicts).toEqual([
      { key: "types", existing: ["dragon"], fresh: ["dragon", "ground"] },
    ]);
  });

  it("fills everything when the entry has no structural data yet", () => {
    const plan = planFields({}, fresh);
    expect(plan.fill).toEqual(fresh);
    expect(plan.conflicts).toEqual([]);
  });
});
