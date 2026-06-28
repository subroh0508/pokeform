import { load } from "cheerio";
import { describe, expect, it } from "vitest";
import {
  abilitiesIn,
  cellNumber,
  decodeSerebiiHtml,
  jaByLabel,
  jaFromText,
  statsIn,
  toId,
  typeFromGif,
  typesFromGifs,
  typesFromImgAlt,
} from "./decode.ts";

describe("decodeSerebiiHtml", () => {
  it("latin-1 バイト列を文字へ写す", () => {
    expect(decodeSerebiiHtml(new Uint8Array([72, 105]))).toBe("Hi");
  });
});

describe("toId", () => {
  it("アポストロフィ / ピリオドを除去し kebab 化する", () => {
    expect(toId("Forest's Curse")).toBe("forests-curse");
    expect(toId("Mr. Mime")).toBe("mr-mime");
    expect(toId("King’s Rock")).toBe("kings-rock");
  });

  it("前後の非英数字を畳んで落とす", () => {
    expect(toId("  --Charizard X--  ")).toBe("charizard-x");
  });
});

describe("jaFromText", () => {
  it("ローマ字混じりから日本語の連続だけ取り出す", () => {
    expect(jaFromText("Lizardon リザードン")).toBe("リザードン");
    expect(jaFromText("たべのこし")).toBe("たべのこし");
  });

  it("日本語が無ければ空文字", () => {
    expect(jaFromText("Leftovers")).toBe("");
  });
});

describe("typeFromGif", () => {
  it("type gif から id を取り、未知 / 非該当は null", () => {
    expect(typeFromGif("/pokedex-bw/type/fire.gif")).toBe("fire");
    expect(typeFromGif("/pokedex-bw/type/xyz.gif")).toBeNull();
    expect(typeFromGif("/other.gif")).toBeNull();
  });
});

describe("typesFromImgAlt", () => {
  it("typeimg alt から重複なしで集め、非タイプ alt は捨てる", () => {
    const $ = load(
      '<img class="typeimg" alt="Fire-type"/><img class="typeimg" alt="Fire-type"/>' +
        '<img class="typeimg" alt="Bogus-type"/><img class="typeimg"/>',
    );
    expect(typesFromImgAlt($)).toEqual(["fire"]);
  });
});

describe("typesFromGifs", () => {
  it("type gif から重複なしで集め、非該当 gif は捨てる", () => {
    const $ = load(
      '<img src="/pokedex-bw/type/fire.gif"/><img src="/pokedex-bw/type/dragon.gif"/>' +
        '<img src="/pokedex-bw/type/fire.gif"/><img src="/x.gif"/><img/>',
    );
    expect(typesFromGifs($)).toEqual(["fire", "dragon"]);
  });
});

describe("jaByLabel", () => {
  it("ラベル行の最後の td からカナを取り、無ければ空", () => {
    const $ = load(
      "<table><tr><td><b>Japan</b>: </td><td>Lizardon<br/>リザードン</td></tr></table>",
    );
    expect(jaByLabel($, "Japan")).toBe("リザードン");
    expect(jaByLabel($, "Korean")).toBe("");
  });
});

describe("abilitiesIn", () => {
  it("Abilities ブロックだけから特性 id を集め、非該当 td は無視・空 id は捨てる", () => {
    const $ = load(
      "<table><tr><td><b>Other</b>: ignore</td>" +
        '<td><b>Abilities</b>: <a href="/abilitydex/blaze.shtml"><b>Blaze</b></a>' +
        '<a href="/abilitydex/blaze.shtml"><b>Blaze</b></a>' +
        '<a href="/abilitydex/x.shtml"><b></b></a></td></tr></table>',
    );
    expect(abilitiesIn($)).toEqual(["blaze"]);
  });
});

describe("cellNumber", () => {
  it("-- / 空は null、数値は parse、非数値は null", () => {
    expect(cellNumber("--")).toBeNull();
    expect(cellNumber("  ")).toBeNull();
    expect(cellNumber("12")).toBe(12);
    expect(cellNumber("abc")).toBeNull();
  });
});

describe("statsIn", () => {
  it("Base Stats 行から Total と 6 値を読む（-- セルは 0）", () => {
    const $ = load(
      '<table><tr><td class="fooinfo">Base Stats - Total: 534</td>' +
        '<td class="fooinfo">78</td><td class="fooinfo">84</td><td class="fooinfo">--</td>' +
        '<td class="fooinfo">109</td><td class="fooinfo">85</td><td class="fooinfo">100</td></tr></table>',
    );
    expect(statsIn($)).toEqual({
      stats: { H: 78, A: 84, B: 0, C: 109, D: 85, S: 100 },
      statTotal: 534,
    });
  });

  it("Base Stats 行が無ければ statTotal は null", () => {
    const $ = load("<table><tr><td>nothing</td></tr></table>");
    expect(statsIn($)).toEqual({
      stats: { H: 0, A: 0, B: 0, C: 0, D: 0, S: 0 },
      statTotal: null,
    });
  });
});
