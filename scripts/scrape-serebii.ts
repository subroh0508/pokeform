/**
 * scrape-serebii.ts（速報スクレイパーの取得+配線層・新規）— 指定 Serebii Champions ページ群を取得し、
 * `src/codegen/serebii/parse-*` 純関数でパース → schema 自己検証して、データセット別の中間 JSON を stdout に、
 * 診断を stderr に出す。showdown 側 `scripts/showdown/cli.ts`（抽出 CLI）に対応する「速報の抽出層」。
 *
 * 抽出・検証・正規化のロジックは `src/codegen/serebii/*`（カバレッジ 100%）に委譲し、本スクリプトは
 * fetch / fs / 配線のみ（coverage 除外・[[testing]]）。取得は latin-1 バイト列で `data/raw/serebii/` に
 * キャッシュし（.gitignore・冪等再利用）、リクエスト間に礼儀 sleep を入れる。
 *
 * 使い方: `node scripts/scrape-serebii.ts <dataset> <regId>`（dataset=species|moves|items|abilities|mega）。
 * moves / abilities は species ステップが書いた per-reg / specs YAML から対象 id を読む（species を先に回す）。
 *
 * exit code（データセット内の最悪 stage）:
 * - 2: 取得失敗（HTTP 非200 / Page Not Found / サイズ閾値未満）。
 * - 3: schema 欠落 / 4: 件数・健全性 / 0: 健全（src/codegen/serebii/schema.ts の stage を写す）。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument, type YAMLMap, type YAMLSeq } from "yaml";
import { decodeSerebiiHtml } from "../src/codegen/serebii/decode.ts";
import { parseAbility } from "../src/codegen/serebii/parse-abilities.ts";
import { parseItem, parseItemsRoster } from "../src/codegen/serebii/parse-items.ts";
import { parseMega } from "../src/codegen/serebii/parse-mega.ts";
import { parseMove } from "../src/codegen/serebii/parse-moves.ts";
import { parseRoster, parseSpecies } from "../src/codegen/serebii/parse-species.ts";
import {
  type ValidationResult,
  validateAbility,
  validateItem,
  validateItemsRoster,
  validateMega,
  validateMove,
  validateSpecies,
} from "../src/codegen/serebii/schema.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw", "serebii");
const CH = join(ROOT, "data", "champions");
const BASE = "https://www.serebii.net";
const MIN_BODY = 2000;

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** 取得失敗の診断を stderr に出し exit 2。 */
function failFetch(target: string, reason: string): never {
  process.stderr.write(`${JSON.stringify({ target, stage: 2, reason })}\n`);
  process.exit(2);
}

/**
 * URL を取得して latin-1 デコード済み HTML を返す。`data/raw/serebii/<cacheKey>.html` にキャッシュし、
 * 既存なら再取得しない。404 / Page Not Found は null（候補フォールバック用）、その他非200 は最大 3 回リトライ。
 */
async function fetchHtml(url: string, cacheKey: string): Promise<string | null> {
  const file = join(RAW, `${cacheKey}.html`);
  if (existsSync(file)) return decodeSerebiiHtml(new Uint8Array(readFileSync(file)));
  for (let attempt = 1; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(url);
    } catch {
      if (attempt >= 3) return null;
      await sleep(500 * attempt);
      continue;
    }
    if (res.status === 404) return null;
    if (!res.ok) {
      if (attempt >= 3) return null;
      await sleep(500 * attempt);
      continue;
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    const html = decodeSerebiiHtml(buf);
    if (buf.byteLength < MIN_BODY || html.includes("Page Not Found")) return null;
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, buf);
    await sleep(300); // Serebii への礼儀
    return html;
  }
}

/** per-reg species-moves.yaml から全種族の習得技 id を union で集める。 */
function regMoveIds(regId: string): string[] {
  const path = join(CH, regId, "species-moves.yaml");
  if (!existsSync(path)) return [];
  const doc = parseDocument(readFileSync(path, "utf8"));
  const moves = (doc.contents as YAMLMap)?.get("moves", true) as YAMLMap | undefined;
  const ids = new Set<string>();
  for (const item of moves?.items ?? []) {
    for (const id of ((item.value as YAMLSeq)?.toJS(doc) as string[] | undefined) ?? [])
      ids.add(id);
  }
  return [...ids].sort((a, b) => a.localeCompare(b));
}

/** species-specs.yaml に登録済みの全特性 id を集める。 */
function specAbilityIds(): string[] {
  const path = join(CH, "species-specs.yaml");
  if (!existsSync(path)) return [];
  const doc = parseDocument(readFileSync(path, "utf8"));
  const species = (doc.contents as YAMLMap)?.get("species", true) as YAMLMap | undefined;
  const ids = new Set<string>();
  for (const item of species?.items ?? []) {
    const abil = (item.value as YAMLMap)?.get("abilities", true) as YAMLSeq | undefined;
    for (const id of (abil?.toJS(doc) as string[] | undefined) ?? []) ids.add(id);
  }
  return [...ids].sort((a, b) => a.localeCompare(b));
}

