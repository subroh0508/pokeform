import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  decodeSerebiiHtml,
  parseItemsPage,
  parseMoveMaster,
  parseSpeciesPage,
  slugFromHref,
} from "./parse.ts";

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "__fixtures__");
/** fixture は latin-1（ISO-8859-1）で保存されている（実 Serebii ページと同じ）。 */
const fixture = (name: string): string => readFileSync(join(FIXTURES, `${name}.html`), "latin1");

describe("decodeSerebiiHtml", () => {
  it("decodes latin-1 bytes (e.g. 0xE9 -> é)", () => {
    expect(decodeSerebiiHtml(new Uint8Array([0x50, 0x6f, 0x6b, 0xe9]))).toBe("Poké");
  });
});

describe("parseSpeciesPage — simple species (garchomp)", () => {
  const p = parseSpeciesPage(fixture("serebii-garchomp"));

  it("extracts name, dex, types, abilities and stats", () => {
    expect(p.en).toBe("Garchomp");
    expect(p.dex).toBe(445);
    expect(p.types).toEqual(["dragon", "ground"]);
    expect(p.abilities).toEqual(["sand-veil", "rough-skin"]);
    expect(p.stats).toEqual({ H: 108, A: 130, B: 95, C: 80, D: 85, S: 102 });
    expect(p.statTotal).toBe(600);
    expect(p.megas).toEqual([]);
  });

  it("extracts all Standard Moves with 101-accuracy and status (--) handling", () => {
    expect(p.moves).toEqual([
      {
        name: "Aerial Ace",
        id: "aerial-ace",
        type: "flying",
        damageClass: "physical",
        power: 60,
        accuracy: null, // 101 = 必中 → null
        pp: 20,
      },
      {
        name: "Swords Dance",
        id: "swords-dance",
        type: "normal",
        damageClass: "status", // Serebii "Other" → status
        power: null, // -- → null
        accuracy: null, // 101 → null
        pp: 20,
      },
      {
        name: "Earthquake",
        id: "earthquake",
        type: "ground",
        damageClass: "physical",
        power: 100,
        accuracy: 100,
        pp: 10,
      },
    ]);
  });
});

describe("parseSpeciesPage — mega / multi-form species (charizard)", () => {
  const p = parseSpeciesPage(fixture("serebii-charizard"));

  it("extracts base species (typeimg only, mega type gifs ignored for base)", () => {
    expect(p.en).toBe("Charizard");
    expect(p.dex).toBe(6);
    expect(p.types).toEqual(["fire", "flying"]);
    expect(p.abilities).toEqual(["blaze", "solar-power"]);
    expect(p.stats).toEqual({ H: 78, A: 84, B: 78, C: 109, D: 85, S: 100 });
    expect(p.statTotal).toBe(534);
    expect(p.moves).toHaveLength(1);
    expect(p.moves[0]).toMatchObject({ id: "flamethrower", type: "fire", damageClass: "special" });
  });

  it("extracts each mega form's name, types, abilities and stats", () => {
    expect(p.megas).toEqual([
      {
        name: "Mega Charizard X",
        types: ["fire", "dragon"],
        abilities: ["tough-claws"],
        stats: { H: 78, A: 130, B: 111, C: 130, D: 85, S: 100 },
        statTotal: 634,
      },
      {
        name: "Mega Charizard Y",
        types: ["fire", "flying"],
        abilities: ["drought"],
        stats: { H: 78, A: 104, B: 78, C: 159, D: 115, S: 100 },
        statTotal: 634,
      },
    ]);
  });
});

describe("slugFromHref", () => {
  it("extracts the serebii item slug from an itemdex href", () => {
    expect(slugFromHref("/itemdex/choicescarf.shtml")).toBe("choicescarf");
    expect(slugFromHref("/itemdex/never-meltice.shtml")).toBe("never-meltice");
  });

  it("returns an empty string for a missing or slug-less href", () => {
    expect(slugFromHref(undefined)).toBe("");
    expect(slugFromHref("/itemdex/.shtml")).toBe("");
  });
});

