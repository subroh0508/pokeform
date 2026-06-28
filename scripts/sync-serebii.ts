/**
 * sync-serebii.ts（速報の転記配線・新規）— `scrape-serebii.ts` の中間 JSON を SoT YAML へ転記する薄い配線
 * （fs/YAML I/O 専任）。sync-showdown.ts と同型（`planFields` の append/既存尊重・block スタイル）だが、
 * **速報経路ゆえ ja も埋める**（showdown は ja を持たず en のみ）。判断分岐を持つ純変換は
 * `src/codegen/serebii/*`（カバレッジ 100%）に委譲し、本スクリプトは配線のみ（coverage 除外・[[testing]]）。
 *
 * 実行: `node scripts/sync-serebii.ts <dataset> <regId>`（pnpm serebii:<dataset> <regId>・pnpm が regId を
 * 末尾付与）。dataset=species|moves|items|abilities|mega / regId=m-a|m-b。中間 JSON は env SEREBII_JSON が
 * あればそれを読み、無ければ `scrape-serebii.ts <dataset> <regId>` を spawn して得る（取得 → パース → 検証）。
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type Document, parseDocument, type YAMLMap, type YAMLSeq } from "yaml";
import { planFields } from "../src/codegen/materialize.ts";
import type { SerebiiAbility } from "../src/codegen/serebii/parse-abilities.ts";
import type { SerebiiItem, SerebiiItemName } from "../src/codegen/serebii/parse-items.ts";
import type { SerebiiMega } from "../src/codegen/serebii/parse-mega.ts";
import type { SerebiiMove } from "../src/codegen/serebii/parse-moves.ts";
import type { SerebiiSpecies } from "../src/codegen/serebii/parse-species.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CH = join(ROOT, "data", "champions");
const LANG = join(ROOT, "data", "languages");
const SCRAPE = join(ROOT, "scripts", "scrape-serebii.ts");

const read = (path: string): Document => parseDocument(readFileSync(path, "utf8"));
const write = (path: string, doc: Document): void => writeFileSync(path, doc.toString());
const sorted = (ids: string[]): string[] => [...new Set(ids)].sort((a, b) => a.localeCompare(b));

/** 中間 JSON を取得する（SEREBII_JSON があればそれを読む・無ければ scrape を spawn）。 */
function loadJson(dataset: string, regId: string): Record<string, unknown> {
  if (process.env.SEREBII_JSON) return JSON.parse(readFileSync(process.env.SEREBII_JSON, "utf8"));
  const out = execFileSync("node", [SCRAPE, dataset, regId], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return JSON.parse(out);
}

/** YAML map から id→node を引く（無ければ undefined）。 */
const mapEntry = (map: YAMLMap, id: string): YAMLMap | undefined =>
  map.get(id, true) as YAMLMap | undefined;

/** plan の fill をノードへ適用し件数を返す（既存値は上書きしない・materialize と同型）。 */
function applyFill<T extends object>(doc: Document, node: YAMLMap, fresh: T): number {
  const plan = planFields(node.toJS(doc) as Partial<T>, fresh);
  for (const [key, value] of Object.entries(plan.fill)) node.set(key, doc.createNode(value));
  return Object.keys(plan.fill).length;
}

/** 既存エントリが無ければ空 map を作って追加し、そのノードを返す（append-only マスター）。 */
function ensureEntry(doc: Document, map: YAMLMap, id: string): YAMLMap {
  const existing = mapEntry(map, id);
  if (existing) return existing;
  const node = doc.createNode({}) as YAMLMap;
  map.set(doc.createNode(id), node);
  return node;
}

/** seq を id 集合の sorted union に是正する（append-only・block スタイル）。 */
function unionSeq(doc: Document, map: YAMLMap, key: string, ids: string[]): void {
  const existing = (map.get(key, true) as YAMLSeq | undefined)?.toJS(doc) as string[] | undefined;
  map.set(key, doc.createNode(sorted([...(existing ?? []), ...ids])));
}

/** 名前材料（ja/en・速報は両方埋める）。 */
const nameOf = (ja: string, en: string): { ja: string; en: string } => ({ ja, en });

function syncSpecies(regId: string, json: Record<string, unknown>): string {
  const records = json.species as SerebiiSpecies[];
  const roster = (json.roster as string[]) ?? records.map((r) => r.id);
  const specsDoc = read(join(CH, "species-specs.yaml"));
  const specsMap = specsDoc.get("species") as YAMLMap;
  const langDoc = read(join(LANG, "species.yaml"));
  const langMap = langDoc.get("species") as YAMLMap;
  const rosterDoc = read(join(CH, regId, "species.yaml"));
  const movesDoc = read(join(CH, regId, "species-moves.yaml"));
  const movesMap = movesDoc.get("moves") as YAMLMap;

  let filled = 0;
  for (const rec of records) {
    filled += applyFill(specsDoc, ensureEntry(specsDoc, specsMap, rec.id), {
      dex: rec.dex,
      types: rec.types,
      stats: rec.stats,
      abilities: rec.abilities,
    });
    applyFill(langDoc, ensureEntry(langDoc, langMap, rec.id), nameOf(rec.ja, rec.en));
    unionSeq(movesDoc, movesMap, rec.id, rec.moves);
  }
  unionSeq(rosterDoc, rosterDoc.contents as YAMLMap, "species", roster);

  write(join(CH, "species-specs.yaml"), specsDoc);
  write(join(LANG, "species.yaml"), langDoc);
  write(join(CH, regId, "species.yaml"), rosterDoc);
  write(join(CH, regId, "species-moves.yaml"), movesDoc);
  return `species: ${records.length} record(s), ${filled} structural field(s) filled`;
}

function syncMoves(_regId: string, json: Record<string, unknown>): string {
  const records = json.moves as SerebiiMove[];
  const specsDoc = read(join(CH, "move-specs.yaml"));
  const specsMap = specsDoc.get("moves") as YAMLMap;
  const langDoc = read(join(LANG, "moves.yaml"));
  const langMap = langDoc.get("moves") as YAMLMap;
  let filled = 0;
  for (const rec of records) {
    filled += applyFill(specsDoc, ensureEntry(specsDoc, specsMap, rec.id), {
      type: rec.type,
      damageClass: rec.damageClass,
      power: rec.power,
      accuracy: rec.accuracy,
      pp: rec.pp,
      priority: rec.priority,
    });
    applyFill(langDoc, ensureEntry(langDoc, langMap, rec.id), nameOf(rec.ja, rec.en));
  }
  write(join(CH, "move-specs.yaml"), specsDoc);
  write(join(LANG, "moves.yaml"), langDoc);
  return `moves: ${records.length} record(s), ${filled} meta field(s) filled`;
}

function syncItems(regId: string, json: Record<string, unknown>): string {
  const roster = json.items as SerebiiItem[];
  const names = (json.names as SerebiiItemName[]) ?? [];
  const jaById = new Map(names.map((n) => [n.id, n.ja]));
  const specsDoc = read(join(CH, "item-specs.yaml"));
  const specsMap = specsDoc.get("items") as YAMLMap;
  const langDoc = read(join(LANG, "items.yaml"));
  const langMap = langDoc.get("items") as YAMLMap;
  const regDoc = read(join(CH, regId, "items.yaml"));
  let filled = 0;
  for (const it of roster) {
    const structural = it.megaStoneFor
      ? { category: "mega-stones", megaStoneFor: it.megaStoneFor }
      : { category: it.category === "berry" ? "berries" : "held-items" };
    filled += applyFill(specsDoc, ensureEntry(specsDoc, specsMap, it.id), structural);
    applyFill(
      langDoc,
      ensureEntry(langDoc, langMap, it.id),
      nameOf(jaById.get(it.id) ?? "", it.en),
    );
  }
  unionSeq(
    regDoc,
    regDoc.contents as YAMLMap,
    "items",
    roster.map((it) => it.id),
  );
  write(join(CH, "item-specs.yaml"), specsDoc);
  write(join(LANG, "items.yaml"), langDoc);
  write(join(CH, regId, "items.yaml"), regDoc);
  return `items: ${roster.length} record(s), ${filled} structural field(s) filled`;
}

function syncAbilities(_regId: string, json: Record<string, unknown>): string {
  const records = json.abilities as SerebiiAbility[];
  const specsDoc = read(join(CH, "ability-specs.yaml"));
  const langDoc = read(join(LANG, "abilities.yaml"));
  const langMap = langDoc.get("abilities") as YAMLMap;
  unionSeq(
    specsDoc,
    specsDoc.contents as YAMLMap,
    "abilities",
    records.map((r) => r.id),
  );
  for (const rec of records) {
    applyFill(langDoc, ensureEntry(langDoc, langMap, rec.id), nameOf(rec.ja, rec.en));
  }
  write(join(CH, "ability-specs.yaml"), specsDoc);
  write(join(LANG, "abilities.yaml"), langDoc);
  return `abilities: ${records.length} id(s)`;
}

function syncMega(regId: string, json: Record<string, unknown>): string {
  const records = json.mega as SerebiiMega[];
  const specsDoc = read(join(CH, "mega-specs.yaml"));
  const specsMap = specsDoc.get("mega") as YAMLMap;
  const langDoc = read(join(LANG, "mega.yaml"));
  const langMap = langDoc.get("mega") as YAMLMap;
  const speciesDoc = read(join(CH, "species-specs.yaml"));
  const speciesMap = speciesDoc.get("species") as YAMLMap;
  const regDoc = read(join(CH, regId, "mega.yaml"));
  const regMap = regDoc.get("mega") as YAMLMap;

  // base 種族 dex を species-specs から引く（メガは base と dex を共有・Serebii は別 dex を持たない）。
  const baseDex = (base: string): number | null =>
    (mapEntry(speciesMap, base)?.get("dex") as number | undefined) ?? null;

  let filled = 0;
  const byBase: Record<string, string[]> = {};
  for (const rec of records) {
    filled += applyFill(specsDoc, ensureEntry(specsDoc, specsMap, rec.id), {
      dex: baseDex(rec.baseSpecies),
      types: rec.types,
      stats: rec.stats,
      ability: rec.ability,
      baseSpecies: rec.baseSpecies,
    });
    applyFill(langDoc, ensureEntry(langDoc, langMap, rec.id), nameOf(rec.ja, rec.en));
    const list = byBase[rec.baseSpecies] ?? [];
    list.push(rec.id);
    byBase[rec.baseSpecies] = list;
  }
  for (const [base, megaIds] of Object.entries(byBase)) {
    const baseNode = mapEntry(speciesMap, base);
    if (baseNode) unionSeq(speciesDoc, baseNode, "megaEvolvesTo", megaIds);
    unionSeq(regDoc, regMap, base, megaIds);
  }
  write(join(CH, "mega-specs.yaml"), specsDoc);
  write(join(LANG, "mega.yaml"), langDoc);
  write(join(CH, "species-specs.yaml"), speciesDoc);
  write(join(CH, regId, "mega.yaml"), regDoc);
  return `mega: ${records.length} record(s), ${filled} structural field(s) filled`;
}

const SYNCERS: Record<string, (regId: string, json: Record<string, unknown>) => string> = {
  species: syncSpecies,
  moves: syncMoves,
  items: syncItems,
  abilities: syncAbilities,
  mega: syncMega,
};

const [dataset, regId] = process.argv.slice(2);
if (!dataset || !regId || !SYNCERS[dataset]) {
  console.error(
    `Usage: node scripts/sync-serebii.ts <dataset> <regId>\n  dataset=${Object.keys(SYNCERS).join("|")} regId=m-a|m-b`,
  );
  process.exit(1);
}
const summary = SYNCERS[dataset](regId, loadJson(dataset, regId));
console.log(`[sync-serebii] ${regId} ${summary}`);
