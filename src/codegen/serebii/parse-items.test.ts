import { describe, expect, it } from "vitest";
import { fixture } from "./__fixtures__/load.ts";
import { megaTargetFromDesc, parseItem, parseItemsRoster, slugFromHref } from "./parse-items.ts";

describe("slugFromHref", () => {
  it("itemdex href から slug を取り、非該当は空", () => {
    expect(slugFromHref("/itemdex/leftovers.shtml")).toBe("leftovers");
    expect(slugFromHref("/other/x")).toBe("");
    expect(slugFromHref(undefined)).toBe("");
  });
});

describe("megaTargetFromDesc", () => {
  it("説明文からメガ先種族を取り、無ければ null", () => {
    expect(megaTargetFromDesc("A Charizard holding this stone can Mega Evolve.")).toBe("charizard");
    expect(megaTargetFromDesc("A special Mewtwo holding this stone.")).toBe("mewtwo");
    expect(megaTargetFromDesc("A mysterious stone.")).toBeNull();
  });
});

describe("parseItemsRoster", () => {
  it("セクション別に category を付け、メガストーンはメガ先を引き、未知セクションは無視", () => {
    expect(parseItemsRoster(fixture("items.html"))).toEqual([
      { id: "leftovers", en: "Leftovers", slug: "leftovers", category: "hold", megaStoneFor: null },
      {
        id: "choice-scarf",
        en: "Choice Scarf",
        slug: "choicescarf",
        category: "hold",
        megaStoneFor: null,
      },
      {
        id: "charizardite-x",
        en: "Charizardite X",
        slug: "charizarditex",
        category: "mega-stone",
        megaStoneFor: "charizard",
      },
      {
        id: "sitrus-berry",
        en: "Sitrus Berry",
        slug: "sitrusberry",
        category: "berry",
        megaStoneFor: null,
      },
    ]);
  });
});

describe("parseItem", () => {
  it("itemdex から en + ja を抽出", () => {
    expect(parseItem(fixture("itemdex-leftovers.html"))).toEqual({
      id: "leftovers",
      en: "Leftovers",
      ja: "たべのこし",
    });
  });

  it("Japanese Name 列が無ければ ja 空", () => {
    expect(
      parseItem(
        "<html><head><title>Serebii.net ItemDex - Foo</title></head><body><table><tr><td>x</td></tr></table></body></html>",
      ),
    ).toEqual({ id: "foo", en: "Foo", ja: "" });
  });

  it("title が ItemDex 形でなければ en 空", () => {
    expect(parseItem("<html><head><title>Plain Page</title></head><body></body></html>").en).toBe(
      "",
    );
  });
});
