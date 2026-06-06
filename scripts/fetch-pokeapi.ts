/**
 * fetch-pokeapi.ts — PokeAPI を取得し `data/raw/`（.gitignore）にキャッシュする。
 *
 * vendor 方式（ADR 0012）の取得段。`data/champions/roster.yaml` の列挙（pokemon / moves /
 * items）+ 全 18 タイプを取得し、リソース種別ごとに `data/raw/<category>/<name>.json` へ保存する。
 * 既にキャッシュ済みのファイルは再取得しない（決定論・オフライン再生のため）。abilities は
 * 取得した pokemon の abilities から芋づる式に集める。
 *
 * 実行: `pnpm fetch:data`（ネットワーク必須）。取得後は raw キャッシュ固定で generate.ts が
 * 決定論的に data/generated を出力する。スコープ（全種族 vs サブセット）は roster.yaml が制御する。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw");
const API = "https://pokeapi.co/api/v2";

/** PokemonType union と一致する 18 タイプ（unknown/shadow/stellar は除外）。 */
const TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

interface Roster {
  pokemon: string[];
  moves: string[];
  items: string[];
}

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
  const roster = parseYaml(
    readFileSync(join(ROOT, "data", "champions", "roster.yaml"), "utf8"),
  ) as Roster;

  // タイプ（全 18・相性表のソース）
  for (const t of TYPES) await fetchInto("type", t);

  // pokemon 本体 + 種族（ja 名・全国図鑑番号）+ フォルム（メガ/リージョンの ja 名）
  const abilityNames = new Set<string>();
  for (const slug of roster.pokemon) {
    const poke = await fetchInto("pokemon", slug);
    const species = (poke.species as { name: string }).name;
    await fetchInto("pokemon-species", species);
    if (slug !== species) await fetchInto("pokemon-form", slug);
    for (const a of poke.abilities as { ability: { name: string } }[]) {
      abilityNames.add(a.ability.name);
    }
  }

  for (const name of abilityNames) await fetchInto("ability", name);
  for (const m of roster.moves) await fetchInto("move", m);
  for (const i of roster.items) await fetchInto("item", i);

  console.log("[fetch] done");
}

await main();
