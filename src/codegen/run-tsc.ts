import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import type { EmittedFile } from "./emit-individual-ts.ts";

/**
 * 生成 TS（`*.generated.ts`）を `tsconfig.generated.json` で型チェックし、tsc 診断を
 * `@source` コメント経由で**元の YAML/MD 行へ逆引き**して整形する（薄い I/O 層・カバレッジ対象外）。
 * ブランドエラー型名（`MoveNotLearnedBy<...>` 等）は tsc メッセージにそのまま現れるため、行マッピングと
 * 合わせて Zod 不採用でも可読な診断を担保する（[[tsc-verification]] / [[cli-and-io]]）。
 */

/** プロジェクトルート（src/codegen から 2 階層上）。 */
export const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), "..", "..");
/** 生成 TS の出力先（gitignore・tsconfig.generated.json が拾う）。 */
export const BUILD_DIR = join(ROOT, ".pokeform-build");

/** 整形済み診断 1 件。 */
export interface Diagnostic {
  /** 元 YAML/MD の相対パス。 */
  readonly source: string;
  /** 元 YAML/MD の 1-based 行番号。 */
  readonly line: number;
  /** ブランド型名（抽出できた場合）。 */
  readonly brand: string | null;
  /** tsc の原文メッセージ。 */
  readonly message: string;
}

/** 既知のブランドエラー型名（診断の先頭表示に使う）。 */
const BRANDS = [
  "MoveNotLearnedBy",
  "AbilityNotAvailable",
  "ItemNotHoldableBy",
  "PointTotalMustBe66",
  "DuplicateSpeciesInParty",
  "NotLegalInRegulation",
  "SpeciesNotFound",
  "PartyTooLarge",
];

/** 生成 TS を BUILD_DIR へ書き出す（毎回クリーンに作り直す）。 */
export const writeBuild = (files: readonly EmittedFile[]): void => {
  rmSync(BUILD_DIR, { recursive: true, force: true });
  mkdirSync(BUILD_DIR, { recursive: true });
  for (const f of files) writeFileSync(join(BUILD_DIR, f.outName), f.code);
};

/** 生成ファイル中の `@source` コメントから (生成行 → 元ソース位置) の対応表を作る。 */
const sourceMap = (code: string): { line: number; source: string; srcLine: number }[] => {
  const out: { line: number; source: string; srcLine: number }[] = [];
  const lines = code.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i]?.match(/^\/\/ @source (.+):(\d+)$/);
    if (m?.[1] && m[2]) out.push({ line: i + 1, source: m[1], srcLine: Number(m[2]) });
  }
  return out;
};

/** 生成行 `genLine` を覆う直近の `@source`（それ以前で最大の行）を引く。 */
const lookup = (
  map: { line: number; source: string; srcLine: number }[],
  genLine: number,
): { source: string; srcLine: number } | null => {
  let found: { source: string; srcLine: number } | null = null;
  for (const e of map) {
    if (e.line <= genLine) found = { source: e.source, srcLine: e.srcLine };
    else break;
  }
  return found;
};

/** tsc の 1 行 `file(line,col): error TSxxxx: msg` から診断を 1 件 parse する。 */
const TSC_LINE = /^(.+\.generated\.ts)\((\d+),\d+\): error TS\d+: (.+)$/;

/**
 * 生成 TS を tsc で型チェックし、診断を YAML/MD 行へ逆引きして返す。診断ゼロなら緑（空配列）。
 * tsc 自体の異常終了（型エラー）は execFileSync が throw するため、stdout を捕捉して解析する。
 */
export const runTsc = (): Diagnostic[] => {
  const tscBin = join(ROOT, "node_modules", "typescript", "bin", "tsc");
  let output = "";
  try {
    execFileSync(
      "node",
      [tscBin, "-p", join(ROOT, "tsconfig.generated.json"), "--noEmit", "--pretty", "false"],
      { cwd: ROOT, encoding: "utf8" },
    );
    return [];
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string };
    output = `${err.stdout ?? ""}${err.stderr ?? ""}`;
  }

  // 生成ファイルごとの sourceMap をキャッシュ。
  const maps = new Map<string, { line: number; source: string; srcLine: number }[]>();
  const diags: Diagnostic[] = [];
  for (const raw of output.split("\n")) {
    const m = raw.match(TSC_LINE);
    if (!m?.[1] || !m[2] || !m[3]) continue;
    const [, genFile, genLineStr, message] = m;
    const abs = resolvePath(ROOT, genFile);
    if (!maps.has(abs)) {
      maps.set(abs, existsSync(abs) ? sourceMap(readFileSync(abs, "utf8")) : []);
    }
    const map = maps.get(abs) ?? [];
    const at = lookup(map, Number(genLineStr));
    const brand = BRANDS.find((b) => message.includes(b)) ?? null;
    diags.push({
      source: at?.source ?? genFile,
      line: at?.srcLine ?? Number(genLineStr),
      brand,
      message,
    });
  }
  return diags;
};

/** 診断を人間/エージェント向けの 1 行へ整形する。 */
export const formatDiagnostic = (d: Diagnostic): string => {
  const head = d.brand ? `${d.brand}: ` : "";
  return `${d.source}:${d.line}: ${head}${d.message}`;
};
