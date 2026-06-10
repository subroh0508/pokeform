/**
 * generate.ts — `data/raw/`（PokeAPI キャッシュ）と `data/champions/`（手動）を合成し
 * `data/generated/`（コミット）へ型 + 値を出力する。vendor 方式（ADR 0012）の生成段。
 *
 * 出力: types / moves / abilities / items / species-base（reg 不変 base view）/ regulations（1 レギュ =
 * 1 ディレクトリ・per-reg 種族 dex を同梱）/ names。各 Dex は
 * `as const satisfies Record<string, XxxBase>` から `type XxxDex = typeof xxxDex` /
 * `XxxId = keyof XxxDex` を派生（値と型を単一ソース化・[[type-conventions]]）。生成後に
 * Biome で整形して機械ゲート（biome check）と一致させる。手書き編集しない（raw/champions を直す）。
 *
 * 実行: `pnpm generate:data`（fetch:data 後・ネットワーク不要・決定論的）。
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw");
const CH = join(ROOT, "data", "champions");
const OUT = join(ROOT, "data", "generated");

/** カタログ共通の日英名（名前の SoT は catalog YAML・Phase 10）。 */
interface NamePair {
  ja: string;
  en: string;
}
interface SpeciesCatalog {
  // id -> 日英名。種族値・タイプ・特性など構造データは引き続き data/raw 由来。
  pokemon: Record<string, NamePair>;
  // 1 base 種族 -> メガ先 SpeciesId の配列（1 種族複数メガを許容・ADR 0022）。
  megaLinks?: Record<string, string[]>;
}
interface MovesCatalog {
  // id -> 日英名。type / damageClass / power 等の構造データは data/raw 由来。
  moves: Record<string, NamePair>;
}
interface ItemsCatalog {
  // id -> 日英名 + megaStoneFor（旧 itemMeta を各エントリへ統合・Phase 10）。category は data/raw 由来。
  items: Record<string, NamePair & { megaStoneFor?: string }>;
}
interface AbilitiesCatalog {
  // id -> 日英名。生成 abilities.ts は id のみ（name は持たない）。
  abilities: Record<string, NamePair>;
}
interface TypesCatalog {
  // id -> 日英名 + 攻撃側相性倍率 damageTo（非 1.0 のみ記録・generate が 1.0 を補完・Phase 10）。
  types: Record<string, NamePair & { damageTo?: Record<string, number> }>;
}
/**
 * レギュレーション YAML（ADR 0022・block 記法）。`name` / `period` / `items` は予約キー。
 * それ以外のトップレベルキーは**種族 ID = 解禁種族**（キーの存在 = allow）で、値は `SpeciesAllow`。
 * 予約キーと種族キーを同階層で混在させるため、parse 後は `Record<string, unknown>` として読み、
 * 予約キーを `RESERVED_REG_KEYS` で仕分ける。
 */
interface SpeciesAllow {
  moves: string[];
  // メガ運用種族のメガ先 SpeciesId 配列（複数メガ可）。
  mega?: string[];
}
const RESERVED_REG_KEYS = new Set(["name", "period", "items"]);
/** レギュレーション YAML の種族 ID キー（予約キー以外）を列挙する。 */
const regSpeciesKeys = (r: Record<string, unknown>): string[] =>
  Object.keys(r).filter((k) => !RESERVED_REG_KEYS.has(k));
/** 種族キーの解禁内容（moves / mega）を取り出す。 */
const speciesAllowOf = (r: Record<string, unknown>, sid: string): SpeciesAllow =>
  r[sid] as SpeciesAllow;

const raw = (category: string, name: string): Record<string, unknown> =>
  JSON.parse(readFileSync(join(RAW, category, `${name}.json`), "utf8")) as Record<string, unknown>;

const ch = <T>(file: string): T => parseYaml(readFileSync(join(CH, file), "utf8")) as T;

/** オブジェクトを TS リテラルとして直列化（Biome が後段で整形する）。 */
const lit = (value: unknown): string => JSON.stringify(value, null, 2);

const speciesCat = ch<SpeciesCatalog>("catalog/species.yaml");
const movesCat = ch<MovesCatalog>("catalog/moves.yaml");
const itemsCat = ch<ItemsCatalog>("catalog/items.yaml");
const abilitiesCat = ch<AbilitiesCatalog>("catalog/abilities.yaml");
const typesCat = ch<TypesCatalog>("catalog/types.yaml");

