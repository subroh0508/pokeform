/**
 * serebii-to-catalog.ts — `scrape-serebii` の中間 JSON（種族 = `ParsedSpecies` / 持ち物 = `ParsedItems`）を
 * `data/champions/catalog/*.yaml` と `regulations/<game>/<reg>.yaml` へ**転記**する薄い配線。抽出・変換ロジックは
 * `src/codegen/serebii/to-catalog.ts`（純関数・テスト100%）に委譲し、本スクリプトは fs / YAML I/O のみ
 * （coverage 除外・[[testing]]）。
 *
 * 設計（層分離・本 phase の ADR）:
 * - **append/既存尊重**: 既存 skill-authored 値は上書きせず、未設定欄のみ転記する（`planFields` 再利用・
 *   差異は conflict 提示・ADR 0027）。構造データ（dex/types/stats/abilities/category）と日英名 ja は**空で
 *   残し**、後段 `materialize`（PokeAPI vendor）が埋める。本スクリプトは Serebii 由来の権威データ（技メタ /
 *   メガストーンのメガ先 / per-reg 解禁）と en・エンティティ key を書く。
 * - **per-reg moves（per-species）は既存種族エントリを保護**: 既に解禁種族として存在する場合はその `moves` を
 *   触らない（中間 JSON が部分集合でも上書き縮小しない）。新規種族のみ Serebii 全件で `moves` を著述する。
 * - **メガ linking は決定論で自動著述**: base slug は既知のため、Serebii のメガ名の枝サフィックス（`""`/`X`/`Y`）
 *   だけ拾えば `<baseslug>-mega[-x|-y]` を組める（`megaSpeciesId`）。megaLinks / メガ先種族エントリ / per-reg
 *   `mega` / メガストーンの `megaSpecies` を append/既存尊重で著述する。`Mega ` 接頭の無い特殊形（Primal 等）・
 *   未知 id だけ自動著述せず escalation（diagnostic）に残す（ADR 0031 を supersede）。
 *
 * 使い方（実行順: `fetch-serebii` → `scrape-serebii` → 本スクリプト → `fetch:data` → `materialize` →
 * `check:regulation` → `generate:data`）:
 * - `node scripts/serebii-to-catalog.ts species <slug> <regId> [jsonPath]`
 * - `node scripts/serebii-to-catalog.ts items <regId> [jsonPath]`
 *   `jsonPath` 省略 / `-` で stdin から中間 JSON を読む。
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type Document, parseDocument, type YAMLMap } from "yaml";
import { planFields } from "../src/codegen/materialize.ts";
import type { ParsedItems, ParsedSpecies } from "../src/codegen/serebii/parse.ts";
import {
  abilityEnFromId,
  abilityIds,
  itemCatalogFields,
  megaAuthoring,
  moveNameFields,
  moveStatsFields,
  regMoveIds,
  sortedUnion,
  speciesCatalogFields,
} from "../src/codegen/serebii/to-catalog.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CAT = join(ROOT, "data", "champions", "catalog");
const REG = join(ROOT, "data", "champions", "regulations");

let conflictCount = 0;
const warn = (msg: string): void => process.stderr.write(`[serebii-to-catalog] ${msg}\n`);

/** 中間 JSON を file / stdin（`-` / 省略）から読む。 */
function readJson<T>(path: string | undefined): T {
  const text = path && path !== "-" ? readFileSync(path, "utf8") : readFileSync(0, "utf8");
  return JSON.parse(text) as T;
}

/**
 * regId（`champions-m-a` または `m-a`）→ regulations ファイルパス。ゲームグルーピング後のレイアウト
 * `regulations/<game>/<reg>.yaml`（Phase 10）。`<game>-<reg>` 形式は `<game>/<reg>.yaml`、ゲーム省略形
 * （`m-a`）は champions ゲーム配下と解釈する。実在優先。
 */
function regPath(regId: string): string {
  // `champions-m-a` → ["champions", "m-a"] / `m-a` → champions ゲーム配下と解釈。
  const dashIndex = regId.indexOf("-");
  const candidates: string[] = [];
  if (dashIndex > 0) {
    const game = regId.slice(0, dashIndex);
    const reg = regId.slice(dashIndex + 1);
    candidates.push(join(REG, game, `${reg}.yaml`));
  }
  candidates.push(join(REG, "champions", `${regId}.yaml`));
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(`regulation not found: ${regId} (looked for ${candidates.join(" / ")})`);
}

