import type { SpeciesId } from "./species.ts";

/**
 * 持ち物エントリの親型（統一パターンの XxxBase）。ItemDex / ItemId は
 * `data/generated/items.ts` が派生する。詳細は .claude/rules/type-conventions.md。
 */
export interface ItemBase {
  readonly id: string;
  readonly name: { readonly en: string; readonly ja: string };
  /** メガストーン等の分類（任意）。 */
  readonly category?: string;
  /** メガストーンの場合のメガ先種族（[[game-spec]] のメガ二重表現）。 */
  readonly megaStoneFor?: SpeciesId;
}
