/**
 * fetch-pokeapi.ts — PokeAPI の `names`（ja-Hrkt + en）を **全件列挙**して取得し `data/raw/`（.gitignore）に
 * キャッシュする名前取得スクリプト。
 *
 * **名前専任**（plan 10）: 構造データ（種族値 / タイプ / 特性 id / 図鑑番号 / category）の取得は
 * pokemon-showdown 経路（`scripts/showdown/*`）へ移管した。本スクリプトは **名前 SoT（`data/languages/*.yaml`）** を
 * PokeAPI の `names`（ja / en）で埋めるための取得だけを担う（権威序列 = showdown(en 正) > Serebii(速報) >
 * PokeAPI(ja 正・en 補完)）。languages は reg 非依存の**全件名辞書**（未解禁名も持つ・ADR 0041）で、本取得の
 * `pokeapi-names.yml` workflow がこの全件を満たす。
 *
 * **全件列挙 + 差分**（ADR 0041）: 各 category の **list endpoint で全 id を列挙**し（種族 = `pokemon-species` /
 * 持ち物 = `item` / 技 = `move` / 特性 = `ability` / タイプ = `type`）、`languages/*.yaml` に **ja/en が揃って
 * 記録済みの id はスキップ**、未記録 / 欠落 id のみ `names` を **best-effort 取得**（404 等は skip）する（差分・
 * 冪等）。`materialize`（= `sync:ja-names`）が raw `names` から ja/en を転記する。メガ形態の ja は PokeAPI に
 * 無いため対象外（en=showdown / ja=手作業・[[data-pipeline]]）。
 *
 * 実行: `pnpm fetch:ja-names`（ネットワーク必須）。取得後は raw キャッシュ固定で `sync:ja-names` が決定論的に転記する。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { sortedUnion } from "../src/codegen/materialize.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw");
const API = "https://pokeapi.co/api/v2";

/**
 * **items だけは全件（`/item` 2176 件）でなく item-category whitelist の union に絞る**（issue #213・ADR 0041 の
 * items 例外）。languages は reg 非依存の名前辞書だが、items は「持たせて対戦効果があるか」で切る（reg では切らない）。
 * 属性（`holdable` / `holdable-active`）ベースは PokeAPI の attribute が不完全で assault-vest / booster-energy /
 * mega-stones を取りこぼすため不採用。category は全 item に必ず付与され `/item-category/{cat}` で列挙できるため堅牢。
 */
const ITEM_CATEGORIES = [
  "held-items",
  "choice",
  "bad-held-items",
  "type-enhancement",
  "species-specific",
  "plates",
  "type-protection",
  "in-a-pinch",
  "picky-healing",
  "jewels",
  "memories",
  "mega-stones",
  // `medicine` は PokeAPI 上「持ち物として持たせる回復・状態異常治しの木の実」10 件（オボンのみ=sitrus-berry /
  // ラムのみ=lum-berry / オレンのみ=oran-berry / 状態異常回復の木の実）で、ポーション類（`healing` カテゴリ）とは別。
  // issue #213 の除外リストは概念上の「medicine（薬）」を指しており PokeAPI の `medicine` カテゴリ実体と食い違う。
  // 受け入れ基準（オボンのみが残る）と既存個体（lum-berry を持つ）を満たすには本カテゴリの木の実を残す必要があるため含める。
  "medicine",
] as const;

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
 * category の list endpoint から id（`results[].name` スラグ）を全件列挙する。全件名辞書を満たすため未解禁を
 * 含む全 id を取る（`limit` を全件数より大きく取り 1 リクエストで受け切る・ADR 0041）。取得失敗は fail-fast
 * （全件列挙が欠けると差分判定が不正になるため best-effort にしない）。`count`（総数）と実受信 `results.length`
 * の不一致も fail-fast にする（`limit` cap 等で全件を受け切れていない = 差分判定が不正になる状態を検出する）。
 */
async function listAllIds(category: string): Promise<string[]> {
  const url = `${API}/${category}?limit=100000&offset=0`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`[fetch] list ${category} failed (${res.status})`);
  const json = (await res.json()) as { count: number; results: { name: string }[] };
  if (json.results.length !== json.count) {
    throw new Error(
      `[fetch] list ${category} incomplete (${json.results.length}/${json.count}; raise limit)`,
    );
  }
  return json.results.map((r) => r.name);
}

