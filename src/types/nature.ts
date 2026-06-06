import type { StatKey } from "./stats.ts";

/**
 * 性格補正の指定。上げ能力（×1.1）と下げ能力（×0.9）を 1 つずつ選ぶ。
 * 上げ・下げに同一能力は選べない（型レベルで `down: Exclude<StatKey, up>` を強制）。
 * 詳細は .claude/rules/game-spec.md を参照。
 */
export type NatureSpec = {
  [Up in StatKey]: { readonly up: Up; readonly down: Exclude<StatKey, Up> };
}[StatKey];
