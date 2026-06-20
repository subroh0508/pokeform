/**
 * generate.ts — `data/champions/`（構造 specs・skill 著述）+ `data/languages/`（名前・ゲーム非依存）を
 * 変換して `src/generated/`（コミット）へ型 + 値を出力する。vendor 方式（ADR 0012）の生成段。
 * **PokeAPI 取得キャッシュは一切読まない**（構造データ SoT も specs YAML へ移設済み・ADR 0027/0035）。
 * キャッシュ → specs/languages の転記は専任 `scripts/materialize.ts` が担い、generate は YAML のみを変換する。
 *
 * レイアウト（ADR 0035/0036・3 軸直交 = 構造 specs / 名前 languages / レギュ解禁 per-reg）:
 *   champions/{species,mega,item,ability,move,type}-specs.ts（構造・name 無し）
 *   champions/<reg>/{index,species,items,mega,species-moves}.ts（per-reg・index が speciesDex を合成）
 *   champions/index.ts（regulationDex 集約）
 *   languages/{species,mega,items,moves,abilities,types}.ts（id→{ id, name:{ ja, en } }）+ index.ts
 *
 * 各 Dex は `as const satisfies Record<string, XxxBase>` から型を派生（値と型を単一ソース化・
 * [[type-conventions]]）。reg-aware 型機構（`ValidMove<R,S,M>` 等）は per-reg `index.ts` が base/mega specs +
 * species-moves + per-reg mega を**実行時合成**した narrow リテラル `speciesDex` から成立する（ADR 0021/0024）。
 * 生成後に Biome 整形して機械ゲート（biome check）と一致させる。手書き編集しない（YAML を直し再生成する）。
 *
 * 実行: `pnpm generate:data`（ネットワーク不要・決定論的・raw 非依存）。
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), "..");
const CH = join(ROOT, "data", "champions");
const LANG = join(ROOT, "data", "languages");
const OUT = join(ROOT, "src", "generated");
const CHOUT = join(OUT, "champions");
const LANGOUT = join(OUT, "languages");

interface NamePair {
  ja: string;
  en: string;
}
interface Stats {
  H: number;
  A: number;
  B: number;
  C: number;
  D: number;
  S: number;
}
interface SpeciesSpecYaml {
  dex: number;
  types: string[];
  stats: Stats;
  abilities: string[];
  megaEvolvesTo?: string[];
}
interface MegaSpecYaml {
  dex: number;
  types: string[];
  stats: Stats;
  ability: string;
  baseSpecies: string;
}
interface ItemSpecYaml {
  category?: string;
  megaStoneFor?: string;
  megaSpecies?: string;
}
interface MoveStatsYaml {
  type: string;
  damageClass: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
}
interface RegIndexYaml {
  period: { start: string; end: string | null };
}

const rd = <T>(file: string): T => parseYaml(readFileSync(file, "utf8")) as T;

/** オブジェクトを TS リテラルとして直列化（Biome が後段で整形する）。 */
const lit = (value: unknown): string => JSON.stringify(value, null, 2);

// --- 入力（構造 specs・data/champions） --------------------------------------
const speciesSpecs = rd<{ species: Record<string, SpeciesSpecYaml> }>(
  join(CH, "species-specs.yaml"),
).species;
const megaSpecs = rd<{ mega: Record<string, MegaSpecYaml> }>(join(CH, "mega-specs.yaml")).mega;
const itemSpecs = rd<{ items: Record<string, ItemSpecYaml> }>(join(CH, "item-specs.yaml")).items;
const abilityList = rd<{ abilities: string[] }>(join(CH, "ability-specs.yaml")).abilities;
const moveSpecs = rd<{ moves: Record<string, MoveStatsYaml> }>(join(CH, "move-specs.yaml")).moves;
const typeSpecs = rd<{ types: Record<string, { damageTo?: Record<string, number> }> }>(
  join(CH, "type-specs.yaml"),
).types;