/**
 * item-category whitelist の各 `/item-category/{cat}` を fetch し `items[].name` を集めて union する
 * （重複排除 + sorted・純関数 `sortedUnion` に委譲）。category endpoint は該当 items を一括返却し、list endpoint の
 * ような `count`/`limit` ページングを持たないため件数照合はできない。代わりに **各 cat が 404 でないこと + union が
 * 空でないこと**を fail-fast にする（whitelist の typo・PokeAPI 側のカテゴリ改廃を検知）。issue #213 / [[data-pipeline]]。
 */
async function listCategoryUnion(categories: readonly string[]): Promise<string[]> {
  const lists: string[][] = [];
  for (const cat of categories) {
    const url = `${API}/item-category/${cat}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`[fetch] item-category ${cat} failed (${res.status})`);
    const json = (await res.json()) as { items: { name: string }[] };
    lists.push(json.items.map((i) => i.name));
  }
  const union = sortedUnion(lists);
  if (union.length === 0) {
    throw new Error("[fetch] item-category union is empty (whitelist typo or PokeAPI drift)");
  }
  return union;
}

/**
 * items 剪定の keep 集合（whitelist union）を raw キャッシュに残す。network を持つ本段（`fetch:ja-names`）が
 * union を決め、offline の転記段（`sync:ja-names` = `scripts/materialize.ts`）がこれを読んで items.yaml を
 * union のみへ決定論的に剪定する（issue #213）。raw は .gitignore の取得キャッシュ。
 */
const writeItemUnionManifest = (ids: string[]): void => {
  const file = join(RAW, "item-union.json");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(ids, null, 2)}\n`);
};

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

/** ja / en の少なくとも一方を欠くか（全 5 種とも languages を ja/en 完備の全件辞書にするため PokeAPI から両取り）。 */
const needsJaEn = (v: { ja?: string; en?: string }): boolean => !v.ja || !v.en;

/**
 * 名前 SoT（`languages/*.yaml`）のうち PokeAPI `names`（ja/en）から取れる 5 種と、取得元 category（詳細）+
 * list category（全件列挙）の対応。メガ名は PokeAPI のカテゴリに無いため対象外（en=showdown / ja=手作業・
 * [[data-pipeline]]）。list と category は PokeAPI では同名だが、意味（列挙 endpoint / 詳細 endpoint）を分けて明示する。
 */
const DATASETS: {
  file: string;
  mapKey: string;
  list: string;
  category: string;
  /** items だけ設定。list endpoint 全件でなく item-category whitelist の union で列挙する（issue #213）。 */
  listCategories?: readonly string[];
}[] = [
  { file: "species.yaml", mapKey: "species", list: "pokemon-species", category: "pokemon-species" },
  {
    file: "items.yaml",
    mapKey: "items",
    list: "item",
    category: "item",
    listCategories: ITEM_CATEGORIES,
  },
  { file: "moves.yaml", mapKey: "moves", list: "move", category: "move" },
  { file: "abilities.yaml", mapKey: "abilities", list: "ability", category: "ability" },
  { file: "types.yaml", mapKey: "types", list: "type", category: "type" },
];

async function main(): Promise<void> {
  for (const ds of DATASETS) {
    const map = readLangMap(ds.file, ds.mapKey);
    // items は item-category whitelist の union で列挙し union manifest を残す（sync:ja-names が剪定に使う・issue #213）。
    // 他 4 種は list endpoint で全 id を列挙する（全件辞書・count 照合の fail-fast は listAllIds 側で維持）。
    // いずれも既存 languages と差分突き合わせ（ja/en 完備の id はスキップ・未記録 / 欠落 id のみ best-effort 取得・ADR 0041）。
    const ids = ds.listCategories
      ? await listCategoryUnion(ds.listCategories)
      : await listAllIds(ds.list);
    if (ds.listCategories) writeItemUnionManifest(ids);
    for (const id of ids) {
      if (needsJaEn(map[id] ?? {})) await fetchNamesInto(ds.category, id);
    }
  }
  console.log("[fetch] done (names)");
}

await main();
