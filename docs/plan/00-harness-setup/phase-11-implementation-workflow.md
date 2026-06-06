# Phase 11 — 実装ワークフロー Skill（着手〜マージ〜レトロ〜cleanup を統合）

## 目的 / スコープ

これまでの Phase で揃えたハーネスの**部品**（rules / skills / Git hooks / ADR / レビュー / レトロ / 依存更新）を、**1 本の PR の実装ライフサイクルとして端から端まで駆動するオーケストレーター** `implementation-workflow` skill を設置する。

エージェント（Claude Code / Codex）は現状、着手・実装・検証・PR・レビュー・マージ・レトロ・後片付けの繋ぎ方を都度判断している。本 skill は確立された実装ワークフローのパターン（worktree 物理分離 → docs 読込 → 実装+検証 fix loop → セルフ検証 → Draft PR → 独立レビュー → マージ → レトロ → cleanup の多段フェーズ統合）を参考に、それを**定型化**する。pokeform の**既存 skill を再利用して束ねる**ことを主眼とし、新規ロジックは最小に保つ。

本フェーズは**ほぼ全ての先行フェーズに依存する総仕上げ（capstone）**であり、最後に置く。マージ工程は Phase 3 の auto-merge ゲートに委譲する（独自のマージ規約は導入しない）。

## 前提（依存）

capstone ゆえ依存は広い。本フェーズは Phase 2/3 同様**「束ね方の定型化」を設置**するもので、実稼働は MVP 実装 PR 以降（**設置 ≠ 稼働**、前方参照を許容）。

- Phase 8（中核 skill `start-phase` / `finish-phase` / `verify` を順に呼ぶ）。
- Phase 3（`code-review` / `harness-review` を独立 Evaluator として起動 + auto-merge ゲート）。
- Phase 2（マージ後に `pr-retrospective` で learning 生成）。
- Phase 4（`finish-phase` がアーキ決定時に `adr-new` を促す）。
- Phase 7（`cross-agent.md` / `skill-authoring.md`、及び branch 命名規約・PR テンプレ）。
- Phase 9（`Bash(gh *)` / `Bash(git *)` 権限、機械ゲートとの責務境界）。
- Phase 2 の PR テンプレ（`.github/PULL_REQUEST_TEMPLATE/*.md`）/ Phase 3 の CI（`.github/workflows/ci.yml`）。

## タスク

> **クロスエージェント共有**: **`skill-creator` skill を使って** `.claude/skills/implementation-workflow/SKILL.md` に canonical（実体）を作成し、`.agents/skills/implementation-workflow` を `../../.claude/skills/implementation-workflow` への symlink にして Codex と共有（symlink 不可環境は copy フォールバック、`skill-authoring.md`／`cross-agent.md`／Phase 7）。SKILL.md 本体は ≤500 行、10 フェーズの詳細手順は supporting rule に逃がす。

### A. skill `.claude/skills/implementation-workflow/SKILL.md`（+ `.agents` symlink）

- `description`: 「Plan / Phase 確定後の実装着手〜マージ〜レトロ〜worktree 削除を多段フェーズで統合管理したいとき」（三人称・トリガ明示）。
- `allowed-tools: Bash(git *) Bash(gh *) Bash(pnpm *) Read Grep Write Agent`（オーケストレーターゆえ広め。`Write` は `/tmp` の PR body / commit message 用、`Agent` はレビュー skill のサブエージェント起動用）。
- 本体は「役割 / 入力 / 出力 / フェーズ別動作（概要）/ Gotchas / 関連」に絞り、手順 SoT は rule を参照。

### B. supporting rule `.claude/rules/implementation-workflow.md`

- paths: `.claude/skills/implementation-workflow/**`。
- 全フェーズの入出力・成功条件・失敗時 fallback・worktree 基盤の**詳細手順 SoT**。

### C. 不変条件（rule に明記）

- **fix loop 上限 3 回**: 実装 + `pnpm verify` のループ／レビュー Critical 修正のループは各々上限 3。累計超過で対象 plan / phase doc に `blocked` を記録し人間へ通知。
- **Generator / Evaluator 独立性**: 本 skill（実装 = Generator）と `code-review` / `harness-review`（評価 = Evaluator）を分離。Phase 6 は `Agent` ツールでレビュー skill を独立起動する。
- **gh CLI 経由**の PR 操作 / **`/tmp` body-file 経由**の PR body・commit message（heredoc 直送・`--template` と `--body-file` 同時指定は避ける）。
- **worktree 規律**: 絶対パス、Phase 0 冒頭で `git fetch origin main`、unstaged は `git stash push -u`、Phase 0 と最終 Phase はペア、未マージ時は強制削除しない。

### D. 既存 skill との連携明記（再利用・二重実装しない）

`start-phase`（着手）/ `verify`（検証）/ `code-review`・`harness-review`（評価）/ `finish-phase`（完了・README 進捗更新・`adr-new` 促し）/ `pr-retrospective`（学び）。機械ゲートやレビュー観点を本 skill 内で**再実装しない**。

### E. ドキュメント反映

- README 一覧・役割分担表・受け入れ基準に Phase 11 を追記。
- Phase 4 ADR バックフィル一覧に `0018-implementation-workflow-orchestrator` を追記。

## フェーズ別動作（pokeform 適応版・skill 本文に概要、rule に詳細）

