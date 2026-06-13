import { describe, expect, it } from "vitest";
import { findFlowCollections } from "./yaml-block-style.ts";

describe("findFlowCollections", () => {
  it("returns empty for block-only YAML", () => {
    const src = "pokemon:\n  garchomp:\n    types:\n      - dragon\n      - ground\n";
    expect(findFlowCollections(src)).toEqual([]);
  });

  it("detects a flow seq with its path and 1-based line", () => {
    const src = "pokemon:\n  garchomp:\n    types: [ dragon, ground ]\n";
    expect(findFlowCollections(src)).toEqual([{ path: "pokemon.garchomp.types", line: 3 }]);
  });

  it("detects a flow map with its path and 1-based line", () => {
    const src = "pokemon:\n  garchomp:\n    stats: { H: 108, A: 130 }\n";
    expect(findFlowCollections(src)).toEqual([{ path: "pokemon.garchomp.stats", line: 3 }]);
  });

  it("detects nested flow collections (flow seq inside a flow map)", () => {
    // 外側 flow map を行3で検出し、内側 flow seq も path を継いで検出する。
    const src = "root:\n  outer:\n    a: { b: [ 1, 2 ] }\n";
    expect(findFlowCollections(src)).toEqual([
      { path: "root.outer.a", line: 3 },
      { path: "root.outer.a.b", line: 3 },
    ]);
  });

  it("detects a top-level flow seq (root path is empty)", () => {
    const src = "[ a, b, c ]\n";
    expect(findFlowCollections(src)).toEqual([{ path: "", line: 1 }]);
  });

  it("uses index notation for flow inside a block seq, ignoring scalars", () => {
    const src = "items:\n  - id: a\n  - tags: [ x, y ]\n";
    expect(findFlowCollections(src)).toEqual([{ path: "items[1].tags", line: 3 }]);
  });

  it("ignores brackets that appear inside string values (AST-based, not regex)", () => {
    const src = 'note: "see [a, b] and {c: d}"\n';
    expect(findFlowCollections(src)).toEqual([]);
  });

  it("returns empty for a scalar-only document", () => {
    expect(findFlowCollections("just-a-scalar\n")).toEqual([]);
  });
});
