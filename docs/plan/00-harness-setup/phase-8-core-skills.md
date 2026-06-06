# Phase 8 — 中核 Skills

## 目的 / スコープ

開発ループの骨格となる 3 つの Skill を用意する。フェーズの着手・完了・検証を定型化し、エージェントが繰り返し正しく実行できるようにする。（`adr-new` は Phase 4、`dep-update` は Phase 10、`pr-retrospective`/`harness-meta` は Phase 2 で作成）

## 前提（依存）

- Phase 5（`pnpm verify` が実在）/ Phase 1（`docs/plan/` 構造）/ Phase 4（`finish-phase` が促す `adr-new` が存在）/ Phase 2（`finish-phase` が促す `pr-retrospective` が存在）。

## タスク

> **クロスエージェント共有（全スキル共通）**: 各スキルは **skill-creator 準拠**で `.claude/skills/<name>/SKILL.md` に canonical（実体）を作成し、**`.agents/skills/<name>` を `../../.claude/skills/<name>` への symlink** にして Codex と共有する（`ln -s`）。`description` は trigger（いつ起動するか）を明示。symlink 不可環境は copy 同期にフォールバック（`cross-agent.md`）。

- [ ] `.claude/skills/verify/SKILL.md`:
  - frontmatter: `description`（「検証ゲートを実行して結果を要約。型/テスト/カバレッジ/Lint を確認したいとき」）、`allowed-tools: Bash(pnpm *)`
  - 手順: `pnpm verify` を実行 → 型/テスト/カバレッジ/Lint の結果を**要約**して返す → 失敗時は最初の失敗箇所を指摘
- [ ] `.claude/skills/start-phase/SKILL.md`（引数: フェーズ識別子）:
  - 該当 `docs/plan/.../phase-*.md` を読み、依存・必要 rule/skill・受け入れ基準を提示して着手準備
- [ ] `.claude/skills/finish-phase/SKILL.md`（引数: フェーズ識別子）:
  - `verify` を実行 → 受け入れ基準を照合 → `docs/plan/README.md`（または各計画の README）の進捗チェックを更新 → そのフェーズで確定した rule/skill の追従漏れを点検 → **アーキ決定があれば `adr-new` を促す** → **関連 PR が merge 済なら `pr-retrospective`（Phase 2）を促す**

## 受け入れ基準

- `verify` / `start-phase` / `finish-phase` が呼び出せ、想定どおり動作する。
- 各スキルが Claude（`.claude/skills`）と Codex（`.agents/skills` symlink）の両方から同一 SKILL.md で起動できる。
- `finish-phase` 実行で対象の進捗チェックが更新される。

## 検証手順

1. `verify` skill を実行 → 結果要約が返る。
2. `start-phase <id>` → 該当 phase doc の要点が提示される。
3. `finish-phase <id>`（スタブ相手）→ README の進捗が更新される。

## リスク・備考

- SKILL.md 本体は ≤500 行。詳細手順や長いチェックリストは同梱 supporting ファイルに逃がす。
- `description` はエージェントの自動呼び出し精度を左右するため、ユーザーが自然に使う語（「検証」「フェーズ着手」等）を含める。
