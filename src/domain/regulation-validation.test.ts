import { describe, expect, it } from "vitest";
import { type RegulationCatalog, validateRegulation } from "./regulation-validation.ts";

const catalog: RegulationCatalog = {
  species: new Set(["garchomp", "charizard", "charizard-mega-x"]),
  items: new Set(["life-orb", "charizardite-x"]),
  moves: new Set(["earthquake", "dragon-claw", "flare-blitz"]),
};
const learnsets: Record<string, ReadonlySet<string>> = {
  garchomp: new Set(["earthquake", "dragon-claw"]),
  charizard: new Set(["flare-blitz", "dragon-claw"]),
};

describe("validateRegulation", () => {
  it("正当なレギュレーションは問題なし（learnset あり）", () => {
    const reg = {
      name: { en: "M-A", ja: "M-A" },
      period: { start: "2026-04-08", end: null },
      items: ["life-orb", "charizardite-x"],
      garchomp: { moves: ["earthquake", "dragon-claw"] },
      charizard: { moves: ["flare-blitz", "dragon-claw"], mega: ["charizard-mega-x"] },
    };
    expect(validateRegulation(reg, catalog, learnsets)).toEqual([]);
  });

  it("参照切れ（種族 / 持ち物 / メガ / 技）を検出する", () => {
    const reg = {
      items: ["life-orb", "unknown-item"],
      garchomp: { moves: ["earthquake", "unknown-move"] },
      "ghost-mon": { moves: ["earthquake"], mega: ["ghost-mega"] },
    };
    const issues = validateRegulation(reg, catalog, learnsets);
    expect(issues).toContainEqual({ kind: "missing-item", item: "unknown-item" });
    expect(issues).toContainEqual({
      kind: "missing-move",
      species: "garchomp",
      move: "unknown-move",
    });
    expect(issues).toContainEqual({ kind: "missing-species", species: "ghost-mon" });
    expect(issues).toContainEqual({
      kind: "missing-mega",
      species: "ghost-mon",
      mega: "ghost-mega",
    });
  });

  it("覚えない技（learnset 不適合）を検出する", () => {
    const reg = { garchomp: { moves: ["flare-blitz"] } };
    expect(validateRegulation(reg, catalog, learnsets)).toEqual([
      { kind: "move-not-learnable", species: "garchomp", move: "flare-blitz" },
    ]);
  });

  it("learnset が null のとき覚えない技検証はスキップ（参照整合のみ）", () => {
    const reg = { garchomp: { moves: ["flare-blitz"] } };
    expect(validateRegulation(reg, catalog, null)).toEqual([]);
  });

  it("learnset に未収載の種族は技検証をスキップ", () => {
    // charizard-mega-x は learnsets に無い → 覚えない技検証はスキップ（参照整合は通る）。
    const reg = { "charizard-mega-x": { moves: ["flare-blitz"] } };
    expect(validateRegulation(reg, catalog, learnsets)).toEqual([]);
  });

  it("不正な種族ブロック（moves 欠落 / moves 非文字列配列 / mega 非配列）を検出する", () => {
    const reg = {
      garchomp: { notMoves: [] },
      charizard: { moves: [123] },
      "charizard-mega-x": { moves: ["flare-blitz"], mega: "charizard-mega-x" },
    };
    const issues = validateRegulation(reg, catalog, learnsets);
    expect(issues).toContainEqual({ kind: "bad-species-block", species: "garchomp" });
    expect(issues).toContainEqual({ kind: "bad-species-block", species: "charizard" });
    expect(issues).toContainEqual({ kind: "bad-species-block", species: "charizard-mega-x" });
  });

  it("items が無い / 配列でないときは持ち物検証をスキップ", () => {
    const reg = { garchomp: { moves: ["earthquake"] } };
    expect(validateRegulation(reg, catalog, learnsets)).toEqual([]);
  });

  it("種族ブロックが null のとき bad-species-block を検出する", () => {
    const reg = { garchomp: null };
    expect(validateRegulation(reg, catalog, learnsets)).toEqual([
      { kind: "bad-species-block", species: "garchomp" },
    ]);
  });
});
