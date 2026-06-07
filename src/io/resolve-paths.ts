import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { glob } from "tinyglobby";

/**
 * 入力パスを対象ファイル一覧へ解決する（薄い I/O 層・カバレッジ対象外）。ファイル指定なら
 * それ自身、ディレクトリ指定なら配下を再帰 glob する（[[cli-and-io]] の「ディレクトリ再帰」）。
 */
export const resolveInputFiles = async (input: string, pattern = "**/*.md"): Promise<string[]> => {
  const abs = resolve(input);
  const info = await stat(abs);
  if (info.isFile()) return [abs];
  const files = await glob(pattern, { cwd: abs, absolute: true });
  return files.sort();
};