// 種族 slug 一覧（catalog/species.yaml の pokemon キー）。
const speciesSlugs = Object.keys(speciesCat.pokemon);
// 18 タイプの id 集合（catalog/types.yaml のキー = 旧ハードコード列挙の置き換え）。
const TYPES = Object.keys(typesCat.types);

// authoring ゲート: 各 catalog エントリに ja/en が揃っているか検証（名前の SoT は catalog YAML・
// 欠落は非0終了で弾く・Phase 10）。
const requireNames = (kind: string, m: Record<string, { ja?: string; en?: string }>): void => {
  for (const [id, v] of Object.entries(m)) {
    if (!v?.ja || !v?.en) {
      throw new Error(
        `catalog ${kind} '${id}' is missing ja/en name (catalog YAML is the name SoT)`,
      );
    }
  }
};
requireNames("species", speciesCat.pokemon);
requireNames("moves", movesCat.moves);
requireNames("abilities", abilitiesCat.abilities);
requireNames("items", itemsCat.items);
requireNames("types", typesCat.types);

// レギュレーションは 1 レギュ = 1 ファイル（data/champions/regulations/<id>.yaml）。
const REG_DIR = join(CH, "regulations");
const regs: Record<string, Record<string, unknown>> = {};
for (const file of readdirSync(REG_DIR)
  .filter((f) => f.endsWith(".yaml"))
  .sort()) {
  const id = file.replace(/\.yaml$/, "");
  regs[id] = parseYaml(readFileSync(join(REG_DIR, file), "utf8")) as Record<string, unknown>;
}

// --- types（全 18・name + 相性表とも catalog/types.yaml 由来・raw 非依存・Phase 10） ----------
const typeEntries: Record<string, unknown> = {};
for (const t of TYPES) {
  const c = typesCat.types[t];
  // 非 1.0 のみ記録された damageTo を、全タイプ 1.0 で初期化したうえで上書きする。
  const to: Record<string, number> = {};
  for (const d of TYPES) to[d] = 1;
  for (const [d, m] of Object.entries(c.damageTo ?? {})) to[d] = m;
  typeEntries[t] = {
    id: t,
    name: { en: c.en, ja: c.ja },
    damageTo: to,
  };
}

// --- moves（name は catalog/moves.yaml 由来・type/damageClass/power 等の構造は data/raw 由来） ----
const moveEntries: Record<string, unknown> = {};
for (const [m, nm] of Object.entries(movesCat.moves)) {
  const j = raw("move", m);
  moveEntries[m] = {
    id: m,
    name: { en: nm.en, ja: nm.ja },
    type: (j.type as { name: string }).name,
    damageClass: (j.damage_class as { name: string }).name,
    power: j.power ?? null,
    accuracy: j.accuracy ?? null,
    pp: j.pp,
    priority: j.priority,
  };
}

// --- abilities（catalog/abilities.yaml を正本に id のみ生成・name は持たない・Phase 10） ------
// 効果定義は後続フェーズで足す前提で生成ファイル自体は残す。種族の特性はこの id を参照する。
const pokeJson: Record<string, Record<string, unknown>> = {};
for (const slug of speciesSlugs) {
  pokeJson[slug] = raw("pokemon", slug);
}
// 参照整合: 各種族の特性が abilities カタログに存在することを検証（append-only マスターの担保）。
const abilitySet = new Set(Object.keys(abilitiesCat.abilities));
for (const slug of speciesSlugs) {
  for (const a of pokeJson[slug]?.abilities as { ability: { name: string } }[]) {
    if (!abilitySet.has(a.ability.name)) {
      throw new Error(
        `ability '${a.ability.name}' of '${slug}' not in catalog/abilities.yaml (append-only catalog)`,
      );
    }
  }
}
const abilityEntries: Record<string, unknown> = {};
for (const a of Object.keys(abilitiesCat.abilities).sort()) {
  abilityEntries[a] = { id: a };
}

// --- items（id-only + category(raw) + megaStoneFor(yaml)・name は持たない・Phase 10） -----------
const itemEntries: Record<string, unknown> = {};
for (const [i, meta] of Object.entries(itemsCat.items)) {
  const j = raw("item", i);
  const entry: Record<string, unknown> = {
    id: i,
    category: (j.category as { name: string }).name,
  };
  if (meta.megaStoneFor) entry.megaStoneFor = meta.megaStoneFor;
  itemEntries[i] = entry;
}

