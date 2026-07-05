/**
 * fetch-pokeapi.ts — PokeAPI の `names`（ja-Hrkt + en）を **全件列挙**して取得し `data/raw/`（.gitignore）に
 * キャッシュする名前取得スクリプト。
 *
 * **名前専任**（plan 10）: 構造データ（種族値 / タイプ / 特性 id / 図鑑番号 / category）の取得は
 * pokemon-showdown 経路（`scripts/showdown/*`）へ移管した。本スクリプトは **名前 SoT（`data/languages/*.yaml`）** を
 * PokeAPI の `names`（ja / en）で埋めるための取得だけを担う（権威序列 = showdown(en 正) > Serebii(速報) >
 * PokeAPI(ja 正・en 補完)）。languages は reg 非依存の**全件名辞書**（未解禁名も持つ・ADR 0041）で、本取得の
 * `pokeapi-names.yml` workflow がこの全件を満たす。
 *
 * **全件列挙 + 差分**（ADR 0041）: 各 category の **list endpoint で全 id を列挙**し（種族 = `pokemon-species` /
 * 持ち物 = `item` / 技 = `move` / 特性 = `ability` / タイプ = `type`）、`languages/*.yaml` に **ja/en が揃って
 * 記録済みの id はスキップ**、未記録 / 欠落 id のみ `names` を **best-effort 取得**（404 等は skip）する（差分・
 * 冪等）。`materialize`（= `sync:ja-names`）が raw `names` から ja/en を転記する。**メガ名も PokeAPI 6 種目**として
 * `pokemon-form` 経路で取得する（`is_mega` の form の `form_names` に ja/en が載る・ADR 0043・[[data-pipeline]]）。
 *
 * 実行: `pnpm fetch:ja-names`（ネットワーク必須）。取得後は raw キャッシュ固定で `sync:ja-names` が決定論的に転記する。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import {
  composeFormName,
  deriveBaseId,
  EN_BRACKETS,
  extractNames,
  type FormShape,
  isDistinctForm,
  JA_BRACKETS,
  megaFormCandidates,
  sortedUnion,
} from "../src/codegen/materialize.ts";
import {
  CANONICAL_ID_OVERRIDE,
  canonicalFormId,
} from "../src/codegen/showdown/canonical-species-id.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw");
const API = "https://pokeapi.co/api/v2";

/**
 * **items だけは全件（`/item` 2176 件）でなく item-category whitelist の union に絞る**（issue #213・ADR 0041 の
 * items 例外）。languages は reg 非依存の名前辞書だが、items は「持たせて対戦効果があるか」で切る（reg では切らない）。
 * 属性（`holdable` / `holdable-active`）ベースは PokeAPI の attribute が不完全で assault-vest / booster-energy /
 * mega-stones を取りこぼすため不採用。category は全 item に必ず付与され `/item-category/{cat}` で列挙できるため堅牢。
 */
const ITEM_CATEGORIES = [
  "held-items",
  "choice",
  "bad-held-items",
  "type-enhancement",
  "species-specific",
  "plates",
  "type-protection",
  "in-a-pinch",
  "picky-healing",
  "jewels",
  "memories",
  "mega-stones",
  // `medicine` は PokeAPI 上「持ち物として持たせる回復・状態異常治しの木の実」10 件（オボンのみ=sitrus-berry /
  // ラムのみ=lum-berry / オレンのみ=oran-berry / 状態異常回復の木の実）で、ポーション類（`healing` カテゴリ）とは別。
  // issue #213 の除外リストは概念上の「medicine（薬）」を指しており PokeAPI の `medicine` カテゴリ実体と食い違う。
  // 受け入れ基準（オボンのみが残る）と既存個体（lum-berry を持つ）を満たすには本カテゴリの木の実を残す必要があるため含める。
  "medicine",
  // `other` は現状 5 件すべてが対戦で持たせる木の実（enigma / jaboca / rowap / kee / maranga-berry = 効果反射・
  // 被弾時能力上昇・こうかばつぐん回復）ゆえ含める。カテゴリ名は catch-all だが実体はこの 5 件（PokeAPI 変更時は
  // 各 cat 404 + union 空の fail-fast ではなく人手レビューで drift を見る想定・ADR 0042 のカテゴリ改廃留意点）。
  "other",
] as const;

