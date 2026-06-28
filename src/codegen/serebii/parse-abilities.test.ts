import { describe, expect, it } from "vitest";
import { fixture } from "./__fixtures__/load.ts";
import { parseAbility } from "./parse-abilities.ts";

describe("parseAbility", () => {
  it("Name / Jp. Name 表から en + ja を抽出", () => {
    expect(parseAbility(fixture("abilitydex-blaze.html"))).toEqual({
      id: "blaze",
      en: "Blaze",
      ja: "もうか",
    });
  });

  it("Jp. Name ヘッダ行が無ければ（非ヘッダ行はスキップ）en / ja 空", () => {
    expect(
      parseAbility("<html><body><table><tr><td>not header</td></tr></table></body></html>"),
    ).toEqual({ id: "", en: "", ja: "" });
  });
});
