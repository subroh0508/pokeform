import { describe, expect, it } from "vitest";
import { type NameMaps, resolveName } from "./resolve-names.ts";

const maps: NameMaps = {
  idByJa: { ガブリアス: "garchomp", でんきだま: "light-ball" },
  ids: new Set(["garchomp", "light-ball"]),
};

describe("resolveName", () => {
  it("en: ID をそのまま受理する", () => {
    expect(resolveName("garchomp", "en", maps)).toEqual({ ok: true, id: "garchomp" });
  });
  it("en: 日本語名は wrong-lang", () => {
    expect(resolveName("ガブリアス", "en", maps)).toEqual({
      ok: false,
      reason: "wrong-lang",
      raw: "ガブリアス",
    });
  });
  it("en: 未知名は unknown", () => {
    expect(resolveName("ピカチュウ", "en", maps)).toEqual({
      ok: false,
      reason: "unknown",
      raw: "ピカチュウ",
    });
  });
  it("ja: 日本語名を ID へ解決する", () => {
    expect(resolveName("ガブリアス", "ja", maps)).toEqual({ ok: true, id: "garchomp" });
  });
  it("ja: 英名 ID は wrong-lang", () => {
    expect(resolveName("garchomp", "ja", maps)).toEqual({
      ok: false,
      reason: "wrong-lang",
      raw: "garchomp",
    });
  });
  it("ja: 未知名は unknown", () => {
    expect(resolveName("unknown-x", "ja", maps)).toEqual({
      ok: false,
      reason: "unknown",
      raw: "unknown-x",
    });
  });
});
