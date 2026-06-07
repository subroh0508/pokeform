/**
 * generate.ts — `data/raw/`（PokeAPI キャッシュ）と `data/champions/`（手動）を合成し
 * `data/generated/`（コミット）へ型 + 値を出力する。vendor 方式（ADR 0012）の生成段。
 *
 * 出力: types / moves / abilities / items / regulations / species / names。各 Dex は
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

const TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

interface SpeciesCatalog {
  pokemon: string[];
  megaLinks?: Record<string, string>;
}
interface MovesCatalog {
  moves: string[];
}
interface ItemsCatalog {
  items: string[];
  itemMeta?: Record<string, { megaStoneFor?: string }>;
}
interface AbilitiesCatalog {
  abilities: string[];
}
interface RegulationFile {
  name: { en: string; ja: string };
  period: { start: string; end: string | null };
  allow: { species: string[]; items: string[]; mega: string[]; moves: string[] };
}
interface NameEntry {
  language: { name: string };
  name: string;
}

const raw = (category: string, name: string): Record<string, unknown> =>
  JSON.parse(readFileSync(join(RAW, category, `${name}.json`), "utf8")) as Record<string, unknown>;

const ch = <T>(file: string): T => parseYaml(readFileSync(join(CH, file), "utf8")) as T;

/** localized names から優先言語順で最初に見つかった名前を返す。 */
const pickName = (names: NameEntry[], langs: string[]): string => {
  for (const lang of langs) {
    const found = names.find((n) => n.language.name === lang);
    if (found) return found.name;
  }
  throw new Error(`name not found for langs ${langs.join("/")}`);
};

/** オブジェクトを TS リテラルとして直列化（Biome が後段で整形する）。 */
const lit = (value: unknown): string => JSON.stringify(value, null, 2);

const speciesCat = ch<SpeciesCatalog>("catalog/species.yaml");
const movesCat = ch<MovesCatalog>("catalog/moves.yaml");
const itemsCat = ch<ItemsCatalog>("catalog/items.yaml");
const abilitiesCat = ch<AbilitiesCatalog>("catalog/abilities.yaml");

// レギュレーションは 1 レギュ = 1 ファイル（data/champions/regulations/<id>.yaml）。
const REG_DIR = join(CH, "regulations");
const regs: Record<string, RegulationFile> = {};
for (const file of readdirSync(REG_DIR)
  .filter((f) => f.endsWith(".yaml"))
  .sort()) {
  const id = file.replace(/\.yaml$/, "");
  regs[id] = parseYaml(readFileSync(join(REG_DIR, file), "utf8")) as RegulationFile;
}

// --- types（全 18・相性表） -------------------------------------------------
const typeEntries: Record<string, unknown> = {};
for (const t of TYPES) {
  const j = raw("type", t);
  const rel = j.damage_relations as Record<string, { name: string }[]>;
  const to: Record<string, number> = {};
  for (const d of TYPES) to[d] = 1;
  for (const d of rel.double_damage_to) to[d.name] = 2;
  for (const d of rel.half_damage_to) to[d.name] = 0.5;
  for (const d of rel.no_damage_to) to[d.name] = 0;
  typeEntries[t] = {
    id: t,
    name: {
      en: pickName(j.names as NameEntry[], ["en"]),
      ja: pickName(j.names as NameEntry[], ["ja-hrkt", "ja"]),
    },
    damageTo: to,
  };
}

// --- moves -----------------------------------------------------------------
const moveEntries: Record<string, unknown> = {};
for (const m of movesCat.moves) {
  const j = raw("move", m);
  moveEntries[m] = {
    id: m,
    name: {
      en: pickName(j.names as NameEntry[], ["en"]),
      ja: pickName(j.names as NameEntry[], ["ja-hrkt", "ja"]),
    },
    type: (j.type as { name: string }).name,
    damageClass: (j.damage_class as { name: string }).name,
    power: j.power ?? null,
    accuracy: j.accuracy ?? null,
    pp: j.pp,
    priority: j.priority,
  };
}

// --- abilities（catalog/abilities.yaml を正本に生成・種族の特性はこの id を参照） ------
const pokeJson: Record<string, Record<string, unknown>> = {};
for (const slug of speciesCat.pokemon) {
  pokeJson[slug] = raw("pokemon", slug);
}
// 参照整合: 各種族の特性が abilities カタログに存在することを検証（append-only マスターの担保）。
const abilitySet = new Set(abilitiesCat.abilities);
for (const slug of speciesCat.pokemon) {
  for (const a of pokeJson[slug]?.abilities as { ability: { name: string } }[]) {
    if (!abilitySet.has(a.ability.name)) {
      throw new Error(
        `ability '${a.ability.name}' of '${slug}' not in catalog/abilities.yaml (append-only catalog)`,
      );
    }
  }
}
const abilityEntries: Record<string, unknown> = {};
for (const a of [...abilitiesCat.abilities].sort()) {
  const j = raw("ability", a);
  abilityEntries[a] = {
    id: a,
    name: {
      en: pickName(j.names as NameEntry[], ["en"]),
      ja: pickName(j.names as NameEntry[], ["ja-hrkt", "ja"]),
    },
  };
}

// --- items -----------------------------------------------------------------
const itemEntries: Record<string, unknown> = {};
for (const i of itemsCat.items) {
  const j = raw("item", i);
  const meta = itemsCat.itemMeta?.[i];
  const entry: Record<string, unknown> = {
    id: i,
    name: {
      en: pickName(j.names as NameEntry[], ["en"]),
      ja: pickName(j.names as NameEntry[], ["ja-hrkt", "ja"]),
    },
    category: (j.category as { name: string }).name,
  };
  if (meta?.megaStoneFor) entry.megaStoneFor = meta.megaStoneFor;
  itemEntries[i] = entry;
}