/**
 * distinct-forms 列挙（plan 11 P4）で、同型・同種族値でも**別種族にしたい form** を明示追加する `FORM_INCLUDE`
 * （キーは PokeAPI variety slug）。`isDistinctForm`（type/stat 差）で拾えない cosmetic form をここで拾う。
 * `greninja-battle-bond` は base（ゲッコウガ）と同型・同種族値だが別種族として扱いたい。追加分（form-mapping 調整）は
 * squawkabilly 3 色 / morpeko はらぺこ / mimikyu ばれた / maushold ３ひき / meowstic メス / keldeo かくご /
 * dudunsparce みつふし / basculin あおすじ・しろすじ で、いずれも base と同型・同種族値ゆえ明示追加する（[[data-pipeline]]）。
 */
const FORM_INCLUDE = new Set<string>([
  "greninja-battle-bond",
  "squawkabilly-blue-plumage",
  "squawkabilly-yellow-plumage",
  "squawkabilly-white-plumage",
  "morpeko-hangry",
  "mimikyu-busted",
  "maushold-family-of-three",
  "meowstic-female",
  "keldeo-resolute",
  "dudunsparce-three-segment",
  "basculin-blue-striped",
  "basculin-white-striped",
  // ウッウ: うのみ／まるのみで「のみこみ／まるのみ」技の仕様が変わる（同型・同種族値だが別 form として列挙する）。
  "cramorant-gulping",
  "cramorant-gorging",
]);

/**
 * distinct-forms 列挙から**明示除外**する variety slug（キーは PokeAPI variety slug）。base（default）とは
 * type/stat が異なる or default が明示 slug を持つが、pokeform では別種族にしない form。`EXCLUDED_FORM` 正規表現で
 * 表せない個別除外をここに置く:
 * - メテノの「XXいろのコア」7 色: base(meteor) と種族値が違い `isDistinctForm` で拾われるが対戦上メテノ 1 種へ畳む
 *   （meteor は `minior-meteor` で残す）。
 * - パイロール（雌雄）・シャリタツ（3 姿）の **default 明示 slug**（`pyroar-male` / `tatsugiri-curly`）: 姿差のみで
 *   別種族にしない。default explicit slug は canonical-form として拾われるため、非デフォルト（cosmetic）と併せて base
 *   （`pyroar` / `tatsugiri`）へ畳むには default 側も明示除外する（[[data-pipeline]]）。
 */
const FORM_EXCLUDE = new Set<string>([
  "minior-red",
  "minior-orange",
  "minior-yellow",
  "minior-green",
  "minior-blue",
  "minior-indigo",
  "minior-violet",
  "pyroar-male",
  "tatsugiri-curly",
]);

/**
 * PokeAPI に variety が無い「地方フォルムの base」を合成注入する（`{ id → { ja, en } }`）。distinct 列挙は
 * variety をキーにするため、standard / zen サブフォルムを持つ地方フォルムの base id（Unovan `darmanitan` と対称な
 * `darmanitan-galar`）は変種として現れず生成されない。ここで base 名を直接 raw 化して補い、`-standard` / `-zen` の
 * サブフォルムと並べて列挙する（bare base + standard + zen の対称構造・[[data-pipeline]]）。
 */
const SYNTHETIC_BASE_FORMS: Record<string, { ja: string; en: string }> = {
  "darmanitan-galar": { ja: "ヒヒダルマ（ガラルのすがた）", en: "Darmanitan (Galarian Form)" },
};

/**
 * distinct-forms 列挙から除外する form サフィックス / セグメント。`-mega[-x|-y|-z]` は mega.yaml 経路（ADR 0043）、
 * `-gmax`（キョダイマックス）/ `-primal`（ゲンシカイキ）/ `-starter`（LGPE 相棒）は末尾で除外。`-totem`（ぬしポケモン）は
 * `raticate-totem-alola` のようにリージョン接尾辞の**手前**にも現れるためセグメント（`-totem-` / 末尾 `-totem`）で除外する
 * （ぬしは通常個体の大型・オーラ差だけで対戦対象外・[[data-pipeline]]）。
 */