/** 中間 JSON を stdout に、最悪 stage を診断に出して exit する（stage!==0 は非0終了）。 */
function emit(payload: unknown, worst: number, counts: Record<string, number>): never {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  process.stderr.write(`${JSON.stringify({ stage: worst, counts })}\n`);
  process.exit(worst);
}

/** 検証結果群の最悪 stage（3 > 4 > 0 の優先で 3 を最優先）。 */
function worstStage(results: ValidationResult[]): number {
  if (results.some((r) => r.stage === 3)) return 3;
  if (results.some((r) => r.stage === 4)) return 4;
  return 0;
}

/** roster（pokemon.shtml）を取得して解禁種族 slug を返す。 */
async function fetchRoster(): Promise<string[]> {
  const html = await fetchHtml(`${BASE}/pokemonchampions/pokemon.shtml`, "roster");
  if (html === null) failFetch("roster", "fetch failed");
  return parseRoster(html);
}

async function species(_regId: string): Promise<never> {
  const roster = await fetchRoster();
  const records = [];
  const results: ValidationResult[] = [];
  for (const slug of roster) {
    const html = await fetchHtml(`${BASE}/pokedex-champions/${slug}/`, `species/${slug}`);
    if (html === null) failFetch(`species ${slug}`, "fetch failed");
    const rec = parseSpecies(html);
    records.push(rec);
    results.push(validateSpecies(rec));
  }
  emit({ roster, species: records }, worstStage(results), { species: records.length });
}

async function mega(_regId: string): Promise<never> {
  const roster = await fetchRoster();
  const records = [];
  for (const slug of roster) {
    const html = await fetchHtml(`${BASE}/pokedex-champions/${slug}/`, `species/${slug}`);
    if (html === null) failFetch(`species ${slug}`, "fetch failed");
    records.push(...parseMega(html));
  }
  emit({ mega: records }, validateMega(records).stage, { mega: records.length });
}

async function moves(regId: string): Promise<never> {
  const ids = regMoveIds(regId);
  const records = [];
  const results: ValidationResult[] = [];
  for (const id of ids) {
    const slug = id.replace(/-/g, ""); // Serebii 技 slug は圧縮形優先（ハイフン形は fallback）
    const html =
      (await fetchHtml(`${BASE}/attackdex-champions/${slug}.shtml`, `attackdex/${id}`)) ??
      (await fetchHtml(`${BASE}/attackdex-champions/${id}.shtml`, `attackdex/${id}`));
    if (html === null) failFetch(`move ${id}`, "fetch failed");
    const rec = parseMove(html);
    records.push(rec);
    results.push(validateMove(rec));
  }
  emit({ moves: records }, worstStage(results), { moves: records.length });
}

async function abilities(_regId: string): Promise<never> {
  const ids = specAbilityIds();
  const records = [];
  const results: ValidationResult[] = [];
  for (const id of ids) {
    const html = await fetchHtml(
      `${BASE}/abilitydex/${id.replace(/-/g, "")}.shtml`,
      `abilitydex/${id}`,
    );
    if (html === null) failFetch(`ability ${id}`, "fetch failed");
    const rec = parseAbility(html);
    records.push(rec);
    results.push(validateAbility(rec));
  }
  emit({ abilities: records }, worstStage(results), { abilities: records.length });
}

async function items(_regId: string): Promise<never> {
  const rosterHtml = await fetchHtml(`${BASE}/pokemonchampions/items.shtml`, "items");
  if (rosterHtml === null) failFetch("items", "fetch failed");
  const roster = parseItemsRoster(rosterHtml);
  const names = [];
  const results: ValidationResult[] = [validateItemsRoster(roster)];
  for (const it of roster) {
    const html = await fetchHtml(`${BASE}/itemdex/${it.slug}.shtml`, `itemdex/${it.slug}`);
    if (html === null) failFetch(`item ${it.slug}`, "fetch failed");
    const name = parseItem(html);
    names.push(name);
    results.push(validateItem(name));
  }
  emit({ items: roster, names }, worstStage(results), { items: roster.length });
}

const DATASETS: Record<string, (regId: string) => Promise<never>> = {
  species,
  moves,
  items,
  abilities,
  mega,
};

const [dataset, regId] = process.argv.slice(2);
if (!dataset || !regId || !DATASETS[dataset]) {
  process.stderr.write(
    `usage: scrape-serebii <dataset> <regId>\n  dataset=${Object.keys(DATASETS).join("|")} regId=m-a|m-b\n`,
  );
  process.exit(1);
}
await DATASETS[dataset](regId);