// --- 入力（名前 languages・data/languages） ----------------------------------
const langSpecies = rd<{ species: Record<string, NamePair> }>(join(LANG, "species.yaml")).species;
const langMega = rd<{ mega: Record<string, NamePair> }>(join(LANG, "mega.yaml")).mega;
const langItems = rd<{ items: Record<string, NamePair> }>(join(LANG, "items.yaml")).items;
const langMoves = rd<{ moves: Record<string, NamePair> }>(join(LANG, "moves.yaml")).moves;
const langAbilities = rd<{ abilities: Record<string, NamePair> }>(
  join(LANG, "abilities.yaml"),
).abilities;
const langTypes = rd<{ types: Record<string, NamePair> }>(join(LANG, "types.yaml")).types;
// レギュ名は languages の SoT（id = `<game>-<reg>`・例 champions-m-a）。specs に id を持たないため
// 突き合わせは regs 構築後（解禁ディレクトリから導出した reg id 集合）に行う。
const langRegulations = rd<{ regulations: Record<string, NamePair> }>(
  join(LANG, "regulations.yaml"),
).regulations;

const TYPES = Object.keys(typeSpecs);
const abilitySet = new Set(abilityList);

// --- authoring ゲート: 名前突き合わせ（languages の id 集合 = specs の id 集合・ja/en 完備） ---------
const requireNames = (
  kind: string,
  ids: readonly string[],
  names: Record<string, NamePair>,
): void => {
  const nameIds = new Set(Object.keys(names));
  for (const id of ids) {
    const n = names[id];
    if (!n) throw new Error(`languages/${kind}: '${id}' has no name entry (name SoT is languages)`);
    if (!n.ja || !n.en) throw new Error(`languages/${kind}: '${id}' missing ja/en`);
    nameIds.delete(id);
  }
  if (nameIds.size > 0) {
    throw new Error(`languages/${kind}: orphan name ids without spec: ${[...nameIds].join(", ")}`);
  }
};
requireNames("species", Object.keys(speciesSpecs), langSpecies);
requireNames("mega", Object.keys(megaSpecs), langMega);
requireNames("items", Object.keys(itemSpecs), langItems);
requireNames("moves", Object.keys(moveSpecs), langMoves);
requireNames("abilities", abilityList, langAbilities);
requireNames("types", TYPES, langTypes);

// 参照整合: 種族 / メガの特性が ability 集合に存在するか（append-only catalog の担保）。
for (const [id, s] of Object.entries(speciesSpecs)) {
  for (const a of s.abilities) {
    if (!abilitySet.has(a)) throw new Error(`species '${id}' ability '${a}' not in ability-specs`);
  }
}
for (const [id, m] of Object.entries(megaSpecs)) {
  if (!abilitySet.has(m.ability)) {
    throw new Error(`mega '${id}' ability '${m.ability}' not in ability-specs`);
  }
}

/** 能力ポイント表記 H/A/B/C/D/S を生成形（hp/attack/...）へ写す。 */
const toBaseStats = (s: Stats): Record<string, number> => ({
  hp: s.H,
  attack: s.A,
  defense: s.B,
  spAttack: s.C,
  spDefense: s.D,
  speed: s.S,
});

// --- champions/species-specs ------------------------------------------------
const speciesSpecEntries: Record<string, unknown> = {};
for (const [id, s] of Object.entries(speciesSpecs)) {
  const e: Record<string, unknown> = {
    dex: s.dex,
    id,
    types: s.types,
    baseStats: toBaseStats(s.stats),
    abilities: s.abilities,
  };
  if (s.megaEvolvesTo && s.megaEvolvesTo.length > 0) e.megaEvolvesTo = s.megaEvolvesTo;
  speciesSpecEntries[id] = e;
}

// --- champions/mega-specs ---------------------------------------------------
const megaSpecEntries: Record<string, unknown> = {};
for (const [id, m] of Object.entries(megaSpecs)) {
  megaSpecEntries[id] = {
    dex: m.dex,
    id,
    types: m.types,
    baseStats: toBaseStats(m.stats),
    ability: m.ability,
    baseSpecies: m.baseSpecies,
  };
}

