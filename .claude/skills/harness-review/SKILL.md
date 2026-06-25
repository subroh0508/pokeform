---
name: harness-review
description: >-
  `.claude/rules`・`.claude/skills`・`.agents/skills`・`AGENTS.md`・`CLAUDE.md`・`.githooks`・
  `.claude/settings.json`・`docs/roadmap`・`docs/adr`・`docs/harness` 等のハーネス資産（エージェント指示）を
  変更した PR をマージ前にレビューする。「ハーネスの変更をレビューして」「rule / skill を見て」「AGENTS.md を
  レビュー」「この skill の trigger は妥当?」と言われたとき、または PR open 後にハーネス資産の変更が含まれる
  ときに使う。description trigger 精度 / クロスエージェント整合 / SoT 一貫性 / paths スコープ / redaction /
  ゲート二重化を指摘する。`src/**`・`scripts/**` のソース変更は `code-review` を使う（こちらはハーネス専用）。
allowed-tools: Bash(git *), Bash(gh pr *), Read, Grep
---

# harness-review — ハーネス資産（エージェント指示）の意味的レビュー

rules / skills / `AGENTS.md` / `CLAUDE.md` / hooks / phase docs / ADR は**エージェントの挙動を左右する
プロンプト資産**であり、ソースコードとは別の観点でレビューが要る。この skill はそれらを変更した PR を
**マージ前**にレビューし、重大度付きの指摘を **PR コメントとして残す**。**指摘の投稿までが責務**で、
資産の修正コミットや auto-merge の実行はしない（書込は PR コメントのみ）。

> 共通基準（健全性の純改善・機械ゲート非再実行・指摘フォーマット・effort・redaction）の SoT は
> [`.claude/rules/code-review.md`](../../rules/code-review.md)。観点チェックリストの実体は
> [`references/harness-review-checklist.md`](./references/harness-review-checklist.md)。背景は [ADR 0017](../../../docs/adr/0017-semantic-code-review-skills.md)。

## なぜこの skill があるか

ハーネス資産の不具合は型エラーにならない。`description` の trigger が甘ければ skill は呼ばれず、canonical と
symlink がずれれば Codex 側だけ壊れ、`AGENTS.md` に普遍的でない指示が混ざれば全指示が希釈される。機械ゲートも
ソース用 `code-review` もこれらを捕れない。この skill は「指示資産としての健全性」を定型観点で見る層を埋める。

## 対象範囲（このとき使う / 使わない）

- **使う**: `.claude/rules/**` / `.claude/skills/**` / `.agents/skills/**` / `AGENTS.md` / `CLAUDE.md` /
  `.githooks/**` / `.claude/settings.json` / `.claude/hooks/**` / `docs/roadmap/**` / `docs/adr/**` / `docs/harness/**`。
- **使わない（→ `code-review`）**: `src/**` / `scripts/**` / `data/**` / `*.test.ts`。
- PR が両方を含むなら、ハーネス分を本 skill・ソース分を `code-review` で分担する。

## 入力

- 引数（任意）: PR 番号 / ブランチ / effort（`low`|`medium`|`high`、既定 `medium`）。
- PR 番号があれば `gh pr diff <N>`、なければ `git diff origin/main...HEAD` で対象 diff を収集する。

## 出力

[`code-review.md`](../../rules/code-review.md) の指摘フォーマットに従い、**該当 PR のコメントとして残す**
（`gh pr comment <N> --body-file`）:

- 冒頭に総括（`✅ ブロッキングなし` or `❌ blocking N 件`）。
- 重大度順（blocking → non-blocking → nit）に、各指摘 `path:line` + 根拠（+ 改善案 / 該当 rule・ADR）。
- PR 番号がないローカルレビューは投稿先が無いためチャット出力に留める。

## 手順

手順骨格の 5 ステップ（diff 収集 → paths 絞込 → checklist 評価 → 重大度 → PR コメント）は
[`code-review.md` の「共通レビュー手順」](../../rules/code-review.md)に一本化されている。本 skill 固有の差分は:

- **対象範囲**: ハーネス資産（上記「対象範囲」節）。ソースが混ざれば `code-review` を別途使う旨を添える。
- **観点 checklist**: [`references/harness-review-checklist.md`](./references/harness-review-checklist.md)（skills /
  AGENTS.md・CLAUDE.md / rules / 共通観点）。共通手順の step 2-3 はこの checklist の「paths × 重点観点」表で評価する。
- **最重要観点 = クロスエージェント整合**: canonical（`.claude/skills`）と symlink（`.agents/skills`）のパリティ、
  `AGENTS.md`=指示 SoT / `CLAUDE.md`=`@AGENTS.md` 薄アダプタの一貫性を必ず確認する（ずれると Codex 側だけ壊れる）。
- **auto-merge ゲート**: [`code-review.md` の「auto-merge ゲート」](../../rules/code-review.md)（発火条件 2 つ）。
  本 skill は merge を実行しない（指摘までが責務）。

## Gotchas

- **cross-agent パリティが最重要**: skill 変更で canonical だけ直して symlink/copy がずれると Codex 側が壊れる。
  symlink の指す先・copy フォールバック時の同期を必ず確認する（[[cross-agent]]）。
- **ゲート二重化を疑う**: skill / hook が機械ゲート（型 / テスト / lint）を**再実装**していないか。再実装は
  ドリフトの温床。既存の `pnpm verify` / Git hooks / レビュー skill の**再利用**になっているか見る。
- **`description` = trigger**: 「何を + いつ」を三人称で書き、SKIP 条件も明示しているか。曖昧だと under-trigger
  （呼ばれるべき場面で呼ばれない）/ 誤起動を招く。
- **生成物の手編集**: `docs/harness/rules-index.md` は `scripts/gen-rules-index.ts` の生成物。手編集の混入を疑う。
- **書込は PR コメントのみ**: レビュー結果は `gh pr comment` で PR に残すが、資産の修正コミットや auto-merge の
  実行はしない（auto-merge 条件は [`code-review.md` の「auto-merge ゲート」](../../rules/code-review.md)）。

## 関連

- 共通 SoT: [`.claude/rules/code-review.md`](../../rules/code-review.md) / [[cross-agent]] / [[skill-authoring]] / [[redaction]]。
- 観点チェックリスト: [`references/harness-review-checklist.md`](./references/harness-review-checklist.md)。
- ソース用: [`code-review`](../code-review/SKILL.md)。
- 再発指摘の流し先: [`pr-retrospective`](../pr-retrospective/SKILL.md) の learning（`🤖 改善提案`）。
