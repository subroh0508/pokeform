import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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
 * 覚えない技 / 参照切れがあれば非0終了（authoring 時ゲート・[[cli-and-io]] / ADR 0023）。
 * 覚えない技の検証は `data/raw`（learnset）が要る。未取得時は技検証をスキップし参照整合のみ見る
 * （full 検証は `pnpm fetch:data` 後）。
 */

const root = process.cwd();
const CH = join(root, "data", "champions");
const RAW = join(root, "data", "raw");

const readCatalogSet = (file: string, key: string): Set<string> => {
  // catalog は id → { ja, en } マップ（Phase 10）。参照整合に要るのは id（キー）集合のみ。
  const y = parseYaml(readFileSync(join(CH, "catalog", file), "utf8")) as Record<
    string,
    Record<string, unknown>
  >;
  return new Set(Object.keys(y[key] ?? {}));
};

/** data/raw/pokemon の learnset を読む。未取得なら null（覚えない技検証はスキップ）。 */
const loadLearnsets = (): Record<string, ReadonlySet<string>> | null => {
  const pokeDir = join(RAW, "pokemon");
  if (!existsSync(pokeDir)) return null;
  const out: Record<string, ReadonlySet<string>> = {};
  for (const f of readdirSync(pokeDir).filter((n) => n.endsWith(".json"))) {
    const slug = f.replace(/\.json$/, "");
    const j = JSON.parse(readFileSync(join(pokeDir, f), "utf8")) as {
      moves: { move: { name: string } }[];
    };
    out[slug] = new Set(j.moves.map((m) => m.move.name));
  }
  return out;
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
    case "move-not-learnable":
      return ja
        ? `  覚えない技: ${issue.species} は ${issue.move} を習得不可`
        : `  not learnable: ${issue.species} cannot learn ${issue.move}`;
  }
};

/** check:regulation を実行し、終了コード（0 = OK / 1 = 問題あり）を返す。 */
export const runCheckRegulation = (path: string, lang: Lang): number => {
  const catalog: RegulationCatalog = {
    species: readCatalogSet("species.yaml", "pokemon"),
    items: readCatalogSet("items.yaml", "items"),
    moves: readCatalogSet("moves.yaml", "moves"),
  };
  const learnsets = loadLearnsets();
  if (learnsets === null) {
    console.log(
      lang === "ja"
        ? "ℹ️ data/raw 未取得のため覚えない技の検証をスキップ（full 検証は pnpm fetch:data 後）"
        : "ℹ️ data/raw absent: skipping learnable-move check (run pnpm fetch:data for full check)",
    );
  }
  let total = 0;
  for (const file of regFiles(path)) {
    const reg = parseYaml(readFileSync(file, "utf8")) as Record<string, unknown>;
    const issues = validateRegulation(reg, catalog, learnsets);
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