/**
 * regId → ゲーム名（per-game 共有ファイル `regulations/<game>/moves.yaml` の置き場）。`regPath` と同じ解釈で、
 * `<game>-<reg>.yaml` が実在するならその `<game>`、省略形（`m-a` 等）は `champions` 既定。`indexOf("-")` の素朴
 * 分割は短縮形を `m` 等へ誤分割するため実在優先で解決する（regPath と一貫・Phase 11）。
 */
function regGame(regId: string): string {
  const dashIndex = regId.indexOf("-");
  if (dashIndex > 0) {
    const game = regId.slice(0, dashIndex);
    const reg = regId.slice(dashIndex + 1);
    if (existsSync(join(REG, game, `${reg}.yaml`))) return game;
  }
  return "champions";
}

/** doc を読み込む（コメント保持の parseDocument）。 */
const loadDoc = (file: string): Document => parseDocument(readFileSync(file, "utf8"));

/**
 * `map` 配下の `id` エントリへ `fresh` を append/既存尊重で適用する。新規 key は block の空 map から作って
 * fill する（`fresh` が非空のため `{}` flow にはならない）。fill / 新規作成があれば true。
 */
function upsert(doc: Document, map: YAMLMap, id: string, fresh: Record<string, unknown>): boolean {
  let node = map.get(id) as YAMLMap | undefined;
  let changed = false;
  if (node === undefined) {
    node = doc.createNode({}) as YAMLMap;
    map.set(id, node);
    changed = true;
  }
  const plan = planFields(node.toJS(doc) as Record<string, unknown>, fresh);
  for (const [key, value] of Object.entries(plan.fill)) {
    node.set(key, doc.createNode(value));
    changed = true;
  }
  for (const c of plan.conflicts) {
    conflictCount++;
    warn(
      `conflict ${id}.${String(c.key)}: keep ${JSON.stringify(c.existing)} (serebii=${JSON.stringify(c.fresh)})`,
    );
  }
  return changed;
}

/** doc が変更されていれば書き戻す（無変更なら round-trip 再整形を避けて git diff を最小化）。 */
function writeIf(file: string, doc: Document, changed: boolean): void {
  if (changed) writeFileSync(file, doc.toString());
}