// --- champions/item-specs ---------------------------------------------------
const itemSpecEntries: Record<string, unknown> = {};
for (const [id, meta] of Object.entries(itemSpecs)) {
  const e: Record<string, unknown> = { id };
  if (meta.category) e.category = meta.category;
  if (meta.megaStoneFor) e.megaStoneFor = meta.megaStoneFor;
  if (meta.megaSpecies) e.megaSpecies = meta.megaSpecies;
  itemSpecEntries[id] = e;
}

// --- champions/ability-specs ------------------------------------------------
const abilitySpecEntries: Record<string, unknown> = {};
for (const a of [...abilityList].sort()) abilitySpecEntries[a] = { id: a };

// --- champions/move-specs (per-game 技メタ・Champions 固有値・ADR 0034) ---------
const moveSpecEntries: Record<string, unknown> = {};
for (const [m, meta] of Object.entries(moveSpecs)) {
  moveSpecEntries[m] = {
    type: meta.type,
    damageClass: meta.damageClass,
    power: meta.power ?? null,
    accuracy: meta.accuracy ?? null,
    pp: meta.pp,
    priority: meta.priority,
  };
}

// --- champions/type-specs (全 18・非 1.0 のみ記録された damageTo を 1.0 補完) ------
const typeSpecEntries: Record<string, unknown> = {};
for (const t of TYPES) {
  const to: Record<string, number> = {};
  for (const d of TYPES) to[d] = 1;
  for (const [d, m] of Object.entries(typeSpecs[t]?.damageTo ?? {})) to[d] = m;
  typeSpecEntries[t] = { id: t, damageTo: to };
}

// --- languages（forward マップ id→{ id, name }） ------------------------------
const nameEntries = (m: Record<string, NamePair>): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const [id, n] of Object.entries(m)) out[id] = { id, name: { en: n.en, ja: n.ja } };
  return out;
};

// --- regulations（per-reg・ゲームサブディレクトリ）---------------------------
// 安定 id は `<game>-<reg>`（dir `champions/m-a` → `champions-m-a`）。reg 共有ファイル（reg でない）はない
// （技メタは move-specs に移行済み）。各 reg dir は index/species/items/mega/species-moves を持つ。
const REG_GAMES = readdirSync(CH, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .filter((name) => {
    // reg dir のみ（index.yaml を持つ）。specs/languages は CH 直下のファイル・LANG は別ツリー。
    try {
      return readdirSync(join(CH, name)).includes("index.yaml");
    } catch {
      return false;
    }
  })
  .sort();

interface RegData {
  id: string;
  dir: string;
  game: string;
  reg: string;
  meta: RegIndexYaml;
  species: string[];
  items: string[];
  mega: Record<string, string[]>;
  speciesMoves: Record<string, string[]>;
}
const GAME = "champions";
const regs: RegData[] = REG_GAMES.map((reg) => {
  const dir = join(CH, reg);
  return {
    id: `${GAME}-${reg}`,
    dir,
    game: GAME,
    reg,
    meta: rd<RegIndexYaml>(join(dir, "index.yaml")),
    species: rd<{ species: string[] }>(join(dir, "species.yaml")).species,
    items: rd<{ items: string[] }>(join(dir, "items.yaml")).items,
    mega: rd<{ mega: Record<string, string[]> }>(join(dir, "mega.yaml")).mega ?? {},
    speciesMoves: rd<{ moves: Record<string, string[]> }>(join(dir, "species-moves.yaml")).moves,
  };
});

// 参照整合（解禁 id が catalog に存在・append-only マスターの担保）。
const speciesIdSet = new Set(Object.keys(speciesSpecs));
const megaIdSet = new Set(Object.keys(megaSpecs));
const itemIdSet = new Set(Object.keys(itemSpecs));
const moveIdSet = new Set(Object.keys(moveSpecs));
for (const r of regs) {
  const check = (kind: string, ids: readonly string[], pool: Set<string>): void => {
    for (const v of ids) {
      if (!pool.has(v)) throw new Error(`regulation '${r.id}' ${kind} '${v}' not in catalog`);
    }
  };
  check("species", r.species, speciesIdSet);
  check("items", r.items, itemIdSet);
  for (const [sid, ms] of Object.entries(r.mega)) {
    if (!speciesIdSet.has(sid))
      throw new Error(`regulation '${r.id}' mega base '${sid}' not roster`);
    check("mega", ms, megaIdSet);
  }
  for (const [sid, mv] of Object.entries(r.speciesMoves)) {
    if (!speciesIdSet.has(sid))
      throw new Error(`regulation '${r.id}' moves species '${sid}' unknown`);
    check("moves", mv, moveIdSet);
  }
}

// レギュ名の突き合わせ（languages/regulations の id 集合 = reg id 集合・ja/en 完備）。
requireNames(
  "regulations",
  regs.map((r) => r.id),
  langRegulations,
);

/** プロパティアクセス式を組む（識別子なら dot・ハイフン等を含むなら bracket・biome useLiteralKeys 整合）。 */
const acc = (obj: string, key: string): string =>
  /^[A-Za-z_$][\w$]*$/.test(key) ? `${obj}.${key}` : `${obj}[${JSON.stringify(key)}]`;

/** "champions-m-a" -> "championsMA"（per-reg const 名）。 */
const camel = (id: string): string =>
  id
    .split("-")
    .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join("");

// --- emit -------------------------------------------------------------------
mkdirSync(CHOUT, { recursive: true });
mkdirSync(LANGOUT, { recursive: true });
const header =
  "// 生成物（scripts/generate.ts 出力）。手書き編集しない。data/champions・data/languages を直し再生成する。\n";
const emit = (file: string, body: string): void => {
  const abs = join(OUT, file);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, header + body);
};