// --- regulations（per-reg・1 レギュ = 1 ディレクトリ + index 集約。解禁判定の正本・ADR 0021） -----
// レギュメタ（regEntries）は name/period/解禁集合のみ。per-reg 習得技は別途 perRegSpecies（種族 dex）が持つ。
// 参照整合: 解禁集合の id がカタログに存在することを生成段で検証する（append-only マスターの担保）。
const speciesIdSet = new Set(speciesSlugs);
const itemIdSet = new Set(Object.keys(itemsCat.items));
const moveCatSet = new Set(Object.keys(movesCat.moves));
const regEntries: Record<string, Record<string, unknown>> = {};
for (const [id, reg] of Object.entries(regs)) {
  // 種族キー（解禁種族）・解禁 mega（per-species mega の和集合）・解禁技（per-species moves の和集合）を集計。
  const speciesKeys = regSpeciesKeys(reg);
  const items = (reg.items as string[] | undefined) ?? [];
  const megaSet = new Set<string>();
  const movesUnion = new Set<string>();
  for (const sid of speciesKeys) {
    const allow = speciesAllowOf(reg, sid);
    for (const mv of allow.moves) movesUnion.add(mv);
    for (const mg of allow.mega ?? []) megaSet.add(mg);
  }
  const mega = [...megaSet];
  const check = (kind: string, ids: string[], pool: Set<string>): void => {
    for (const v of ids) {
      if (!pool.has(v)) {
        throw new Error(`regulation '${id}' ${kind} '${v}' not in catalog (append-only catalog)`);
      }
    }
  };
  check("species", speciesKeys, speciesIdSet);
  check("mega", mega, speciesIdSet);
  check("items", items, itemIdSet);
  check("moves", [...movesUnion], moveCatSet);
  // メタは species / items / mega（解禁集合）のみ。per-reg 習得技は perRegSpecies が持つ（ADR 0021）。
  const name = reg.name as { en: string; ja: string };
  const period = reg.period as { start: string; end: string | null };
  regEntries[id] = {
    id,
    name,
    period: { start: period.start, end: period.end ?? null },
    species: speciesKeys,
    items,
    mega,
  };
}
/** "champions-m-a" -> "championsMA"（per-reg const 名）。 */
const camel = (id: string): string =>
  id
    .split("-")
    .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join("");

// --- species（reg 不変 info）------------------------------------
// reg 不変フィールド（dex/name/types/baseStats/abilities/megaEvolvesTo）を全種族ぶん用意し、
// per-reg dex / species-base / names の素材にする。per-reg の習得技は YAML 由来（per-reg dex 構築時に採用）。
const speciesInfo: Record<string, Record<string, unknown>> = {};
for (const slug of speciesSlugs) {
  const poke = pokeJson[slug];
  if (!poke) throw new Error(`missing pokemon json: ${slug}`);
  const speciesName = (poke.species as { name: string }).name;
  const speciesJson = raw("pokemon-species", speciesName);
  // 名前は catalog/species.yaml 由来（PokeAPI を名前の取得元にしない・Phase 10）。dex は raw 由来。
  const nm = speciesCat.pokemon[slug];
  const name = { en: nm.en, ja: nm.ja };
  const base = { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };
  const statMap: Record<string, keyof typeof base> = {
    hp: "hp",
    attack: "attack",
    defense: "defense",
    "special-attack": "spAttack",
    "special-defense": "spDefense",
    speed: "speed",
  };
  for (const s of poke.stats as { base_stat: number; stat: { name: string } }[]) {
    const key = statMap[s.stat.name];
    if (key) base[key] = s.base_stat;
  }
  const info: Record<string, unknown> = {
    dex: speciesJson.id,
    id: slug,
    name,
    types: (poke.types as { type: { name: string } }[]).map((t) => t.type.name),
    baseStats: base,
    abilities: (poke.abilities as { ability: { name: string } }[]).map((a) => a.ability.name),
  };
  const mega = speciesCat.megaLinks?.[slug];
  if (mega && mega.length > 0) info.megaEvolvesTo = mega;
  speciesInfo[slug] = info;
}

