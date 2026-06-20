import { describe, expect, it } from "vitest";
import { chart } from "./__fixtures__/chart.ts";
import {
  analyzeCoverage,
  analyzeWeaknesses,
  type CoverageMember,
  findCoverageHoles,
  VULNERABLE_WEAK_COUNT,
} from "./coverage.ts";

/** こおり ×4 を共有する 3 ドラゴン軸（弱点集中で脆弱になる構成）。 */
const dragons: readonly CoverageMember[] = [
  {
    id: "garchomp",
    name: "ガブリアス",
    defenseTypes: ["dragon", "ground"],
    attackTypes: ["ground", "dragon", "rock", "fire"],
  },
  {
    id: "dragonite",
    name: "カイリュー",
    defenseTypes: ["dragon", "flying"],
    attackTypes: ["dragon", "ground", "fire", "normal"],
  },
  {
    id: "salamence",
    name: "ボーマンダ",
    defenseTypes: ["dragon", "flying"],
    attackTypes: ["dragon", "ground", "fire"],
  },
];

describe("analyzeWeaknesses", () => {
  const rows = analyzeWeaknesses(dragons, chart);
  const row = (t: string) => rows.find((r) => r.type === t);

  it("攻撃タイプごとに weakCount / resistCount / vulnerable を集計する", () => {
    // こおり: 3 体とも ×4 → weakCount 3・脆弱
    expect(row("ice")).toMatchObject({ weakCount: 3, vulnerable: true });
    // ほのお: 3 体とも ≤0.5 → resistCount 3・weakCount 0
    expect(row("fire")).toMatchObject({ weakCount: 0, resistCount: 3, vulnerable: false });
    // みず: garchomp は等倍(1=neither)、他 2 体は半減 → resistCount 2
    expect(row("water")).toMatchObject({ weakCount: 0, resistCount: 2 });
  });

  it("全 18 攻撃タイプ分の行を返す", () => {
    expect(rows).toHaveLength(18);
  });
});

describe("findCoverageHoles", () => {
  const holes = findCoverageHoles(dragons, chart);
  const has = (t: string) => holes.some((h) => h.type === t);

  it("等倍超を出せない防御タイプを穴として列挙する", () => {
    expect(has("ghost")).toBe(true); // arsenal で等倍超を出せない
    expect(has("grass")).toBe(false); // ほのお で抜群が取れる → 穴でない
  });

  it("攻撃技が無いと全防御タイプが穴になる", () => {
    const noAttack: CoverageMember[] = [
      { id: "x", name: "X", defenseTypes: ["normal"], attackTypes: [] },
    ];
    expect(findCoverageHoles(noAttack, chart)).toHaveLength(18);
  });
});

describe("analyzeCoverage", () => {
  it("弱点集中があれば vulnerable=true", () => {
    const report = analyzeCoverage(dragons, chart);
    expect(report.vulnerable).toBe(true);
    expect(report.weaknesses).toHaveLength(18);
    expect(report.holes.length).toBeGreaterThan(0);
  });

  it("弱点が集中しなければ vulnerable=false", () => {
    const report = analyzeCoverage(dragons.slice(0, VULNERABLE_WEAK_COUNT - 1), chart);
    expect(report.vulnerable).toBe(false);
  });
});
