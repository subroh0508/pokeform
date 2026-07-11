import { describe, expect, it } from "vitest";
import { genderMegaFormsIdentical, type MegaShape } from "./gender-mega-collapse.ts";

const base: MegaShape = {
  types: ["psychic"],
  stats: { H: 74, A: 48, B: 76, C: 143, D: 101, S: 124 },
  ability: "trace",
};
const moves = ["calm-mind", "psychic", "shadow-ball"];

describe("genderMegaFormsIdentical", () => {
  it("returns true when types / stats / ability / learnset all match", () => {
    expect(genderMegaFormsIdentical(base, { ...base }, moves, [...moves].reverse())).toBe(true);
  });

  it("returns false when ability differs", () => {
    expect(genderMegaFormsIdentical(base, { ...base, ability: "prankster" }, moves, moves)).toBe(
      false,
    );
  });

  it("returns false when types differ (set mismatch)", () => {
    expect(
      genderMegaFormsIdentical(base, { ...base, types: ["psychic", "fairy"] }, moves, moves),
    ).toBe(false);
  });

  it("returns false when any base stat differs", () => {
    expect(
      genderMegaFormsIdentical(base, { ...base, stats: { ...base.stats, S: 120 } }, moves, moves),
    ).toBe(false);
  });

  it("returns false when the learnset differs (meowstic ♀♂ movepool split)", () => {
    expect(genderMegaFormsIdentical(base, { ...base }, moves, [...moves, "future-sight"])).toBe(
      false,
    );
  });
});
