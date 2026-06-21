/**
 * fetch-serebii.ts — Serebii Champions ページを取得し `data/raw/serebii/`（.gitignore）にキャッシュする
 * **取得層**。`fetch-pokeapi.ts` と同じ vendor 思想（ADR 0012）で、取得（本スクリプト）とパース / 検証
 * （`scripts/scrape-serebii.ts` + `src/codegen/serebii/*` 純関数）を分離する。
 *
 * - `species <slug>`: 種族ページ `pokedex-champions/<slug>/` を取得し `data/raw/serebii/<slug>.html` へ保存。
 * - `items`: 解禁持ち物一覧 `pokemonchampions/items.shtml` を取得し `data/raw/serebii/items.html` へ保存。
 * - `move <id>`: 技専用ページ `attackdex-champions/<serebiiSlug>.shtml` を取得し
 *   `data/raw/serebii/attackdex/<id>.html` へ保存（id = catalog kebab id）。Serebii の技 slug は
 *   **スペースは圧縮・実ハイフンは保持**（`Aerial Ace`→`aerialace` / `Self-Destruct`→`self-destruct`）で、
 *   catalog id からどちらか確定できないため**圧縮形 → ハイフン形の順で候補取得**してフォールバックする。
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
const MOVE_BASE = "https://www.serebii.net/attackdex-champions";
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

/**
 * 1 URL を取得し、健全なら latin-1 バイト列を返す。404（確定的に存在しない）は即 null（候補フォールバック用）、
 * その他の非200 / ネットワーク例外は最大 3 回リトライ。`Page Not Found` / サイズ閾値未満も null。
 */
async function tryGet(url: string): Promise<Uint8Array | null> {
  for (let attempt = 1; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(url);
    } catch {
      if (attempt >= 3) return null;
      await sleep(500 * attempt);
      continue;
    }
    if (res.status === 404) return null; // 存在しない slug → 次候補へ
    if (!res.ok) {
      if (attempt >= 3) return null;
      await sleep(500 * attempt);
      continue;
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength < MIN_BODY) return null;
    if (decodeSerebiiHtml(buf).includes("Page Not Found")) return null;
    return buf;
  }
}

/**
 * 技専用ページを取得して `data/raw/serebii/attackdex/<id>.html` へキャッシュする。Serebii 技 slug は
 * 圧縮形（スペース除去）と実ハイフン保持形が混在するため、`<id 圧縮>` → `<id>` の順で候補取得し、最初に
 * 健全に取れた候補を採用する。全候補で取れなければ exit 2。
 */
async function fetchMove(id: string): Promise<void> {
  const file = join(RAW, "attackdex", `${id}.html`);
  if (existsSync(file)) {
    console.log(`[fetch:serebii] skip (cached): move ${id}`);
    return;
  }
  const candidates = [...new Set([id.replace(/-/g, ""), id])]; // 圧縮 → ハイフン形（同一なら 1 候補）
  for (const slug of candidates) {
    const buf = await tryGet(`${MOVE_BASE}/${slug}.shtml`);
    await sleep(300); // Serebii への礼儀（候補間も含む）
    if (buf === null) continue;
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, buf); // latin-1 バイト列のまま保存
    console.log(`[fetch:serebii] cached: move ${id} via ${slug} (${buf.byteLength} bytes)`);
    return;
  }
  failFetch(`move ${id}`, `not found via ${candidates.join(" / ")}`);
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
  if (cmd === "move" && slug) {
    await fetchMove(slug);
    return;
  }
  process.stderr.write("usage: fetch-serebii (items | species <slug> | move <id>)\n");
  process.exit(1);
}

await main();
