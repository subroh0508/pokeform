/**
 * serebii-to-catalog.ts — `scrape-serebii` の中間 JSON（種族 = `ParsedSpecies` / 持ち物 = `ParsedItems`）を
 * 新ツリー（`data/champions/*-specs.yaml` 構造 + `data/languages/*.yaml` 名前 + `data/champions/<reg>/*` 解禁）へ
 * **転記**する薄い配線。抽出・変換ロジックは `src/codegen/serebii/to-catalog.ts`（純関数・テスト100%）に委譲し、
 * 本スクリプトは fs / YAML I/O のみ（coverage 除外・[[testing]]）。
 *
 * 設計（層分離・ADR 0035/0036）:
 * - **append/既存尊重**: 既存 skill-authored 値は上書きせず未設定欄のみ転記（`planFields` 再利用・conflict 提示・
 *   ADR 0027）。構造データ（dex/types/stats/abilities/category）と日本語名 ja は**空で残し**、後段 `materialize`
 *   が埋める。本スクリプトは Serebii 由来の権威データ（技メタ / メガストーンのメガ先 / per-reg 解禁）と en・
 *   エンティティ key を書く。
 * - **3 軸直交の書き分け**: 構造 = `*-specs.yaml`（key を作り materialize に委ねる）/ 名前 en = `languages/*.yaml`
 *   / 解禁 = `<reg>/{species,items,mega,species-moves}.yaml`。
 * - **per-reg moves は既存種族エントリを保護**（中間 JSON が部分集合でも上書き縮小しない・新規種族のみ全件著述）。
 * - **メガ linking は決定論で自動著述**（`megaSpeciesId`・base slug 既知 + 枝サフィックスから `<slug>-mega[-x|-y]`）。
 *   `Mega ` 接頭の無い特殊形（Primal 等）は escalation（自動著述しない）。
 *
 * 使い方（実行順: `fetch-serebii` → `scrape-serebii` → 本スクリプト → `fetch:data` → `materialize` →
 * `check:regulation` → `generate:data`）:
 * - `node scripts/serebii-to-catalog.ts species <slug> <regId> [jsonPath]`
 * - `node scripts/serebii-to-catalog.ts items <regId> [jsonPath]`
 * - `node scripts/serebii-to-catalog.ts move-master [jsonPath]`（技専用ページの技マスター JSON → move-specs）
 *   `jsonPath` 省略 / `-` で stdin から中間 JSON を読む。
 *
 * **技マスター転記は move-specs の技メタを上書き是正する**（append/既存尊重ではなく後勝ち・ADR 0037）。技専用
 * ページが Champions 準拠の威力 / PP / priority を一次ソースで持つため、前作値の残存を根絶するには上書きが必要。
 * 技名 en（`languages/moves.yaml`）は名前 SoT なので append/既存尊重のままにする。
 */
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type Document, parseDocument, type YAMLMap, type YAMLSeq } from "yaml";
import { planFields } from "../src/codegen/materialize.ts";
import type { ParsedItems, ParsedMoveMaster, ParsedSpecies } from "../src/codegen/serebii/parse.ts";
import {
  abilityEnFromId,
  abilityIds,
  itemCatalogFields,
  megaAuthoring,
  moveMasterNameFields,
  moveMasterStatsFields,
  moveNameFields,
  moveStatsFields,
  regMoveIds,
  sortedUnion,
  speciesCatalogFields,
} from "../src/codegen/serebii/to-catalog.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CH = join(ROOT, "data", "champions");
const LANG = join(ROOT, "data", "languages");

let conflictCount = 0;
const warn = (msg: string): void => process.stderr.write(`[serebii-to-catalog] ${msg}\n`);

/** 中間 JSON を file / stdin（`-` / 省略）から読む。 */
function readJson<T>(path: string | undefined): T {
  const text = path && path !== "-" ? readFileSync(path, "utf8") : readFileSync(0, "utf8");
  return JSON.parse(text) as T;
}

/** regId（`champions-m-a` または `m-a`）→ レギュディレクトリ（`data/champions/<reg>`）。実在を確認する。 */
function regDir(regId: string): string {
  const dashIndex = regId.indexOf("-");
  const candidates: string[] = [];
  if (dashIndex > 0) candidates.push(join(CH, regId.slice(dashIndex + 1)));
  candidates.push(join(CH, regId));
  for (const c of candidates) {
    if (existsSync(c) && statSync(c).isDirectory()) return c;
  }
  throw new Error(`regulation dir not found: ${regId} (looked for ${candidates.join(" / ")})`);
}

/** doc を読み込む（コメント保持の parseDocument）。 */
const loadDoc = (file: string): Document => parseDocument(readFileSync(file, "utf8"));

