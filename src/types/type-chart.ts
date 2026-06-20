/**
 * タイプ相性の骨格型。18 タイプの union（PokemonType）と、相性表エントリの親型（TypeBase）を定義する。
 * 実データ（TypeDex の各タイプ子型・倍率）は Phase 1 で `src/generated/` に生成する。
 * 統一パターン（XxxBase + XxxDex + XxxId = keyof XxxDex）は .claude/rules/type-conventions.md を参照。
 */

/** 攻撃タイプ → 防御タイプの被ダメージ倍率（無効 / 半減 / 等倍 / 抜群）。 */
export type TypeMultiplier = 0 | 0.5 | 1 | 2;

/** 18 タイプの union。Phase 1 で `PokemonType = keyof TypeDex` に統一する（[[type-conventions]]）。 */
export type PokemonType =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

/** 1 タイプの全防御タイプに対する攻撃倍率表。複合タイプは各倍率の積で算出する。 */
export type TypeChart = { readonly [K in PokemonType]: TypeMultiplier };

/**
 * タイプ相性 spec エントリの親型（統一パターンの XxxBase）。`src/generated/champions/type-specs.ts`
 * （`typeSpecsDex`）が派生する。**名前は持たない**（名前の SoT は `data/languages/types.yaml`・ADR 0035）。
 * coverage / 相性計算はこの `damageTo` を引き、表示名は `languages/types.ts` を引く。
 */
export interface TypeSpec {
  readonly id: PokemonType;
  /** この攻撃タイプが各防御タイプへ与える倍率。 */
  readonly damageTo: TypeChart;
}
