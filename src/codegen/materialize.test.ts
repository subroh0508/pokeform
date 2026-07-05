import { describe, expect, it } from "vitest";
import {
  extractEnName,
  extractJaName,
  extractNames,
  planFields,
  pruneToKeep,
  sortedUnion,
} from "./materialize.ts";

describe("extractJaName / extractEnName / extractNames", () => {
  const named = {
    names: [
      { name: "Garchomp", language: { name: "en" } },
      { name: "ガブリアス", language: { name: "ja-Hrkt" } },
      { name: "ガブリアス漢字", language: { name: "ja" } },
    ],
  };

  it("prefers ja-Hrkt over ja (case-insensitive language code)", () => {
    expect(extractJaName(named)).toBe("ガブリアス");
  });

  it("falls back to ja when ja-Hrkt is absent", () => {
    expect(extractJaName({ names: [{ name: "じしん", language: { name: "ja" } }] })).toBe("じしん");
  });

  it("returns undefined when no Japanese name exists", () => {
    expect(
      extractJaName({ names: [{ name: "Earthquake", language: { name: "en" } }] }),
    ).toBeUndefined();
    expect(extractJaName({})).toBeUndefined();
  });

  it("reads the English name", () => {
    expect(extractEnName(named)).toBe("Garchomp");
    expect(extractEnName({})).toBeUndefined();
  });

  it("builds a names object with only the resolved fields", () => {
    expect(extractNames(named)).toEqual({ ja: "ガブリアス", en: "Garchomp" });
    expect(extractNames({ names: [{ name: "さめはだ", language: { name: "ja" } }] })).toEqual({
      ja: "さめはだ",
    });
    expect(extractNames({})).toEqual({});
  });
});

describe("planFields", () => {
  const fresh = { ja: "ガブリアス", en: "Garchomp" };

  it("fills only absent fields (append/既存尊重)", () => {
    // ja は既存（= raw と一致）で no-op、en は未設定で fill。
    const plan = planFields({ ja: "ガブリアス" }, fresh);
    expect(plan.fill).toEqual({ en: "Garchomp" });
    expect(plan.conflicts).toEqual([]);
  });

  it("reports conflicts without overwriting skill-authored values", () => {
    // ja は Champions 速報名で手修正済み（raw と異なる）→ conflict（上書きしない）。
    const plan = planFields({ ja: "別名ガブリアス", en: "Garchomp" }, fresh);
    expect(plan.fill).toEqual({});
    expect(plan.conflicts).toEqual([
      { key: "ja", existing: "別名ガブリアス", fresh: "ガブリアス" },
    ]);
  });

  it("fills everything when the entry has no name yet", () => {
    const plan = planFields({}, fresh);
    expect(plan.fill).toEqual(fresh);
    expect(plan.conflicts).toEqual([]);
  });
});

describe("sortedUnion", () => {
  it("dedupes across lists and sorts ascending", () => {
    expect(
      sortedUnion([["choice-scarf", "leftovers"], ["choice-scarf", "assault-vest"], ["life-orb"]]),
    ).toEqual(["assault-vest", "choice-scarf", "leftovers", "life-orb"]);
  });

  it("returns an empty array for no items (fail-fast source for the caller)", () => {
    expect(sortedUnion([])).toEqual([]);
    expect(sortedUnion([[], []])).toEqual([]);
  });
});

describe("pruneToKeep", () => {
  it("partitions existing ids into kept (in whitelist) and removed (outside)", () => {
    const { kept, removed } = pruneToKeep(
      ["poke-ball", "leftovers", "potion", "choice-scarf"],
      ["leftovers", "choice-scarf", "garchompite"],
    );
    expect(kept).toEqual(["leftovers", "choice-scarf"]);
    expect(removed).toEqual(["poke-ball", "potion"]);
  });

  it("keeps everything when all existing ids are in the whitelist", () => {
    expect(pruneToKeep(["a", "b"], ["a", "b", "c"])).toEqual({
      kept: ["a", "b"],
      removed: [],
    });
  });

  it("removes everything when the whitelist is empty", () => {
    expect(pruneToKeep(["a", "b"], [])).toEqual({ kept: [], removed: ["a", "b"] });
  });
});