| Phase | 名称 | pokeform での内容（再利用先） | 成功条件 |
|---|---|---|---|
| 0 | Worktree 作成 + main fetch | `git fetch origin main` → `git worktree add <abs-path> -b <branch> origin/main`（branch 命名規約準拠、unstaged は stash） | worktree 作成 |
| 1 | 計画 / 設計 Read | `start-phase <id>` で対象 `docs/plan/.../phase-*.md`・依存・受け入れ基準・関連 ADR を読込 | 関連 doc 読込済 |
| 2 | 整合性チェック | 受け入れ基準と `architecture.md` / rules の整合確認（pokeform は SPEC/REQ 分離なし＝phase doc が基準）、相互参照の dangling ゼロ | 整合レポート |
| 3 | 実装 + 検証（fix loop） | 実装 → `pnpm verify`（`tsc --noEmit` / `vitest --coverage` 100% / `biome`）→ 失敗は修正再実行（上限 3、超過で `blocked`） | `pnpm verify` 緑 |
| 4 | セルフ検証 | カバレッジ・規約違反点検（redaction / secrets 混入・cross-agent パリティ・生成物への手編集・命名）。scope 縮小指示時は `git reset --soft` で巻き直し | 規約違反ゼロ |
| 5 | Draft PR 作成 | commit message・PR body を `/tmp/<prefix>-*` に Write → `git commit -F` → `gh pr create --draft --base main --body-file`（テンプレは `.github/PULL_REQUEST_TEMPLATE/<type>.md` を複写・カスタマイズ） | PR URL 取得 |
| 6 | 独立レビュー（Evaluator） | `Agent` で `code-review`（`src/**` / `scripts/**`）/ `harness-review`（ハーネス資産）を起動。ブロッキング指摘あり → Phase 3 へ（fix loop） | ブロッキング指摘 0 |
| 7 | マージ（auto-merge） | レビュー待ち中の main 再進化を `gh pr view --json mergeable,mergeStateStatus` で検出（必要なら rebase）→ `gh pr ready` → **CI 緑 ＋ ブロッキング指摘なしで `gh pr merge --auto --merge`**（通常マージ＝merge commit。Phase 3 の auto-merge ゲートに委譲） | PR auto-merge 予約 / MERGED |
| 8 | マージ後処理 | `finish-phase <id>`（`verify` 再実行・受け入れ基準照合・`docs/plan` README 進捗更新・`adr-new` 促し）→ `pr-retrospective <PR#>`（learning 生成） | README 進捗更新 + learning 生成 |
| 9 | Worktree 削除 | `gh pr view --json state,mergedAt` で MERGED 確認後 `git worktree remove` + `git branch -d`（失敗時のみ `-D`）。未マージなら停止・人間通知 | worktree / branch 削除 |

> **取り込まないもの**: 参考にしたパターンの「Plan/Epic frontmatter 同期・roadmap ミラー・PR ポーリング・複数 pane オーケストレーション」は pokeform に該当機構が無いため取り込まない。進捗反映は `finish-phase` の README 進捗更新で代替し、学びは `pr-retrospective` が担う。

## 受け入れ基準

- `implementation-workflow` が `.claude/skills`（実体）/ `.agents/skills`（symlink）の両方から起動でき、Phase 0〜9 を順に実行できる。
- SKILL.md 本体 ≤500 行、詳細手順は `implementation-workflow.md` rule に分離されている。
- 既存 skill（`start-phase` / `verify` / `code-review` / `harness-review` / `finish-phase` / `pr-retrospective`）を**再利用**し、機械ゲートやレビュー観点を二重実装していない。
- fix loop 上限 3・Generator/Evaluator 独立・worktree Phase 0/9 ペア・auto-merge ゲート委譲が rule に明記されている。
- マージ工程が Phase 3 の auto-merge と整合（独自の「auto-merge 禁止」を導入していない）。
- 既存の組み込み skill と名前が衝突しない。
- README の一覧・役割分担表・受け入れ基準に Phase 11 が反映され、ADR `0018` が `architecture.md` と二重記述になっていない。

## 検証手順

1. ダミー phase に対し `implementation-workflow` 起動 → Phase 0 で worktree 作成、Phase 1 で `start-phase` が phase doc を提示。
2. 実装 → `pnpm verify` 緑 → Phase 5 で Draft PR が `--body-file` 経由で起票される。
3. Phase 6 で `code-review` / `harness-review` がサブエージェントとして独立起動し指摘を返す。
4. CI 緑＋指摘なしで Phase 7 が `gh pr merge --auto` を予約、Phase 8 で README 進捗更新＋`pr-retrospective` learning 生成。
5. Phase 9 で MERGED 確認後 worktree / branch が削除される（未マージでは停止）。
6. `.agents/skills` 経由（Codex 想定）でも起動できる。

## リスク・備考

- オーケストレーターゆえ依存が広い（capstone）。**設置 ≠ 稼働**を明記し、未整備の依存があっても前方参照で許容。
- `Agent` / `Write` / `Bash(gh *)` と権限が広いため、破壊的操作（merge / worktree 削除）は前提条件（`MERGED` 確認等）を必須化する。
- worktree の Phase 0/9 ペアを忘れると残置・肥大化 → rule の Gotchas に明記。
- マージは Phase 3 と整合（auto-merge）。人間 approve 必須の 3 条件型は採用しないことを doc に明記し、将来 Phase 3 を見直す場合は両方を同時更新する。