const EXCLUDED_FORM = /-(mega(-[xyz])?|gmax|primal|starter)$|-totem(-|$)/;

/**
 * PokeAPI に ja が無い / 名前が衝突する / 独自呼称を与えたい form の**手動 override**（合成結果より優先・
 * plan 11 P4 + form-mapping 調整）。**短い canonical id**（`canonicalFormId` 適用後）でキーイングし、`{ ja?, en? }` を
 * 欄ごとに合成名へ上書きする（欄を省けば合成名が残る）。
 * - `greninja-battle-bond`: form_names 空で合成不能 → ja/en を著述（きずなへんげ）。
 * - `tauros-paldea-*`: form_names.ja が 3 種とも「パルデアのすがた」で衝突 → breed 別 ja + en（`(Paldean Form XXX
 *   Breed)`）を著述。en も 3 種同綴りゆえ手動で区別する。
 * - `pumpkaboo-*` / `gourgeist-*`: サイズ ja を独自呼称（小さい順 こだま/ちゅうだま/おおだま/ギガだま）で著述（en は合成）。
 * - `darmanitan-galar-*`: form_names.ja がモード名のみ（ガラル文脈欠落）→ ガラル + モードを著述。base
 *   `darmanitan-galar`（ヒヒダルマ（ガラルのすがた））は `SYNTHETIC_BASE_FORMS` で別途注入する。
 */
const MANUAL_NAME_OVERRIDE: Record<string, { ja?: string; en?: string }> = {
  "greninja-battle-bond": { ja: "ゲッコウガ（きずなへんげ）", en: "Greninja (Battle Bond)" },
  "tauros-paldea-combat": {
    ja: "ケンタロス（パルデアのすがた・コンバットしゅ）",
    en: "Tauros (Paldean Form Combat Breed)",
  },
  "tauros-paldea-blaze": {
    ja: "ケンタロス（パルデアのすがた・ブレイズしゅ）",
    en: "Tauros (Paldean Form Blaze Breed)",
  },
  "tauros-paldea-aqua": {
    ja: "ケンタロス（パルデアのすがた・ウォーターしゅ）",
    en: "Tauros (Paldean Form Aqua Breed)",
  },
  "pumpkaboo-small": { ja: "バケッチャ（こだましゅ）" },
  "pumpkaboo-average": { ja: "バケッチャ（ちゅうだましゅ）" },
  "pumpkaboo-large": { ja: "バケッチャ（おおだましゅ）" },
  "pumpkaboo-super": { ja: "バケッチャ（ギガだましゅ）" },
  "gourgeist-small": { ja: "パンプジン（こだましゅ）" },
  "gourgeist-average": { ja: "パンプジン（ちゅうだましゅ）" },
  "gourgeist-large": { ja: "パンプジン（おおだましゅ）" },
  "gourgeist-super": { ja: "パンプジン（ギガだましゅ）" },
  "darmanitan-galar-standard": {
    ja: "ヒヒダルマ（ガラルのすがた・ノーマルモード）",
    en: "Darmanitan (Galarian Form Standard Mode)",
  },
  "darmanitan-galar-zen": {
    ja: "ヒヒダルマ（ガラルのすがた・ダルマモード）",
    en: "Darmanitan (Galarian Form Zen Mode)",
  },
};

/** languages 名前マップ（id → { ja?, en? }）。 */
type LangMap = Record<string, { ja?: string; en?: string }>;

/** data/languages/<file> の名前マップ（`{ <mapKey>: { id → { ja?, en? } } }`）を読む。from-scratch 復元
 * （`data/languages/*` 完全削除）ではファイル不在ゆえ空マップを返す（全 id を未記録として fetch 対象にする・
 * plan 11 P2）。空マップ（`mapKey:` = null）も `?? {}` で吸収する。 */
