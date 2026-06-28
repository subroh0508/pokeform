import { describe, expect, it } from "vitest";
import { type MoveInput, moveEnName, moveId, moveStatsFields } from "./moves-fields.ts";

const crabhammer: MoveInput = {
  name: "Crabhammer",
  type: "Water",
  category: "Physical",
  basePower: 100,
  accuracy: 90,
  pp: 12,
  priority: 0,
};

describe("moveId", () => {
  it("derives a kebab id from the move name", () => {
    expect(moveId({ ...crabhammer, name: "Dragon Claw" })).toBe("dragon-claw");
  });
});

describe("moveStatsFields", () => {
  it("maps a damaging move (lowercased type, damageClass, numeric power/accuracy)", () => {
    expect(moveStatsFields(crabhammer)).toEqual({
      type: "water",
      damageClass: "physical",
      power: 100,
      accuracy: 90,
      pp: 12,
      priority: 0,
    });
  });

  it("coalesces status power 0 → null and accuracy true → null", () => {
    const swordsDance: MoveInput = {
      name: "Swords Dance",
      type: "Normal",
      category: "Status",
      basePower: 0,
      accuracy: true,
      pp: 20,
      priority: 0,
    };
    expect(moveStatsFields(swordsDance)).toMatchObject({
      damageClass: "status",
      power: null,
      accuracy: null,
    });
  });

  it("carries a special move with priority", () => {
    const quickAttackish: MoveInput = {
      name: "Vacuum Wave",
      type: "Fighting",
      category: "Special",
      basePower: 40,
      accuracy: 100,
      pp: 12,
      priority: 1,
    };
    expect(moveStatsFields(quickAttackish)).toEqual({
      type: "fighting",
      damageClass: "special",
      power: 40,
      accuracy: 100,
      pp: 12,
      priority: 1,
    });
  });
});

describe("moveEnName", () => {
  it("carries the showdown display name as en", () => {
    expect(moveEnName(crabhammer)).toEqual({ en: "Crabhammer" });
  });
});
