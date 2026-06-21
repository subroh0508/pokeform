/**
 * scrape-serebii.ts — `data/raw/serebii/` のキャッシュ（`fetch-serebii.ts` が取得）を読み、パース → 自己検証し、
 * 中間 JSON を stdout に、診断 `{slug, stage, missingFields, rawHtmlPath}` を stderr に出し、exit code
 * （2 / 3 / 4 / 0）で結果を表す**薄い配線**。抽出・検証・正規化のロジックは `src/codegen/serebii/*.ts` の純関数
 * （テスト100%）に委譲し、本スクリプトは fs / 配線のみ（coverage 除外・[[testing]]）。取得（fetch）は
 * `fetch-serebii.ts` に分離した（取得とパースの分離）。
 *
 * 使い方:
 * - `node scripts/scrape-serebii.ts species <slug>`（例 `species garchomp`）。
 * - `node scripts/scrape-serebii.ts items`（解禁持ち物一覧）。
 * - `node scripts/scrape-serebii.ts move-master <id>`（技専用ページ・例 `move-master earthquake`）。
 *
 * exit code:
 * - 2: 取得未了（`data/raw/serebii/<...>.html` が無い → 先に `fetch-serebii` を実行する）。
 * - 3: schema 欠落（種族 = dex/en/types/abilities/stats/moves 欠落 / items = 1 件も取れない /
 *   技マスター = type/damageClass/pp/priority 欠落）。
 * - 4: 件数・健全性（種族値合計不一致 / id 形不適合 / 技 type・damageClass 欠落 / メガ先欠落 /
 *   技マスター = pp が {8,12,16,20} 外・priority レンジ外 等）。
 * - 0: 健全。
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  decodeSerebiiHtml,
  parseItemsPage,
  parseMoveMaster,
  parseSpeciesPage,
} from "../src/codegen/serebii/parse.ts";
import {
  type ValidationResult,
  validateItems,
  validateMoveMaster,
  validateSpecies,
} from "../src/codegen/serebii/schema.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw", "serebii");

/** 診断を stderr に JSON 出力し、指定 exit code で終了する。 */
function fail(slug: string, stage: number, missingFields: string[], rawHtmlPath: string): never {
  process.stderr.write(`${JSON.stringify({ slug, stage, missingFields, rawHtmlPath })}\n`);
  process.exit(stage);
}

/** raw キャッシュ（latin-1 バイト列）を読み、デコード済み HTML 文字列を返す。無ければ exit 2。 */
function readCache(slug: string, file: string): string {
  try {
    return decodeSerebiiHtml(new Uint8Array(readFileSync(file)));
  } catch {
    fail(slug, 2, [], file); // キャッシュ未了 = 取得失敗扱い。先に fetch-serebii を実行する。
  }
}

/** パース結果の中間 JSON を stdout に、健全 / 不健全の診断を stderr に出して exit する。 */
function emit(slug: string, parsed: unknown, result: ValidationResult, rawHtmlPath: string): never {
  if (result.stage !== 0) fail(slug, result.stage, result.missingFields, rawHtmlPath);
  process.stdout.write(`${JSON.stringify(parsed, null, 2)}\n`);
  process.stderr.write(`${JSON.stringify({ slug, stage: 0, missingFields: [], rawHtmlPath })}\n`);
  process.exit(0);
}

function species(slug: string): never {
  const rawHtmlPath = join(RAW, `${slug}.html`);
  const parsed = parseSpeciesPage(readCache(slug, rawHtmlPath));
  emit(slug, parsed, validateSpecies(parsed), rawHtmlPath);
}

function items(): never {
  const rawHtmlPath = join(RAW, "items.html");
  const parsed = parseItemsPage(readCache("items", rawHtmlPath));
  emit(
    "items",
    { ...parsed, counts: countByCategory(parsed.items) },
    validateItems(parsed),
    rawHtmlPath,
  );
}

function moveMaster(id: string): never {
  const rawHtmlPath = join(RAW, "attackdex", `${id}.html`);
  const parsed = parseMoveMaster(readCache(id, rawHtmlPath));
  emit(id, parsed, validateMoveMaster(parsed), rawHtmlPath);
}

/** category ごとの件数 + 合計（中間 JSON に添える件数サマリ）。 */
function countByCategory(list: { category: string }[]): Record<string, number> {
  const counts: Record<string, number> = { total: list.length };
  for (const { category } of list) counts[category] = (counts[category] ?? 0) + 1;
  return counts;
}

const [cmd, slug] = process.argv.slice(2);
if (cmd === "items") {
  items();
} else if (cmd === "species" && slug) {
  species(slug);
} else if (cmd === "move-master" && slug) {
  moveMaster(slug);
} else {
  process.stderr.write("usage: scrape-serebii (species <slug> | items | move-master <id>)\n");
  process.exit(1);
}
