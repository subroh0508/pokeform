/**
 * sync-showdown.ts — showdown 抽出の中間 JSON を SoT YAML へ転記する薄い配線（fs/YAML I/O 専任）。
 *
 * 判断分岐を持つ純変換は `src/codegen/showdown/*-fields.ts`（カバレッジ 100%）と
 * `src/codegen/materialize.ts` の `planFields`（append/既存尊重）に委譲し、本スクリプトは
 * 「抽出層を実行 → 中間 JSON を読む → 純関数で field 化 → YAML を block スタイルで更新」だけを担う
 * （[[data-pipeline]] の三段・materialize と同型の I/O 規律）。coverage 除外（scripts/ は src 外）。
 *
 * 実行: `node scripts/sync-showdown.ts <dataset> <regId>`（pnpm showdown:<dataset> <regId>・
 * pnpm が regId を末尾に付与するため引数順は dataset 先頭）。
 *   dataset = species | moves | items | abilities | mega。
 *   regId   = m-a | m-b（mod へ写像: m-a→championsregma / m-b→champions）。
 * 抽出は showdown ツリー（env SHOWDOWN_DIR・既定 ./pokemon-showdown → ~/pokemon-showdown）の
 * `node tools/showdown/cli.js` を spawn して得る。env SHOWDOWN_JSON を渡せば抽出を省きそのファイルを読む。
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type Document, parseDocument, type YAMLMap, type YAMLSeq } from "yaml";
import { planFields } from "../src/codegen/materialize.ts";
import { abilityEnName, abilityId } from "../src/codegen/showdown/abilities-fields.ts";
import {
  type ItemInput,
  itemEnName,
  itemId,
  itemStructuralFields,
} from "../src/codegen/showdown/items-fields.ts";
import {
  groupMegaByBase,
  type MegaInput,
  megaEnName,
  megaId,
  megaStructuralFields,
} from "../src/codegen/showdown/mega-fields.ts";
import {
  type MoveInput,
  moveEnName,
  moveId,
  moveStatsFields,
} from "../src/codegen/showdown/moves-fields.ts";
import {
  type SpeciesInput,
  speciesEnName,
  speciesId,
  speciesMoveIds,
  speciesStructuralFields,
} from "../src/codegen/showdown/species-fields.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CH = join(ROOT, "data", "champions");
const LANG = join(ROOT, "data", "languages");

const REG_TO_MOD: Record<string, string> = { "m-a": "championsregma", "m-b": "champions" };

// showdown の `node build` は tools/showdown/*.ts を dist/ へ出力する。
const CLI_REL = join("dist", "tools", "showdown", "cli.js");

/** showdown ツリーを env / 既定パスから解決する。 */
function showdownDir(): string {
  const candidates = [
    process.env.SHOWDOWN_DIR,
    join(ROOT, "pokemon-showdown"),
    join(homedir(), "pokemon-showdown"),
  ].filter((p): p is string => !!p);
  for (const dir of candidates) {
    if (existsSync(join(dir, CLI_REL))) return dir;
  }
  throw new Error(
    `showdown tree not found (looked for ${CLI_REL} in ${candidates.join(", ")}). ` +
      `Copy scripts/showdown to <showdown>/tools/showdown and run \`node build\`.`,
  );
}

