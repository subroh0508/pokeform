import { describe, expect, it } from "vitest";
import { isCatalogIdShape } from "./id-shape.ts";

describe("isCatalogIdShape", () => {
  it("accepts kebab id 形", () => {
    expect(isCatalogIdShape("aerial-ace")).toBe(true);
    expect(isCatalogIdShape("charizard")).toBe(true);
    expect(isCatalogIdShape("charizard-mega-x")).toBe(true);
  });

  it("rejects 不適合形（大文字 / 空 / 前後ハイフン / 連続ハイフン）", () => {
    expect(isCatalogIdShape("Aerial Ace")).toBe(false);
    expect(isCatalogIdShape("")).toBe(false);
    expect(isCatalogIdShape("-foo")).toBe(false);
    expect(isCatalogIdShape("foo--bar")).toBe(false);
  });
});
