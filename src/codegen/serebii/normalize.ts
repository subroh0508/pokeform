/**
 * normalize.ts（serebii codegen 純関数）— Serebii の表示名 / 圧縮 slug を catalog id（kebab-case）へ
 * 正規化する純変換。Serebii の技 / 特性リンクは圧縮 slug（`aerialace` / `sandveil`）で catalog id
 * （`aerial-ace` / `sand-veil`）とずれるため、**圧縮 slug からはハイフン位置を復元できない**。よって
 * 正規化は**表示名**（`Aerial Ace` / `Sand Veil`）を入力とし、決定論的に kebab 化する。
 *
 * 未知 slug を新規 catalog id として勝手に作らないよう、既知 catalog id 集合に対する照合
 * （`normalizeAgainstCatalog`）を提供する。catalog 書き込み（Phase 3）はこの照合で未知を弾く。
 * fs / catalog I/O は持たない（呼び出し側が既知集合を渡す）。
 */

/** catalog id の形（小文字英数 + 単一ハイフン区切り・先頭末尾ハイフン無し）。 */
export const ID_SHAPE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** id が catalog id の形に適合するか（schema 健全性判定 = exit 4 の源）。 */
export function isCatalogIdShape(id: string): boolean {
  return ID_SHAPE.test(id);
}

/**
 * 表示名 → catalog id（kebab-case）。小文字化し、アポストロフィ / ピリオドは**除去**（`Forest's Curse`
 * → `forests-curse`）、残る非英数字の連続を単一ハイフンへ畳み、前後のハイフンを落とす。`exceptions` に
 * 載るキー（小文字化した表示名）は決定論変換では復元できない対応（例: `Hi Jump Kick` → `high-jump-kick`）の
 * 上書きに使う。デフォルトの `EXCEPTIONS` は空で、Serebii 表示名が決定論 kebab と食い違う技が判明したら追記する。
 */
export function toCatalogId(
  name: string,
  exceptions: Readonly<Record<string, string>> = EXCEPTIONS,
): string {
  const key = name.trim().toLowerCase();
  const override = exceptions[key];
  if (override !== undefined) return override;
  return key
    .replace(/['.’]/g, "") // アポストロフィ（' / ’）・ピリオドは区切らず除去
    .replace(/[^a-z0-9]+/g, "-") // 残る非英数字の連続をハイフンへ
    .replace(/^-+|-+$/g, ""); // 前後のハイフンを落とす
}

/** 決定論 kebab では catalog id を復元できない表示名の上書き表（判明次第追記・既定は空）。 */
export const EXCEPTIONS: Readonly<Record<string, string>> = {};

/**
 * 持ち物の表示名 → catalog id 上書き表（技 / 特性の `EXCEPTIONS` と別管理）。Serebii items.shtml の
 * item slug は圧縮形（`choicescarf` / `never-meltice`）で catalog / PokeAPI slug（`choice-scarf` /
 * `never-melt-ice`）とずれ、**圧縮 slug からはハイフン位置を復元できない**。よって正規化は技 / 特性と同様
 * **表示名**（`Choice Scarf` / `Never-Melt Ice`）を入力に決定論 kebab 化する。決定論変換で復元できない綴りの
 * 持ち物が判明したらここへ追記する（既定は空）。
 */
export const ITEM_EXCEPTIONS: Readonly<Record<string, string>> = {};

/**
 * 持ち物の表示名 → catalog id（kebab-case）。`toCatalogId` を `ITEM_EXCEPTIONS` で適用する薄いラッパ。
 * 未知 slug を新規 catalog id として勝手に作らないガードは、`normalizeAgainstCatalog(name, known,
 * ITEM_EXCEPTIONS)` を用いる（catalog 書き込み = Phase 3 がそれで未知を弾く）。
 */
export function normalizeItemName(name: string): string {
  return toCatalogId(name, ITEM_EXCEPTIONS);
}

/** 照合結果: 正規化 id と、既知 catalog id 集合に存在するか（未知 = 新規作成ガード対象）。 */
export interface NormalizedId {
  id: string;
  known: boolean;
}

/**
 * 表示名を catalog id へ正規化し、既知集合に対して照合する。`known === false` は未知 slug で、
 * 呼び出し側（catalog 書き込み）は新規 id を勝手に作らずエスカレーションする（誤 id 混入防止）。
 */
export function normalizeAgainstCatalog(
  name: string,
  known: ReadonlySet<string>,
  exceptions: Readonly<Record<string, string>> = EXCEPTIONS,
): NormalizedId {
  const id = toCatalogId(name, exceptions);
  return { id, known: known.has(id) };
}
