/**
 * fetch-pokeapi.ts — PokeAPI を取得し `data/raw/`（.gitignore）にキャッシュする。
 *
 * vendor 方式（ADR 0012）の取得段。`data/champions/catalog/*.yaml` の列挙（species / moves / items）を
 * 取得し、リソース種別ごとに `data/raw/<category>/<name>.json` へ保存する。既にキャッシュ済みの
 * ファイルは再取得しない（決定論・オフライン再生のため）。
 *
 * Phase 10 以降、**名前 / タイプ相性は catalog YAML が SoT**（generate は名前 / types について raw を
 * 読まない）。よって `type` / `ability` / `pokemon-form` は取得しない（generate が消費しないため）。
 * 取得するのは pokemon（種族値 / タイプ / 特性 id）/ pokemon-species（図鑑番号）/ move（type /
 * damageClass / power 等）/ item（category）のみ。
 *
 * 実行: `pnpm fetch:data`（ネットワーク必須）。取得後は raw キャッシュ固定で generate.ts が
 * 決定論的に data/generated を出力する。スコープ（全種族 vs サブセット）は catalog/*.yaml が制御する。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw");
const API = "https://pokeapi.co/api/v2";

/** catalog/*.yaml をまとめて読むための最小形（fetch は列挙だけ要る）。 */
const readCatalog = <T>(root: string, file: string): T =>
  parseYaml(readFileSync(join(root, "data", "champions", "catalog", file), "utf8")) as T;

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** PokeAPI から 1 リソースを取得し data/raw/<category>/<name>.json へキャッシュする。 */
async function fetchInto(category: string, name: string): Promise<Record<string, unknown>> {
  const file = join(RAW, category, `${name}.json`);
  if (existsSync(file)) {
    return JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
  }
  const url = `${API}/${category}/${name}`;
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url);
    if (res.ok) {
      const json = (await res.json()) as Record<string, unknown>;
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
      await sleep(50); // PokeAPI への礼儀
      console.log(`[fetch] ${category}/${name}`);
      return json;
    }
    if (attempt >= 3) {
      throw new Error(`fetch failed (${res.status}): ${url}`);
    }
    await sleep(500 * attempt);
  }
}

async function main(): Promise<void> {
  // catalog は id → { ja, en } マップ（Phase 10）。fetch は id（キー）の列挙だけ要る。
  const { pokemon } = readCatalog<{ pokemon: Record<string, unknown> }>(ROOT, "species.yaml");
  const { moves } = readCatalog<{ moves: Record<string, unknown> }>(ROOT, "moves.yaml");
  const { items } = readCatalog<{ items: Record<string, unknown> }>(ROOT, "items.yaml");

  // pokemon 本体（種族値 / タイプ / 特性 id）+ 種族（全国図鑑番号）。
  for (const slug of Object.keys(pokemon)) {
    const poke = await fetchInto("pokemon", slug);
    const species = (poke.species as { name: string }).name;
    await fetchInto("pokemon-species", species);
  }

  // move は type / damageClass / power 等、item は category のソース（名前は catalog YAML 由来）。
  for (const m of Object.keys(moves)) await fetchInto("move", m);
  for (const i of Object.keys(items)) await fetchInto("item", i);

  console.log("[fetch] done");
}

await main();