describe("parseItemsPage — items.shtml fixture (hold / mega-stone / berry; misc excluded)", () => {
  const { items } = parseItemsPage(fixture("serebii-items"));

  it("extracts hold items with display-name catalog ids and raw serebii slugs", () => {
    expect(items.filter((i) => i.category === "hold")).toEqual([
      {
        name: "Choice Scarf",
        id: "choice-scarf",
        slug: "choicescarf",
        category: "hold",
        megaStoneFor: null,
      },
      {
        name: "Never-Melt Ice",
        id: "never-melt-ice", // 表示名由来 = PokeAPI slug（圧縮 slug never-meltice とずれる）
        slug: "never-meltice",
        category: "hold",
        megaStoneFor: null,
      },
    ]);
  });

  it("extracts mega stones with the target base species pulled from the description text", () => {
    expect(items.filter((i) => i.category === "mega-stone")).toEqual([
      {
        name: "Charizardite X",
        id: "charizardite-x",
        slug: "charizarditex",
        category: "mega-stone",
        megaStoneFor: "charizard",
      },
      {
        name: "Floettite",
        id: "floettite",
        slug: "floettite",
        category: "mega-stone",
        megaStoneFor: "floette", // "A special Floette holding this stone…"
      },
    ]);
  });

  it("merges berries that span multiple tables within one section", () => {
    // Berries セクションが 2 table にまたがる（次の見出しまで全 table を読む）ことを検証。
    expect(items.filter((i) => i.category === "berry")).toEqual([
      {
        name: "Oran Berry",
        id: "oran-berry",
        slug: "oranberry",
        category: "berry",
        megaStoneFor: null,
      },
      {
        name: "Sitrus Berry",
        id: "sitrus-berry",
        slug: "sitrusberry",
        category: "berry",
        megaStoneFor: null,
      },
    ]);
  });

  it("excludes the Miscellaneous Items section (tickets / coupons are not held items)", () => {
    expect(items.map((i) => i.id)).not.toContain("training-ticket");
    expect(items).toHaveLength(6); // hold 2 + mega-stone 2 + berry 2
  });
});

describe("parseItemsPage — edge structures (missing slug / unmatched mega desc)", () => {
  // itemdex href が slug パターン外（空 slug）・メガ説明文が "holding this" を含まない行を集約して境界を網羅。
  const EDGE = `
<div align="center"><font size="4"><b><u>Hold Items</u></b></font></div>
<table class="dextable">
  <tr><td class="fooevo">Picture</td><td class="fooevo">Name</td></tr>
  <tr><td class="cen"><a href="/itemdex/.shtml"><img /></a></td>
    <td class="fooinfo"><a href="/itemdex/.shtml">Mystery Item</a></td>
    <td class="fooinfo">No slug in href.</td></tr></table>
<div align="center"><font size="4"><b><u>Mega Stone</u></b></font></div>
<table class="dextable">
  <tr><td class="cen"><a href="/itemdex/weirdite.shtml"><img /></a></td>
    <td class="fooinfo"><a href="/itemdex/weirdite.shtml">Weirdite</a></td>
    <td class="fooinfo">A Mega Stone with no recognisable holder sentence.</td></tr></table>`;
  const { items } = parseItemsPage(EDGE);

  it("falls back to an empty slug when the itemdex href has no slug", () => {
    expect(items[0]).toEqual({
      name: "Mystery Item",
      id: "mystery-item",
      slug: "",
      category: "hold",
      megaStoneFor: null,
    });
  });

  it("leaves megaStoneFor null when the description has no holder sentence", () => {
    expect(items[1]).toEqual({
      name: "Weirdite",
      id: "weirdite",
      slug: "weirdite",
      category: "mega-stone",
      megaStoneFor: null,
    });
  });
});

describe("parseItemsPage — no item sections", () => {
  it("returns an empty list when no item section headings are present", () => {
    expect(parseItemsPage("<html><body><p>nothing</p></body></html>")).toEqual({ items: [] });
  });
});

