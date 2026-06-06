# Phase 1 — 計画ドキュメント基盤と正本移動

## 目的 / スコープ

アーキ正本（旧 `plan.md`）を MVP ディレクトリへ移動し、計画の採番/slug 規約・進捗トラッカ・Phase doc テンプレートを整える。以降の ADR / rules / skills がこの構造（特に `architecture.md` の場所）を参照するため、最初に実施する。

## クロスエージェント共有方針（全フェーズ共通の前提）

ハーネスは **Claude Code と Codex の両方**で使う。二重管理を避けるため、以降の全フェーズで次を守る（詳細は Phase 7 の `cross-agent.md` rule / ADR `0016`）:

- **指示の SoT = `AGENTS.md`**（Codex ネイティブ読込）。`CLAUDE.md` は `@AGENTS.md` の薄いアダプタ（公式 Pattern 0）。
- **スキルは canonical を `.claude/skills/<name>/` 実体に置き、`.agents/skills/<name>` を symlink** で共有（編集 1 箇所）。**作成には `skill-creator` skill を利用する**（`skill-authoring.md`）。
- **強制ゲートは Git ネイティブフック（`.githooks/`）**＝ツール非依存で両対応。Claude hooks は補助のみ。
- Claude が自動取得する情報（path-scoped rules / skill frontmatter）は `AGENTS.md` にインラインせず**ポインタ化**（path↔rule 表は `docs/harness/rules-index.md` に分離・生成）。

## 前提（依存）

- なし（ドキュメント操作のみ。最初に着手）。

## タスク

- [ ] **正本の移動**: `git mv plan.md docs/plan/01-mvp/architecture.md`（**内容は維持・記述は変更しない**）。
- [ ] `docs/plan/README.md` を作成:
  - [ ] **採番/slug 規約**: 計画ディレクトリは `NN-<slug>/` 形式（ゼロ埋め連番 + kebab スラッグ）。`00-harness-setup`・`01-mvp` は確定。`02-<slug>/` 以降は MVP 後の作業が出るたびにテーマから slug を**都度生成**（事前スタブは作らない）。
  - [ ] **進捗チェックリスト**（`- [ ] 01-mvp / phase-00 …`）。
  - [ ] **Phase doc 共通テンプレート**（目的 / 前提 / タスク / この Phase で育てる rule・skill / 受け入れ基準 / 検証手順 / リスク）。
  - [ ] **MVP の範囲 = phase 0〜3 すべて**、MVP 完了で「個体・パーティ検証 + 一貫性/技範囲チェック + ステータス調整」が揃うことを明記。
- [ ] `docs/plan/01-mvp/` に phase スタブ（目的と受け入れ基準の見出しのみ）:
  - [ ] `phase-00-scaffold.md`（足場 + calc-stats）
  - [ ] `phase-01-data-and-coverage.md`（データ生成 + check:party + analyze:coverage）
  - [ ] `phase-02-individual-typecheck.md`（個体 tsc 検証層）
  - [ ] `phase-03-stat-tuning.md`（ステータス調整壁打ち）

## 受け入れ基準

- `plan.md` が `docs/plan/01-mvp/architecture.md` に移動され、git 履歴上はリネームとして追跡される（内容差分なし）。
- `docs/plan/README.md` に採番/slug 規約・進捗・テンプレートが存在。
- `docs/plan/01-mvp/` に phase-00〜03 のスタブが置かれている。

## 検証手順

1. `git log --follow docs/plan/01-mvp/architecture.md` で旧 `plan.md` の履歴が辿れる。
2. `git diff` で architecture.md の内容差分が無いこと（移動のみ）を確認。

## リスク・備考

- 本フェーズでは architecture.md の**内容改変はしない**（移動のみ）。記述更新が必要なら別途 ADR + 編集で行う。
- `00-harness-setup/`（本ディレクトリ）は既にこの計画群を保持している。
