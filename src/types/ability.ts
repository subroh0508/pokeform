/**
 * 特性エントリの親型（統一パターンの XxxBase）。AbilitySpecsDex / AbilityId は
 * `src/generated/champions/ability-specs.ts` が派生する。**名前は持たない**（名前の SoT は
 * `data/languages/abilities.yaml`・ja→id 逆引きは consumer が実行時導出・ADR 0035）。効果フィールドは
 * 後続フェーズで追加する前提で生成ファイル自体は残す。詳細は .claude/rules/type-conventions.md。
 */
export interface AbilityBase {
  readonly id: string;
}