// --- species-base（reg 不変フィールドのみの派生 base view・全種族） -----------
// 実数値計算・名前表示・coverage はレギュ非依存のためこの base view を引く（設計判断5・per-reg 化）。
const speciesBaseEntries: Record<string, unknown> = {};
for (const [id, e] of Object.entries(speciesInfo)) {
  const s = e as Record<string, unknown>;
  const base: Record<string, unknown> = {
    dex: s.dex,
    id: s.id,
    name: s.name,
    types: s.types,
    baseStats: s.baseStats,
  };
  if (s.megaEvolvesTo) base.megaEvolvesTo = s.megaEvolvesTo;
  speciesBaseEntries[id] = base;
}

// --- per-regulation species dex（roster ∪ mega 先・per-reg 習得技を含む legality 正本） ----------
// トップレベル種族キー: moves は YAML 由来をそのまま採用（変換専任・ADR 0023）。覚えない技の検証は
// authoring 時ゲート check:regulation が担う（generate は検証しない）。megaEvolvesTo は per-reg の mega（配列）。
// mega 先のみの種族（種族キーでない）: moves は base 種族の per-reg moves を継承する（同一 movepool・ADR 0024）。
const perRegSpecies: Record<string, Record<string, unknown>> = {};
for (const [id, reg] of Object.entries(regs)) {
  const speciesKeys = regSpeciesKeys(reg);
  const keySet = new Set(speciesKeys);
  // mega 先 -> base 種族キーの逆引き（base の per-reg moves を継承するため・ADR 0024）。
  const megaToBase: Record<string, string> = {};
  for (const sid of speciesKeys) {
    for (const mg of speciesAllowOf(reg, sid).mega ?? []) megaToBase[mg] = sid;
  }
  const rosterIds = [...new Set([...speciesKeys, ...Object.keys(megaToBase)])];
  const dex: Record<string, unknown> = {};
  for (const sid of rosterIds) {
    const info = speciesInfo[sid];
    if (!info) throw new Error(`regulation '${id}' roster species '${sid}' missing from catalog`);
    let moves: string[];
    let megaEvolvesTo: string[] | undefined;
    if (keySet.has(sid)) {
      // generate は変換専任（ADR 0023）。覚えない技の検証は authoring 時ゲート check:regulation が担う。
      const allow = speciesAllowOf(reg, sid);
      moves = allow.moves;
      if (allow.mega && allow.mega.length > 0) megaEvolvesTo = allow.mega;
    } else {
      // mega 先のみ: base 種族の per-reg moves を継承する（実ゲームは技を base 形態に登録・同一 movepool・ADR 0024）。
      moves = speciesAllowOf(reg, megaToBase[sid]).moves;
    }
    const entry: Record<string, unknown> = {
      dex: info.dex,
      id: info.id,
      name: info.name,
      types: info.types,
      baseStats: info.baseStats,
      abilities: info.abilities,
      moves,
      items: "any",
    };
    if (megaEvolvesTo) entry.megaEvolvesTo = megaEvolvesTo;
    dex[sid] = entry;
  }
  perRegSpecies[id] = dex;
}

// --- names（ja 名 -> id の逆引き・ランタイム正規化用） ----------------------
// 生成 dex が name を持つ species/moves/types は dex から、id-only の abilities/items は
// catalog YAML（名前の SoT・Phase 10）から ja を引く。
const jaMap = (entries: Record<string, unknown>): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [id, e] of Object.entries(entries)) {
    out[(e as { name: { ja: string } }).name.ja] = id;
  }
  return out;
};
const jaMapCat = (m: Record<string, { ja: string }>): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [id, v] of Object.entries(m)) out[v.ja] = id;
  return out;
};

// --- emit ------------------------------------------------------------------
mkdirSync(OUT, { recursive: true });
mkdirSync(join(OUT, "regulations"), { recursive: true });
const header =
  "// 生成物（scripts/generate.ts 出力）。手書き編集しない。raw/champions を直し再生成する。\n";

const emit = (file: string, body: string): void => {
  writeFileSync(join(OUT, file), header + body);
};