// champions/*-specs.ts
emit(
  join("champions", "species-specs.ts"),
  `import type { SpeciesSpec } from "../../types/species.ts";\n\nexport const speciesSpecsDex = ${lit(speciesSpecEntries)} as const satisfies Record<string, SpeciesSpec>;\n\nexport type SpeciesSpecsDex = typeof speciesSpecsDex;\nexport type SpeciesSpecId = keyof SpeciesSpecsDex;\n`,
);
emit(
  join("champions", "mega-specs.ts"),
  `import type { MegaSpec } from "../../types/species.ts";\n\nexport const megaSpecsDex = ${lit(megaSpecEntries)} as const satisfies Record<string, MegaSpec>;\n\nexport type MegaSpecsDex = typeof megaSpecsDex;\nexport type MegaSpecId = keyof MegaSpecsDex;\n`,
);
emit(
  join("champions", "item-specs.ts"),
  `import type { Assignable } from "../../types/assert.ts";\nimport type { ItemBase } from "../../types/item.ts";\n\nexport const itemSpecsDex = ${lit(itemSpecEntries)} as const;\n\nexport type ItemSpecsDex = typeof itemSpecsDex;\nexport type ItemId = keyof ItemSpecsDex;\n\n// 適合検証（megaSpecies が派生 SpeciesId を指すため inline satisfies を避け分離する）。\nexport type _ItemConforms = Assignable<Record<string, ItemBase>, ItemSpecsDex>;\n`,
);
emit(
  join("champions", "ability-specs.ts"),
  `import type { AbilityBase } from "../../types/ability.ts";\n\nexport const abilitySpecsDex = ${lit(abilitySpecEntries)} as const satisfies Record<string, AbilityBase>;\n\nexport type AbilitySpecsDex = typeof abilitySpecsDex;\nexport type AbilityId = keyof AbilitySpecsDex;\n`,
);
emit(
  join("champions", "move-specs.ts"),
  `import type { MoveStats } from "../../types/move.ts";\n\nexport const moveSpecsDex = ${lit(moveSpecEntries)} as const satisfies Record<string, MoveStats>;\n\nexport type MoveSpecsDex = typeof moveSpecsDex;\nexport type MoveId = keyof MoveSpecsDex;\n`,
);
emit(
  join("champions", "type-specs.ts"),
  `import type { TypeSpec } from "../../types/type-chart.ts";\n\nexport const typeSpecsDex = ${lit(typeSpecEntries)} as const satisfies Record<string, TypeSpec>;\n\nexport type TypeSpecsDex = typeof typeSpecsDex;\n`,
);