const readLangMap = (file: string, mapKey: string): LangMap => {
  const path = join(ROOT, "data", "languages", file);
  if (!existsSync(path)) return {};
  const doc = parseYaml(readFileSync(path, "utf8")) as Record<
    string,
    Record<string, { ja?: string; en?: string }>
  >;
  return doc[mapKey] ?? {};
};

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * category の list endpoint から id（`results[].name` スラグ）を全件列挙する。全件名辞書を満たすため未解禁を
 * 含む全 id を取る（`limit` を全件数より大きく取り 1 リクエストで受け切る・ADR 0041）。取得失敗は fail-fast
 * （全件列挙が欠けると差分判定が不正になるため best-effort にしない）。`count`（総数）と実受信 `results.length`
 * の不一致も fail-fast にする（`limit` cap 等で全件を受け切れていない = 差分判定が不正になる状態を検出する）。
 */
async function listAllIds(category: string): Promise<string[]> {
  const url = `${API}/${category}?limit=100000&offset=0`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`[fetch] list ${category} failed (${res.status})`);
  const json = (await res.json()) as { count: number; results: { name: string }[] };
  if (json.results.length !== json.count) {
    throw new Error(
      `[fetch] list ${category} incomplete (${json.results.length}/${json.count}; raise limit)`,
    );
  }
  return json.results.map((r) => r.name);
}

/**
 * item-category whitelist の各 `/item-category/{cat}` を fetch し `items[].name` を集めて union する
 * （重複排除 + sorted・純関数 `sortedUnion` に委譲）。category endpoint は該当 items を一括返却し、list endpoint の
 * ような `count`/`limit` ページングを持たないため件数照合はできない。代わりに **各 cat が 404 でないこと + union が
 * 空でないこと**を fail-fast にする（whitelist の typo・PokeAPI 側のカテゴリ改廃を検知）。issue #213 / [[data-pipeline]]。
 */
async function listCategoryUnion(categories: readonly string[]): Promise<string[]> {
  const lists: string[][] = [];
  for (const cat of categories) {
    const url = `${API}/item-category/${cat}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`[fetch] item-category ${cat} failed (${res.status})`);
    const json = (await res.json()) as { items: { name: string }[] };
    lists.push(json.items.map((i) => i.name));
  }
  const union = sortedUnion(lists);
  if (union.length === 0) {
    throw new Error("[fetch] item-category union is empty (whitelist typo or PokeAPI drift)");
  }
  return union;
}

/**
 * items 剪定の keep 集合（whitelist union）を raw キャッシュに残す。network を持つ本段（`fetch:ja-names`）が
 * union を決め、offline の転記段（`sync:ja-names` = `scripts/materialize.ts`）がこれを読んで items.yaml を
 * union のみへ決定論的に剪定する（issue #213）。raw は .gitignore の取得キャッシュ。
 */
const writeItemUnionManifest = (ids: string[]): void => {
  const file = join(RAW, "item-union.json");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(ids, null, 2)}\n`);
};

/**
 * `names` 補完のための best-effort 取得（404 / 取得失敗は警告して skip・補完しないだけで失敗させない）。
 * Champions 固有メガストーン等は PokeAPI 非存在（404）になるが、これは正常（ja は Serebii 速報 / 手入力で補う）。
 */