describe("parseMoveMaster — move-master pages (attackdex-champions fixtures)", () => {
  it("extracts a physical damaging move with Champions-scale PP (earthquake 12, not 10)", () => {
    expect(parseMoveMaster(fixture("serebii-move-earthquake"))).toEqual({
      name: "Earthquake",
      id: "earthquake",
      type: "ground",
      damageClass: "physical",
      power: 100,
      accuracy: 100,
      pp: 12, // 前作 10 ではなく Champions 値 12
      priority: 0,
    });
  });

  it("extracts a special move (draco meteor, PP 8)", () => {
    expect(parseMoveMaster(fixture("serebii-move-draco-meteor"))).toEqual({
      name: "Draco Meteor",
      id: "draco-meteor",
      type: "dragon",
      damageClass: "special",
      power: 130,
      accuracy: 90,
      pp: 8,
      priority: 0,
    });
  });

  it("maps a status move power 0 / accuracy 101 to null (swords dance)", () => {
    expect(parseMoveMaster(fixture("serebii-move-swords-dance"))).toEqual({
      name: "Swords Dance",
      id: "swords-dance",
      type: "normal",
      damageClass: "status", // Serebii cat other.png → status
      power: null, // 0 → null
      accuracy: null, // 101 → null
      pp: 20,
      priority: 0,
    });
  });

  it("maps variable-power moves (serebii power 1) to null (low kick)", () => {
    expect(parseMoveMaster(fixture("serebii-move-low-kick"))).toMatchObject({
      id: "low-kick",
      damageClass: "physical",
      power: null, // 可変威力 = serebii 表記 1 → null
      accuracy: 100,
      pp: 20,
      priority: 0,
    });
  });

  it("extracts a positive priority move (quick attack +1)", () => {
    expect(parseMoveMaster(fixture("serebii-move-quick-attack"))).toMatchObject({
      id: "quick-attack",
      power: 40,
      pp: 20,
      priority: 1,
    });
  });

  it("extracts a negative priority move (roar -6)", () => {
    expect(parseMoveMaster(fixture("serebii-move-roar"))).toMatchObject({
      id: "roar",
      damageClass: "status",
      power: null,
      accuracy: null,
      priority: -6,
    });
  });

  it("returns empty/null fields for a page without a title or info table", () => {
    expect(parseMoveMaster("<html><body><p>nothing</p></body></html>")).toEqual({
      name: "",
      id: "",
      type: "",
      damageClass: "",
      power: null,
      accuracy: null,
      pp: null,
      priority: null,
    });
  });

  it("leaves type/damageClass empty for imgs with no src or unknown type/cat", () => {
    // src 無し img（attr undefined → ""）と未知 cat png（other 以外）を集約し、type/damageClass の
    // フォールバック（typeFromGif null → "" / damageClassFromImg 未知 → ""）境界を網羅する。
    const EDGE = `<title>Edge Move - AttackDex - Serebii.net</title>
<table class="dextable">
  <tr><td class="fooevo"><b>Attack Name</b></td><td class="fooevo"><b>Battle Type</b></td>
    <td class="fooevo"><b>Category</b></td></tr>
  <tr><td class="cen">Edge Move</td><td class="cen"><img></td>
    <td class="cen"><img src="/pokedex-bw/type/weird.png"></td></tr>
  <tr><td class="fooevo"><b>Power Points</b></td><td class="fooevo"><b>Base Power</b></td>
    <td class="fooevo"><b>Accuracy</b></td></tr>
  <tr><td class="cen">12</td><td class="cen">50</td><td class="cen">100</td></tr>
  <tr><td class="fooevo"><b>Base Critical Hit Rate</b></td><td class="fooevo"><b>Speed Priority</b></td>
    <td class="fooevo"><b>Hit</b></td></tr>
  <tr><td class="cen">4.17%</td><td class="cen">0</td><td class="cen">Self</td></tr>
</table>`;
    expect(parseMoveMaster(EDGE)).toEqual({
      name: "Edge Move",
      id: "edge-move",
      type: "", // src 無し img → typeFromGif null → ""
      damageClass: "", // weird.png = 未知 cat → ""
      power: 50,
      accuracy: 100,
      pp: 12,
      priority: 0,
    });
  });
});

describe("parseSpeciesPage — degenerate input", () => {
  it("returns empty/null fields when the title and tables are absent", () => {
    const p = parseSpeciesPage("<html><body><p>nothing</p></body></html>");
    expect(p.en).toBe("");
    expect(p.dex).toBeNull();
    expect(p.types).toEqual([]);
    expect(p.abilities).toEqual([]);
    expect(p.statTotal).toBeNull();
    expect(p.moves).toEqual([]);
    expect(p.megas).toEqual([]);
  });
});

