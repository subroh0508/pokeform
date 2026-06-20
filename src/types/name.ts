/**
 * 名前エントリの親型（統一パターンの XxxBase）。`src/generated/languages/*.ts`（`speciesNames` /
 * `moveNames` 等）が `as const satisfies Record<string, NameEntry>` から派生する。名前はゲーム非依存の
 * SoT として `data/languages/*.yaml` に分離した（構造データ = `data/champions/*-specs.yaml` から直交・
 * ADR 0035）。生成側は id→{ id, name:{ ja, en } } の forward マップで持ち、ja→id 逆引きは consumer が
 * 実行時に導出する（[[cli-and-io]]）。
 */
export interface NameEntry {
  readonly id: string;
  readonly name: { readonly en: string; readonly ja: string };
}
