# Phase 8 — 検証ゲート（Git hooks を主・Claude 補助 hooks）

## 目的 / スコープ

**強制ゲートを Git ネイティブフックに寄せ**、Codex・人間・CI 含む全コミッターに効くツール非依存の検証を敷く。Claude 限定の即時フィードバックは補助として併設。Git hooks 採用の決定は Phase 3 で `0005-git-hooks-over-claude-hooks` として ADR 化済み。

## 前提（依存）

- Phase 4（`prepare: git config core.hooksPath .githooks` と verify 系 scripts）。

## タスク

- [ ] `.githooks/pre-commit`（`#!/bin/sh`・実行権限付与）: 高速ゲート = `pnpm typecheck` → `pnpm lint`。失敗で `exit 1`。
  - MVP Phase 2 以降に `pokeform typecheck` を追記する旨をコメントで明示。
- [ ] `.githooks/pre-push`（`#!/bin/sh`・実行権限付与）: 重ゲート = `pnpm test:cov`（カバレッジ100%）。失敗で `exit 1`。
- [ ] `core.hooksPath=.githooks` が `prepare`（Phase 4）で設定されることを確認。新規 clone でも `pnpm install` で有効化される。
- [ ] `.claude/settings.json`:
  - [ ] `permissions.allow`: `Bash(pnpm *)` / `Bash(npx tsc*)` / `Bash(npx biome*)` / `Bash(git status|add|commit|push *)` / `Bash(gh pr *)`（Phase 9 の dep-update / Phase 2 の pr-retrospective 用）
  - [ ] **PostToolUse** `Edit` if `Edit(src/**/*.ts)` → `.claude/hooks/post-edit-biome.sh`（編集直後の該当 1 ファイルに `biome check`。**任意の即時フィードバック**）
  - [ ] **SessionStart** → `git log --oneline -5`（最小コンテキスト）
  - [ ] commit ブロックの PreToolUse は**置かない**（Git の pre-commit と二重化しない）
- [ ] `.claude/hooks/post-edit-biome.sh`: stdin JSON からファイルパス抽出 → `npx biome check "$FILE"` → 結果のみ出力。
- [ ] **クロスエージェントの位置づけを明記**: 強制ゲート（`.githooks/`）は **Claude・Codex・素の git・CI すべてに効く**（ツール非依存）。Claude 補助 hook（編集直後 Biome）は **Claude 固有**。Codex 即時フィードバックは**任意**で `.codex/config.toml` の command hooks に同等処理を置けるが、**既定では作らない**（ゲートは Git hooks に集約し設定の二重管理を回避）。

## 受け入れ基準

- 型/Lint エラーを残した `git commit` が **Git pre-commit** で `exit 1` ブロックされる（`.claude/` 不使用の素の git・Codex でも有効）。
- テスト失敗時の `git push` が **pre-push** でブロックされる。
- `src/*.ts` 編集時に Claude の post-edit 補助 hook が Biome を走らせる（任意機能・Claude 固有）。

## 検証手順

1. 故意に Lint/型エラー → `git commit -m test` がブロック。解消後は通過。
2. テストを失敗させ `git push` → ブロック。
3. `src/_probe.ts` を編集 → post-edit Biome が走る。

## リスク・備考

- 編集毎に型/テスト全実行はループを遅くするため不採用。重い検証は push 境界へ集約（コミットは軽く保つ）。
- Git hook は実行権限（`chmod +x`）が必要。`core.hooksPath` 方式は追加依存なし。
