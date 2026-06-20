# Phase 6 — generate.ts を変換専任へ縮小 + authoring 検証ゲート（check:regulation）新設

## 目的 / スコープ

`scripts/generate.ts` を **YAML → TS 変換のみ**の責務へ縮小し（dumb transformer）、妥当性チェック
（覚えない技の混入・参照切れ・条件違反）を **YAML 作成・更新時点の authoring 時ゲート**へ移設する。
新 CLI コマンド `check:regulation` を新設し、`generate.ts` から learnset 交差・生成段バリデーションを除去する。
`species.ts` の出力形は不変。

Phase 5 で新スキーマへ移行済みである前提の上で、本 phase は **責務分担と検証位置**を確定させる。検証の空白を
作らないため、`check:regulation` を先に用意してから `generate.ts` の検証を抜く（順序厳守）。

- スコープ内:
  - 新 CLI `node src/cli/index.ts check:regulation <path>`（authoring 時ゲート）。
  - `generate.ts` の learnset 交差・生成段バリデーション除去 → 純粋な YAML→TS 変換へ。
  - `check:regulation` を Git hooks / CI（`.githooks/` 連携）へ組み込み、データ編集時に必ず駆動。
  - `survey-regulation` skill を `check:regulation` 呼び出しへ更新（`skill-creator`・機械ゲート再実装なし）。
  - ADR-B 起票（generate 責務縮小 + 検証位置の authoring 移設）。`.claude/rules/*` 追従。
- スコープ外:
  - 各種族の技の全量化・全186種への roster 拡張（**Phase 7**）。新スキーマ自体の再設計（Phase 5 で確定済み）。

## 前提（依存）

- **Phase 5（技記録スキーマ再設計）完了**。`regulations/<id>.yaml` が種族キー = 解禁・per-species `moves`/`mega[]`
  の block 記法へ移行済みで、`generate.ts` が新スキーマを読み取ること。
- 確定済み rule: [[data-pipeline]] / [[cli-and-io]] / [[type-conventions]] / [[testing]]。ADR 0022（Phase 5）。

## タスク

- [ ] **新 CLI `check:regulation <path>`** を新設（`check:individual` と同系・`src/cli/` ルーティング）:
  - [ ] 各種族キーの技 ⊆ その種族の learnset（+ `overrides.yaml`）か（覚えない技の混入を弾く）。
  - [ ] 種族 / 持ち物 / メガの id が catalog に存在するか（参照切れ検出）。`mega[]` 各要素と `megaLinks` の整合。
  - [ ] M-A 条件（基本最終進化・メガ可・Restricted 除外）等の整合チェック（可能な範囲）。
  - [ ] 終了コード（妥当 = 0 / 問題 = 非0）。問題箇所を最初の失敗から指摘。
- [ ] `scripts/generate.ts` を変換専任へ縮小:
  - [ ] learnset 交差（旧 `catalog ∩ learnset` 由来の残存ロジック）・生成段バリデーションを**除去**。
  - [ ] YAML の `moves` を**そのまま** `species.ts` へ流す（検証は呼ばない）。出力形は不変。
- [ ] `check:regulation` を `.githooks/`（pre-commit / pre-push）・CI へ組み込み、`data/champions/regulations/**` 編集時に駆動。
- [ ] `survey-regulation` skill を更新（新スキーマ記録 + `check:regulation` で検証する手順へ・`skill-creator` 利用）。
- [ ] `adr-new` で **ADR-B** 起票（generate 責務縮小 = 変換専任 / 妥当性検証を authoring 時 `check:regulation` へ移設）。
- [ ] テスト追従（コロケーション・カバレッジ100%）: `check:regulation` の正例 / 異常系（覚えない技・参照切れ）テスト・generate の検証除去後スナップショット。

## この Phase で育てるハーネス（rule・skill）

- `.claude/rules/data-pipeline.md`（generate = 変換専任・検証は authoring 時 `check:regulation`）更新。
- `survey-regulation` skill を `check:regulation` 連携へ更新（`skill-creator`）。
- ADR-B 1 本（`adr-new`）。`check:regulation` は新規 CLI コマンド（ソース）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- `scripts/generate.ts` が learnset 交差・妥当性検証を持たず、YAML の `moves` を直接 `species.ts` に反映する。
- `check:regulation` が覚えない技混入・参照切れを authoring 時に**非0終了**で検出する（回帰 fixture で証跡）。正当 YAML で 0。
- `check:regulation` が Git hooks / CI から駆動され、不正な regulation YAML のコミットを弾く。
- ADR-B が `docs/adr/` に起票されている。

## 検証手順

1. 覚えない技 / 参照切れを混ぜた regulation YAML fixture で `check:regulation` が非0終了することを確認。
2. 正当な regulation YAML で `check:regulation` が 0 終了することを確認。
3. `generate.ts` から learnset 交差・バリデーションが除去されていることをコード / テストで確認（不正 YAML でも generate 自体は throw せず、ゲートが弾く分担）。
4. Git hooks 経由で不正 regulation YAML のコミットが弾かれることを確認。
5. `pnpm verify` 緑を確認。

## リスク・備考

- **検証の空白を作らない**: `generate.ts` から検証を抜くのは `check:regulation` + hooks/CI を用意した**後**。
  順序を誤ると覚えない技が素通りし安全性が後退する。1 PR 内で「ゲート新設 → generate 縮小」を完結させる。
- 機械ゲート（型 / カバレッジ / Biome）は `.githooks/` / CI の責務で再実装しない。`check:regulation` は
  「データ妥当性」の新ゲートであり、既存の型 / lint ゲートとは別レイヤ。
- 本 phase 完了後、Phase 7 で全186種 + 全 learnable 技を新スキーマ上に投入する。
