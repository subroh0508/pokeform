import { describe, expect, it } from "vitest";
import {
  type ItemInfo,
  MAX_PARTY_SIZE,
  type MoveInfo,
  type RegulationInfo,
  type ResolvedMember,
  type ResolvedParty,
  type SpeciesInfo,
  toCoverageMembers,
  validateParty,
} from "./party-analysis.ts";

const speciesDex: Record<string, SpeciesInfo> = {
  garchomp: { types: ["dragon", "ground"] },
  mewtwo: { types: ["psychic"] },
  charizard: {
    types: ["fire", "flying"],
    megaEvolvesTo: ["charizard-mega-x"],
  },
  "charizard-mega-x": { types: ["fire", "dragon"] },
  badmega: { types: ["normal"], megaEvolvesTo: ["ghost-x"] },
  emptymega: { types: ["water"], megaEvolvesTo: [] },
};
// 解禁判定の正本は per-regulation（A案・ADR 0021）。M-A は garchomp / charizard を解禁・mewtwo は未解禁。
const regulationDex: Record<string, RegulationInfo> = {
  "champions-m-a": { species: ["garchomp", "charizard"] },
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
  emptystone: { id: "emptystone", megaStoneFor: "emptymega" },
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
    expect(validateParty(party, speciesDex, regulationDex)).toEqual([]);
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
    const issues = validateParty(party, speciesDex, regulationDex);
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
    expect(validateParty(party, speciesDex, regulationDex)).toContainEqual({
      kind: "over-size",
      count: MAX_PARTY_SIZE + 1,
    });
  });

  it("未知レギュレーション宣言は全メンバーを未解禁として検出する", () => {
    const party: ResolvedParty = {
      regulation: "champions-unknown",
      members: [mk({ path: "a", speciesId: "garchomp" })],
    };
    expect(validateParty(party, speciesDex, regulationDex)).toContainEqual({
      kind: "not-legal",
      path: "a",
      speciesId: "garchomp",
      regulation: "champions-unknown",
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

  it("非メガ（持ち物なし / メガストーンでない / メガ先が辞書に無い / メガ先配列が空）は素のタイプ", () => {
    const party: ResolvedParty = {
      regulation: "champions-m-a",
      members: [
        mk({ path: "noitem", speciesId: "charizard", itemId: null }),
        mk({ path: "nostone", speciesId: "charizard", itemId: "leftovers" }),
        mk({ path: "badmega", speciesId: "badmega", itemId: "badstone" }),
        mk({ path: "emptymega", speciesId: "emptymega", itemId: "emptystone" }),
      ],
    };
    const members = toCoverageMembers(party, speciesDex, moveDex, itemDex);
    expect(members.map((m) => m.defenseTypes)).toEqual([
      ["fire", "flying"],
      ["fire", "flying"],
      ["normal"],
      ["water"],
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
