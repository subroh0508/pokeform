---
name: implementation-workflow
description: >-
  Plan / Phase 確定後の 1 本の PR の実装ライフサイクル（worktree 作成 → 着手 → 実装+検証 → セルフ検証 →
  Draft PR → 独立レビュー → マージ → レトロ → worktree 削除）を Phase 0〜9 の多段で統合管理する
  オーケストレーター。「フェーズを最初から最後まで回して」「実装ワークフローを開始」「worktree から
  PR・マージ・レトロ・後片付けまで通して」「implementation-workflow で phase N を実装して」と言われたとき、
  あるいは確定済み phase / plan の実装を端から端まで定型的に駆動したいときに使う。既存 skill（start-phase /
  verify / code-review / harness-review / finish-phase / pr-retrospective）を再利用して束ねるのが主眼で、
  機械ゲートやレビュー観点は再実装しない。単発の着手のみは start-phase、完了のみは finish-phase を使う。
allowed-tools: Bash(git *) Bash(gh *) Bash(pnpm *) Read Grep Write Agent
---

# implementation-workflow — 実装ライフサイクルを多段フェーズで統合する

確定した phase / plan を、**worktree 作成から PR マージ・レトロ・後片付けまで**端から端まで駆動する
オーケストレーター skill。これまでの Phase で揃えたハーネスの部品（rules / skills / Git hooks / ADR /
レビュー / レトロ / 依存更新）を、**1 本の PR の実装ライフサイクルとして束ねる**。

> **大原則**: フェーズ単位の実装は**原則すべてこの skill 経由で駆動する**（実装の標準エントリポイント）。
> trivial な単発編集や会話的応答のみ例外。背景は [ADR 0018](../../../docs/adr/0018-implementation-workflow-orchestrator.md)。

> **手順の詳細 SoT は [`.claude/rules/implementation-workflow.md`](../../rules/implementation-workflow.md)**
> （Phase 0〜9 の入出力・成功条件・失敗 fallback・不変条件）。決定の「なぜ」は
> [ADR 0018](../../../docs/adr/0018-implementation-workflow-orchestrator.md)。本 SKILL.md は概要に留める。

## なぜこの skill があるか

エージェント（Claude Code / Codex）は着手・実装・検証・PR・レビュー・マージ・レトロ・後片付けの
繋ぎ方を都度判断しており、手順がぶれる。この skill は確立された実装ワークフロー（worktree 物理分離 →
docs 読込 → 実装+検証 fix loop → セルフ検証 → Draft PR → 独立レビュー → マージ → レトロ → cleanup）を
**定型化**する。新規ロジックは最小に保ち、**既存 skill を再利用して束ねる**ことを主眼とする。

## 役割（Generator）/ 既存 skill の再利用

本 skill は**実装を駆動する Generator**で、各専門タスク（着手 / 検証 / レビュー / 完了 / レトロ）は専任
skill に**委譲**し、機械ゲートやレビュー観点を**再実装しない**（[skill-authoring](../../rules/skill-authoring.md)）。
委譲先と発火フェーズは下の「フェーズ別動作」表に示す。**Generator / Evaluator 独立**: 実装（本 skill）と
評価（レビュー skill）を分離し、Phase 6 は `Agent` でレビュー skill を独立起動する（自己採点で代替しない）。

## 入力 / 出力

- **入力**: 対象 phase / plan 識別子（例 `phase-08`）。任意で branch 名・effort。
- **出力**: 各フェーズの成功条件の充足状況、最終的に MERGED された PR URL、生成 learning。途中停止時は
  停止フェーズと `blocked` 記録先。

## フェーズ別動作（概要・詳細は rule）

各フェーズは**成功条件を満たしてから次へ**。詳細手順・fallback は
[rule](../../rules/implementation-workflow.md) を参照。

