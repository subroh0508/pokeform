---
name: code-review
description: >-
  `src/**`・`scripts/**` 等のライブラリ本体・データパイプラインを変更した PR / diff を、マージ前に
  意味的レビューする。「コードをレビューして」「この PR を見て」「diff をレビュー」「マージ前に確認して」
  「src の変更をレビュー」と言われたとき、または PR open 後にソース変更が含まれるときに使う。Google 12 観点 +
  AI 生成コード固有観点 + pokeform 規約で指摘する。機械ゲート（型 / カバレッジ / Biome）は再実行しない。
  `.claude/rules`・`.claude/skills`・`AGENTS.md`・`CLAUDE.md`・`.githooks`・`docs/` 等のハーネス資産の
  変更は `harness-review` を使う（こちらは src/scripts 専用）。
allowed-tools: Bash(git *), Bash(gh pr *), Read, Grep
---

# code-review — ソース / データパイプラインの意味的レビュー

`src/**` / `scripts/**` / `data/**` を変更した PR を**マージ前**に意味的にレビューし、重大度付きの指摘を
**PR コメントとして残す**手順 skill。機械ゲート（型 / カバレッジ100% / Biome）で捕れない層 —
**仕様忠実性・設計・安全性・整合性** — に専念する。**指摘の投稿までが責務**で、コードの修正コミットや
auto-merge の実行はしない（書込は PR コメントのみ）。

> 共通基準（健全性の純改善・機械ゲート非再実行・指摘フォーマット・effort・redaction）の SoT は
> [`.claude/rules/code-review.md`](../../rules/code-review.md)。観点チェックリストの実体は
> [`references/code-review-checklist.md`](./references/code-review-checklist.md)。背景は [ADR 0017](../../../docs/adr/0017-semantic-code-review-skills.md)。

## なぜこの skill があるか

AI が書いたソースは「もっともらしいが仕様と違う（plausible ≠ correct）」「正常系は通るが境界・エラー処理を
取りこぼす」「セキュリティを既定で甘く見る」傾向がある。機械ゲートはこれらを捕れない。この skill は、
マージで**コード全体が健全になるか**を定型観点で判断し、提案的に指摘する層を埋める。

## 対象範囲（このとき使う / 使わない）

- **使う**: `src/**` / `scripts/**` / `data/**`（`raw`/`champions` catalog）/ `*.test.ts` / `__fixtures__/`。
- **使わない（→ `harness-review`）**: `.claude/rules` / `.claude/skills` / `.agents/skills` / `AGENTS.md` /
  `CLAUDE.md` / `.githooks` / `.claude/settings.json` / `docs/plan` / `docs/adr` / `docs/harness`。
- PR が両方を含むなら、ソース分を本 skill・ハーネス分を `harness-review` で分担する。

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

- **対象範囲**: `src/**` / `scripts/**` / `data/**`（上記「対象範囲」節）。ハーネス資産が混ざれば `harness-review`
  を別途使う旨を添える。
- **観点 checklist**: [`references/code-review-checklist.md`](./references/code-review-checklist.md)（Google 12 観点 /
  AI 生成コード観点 / pokeform 固有規約）。共通手順の step 2-3 はこの checklist の「paths × 重点観点」表で評価する。
  見るのは「この設計でよいか」「境界・エラーを取りこぼしていないか」「仕様に忠実か」「生成データに手編集が
  混ざっていないか」など、機械ゲートが捕れない層。
- **auto-merge ゲート**: [`code-review.md` の「auto-merge ゲート」](../../rules/code-review.md)（発火条件 2 つ）。
  本 skill は merge を実行しない（指摘までが責務）。

## Gotchas

- **機械ゲートを再実装しない**: 型 / テスト / カバレッジ / Lint の合否は Phase 9 の Git hooks と CI の責務。
  「lint が通るか」ではなく「設計・仕様・安全性」を見る（[`code-review.md`](../../rules/code-review.md)）。
- **plausible ≠ correct**: AI 生成コードは正常系が通っても仕様と乖離しうる。テストが緑でも仕様忠実性と
  境界・エラー処理を疑う（AI 生成コード観点）。
- **生成物の手編集**: `src/generated/**` は codegen の産物。diff に手編集の痕跡がないか確認する
  （[`data-pipeline`](../../rules/data-pipeline.md)）。
- **書込は PR コメントのみ**: レビュー結果は `gh pr comment` で PR に残すが、**コードの修正コミットや
  auto-merge の実行はしない**（auto-merge の発火条件は [`code-review.md` の「auto-merge ゲート」](../../rules/code-review.md)）。

## 関連

- 共通 SoT: [`.claude/rules/code-review.md`](../../rules/code-review.md)。
- 観点チェックリスト: [`references/code-review-checklist.md`](./references/code-review-checklist.md)。
- ハーネス資産用: [`harness-review`](../harness-review/SKILL.md)。
- 再発指摘の流し先: [`pr-retrospective`](../pr-retrospective/SKILL.md) の learning（`🤖 改善提案`）。
