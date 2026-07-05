import { describe, expect, it } from "vitest";
import { parseDocument } from "yaml";
import {
  extractEnName,
  extractJaName,
  extractMegaNames,
  extractNames,
  getOrCreateBlockMap,
  megaFormCandidates,
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

describe("extractMegaNames", () => {
  const charizardMegaX = {
    is_mega: true,
    form_names: [
      { name: "メガリザードンＸ", language: { name: "ja-hrkt" } },
      { name: "メガリザードンＸ", language: { name: "ja" } },
      { name: "Mega Charizard X", language: { name: "en" } },
    ],
  };

  it("reads ja (ja-Hrkt 優先) and en from form_names when is_mega", () => {
    expect(extractMegaNames(charizardMegaX)).toEqual({
      ja: "メガリザードンＸ",
      en: "Mega Charizard X",
    });
  });

  it("falls back to ja when ja-Hrkt is absent (staraptor-mega 形)", () => {
    expect(
      extractMegaNames({
        is_mega: true,
        form_names: [
          { name: "メガムクホーク", language: { name: "ja" } },
          { name: "Mega Staraptor", language: { name: "en" } },
        ],
      }),
    ).toEqual({ ja: "メガムクホーク", en: "Mega Staraptor" });
  });

  it("returns an empty object for non-mega forms (is_mega false / undefined)", () => {
    expect(extractMegaNames({ is_mega: false, form_names: charizardMegaX.form_names })).toEqual({});
    expect(extractMegaNames({})).toEqual({});
  });

  it("returns an empty object when is_mega but form_names is absent", () => {
    expect(extractMegaNames({ is_mega: true })).toEqual({});
  });

  it("includes only the resolved fields when a language is missing", () => {
    expect(
      extractMegaNames({
        is_mega: true,
        form_names: [{ name: "メガフシギバナ", language: { name: "ja-hrkt" } }],
      }),
    ).toEqual({ ja: "メガフシギバナ" });
  });
});

describe("megaFormCandidates", () => {
  it("keeps -mega / -mega-x / -mega-y / -mega-z slugs and drops non-mega forms", () => {
    expect(
      megaFormCandidates([
        "venusaur-mega",
        "charizard-mega-x",
        "charizard-mega-y",
        "absol-mega-z",
        "meganium",
        "yanmega",
        "kyogre-primal",
        "tatsugiri-curly",
      ]),
    ).toEqual(["venusaur-mega", "charizard-mega-x", "charizard-mega-y", "absol-mega-z"]);
  });

  it("returns an empty array when no mega slugs are present", () => {
    expect(megaFormCandidates(["pikachu", "eevee"])).toEqual([]);
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

describe("getOrCreateBlockMap", () => {
  it("returns the existing map and appended entries serialize as block style", () => {
    const doc = parseDocument("species:\n  garchomp:\n    ja: ガブリアス\n    en: Garchomp\n");
    const map = getOrCreateBlockMap(doc, "species");
    expect(map.get("garchomp")).toBeDefined();
    map.set(doc.createNode("dragonite"), doc.createNode({ ja: "カイリュー", en: "Dragonite" }));
    const out = doc.toString();
    expect(out).toContain("  dragonite:");
    expect(out).not.toContain("{"); // flow を混ぜない（check:yaml-style 通過）
  });

  it("creates a block map when the key is null (`mapKey:`) and appends without crashing", () => {
    const doc = parseDocument("species:\n"); // 値が無い = doc.get は undefined
    const map = getOrCreateBlockMap(doc, "species");
    map.set(doc.createNode("garchomp"), doc.createNode({ ja: "ガブリアス", en: "Garchomp" }));
    const out = doc.toString();
    expect(out).toContain("species:");
    expect(out).toContain("  garchomp:");
    expect(out).not.toContain("{");
  });

  it("creates the key as a block map when absent entirely (missing-file doc)", () => {
    const doc = parseDocument("# data/languages/species.yaml — header only\n");
    const map = getOrCreateBlockMap(doc, "species");
    map.set(doc.createNode("garchomp"), doc.createNode({ ja: "ガブリアス", en: "Garchomp" }));
    const out = doc.toString();
    expect(out).toContain("# data/languages/species.yaml"); // 先頭コメントを保持
    expect(out).toContain("species:");
    expect(out).toContain("  garchomp:");
    expect(out).not.toContain("{");
  });

  it("forces an existing flow map to block style", () => {
    const doc = parseDocument("species: {}\n"); // flow empty map
    const map = getOrCreateBlockMap(doc, "species");
    map.set(doc.createNode("garchomp"), doc.createNode({ ja: "ガブリアス", en: "Garchomp" }));
    expect(doc.toString()).not.toContain("{");
  });
});
