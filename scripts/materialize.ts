/**
 * materialize.ts — `data/raw/`（PokeAPI `names` キャッシュ）から名前（ja/en）を読み、名前 SoT
 * `data/languages/*.yaml` へ **append/既存尊重で転記**する名前専任スクリプト。
 *
 * **名前専任**（plan 10）: 構造データ（図鑑番号 / タイプ / 種族値 / 特性 id / 持ち物 category）の転記は
 * pokemon-showdown 経路（`scripts/sync-showdown.ts` + `src/codegen/showdown/*`）へ移管した。本スクリプトは
 * `languages/{species,items,moves,abilities,types}.yaml` の名前（ja/en）補完だけを担う。languages は reg 非依存の
 * **全件名辞書**（ADR 0041）で、PokeAPI から ja/en を両取りして満たす。メガ名は PokeAPI のカテゴリに無いため
 * 対象外（en=showdown / ja=手作業・[[data-pipeline]]）。
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
import { extractNames, type FieldPlan, planFields } from "../src/codegen/materialize.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw");
const LANG = join(ROOT, "data", "languages");

type RawNamed = { names?: { name: string; language: { name: string } }[] };

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
  const doc = parseDocument(readFileSync(join(LANG, file), "utf8"));
  const map = doc.get(mapKey) as YAMLMap;
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

console.log(
  `[sync:ja-names] filled ${speciesFilled} species / ${itemsFilled} item / ${movesFilled} move / ${abilitiesFilled} ability / ${typesFilled} type name field(s), ${conflictCount} conflict(s), ${skippedCount} skipped (ja/en incomplete)`,
);
