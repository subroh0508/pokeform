---
paths:
  - "**/*.test.ts"
description: テストの規約（Vitest・カバレッジ100%・境界重点・プロダクションコードと同階層にコロケーション・fixture は近傍 __fixtures__/）。`*.test.ts` を扱うとき適用する。
---

# テストの規約

テストの配置とカバレッジ方針の要点。正本は `docs/plan/01-mvp/architecture.md`（「検証方法」節 / ディレクトリ構成のテスト配置注記）。

## ツールと閾値

- **Vitest** を使う（`vitest.config.ts` の `include` は `src/**/*.test.ts`）。
- **カバレッジ閾値は最初から 100%**（lines / branches / functions / statements すべて 100）。100% 未満は失敗。
- 本質的にテスト困難な薄い層（codegen / CLI 配線）は `coverage.exclude` で**明示除外**し、ドメインロジック（calc-stats / type-effectiveness / coverage / legality）は完全網羅する。除外で 100% を取り繕わない。

## 配置（コロケーション）

- **テストはプロダクションコードと同階層に `<name>.test.ts`** を置く（例: `src/domain/calc-stats.ts` ↔ `src/domain/calc-stats.test.ts`）。**専用 `tests/` ディレクトリは作らない**。
- 共有 fixture は**近傍の `__fixtures__/`** に置く（`coverage.exclude` に `**/__fixtures__/**`）。

## 境界重点

カバレッジ 100% は「全行通過」であって「全境界検証」ではない。価値ある境界を狙う:

- **二重 floor の端数が出る境界**（[[game-spec]] の HP 以外計算式）。
- 能力ポイント **0 / 32** 境界、合計 66 の前後。
- タイプ相性は 18×18 の代表セル + 複合タイプ（×4 / ×0.25 / ×0）。

数値仕様は [[game-spec]]、検証ゲート全体は [[tsc-verification]] を参照。
