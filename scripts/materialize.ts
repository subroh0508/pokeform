/**
 * materialize.ts — `data/raw/`（PokeAPI `names` キャッシュ）から名前（ja/en）を読み、名前 SoT
 * `data/languages/*.yaml` へ **append/既存尊重で転記**する名前専任スクリプト。
 *
 * **名前専任**（plan 10）: 構造データ（図鑑番号 / タイプ / 種族値 / 特性 id / 持ち物 category）の転記は
 * pokemon-showdown 経路（`scripts/sync-showdown.ts` + `src/codegen/showdown/*`）へ移管した。本スクリプトは
 * `languages/{species,items,moves,abilities,types,mega}.yaml` の名前（ja/en）補完だけを担う。languages は reg 非依存の
 * **全件名辞書**（ADR 0041）で、PokeAPI から ja/en を両取りして満たす。**メガ名も PokeAPI 対象**（`pokemon-form` の
 * `form_names`・`is_mega` で判別する 6 種目・ADR 0043・[[data-pipeline]]）。
 *
 * **raw 起点の append/backfill**（ADR 0041 の「append/既存尊重転記」）: `fetch:ja-names` が全件列挙で未記録 /
 * ja・en 欠落の id のみ raw を書くため、`data/raw/<category>/*.json` を決定論順（sort）で走査し —
 *   - **未記録 id**（languages に無い）は新規エントリとして **append**（全件名辞書を満たす）、
 *   - **既存だが ja・en 欠落**の id は不足欄だけ **backfill**、
 * を行う。既に ja/en 完備の id は raw を持たない（fetch が skip）ため触れない。
 *
 * **既存尊重**: 既に値があるフィールドは raw と異なっても上書きしない（Champions 実態に合わせた skill 著述 /
 * 速報値を保護）。差分は conflict として標準出力に提示する（append される新規 id は既存値が無く conflict しない）。
 *
 * 実行: `pnpm sync:ja-names`（fetch:ja-names 後・ネットワーク不要）。
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type Document, parseDocument, type YAMLMap } from "yaml";
import {
  extractMegaNames,
  extractNames,
  type FieldPlan,
  getOrCreateBlockMap,
  planFields,
  pruneToKeep,
} from "../src/codegen/materialize.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw");
const LANG = join(ROOT, "data", "languages");

/** 欠損 languages ファイルを from-scratch 復元するときの先頭コメント（`data/` 完全削除時のみ使用・plan 11 P2）。 */
const HEADERS: Record<string, string> = {
  species: "# data/languages/species.yaml — base 種族の日英名（id→{ja,en}・名前 SoT・ADR 0035）。",
  items: "# data/languages/items.yaml — 持ち物の日英名（id→{ja,en}）。",
  moves: "# data/languages/moves.yaml — 技の日英名（id→{ja,en}・ゲーム非依存）。",
  abilities: "# data/languages/abilities.yaml — 特性の日英名（id→{ja,en}）。",
  types: "# data/languages/types.yaml — タイプの日英名（id→{ja,en}）。",
  mega: "# data/languages/mega.yaml — メガ形態の日英名（id→{ja,en}）。",
};

/** raw JSON の名前欄。5 種は `names`、mega は `pokemon-form` の `form_names` / `is_mega`（ADR 0043）。 */
type RawNamed = {
  names?: { name: string; language: { name: string } }[];
  is_mega?: boolean;
  form_names?: { name: string; language: { name: string } }[];
};

/** raw JSON を best-effort で読む（不在なら null）。ja/en 補完は取得が無くても続行する。 */
const rawOpt = (category: string, name: string): RawNamed | null => {
  const file = join(RAW, category, `${name}.json`);
  return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as RawNamed) : null;
};

let conflictCount = 0;
let skippedCount = 0;
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

/** `data/raw/<category>/` に取得済みの id（`<id>.json` のベース名）を決定論順（sort）で列挙する。fetch が全件
 * 列挙で未記録 / 欠落 id のみ raw を書くため、この集合が「append すべき新規 + backfill すべき欠落」の対象になる。 */
const listRawIds = (category: string): string[] => {
  const dir = join(RAW, category);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.slice(0, -".json".length))
    .sort();
};

/**
 * languages/<file> を raw 起点で満たす。`data/raw/<category>/` の id を走査し、languages に無い id は
 * **新規エントリとして append**（全件名辞書化・ADR 0041）、既存だが `needs` を満たす（ja・en 欠落）id は
 * 不足欄だけ **backfill**（既存尊重）。`extract` で raw → { ja?, en? } を取り出して適用する。
 */
