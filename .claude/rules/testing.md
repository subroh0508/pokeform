---
paths:
  - "**/*.test.ts"
description: テストの規約（Vitest・カバレッジ100%・境界重点・プロダクションコードと同階層にコロケーション・fixture は近傍 __fixtures__/）。`*.test.ts` を扱うとき適用する。
last_modified: "2026-06-26T00:00:00+09:00"
adr:
  - "ADR 0006"
  - "ADR 0010"
---

# テストの規約

テストの配置とカバレッジ方針の規約。本 rule がテスト方針の規約 SoT で、設計上の位置づけは [docs/design/](../../docs/design/README.md)（設計方針 4）。

## ツールと閾値

- **Vitest** を使う（`vitest.config.ts` の `include` は `src/**/*.test.ts`）。
- **カバレッジ閾値は最初から 100%**（lines / branches / functions / statements）。100% 未満は失敗。
- テスト困難な薄い層（codegen / CLI 配線）は `coverage.exclude` で**明示除外**し、ドメインロジック（calc-stats / type-effectiveness / coverage / legality）は完全網羅する。除外で 100% を取り繕わない。
- **除外パスへ意味あるロジックの純関数を置かない**（learning #26 / #73 反復）。除外パスは「純関数を呼ぶ薄いアダプタ」専用とし、判断分岐を持つ純関数（`@source` 逆引き・lang 別名称解決・YAML 構造検出・転記計画等）は**強制カバレッジ対象へ抽出**する。`src/domain/` への抽出か、抽出先を `src/codegen/` 配下に保つなら**除外を狭めて当該サブツリーだけ 100% ゲートに載せる**（例: `src/codegen/serebii/**` のスクレイパー純関数は除外を `src/codegen/*.ts` トップレベルのみに絞る）。ロジックがゲート死角に落ちるのを設計時に防ぐ。
- **利用者 YAML（`team/individuals/**` / `team/_demo/**`）は `pnpm verify` の非ゲート対象**（`check:individual` / `check:party` 専用ゲートで CI verify に乗らない）。よって **legality（種族の `items` / `moves` / `abilities` の許容集合）を変える変更は、対象種族を参照する `team/**` 個体・src fixture を `git grep` で洗い出し `pnpm check:individual` / `check:party` を手動で回す**（既存個体が型機構変更で暗黙に不正化しても verify では顕在化しない・learning #145 / #147 / #149 反復）。この影響洗い出しは [[code-review]] の観点。

## 配置（コロケーション）

- **テストはプロダクションコードと同階層に `<name>.test.ts`**（例: `src/domain/calc-stats.ts` ↔ `calc-stats.test.ts`）。**専用 `tests/` ディレクトリは作らない**。
- 共有 fixture は**近傍の `__fixtures__/`**（`coverage.exclude` に `**/__fixtures__/**`）。

## 境界重点

カバレッジ 100% は「全行通過」であって「全境界検証」ではない。価値ある境界を狙う:

- **二重 floor の端数が出る境界**（[[game-spec]] の HP 以外計算式）。
- 能力ポイント **0 / 32** 境界、合計 66 の前後。
- タイプ相性は 18×18 の代表セル + 複合タイプ（×4 / ×0.25 / ×0）。

数値仕様は [[game-spec]]、検証ゲート全体は [[tsc-verification]] を参照。