// languages/*.ts
const langFiles: [string, string, Record<string, NamePair>][] = [
  ["species", "speciesNames", langSpecies],
  ["mega", "megaNames", langMega],
  ["items", "itemNames", langItems],
  ["moves", "moveNames", langMoves],
  ["abilities", "abilityNames", langAbilities],
  ["types", "typeNames", langTypes],
  ["regulations", "regulationNames", langRegulations],
];
for (const [file, name, map] of langFiles) {
  emit(
    join("languages", `${file}.ts`),
    `import type { NameEntry } from "../../types/name.ts";\n\nexport const ${name} = ${lit(nameEntries(map))} as const satisfies Record<string, NameEntry>;\n\nexport type ${name.charAt(0).toUpperCase() + name.slice(1)} = typeof ${name};\n`,
  );
}
{
  const imports = langFiles
    .map(([file, name]) => `import { ${name} } from "./${file}.ts";`)
    .join("\n");
  const names = langFiles.map(([, name]) => name);
  emit(
    join("languages", "index.ts"),
    `${imports}\n\nexport { ${names.join(", ")} };\n\n// base + メガ名を統合した forward マップ（種族表示名の実行時ルックアップ用）。\nexport const speciesNamesAll = { ...speciesNames, ...megaNames };\n`,
  );
}

// メガ可能種 → 対応メガストーン id タプルの決定論導出（item-specs の megaSpecies リンク・Phase 6）。
// メガ形態 id（charizard-mega-x 等）→ ストーン id（charizardite-x 等）の逆引きを 1 度だけ構築する。
const stonesByMegaSpecies = new Map<string, string[]>();
for (const [iid, meta] of Object.entries(itemSpecs)) {
  if (meta.megaSpecies) {
    const arr = stonesByMegaSpecies.get(meta.megaSpecies) ?? [];
    arr.push(iid);
    stonesByMegaSpecies.set(meta.megaSpecies, arr);
  }
}
// per-reg 解禁メガ形態（r.mega[sid]）に対応するストーン群を引く。欠落は fail-fast（空タプル＝
// 「どの持ち物も不可」の不正状態を防ぐ）。reg の解禁プールに無いストーンも fail-fast（データ不整合）。
const megaStonesFor = (r: RegData, sid: string, megaIds: readonly string[]): string[] => {
  const stones = [...new Set(megaIds.flatMap((mid) => stonesByMegaSpecies.get(mid) ?? []))].sort();
  if (stones.length === 0) {
    throw new Error(
      `regulation '${r.id}' mega species '${sid}' has no mega stone (item-specs megaSpecies link missing)`,
    );
  }
  const regItems = new Set(r.items);
  for (const s of stones) {
    if (!regItems.has(s)) {
      throw new Error(`regulation '${r.id}' mega stone '${s}' for '${sid}' not in reg items pool`);
    }
  }
  return stones;
};

