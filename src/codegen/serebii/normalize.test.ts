import { describe, expect, it } from "vitest";
import { EXCEPTIONS, isCatalogIdShape, normalizeAgainstCatalog, toCatalogId } from "./normalize.ts";

describe("isCatalogIdShape", () => {
  it("accepts lower kebab ids", () => {
    expect(isCatalogIdShape("aerial-ace")).toBe(true);
    expect(isCatalogIdShape("earthquake")).toBe(true);
    expect(isCatalogIdShape("conversion-2")).toBe(true);
  });

  it("rejects non-kebab shapes", () => {
    expect(isCatalogIdShape("Aerial Ace")).toBe(false);
    expect(isCatalogIdShape("-leading")).toBe(false);
    expect(isCatalogIdShape("trailing-")).toBe(false);
    expect(isCatalogIdShape("double--hyphen")).toBe(false);
    expect(isCatalogIdShape("")).toBe(false);
  });
});

describe("toCatalogId", () => {
  it("kebab-cases display names", () => {
    expect(toCatalogId("Aerial Ace")).toBe("aerial-ace");
    expect(toCatalogId("Swords Dance")).toBe("swords-dance");
    expect(toCatalogId("U-turn")).toBe("u-turn");
  });

  it("strips apostrophes and periods rather than hyphenating them", () => {
    expect(toCatalogId("Forest's Curse")).toBe("forests-curse");
    expect(toCatalogId("Will-O-Wisp")).toBe("will-o-wisp");
    expect(toCatalogId("Land’s Wrath")).toBe("lands-wrath");
  });

  it("trims surrounding non-alphanumerics", () => {
    expect(toCatalogId("  Tackle!  ")).toBe("tackle");
  });

  it("applies an exception override when the display name is not derivable", () => {
    expect(toCatalogId("Hi Jump Kick", { "hi jump kick": "high-jump-kick" })).toBe(
      "high-jump-kick",
    );
  });

  it("ships an empty default exceptions table", () => {
    expect(EXCEPTIONS).toEqual({});
  });
});

describe("normalizeAgainstCatalog", () => {
  const known = new Set(["aerial-ace", "earthquake"]);

  it("flags known catalog ids", () => {
    expect(normalizeAgainstCatalog("Aerial Ace", known)).toEqual({ id: "aerial-ace", known: true });
  });

  it("flags unknown ids so callers do not mint new catalog ids", () => {
    expect(normalizeAgainstCatalog("Made Up Move", known)).toEqual({
      id: "made-up-move",
      known: false,
    });
  });
});
