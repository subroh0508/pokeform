/**
 * 特性エントリの親型（統一パターンの XxxBase）。AbilityDex / AbilityId は
 * `data/generated/abilities.ts` が派生する。**名前は持たない**（名前の SoT は
 * `data/champions/catalog/abilities.yaml`・ja→id 逆引きは `names.ts`・Phase 10）。効果フィールドは
 * 後続フェーズで追加する前提で生成ファイル自体は残す。詳細は .claude/rules/type-conventions.md。
 */
export interface AbilityBase {
  readonly id: string;
}
