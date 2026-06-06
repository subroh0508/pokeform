/**
 * 特性エントリの親型（統一パターンの XxxBase）。AbilityDex / AbilityId は
 * `data/generated/abilities.ts` が派生する。詳細は .claude/rules/type-conventions.md。
 */
export interface AbilityBase {
  readonly id: string;
  readonly name: { readonly en: string; readonly ja: string };
}
