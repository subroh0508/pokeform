import { describe, expect, it } from "vitest";
import type { ParsedMoveMaster } from "./parse.ts";
import { moveMasterStatsFields } from "./per-game-fields.ts";

describe("moveMasterStatsFields", () => {
  const base: ParsedMoveMaster = {
    name: "Quick Attack",
    id: "quick-attack",
    type: "normal",
    damageClass: "physical",
    power: 40,
    accuracy: 100,
    pp: 20,
    priority: 1,
  };

  it("carries every move-master meta field including parsed priority", () => {
    expect(moveMasterStatsFields(base)).toEqual({
      type: "normal",
      damageClass: "physical",
      power: 40,
      accuracy: 100,
      pp: 20,
      priority: 1,
    });
  });

  it("coalesces a null priority to 0 (validated moves always carry priority)", () => {
    const m: ParsedMoveMaster = { ...base, priority: null };
    expect(moveMasterStatsFields(m).priority).toBe(0);
  });

  it("passes null power/accuracy through for status / variable-power moves", () => {
    const m: ParsedMoveMaster = { ...base, power: null, accuracy: null };
    expect(moveMasterStatsFields(m)).toMatchObject({ power: null, accuracy: null });
  });
});