/** 中間 JSON を取得する（SHOWDOWN_JSON があればそれを読む・無ければ抽出を spawn）。 */
function loadJson(regId: string, dataset: string): Record<string, unknown> {
  if (process.env.SHOWDOWN_JSON) {
    return JSON.parse(readFileSync(process.env.SHOWDOWN_JSON, "utf8"));
  }
  const mod = REG_TO_MOD[regId] ?? regId;
  const out = execFileSync("node", [CLI_REL, mod, dataset], {
    cwd: showdownDir(),
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return JSON.parse(out);
}

/** YAML map から id→node を引く（無ければ undefined）。 */
const mapEntry = (map: YAMLMap, id: string): YAMLMap | undefined =>
  map.get(id, true) as YAMLMap | undefined;

/** plan の fill をノードへ適用し、件数を返す（既存値は上書きしない・materialize と同型）。 */
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
  const merged = [...new Set([...(existing ?? []), ...ids])].sort((a, b) => a.localeCompare(b));
  map.set(key, doc.createNode(merged));
}

const read = (path: string): Document => parseDocument(readFileSync(path, "utf8"));
const write = (path: string, doc: Document): void => writeFileSync(path, doc.toString());

function syncSpecies(regId: string, json: Record<string, unknown>): string {
  const records = json.species as SpeciesInput[];
  const specsDoc = read(join(CH, "species-specs.yaml"));
  const specsMap = specsDoc.get("species") as YAMLMap;
  const langDoc = read(join(LANG, "species.yaml"));
  const langMap = langDoc.get("species") as YAMLMap;
  const rosterDoc = read(join(CH, regId, "species.yaml"));
  const movesDoc = read(join(CH, regId, "species-moves.yaml"));
  const movesMap = movesDoc.get("moves") as YAMLMap;

  let filled = 0;
  for (const rec of records) {
    const id = speciesId(rec);
    filled += applyFill(
      specsDoc,
      ensureEntry(specsDoc, specsMap, id),
      speciesStructuralFields(rec),
    );
    applyFill(langDoc, ensureEntry(langDoc, langMap, id), speciesEnName(rec));
    // species-moves は moves: { <species>: [move id..] }。species キーへ seq を sorted union で set。
    unionSeq(movesDoc, movesMap, id, speciesMoveIds(rec));
  }
  // roster は species id の sorted union。
  unionSeq(rosterDoc, rosterDoc.contents as YAMLMap, "species", records.map(speciesId));

  write(join(CH, "species-specs.yaml"), specsDoc);
  write(join(LANG, "species.yaml"), langDoc);
  write(join(CH, regId, "species.yaml"), rosterDoc);
  write(join(CH, regId, "species-moves.yaml"), movesDoc);
  return `species: ${records.length} record(s), ${filled} structural field(s) filled`;
}

function syncMoves(_regId: string, json: Record<string, unknown>): string {
  const records = json.moves as MoveInput[];
  const specsDoc = read(join(CH, "move-specs.yaml"));
  const specsMap = specsDoc.get("moves") as YAMLMap;
  const langDoc = read(join(LANG, "moves.yaml"));
  const langMap = langDoc.get("moves") as YAMLMap;
  let filled = 0;
  for (const rec of records) {
    const id = moveId(rec);
    filled += applyFill(specsDoc, ensureEntry(specsDoc, specsMap, id), moveStatsFields(rec));
    applyFill(langDoc, ensureEntry(langDoc, langMap, id), moveEnName(rec));
  }
  write(join(CH, "move-specs.yaml"), specsDoc);
  write(join(LANG, "moves.yaml"), langDoc);
  return `moves: ${records.length} record(s), ${filled} meta field(s) filled`;
}

function syncItems(regId: string, json: Record<string, unknown>): string {
  const records = json.items as ItemInput[];
  const specsDoc = read(join(CH, "item-specs.yaml"));
  const specsMap = specsDoc.get("items") as YAMLMap;
  const langDoc = read(join(LANG, "items.yaml"));
  const langMap = langDoc.get("items") as YAMLMap;
  const regDoc = read(join(CH, regId, "items.yaml"));
  let filled = 0;
  for (const rec of records) {
    const id = itemId(rec);
    filled += applyFill(specsDoc, ensureEntry(specsDoc, specsMap, id), itemStructuralFields(rec));
    applyFill(langDoc, ensureEntry(langDoc, langMap, id), itemEnName(rec));
  }
  unionSeq(regDoc, regDoc.contents as YAMLMap, "items", records.map(itemId));
  write(join(CH, "item-specs.yaml"), specsDoc);
  write(join(LANG, "items.yaml"), langDoc);
  write(join(CH, regId, "items.yaml"), regDoc);
  return `items: ${records.length} record(s), ${filled} structural field(s) filled`;
}

function syncAbilities(_regId: string, json: Record<string, unknown>): string {
  const records = json.abilities as { name: string }[];
  const specsDoc = read(join(CH, "ability-specs.yaml"));
  const langDoc = read(join(LANG, "abilities.yaml"));
  const langMap = langDoc.get("abilities") as YAMLMap;
  unionSeq(specsDoc, specsDoc.contents as YAMLMap, "abilities", records.map(abilityId));
  for (const rec of records) {
    applyFill(langDoc, ensureEntry(langDoc, langMap, abilityId(rec)), abilityEnName(rec));
  }
  write(join(CH, "ability-specs.yaml"), specsDoc);
  write(join(LANG, "abilities.yaml"), langDoc);
  return `abilities: ${records.length} id(s)`;
}

function syncMega(regId: string, json: Record<string, unknown>): string {
  const records = json.mega as MegaInput[];
  const specsDoc = read(join(CH, "mega-specs.yaml"));
  const specsMap = specsDoc.get("mega") as YAMLMap;
  const langDoc = read(join(LANG, "mega.yaml"));
  const langMap = langDoc.get("mega") as YAMLMap;
  const speciesDoc = read(join(CH, "species-specs.yaml"));
  const speciesMap = speciesDoc.get("species") as YAMLMap;
  const regDoc = read(join(CH, regId, "mega.yaml"));
  const regMap = regDoc.get("mega") as YAMLMap;

  let filled = 0;
  for (const rec of records) {
    const id = megaId(rec);
    filled += applyFill(specsDoc, ensureEntry(specsDoc, specsMap, id), megaStructuralFields(rec));
    applyFill(langDoc, ensureEntry(langDoc, langMap, id), megaEnName(rec));
  }
  // base→[mega id] を species-specs.megaEvolvesTo と <reg>/mega.yaml へ。
  const byBase = groupMegaByBase(records);
  for (const [base, megaIds] of Object.entries(byBase)) {
    const baseNode = mapEntry(speciesMap, base);
    if (baseNode) unionSeq(speciesDoc, baseNode, "megaEvolvesTo", megaIds);
    unionSeq(regDoc, ensureEntry(regDoc, regMap, base), base, megaIds);
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
    `Usage: node scripts/sync-showdown.ts <dataset> <regId>\n  dataset=${Object.keys(SYNCERS).join("|")} regId=m-a|m-b`,
  );
  process.exit(1);
}
const summary = SYNCERS[dataset](regId, loadJson(regId, dataset));
console.log(`[sync-showdown] ${regId} ${summary}`);
