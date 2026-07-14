/**
 * materialize.ts（codegen 純関数）— PokeAPI raw JSON から名前（ja/en）を抽出・転記計画する純変換。
 * fs / YAML I/O は `scripts/materialize.ts`（薄い orchestrator・coverage 除外）が担う。
 *
 * **名前専任**（plan 10）: 構造データ（種族値 / タイプ / 特性 id / 図鑑番号 / category）の取得・転記は
 * pokemon-showdown 経路（`src/codegen/showdown/*`）へ移管した。本ファイルは **名前 SoT（`languages/*.yaml`）** の
 * ja/en を PokeAPI `names` から補完する材料だけを持つ（全件名辞書・ADR 0041・[[data-pipeline]]）。skill 著述値は
 * `planFields` で「既存尊重・上書きしない」（未設定のみ fill・差分は conflict 報告）。
 *
 * **distinct-forms 名前生成**（plan 11 P4）: タイプ / 種族値が base と異なる form の ja/en を含有判定合成する純関数
 * （`composeFormName` / `isDistinctForm` / `deriveBaseId`）も持つ。IO（varieties の列挙・raw 書き込み）は
 * `scripts/fetch-pokeapi.ts`（coverage 除外）が担い、判断分岐を持つ純関数を本ファイル（カバレッジ 100%）へ寄せる。
 */
import { type Document, isMap, YAMLMap } from "yaml";

/** PokeAPI の多言語名エントリ（`names` / `form_names` 共通の要素形）。 */
interface LangName {
  name: string;
  language: { name: string };
}

/** PokeAPI の `names` を持つ raw（pokemon-species / item / move / ability に共通）。 */
interface RawNamed {
  names?: LangName[];
}

/**
 * PokeAPI の `pokemon-form` 詳細のうち mega 名取得に使う欄。メガ名は 5 種と違い category `names` でなく form の
 * `form_names` に載り、`is_mega` で判別する（[[data-pipeline]] の mega=PokeAPI(pokemon-form form_names)・ADR 0043）。
 */
interface RawForm {
  is_mega?: boolean;
  form_names?: LangName[];
}

/** 言語コード（小文字化して揺れ `ja-Hrkt`/`ja-hrkt` を吸収）で表示名を引く共通ヘルパ。 */
const findLangName = (names: LangName[], code: string): string | undefined =>
  names.find((n) => n.language.name.toLowerCase() === code)?.name;

/**
 * `names` 系配列から日本語名を取り出す（**ja-Hrkt を優先・無ければ ja**）。日本語名の取得元を PokeAPI names と
 * 定める（plan 10 で正＝PokeAPI ja・速報＝Serebii の二経路に整理）。該当名が無ければ `undefined`（呼び出し側は fill しない）。
 */
const pickJa = (names: LangName[]): string | undefined =>
  findLangName(names, "ja-hrkt") ?? findLangName(names, "ja");

/** raw の `names` から日本語名を取り出す（ja-Hrkt 優先）。 */
export function extractJaName(raw: RawNamed): string | undefined {
  return pickJa(raw.names ?? []);
}

/** raw の `names` から英語名を取り出す（特性のように Serebii が表示名を持たない種別の en 補完源）。 */
export function extractEnName(raw: RawNamed): string | undefined {
  return findLangName(raw.names ?? [], "en");
}

/** 日英名のうち**取得できた欄だけ**を持つオブジェクトを組む（`planFields` が undefined を fill しないよう）。 */
export function extractNames(raw: RawNamed): { ja?: string; en?: string } {
  const out: { ja?: string; en?: string } = {};
  const ja = extractJaName(raw);
  const en = extractEnName(raw);
  if (ja !== undefined) out.ja = ja;
  if (en !== undefined) out.en = en;
  return out;
}

/**
 * `pokemon-form` 詳細から mega の ja/en を取り出す。**`is_mega: true` の form だけ**を対象にし（それ以外は空 =
 * 呼び出し側が append/backfill しない）、`form_names` から ja（ja-Hrkt 優先）と en を両取りする。PokeAPI slug
 * （`charizard-mega-x` / `staraptor-mega`）は pokeform の mega id 規約（`<base>-mega[-x|-y]`・ADR 0040）と一致する
 * ため id 正規化は不要（呼び出し側は slug をそのまま id に使う）。
 */
