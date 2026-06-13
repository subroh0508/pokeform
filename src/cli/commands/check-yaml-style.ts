import { readFileSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { glob } from "tinyglobby";
import { findFlowCollections } from "../../domain/yaml-block-style.ts";
import type { Lang } from "../../types/party.ts";

/**
 * check:yaml-style コマンド本体（薄い CLI 配線・カバレッジ対象外）。検出ロジックは
 * domain/yaml-block-style（純関数・テスト済み）に委譲し、ここは glob / 入出力 / 終了コードのみ担う。
 *
 * `data/**\/*.yaml`（`data/raw` は .gitignore のキャッシュなので**対象外**）を走査し、flow スタイル
 * （`[ a, b ]` / `{ k: v }` のインライン記法）を 1 つでも含めば非0終了して該当 `path:line` を報告する
 * （AST ベース・正規表現でない・[[cli-and-io]] / [[data-pipeline]]）。
 */

const root = process.cwd();

/** path（ファイル / ディレクトリ）から対象 YAML を列挙する（data/raw は除外）。 */
const yamlFiles = async (path: string): Promise<string[]> => {
  const abs = resolve(path);
  if (statSync(abs).isFile()) return [abs];
  const files = await glob("**/*.yaml", {
    cwd: abs,
    absolute: true,
    ignore: ["**/raw/**"],
  });
  return files.sort();
};

/** check:yaml-style を実行し、終了コード（0 = OK / 1 = flow 検出）を返す。 */
export const runCheckYamlStyle = async (path: string, lang: Lang): Promise<number> => {
  const ja = lang === "ja";
  let total = 0;
  for (const file of await yamlFiles(path)) {
    const locations = findFlowCollections(readFileSync(file, "utf8"));
    const name = relative(root, file);
    if (locations.length === 0) {
      console.log(ja ? `✅ ${name}: ブロックスタイル` : `✅ ${name}: block style`);
      continue;
    }
    total += locations.length;
    console.log(
      ja
        ? `❌ ${name}: flow スタイル ${locations.length} 件`
        : `❌ ${name}: ${locations.length} flow node(s)`,
    );
    for (const loc of locations) {
      const at = loc.path === "" ? "(root)" : loc.path;
      console.log(
        ja
          ? `  ${name}:${loc.line} ${at}（block へ整形が必要）`
          : `  ${name}:${loc.line} ${at} (must be block style)`,
      );
    }
  }
  return total > 0 ? 1 : 0;
};
