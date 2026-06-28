import { describe, expect, it } from "vitest";
import { fixture } from "./__fixtures__/load.ts";
import { parseMove } from "./parse-moves.ts";

describe("parseMove", () => {
  it("物理技: 技メタ + ja を抽出（PP は Champions スケール）", () => {
    expect(parseMove(fixture("attackdex-earthquake.html"))).toEqual({
      id: "earthquake",
      en: "Earthquake",
      ja: "じしん",
      type: "ground",
      damageClass: "physical",
      power: 100,
      accuracy: 100,
      pp: 12,
      priority: 0,
    });
  });

  it("変化技: power=0 / accuracy=101 は null、damageClass=status", () => {
    const m = parseMove(fixture("attackdex-swords-dance.html"));
    expect(m.damageClass).toBe("status");
    expect(m.power).toBeNull();
    expect(m.accuracy).toBeNull();
    expect(m.priority).toBe(0);
    expect(m.ja).toBe("つるぎのまい");
  });

  it("優先度技: priority は中央セル（+1）", () => {
    const m = parseMove(fixture("attackdex-quick-attack.html"));
    expect(m.priority).toBe(1);
    expect(m.power).toBe(40);
  });

  it("cat 画像が type より先でも type / damageClass を取り違えない", () => {
    const m = parseMove(
      "<html><head><title>Foo - AttackDex - Serebii.net</title></head><body>" +
        '<table class="dextable">' +
        '<tr><td><img /><img src="/pokedex-bw/type/physical.png" /><img src="/pokedex-bw/type/fire.gif" /></td></tr>' +
        "</table></body></html>",
    );
    expect(m.type).toBe("fire");
    expect(m.damageClass).toBe("physical");
  });

  it("title / メタ行が無ければ en 空・pp / priority null", () => {
    const m = parseMove(
      '<html><head><title>Plain</title></head><body><table class="dextable"></table></body></html>',
    );
    expect(m.en).toBe("");
    expect(m.id).toBe("");
    expect(m.pp).toBeNull();
    expect(m.priority).toBeNull();
    expect(m.type).toBe("");
    expect(m.damageClass).toBe("");
  });
});