export function extractMegaNames(raw: RawForm): { ja?: string; en?: string } {
  if (raw.is_mega !== true) return {};
  const names = raw.form_names ?? [];
  const out: { ja?: string; en?: string } = {};
  const ja = pickJa(names);
  const en = findLangName(names, "en");
  if (ja !== undefined) out.ja = ja;
  if (en !== undefined) out.en = en;
  return out;
}

/**
 * `pokemon-form` list の全 slug から mega 形態の候補 slug だけを抽出する（`<base>-mega` / `-mega-x` / `-mega-y` /
 * `-mega-z`）。取得（fetch）を全 form 詳細 1500+ 件でなく mega 候補へ絞るための事前フィルタで、最終的な mega 判別は
 * 取得後の `is_mega`（`extractMegaNames`）が正とする。`meganium` / `yanmega`（`-` を挟まない substring）や
 * `-primal`（`is_mega: false`）は候補に入らない。
 */
export function megaFormCandidates(slugs: string[]): string[] {
  return slugs.filter((s) => /-mega($|-x$|-y$|-z$)/.test(s));
}

/**
 * 装飾フォルム（姿差・色差のみで別種族にしない form）に PokeAPI が付ける mega slug を、単一の canonical
 * `<baseSpecies>-mega` へ畳む curated マップ。ADR 0043 の「mega slug = id 恒等」前提の refine で、species 側の
 * `FORM_EXCLUDE`（`tatsugiri-curly` / `pyroar-male` 等）と対をなす mega 版。対象は PokeAPI `pokemon-form` が
 * `is_mega: true` で返す未実装・データマインド由来の orphan（構造 `mega-specs.yaml` には存在しない）:
 * - `magearna-original-mega`（オリジナルカラー）→ `magearna-mega`
 * - `tatsugiri-{curly,droopy,stretchy}-mega`（3 姿）→ `tatsugiri-mega`
 * gender メガ（`meowstic-*-mega`）は畳まない — 構造メガが実在し ADR 0046 で learnset 差により per-gender 保持が
 * 確定しているため（本マップは装飾 forme 専用で gender には触れない）。
 */
export const MEGA_ID_COLLAPSE: Record<string, string> = {
  "magearna-original-mega": "magearna-mega",
  "tatsugiri-curly-mega": "tatsugiri-mega",
  "tatsugiri-droopy-mega": "tatsugiri-mega",
  "tatsugiri-stretchy-mega": "tatsugiri-mega",
};

/**
 * 畳んだ canonical mega id の名前 override。装飾 forme を単一 id へ畳むと PokeAPI `form_names` の en が姿別
 * （"Mega Curly Tatsugiri" 等）で canonical に合わないため、ここで正しい単一名を与える（抽出名より優先）。
 * `magearna-mega` は既存の raw（"Mega Magearna"）が正しいので override 不要。ja は 3 姿とも「メガシャリタツ」で
 * 差が無いが決定論のため明示する。
 */
export const MEGA_NAME_OVERRIDE: Record<string, { ja?: string; en?: string }> = {
  "tatsugiri-mega": { ja: "メガシャリタツ", en: "Mega Tatsugiri" },
};

/** mega slug → canonical mega id。装飾 forme の姿別 slug を `<base>-mega` へ畳み、それ以外は恒等（冪等）。 */
export function canonicalMegaId(slug: string): string {
  return MEGA_ID_COLLAPSE[slug] ?? slug;
}

/**
 * mega の raw slug + 抽出名から、languages へ書く canonical エントリ（id + names）を解決する純関数。id を
 * `canonicalMegaId` で畳み、`MEGA_NAME_OVERRIDE` があれば欄ごとに上書きする（override 欄のみ差し替え・
 * 抽出名を温存）。`scripts/materialize.ts`（IO）の mega backfill が転記前の transform として通す。
 */
export function resolveMegaEntry(
  slug: string,
  names: { ja?: string; en?: string },
): { id: string; names: { ja?: string; en?: string } } {
  const id = canonicalMegaId(slug);
  const override = MEGA_NAME_OVERRIDE[id];
  return { id, names: override ? { ...names, ...override } : names };
}

