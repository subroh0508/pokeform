/**
 * materialize.ts — `data/raw/`（PokeAPI キャッシュ）から構造データ（図鑑番号 / タイプ / 種族値 /
 * 特性 id / 持ち物 category）と日本語名 ja を読み、新ツリーの該当フィールドへ**転記**する専任スクリプト。
 *
 * 転記先（ADR 0035/0036・3 軸直交）:
 *   構造 → `data/champions/species-specs.yaml`（base・dex/types/stats/abilities）/ `mega-specs.yaml`
 *          （メガ・dex/types/stats）/ `item-specs.yaml`（category）。
 *   名前 ja → `data/languages/{species,items,moves,abilities}.yaml`（ゲーム非依存・名前 SoT）。
 *   メガ名 ja / タイプ名は PokeAPI に無いため skill 著述（materialize は触れない）。
 *
 * vendor 方式（ADR 0012 / 0027）の転記段: raw=取得キャッシュ（materialize 元）/ specs・languages=SoT。
 * `generate.ts` は YAML のみを変換し raw を読まない（ADR 0027）。本スクリプトだけが raw を必要とする。
 *
 * **raw 必須・fail-fast**: raw が無ければ `readFileSync` が ENOENT で即エラー終了する（raw 存在の担保は
 * 呼び出し側 `update-catalog` skill の責務・ADR 0027 / [[data-pipeline]]）。
 *
 * **append/既存尊重**: 未設定フィールドだけを raw 由来値で埋め、既に値があるフィールドは raw と異なっても
 * 上書きしない（Champions 実態に合わせた skill 著述値を保護）。差分は conflict として標準出力に提示する。
 *
 * 実行: `pnpm materialize`（fetch:data 後・ネットワーク不要）。
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type Document, parseDocument, type YAMLMap } from "yaml";
import {
  extractItemCategory,
  extractJaName,
  extractNames,
  extractSpeciesStructural,
  type FieldPlan,
  planFields,
} from "../src/codegen/materialize.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw");
const CH = join(ROOT, "data", "champions");
const LANG = join(ROOT, "data", "languages");

/** raw JSON を 1 件読む（不在なら ENOENT で fail-fast）。 */
const raw = <T>(category: string, name: string): T =>
  JSON.parse(readFileSync(join(RAW, category, `${name}.json`), "utf8")) as T;

/** raw JSON を best-effort で読む（不在なら null）。move / ability の ja/en 補完は取得が無くても続行する。 */
const rawOpt = <T>(category: string, name: string): T | null => {
  const file = join(RAW, category, `${name}.json`);
  return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as T) : null;
};

/** raw names から ja のみの転記欄を組む（取得できなければ空）。en は Serebii 著述に委ねる。 */
const jaOnly = (
  r: { names?: { name: string; language: { name: string } }[] } | null,
): { ja?: string } => {
  const ja = r ? extractJaName(r) : undefined;
  return ja !== undefined ? { ja } : {};
};

/** エントリが ja/en の少なくとも一方を欠くか（PokeAPI names 補完の対象判定）。 */
const needsName = (entry: { ja?: string; en?: string }): boolean => !entry.ja || !entry.en;

let conflictCount = 0;
/** plan の fill をノードへ適用し、conflict を提示する。 */
const apply = <T extends object>(
  doc: Document,
  node: YAMLMap,
  id: string,
  plan: FieldPlan<T>,
): number => {
  for (const [key, value] of Object.entries(plan.fill)) {
    node.set(key, doc.createNode(value));
  }
  for (const c of plan.conflicts) {
    conflictCount++;
    console.warn(
      `[materialize] conflict ${id}.${String(c.key)}: keep skill-authored ${JSON.stringify(
        c.existing,
      )} (raw=${JSON.stringify(c.fresh)})`,
    );
  }
  return Object.keys(plan.fill).length;
};

type RawPoke = {
  stats: { base_stat: number; stat: { name: string } }[];
  types: { type: { name: string } }[];
  abilities: { ability: { name: string } }[];
  species: { name: string };
};
type RawSpecies = { id: number; names?: { name: string; language: { name: string } }[] };

// --- species-specs（base・dex/types/stats/abilities）+ languages/species（ja） ----------
const speciesDoc = parseDocument(readFileSync(join(CH, "species-specs.yaml"), "utf8"));
const speciesMap = speciesDoc.get("species") as YAMLMap;
const langSpeciesDoc = parseDocument(readFileSync(join(LANG, "species.yaml"), "utf8"));
const langSpeciesMap = langSpeciesDoc.get("species") as YAMLMap;
let speciesFilled = 0;
let langSpeciesFilled = 0;
for (const item of speciesMap.items) {
  const slug = String((item.key as { value: string }).value);
  const node = item.value as YAMLMap;
  const poke = raw<RawPoke>("pokemon", slug);
  const speciesJson = raw<RawSpecies>("pokemon-species", poke.species.name);
  const fresh = extractSpeciesStructural(poke, speciesJson);
  speciesFilled += apply(
    speciesDoc,
    node,
    slug,
    planFields(node.toJS(speciesDoc) as Partial<typeof fresh>, fresh),
  );
  // 日本語名 ja は languages/species.yaml（名前 SoT・ADR 0035）。
  const nameNode = langSpeciesMap.get(slug, true) as YAMLMap | undefined;
  if (nameNode) {
    const ja = jaOnly(speciesJson);
    langSpeciesFilled += apply(
      langSpeciesDoc,
      nameNode,
      slug,
      planFields(nameNode.toJS(langSpeciesDoc) as { ja?: string }, ja),
    );
  }
}
writeFileSync(join(CH, "species-specs.yaml"), speciesDoc.toString());
if (langSpeciesFilled > 0) writeFileSync(join(LANG, "species.yaml"), langSpeciesDoc.toString());

