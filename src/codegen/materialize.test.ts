import { describe, expect, it } from "vitest";
import { parseDocument } from "yaml";
import {
  canonicalMegaId,
  composeFormName,
  deriveBaseId,
  EN_BRACKETS,
  extractEnName,
  extractJaName,
  extractMegaNames,
  extractNames,
  getOrCreateBlockMap,
  isDistinctForm,
  JA_BRACKETS,
  megaFormCandidates,
  megaIdsToPrune,
  planFields,
  pruneToKeep,
  resolveMegaEntry,
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

describe("canonicalMegaId", () => {
  it("collapses cosmetic-forme mega slugs to <base>-mega", () => {
    expect(canonicalMegaId("magearna-original-mega")).toBe("magearna-mega");
    expect(canonicalMegaId("tatsugiri-curly-mega")).toBe("tatsugiri-mega");
    expect(canonicalMegaId("tatsugiri-droopy-mega")).toBe("tatsugiri-mega");
    expect(canonicalMegaId("tatsugiri-stretchy-mega")).toBe("tatsugiri-mega");
  });

  it("is identity for non-collapse mega slugs and idempotent on collapsed ids", () => {
    expect(canonicalMegaId("charizard-mega-x")).toBe("charizard-mega-x");
    expect(canonicalMegaId("meowstic-female-mega")).toBe("meowstic-female-mega");
    expect(canonicalMegaId("tatsugiri-mega")).toBe("tatsugiri-mega");
    expect(canonicalMegaId("magearna-mega")).toBe("magearna-mega");
  });
});

describe("resolveMegaEntry", () => {
  it("canonicalizes id and overrides the name for collapsed tatsugiri megas", () => {
    expect(
      resolveMegaEntry("tatsugiri-curly-mega", {
        ja: "メガシャリタツ",
        en: "Mega Curly Tatsugiri",
      }),
    ).toEqual({ id: "tatsugiri-mega", names: { ja: "メガシャリタツ", en: "Mega Tatsugiri" } });
  });

  it("canonicalizes magearna-original to magearna-mega without a name override", () => {
    expect(
      resolveMegaEntry("magearna-original-mega", {
        ja: "メガマギアナ",
        en: "Mega Original Magearna",
      }),
    ).toEqual({ id: "magearna-mega", names: { ja: "メガマギアナ", en: "Mega Original Magearna" } });
  });

  it("passes through non-collapse slugs and their names unchanged", () => {
    expect(
      resolveMegaEntry("charizard-mega-x", { ja: "メガリザードンX", en: "Mega Charizard X" }),
    ).toEqual({ id: "charizard-mega-x", names: { ja: "メガリザードンX", en: "Mega Charizard X" } });
    expect(resolveMegaEntry("gengar-mega", {})).toEqual({ id: "gengar-mega", names: {} });
  });
});

describe("megaIdsToPrune", () => {
  it("returns collapse-source ids whose canonical target is present", () => {
    expect(
      megaIdsToPrune([
        "magearna-mega",
        "magearna-original-mega",
        "tatsugiri-mega",
        "tatsugiri-curly-mega",
        "tatsugiri-droopy-mega",
        "tatsugiri-stretchy-mega",
        "charizard-mega-x",
      ]),
    ).toEqual([
      "magearna-original-mega",
      "tatsugiri-curly-mega",
      "tatsugiri-droopy-mega",
      "tatsugiri-stretchy-mega",
    ]);
  });

  it("keeps a collapse-source id when its canonical target is absent (prevents name loss)", () => {
    expect(megaIdsToPrune(["tatsugiri-curly-mega"])).toEqual([]);
  });

  it("returns an empty array when no collapse-source ids exist", () => {
    expect(megaIdsToPrune(["charizard-mega-x", "gengar-mega"])).toEqual([]);
  });
});

describe("composeFormName", () => {
  it("passes the form name through when it already contains the base name (改名フォルム)", () => {
    // ヒートロトム / ウォッシュロトム / サトシゲッコウガ は base 名を内包 → そのまま採用。
    expect(composeFormName("ロトム", "ヒートロトム", JA_BRACKETS)).toBe("ヒートロトム");
    expect(composeFormName("ゲッコウガ", "サトシゲッコウガ", JA_BRACKETS)).toBe("サトシゲッコウガ");
    expect(composeFormName("Rotom", "Wash Rotom", EN_BRACKETS)).toBe("Wash Rotom");
  });

  it("composes base（form） in full-width brackets for ja", () => {
    expect(composeFormName("ザシアン", "けんのおう", JA_BRACKETS)).toBe("ザシアン（けんのおう）");
    expect(composeFormName("ライチュウ", "アローラのすがた", JA_BRACKETS)).toBe(
      "ライチュウ（アローラのすがた）",
    );
    expect(composeFormName("イダイトウ", "メスのすがた", JA_BRACKETS)).toBe(
      "イダイトウ（メスのすがた）",
    );
  });

  it("composes base (form) in half-width brackets with a leading space for en", () => {
    expect(composeFormName("Raichu", "Alolan Form", EN_BRACKETS)).toBe("Raichu (Alolan Form)");
    expect(composeFormName("Deoxys", "Normal Forme", EN_BRACKETS)).toBe("Deoxys (Normal Forme)");
  });

  it("returns the base name alone when the form name is empty (form_names 欠落)", () => {
    // greninja-battle-bond は form_names 空 → base 名のみ（呼び出し側が MANUAL_NAME_OVERRIDE で最終名を与える）。
    expect(composeFormName("ゲッコウガ", "", JA_BRACKETS)).toBe("ゲッコウガ");
    expect(composeFormName("Greninja", "", EN_BRACKETS)).toBe("Greninja");
  });
});

describe("isDistinctForm", () => {
  const base = { types: ["electric", "ghost"], baseStats: [50, 65, 107, 105, 107, 86] };

  it("is distinct when the types differ (rotom-wash 形・type 差)", () => {
    expect(isDistinctForm(base, { types: ["electric", "water"], baseStats: base.baseStats })).toBe(
      true,
    );
  });

  it("is distinct when the base stats differ (gimmighoul-roaming 形・stat 差)", () => {
    expect(isDistinctForm(base, { types: base.types, baseStats: [45, 30, 25, 75, 45, 80] })).toBe(
      true,
    );
  });

  it("is not distinct when both types and stats are identical (純装飾フォルム)", () => {
    // greninja-battle-bond は base と同型・同種族値 → false（FORM_INCLUDE で別途拾う）。
    expect(isDistinctForm(base, { types: [...base.types], baseStats: [...base.baseStats] })).toBe(
      false,
    );
  });

  it("is distinct when the type count differs (single vs dual type)", () => {
    expect(isDistinctForm(base, { types: ["electric"], baseStats: base.baseStats })).toBe(true);
  });
});

describe("deriveBaseId", () => {
  const species = ["raichu", "tauros", "mr-mime", "mr-rime", "gimmighoul", "basculegion"];

  it("derives the base id by longest base-slug prefix match", () => {
    expect(deriveBaseId("raichu-alola", species)).toBe("raichu");
    expect(deriveBaseId("tauros-paldea-combat-breed", species)).toBe("tauros");
    expect(deriveBaseId("gimmighoul-chest", species)).toBe("gimmighoul");
    expect(deriveBaseId("basculegion-male", species)).toBe("basculegion");
  });

  it("prefers the longest matching prefix (mr-mime over a hypothetical mr)", () => {
    expect(deriveBaseId("mr-mime-galar", ["mr", "mr-mime"])).toBe("mr-mime");
  });

  it("matches an exact base id (no suffix)", () => {
    expect(deriveBaseId("tauros", species)).toBe("tauros");
  });

  it("returns undefined when no base slug prefixes the form id", () => {
    expect(deriveBaseId("pikachu-alola", species)).toBeUndefined();
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
