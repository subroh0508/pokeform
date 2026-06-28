import { describe, expect, it } from "vitest";
import { abilityEnName, abilityId } from "./abilities-fields.ts";

describe("abilityId", () => {
  it("derives a kebab id from the ability name", () => {
    expect(abilityId({ name: "Rough Skin" })).toBe("rough-skin");
  });
});

describe("abilityEnName", () => {
  it("carries the showdown display name as en", () => {
    expect(abilityEnName({ name: "Levitate" })).toEqual({ en: "Levitate" });
  });
});
