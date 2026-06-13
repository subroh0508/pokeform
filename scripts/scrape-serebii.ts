/**
 * scrape-serebii.ts — Serebii Champions 種族ページを取得 → パース → 自己検証し、中間 JSON を stdout に、
 * 診断 `{slug, stage, missingFields, rawHtmlPath}` を stderr に出し、exit code（2 / 3 / 4 / 0）で結果を表す
 * **薄い配線**。抽出・検証・正規化のロジックは `src/codegen/serebii/*.ts` の純関数（テスト100%）に委譲し、
 * 本スクリプトは fetch / fs / 配線のみ（coverage 除外・[[testing]]）。
 *
 * 使い方: `node scripts/scrape-serebii.ts species <slug>`（例 `species garchomp`）。
 *
 * exit code:
 * - 2: 取得失敗（HTTP 非200 / "Page Not Found" / 本文が小さすぎる）。
 * - 3: schema 欠落（dex / en / types / abilities / stats / moves のいずれか欠落）。
 * - 4: 件数・健全性（種族値合計不一致 / id 形不適合 / 技 type・damageClass 欠落）。
 * - 0: 健全。
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { decodeSerebiiHtml, parseSpeciesPage } from "../src/codegen/serebii/parse.ts";
import { validateSpecies } from "../src/codegen/serebii/schema.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw", "serebii");
const BASE = "https://www.serebii.net/pokedex-champions";
/** 本文がこれ未満なら取得失敗とみなす閾値（実ページは 100KB 超）。 */
const MIN_BODY = 2000;

/** 診断を stderr に JSON 出力し、指定 exit code で終了する。 */
function fail(slug: string, stage: number, missingFields: string[], rawHtmlPath: string): never {
  process.stderr.write(`${JSON.stringify({ slug, stage, missingFields, rawHtmlPath })}\n`);
  process.exit(stage);
}

async function species(slug: string): Promise<void> {
  const url = `${BASE}/${slug}/`;
  const res = await fetch(url);
  const buf = new Uint8Array(await res.arrayBuffer());
  const html = decodeSerebiiHtml(buf);
  // 取得層の自己検証（exit 2）: HTTP 非200 / Not Found / 本文過小。
  if (!res.ok || html.includes("Page Not Found") || buf.byteLength < MIN_BODY) {
    fail(slug, 2, [], "");
  }
  // 取得 HTML を raw（gitignore）へ退避し、修正 SubAgent（Phase 5）が参照できる path を契約に含める。
  const rawHtmlPath = join(RAW, `${slug}.html`);
  mkdirSync(RAW, { recursive: true });
  writeFileSync(rawHtmlPath, html);

  const parsed = parseSpeciesPage(html);
  const { stage, missingFields } = validateSpecies(parsed);
  if (stage !== 0) fail(slug, stage, missingFields, rawHtmlPath);

  process.stdout.write(`${JSON.stringify(parsed, null, 2)}\n`);
  process.stderr.write(`${JSON.stringify({ slug, stage: 0, missingFields: [], rawHtmlPath })}\n`);
}

const [cmd, slug] = process.argv.slice(2);
if (cmd !== "species" || !slug) {
  process.stderr.write("usage: scrape-serebii species <slug>\n");
  process.exit(1);
}
await species(slug);
