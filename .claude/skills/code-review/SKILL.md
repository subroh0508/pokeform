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

- **使う**: `src/**` / `scripts/**` / `data/**`（`raw`/`champions`/`overrides`）/ `*.test.ts` / `__fixtures__/`。
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

### 1. 対象 diff を収集する

```bash
gh pr diff <N>            # PR 番号があるとき
git diff origin/main...HEAD   # ローカルブランチをレビューするとき
```

変更ファイルの一覧から、本 skill の対象（src/scripts/data）だけを抽出する。ハーネス資産が混ざっていれば
`harness-review` を別途使う旨を添える。

### 2. paths から重点観点を選ぶ

変更パスごとに見るべき観点が違う。[`references/code-review-checklist.md`](./references/code-review-checklist.md)
の「paths × 重点観点」表で、該当パスの観点に絞って評価する（全観点を機械的に当てない — シグナルの高い所に集中する）。

### 3. checklist で評価する

checklist の Google 12 観点 / AI 生成コード観点 / pokeform 固有規約を、変更の実体に当てて評価する。
**機械ゲート項目（型が通るか・カバレッジ数値・Biome 整形）は再実行・再チェックしない。** 見るのは
「この設計でよいか」「境界・エラーを取りこぼしていないか」「仕様に忠実か」「生成データに手編集が混ざって
いないか」など、機械が捕れない層。

### 4. 重大度を付けて要約する

各指摘に `blocking` / `non-blocking` / `nit` を付け、総括 → 重大度順でまとめる。基準は
**「健全性の純改善か」**（[`code-review.md`](../../rules/code-review.md)）。nit だけならマージは妨げない。

### 5. PR コメントとして残す

まとめたレビュー結果を `/tmp/<prefix>-review.md` に Write し、`gh pr comment <N> --body-file /tmp/<prefix>-review.md`
で**該当 PR にコメント投稿**する。ブロッキングなしでも「✅ ブロッキングなし」を 1 コメント残す（レビュー実施の記録）。
投稿**前**に [[redaction]] を適用する（Secrets / 最小 PII）。PR 番号が無いローカルレビューはチャット出力に留める。

## Gotchas

- **機械ゲートを再実装しない**: 型 / テスト / カバレッジ / Lint の合否は Phase 9 の Git hooks と CI の責務。
  「lint が通るか」ではなく「設計・仕様・安全性」を見る（[`code-review.md`](../../rules/code-review.md)）。
- **plausible ≠ correct**: AI 生成コードは正常系が通っても仕様と乖離しうる。テストが緑でも仕様忠実性と
  境界・エラー処理を疑う（AI 生成コード観点）。
- **生成物の手編集**: `data/generated/**` は codegen の産物。diff に手編集の痕跡がないか確認する
  （[`data-pipeline`](../../rules/data-pipeline.md)）。
- **書込は PR コメントのみ**: レビュー結果は `gh pr comment` で PR に残すが、**コードの修正コミットや
  auto-merge の実行はしない**（auto-merge の発火条件は checklist の「auto-merge ゲート」節を参照）。

## 関連

- 共通 SoT: [`.claude/rules/code-review.md`](../../rules/code-review.md)。
- 観点チェックリスト: [`references/code-review-checklist.md`](./references/code-review-checklist.md)。
- ハーネス資産用: [`harness-review`](../harness-review/SKILL.md)。
- 再発指摘の流し先: [`pr-retrospective`](../pr-retrospective/SKILL.md) の learning（`🤖 改善提案`）。
