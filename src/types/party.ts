/**
 * パーティ / 個体ファイルの**生（パース直後）** の形。名称はまだ ID 正規化されておらず
 * 日本語名 or 英名の文字列。正規化・検証は `src/io/load-party.ts` が行う（[[cli-and-io]]）。
 * Phase 2 で導入する型レベルの個体ジェネリック制約（IndividualSpec<S>）とは別の軽量ランタイム型。
 */

/** 入力ファイルの記述言語（ファイル単位宣言・未指定の既定は ja）。 */
export type Lang = "ja" | "en";

/** 個体 YAML の生の形（名称は ID 正規化前の文字列）。 */
export interface IndividualFile {
  readonly lang?: Lang;
  readonly species: string;
  readonly nature: { readonly up: string; readonly down: string };
  readonly ability: string;
  readonly item: string;
  readonly points: Record<string, number>;
  readonly moves: readonly string[];
}

/** パーティ Markdown frontmatter の生の形。 */
export interface PartyFrontmatter {
  readonly party: string;
  readonly regulation: string;
  readonly lang?: Lang;
  /** 各メンバー個体ファイルへの相対パス。 */
  readonly members: readonly string[];
}
