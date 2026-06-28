import { describe, expect, it } from "vitest";
import { fixture } from "./__fixtures__/load.ts";
import { parseLearnset, parseRoster, parseSpecies } from "./parse-species.ts";

describe("parseRoster", () => {
  it("pokedex-champions リンクの slug を重複なし・id 昇順で集める", () => {
    expect(parseRoster(fixture("pokemon-roster.html"))).toEqual([
      "abomasnow",
      "charizard",
      "garchomp",
    ]);
  });
});

describe("parseSpecies", () => {
  it("種族の構造 + ja + learnset を抽出する（メガ手前の base スコープ）", () => {
    const s = parseSpecies(fixture("pokedex-charizard.html"));
    expect(s).toEqual({
      id: "charizard",
      en: "Charizard",
      ja: "リザードン",
      dex: 6,
      types: ["fire", "flying"],
      abilities: ["blaze", "solar-power"],
      stats: { H: 78, A: 84, B: 78, C: 109, D: 85, S: 100 },
      statTotal: 534,
      moves: ["earthquake", "quick-attack", "swords-dance"],
    });
  });

  it("title が取れなければ en 空 / dex null（メガ無しページの base スコープ）", () => {
    const s = parseSpecies("<html><head><title>No Dex Here</title></head><body></body></html>");
    expect(s.en).toBe("");
    expect(s.dex).toBeNull();
    expect(s.moves).toEqual([]);
  });
});

describe("parseLearnset", () => {
  it("技リンクの無いテーブルでは空配列", () => {
    expect(parseLearnset('<a name="attacks"></a><table class="dextable"></table>')).toEqual([]);
  });

  it("重複技は 1 回・空名リンクは捨てる", () => {
    const html =
      '<a name="attacks"></a><table class="dextable">' +
      '<tr><td><a href="/attackdex-champions/tackle.shtml">Tackle</a></td></tr>' +
      '<tr><td><a href="/attackdex-champions/tackle.shtml">Tackle</a></td></tr>' +
      '<tr><td><a href="/attackdex-champions/x.shtml"></a></td></tr>' +
      "</table>";
    expect(parseLearnset(html)).toEqual(["tackle"]);
  });
});