/**
 * `map` 配下の `id` エントリへ `fresh` を append/既存尊重で適用する。新規 key は block の空 map から作って
 * fill する。`fresh` が空でも空 map（`{}`）を作るため、構造 placeholder（materialize 委譲）用に許容する。
 */
function upsert(doc: Document, map: YAMLMap, id: string, fresh: Record<string, unknown>): boolean {
  let node = map.get(id) as YAMLMap | undefined;
  let changed = false;
  if (node === undefined) {
    if (Object.keys(fresh).length === 0) {
      // 構造 placeholder（fresh 空）= null 値で key だけ登録（materialize が後で構造を埋める・空 flow `{}` 回避）。
      map.set(id, doc.createNode(null));
      return true;
    }
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

/** 列（YAMLSeq）へ id を append（未登録のみ・昇順は維持しない＝既存順を尊重）。追加があれば true。 */
function appendToList(doc: Document, seq: YAMLSeq, id: string): boolean {
  const existing = (seq.toJS(doc) as string[]) ?? [];
  if (existing.includes(id)) return false;
  seq.add(doc.createNode(id));
  return true;
}

/** doc が変更されていれば書き戻す（無変更なら round-trip 再整形を避けて git diff を最小化）。 */
function writeIf(file: string, doc: Document, changed: boolean): void {
  if (changed) writeFileSync(file, doc.toString());
}

function transcribeSpecies(slug: string, regId: string, jsonPath: string | undefined): void {
  const p = readJson<ParsedSpecies>(jsonPath);
  const dir = regDir(regId);

  // メガ自動著述プラン（決定論変換・null は escalations へ分離・ADR 0024 のメガ運用）。
  const auth = megaAuthoring(slug, p);

  // --- 構造 placeholder（species-specs / mega-specs）: key を作り materialize に構造を委ねる ---
  const speciesSpecsFile = join(CH, "species-specs.yaml");
  const speciesSpecsDoc = loadDoc(speciesSpecsFile);
  const speciesSpecsMap = speciesSpecsDoc.get("species") as YAMLMap;
  let speciesSpecsChanged = upsert(speciesSpecsDoc, speciesSpecsMap, slug, {});
  // base の megaEvolvesTo（append-only union）。
  if (auth.ids.length > 0) {
    const node = speciesSpecsMap.get(slug, true) as YAMLMap | null;
    if (node && typeof node === "object" && "set" in node) {
      const cur = (node.toJS(speciesSpecsDoc) as { megaEvolvesTo?: string[] }).megaEvolvesTo ?? [];
      const merged = sortedUnion(cur, auth.ids);
      if (merged.length !== cur.length) {
        (node as YAMLMap).set("megaEvolvesTo", speciesSpecsDoc.createNode(merged));
        speciesSpecsChanged = true;
      }
    }
  }
  writeIf(speciesSpecsFile, speciesSpecsDoc, speciesSpecsChanged);

  const megaSpecsFile = join(CH, "mega-specs.yaml");
  const megaSpecsDoc = loadDoc(megaSpecsFile);
  const megaSpecsMap = megaSpecsDoc.get("mega") as YAMLMap;
  let megaSpecsChanged = false;
  for (const e of auth.speciesEntries) {
    // baseSpecies は決定論（slug）。dex/types/stats/ability は materialize / authoring が埋める。
    megaSpecsChanged =
      upsert(megaSpecsDoc, megaSpecsMap, e.id, { baseSpecies: slug }) || megaSpecsChanged;
  }
  writeIf(megaSpecsFile, megaSpecsDoc, megaSpecsChanged);

  // --- 名前 en（languages: species / mega） ---
  const langSpeciesFile = join(LANG, "species.yaml");
  const langSpeciesDoc = loadDoc(langSpeciesFile);
  const langSpeciesMap = langSpeciesDoc.get("species") as YAMLMap;
  const langSpeciesChanged = upsert(langSpeciesDoc, langSpeciesMap, slug, speciesCatalogFields(p));
  writeIf(langSpeciesFile, langSpeciesDoc, langSpeciesChanged);

  if (auth.speciesEntries.length > 0) {
    const langMegaFile = join(LANG, "mega.yaml");
    const langMegaDoc = loadDoc(langMegaFile);
    const langMegaMap = langMegaDoc.get("mega") as YAMLMap;
    let langMegaChanged = false;
    for (const e of auth.speciesEntries) {
      langMegaChanged = upsert(langMegaDoc, langMegaMap, e.id, { en: e.en }) || langMegaChanged;
    }
    writeIf(langMegaFile, langMegaDoc, langMegaChanged);
  }

  // --- 技名 en（languages/moves）+ 技メタ（move-specs・top-level・Champions 固有値・ADR 0034） ---
  const langMovesFile = join(LANG, "moves.yaml");
  const langMovesDoc = loadDoc(langMovesFile);
  const langMovesMap = langMovesDoc.get("moves") as YAMLMap;
  let langMovesChanged = false;
  for (const m of p.moves) {
    langMovesChanged =
      upsert(langMovesDoc, langMovesMap, m.id, { ...moveNameFields(m) }) || langMovesChanged;
  }
  writeIf(langMovesFile, langMovesDoc, langMovesChanged);

  const moveSpecsFile = join(CH, "move-specs.yaml");
  const moveSpecsDoc = loadDoc(moveSpecsFile);
  const moveSpecsMap = moveSpecsDoc.get("moves") as YAMLMap;
  let moveSpecsChanged = false;
  for (const m of p.moves) {
    moveSpecsChanged =
      upsert(moveSpecsDoc, moveSpecsMap, m.id, { ...moveStatsFields(m) }) || moveSpecsChanged;
  }
  writeIf(moveSpecsFile, moveSpecsDoc, moveSpecsChanged);

  // --- 特性: id を ability-specs（list）へ append + en を languages/abilities へ ---
  const abilitySpecsFile = join(CH, "ability-specs.yaml");
  const abilitySpecsDoc = loadDoc(abilitySpecsFile);
  const abilitySpecsSeq = abilitySpecsDoc.get("abilities") as YAMLSeq;
  const langAbilitiesFile = join(LANG, "abilities.yaml");
  const langAbilitiesDoc = loadDoc(langAbilitiesFile);
  const langAbilitiesMap = langAbilitiesDoc.get("abilities") as YAMLMap;
  let abilitySpecsChanged = false;
  let langAbilitiesChanged = false;
  for (const id of abilityIds(p)) {
    abilitySpecsChanged = appendToList(abilitySpecsDoc, abilitySpecsSeq, id) || abilitySpecsChanged;
    langAbilitiesChanged =
      upsert(langAbilitiesDoc, langAbilitiesMap, id, { en: abilityEnFromId(id) }) ||
      langAbilitiesChanged;
  }
  writeIf(abilitySpecsFile, abilitySpecsDoc, abilitySpecsChanged);
  writeIf(langAbilitiesFile, langAbilitiesDoc, langAbilitiesChanged);

  // --- per-reg: roster（species.yaml）+ per-species moves（species-moves.yaml）+ mega（mega.yaml） ---
  const rosterFile = join(dir, "species.yaml");
  const rosterDoc = loadDoc(rosterFile);
  const rosterSeq = rosterDoc.get("species") as YAMLSeq;
  const movesFile = join(dir, "species-moves.yaml");
  const movesDoc = loadDoc(movesFile);
  const movesMap = movesDoc.get("moves") as YAMLMap;
  if (movesMap.has(slug)) {
    warn(
      `reg ${regId}: species '${slug}' already allowed — leaving its moves/mega untouched (既存尊重)`,
    );
  } else {
    if (appendToList(rosterDoc, rosterSeq, slug)) writeFileSync(rosterFile, rosterDoc.toString());
    movesMap.set(slug, movesDoc.createNode(regMoveIds(p)));
    writeFileSync(movesFile, movesDoc.toString());
    if (auth.ids.length > 0) {
      const megaFile = join(dir, "mega.yaml");
      const megaDoc = loadDoc(megaFile);
      const megaMap = megaDoc.get("mega") as YAMLMap;
      megaMap.set(slug, megaDoc.createNode(auth.ids));
      writeFileSync(megaFile, megaDoc.toString());
    }
  }

  // --- 決定論変換できなかったメガ（Primal 等・非 `Mega ` 形）だけ escalation（自動著述しない） ---
  if (auth.escalations.length > 0) {
    warn(
      `species '${slug}' has non-deterministic mega form(s) ${JSON.stringify(auth.escalations)} — not auto-authored, escalate to authoring (Primal / non-'Mega ' forms)`,
    );
  }
}

/**
 * 技専用ページの技マスター中間 JSON を `move-specs.yaml`（技メタ・上書き是正）と `languages/moves.yaml`
 * （技名 en・append/既存尊重）へ転記する。move-specs は前作値が残るため、技メタ 6 項目を技マスター値で
 * **上書き**する（後勝ち・ADR 0037）。空 map（flow `{}`）を生まないよう block の map ノードを作って set する。
 *
 * 冪等・可視化のため: 既存値と一致するなら書き戻さない（round-trip 再整形ノイズ回避・他転記の `writeIf` と
 * 同方針）。既存 key が無い id は move-specs を**新規作成**するが、専用取得は基本「既存値の是正」なので新規作成は
 * 想定外（typo slug / どの reg にも属さない技）。orphan key は下流 `check:regulation` / `generate` の id 集合
 * 整合で顕在化するため、ここで warn して可視化する。
 */
function transcribeMoveMaster(jsonPath: string | undefined): void {
  const m = readJson<ParsedMoveMaster>(jsonPath);

  // --- 技メタ（move-specs・上書き是正・冪等書き戻し） ---
  const moveSpecsFile = join(CH, "move-specs.yaml");
  const moveSpecsDoc = loadDoc(moveSpecsFile);
  const moveSpecsMap = moveSpecsDoc.get("moves") as YAMLMap;
  const fresh = moveMasterStatsFields(m);
  const existingNode = moveSpecsMap.get(m.id) as YAMLMap | undefined;
  const existing = existingNode?.toJS(moveSpecsDoc) as Record<string, unknown> | undefined;
  if (existing === undefined) {
    warn(
      `move-master ${m.id}: NEW move-specs entry (no existing key — verify it belongs to a reg)`,
    );
  }
  const specsChanged = existing === undefined || JSON.stringify(existing) !== JSON.stringify(fresh);
  if (specsChanged) {
    moveSpecsMap.set(m.id, moveSpecsDoc.createNode(fresh));
    writeFileSync(moveSpecsFile, moveSpecsDoc.toString());
  }

  // --- 技名 en（languages/moves・append/既存尊重・名前 SoT は上書きしない） ---
  const langMovesFile = join(LANG, "moves.yaml");
  const langMovesDoc = loadDoc(langMovesFile);
  const langMovesMap = langMovesDoc.get("moves") as YAMLMap;
  const langChanged = upsert(langMovesDoc, langMovesMap, m.id, { ...moveMasterNameFields(m) });
  writeIf(langMovesFile, langMovesDoc, langChanged);

  warn(
    `move-master ${m.id}: move-specs ${specsChanged ? "overwritten" : "unchanged"}, languages en ${langChanged ? "added" : "kept"}`,
  );
}

function transcribeItems(regId: string, jsonPath: string | undefined): void {
  const parsed = readJson<ParsedItems>(jsonPath);
  const dir = regDir(regId);

  // --- item-specs（megaStoneFor / megaSpecies・category は materialize）+ languages/items（en） ---
  const itemSpecsFile = join(CH, "item-specs.yaml");
  const itemSpecsDoc = loadDoc(itemSpecsFile);
  const itemSpecsMap = itemSpecsDoc.get("items") as YAMLMap;
  const langItemsFile = join(LANG, "items.yaml");
  const langItemsDoc = loadDoc(langItemsFile);
  const langItemsMap = langItemsDoc.get("items") as YAMLMap;
  let itemSpecsChanged = false;
  let langItemsChanged = false;
  for (const it of parsed.items) {
    const { en, ...structural } = itemCatalogFields(it); // en → languages / 残り（megaStoneFor 等）→ specs
    itemSpecsChanged =
      upsert(itemSpecsDoc, itemSpecsMap, it.id, { ...structural }) || itemSpecsChanged;
    langItemsChanged = upsert(langItemsDoc, langItemsMap, it.id, { en }) || langItemsChanged;
  }
  writeIf(itemSpecsFile, itemSpecsDoc, itemSpecsChanged);
  writeIf(langItemsFile, langItemsDoc, langItemsChanged);

  // --- per-reg: items（list）へ union 追記（append-only・既存解禁を消さない） ---
  const itemsFile = join(dir, "items.yaml");
  const regDoc = loadDoc(itemsFile);
  const existing = (regDoc.toJS() as { items?: string[] }).items ?? [];
  const merged = sortedUnion(
    existing,
    parsed.items.map((it) => it.id),
  );
  if (merged.length !== existing.length) {
    regDoc.set("items", regDoc.createNode(merged));
    writeFileSync(itemsFile, regDoc.toString());
  }
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === "species" && rest[0] && rest[1]) {
  transcribeSpecies(rest[0], rest[1], rest[2]);
} else if (cmd === "items" && rest[0]) {
  transcribeItems(rest[0], rest[1]);
} else if (cmd === "move-master") {
  transcribeMoveMaster(rest[0]);
} else {
  process.stderr.write(
    "usage: serebii-to-catalog (species <slug> <regId> [jsonPath] | items <regId> [jsonPath] | move-master [jsonPath])\n",
  );
  process.exit(1);
}

warn(`done (${conflictCount} conflict(s))`);
