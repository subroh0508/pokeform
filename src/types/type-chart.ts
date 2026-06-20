/**
 * タイプ相性の骨格型。18 タイプの union（PokemonType）と、相性表エントリの親型（TypeBase）を定義する。
 * 実データ（TypeDex の各タイプ子型・倍率）は Phase 1 で `data/generated/` に生成する。
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

/** 相性表エントリの親型（統一パターンの XxxBase）。子型は Phase 1 で specialize する。 */
export interface TypeBase {
  readonly id: PokemonType;
  readonly name: { readonly en: string; readonly ja: string };
  /** この攻撃タイプが各防御タイプへ与える倍率。 */
  readonly damageTo: TypeChart;
}
