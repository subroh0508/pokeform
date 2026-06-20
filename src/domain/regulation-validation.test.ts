import { describe, expect, it } from "vitest";
import { type RegulationCatalog, validateRegulation } from "./regulation-validation.ts";

const catalog: RegulationCatalog = {
  species: new Set(["garchomp", "charizard", "charizard-mega-x"]),
  items: new Set(["life-orb", "charizardite-x"]),
  moves: new Set(["earthquake", "dragon-claw", "flare-blitz"]),
};

describe("validateRegulation", () => {
  it("正当なレギュレーションは問題なし（参照整合・schema のみ検証）", () => {
    const reg = {
      name: { en: "M-A", ja: "M-A" },
      period: { start: "2026-04-08", end: null },
      items: ["life-orb", "charizardite-x"],
      garchomp: { moves: ["earthquake", "dragon-claw"] },
      charizard: { moves: ["flare-blitz", "dragon-claw"], mega: ["charizard-mega-x"] },
    };
    expect(validateRegulation(reg, catalog)).toEqual([]);
  });

  it("参照切れ（種族 / 持ち物 / メガ / 技）を検出する", () => {
    const reg = {
      items: ["life-orb", "unknown-item"],
      garchomp: { moves: ["earthquake", "unknown-move"] },
      "ghost-mon": { moves: ["earthquake"], mega: ["ghost-mega"] },
    };
    const issues = validateRegulation(reg, catalog);
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

  it("catalog 所属の技は learnset 照合せず通す（覚えない技検証は撤去・ADR 0026）", () => {
    // catalog に存在すれば、種族が実ゲームで覚えるかは検証しない（PokeAPI は Champions 非対応）。
    const reg = { garchomp: { moves: ["flare-blitz"] } };
    expect(validateRegulation(reg, catalog)).toEqual([]);
  });

  it("不正な種族ブロック（moves 欠落 / moves 非文字列配列 / mega 非配列）を検出する", () => {
    const reg = {
      garchomp: { notMoves: [] },
      charizard: { moves: [123] },
      "charizard-mega-x": { moves: ["flare-blitz"], mega: "charizard-mega-x" },
    };
    const issues = validateRegulation(reg, catalog);
    expect(issues).toContainEqual({ kind: "bad-species-block", species: "garchomp" });
    expect(issues).toContainEqual({ kind: "bad-species-block", species: "charizard" });
    expect(issues).toContainEqual({ kind: "bad-species-block", species: "charizard-mega-x" });
  });

  it("items が無い / 配列でないときは持ち物検証をスキップ", () => {
    const reg = { garchomp: { moves: ["earthquake"] } };
    expect(validateRegulation(reg, catalog)).toEqual([]);
  });

  it("種族ブロックが null のとき bad-species-block を検出する", () => {
    const reg = { garchomp: null };
    expect(validateRegulation(reg, catalog)).toEqual([
      { kind: "bad-species-block", species: "garchomp" },
    ]);
  });
});
