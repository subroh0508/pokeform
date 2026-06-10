/**
 * 持ち物エントリの親型（統一パターンの XxxBase）。ItemDex / ItemId は
 * `data/generated/items.ts` が派生する。**名前は持たない**（名前の SoT は
 * `data/champions/catalog/items.yaml`・ja→id 逆引きは `names.ts`・Phase 10）。効果フィールドは
 * 後続フェーズで追加する前提で生成ファイル自体は残す。詳細は .claude/rules/type-conventions.md。
 */
export interface ItemBase {
  readonly id: string;
  /** メガストーン等の分類（任意・data/raw 由来）。 */
  readonly category?: string;
  /** メガストーンの場合のメガ先種族 id（[[game-spec]] のメガ二重表現）。per-reg dex 側で
   *  legality を見るため素の `string`（global SpeciesId への自己参照を避ける）。 */
  readonly megaStoneFor?: string;
}