// --- mega-specs（dex/types/stats のみ・ability/baseSpecies は skill 著述で触れない） ----------
const megaDoc = parseDocument(readFileSync(join(CH, "mega-specs.yaml"), "utf8"));
const megaMap = megaDoc.get("mega") as YAMLMap;
let megaFilled = 0;
for (const item of megaMap.items) {
  const id = String((item.key as { value: string }).value);
  const node = item.value as YAMLMap;
  const poke = raw<RawPoke>("pokemon", id);
  const speciesJson = raw<RawSpecies>("pokemon-species", poke.species.name);
  const { dex, types, stats } = extractSpeciesStructural(poke, speciesJson);
  const fresh = { dex, types, stats };
  megaFilled += apply(
    megaDoc,
    node,
    id,
    planFields(node.toJS(megaDoc) as Partial<typeof fresh>, fresh),
  );
}
if (megaFilled > 0) writeFileSync(join(CH, "mega-specs.yaml"), megaDoc.toString());

// --- item-specs（category）+ languages/items（ja） --------------------------------------------
const itemsDoc = parseDocument(readFileSync(join(CH, "item-specs.yaml"), "utf8"));
const itemsMap = itemsDoc.get("items") as YAMLMap;
const langItemsDoc = parseDocument(readFileSync(join(LANG, "items.yaml"), "utf8"));
const langItemsMap = langItemsDoc.get("items") as YAMLMap;
let itemsFilled = 0;
let langItemsFilled = 0;
for (const entry of itemsMap.items) {
  const id = String((entry.key as { value: string }).value);
  const node = entry.value as YAMLMap;
  // Champions 固有メガストーン（starminite 等）は PokeAPI に存在せず raw が無い（fetch:data が 404 で skip）。
  // その場合は materialize の充填をスキップする（category は Serebii 由来で specs に既に入っており、ja は人間が
  // 手入力で補完する）。mainline 持ち物は raw があり従来通り category / ja を埋める。
  const itemJson = rawOpt<{
    category: { name: string };
    names?: { name: string; language: { name: string } }[];
  }>("item", id);
  if (itemJson === null) continue;
  const fresh = { category: extractItemCategory(itemJson) };
  itemsFilled += apply(
    itemsDoc,
    node,
    id,
    planFields(node.toJS(itemsDoc) as Partial<typeof fresh>, fresh),
  );
  const nameNode = langItemsMap.get(id, true) as YAMLMap | undefined;
  if (nameNode) {
    const ja = jaOnly(itemJson);
    langItemsFilled += apply(
      langItemsDoc,
      nameNode,
      id,
      planFields(nameNode.toJS(langItemsDoc) as { ja?: string }, ja),
    );
  }
}
if (itemsFilled > 0) writeFileSync(join(CH, "item-specs.yaml"), itemsDoc.toString());
if (langItemsFilled > 0) writeFileSync(join(LANG, "items.yaml"), langItemsDoc.toString());

// --- languages/moves・abilities の日英名 backfill（PokeAPI names・名前欠落のみ） --------------
const backfillNames = (file: string, mapKey: string, category: string): number => {
  const doc = parseDocument(readFileSync(join(LANG, file), "utf8"));
  const map = doc.get(mapKey) as YAMLMap;
  let filled = 0;
  for (const entry of map.items) {
    const id = String((entry.key as { value: string }).value);
    const node = entry.value as YAMLMap;
    const current = node.toJS(doc) as { ja?: string; en?: string };
    if (!needsName(current)) continue;
    const json = rawOpt<{ names?: { name: string; language: { name: string } }[] }>(category, id);
    if (json === null) continue;
    filled += apply(doc, node, id, planFields(current, extractNames(json)));
  }
  if (filled > 0) writeFileSync(join(LANG, file), doc.toString());
  return filled;
};
const movesFilled = backfillNames("moves.yaml", "moves", "move");
const abilitiesFilled = backfillNames("abilities.yaml", "abilities", "ability");

console.log(
  `[materialize] filled ${speciesFilled} species / ${megaFilled} mega / ${itemsFilled} item structural, ${langSpeciesFilled} species / ${langItemsFilled} item / ${movesFilled} move / ${abilitiesFilled} ability name field(s), ${conflictCount} conflict(s)`,
);
