/**
 * fetch-pokeapi.ts — PokeAPI の `names`(ja-Hrkt) を取得し `data/raw/`（.gitignore）にキャッシュする ja 専任スクリプト。
 *
 * **ja 専任**（plan 10）: 構造データ（種族値 / タイプ / 特性 id / 図鑑番号 / category）の取得は
 * pokemon-showdown 経路（`scripts/showdown/*`）へ移管した。本スクリプトは **名前 SoT（`data/languages/*.yaml`）** の
 * 日本語名 ja を埋めるための `names` 取得だけを担う（権威序列 = showdown(正) > Serebii(速報) > PokeAPI(ja 補完)）。
 *
 * 取得対象は `data/languages/{species,items,moves,abilities}.yaml` の **ja（技 / 特性は ja/en）が欠けるエントリのみ**
 * （最小取得・決定論）。種族 = `pokemon-species` / 持ち物 = `item` / 技 = `move` / 特性 = `ability` の `names` を
 * **best-effort 取得**（404 等は skip）し、`materialize`（= `sync:ja-names`）が raw `names` から ja を転記する。
 * メガ形態の ja は PokeAPI に無いため対象外（skill 著述 / Serebii 速報・[[data-pipeline]]）。
 *
 * 実行: `pnpm fetch:ja-names`（ネットワーク必須）。取得後は raw キャッシュ固定で `sync:ja-names` が決定論的に転記する。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw");
const API = "https://pokeapi.co/api/v2";

/** data/languages/<file> の名前マップ（`{ <mapKey>: { id → { ja?, en? } } }`）を読む。 */
const readLangMap = (
  file: string,
  mapKey: string,
): Record<string, { ja?: string; en?: string }> => {
  const doc = parseYaml(readFileSync(join(ROOT, "data", "languages", file), "utf8")) as Record<
    string,
    Record<string, { ja?: string; en?: string }>
  >;
  return doc[mapKey] ?? {};
};

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * `names` 補完のための best-effort 取得（404 / 取得失敗は警告して skip・補完しないだけで失敗させない）。
 * Champions 固有メガストーン等は PokeAPI 非存在（404）になるが、これは正常（ja は Serebii 速報 / 手入力で補う）。
 */
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

/** ja を欠くか（種族 / 持ち物は ja のみ PokeAPI 由来・en は skill 著述）。 */
const needsJa = (v: { ja?: string; en?: string }): boolean => !v.ja;
/** ja / en の少なくとも一方を欠くか（技 / 特性は ja/en とも PokeAPI 由来）。 */
const needsJaEn = (v: { ja?: string; en?: string }): boolean => !v.ja || !v.en;

/** 名前 SoT のデータセットと PokeAPI 取得元の対応（5 軸のうち ja を持つ 4 種・メガは PokeAPI 非対応で除外）。 */
const DATASETS: {
  file: string;
  mapKey: string;
  category: string;
  needs: (v: { ja?: string; en?: string }) => boolean;
}[] = [
  { file: "species.yaml", mapKey: "species", category: "pokemon-species", needs: needsJa },
  { file: "items.yaml", mapKey: "items", category: "item", needs: needsJa },
  { file: "moves.yaml", mapKey: "moves", category: "move", needs: needsJaEn },
  { file: "abilities.yaml", mapKey: "abilities", category: "ability", needs: needsJaEn },
];

async function main(): Promise<void> {
  for (const ds of DATASETS) {
    const map = readLangMap(ds.file, ds.mapKey);
    for (const [id, v] of Object.entries(map)) {
      if (ds.needs(v)) await fetchNamesInto(ds.category, id);
    }
  }
  console.log("[fetch] done (ja-names)");
}

await main();
