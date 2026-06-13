/**
 * materialize.ts — `data/raw/`（PokeAPI キャッシュ）から構造データ（図鑑番号 / タイプ / 種族値 /
 * 特性 id / 持ち物 category）を読み、catalog YAML の該当フィールドへ**転記**する専任スクリプト。
 *
 * vendor 方式（ADR 0012 / 0027）の転記段: raw=取得キャッシュ（materialize 元）/ catalog=SoT。
 * `generate.ts` は catalog のみを変換し raw を読まない（ADR 0027）。本スクリプトだけが raw を必要とする。
 *
 * **raw 必須・fail-fast**: raw が無ければ `readFileSync` が ENOENT で即エラー終了する。自前の存在
 * チェック・`fetch:data` 誘導は持たない（raw 存在の担保は呼び出し側 `survey-regulation` skill の責務・
 * ADR 0027 / [[data-pipeline]]）。
 *
 * **append/既存尊重**: 未設定の構造フィールドだけを raw 由来値で埋め、既に値があるフィールドは raw と
 * 異なっても上書きしない（Champions 実態に合わせた hand-authored 修正を保護）。差分は conflict として
 * 標準出力に提示する（要目視）。コメントは `parseDocument` で保持する。
 *
 * 実行: `pnpm materialize`（fetch:data 後・ネットワーク不要）。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type Document, parseDocument, type YAMLMap } from "yaml";
import {
  extractItemCategory,
  extractSpeciesStructural,
  type FieldPlan,
  planFields,
  type SpeciesStructural,
} from "../src/codegen/materialize.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw");
const CAT = join(ROOT, "data", "champions", "catalog");

/** raw JSON を 1 件読む（不在なら ENOENT で fail-fast）。 */
const raw = <T>(category: string, name: string): T =>
  JSON.parse(readFileSync(join(RAW, category, `${name}.json`), "utf8")) as T;

let conflictCount = 0;
/** plan の fill をノードへ適用し、conflict を提示する。 */
const apply = <T extends object>(
  doc: Document,
  node: YAMLMap,
  id: string,
  plan: FieldPlan<T>,
): number => {
  for (const [key, value] of Object.entries(plan.fill)) {
    // block スタイルで転記する（flow を生まない・data YAML は全 block・02 Phase 15 / [[data-pipeline]]）。
    node.set(key, doc.createNode(value));
  }
  for (const c of plan.conflicts) {
    conflictCount++;
    console.warn(
      `[materialize] conflict ${id}.${String(c.key)}: keep hand-authored ${JSON.stringify(
        c.existing,
      )} (raw=${JSON.stringify(c.fresh)})`,
    );
  }
  return Object.keys(plan.fill).length;
};

// --- species（dex / types / stats / abilities） -----------------------------
const speciesDoc = parseDocument(readFileSync(join(CAT, "species.yaml"), "utf8"));
const pokemon = speciesDoc.get("pokemon") as YAMLMap;
let speciesFilled = 0;
for (const item of pokemon.items) {
  const slug = String((item.key as { value: string }).value);
  const node = item.value as YAMLMap;
  const poke = raw<{
    stats: { base_stat: number; stat: { name: string } }[];
    types: { type: { name: string } }[];
    abilities: { ability: { name: string } }[];
    species: { name: string };
  }>("pokemon", slug);
  const speciesJson = raw<{ id: number }>("pokemon-species", poke.species.name);
  const fresh = extractSpeciesStructural(poke, speciesJson);
  const plan = planFields(node.toJS(speciesDoc) as Partial<SpeciesStructural>, fresh);
  speciesFilled += apply(speciesDoc, node, slug, plan);
}
writeFileSync(join(CAT, "species.yaml"), speciesDoc.toString());

// --- items（category） -------------------------------------------------------
const itemsDoc = parseDocument(readFileSync(join(CAT, "items.yaml"), "utf8"));
const items = itemsDoc.get("items") as YAMLMap;
let itemsFilled = 0;
for (const entry of items.items) {
  const id = String((entry.key as { value: string }).value);
  const node = entry.value as YAMLMap;
  const fresh = { category: extractItemCategory(raw("item", id)) };
  const plan = planFields(node.toJS(itemsDoc) as Partial<typeof fresh>, fresh);
  itemsFilled += apply(itemsDoc, node, id, plan);
}
writeFileSync(join(CAT, "items.yaml"), itemsDoc.toString());

console.log(
  `[materialize] filled ${speciesFilled} species field(s), ${itemsFilled} item field(s), ${conflictCount} conflict(s)`,
);
