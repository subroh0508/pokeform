import { statSync } from "node:fs";
import { resolve } from "node:path";
import { glob } from "tinyglobby";
import { type EmittedFile, emitIndividual } from "../../codegen/emit-individual-ts.ts";
import { emitParty } from "../../codegen/emit-party-ts.ts";
import { BUILD_DIR, formatDiagnostic, ROOT, runTsc, writeBuild } from "../../codegen/run-tsc.ts";

/**
 * `compile` / `check:individual` / `typecheck` コマンドの実体（薄い CLI 配線・カバレッジ対象外）。
 * 入力 YAML/MD を codegen で `*.generated.ts` に変換（`compile`）し、`tsconfig.generated.json` で
 * tsc 検証して診断を YAML/MD 行へ逆引き整形する（`check:individual` / `typecheck`）。問題検出時は
 * 非0終了（[[cli-and-io]]）。codegen は常に成功し、不正は tsc が型エラーとして弾く（[[tsc-verification]]）。
 */

/** 検証対象の種別。 */
export type Kind = "individual" | "party" | "all";

/** 入力パス（ファイル / ディレクトリ）を種別に応じた `EmittedFile[]` へ変換する。 */
export const gatherEmits = async (input: string, kind: Kind): Promise<EmittedFile[]> => {
  const abs = resolve(input);
  const info = statSync(abs);
  const yamls: string[] = [];
  const mds: string[] = [];
  if (info.isFile()) {
    if (abs.endsWith(".md")) mds.push(abs);
    else yamls.push(abs);
  } else {
    if (kind !== "party") yamls.push(...(await glob("**/*.yaml", { cwd: abs, absolute: true })));
    if (kind !== "individual") mds.push(...(await glob("**/*.md", { cwd: abs, absolute: true })));
  }

  const files: EmittedFile[] = [];
  const seen = new Set<string>();
  const add = (f: EmittedFile): void => {
    if (seen.has(f.outName)) return;
    seen.add(f.outName);
    files.push(f);
  };
  for (const y of yamls.sort()) add(emitIndividual(y, ROOT));
  for (const m of mds.sort()) for (const f of emitParty(m, ROOT)) add(f);
  return files;
};

/** `compile`: 生成 TS を BUILD_DIR へ書き出して一覧表示（常に成功・終了コード 0）。 */
export const runCompile = async (input: string, kind: Kind): Promise<number> => {
  const files = await gatherEmits(input, kind);
  writeBuild(files);
  console.log(`[compile] wrote ${files.length} file(s) to ${BUILD_DIR}`);
  for (const f of files) console.log(`  - ${f.outName}`);
  return 0;
};

/** `check:individual` / `typecheck`: compile → tsc → 診断整形。診断ありで非0終了。 */
export const runTypecheck = async (input: string, kind: Kind): Promise<number> => {
  const files = await gatherEmits(input, kind);
  writeBuild(files);
  const diagnostics = runTsc();
  if (diagnostics.length === 0) {
    console.log(`[typecheck] OK — ${files.length} file(s) verified`);
    return 0;
  }
  console.error(`[typecheck] ${diagnostics.length} problem(s):`);
  for (const d of diagnostics) console.error(`  ${formatDiagnostic(d)}`);
  return 1;
};