function transcribeSpecies(slug: string, regId: string, jsonPath: string | undefined): void {
  const p = readJson<ParsedSpecies>(jsonPath);

  // メガ自動著述プラン（決定論変換・null は escalations へ分離・[ADR 0024] のメガ運用）。
  const auth = megaAuthoring(slug, p);

  // --- catalog: species（base）+ メガ先種族エントリ（en のみ・構造は materialize が後埋め）+ megaLinks ---
  const speciesFile = join(CAT, "species.yaml");
  const speciesDoc = loadDoc(speciesFile);
  const pokemon = speciesDoc.get("pokemon") as YAMLMap;
  let speciesChanged = upsert(speciesDoc, pokemon, slug, speciesCatalogFields(p));
  for (const e of auth.speciesEntries) {
    speciesChanged = upsert(speciesDoc, pokemon, e.id, { en: e.en }) || speciesChanged;
  }
  if (auth.ids.length > 0) {
    // megaLinks（top-level map）へ append-only union（既存メガ先を消さない）。
    let megaLinks = speciesDoc.get("megaLinks") as YAMLMap | undefined;
    if (megaLinks === undefined) {
      megaLinks = speciesDoc.createNode({}) as YAMLMap;
      speciesDoc.set("megaLinks", megaLinks);
      speciesChanged = true;
    }
    const links = megaLinks.toJS(speciesDoc) as Record<string, string[]>;
    const existing = links[slug] ?? [];
    const merged = sortedUnion(existing, auth.ids);
    if (merged.length !== existing.length) {
      megaLinks.set(slug, speciesDoc.createNode(merged));
      speciesChanged = true;
    }
  }
  writeIf(speciesFile, speciesDoc, speciesChanged);

  // 技名（id + en）は catalog/moves.yaml（名前はゲーム非依存・Phase 11）。
  const movesFile = join(CAT, "moves.yaml");
  const movesDoc = loadDoc(movesFile);
  const movesMap = movesDoc.get("moves") as YAMLMap;
  let movesChanged = false;
  for (const m of p.moves) {
    movesChanged = upsert(movesDoc, movesMap, m.id, { ...moveNameFields(m) }) || movesChanged;
  }
  writeIf(movesFile, movesDoc, movesChanged);

  // 技メタ（type/damageClass/power 等）は per-game の regulations/<game>/moves.yaml（Champions 固有値・ADR 0034）。
  const moveStatsFile = join(REG, regGame(regId), "moves.yaml");
  const moveStatsDoc = loadDoc(moveStatsFile);
  const moveStatsMap = moveStatsDoc.get("moves") as YAMLMap;
  let moveStatsChanged = false;
  for (const m of p.moves) {
    moveStatsChanged =
      upsert(moveStatsDoc, moveStatsMap, m.id, { ...moveStatsFields(m) }) || moveStatsChanged;
  }
  writeIf(moveStatsFile, moveStatsDoc, moveStatsChanged);

  const abilitiesFile = join(CAT, "abilities.yaml");
  const abilitiesDoc = loadDoc(abilitiesFile);
  const abilitiesMap = abilitiesDoc.get("abilities") as YAMLMap;
  let abilitiesChanged = false;
  for (const id of abilityIds(p)) {
    abilitiesChanged =
      upsert(abilitiesDoc, abilitiesMap, id, { en: abilityEnFromId(id) }) || abilitiesChanged;
  }
  writeIf(abilitiesFile, abilitiesDoc, abilitiesChanged);

  // --- regulation: per-species moves + mega[]（既存種族は保護・新規のみ全件著述） ---
  const file = regPath(regId);
  const regDoc = loadDoc(file);
  if (regDoc.has(slug)) {
    warn(
      `reg ${regId}: species '${slug}' already allowed — leaving its moves/mega untouched (既存尊重)`,
    );
  } else {
    const entry: Record<string, unknown> = { moves: regMoveIds(p) };
    if (auth.ids.length > 0) entry.mega = auth.ids;
    regDoc.set(slug, regDoc.createNode(entry));
    writeFileSync(file, regDoc.toString());
  }

  // --- 決定論変換できなかったメガ（Primal 等・非 `Mega ` 形）だけ escalation（自動著述しない） ---
  if (auth.escalations.length > 0) {
    warn(
      `species '${slug}' has non-deterministic mega form(s) ${JSON.stringify(auth.escalations)} — not auto-authored, escalate to authoring (Primal / non-'Mega ' forms)`,
    );
  }
}

function transcribeItems(regId: string, jsonPath: string | undefined): void {
  const parsed = readJson<ParsedItems>(jsonPath);

  // --- catalog: items（en + megaStoneFor を転記・ja / category は materialize が埋める） ---
  const itemsFile = join(CAT, "items.yaml");
  const itemsDoc = loadDoc(itemsFile);
  const itemsMap = itemsDoc.get("items") as YAMLMap;
  let itemsChanged = false;
  for (const it of parsed.items) {
    itemsChanged = upsert(itemsDoc, itemsMap, it.id, { ...itemCatalogFields(it) }) || itemsChanged;
  }
  writeIf(itemsFile, itemsDoc, itemsChanged);

  // --- regulation: items 予約キーへ union 追記（append-only・既存解禁を消さない） ---
  const file = regPath(regId);
  const regDoc = loadDoc(file);
  const existing = (regDoc.toJS() as { items?: string[] }).items ?? [];
  const merged = sortedUnion(
    existing,
    parsed.items.map((it) => it.id),
  );
  if (merged.length !== existing.length) {
    regDoc.set("items", regDoc.createNode(merged));
    writeFileSync(file, regDoc.toString());
  }
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === "species" && rest[0] && rest[1]) {
  transcribeSpecies(rest[0], rest[1], rest[2]);
} else if (cmd === "items" && rest[0]) {
  transcribeItems(rest[0], rest[1]);
} else {
  process.stderr.write(
    "usage: serebii-to-catalog (species <slug> <regId> [jsonPath] | items <regId> [jsonPath])\n",
  );
  process.exit(1);
}

warn(`done (${conflictCount} conflict(s))`);
