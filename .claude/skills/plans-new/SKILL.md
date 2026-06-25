---
name: plans-new
description: 生の実装指示・機能要望・「〜を実装したい」「次はこれを作る」「この機能を追加して」を受けたら、着手の前に必ず最初に通す計画化の入口スキル。指示をブラッシュアップして `docs/roadmap/NN-{slug}/OVERVIEW.md` にまとめ、6 基準（意思決定の数 / 不可逆性 / スコープの広さ / 技術的難易度 / 想定 diff / 並行実装のしやすさ）で 1 phase = 1 PR に分割し、1 PR 妥当なら GitHub issue + implementation-workflow へ、複数 phase なら NN-{slug} 計画群を起こして start-phase / implementation-workflow へ繋ぐ。start-phase や implementation-workflow を直接呼ぶ前の前段として使い、いきなりコードを書き始めないこと。新規計画を起こす・テーマを phase 分割する・実装に取りかかる文脈で広く発火させる（under-trigger を避ける）。手動で OVERVIEW や phase doc を書かずにこのスキルを使う。ただし既に確定済みの phase doc（`docs/roadmap/NN-{slug}/phase-*.md`）に着手するだけなら本スキルは不要で start-phase / implementation-workflow を使う。
allowed-tools: Read Write Bash(ls *) Bash(gh issue create *) Glob
---

# plans-new — 実装の入口（計画化と phase 分割）

生の実装指示を受けてから着手するまでの間に位置する**計画化スキル**。指示をブラッシュアップして
`OVERVIEW.md` にまとめ、それを実現する作業を **6 基準で 1 phase = 1 PR に分割**する。`adr-new`（ADR を
採番して新規作成）と同系の「**新しいものを採番して起こす入口**」スキル。

> **手順の正本（SoT）は [`.claude/rules/planning.md`](../../rules/planning.md)**。計画分解の各ステージと
> 6 基準・1 PR 妥当ラインの判断基準はそこに集約する。本 SKILL.md は手順の駆動に専念し、二重記述しない。
> 決定の「なぜ」は [ADR 0020](../../../docs/adr/0020-plans-new-entry-point.md)。

## なぜこのスキルがあるか

指示をプロンプトで直に受けると着手・分割の粒度がぶれ、OVERVIEW を飛ばして巨大 1 PR を作る事故が起きる。
「**指示 → OVERVIEW → 6 基準で分割 → 着手へ受け渡し**」を定型化し、`start-phase` /
`implementation-workflow` の**手前の標準エントリポイント**にする。実装の駆動は後段の責務で、本スキルは
**計画化に専念**する。

## 入力 / 出力

- **入力**: 生の実装指示・機能要望（自然文）。任意でスコープの希望・制約。
- **出力（分岐）**:
  - **1 PR 妥当**: `docs/roadmap/` にディレクトリを作らず、計画を **GitHub issue**（`gh issue create`）に
    書き出し、そのまま `implementation-workflow` をキック。
  - **複数 phase**: `docs/roadmap/NN-{slug}/`（`OVERVIEW.md` + `README.md` + `phase-NN-<slug>.md`×N）を作成し、
    `docs/roadmap/README.md` の採番一覧・全体進捗ロールアップ表に 1 行追加。最初の phase を `start-phase` /
    `implementation-workflow` へ繋ぐ。

## 手順

### 1. 指示をブラッシュアップして OVERVIEW を作る（**必ず最初**）

生の指示を読み、ゴール・背景・設計方針・実装指針・スコープ外を整理して
`docs/roadmap/NN-{slug}/OVERVIEW.md` を作る（テンプレは [references/plan-templates.md](references/plan-templates.md)）。

- `NN` = 既存 plan ディレクトリ（`00` / `01` …）の**最大 + 1**。`ls docs/roadmap/` で機械的に決める
  （[[planning]] の採番規約）。
- `slug` = 指示内容から kebab-case で生成（例: 本格ダメージ計算 → `damage-calc`）。
- **順序厳守**: 必ず OVERVIEW を先に作り、それを実現する計画を立てる。OVERVIEW なしに phase を切らない
  （何を実現するかが曖昧なまま分割すると粒度がぶれる）。