const backfillNames = (
  file: string,
  mapKey: string,
  category: string,
  extract: (r: RawNamed) => { ja?: string; en?: string },
  needs: (e: { ja?: string; en?: string }) => boolean,
): number => {
  // from-scratch 復元（`data/languages/*` 完全削除）でも scaffold / seed 無しで動くよう、欠損ファイルは先頭
  // コメントだけの doc を起こし、map ノードは block スタイルで get-or-create する（純関数側・plan 11 P2）。
  const path = join(LANG, file);
  const doc = existsSync(path)
    ? parseDocument(readFileSync(path, "utf8"))
    : parseDocument(`${HEADERS[mapKey] ?? `# data/languages/${file}`}\n`);
  const map = getOrCreateBlockMap(doc, mapKey);
  let filled = 0;
  for (const id of listRawIds(category)) {
    const json = rawOpt(category, id);
    if (json === null) continue;
    const node = map.get(id) as YAMLMap | undefined;
    if (node === undefined) {
      // 未記録 id: ja/en を両取りできたものだけ新規エントリとして append する。PokeAPI が ja を持たない id
      // （Pokémon GO 専用特性 is_main_series:false / LA の未ローカライズ球 / 未ローカライズの新特性 等）は
      // 全件名辞書の「各エントリ ja/en 完備」不変条件（ADR 0041）を満たせないため辞書へ入れず skip する
      // （必要になれば手作業で ja を補って append する・[[data-pipeline]]）。既存値が無いため conflict しない。
      const names = extract(json);
      if (names.ja === undefined || names.en === undefined) {
        skippedCount++;
        console.warn(
          `[sync:ja-names] skip append ${category}/${id} (ja/en incomplete from PokeAPI)`,
        );
        continue;
      }
      map.set(doc.createNode(id), doc.createNode(names));
      filled += Object.keys(names).length;
      continue;
    }
    // 既存 id: ja・en 欠落のみ backfill（既存値は上書きしない）。
    const current = node.toJS(doc) as { ja?: string; en?: string };
    if (!needs(current)) continue;
    filled += apply(doc, node, id, planFields(current, extract(json)));
  }
  if (filled > 0) writeFileSync(join(LANG, file), doc.toString());
  return filled;
};

/**
 * items.yaml を item-category whitelist union（`data/raw/item-union.json`）のみへ剪定する（issue #213・ADR 0041 の
 * items 例外）。network を持つ `fetch:ja-names` が union を manifest に残し、offline の本段が union 外の既存 id を
 * 除去する。仕分けは純関数 `pruneToKeep`、ノード削除だけ IO で行う。manifest 不在（items 未取得）なら剪定しない
 * （他 4 種の全件辞書には影響しない）。剪定は backfill の後に走らせ、append した union 内 id は残す。
 */
const pruneItemsToUnion = (): number => {
  const manifest = join(RAW, "item-union.json");
  const itemsPath = join(LANG, "items.yaml");
  // manifest 不在（items 未取得）/ items.yaml 不在（from-scratch で items backfill が 0 件）なら剪定しない。
  if (!existsSync(manifest) || !existsSync(itemsPath)) return 0;
  const keep = JSON.parse(readFileSync(manifest, "utf8")) as string[];
  const doc = parseDocument(readFileSync(itemsPath, "utf8"));
  const map = getOrCreateBlockMap(doc, "items");
  const existing = Object.keys(map.toJS(doc) as Record<string, unknown>);
  const { removed } = pruneToKeep(existing, keep);
  for (const id of removed) map.delete(id);
  if (removed.length > 0) writeFileSync(join(LANG, "items.yaml"), doc.toString());
  return removed.length;
};

const needsJaEn = (e: { ja?: string; en?: string }): boolean => !e.ja || !e.en;

// 全 5 種とも PokeAPI `names` から ja/en を両取りする（languages を ja/en 完備の全件辞書にする・ADR 0041）。
// append/既存尊重ゆえ既存の en（showdown 正 / Serebii 速報）は上書きされず、未設定欄のみ PokeAPI 由来で埋まる。
const speciesFilled = backfillNames(
  "species.yaml",
  "species",
  "pokemon-species",
  extractNames,
  needsJaEn,
);
const itemsFilled = backfillNames("items.yaml", "items", "item", extractNames, needsJaEn);
const movesFilled = backfillNames("moves.yaml", "moves", "move", extractNames, needsJaEn);
const abilitiesFilled = backfillNames(
  "abilities.yaml",
  "abilities",
  "ability",
  extractNames,
  needsJaEn,
);
const typesFilled = backfillNames("types.yaml", "types", "type", extractNames, needsJaEn);
// mega は pokemon-form 経路。fetch が mega 候補のみ raw 化するため対象 id は mega に限られるが、extractMegaNames が
// is_mega で最終判別する（非 mega form は空 = append/backfill しない・ADR 0043）。
const megaFilled = backfillNames("mega.yaml", "mega", "pokemon-form", extractMegaNames, needsJaEn);

// items のみ backfill 後に whitelist union で剪定する（issue #213）。
const itemsPruned = pruneItemsToUnion();

console.log(
  `[sync:ja-names] filled ${speciesFilled} species / ${itemsFilled} item / ${movesFilled} move / ${abilitiesFilled} ability / ${typesFilled} type / ${megaFilled} mega name field(s), pruned ${itemsPruned} item(s) outside whitelist, ${conflictCount} conflict(s), ${skippedCount} skipped (ja/en incomplete)`,
);
