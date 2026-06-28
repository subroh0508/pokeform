/**
 * id-shape.ts（serebii codegen 純関数）— catalog id の形（小文字英数 + 単一ハイフン区切り）への適合判定。
 * `schema.ts` の健全性検証（stage 4）が、未知 slug の混入や正規化漏れを id 形不適合として弾くのに使う。
 */

/** catalog id の形（小文字英数 + 単一ハイフン区切り・先頭末尾ハイフン無し）。 */
export const ID_SHAPE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** id が catalog id の形に適合するか（schema 健全性判定 = stage 4 の源）。 */
export function isCatalogIdShape(id: string): boolean {
  return ID_SHAPE.test(id);
}