- 1 PR 妥当そうでも、まず OVERVIEW 相当の整理（ゴール / 背景 / 方針 / スコープ外）を済ませてから 3 の
  分岐に進む。1 PR の場合はそれを issue 本文に流用する（ファイルは作らない）。

### 2. OVERVIEW を 6 基準で評価し phase に分割する

OVERVIEW を実現する作業を洗い出し、**6 基準**で 1 phase = 1 PR に分割する。**6 基準の実体・1 PR 妥当
ライン・diff 目安（~500 行 / >1000 行は積極分割）・判断例は [[planning]]（SoT）と
[references/split-criteria.md](references/split-criteria.md)**。各 phase は「単独でマージしても壊れない・
レビュー可能・意味的に完結」を満たす。

### 3. 書き出し（2 分岐）

#### 3a. 1 PR 妥当（分割不要）

`docs/roadmap/NN-{slug}/` は**作らない**。OVERVIEW 相当を本文にした GitHub issue を body-file 経由で起票し
（`gh issue create --body-file`・heredoc 直送を避ける）、そのまま `implementation-workflow` をキックする。
投稿は GitHub への書き出しなので**投稿前に [[redaction]] を適用**（Secrets / 最小 PII を `[REDACTED-*]`）。

#### 3b. 複数 phase

`docs/roadmap/NN-{slug}/` を作成し、共通テンプレ（[references/plan-templates.md](references/plan-templates.md)）で
次を書く:

- `OVERVIEW.md` — ゴール / 背景 / 設計方針 / 実装指針 / スコープ外 / **計画群全体の受け入れ基準**（手順 1 の成果）。
- `README.md` — 薄索引（導入 + OVERVIEW ポインタ + **Mermaid のフェーズ依存グラフ** + phase 一覧の進捗チェック）。
- `phase-NN-<slug>.md` × N — テンプレ正本 [references/plan-templates.md](references/plan-templates.md) の
  「phase-NN-<slug>.md」節に従う。

さらに トップ `docs/roadmap/README.md` の**採番 / slug 一覧**と**全体進捗ロールアップ表**（計画 → 状況。
新計画は `⬜ 未着手` で 1 行追加・per-phase の分数は付けない）に新計画群を追記する。既存計画の OVERVIEW
遡及付与は任意（00 は付与済み・01 は当面据え置き）。

### 4. 着手へ受け渡す

- **1 PR**: 起票した issue を入力に `implementation-workflow` をキック。
- **複数 phase**: 最初の phase を `start-phase <id>` / `implementation-workflow` へ繋ぐ。

着手（worktree 作成・実装・検証・PR・マージ）は `start-phase` / `implementation-workflow` の責務。本スキルは
**計画化までで停止**し、実装の駆動はそちらに委ねる。

## Gotchas

- **OVERVIEW を飛ばさない**。必ず OVERVIEW → 分割の順。曖昧なまま phase を切ると粒度がぶれる。
- **採番は `ls docs/roadmap/` から機械的に**。記憶や推測で `NN` を振らない（衝突・抜けの原因）。
- **計画化のみ・実装も再実装もしない**。実テーマの実装は `implementation-workflow`、検証 / 評価は
  `verify` / `code-review` / `harness-review` の責務（[[skill-authoring]]）。
- **issue 本文・PR への書き出しは redaction 適用後**（[[redaction]]）。

## 関連

- 手順 SoT: [`.claude/rules/planning.md`](../../rules/planning.md)（計画分解ステージ・6 基準・1 PR 妥当ライン）。
- 分割基準の詳細: [references/split-criteria.md](references/split-criteria.md)。
- 計画テンプレート: [references/plan-templates.md](references/plan-templates.md)。
- 着手・実装: [`start-phase`](../start-phase/SKILL.md) / [`implementation-workflow`](../implementation-workflow/SKILL.md)。
- 計画インデックス・全体進捗ロールアップ: [`docs/roadmap/README.md`](../../../docs/roadmap/README.md)。
- テンプレート正本（OVERVIEW / README / phase doc 見出し）: [references/plan-templates.md](references/plan-templates.md)。
- 決定の「なぜ」: [ADR 0020](../../../docs/adr/0020-plans-new-entry-point.md)。
- 規約: [[planning]] / [[skill-authoring]] / [[cross-agent]] / [[redaction]]。
