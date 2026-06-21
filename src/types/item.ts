/**
 * 持ち物エントリの親型（統一パターンの XxxBase）。ItemSpecsDex / ItemId は
 * `src/generated/champions/item-specs.ts` が派生する。**名前は持たない**（名前の SoT は
 * `data/languages/items.yaml`・ja→id 逆引きは consumer が実行時導出・ADR 0035）。効果フィールドは
 * 後続フェーズで追加する前提で生成ファイル自体は残す。詳細は .claude/rules/type-conventions.md。
 */
export interface ItemBase {
  readonly id: string;
  /** メガストーン等の分類（任意・data/raw 由来）。 */
  readonly category?: string;
  /** メガストーンの場合のメガ先種族 id（[[game-spec]] のメガ二重表現）。per-reg dex 側で
   *  legality を見るため素の `string`（global SpeciesId への自己参照を避ける）。 */
  readonly megaStoneFor?: string;
  /** メガストーンの場合の**メガ形態** SpeciesId（X/Y を区別する・例 `charizard-mega-x`）。
   *  `megaStoneFor` は base を指し X↔Y を引けないため、メガ形態種族の持ち物ロックに使う
   *  （generate が本リンクから per-reg メガ形態種の `items` 対応ストーンタプルを決定論導出する）。
   *  per-reg dex 側で legality を見るため素の `string`（global SpeciesId への自己参照を避ける）。
   *  skill 著述 / Phase 9 由来で PokeAPI 非由来。 */
  readonly megaSpecies?: string;
}
