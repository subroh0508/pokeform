/**
 * fetch-serebii.ts — Serebii Champions ページを取得し `data/raw/serebii/`（.gitignore）にキャッシュする
 * **取得層**。`fetch-pokeapi.ts` と同じ vendor 思想（ADR 0012）で、取得（本スクリプト）とパース / 検証
 * （`scripts/scrape-serebii.ts` + `src/codegen/serebii/*` 純関数）を分離する。
 *
 * - `species <slug>`: 種族ページ `pokedex-champions/<slug>/` を取得し `data/raw/serebii/<slug>.html` へ保存。
 * - `items`: 解禁持ち物一覧 `pokemonchampions/items.shtml` を取得し `data/raw/serebii/items.html` へ保存。
 *
 * 取得は latin-1（ISO-8859-1）バイト列のまま raw キャッシュへ保存する（Serebii は latin-1 + CRLF・
 * デコードは scrape 側の `decodeSerebiiHtml` が担う）。**既にキャッシュ済みなら再取得しない**（決定論・
 * オフライン再生・SubAgent fan-out の冪等再利用）。リクエスト間は礼儀 sleep を入れる。
 *
 * 取得層の自己検証（exit 2 = 取得失敗）: HTTP 非200 / "Page Not Found" / 本文がサイズ閾値未満なら、
 * 不正ページをキャッシュせず stderr に診断を出して exit 2 で終了する（schema / 件数検証 = exit 3/4 は scrape）。
 *
 * 実行: `pnpm fetch:serebii items` / `pnpm fetch:serebii species <slug>`（ネットワーク必須）。
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { decodeSerebiiHtml } from "../src/codegen/serebii/parse.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw", "serebii");
const SPECIES_BASE = "https://www.serebii.net/pokedex-champions";
const ITEMS_URL = "https://www.serebii.net/pokemonchampions/items.shtml";
/** 本文がこれ未満なら取得失敗とみなす閾値（実ページは 100KB 超）。 */
const MIN_BODY = 2000;

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** 取得失敗の診断を stderr に JSON 出力し exit 2 で終了する（取得層の自己検証）。 */
function failFetch(target: string, reason: string): never {
  process.stderr.write(`${JSON.stringify({ target, stage: 2, reason })}\n`);
  process.exit(2);
}

/**
 * URL を取得して raw キャッシュ（latin-1 バイト列のまま）へ保存する。既存キャッシュは skip。
 * HTTP 非200 は最大 3 回リトライ。取得後に "Page Not Found" / サイズ閾値で取得層検証する。
 */
async function fetchInto(url: string, file: string, target: string): Promise<void> {
  if (existsSync(file)) {
    console.log(`[fetch:serebii] skip (cached): ${target}`);
    return;
  }
  let buf: Uint8Array | null = null;
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url);
    if (res.ok) {
      buf = new Uint8Array(await res.arrayBuffer());
      break;
    }
    if (attempt >= 3) failFetch(target, `http ${res.status}`);
    await sleep(500 * attempt);
  }
  if (buf.byteLength < MIN_BODY) failFetch(target, `body too small (${buf.byteLength} bytes)`);
  if (decodeSerebiiHtml(buf).includes("Page Not Found")) failFetch(target, "page not found");
  mkdirSync(RAW, { recursive: true });
  writeFileSync(file, buf); // latin-1 バイト列のまま保存（scrape 側が decodeSerebiiHtml でデコード）
  await sleep(300); // Serebii への礼儀
  console.log(`[fetch:serebii] cached: ${target} (${buf.byteLength} bytes)`);
}

async function main(): Promise<void> {
  const [cmd, slug] = process.argv.slice(2);
  if (cmd === "items") {
    await fetchInto(ITEMS_URL, join(RAW, "items.html"), "items");
    return;
  }
  if (cmd === "species" && slug) {
    await fetchInto(`${SPECIES_BASE}/${slug}/`, join(RAW, `${slug}.html`), `species ${slug}`);
    return;
  }
  process.stderr.write("usage: fetch-serebii (items | species <slug>)\n");
  process.exit(1);
}

await main();