// --- regulations（per-reg・別ファイル別型 + index 集約。解禁判定の正本・ADR 0021） ---------
// 参照整合: 解禁集合の id がカタログに存在することを生成段で検証する（append-only マスターの担保）。
const speciesIdSet = new Set(speciesCat.pokemon);
const itemIdSet = new Set(itemsCat.items);
const moveCatSet = new Set(movesCat.moves);
const regEntries: Record<string, Record<string, unknown>> = {};
for (const [id, reg] of Object.entries(regs)) {
  const check = (kind: string, ids: string[], pool: Set<string>): void => {
    for (const v of ids) {
      if (!pool.has(v)) {
        throw new Error(
          `regulation '${id}' allow.${kind} '${v}' not in catalog (append-only catalog)`,
        );
      }
    }
  };
  check("species", reg.allow.species, speciesIdSet);
  check("mega", reg.allow.mega, speciesIdSet);
  check("items", reg.allow.items, itemIdSet);
  check("moves", reg.allow.moves, moveCatSet);
  // per-reg 型は species / items / mega のみ（技は YAML 記録のみ・型生成しない・ADR 0021）。
  regEntries[id] = {
    id,
    name: reg.name,
    period: { start: reg.period.start, end: reg.period.end ?? null },
    species: reg.allow.species,
    items: reg.allow.items,
    mega: reg.allow.mega,
  };
}
/** "champions-m-a" -> "championsMA"（per-reg const 名）。 */
const camel = (id: string): string =>
  id
    .split("-")
    .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join("");

// --- species ---------------------------------------------------------------
const moveIdSet = new Set(movesCat.moves);
const speciesEntries: Record<string, unknown> = {};
for (const slug of speciesCat.pokemon) {
  const poke = pokeJson[slug];
  if (!poke) throw new Error(`missing pokemon json: ${slug}`);
  const speciesName = (poke.species as { name: string }).name;
  const speciesJson = raw("pokemon-species", speciesName);
  const isForm = slug !== speciesName;
  const name = isForm
    ? (() => {
        const form = raw("pokemon-form", slug);
        return {
          en: pickName(form.form_names as NameEntry[], ["en"]),
          ja: pickName(form.form_names as NameEntry[], ["ja-hrkt", "ja"]),
        };
      })()
    : {
        en: pickName(speciesJson.names as NameEntry[], ["en"]),
        ja: pickName(speciesJson.names as NameEntry[], ["ja-hrkt", "ja"]),
      };
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
  const learn = (poke.moves as { move: { name: string } }[]).map((m) => m.move.name);
  const moves = movesCat.moves.filter((m) => moveIdSet.has(m) && learn.includes(m));
  const entry: Record<string, unknown> = {
    dex: speciesJson.id,
    id: slug,
    name,
    types: (poke.types as { type: { name: string } }[]).map((t) => t.type.name),
    baseStats: base,
    abilities: (poke.abilities as { ability: { name: string } }[]).map((a) => a.ability.name),
    moves,
    items: "any",
  };
  const mega = speciesCat.megaLinks?.[slug];
  if (mega) entry.megaEvolvesTo = mega;
  speciesEntries[slug] = entry;
}

// --- names（ja 名 -> id の逆引き・ランタイム正規化用） ----------------------
const jaMap = (entries: Record<string, unknown>): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [id, e] of Object.entries(entries)) {
    out[(e as { name: { ja: string } }).name.ja] = id;
  }
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
// regulations: 1 レギュ = 1 ファイル（別ファイル別型）+ index.ts で regulationDex に集約。
for (const [id, entry] of Object.entries(regEntries)) {
  emit(
    join("regulations", `${id}.ts`),
    `import type { RegulationBase } from "../../../src/types/regulation.ts";\n\nexport const ${camel(id)} = ${lit(entry)} as const satisfies RegulationBase;\n`,
  );
}
{
  const ids = Object.keys(regEntries);
  const imports = ids.map((id) => `import { ${camel(id)} } from "./${id}.ts";`).join("\n");
  const members = ids.map((id) => `  ${JSON.stringify(id)}: ${camel(id)},`).join("\n");
  emit(
    join("regulations", "index.ts"),
    `${imports}\n\nexport const regulationDex = {\n${members}\n} as const;\n\nexport type RegulationDex = typeof regulationDex;\nexport type RegulationId = keyof RegulationDex;\n`,
  );
}
emit(
  "species.ts",
  `import type { Assignable } from "../../src/types/assert.ts";\nimport type { SpeciesBase } from "../../src/types/species.ts";\n\nexport const speciesDex = ${lit(speciesEntries)} as const;\n\nexport type SpeciesDex = typeof speciesDex;\nexport type SpeciesId = keyof SpeciesDex;\n\n// 適合検証（megaEvolvesTo が派生 SpeciesId を自己参照するため inline satisfies を避け分離する）。\nexport type _SpeciesConforms = Assignable<Record<string, SpeciesBase>, SpeciesDex>;\n`,
);
emit(
  "names.ts",
  `// ja 表示名 -> 安定 ID の逆引きマップ（ランタイム正規化用・[[cli-and-io]]）。\n` +
    `export const speciesIdByJa = ${lit(jaMap(speciesEntries))} as const;\n` +
    `export const moveIdByJa = ${lit(jaMap(moveEntries))} as const;\n` +
    `export const abilityIdByJa = ${lit(jaMap(abilityEntries))} as const;\n` +
    `export const itemIdByJa = ${lit(jaMap(itemEntries))} as const;\n` +
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
  `[generate] wrote ${Object.keys(speciesEntries).length} species, ${Object.keys(moveEntries).length} moves, ${TYPES.length} types`,
);