| Phase | 名称 | 概要（委譲先） | 成功条件 |
|---|---|---|---|
| 0 | Worktree 作成 + main fetch | `git fetch origin main` → `git worktree add <abs> -b <branch> origin/main`（命名規約準拠・unstaged は stash） | worktree 作成 |
| 1 | 計画 / 設計 Read | `start-phase <id>` で phase doc・依存・受け入れ基準・ADR を読込 | 関連 doc 読込済 |
| 2 | 整合性チェック | 受け入れ基準と `docs/design/` / rules の整合・相互参照 dangling ゼロ | 整合レポート |
| 3 | 実装 + 検証（fix loop） | 実装 → `verify`（`pnpm verify`）→ 赤は修正再実行（**上限 3**、超過で `blocked`） | `pnpm verify` 緑 |
| 4 | セルフ検証 | redaction / secrets・cross-agent パリティ・生成物手編集・命名を点検 | 規約違反ゼロ |
| 5 | Draft PR 作成 | commit msg / PR body を `/tmp` に Write → `git commit -F` → `gh pr create --draft --body-file` | PR URL 取得 |
| 6 | 独立レビュー（Evaluator） | `Agent` で `code-review`（src/scripts）/ `harness-review`（ハーネス資産）起動。blocking → Phase 3 へ | blocking 0 件 |
| 7 | マージ（auto-merge） | main 再進化を検出（必要なら rebase）→ `gh pr ready` → CI 緑+指摘なしで `gh pr merge --auto --merge`（Phase 3 のゲートに委譲） | auto-merge 予約 / MERGED |
| 8 | マージ後処理 | `finish-phase <id>`（README 進捗更新・`adr-new` 促し）→ `pr-retrospective <PR#>`（learning 生成） | 進捗更新 + learning 生成 |
| 9 | Worktree 削除 | `gh pr view` で **MERGED 確認後** `git worktree remove` + `git branch -d`。未マージなら停止・通知 | worktree / branch 削除 |

## Gotchas（不変条件の要点・詳細 SoT は [rule](../../rules/implementation-workflow.md)）

- **fix loop は上限 3**: 実装+verify（Phase 3）/ レビュー修正（Phase 6）は各々上限 3 回。超過で `blocked` 記録 + 人間通知して止める。
- **worktree は Phase 0/9 ペア**: 作ったら必ず削除と対にし、**未マージで強制削除しない**（`MERGED` 確認が前提）。
- **gh CLI / body-file 経由**: PR body / commit message は `/tmp` body-file。heredoc 直送・`--template` と `--body-file` 同時指定を避ける。
- **再実装せず委譲**: 機械ゲートは `verify`、レビューは `code-review` / `harness-review`、マージは auto-merge（独自マージ規約を導入しない）に委譲（[code-review](../../rules/code-review.md)）。
- **設置 ≠ 稼働**: capstone ゆえ依存は広い。未整備の依存は前方参照で許容し、あるものから順に駆動する。

## 関連

- 詳細手順 SoT: [`.claude/rules/implementation-workflow.md`](../../rules/implementation-workflow.md)。
- ワーカー分業の運用ノート: [worker-orchestration-notes](./references/worker-orchestration-notes.md)。
- 委譲先 skill: [`start-phase`](../start-phase/SKILL.md) / [`verify`](../verify/SKILL.md) /
  [`code-review`](../code-review/SKILL.md) / [`harness-review`](../harness-review/SKILL.md) /
  [`finish-phase`](../finish-phase/SKILL.md) / [`pr-retrospective`](../pr-retrospective/SKILL.md)。
- 決定の「なぜ」: [ADR 0018](../../../docs/adr/0018-implementation-workflow-orchestrator.md) /
  マージゲート [ADR 0017](../../../docs/adr/0017-semantic-code-review-skills.md)。
- phase doc: [`docs/roadmap/completed/00-harness-setup/phase-11-implementation-workflow.md`](../../../docs/roadmap/completed/00-harness-setup/phase-11-implementation-workflow.md)。