async function fetchNamesInto(category: string, name: string): Promise<void> {
  const file = join(RAW, category, `${name}.json`);
  if (existsSync(file)) return;
  const url = `${API}/${category}/${name}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`[fetch] skip ${category}/${name} (names supplement, ${res.status})`);
    return;
  }
  const json = (await res.json()) as Record<string, unknown>;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
  await sleep(50); // PokeAPI への礼儀
  console.log(`[fetch] ${category}/${name} (names)`);
}

/** PokeAPI 詳細エンドポイントの部分形（distinct-forms 列挙で読む欄のみ）。 */
type LangName = { name: string; language: { name: string } };
type SpeciesDetail = {
  names?: LangName[];
  varieties?: { is_default: boolean; pokemon: { name: string } }[];
};
type PokemonDetail = {
  types: { type: { name: string } }[];
  stats: { base_stat: number }[];
  forms: { name: string }[];
};
type FormDetail = { form_names?: LangName[] };

/** distinct-forms の 1 件の決定記録（`pokeapi-names.yml` の PR レビュー表用 manifest）。 */
interface FormDecision {
  id: string;
  en: string;
  ja: string;
  decision: "passthrough" | "compose" | "canonical-override" | "manual";
  basis: string;
}

/**
 * `${category}/${name}` を best-effort 取得して raw キャッシュへ書き（404 / 失敗は null）、キャッシュ済みなら読む。
 * distinct-forms 列挙は `pokemon-species`（varieties）/ `pokemon`（types/stats/forms）/ `pokemon-form`（form_names）の
 * 3 endpoint を横断するため、共通の cached fetch に寄せる（raw は .gitignore の取得キャッシュ）。
 */
async function fetchCached<T>(category: string, name: string): Promise<T | null> {
  const file = join(RAW, category, `${name}.json`);
  if (existsSync(file)) {
    try {
      return JSON.parse(readFileSync(file, "utf8")) as T;
    } catch {
      return null;
    }
  }
  const res = await fetch(`${API}/${category}/${name}`);
  if (!res.ok) {
    console.warn(`[fetch] skip ${category}/${name} (distinct-forms, ${res.status})`);
    return null;
  }
  const json = (await res.json()) as T;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
  await sleep(50);
  return json;
}

/** PokeAPI `pokemon` 詳細を distinct 判定用の構造スナップショット（types 列 + baseStats 6 値）へ畳む。 */
const toShape = (p: PokemonDetail): FormShape => ({
  types: p.types.map((t) => t.type.name),
  baseStats: p.stats.map((s) => s.base_stat),
});

/** 合成名を `{ names: [ja-Hrkt, en] }` として species raw へ書く（`materialize` の species 経路が透過的に拾う）。 */
const writeComposedNames = (id: string, ja: string, en: string): void => {
  const file = join(RAW, "pokemon-species", `${id}.json`);
  const names: LangName[] = [
    { name: ja, language: { name: "ja-Hrkt" } },
    { name: en, language: { name: "en" } },
  ];
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify({ names }, null, 2)}\n`);
};

