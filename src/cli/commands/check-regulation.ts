import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import {
  type RegulationCatalog,
  type RegulationIssue,
  validateRegulation,
} from "../../domain/regulation-validation.ts";
import type { Lang } from "../../types/party.ts";

/**
 * check:regulation コマンド本体（薄い CLI 配線・カバレッジ対象外）。検証ロジックは
 * domain/regulation-validation（純関数・テスト済み）に委譲し、ここは入出力と終了コードのみ担う。
 * 参照整合（種族 / 持ち物 / メガ / 技が catalog に存在）/ schema があれば非0終了（authoring 時ゲート・
 * [[cli-and-io]] / ADR 0023）。覚えない技（learnset legality）の照合は撤去した（ADR 0026・PokeAPI は
 * Champions 非対応で `data/raw` learnset が実態と一致しないため）。技の出自は Serebii 第一優先で
 * authoring 段に担保する（`survey-regulation` skill）。
 */

const root = process.cwd();
const CH = join(root, "data", "champions");

const readCatalogSet = (file: string, key: string): Set<string> => {
  // catalog は id → { ja, en } マップ（Phase 10）。参照整合に要るのは id（キー）集合のみ。
  const y = parseYaml(readFileSync(join(CH, "catalog", file), "utf8")) as Record<
    string,
    Record<string, unknown>
  >;
  return new Set(Object.keys(y[key] ?? {}));
};

/** path（ファイル / ディレクトリ）から対象 regulation YAML を列挙する。 */
const regFiles = (path: string): string[] => {
  const stat = statSync(path);
  if (stat.isDirectory()) {
    return readdirSync(path)
      .filter((f) => f.endsWith(".yaml"))
      .sort()
      .map((f) => join(path, f));
  }
  return [path];
};

const formatIssue = (issue: RegulationIssue, lang: Lang): string => {
  const ja = lang === "ja";
  switch (issue.kind) {
    case "bad-species-block":
      return ja
        ? `  不正な種族ブロック: ${issue.species}（moves 配列が必要）`
        : `  bad species block: ${issue.species} (moves array required)`;
    case "missing-species":
      return ja
        ? `  未登録の種族: ${issue.species}（catalog/species.yaml に追記が必要）`
        : `  species not in catalog: ${issue.species}`;
    case "missing-item":
      return ja ? `  未登録の持ち物: ${issue.item}` : `  item not in catalog: ${issue.item}`;
    case "missing-mega":
      return ja
        ? `  未登録のメガ先: ${issue.mega}（${issue.species}）`
        : `  mega not in catalog: ${issue.mega} (${issue.species})`;
    case "missing-move":
      return ja
        ? `  未登録の技: ${issue.move}（${issue.species}）`
        : `  move not in catalog: ${issue.move} (${issue.species})`;
  }
};

/** check:regulation を実行し、終了コード（0 = OK / 1 = 問題あり）を返す。 */
export const runCheckRegulation = (path: string, lang: Lang): number => {
  const catalog: RegulationCatalog = {
    species: readCatalogSet("species.yaml", "pokemon"),
    items: readCatalogSet("items.yaml", "items"),
    moves: readCatalogSet("moves.yaml", "moves"),
  };
  let total = 0;
  for (const file of regFiles(path)) {
    const reg = parseYaml(readFileSync(file, "utf8")) as Record<string, unknown>;
    const issues = validateRegulation(reg, catalog);
    const name = file.replace(/^.*\//, "");
    if (issues.length === 0) {
      console.log(lang === "ja" ? `✅ ${name}: 整合` : `✅ ${name}: OK`);
      continue;
    }
    total += issues.length;
    console.log(
      lang === "ja" ? `❌ ${name}: ${issues.length} 件` : `❌ ${name}: ${issues.length} issue(s)`,
    );
    for (const issue of issues) console.log(formatIssue(issue, lang));
  }
  return total > 0 ? 1 : 0;
};