describe("parseSpeciesPage — edge structures (dedup / invalid / malformed cells)", () => {
  // 重複 typeimg・無効タイプ・重複特性・空 / 非数値の power・無効 type/cat 画像を 1 ページに集約して
  // パーサの境界分岐を網羅する。
  const EDGE = `
<title>Edge - #999 - Serebii.net</title>
<table class="dextable"><tr><td class="cen">
  <img src="/pokedex-bw/type/dragon.gif" alt="Dragon-type" class="typeimg" />
  <img src="/pokedex-bw/type/dragon.gif" alt="Dragon-type" class="typeimg" />
  <img src="/pokedex-bw/type/mystery.gif" alt="Mystery-type" class="typeimg" />
  <img src="/pokedex-bw/type/water.gif" class="typeimg" />
</td></tr></table>
<table class="dextable"><tr><td class="fooinfo"><b>Abilities</b>:
  <a href="/abilitydex/sandveil.shtml"><b>Sand Veil</b></a> -
  <a href="/abilitydex/sandveil.shtml"><b>Sand Veil</b></a></td></tr>
  <tr><td class="fooinfo">no abilities marker here</td></tr></table>
<table class="dextable"><tr><td colspan="2" class="fooinfo">Base Stats - Total: 10</td>
  <td class="fooinfo">1</td><td class="fooinfo">2</td><td class="fooinfo">3</td>
  <td class="fooinfo">4</td><td class="fooinfo">0</td><td class="fooinfo">0</td></tr></table>
<a name="attacks"></a><table class="dextable"><tr><th class="attheader">Attack Name</th></tr><tr>
  <td rowspan="2" class="fooinfo"><a href="/attackdex-champions/edgemove.shtml">Edge Move</a></td>
  <td class="cen"><img src="/pokedex-bw/type/mystery.gif"></td>
  <td class="cen"><img src="/pokedex-bw/type/weird.png"></td>
  <td class="cen"></td><td class="cen">100</td><td class="cen">5</td><td class="cen">--</td></tr>
  <tr><td class="fooinfo" colspan="6">effect</td></tr><tr>
  <td rowspan="2" class="fooinfo"><a href="/attackdex-champions/nomatch.shtml">No Match</a></td>
  <td class="cen"><img src="/icons/none.png"></td>
  <td class="cen"><img src="/pokedex-bw/type/physical.png"></td>
  <td class="cen">abc</td><td class="cen">--</td><td class="cen">10</td><td class="cen">--</td></tr>
  <tr><td class="fooinfo" colspan="6">effect</td></tr><tr>
  <td rowspan="2" class="fooinfo"><a href="/attackdex-champions/noimg.shtml">No Img</a></td>
  <td class="cen"></td><td class="cen"></td>
  <td class="cen">50</td><td class="cen">100</td><td class="cen">5</td><td class="cen">--</td></tr>
  <tr><td class="fooinfo" colspan="6">effect</td></tr></table>
<a name="mega"></a><table class="dextable"><tr><td class="fooevo"><h3>Mega Edge</h3></td></tr>
  <tr><td class="cen">
    <img src="/pokedex-bw/type/fire.gif" />
    <img src="/pokedex-bw/type/fire.gif" />
    <img src="/pokedex-bw/type/mystery.gif" />
    <img /></td></tr>
  <tr><td class="fooinfo"><b>Abilities</b>: <a href="/abilitydex/drought.shtml"><b>Drought</b></a></td></tr>
  <tr><td colspan="2" class="fooinfo">Base Stats - Total: 20</td>
    <td class="fooinfo">5</td><td class="fooinfo">5</td><td class="fooinfo">5</td>
    <td class="fooinfo"></td><td class="fooinfo">0</td><td class="fooinfo">0</td></tr></table>`;
  const p = parseSpeciesPage(EDGE);

  it("dedups types and drops invalid type ids on the base species", () => {
    expect(p.types).toEqual(["dragon"]);
  });

  it("dedups abilities and ignores tds without an Abilities marker", () => {
    expect(p.abilities).toEqual(["sand-veil"]);
  });

  it("maps empty/non-numeric power to null and unknown type/cat to empty string", () => {
    expect(p.moves[0]).toEqual({
      name: "Edge Move",
      id: "edge-move",
      type: "", // mystery = 無効タイプ → ""
      damageClass: "", // weird.png = 未知 cat → ""
      power: null, // 空セル → null
      accuracy: 100,
      pp: 5,
    });
    expect(p.moves[1]).toMatchObject({
      type: "", // src が type gif パターン外 → null → ""
      damageClass: "physical",
      power: null, // "abc" = 非数値 → null
      accuracy: null, // -- → null
    });
    // type / cat セルに img が無い → attr undefined → "" 経由で type / damageClass とも ""。
    expect(p.moves[2]).toEqual({
      name: "No Img",
      id: "no-img",
      type: "",
      damageClass: "",
      power: 50,
      accuracy: 100,
      pp: 5,
    });
  });

  it("dedups and filters mega type gifs", () => {
    expect(p.megas[0]).toEqual({
      name: "Mega Edge",
      types: ["fire"], // 重複 fire は 1 つ・mystery は無効・src 無し img は無視
      abilities: ["drought"],
      stats: { H: 5, A: 5, B: 5, C: 0, D: 0, S: 0 }, // 空セル → 0
      statTotal: 20,
    });
  });
});