emit(
  "types.ts",
  `import type { TypeBase } from "../../src/types/type-chart.ts";\n\nexport const typeDex = ${lit(typeEntries)} as const satisfies Record<string, TypeBase>;\n\nexport type TypeDex = typeof typeDex;\n`,
);
emit(
  "moves.ts",
  `import type { MoveBase } from "../../src/types/move.ts";\n\nexport const moveDex = ${lit(moveEntries)} as const satisfies Record<string, MoveBase>;\n\nexport type MoveDex = typeof moveDex;\nexport type MoveId = keyof MoveDex;\n`,
);
emit(
  "abilities.ts",
  `import type { AbilityBase } from "../../src/types/ability.ts";\n\nexport const abilityDex = ${lit(abilityEntries)} as const satisfies Record<string, AbilityBase>;\n\nexport type AbilityDex = typeof abilityDex;\nexport type AbilityId = keyof AbilityDex;\n`,
);
emit(
  "items.ts",
  `import type { Assignable } from "../../src/types/assert.ts";\nimport type { ItemBase } from "../../src/types/item.ts";\n\nexport const itemDex = ${lit(itemEntries)} as const;\n\nexport type ItemDex = typeof itemDex;\nexport type ItemId = keyof ItemDex;\n\n// 適合検証（megaStoneFor が派生 SpeciesId を指すため inline satisfies を避け分離する）。\nexport type _ItemConforms = Assignable<Record<string, ItemBase>, ItemDex>;\n`,
);
// species-base: reg 不変 base view（全種族・派生）。
emit(
  "species-base.ts",
  `import type { SpeciesBaseInfo } from "../../src/types/species.ts";\n\nexport const speciesBaseDex = ${lit(speciesBaseEntries)} as const satisfies Record<string, SpeciesBaseInfo>;\n\nexport type SpeciesBaseDex = typeof speciesBaseDex;\nexport type SpeciesBaseId = keyof SpeciesBaseDex;\n`,
);
// regulations: 1 レギュ = 1 ディレクトリ。<id>/species.ts（per-reg dex）+ <id>/index.ts（メタ）。
// 集約 index.ts が regulationDex に集める。
for (const [id, entry] of Object.entries(regEntries)) {
  mkdirSync(join(OUT, "regulations", id), { recursive: true });
  emit(
    join("regulations", id, "species.ts"),
    `import type { SpeciesBase } from "../../../../src/types/species.ts";\n\nexport const speciesDex = ${lit(perRegSpecies[id])} as const satisfies Record<string, SpeciesBase>;\n\nexport type SpeciesDex = typeof speciesDex;\nexport type SpeciesId = keyof SpeciesDex;\n`,
  );
  // メタに speciesDex（import 参照）を同梱して RegulationDex[R]["speciesDex"] から引けるようにする。
  const metaBody = lit(entry).replace(/\n\}$/, ",\n  speciesDex,\n}");
  emit(
    join("regulations", id, "index.ts"),
    `import type { RegulationBase } from "../../../../src/types/regulation.ts";\nimport { speciesDex } from "./species.ts";\n\nexport { speciesDex };\nexport type { SpeciesDex, SpeciesId } from "./species.ts";\n\nexport const ${camel(id)} = ${metaBody} as const satisfies RegulationBase;\n`,
  );
}
{
  const ids = Object.keys(regEntries);
  const imports = ids.map((id) => `import { ${camel(id)} } from "./${id}/index.ts";`).join("\n");
  const members = ids.map((id) => `  ${JSON.stringify(id)}: ${camel(id)},`).join("\n");
  emit(
    join("regulations", "index.ts"),
    `${imports}\n\nexport const regulationDex = {\n${members}\n} as const;\n\nexport type RegulationDex = typeof regulationDex;\nexport type RegulationId = keyof RegulationDex;\n`,
  );
}
emit(
  "names.ts",
  `// ja 表示名 -> 安定 ID の逆引きマップ（ランタイム正規化用・[[cli-and-io]]）。\n` +
    `export const speciesIdByJa = ${lit(jaMap(speciesInfo))} as const;\n` +
    `export const moveIdByJa = ${lit(jaMap(moveEntries))} as const;\n` +
    `export const abilityIdByJa = ${lit(jaMapCat(abilitiesCat.abilities))} as const;\n` +
    `export const itemIdByJa = ${lit(jaMapCat(itemsCat.items))} as const;\n` +
    `export const typeIdByJa = ${lit(jaMap(typeEntries))} as const;\n`,
);

// Biome で整形して機械ゲート（biome check）と一致させる。
execFileSync(
  "node",
  [join(ROOT, "node_modules", "@biomejs", "biome", "bin", "biome"), "check", "--write", OUT],
  {
    cwd: ROOT,
    stdio: "inherit",
  },
);

console.log(
  `[generate] wrote ${Object.keys(speciesInfo).length} species, ${Object.keys(moveEntries).length} moves, ${TYPES.length} types`,
);
