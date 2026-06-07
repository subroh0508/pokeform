/**
 * 持ち物エントリの親型（統一パターンの XxxBase）。ItemDex / ItemId は
 * `data/generated/items.ts` が派生する。詳細は .claude/rules/type-conventions.md。
 */
export interface ItemBase {
  readonly id: string;
  readonly name: { readonly en: string; readonly ja: string };
  /** メガストーン等の分類（任意）。 */
  readonly category?: string;
  /** メガストーンの場合のメガ先種族 id（[[game-spec]] のメガ二重表現）。per-reg dex 側で
   *  legality を見るため素の `string`（global SpeciesId への自己参照を避ける）。 */
  readonly megaStoneFor?: string;
}