/**
 * languages/mega.yaml の既存 id 集合から、畳み込みで不要になった姿別 source id（`MEGA_ID_COLLAPSE` のキー）を
 * 剪定対象として返す純関数。**canonical target が既存に在るものだけ**を返し（名前の消失を防ぐ）、IO 側
 * （`scripts/materialize.ts`）が該当ノードを削除する。剪定は mega backfill の後（canonical id 追加後）に走らせる。
 */
export function megaIdsToPrune(existingIds: string[]): string[] {
  const present = new Set(existingIds);
  return existingIds.filter((id) => {
    const target = MEGA_ID_COLLAPSE[id];
    return target !== undefined && present.has(target);
  });
}

/**
 * 複数リストの union を重複排除 + 昇順ソートで作る（items の item-category whitelist union 計算・issue #213）。
 * PokeAPI の `item-category/{cat}` は該当 items をカテゴリごとに返すため、各カテゴリの `items[].name` 群を
 * 渡して 1 本の決定論的な id 集合へ畳む。全件辞書の items をこの union のみへ絞る keep 集合になる。
 */
export function sortedUnion(lists: string[][]): string[] {
  return [...new Set(lists.flat())].sort();
}

/**
 * `existingIds` を `keepIds`（whitelist union）で仕分けし、残す id（`kept`）と除去する id（`removed`）に分ける
 * 純関数（items.yaml 剪定計画・issue #213）。実際の YAML ノード削除は IO shell（`scripts/materialize.ts`）が
 * `removed` を使って行う。並びは `existingIds` の順を保つ（decision を呼び出し側の書き出し順に委ねる）。
 */
export function pruneToKeep(
  existingIds: string[],
  keepIds: string[],
): { kept: string[]; removed: string[] } {
  const keep = new Set(keepIds);
  const kept: string[] = [];
  const removed: string[] = [];
  for (const id of existingIds) {
    if (keep.has(id)) kept.push(id);
    else removed.push(id);
  }
  return { kept, removed };
}

/**
 * `doc` の `mapKey` 直下の YAMLMap を **取得（無ければ block スタイルで新規作成して set）** する。
 * from-scratch 復元（`data/languages/*.yaml` 完全削除）で `sync:ja-names` が scaffold / seed 無しに動くための耐性化
 * （plan 11 P2）。空 block map は YAML 構文上表現できず、`mapKey:`（null）は `doc.get` が undefined を返し
 * `map.get` で crash、`mapKey: {}`（flow）は追記後も flow のまま残り `check:yaml-style` に弾かれる。そこで
 * **null / undefined / 非 map のときは `flow=false` の空 YAMLMap を新規作成**して以降の append が block で載るようにする。
 * 既存が map なら（過去に flow で書かれていても）`flow=false` を強制して block へ寄せる。IO（ファイル存在チェック /
 * doc 生成）は呼び出し側（`scripts/materialize.ts`）が持ち、本関数は doc 上の map ノード確保だけを純粋に行う。
 */
export function getOrCreateBlockMap(doc: Document, mapKey: string): YAMLMap {
  const existing = doc.get(mapKey);
  if (isMap(existing)) {
    existing.flow = false;
    return existing;
  }
  const map = new YAMLMap();
  map.flow = false;
  doc.set(mapKey, map);
  return map;
}

/**
 * distinct-forms 名前合成の括弧スタイル（`composeFormName` の `brackets` 引数）。ja は全角「（）」・en は半角 " ()"
 * を対称に渡す（plan 11 P4・[[data-pipeline]]）。open 側に en の前置スペースを含めて ja/en を同一関数へ寄せる。
 */
export const JA_BRACKETS: readonly [string, string] = ["（", "）"];
export const EN_BRACKETS: readonly [string, string] = [" (", ")"];

