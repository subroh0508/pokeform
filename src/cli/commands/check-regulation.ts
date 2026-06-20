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
 * 参照整合（種族 / 持ち物 / メガ / 技が catalog に存在）/ schema があれば非0終了（authoring 時ゲート・
 * [[cli-and-io]] / ADR 0023）。覚えない技（learnset legality）の照合は撤去した（ADR 0026）。
 *
 * 新レイアウト（ADR 0035/0036）: 1 レギュ = 1 ディレクトリ（`data/champions/<reg>/{index,species,items,
 * mega,species-moves}.yaml`）。catalog は specs ツリー（`*-specs.yaml`）。本配線は split された per-reg ファイルを
 * 読んで domain が期待する 1 レコード（予約 items + 種族キー → {moves, mega}）へ**再構成**してから検証する。
 */

const root = process.cwd();
const CH = join(root, "data", "champions");

/** specs YAML のトップレベルマップ / 配列（`species` / `items` / `moves` 等）のキー集合を読む。 */
const readSpecKeys = (file: string, key: string): string[] => {
  const y = parseYaml(readFileSync(join(CH, file), "utf8")) as Record<string, unknown>;
  const node = y[key];
  if (Array.isArray(node)) return node.map(String);
  return Object.keys((node as Record<string, unknown>) ?? {});
};

/** catalog 集合（種族 = base + mega / 持ち物 / 技）を specs ツリーから組む。 */
const buildCatalog = (): RegulationCatalog => ({
  species: new Set([
    ...readSpecKeys("species-specs.yaml", "species"),
    ...readSpecKeys("mega-specs.yaml", "mega"),
  ]),
  items: new Set(readSpecKeys("item-specs.yaml", "items")),
  moves: new Set(readSpecKeys("move-specs.yaml", "moves")),
});

/** reg ディレクトリか（index.yaml を持つ）。 */
const isRegDir = (dir: string): boolean =>
  statSync(dir).isDirectory() && existsSync(join(dir, "index.yaml"));

/** path（reg ディレクトリ / それらを含むディレクトリ）から対象 reg ディレクトリを列挙する。 */
const regDirs = (path: string): string[] => {
  if (isRegDir(path)) return [path];
  return readdirSync(path, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => join(path, e.name))
    .filter(isRegDir)
    .sort();
};

/** split された per-reg ファイルを domain が期待する 1 レコードへ再構成する。 */
const loadRegRecord = (dir: string): Record<string, unknown> => {
  const rd = <T>(file: string): T => parseYaml(readFileSync(join(dir, file), "utf8")) as T;
  // レギュ名は languages（regulations.yaml）が SoT で index.yaml は period のみ（ADR 0035）。
  const index = rd<{ period: unknown }>("index.yaml");
  const species = rd<{ species: string[] }>("species.yaml").species ?? [];
  const items = rd<{ items: string[] }>("items.yaml").items ?? [];
  const mega = rd<{ mega: Record<string, string[]> }>("mega.yaml").mega ?? {};
  const speciesMoves = rd<{ moves: Record<string, string[]> }>("species-moves.yaml").moves ?? {};
  const record: Record<string, unknown> = { period: index.period, items };
  for (const sid of species) {
    const block: { moves: string[]; mega?: string[] } = { moves: speciesMoves[sid] ?? [] };
    if (mega[sid]) block.mega = mega[sid];
    record[sid] = block;
  }
  return record;
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
        ? `  未登録の種族: ${issue.species}（species-specs.yaml に追記が必要）`
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
  const catalog = buildCatalog();
  let total = 0;
  for (const dir of regDirs(path)) {
    const issues = validateRegulation(loadRegRecord(dir), catalog);
    const name = dir.replace(/^.*\//, "");
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
