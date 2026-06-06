import { describe, expect, it } from "vitest";
import {
  type ItemInfo,
  MAX_PARTY_SIZE,
  type MoveInfo,
  type ResolvedMember,
  type ResolvedParty,
  type SpeciesInfo,
  toCoverageMembers,
  validateParty,
} from "./party-analysis.ts";

const speciesDex: Record<string, SpeciesInfo> = {
  garchomp: { types: ["dragon", "ground"], regulations: ["champions-m-a", "champions-m-b"] },
  mewtwo: { types: ["psychic"], regulations: ["champions-m-b"] },
  charizard: {
    types: ["fire", "flying"],
    regulations: ["champions-m-a"],
    megaEvolvesTo: "charizard-mega-x",
  },
  "charizard-mega-x": { types: ["fire", "dragon"], regulations: ["champions-m-a"] },
  badmega: { types: ["normal"], regulations: ["champions-m-a"], megaEvolvesTo: "ghost-x" },
};
const moveDex: Record<string, MoveInfo> = {
  "flare-blitz": { type: "fire", damageClass: "physical" },
  "will-o-wisp": { type: "fire", damageClass: "status" },
  earthquake: { type: "ground", damageClass: "physical" },
};
const itemDex: Record<string, ItemInfo> = {
  "charizardite-x": { id: "charizardite-x", megaStoneFor: "charizard" },
  leftovers: { id: "leftovers" },
  badstone: { id: "badstone", megaStoneFor: "badmega" },
};

const mk = (p: Partial<ResolvedMember> & { path: string }): ResolvedMember => ({
  found: true,
  speciesName: p.speciesId ?? "?",
  speciesId: null,
  itemId: null,
  moveIds: [],
  ...p,
});

describe("validateParty", () => {
  it("整合パーティは不整合なし", () => {
    const party: ResolvedParty = {
      regulation: "champions-m-a",
      members: [
        mk({ path: "a", speciesId: "garchomp" }),
        mk({ path: "b", speciesId: "charizard" }),
      ],
    };
    expect(validateParty(party, speciesDex)).toEqual([]);
  });

  it("参照切れ / 未知種族 / 未解禁 / 同種族重複 を検出する", () => {
    const party: ResolvedParty = {
      regulation: "champions-m-a",
      members: [
        mk({ path: "broken", found: false }),
        mk({ path: "unknown", speciesId: null, speciesName: "ふしぎなもの" }),
        mk({ path: "ghost", speciesId: "not-in-dex", speciesName: "not-in-dex" }),
        mk({ path: "illegal", speciesId: "mewtwo" }),
        mk({ path: "dup1", speciesId: "garchomp" }),
        mk({ path: "dup2", speciesId: "garchomp" }),
      ],
    };
    const issues = validateParty(party, speciesDex);
    expect(issues).toContainEqual({ kind: "broken-ref", path: "broken" });
    expect(issues).toContainEqual({
      kind: "unknown-species",
      path: "unknown",
      name: "ふしぎなもの",
    });
    expect(issues).toContainEqual({ kind: "unknown-species", path: "ghost", name: "not-in-dex" });
    expect(issues).toContainEqual({
      kind: "not-legal",
      path: "illegal",
      speciesId: "mewtwo",
      regulation: "champions-m-a",
    });
    expect(issues).toContainEqual({
      kind: "duplicate-species",
      speciesId: "garchomp",
      paths: ["dup1", "dup2"],
    });
  });

  it("体数超過を検出する", () => {
    const party: ResolvedParty = {
      regulation: "champions-m-a",
      members: Array.from({ length: MAX_PARTY_SIZE + 1 }, (_, i) =>
        mk({ path: `m${i}`, speciesId: "charizard" }),
      ),
    };
    expect(validateParty(party, speciesDex)).toContainEqual({
      kind: "over-size",
      count: MAX_PARTY_SIZE + 1,
    });
  });
});

describe("toCoverageMembers", () => {
  it("メガストーン保持はメガ先タイプで防御分析・status 技と未知技は攻撃から除外", () => {
    const party: ResolvedParty = {
      regulation: "champions-m-a",
      members: [
        mk({
          path: "zard",
          speciesId: "charizard",
          itemId: "charizardite-x",
          moveIds: ["flare-blitz", "will-o-wisp", "earthquake", "ghost-move"],
        }),
      ],
    };
    const [zard] = toCoverageMembers(party, speciesDex, moveDex, itemDex);
    expect(zard?.defenseTypes).toEqual(["fire", "dragon"]); // メガ先
    expect(zard?.attackTypes).toEqual(["fire", "ground"]); // status / 未知 を除外
  });

  it("非メガ（持ち物なし / メガストーンでない / メガ先が辞書に無い）は素のタイプ", () => {
    const party: ResolvedParty = {
      regulation: "champions-m-a",
      members: [
        mk({ path: "noitem", speciesId: "charizard", itemId: null }),
        mk({ path: "nostone", speciesId: "charizard", itemId: "leftovers" }),
        mk({ path: "badmega", speciesId: "badmega", itemId: "badstone" }),
      ],
    };
    const members = toCoverageMembers(party, speciesDex, moveDex, itemDex);
    expect(members.map((m) => m.defenseTypes)).toEqual([
      ["fire", "flying"],
      ["fire", "flying"],
      ["normal"],
    ]);
  });

  it("未解決 / 辞書に無い種族はスキップ", () => {
    const party: ResolvedParty = {
      regulation: "champions-m-a",
      members: [mk({ path: "x", speciesId: null }), mk({ path: "y", speciesId: "not-in-dex" })],
    };
    expect(toCoverageMembers(party, speciesDex, moveDex, itemDex)).toEqual([]);
  });
});