/**
 * form 名の**含有判定合成**（distinct-forms・plan 11 P4）。`form_names` が base 種族名を**含む**ならそのまま採用
 * （改名フォルム `ヒートロトム` / `ウォッシュロトム` / `サトシゲッコウガ` はアイデンティティを内包する）、**含まない**なら
 * `base名（formName）`（ja）/ `base名 (formName)`（en）で合成する（`ザシアン（けんのおう）` / `Raichu (Alolan Form)`）。
 * 合成側は必ず base 名を先頭に置くためアイデンティティを誤らない。`formName` 空（`greninja-battle-bond` の form_names
 * 欠落等）は base 名のみを返す（呼び出し側が `MANUAL_NAME_OVERRIDE` で最終名を与える）。ja/en は `brackets` の差だけで
 * 同一ロジックに載る（`JA_BRACKETS` / `EN_BRACKETS`）。
 */
export function composeFormName(
  baseName: string,
  formName: string,
  brackets: readonly [string, string],
): string {
  if (formName.length === 0) return baseName;
  if (formName.includes(baseName)) return formName;
  return `${baseName}${brackets[0]}${formName}${brackets[1]}`;
}

/** distinct 判定に使う form の構造スナップショット（タイプ列と種族値 6 値・PokeAPI の並び順のまま）。 */
export interface FormShape {
  types: string[];
  baseStats: number[];
}

const arraysEqual = <T>(a: readonly T[], b: readonly T[]): boolean =>
  a.length === b.length && a.every((x, i) => x === b[i]);

/**
 * base と form が**タイプ or 種族値で異なるか**（distinct フィルタ述語・plan 11 P4）。純装飾フォルム（同型・同種族値の
 * vivillon 模様 / alcremie / minior 色）は false（除外）、リージョン / フォルム差（type/stat が動く）は true（採用）。
 * PokeAPI の並び（types の slot 順 / stats の hp..speed 順）をそのまま順序比較する（並びが動けば別形態とみなす）。
 * 同ステータスでも別種族にしたい form（`greninja-battle-bond`）は呼び出し側 `FORM_INCLUDE` で別途拾う。
 */
export function isDistinctForm(base: FormShape, form: FormShape): boolean {
  return !arraysEqual(base.types, form.types) || !arraysEqual(base.baseStats, form.baseStats);
}

/**
 * form id → base 種族 id を**最長 base-slug 前置一致**で導く（plan 11 P4）。`baseSlugs`（`pokemon-species` の全 id）の
 * うち `formId` に完全一致するか `<slug>-` で前置一致するものの中から最長を採る。`raichu-alola`→`raichu` /
 * `tauros-paldea-combat-breed`→`tauros` / `mr-mime-galar`→`mr-mime`（`mr` より長い前置を優先）。該当なしは undefined。
 */
export function deriveBaseId(formId: string, baseSlugs: Iterable<string>): string | undefined {
  let best: string | undefined;
  for (const slug of baseSlugs) {
    if (
      (formId === slug || formId.startsWith(`${slug}-`)) &&
      (best === undefined || slug.length > best.length)
    ) {
      best = slug;
    }
  }
  return best;
}

/** 転記計画: 未設定フィールドは fill・既存と raw が食い違うフィールドは conflict（上書きしない）。 */
export interface FieldPlan<T> {
  /** 未設定のため raw 由来値で埋めるフィールド。 */
  fill: Partial<T>;
  /** 既存値が raw と異なるフィールド（skill 著述値尊重で上書きしない・要目視）。 */
  conflicts: { key: keyof T; existing: unknown; fresh: unknown }[];
}

/**
 * 既存 languages 値（`existing`）と raw 由来値（`fresh`）を比較し、転記計画を作る。
 * **append/既存尊重**: 未設定（`undefined`）のみ `fill` し、既に値があるフィールドは raw と異なっても
 * 上書きせず `conflicts` に積む（Champions 実態に合わせた skill 著述値を保護する）。
 */
export function planFields<T extends object>(existing: Partial<T>, fresh: T): FieldPlan<T> {
  const fill: Partial<T> = {};
  const conflicts: FieldPlan<T>["conflicts"] = [];
  for (const key of Object.keys(fresh) as (keyof T)[]) {
    if (existing[key] === undefined) {
      fill[key] = fresh[key];
    } else if (JSON.stringify(existing[key]) !== JSON.stringify(fresh[key])) {
      conflicts.push({ key, existing: existing[key], fresh: fresh[key] });
    }
  }
  return { fill, conflicts };
}
