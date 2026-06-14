/**
 * fetch-pokeapi.ts — PokeAPI を取得し `data/raw/`（.gitignore）にキャッシュする。
 *
 * vendor 方式（ADR 0012）の取得段。`data/champions/catalog/*.yaml` の列挙（species / moves / items）を
 * 取得し、リソース種別ごとに `data/raw/<category>/<name>.json` へ保存する。既にキャッシュ済みの
 * ファイルは再取得しない（決定論・オフライン再生のため）。
 *
 * Phase 10 以降、**タイプ相性は catalog YAML が SoT**（generate は types について raw を読まない）。
 * ADR 0026 以降、**技メタ（type / damageClass / power 等）も catalog/moves.yaml が SoT**（PokeAPI は
 * Champions 非対応で技威力等の信頼源にしない・`move` の**メタは取得しても消費しない**）。
 * 構造データ（種族値 / タイプ / 特性 id / 図鑑番号 / category）は pokemon / pokemon-species / item から取得する。
 *
 * **日本語名は PokeAPI の `names`（ja-Hrkt）を取得元にする**（本 phase の ja 取得元 ADR）。種族 / 持ち物の
 * `names` は上記取得 raw に含まれる。技 / 特性は **ja/en が欠落するエントリのみ** `move` / `ability` を
 * best-effort 取得し（404 等は skip）、`materialize` が `names` から ja/en を catalog へ転記する。技メタには
 * 使わない（ADR 0026 不変）。既に日英名が揃うエントリは取得しない（決定論・最小取得）。
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

/** ja/en の少なくとも一方を欠くエントリだけを名前補完取得の対象にする（最小取得・決定論）。 */
const needsNameFetch = (v: { ja?: string; en?: string }): boolean => !v?.ja || !v?.en;

/** `names` 補完のための best-effort 取得（404 / 取得失敗は警告して skip・補完しないだけで失敗させない）。 */
async function fetchNamesInto(category: string, name: string): Promise<void> {
  const file = join(RAW, category, `${name}.json`);
  if (existsSync(file)) return;
  const url = `${API}/${category}/${name}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`[fetch] skip ${category}/${name} (names supplement, ${res.status})`);
    return;
  }
  const json = (await res.json()) as Record<string, unknown>;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
  await sleep(50); // PokeAPI への礼儀
  console.log(`[fetch] ${category}/${name} (names)`);
}

async function main(): Promise<void> {
  // catalog は id → { ja, en } マップ（Phase 10）。構造データ取得は id（キー）の列挙が要る。
  const { pokemon } = readCatalog<{ pokemon: Record<string, unknown> }>(ROOT, "species.yaml");
  const { items } = readCatalog<{ items: Record<string, { ja?: string; en?: string }> }>(
    ROOT,
    "items.yaml",
  );
  const { moves } = readCatalog<{ moves: Record<string, { ja?: string; en?: string }> }>(
    ROOT,
    "moves.yaml",
  );
  const { abilities } = readCatalog<{ abilities: Record<string, { ja?: string; en?: string }> }>(
    ROOT,
    "abilities.yaml",
  );

  // pokemon 本体（種族値 / タイプ / 特性 id / names）+ 種族（全国図鑑番号 / names）。
  for (const slug of Object.keys(pokemon)) {
    const poke = await fetchInto("pokemon", slug);
    const species = (poke.species as { name: string }).name;
    await fetchInto("pokemon-species", species);
  }

  // item は category + names のソース。
  for (const i of Object.keys(items)) await fetchInto("item", i);

  // 技 / 特性は **日英名が欠けるエントリのみ** names 補完取得（技メタには使わない・ADR 0026 不変）。
  for (const [id, v] of Object.entries(moves)) {
    if (needsNameFetch(v)) await fetchNamesInto("move", id);
  }
  for (const [id, v] of Object.entries(abilities)) {
    if (needsNameFetch(v)) await fetchNamesInto("ability", id);
  }

  console.log("[fetch] done");
}

await main();
