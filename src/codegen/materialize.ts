/**
 * materialize.ts（codegen 純関数）— PokeAPI raw JSON から日本語名 ja（および技 / 特性の en）を
 * 抽出・転記計画する純変換。fs / YAML I/O は `scripts/materialize.ts`（薄い orchestrator・coverage 除外）が担う。
 *
 * **ja 専任**（plan 10）: 構造データ（種族値 / タイプ / 特性 id / 図鑑番号 / category）の取得・転記は
 * pokemon-showdown 経路（`src/codegen/showdown/*`）へ移管した。本ファイルは **名前 SoT（`languages/*.yaml`）** の
 * ja を PokeAPI `names` から補完する材料だけを持つ（[[data-pipeline]]）。skill 著述値は `planFields` で
 * 「既存尊重・上書きしない」（未設定のみ fill・差分は conflict 報告）。
 */

/** PokeAPI の `names` を持つ raw（pokemon-species / item / move / ability に共通）。 */
interface RawNamed {
  names?: { name: string; language: { name: string } }[];
}

/**
 * raw の `names` から日本語名を取り出す（**ja-Hrkt を優先・無ければ ja**）。日本語名の取得元を PokeAPI names と
 * 定める（plan 10 で正＝PokeAPI ja・速報＝Serebii の二経路に整理）。language 名は大文字小文字の揺れ
 * （`ja-Hrkt` / `ja-hrkt`）を吸収する。該当名が無ければ `undefined`（呼び出し側は fill しない）。
 */
export function extractJaName(raw: RawNamed): string | undefined {
  const names = raw.names ?? [];
  const lang = (code: string): string | undefined =>
    names.find((n) => n.language.name.toLowerCase() === code)?.name;
  return lang("ja-hrkt") ?? lang("ja");
}

/** raw の `names` から英語名を取り出す（特性のように Serebii が表示名を持たない種別の en 補完源）。 */
export function extractEnName(raw: RawNamed): string | undefined {
  return (raw.names ?? []).find((n) => n.language.name.toLowerCase() === "en")?.name;
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
