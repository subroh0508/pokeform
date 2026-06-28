import { describe, expect, it } from "vitest";
import { fixture } from "./__fixtures__/load.ts";
import { megaIdFor, parseMega } from "./parse-mega.ts";

describe("megaIdFor", () => {
  it("`Mega <Base> <Branch>` → `<base>-mega-<branch>`", () => {
    expect(megaIdFor("Charizard", "Mega Charizard X")).toBe("charizard-mega-x");
  });

  it("`Mega <Base>`（枝なし）→ `<base>-mega`", () => {
    expect(megaIdFor("Garchomp", "Mega Garchomp")).toBe("garchomp-mega");
  });

  it("base で始まらない残余はそのまま枝に使う", () => {
    expect(megaIdFor("Foo", "Mega Bar")).toBe("foo-mega-bar");
  });

  it("`Primal <Base>` → `<base>-primal`", () => {
    expect(megaIdFor("Groudon", "Primal Groudon")).toBe("groudon-primal");
  });

  it("接頭辞の無い未知形は素直に kebab", () => {
    expect(megaIdFor("Foo", "Weird Form")).toBe("weird-form");
  });
});

describe("parseMega", () => {
  it("種族ページのメガセクションから構造 / linking を抽出する", () => {
    const megas = parseMega(fixture("pokedex-charizard.html"));
    expect(megas).toEqual([
      {
        id: "charizard-mega-x",
        en: "Mega Charizard X",
        ja: "",
        baseSpecies: "charizard",
        types: ["fire", "dragon"],
        ability: "tough-claws",
        stats: { H: 78, A: 130, B: 111, C: 130, D: 85, S: 100 },
        statTotal: 634,
      },
      {
        id: "charizard-mega-y",
        en: "Mega Charizard Y",
        ja: "",
        baseSpecies: "charizard",
        types: ["fire", "flying"],
        ability: "drought",
        stats: { H: 78, A: 104, B: 78, C: 159, D: 115, S: 100 },
        statTotal: 634,
      },
    ]);
  });

  it("メガが無ければ空配列", () => {
    expect(
      parseMega("<html><head><title>Pikachu - #025 -</title></head><body></body></html>"),
    ).toEqual([]);
  });

  it("title / 特性が取れないメガは ability 空（base も空）", () => {
    const megas = parseMega('<a name="mega"></a><h3>Mega Thing</h3><div></div>');
    expect(megas).toHaveLength(1);
    expect(megas[0]?.ability).toBe("");
    expect(megas[0]?.baseSpecies).toBe("");
  });
});
