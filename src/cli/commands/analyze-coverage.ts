import { analyzeCoverage, type CoverageReport } from "../../domain/coverage.ts";
import { toCoverageMembers } from "../../domain/party-analysis.ts";
import { buildChart } from "../../domain/type-effectiveness.ts";
import { itemSpecsDex } from "../../generated/champions/item-specs.ts";
// 攻撃範囲分析は per-game 技メタ（type/damageClass）を引く（Champions 固有値・ADR 0034）。
import { moveSpecsDex } from "../../generated/champions/move-specs.ts";
import { typeSpecsDex } from "../../generated/champions/type-specs.ts";
import { loadParty } from "../../io/load-party.ts";
import { resolveInputFiles } from "../../io/resolve-paths.ts";
import type { Lang } from "../../types/party.ts";
import { speciesStructuralDex } from "../../types/species.ts";
import { typeName } from "../format.ts";

/**
 * analyze:coverage コマンド本体（薄い CLI 配線・カバレッジ対象外）。集計ロジックは
 * domain/coverage・party-analysis（純関数・テスト済み）に委譲し、ここは入出力と終了コードのみ。
 * いずれかのパーティが脆弱（弱点集中）なら非0終了（[[cli-and-io]]）。
 */

const chart = buildChart(typeSpecsDex);

const printReport = (report: CoverageReport, lang: Lang): void => {
  // 防御弱点（weakCount 降順・弱点ありの行のみ）
  const rows = [...report.weaknesses]
    .filter((w) => w.weakCount > 0)
    .sort((a, b) => b.weakCount - a.weakCount);
  console.log(
    lang === "ja" ? "  防御弱点（弱点数 / 半減数）:" : "  Defensive weaknesses (weak / resist):",
  );
  for (const w of rows) {
    const mark = w.vulnerable ? " ⚠️" : "";
    console.log(`    ${typeName(w.type, lang)}: ${w.weakCount} / ${w.resistCount}${mark}`);
  }
  // 攻撃カバレッジの穴
  const holes = report.holes.map((h) => typeName(h.type, lang)).join(", ");
  console.log(
    lang === "ja" ? `  技範囲の穴: ${holes || "なし"}` : `  Coverage holes: ${holes || "none"}`,
  );
};

/** analyze:coverage を実行し、終了コード（0 = 健全 / 1 = 脆弱）を返す。 */
export const runAnalyzeCoverage = async (path: string, lang: Lang): Promise<number> => {
  const files = await resolveInputFiles(path);
  let vulnerable = false;
  for (const file of files) {
    const { name, party } = await loadParty(file);
    const members = toCoverageMembers(party, speciesStructuralDex, moveSpecsDex, itemSpecsDex);
    const report = analyzeCoverage(members, chart);
    if (report.vulnerable) vulnerable = true;
    const head = report.vulnerable
      ? lang === "ja"
        ? `❌ ${name}: 脆弱（弱点集中）`
        : `❌ ${name}: vulnerable (weakness concentration)`
      : lang === "ja"
        ? `✅ ${name}: 健全`
        : `✅ ${name}: healthy`;
    console.log(head);
    printReport(report, lang);
  }
  return vulnerable ? 1 : 0;
};
