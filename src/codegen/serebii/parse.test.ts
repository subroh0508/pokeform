import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { decodeSerebiiHtml, parseSpeciesPage } from "./parse.ts";

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
