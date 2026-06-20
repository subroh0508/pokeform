import { regulationDex } from "../../../data/generated/champions/index.ts";
import { type PartyIssue, validateParty } from "../../domain/party-analysis.ts";
import { loadParty } from "../../io/load-party.ts";
import { resolveInputFiles } from "../../io/resolve-paths.ts";
import type { Lang } from "../../types/party.ts";
import { speciesStructuralDex } from "../../types/species.ts";
import { speciesName } from "../format.ts";

/**
 * check:party コマンド本体（薄い CLI 配線・カバレッジ対象外）。検証ロジックは
 * domain/party-analysis（純関数・テスト済み）に委譲し、ここは入出力と終了コードのみ担う。
 * 不整合が 1 件でもあれば非0終了（[[cli-and-io]]）。
 */

const formatIssue = (issue: PartyIssue, lang: Lang): string => {
  switch (issue.kind) {
    case "broken-ref":
      return lang === "ja" ? `  参照切れ: ${issue.path}` : `  broken ref: ${issue.path}`;
    case "unknown-species":
      return lang === "ja"
        ? `  不明な種族『${issue.name}』(${issue.path})`
        : `  unknown species "${issue.name}" (${issue.path})`;
    case "duplicate-species":
      return lang === "ja"
        ? `  同種族重複: ${speciesName(issue.speciesId, lang)} × ${issue.paths.length}`
        : `  duplicate species: ${speciesName(issue.speciesId, lang)} × ${issue.paths.length}`;
    case "not-legal":
      return lang === "ja"
        ? `  未解禁: ${speciesName(issue.speciesId, lang)} は ${issue.regulation} で使用不可 (${issue.path})`
        : `  not legal: ${speciesName(issue.speciesId, lang)} is not allowed in ${issue.regulation} (${issue.path})`;
    case "over-size":
      return lang === "ja"
        ? `  体数超過: ${issue.count} 体（上限 6）`
        : `  too many members: ${issue.count} (max 6)`;
  }
};

/** check:party を実行し、終了コード（0 = 整合 / 1 = 不整合あり）を返す。 */
export const runCheckParty = async (path: string, lang: Lang): Promise<number> => {
  const files = await resolveInputFiles(path);
  let totalIssues = 0;
  for (const file of files) {
    const { name, party } = await loadParty(file);
    const issues = validateParty(party, speciesStructuralDex, regulationDex);
    if (issues.length === 0) {
      console.log(lang === "ja" ? `✅ ${name}: 整合` : `✅ ${name}: OK`);
      continue;
    }
    totalIssues += issues.length;
    console.log(
      lang === "ja" ? `❌ ${name}: ${issues.length} 件` : `❌ ${name}: ${issues.length} issue(s)`,
    );
    for (const issue of issues) console.log(formatIssue(issue, lang));
  }
  return totalIssues > 0 ? 1 : 0;
};