/** distinct-forms の決定記録 manifest を raw へ書く（`pokeapi-names.yml` が PR レビュー表に整形する）。 */
const writeDistinctManifest = (decisions: FormDecision[]): void => {
  const file = join(RAW, "distinct-forms.json");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(decisions, null, 2)}\n`);
};

/** distinct 根拠の説明（PR レビュー表用）。FORM_INCLUDE は同型・同種族値ゆえ type/stat 差では説明できない。 */
const distinctBasis = (base: FormShape, form: FormShape, forced: boolean): string => {
  if (forced) return "FORM_INCLUDE (same type/stat)";
  const parts: string[] = [];
  if (base.types.join() !== form.types.join()) parts.push("type");
  if (base.baseStats.join() !== form.baseStats.join()) parts.push("stat");
  return parts.join("+");
};

/**
 * distinct-forms 列挙（plan 11 P4・`SPECIES_FORMS` whitelist を置換）。各 `pokemon-species` の varieties を辿り、base
 * （default variety）と**タイプ or 種族値が異なる** variety を採用（`isDistinctForm` + `FORM_INCLUDE`）、**短い canonical id**
 * （`canonicalFormId` で冗長接尾辞を落とす・bare default の明示分割は `CANONICAL_ID_OVERRIDE`）でキーイングして含有合成した
 * ja/en を species raw へ書く。純装飾（同型・同種族値）と `-mega`/`-gmax`/`-primal`/`-totem`/`-starter`（`EXCLUDED_FORM`）・
 * 個別除外（`FORM_EXCLUDE`＝メテノのコア）は除外。既に ja/en 完備の form は skip（差分・冪等）。決定記録は manifest に残し
 * PR レビュー表へ供する。canonical は構造側（`canonicalSpeciesId`）と同じ `canonicalFormId` を通して単一 SoT へ収束する。
 */
async function fetchDistinctForms(speciesIds: string[], speciesMap: LangMap): Promise<void> {
  const baseNames = new Map<string, { ja?: string; en?: string }>();
  const decisions: FormDecision[] = [];
  for (const speciesId of speciesIds) {
    const detail = await fetchCached<SpeciesDetail>("pokemon-species", speciesId);
    const varieties = detail?.varieties ?? [];
    if (varieties.length <= 1) continue; // 単一 variety は form 無し（大多数の種）
    baseNames.set(speciesId, extractNames({ names: detail?.names }));
    // 採用候補（除外パターン外）を canonical key へ写し、既に ja/en 完備なものを落とす（未処理があるときだけ network を叩く）。
    const pending: { slug: string; key: string; isDefault: boolean; bareOverride: boolean }[] = [];
    for (const v of varieties) {
      const slug = v.pokemon.name;
      if (EXCLUDED_FORM.test(slug)) continue;
      if (FORM_EXCLUDE.has(slug)) continue; // 個別除外（メテノのコア等・別種族にしない）
      let key: string;
      let bareOverride = false;
      if (v.is_default && slug === speciesId) {
        const ov = CANONICAL_ID_OVERRIDE[slug];
        if (ov === undefined) continue; // bare default は base 種族名で足りる
        key = ov; // gimmighoul → gimmighoul-chest / hoopa → hoopa-confined（bare→明示分割）
        bareOverride = true;
      } else {
        // explicit default slug / non-default を短い canonical へ正規化（urshifu-single-strike → urshifu-single 等）。
        key = canonicalFormId(slug);
      }
      const cur = speciesMap[key] ?? {};
      if (cur.ja && cur.en) continue; // 既に命名済み（差分・冪等）
      pending.push({ slug, key, isDefault: v.is_default, bareOverride });
    }
    if (pending.length === 0) continue;
    const defaultV = varieties.find((v) => v.is_default);
    const basePoke = defaultV
      ? await fetchCached<PokemonDetail>("pokemon", defaultV.pokemon.name)
      : null;
    if (basePoke === null) continue;
    const baseShape = toShape(basePoke);
    // 兄弟間の純装飾（同型・同種族値の色 / 模様違い）を畳む署名集合。base と type/stat が違っても互いに同型・同種族値な
    // 非デフォルト variety 群（minior の 7 色メテオ等）は 1 代表だけ採用する（cosmetic-color の膨張を機械的に抑える・P4）。
    const seenShapes = new Set<string>();
    for (const p of pending) {
      // default variety の form / types-stats は base（default poke）から、non-default は自身の詳細から取る。
      let poke = basePoke;
      let forced = false;
      let basis: string;
      if (p.isDefault) {
        // explicit default / canonical-override は無条件採用（その種の canonical 形態）。
        basis = "canonical form";
      } else {
        const varPoke = await fetchCached<PokemonDetail>("pokemon", p.slug);
        if (varPoke === null) continue;
        poke = varPoke;
        const shape = toShape(varPoke);
        forced = FORM_INCLUDE.has(p.slug);
        if (!isDistinctForm(baseShape, shape) && !forced) continue; // 純装飾（base と同型・同種族値）は除外
        const sig = `${shape.types.join(",")}|${shape.baseStats.join(",")}`;
        if (seenShapes.has(sig) && !forced) continue; // 兄弟間の純装飾（先着の 1 代表のみ採用）
        seenShapes.add(sig);
        basis = distinctBasis(baseShape, shape, forced);
      }
      const formSlug = poke.forms[0]?.name ?? p.slug;
      const formDetail = await fetchCached<FormDetail>("pokemon-form", formSlug);
      const form = extractNames({ names: formDetail?.form_names });
      const formJa = form.ja ?? "";
      const formEn = form.en ?? "";
      const baseId = deriveBaseId(p.key, speciesIds) ?? speciesId;
      const bn = baseNames.get(baseId) ?? {};
      const composedJa = composeFormName(bn.ja ?? "", formJa, JA_BRACKETS);
      const composedEn = composeFormName(bn.en ?? "", formEn, EN_BRACKETS);
      const override = MANUAL_NAME_OVERRIDE[p.key] ?? {};
      const ja = override.ja ?? composedJa;
      const en = override.en ?? composedEn;
      const decision: FormDecision["decision"] =
        p.key in MANUAL_NAME_OVERRIDE
          ? "manual"
          : p.bareOverride
            ? "canonical-override"
            : formJa.length > 0 && bn.ja !== undefined && formJa.includes(bn.ja)
              ? "passthrough"
              : "compose";
      writeComposedNames(p.key, ja, en);
      decisions.push({ id: p.key, en, ja, decision, basis });
      console.log(`[fetch] distinct-form ${p.key} (${decision}: ${ja} / ${en})`);
    }
  }
  writeDistinctManifest(decisions);
}

/** ja / en の少なくとも一方を欠くか（全 5 種とも languages を ja/en 完備の全件辞書にするため PokeAPI から両取り）。 */
const needsJaEn = (v: { ja?: string; en?: string }): boolean => !v.ja || !v.en;

/**
 * 名前 SoT（`languages/*.yaml`）を PokeAPI から埋める 6 種と、取得元 category（詳細）+ list category（全件列挙）の
 * 対応。5 種（species / items / moves / abilities / types）は `names` から、**mega は `pokemon-form` 経路**から取る
 * （list=`pokemon-form` を全件列挙 → `filterIds` で mega 候補 slug に絞り → 各 form 詳細の `form_names` / `is_mega` を
 * 取得・ADR 0043）。list と category は PokeAPI では同名だが、意味（列挙 endpoint / 詳細 endpoint）を分けて明示する。
 */
