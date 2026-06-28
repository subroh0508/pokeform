/**
 * materialize.ts — `data/raw/`（PokeAPI `names` キャッシュ）から日本語名 ja を読み、名前 SoT
 * `data/languages/*.yaml` の該当エントリへ **backfill** する ja 専任スクリプト。
 *
 * **ja 専任**（plan 10）: 構造データ（図鑑番号 / タイプ / 種族値 / 特性 id / 持ち物 category）の転記は
 * pokemon-showdown 経路（`scripts/sync-showdown.ts` + `src/codegen/showdown/*`）へ移管した。本スクリプトは
 * `languages/{species,items,moves,abilities}.yaml` の ja（技 / 特性は ja/en）補完だけを担う。メガ名 ja /
 * タイプ名は PokeAPI に無いため対象外（skill 著述 / Serebii 速報・[[data-pipeline]]）。
 *
 * **raw best-effort（不在 skip）**: `fetch:ja-names` が ja/en 欠落エントリのみ best-effort 取得するため、raw が
 * 無いエントリ（Champions 固有メガストーン等の PokeAPI 非存在・取得済みで欠落なし）は転記をスキップする。
 *
 * **append/既存尊重**: 未設定フィールドだけを raw 由来 ja/en で埋め、既に値があるフィールドは raw と異なっても
 * 上書きしない（Champions 実態に合わせた skill 著述 / 速報値を保護）。差分は conflict として標準出力に提示する。
 *
 * 実行: `pnpm sync:ja-names`（fetch:ja-names 後・ネットワーク不要）。
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type Document, parseDocument, type YAMLMap } from "yaml";
import {
  extractJaName,
  extractNames,
  type FieldPlan,
  planFields,
} from "../src/codegen/materialize.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw");
const LANG = join(ROOT, "data", "languages");

type RawNamed = { names?: { name: string; language: { name: string } }[] };

/** raw JSON を best-effort で読む（不在なら null）。ja/en 補完は取得が無くても続行する。 */
const rawOpt = (category: string, name: string): RawNamed | null => {
  const file = join(RAW, category, `${name}.json`);
  return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as RawNamed) : null;
};

/** raw names から ja のみの転記欄を組む（取得できなければ空）。en は skill 著述 / 速報に委ねる。 */
const jaOnly = (r: RawNamed): { ja?: string } => {
  const ja = extractJaName(r);
  return ja !== undefined ? { ja } : {};
};

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
      `[sync:ja-names] conflict ${id}.${String(c.key)}: keep authored ${JSON.stringify(
        c.existing,
      )} (raw=${JSON.stringify(c.fresh)})`,
    );
  }
  return Object.keys(plan.fill).length;
};

/**
 * languages/<file> の各エントリへ raw `names` 由来の名前を backfill する。`needs` で欠落エントリのみ raw を引き
 * （最小取得）、`extract` で raw → { ja?, en? } を取り出して append/既存尊重で適用する。
 */
const backfillNames = (
  file: string,
  mapKey: string,
  category: string,
  extract: (r: RawNamed) => { ja?: string; en?: string },
  needs: (e: { ja?: string; en?: string }) => boolean,
): number => {
  const doc = parseDocument(readFileSync(join(LANG, file), "utf8"));
  const map = doc.get(mapKey) as YAMLMap;
  let filled = 0;
  for (const entry of map.items) {
    const id = String((entry.key as { value: string }).value);
    const node = entry.value as YAMLMap;
    const current = node.toJS(doc) as { ja?: string; en?: string };
    if (!needs(current)) continue;
    const json = rawOpt(category, id);
    if (json === null) continue;
    filled += apply(doc, node, id, planFields(current, extract(json)));
  }
  if (filled > 0) writeFileSync(join(LANG, file), doc.toString());
  return filled;
};

const needsJa = (e: { ja?: string; en?: string }): boolean => !e.ja;
const needsJaEn = (e: { ja?: string; en?: string }): boolean => !e.ja || !e.en;

// 種族 / 持ち物は ja のみ PokeAPI 由来（en は skill 著述）。技 / 特性は ja/en とも PokeAPI 由来。
const speciesFilled = backfillNames("species.yaml", "species", "pokemon-species", jaOnly, needsJa);
const itemsFilled = backfillNames("items.yaml", "items", "item", jaOnly, needsJa);
const movesFilled = backfillNames("moves.yaml", "moves", "move", extractNames, needsJaEn);
const abilitiesFilled = backfillNames(
  "abilities.yaml",
  "abilities",
  "ability",
  extractNames,
  needsJaEn,
);

console.log(
  `[sync:ja-names] filled ${speciesFilled} species / ${itemsFilled} item / ${movesFilled} move / ${abilitiesFilled} ability name field(s), ${conflictCount} conflict(s)`,
);