// champions/<reg>/{species,items,mega,species-moves,index}.ts
for (const r of regs) {
  const dir = join("champions", r.reg);
  emit(join(dir, "species.ts"), `export const species = ${lit(r.species)} as const;\n`);
  emit(join(dir, "items.ts"), `export const items = ${lit(r.items)} as const;\n`);
  emit(join(dir, "mega.ts"), `export const mega = ${lit(r.mega)} as const;\n`);
  emit(
    join(dir, "species-moves.ts"),
    `export const speciesMoves = ${lit(r.speciesMoves)} as const;\n`,
  );

  // index.ts: base/mega specs + species-moves + per-reg mega を実行時合成して speciesDex を作る。
  // narrow リテラル（reg-aware 型機構の素材）は spread 合成で保たれる（tsc 検証済み）。
  // base 種族エントリは spread でなく明示フィールド参照で組む（global megaEvolvesTo の漏れを避け、per-reg
  // mega のみを megaEvolvesTo にする・ADR 0024。narrow リテラルは明示参照でも保たれる・tsc 検証済み）。
  const baseLines = r.species.map((sid) => {
    const k = JSON.stringify(sid);
    const sp = acc("speciesSpecsDex", sid);
    const megaIds = r.mega[sid];
    const isMegaCapable = megaIds && megaIds.length > 0;
    const megaPart = isMegaCapable ? `, megaEvolvesTo: ${acc("mega", sid)}` : "";
    // メガ可能種（per-reg mega を持つ base 種族）の items は対応メガストーンのタプルに型制約する
    // （個体が他持ち物を持つと ItemNotHoldableBy ブランドエラー・Phase 6）。非メガ種は従来どおり
    // "any"（reg 解禁プール全件・HoldableItems が接続する）。
    const itemsLit = isMegaCapable ? lit(megaStonesFor(r, sid, megaIds)) : '"any"';
    return `  ${k}: { id: ${sp}.id, dex: ${sp}.dex, types: ${sp}.types, baseStats: ${sp}.baseStats, abilities: ${sp}.abilities, moves: ${acc("speciesMoves", sid)}, items: ${itemsLit}${megaPart} },`;
  });
  const megaLines: string[] = [];
  for (const [sid, ms] of Object.entries(r.mega)) {
    for (const mid of ms) {
      const k = JSON.stringify(mid);
      const mp = acc("megaSpecsDex", mid);
      megaLines.push(
        `  ${k}: { id: ${mp}.id, dex: ${mp}.dex, types: ${mp}.types, baseStats: ${mp}.baseStats, abilities: [${mp}.ability], moves: ${acc("speciesMoves", sid)}, items: "any" },`,
      );
    }
  }
  const speciesDexBody = `{\n${[...baseLines, ...megaLines].join("\n")}\n}`;
  // レギュ名は languages（regulationNames）由来で合成（名前 SoT は languages・ADR 0035）。
  const periodLit = lit({ start: r.meta.period.start, end: r.meta.period.end ?? null });
  const metaLit = `{\n  id: ${JSON.stringify(r.id)},\n  name: ${acc("regulationNames", r.id)}.name,\n  period: ${periodLit},\n  species,\n  items,\n  mega: Object.values(mega).flat(),\n  speciesDex,\n}`;
  emit(
    join(dir, "index.ts"),
    `import type { RegulationBase } from "../../../types/regulation.ts";\n` +
      `import type { PerRegSpecies } from "../../../types/species.ts";\n` +
      `import { regulationNames } from "../../languages/regulations.ts";\n` +
      `import { megaSpecsDex } from "../mega-specs.ts";\n` +
      `import { speciesSpecsDex } from "../species-specs.ts";\n` +
      `import { items } from "./items.ts";\n` +
      `import { mega } from "./mega.ts";\n` +
      `import { speciesMoves } from "./species-moves.ts";\n` +
      `import { species } from "./species.ts";\n\n` +
      `export { species, items, mega, speciesMoves };\n\n` +
      `export const speciesDex = ${speciesDexBody} as const satisfies Record<string, PerRegSpecies>;\n\n` +
      `export type SpeciesDex = typeof speciesDex;\nexport type SpeciesId = keyof SpeciesDex;\n\n` +
      `export const ${camel(r.id)} = ${metaLit} as const satisfies RegulationBase;\n`,
  );
}

// champions/index.ts: regulationDex 集約。
{
  const imports = regs
    .map((r) => `import { ${camel(r.id)} } from "./${r.reg}/index.ts";`)
    .join("\n");
  const members = regs.map((r) => `  ${JSON.stringify(r.id)}: ${camel(r.id)},`).join("\n");
  emit(
    join("champions", "index.ts"),
    `${imports}\n\nexport const regulationDex = {\n${members}\n} as const;\n\nexport type RegulationDex = typeof regulationDex;\nexport type RegulationId = keyof RegulationDex;\n`,
  );
}

// Biome で整形して機械ゲート（biome check）と一致させる。
execFileSync(
  "node",
  [join(ROOT, "node_modules", "@biomejs", "biome", "bin", "biome"), "check", "--write", OUT],
  { cwd: ROOT, stdio: "inherit" },
);

console.log(
  `[generate] wrote ${Object.keys(speciesSpecs).length} species + ${Object.keys(megaSpecs).length} mega, ${Object.keys(moveSpecs).length} moves, ${TYPES.length} types, ${regs.length} regulations`,
);