const DATASETS: {
  file: string;
  mapKey: string;
  list: string;
  category: string;
  /** items だけ設定。list endpoint 全件でなく item-category whitelist の union で列挙する（issue #213）。 */
  listCategories?: readonly string[];
  /** mega だけ設定。list 全 slug から取得対象を絞る（mega 候補 slug だけ fetch する・ADR 0043）。 */
  filterIds?: (ids: string[]) => string[];
}[] = [
  { file: "species.yaml", mapKey: "species", list: "pokemon-species", category: "pokemon-species" },
  {
    file: "items.yaml",
    mapKey: "items",
    list: "item",
    category: "item",
    listCategories: ITEM_CATEGORIES,
  },
  { file: "moves.yaml", mapKey: "moves", list: "move", category: "move" },
  { file: "abilities.yaml", mapKey: "abilities", list: "ability", category: "ability" },
  { file: "types.yaml", mapKey: "types", list: "type", category: "type" },
  {
    file: "mega.yaml",
    mapKey: "mega",
    list: "pokemon-form",
    category: "pokemon-form",
    filterIds: megaFormCandidates,
  },
];

async function main(): Promise<void> {
  let speciesIds: string[] = [];
  for (const ds of DATASETS) {
    const map = readLangMap(ds.file, ds.mapKey);
    // items は item-category whitelist の union で列挙し union manifest を残す（sync:ja-names が剪定に使う・issue #213）。
    // 他 4 種は list endpoint で全 id を列挙する（全件辞書・count 照合の fail-fast は listAllIds 側で維持）。
    // いずれも既存 languages と差分突き合わせ（ja/en 完備の id はスキップ・未記録 / 欠落 id のみ best-effort 取得・ADR 0041）。
    const listed = ds.listCategories
      ? await listCategoryUnion(ds.listCategories)
      : await listAllIds(ds.list);
    // mega は全 form slug（count fail-fast は listAllIds で維持）を mega 候補へ絞ってから取得する（ADR 0043）。
    const ids = ds.filterIds ? ds.filterIds(listed) : listed;
    if (ds.mapKey === "species") speciesIds = ids; // distinct-forms 列挙の母集合に再利用
    if (ds.listCategories) writeItemUnionManifest(ids);
    for (const id of ids) {
      if (needsJaEn(map[id] ?? {})) await fetchNamesInto(ds.category, id);
    }
  }
  // distinct-forms（タイプ / 種族値が base と異なる全 form）を pokemon-species → varieties から機械列挙して
  // 含有合成した ja/en を species raw へ書く（`SPECIES_FORMS` whitelist を廃止・plan 11 P4）。
  const speciesMap = readLangMap("species.yaml", "species");
  await fetchDistinctForms(speciesIds, speciesMap);
  // PokeAPI に variety が無い地方フォルムの base（darmanitan-galar 等）を直接 raw 化して補う（差分・冪等）。
  for (const [id, names] of Object.entries(SYNTHETIC_BASE_FORMS)) {
    const cur = speciesMap[id] ?? {};
    if (cur.ja && cur.en) continue;
    writeComposedNames(id, names.ja, names.en);
    console.log(`[fetch] synthetic-base ${id} (${names.ja} / ${names.en})`);
  }
  console.log("[fetch] done (names)");
}

await main();
