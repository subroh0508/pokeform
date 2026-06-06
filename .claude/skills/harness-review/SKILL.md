---
name: harness-review
description: >-
  `.claude/rules`・`.claude/skills`・`.agents/skills`・`AGENTS.md`・`CLAUDE.md`・`.githooks`・
  `.claude/settings.json`・`docs/plan`・`docs/adr`・`docs/harness` 等のハーネス資産（エージェント指示）を
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
> [`references/harness-review-checklist.md`](./references/harness-review-checklist.md)。背景は [ADR 0010](../../../docs/adr/0010-semantic-code-review-skills.md)。

## なぜこの skill があるか

ハーネス資産の不具合は型エラーにならない。`description` の trigger が甘ければ skill は呼ばれず、canonical と
symlink がずれれば Codex 側だけ壊れ、`AGENTS.md` に普遍的でない指示が混ざれば全指示が希釈される。機械ゲートも
ソース用 `code-review` もこれらを捕れない。この skill は「指示資産としての健全性」を定型観点で見る層を埋める。

## 対象範囲（このとき使う / 使わない）

- **使う**: `.claude/rules/**` / `.claude/skills/**` / `.agents/skills/**` / `AGENTS.md` / `CLAUDE.md` /
  `.githooks/**` / `.claude/settings.json` / `.claude/hooks/**` / `docs/plan/**` / `docs/adr/**` / `docs/harness/**`。
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

### 1. 対象 diff を収集する

```bash
gh pr diff <N>            # PR 番号があるとき
git diff origin/main...HEAD   # ローカルブランチをレビューするとき
```

変更ファイルから本 skill の対象（ハーネス資産）を抽出する。ソースが混ざっていれば `code-review` を別途使う。

### 2. paths から重点観点を選ぶ

資産種別ごとに見るべき観点が違う。[`references/harness-review-checklist.md`](./references/harness-review-checklist.md)
の「paths × 重点観点」表で、該当資産の観点に絞って評価する。

### 3. checklist で評価する

checklist の skills / AGENTS.md・CLAUDE.md / rules / 共通（cross-agent・redaction・ゲート二重化）観点を、
変更の実体に当てて評価する。**特にクロスエージェント整合**: canonical（`.claude/skills`）と symlink
（`.agents/skills`）のパリティ、`AGENTS.md`=指示 SoT / `CLAUDE.md`=`@AGENTS.md` 薄アダプタの一貫性を確認する。

### 4. 重大度を付けて要約する

各指摘に `blocking` / `non-blocking` / `nit` を付け、総括 → 重大度順でまとめる。基準は
**「健全性の純改善か」**（[`code-review.md`](../../rules/code-review.md)）。

### 5. PR コメントとして残す

まとめたレビュー結果を `/tmp/<prefix>-review.md` に Write し、`gh pr comment <N> --body-file /tmp/<prefix>-review.md`
で**該当 PR にコメント投稿**する。ブロッキングなしでも「✅ ブロッキングなし」を 1 コメント残す（レビュー実施の記録）。
投稿**前**に [[redaction]] を適用する（Secrets / 最小 PII）。PR 番号が無いローカルレビューはチャット出力に留める。

## Gotchas

- **cross-agent パリティが最重要**: skill 変更で canonical だけ直して symlink/copy がずれると Codex 側が壊れる。
  symlink の指す先・copy フォールバック時の同期を必ず確認する（[[cross-agent]]）。
- **ゲート二重化を疑う**: skill / hook が機械ゲート（型 / テスト / lint）を**再実装**していないか。再実装は
  ドリフトの温床。既存の `pnpm verify` / Git hooks / レビュー skill の**再利用**になっているか見る。
- **`description` = trigger**: 「何を + いつ」を三人称で書き、SKIP 条件も明示しているか。曖昧だと under-trigger
  （呼ばれるべき場面で呼ばれない）/ 誤起動を招く。
- **生成物の手編集**: `docs/harness/rules-index.md` は `scripts/gen-rules-index.ts` の生成物。手編集の混入を疑う。
- **書込は PR コメントのみ**: レビュー結果は `gh pr comment` で PR に残すが、資産の修正コミットや auto-merge の
  実行はしない（auto-merge 条件は checklist 参照）。

## 関連

- 共通 SoT: [`.claude/rules/code-review.md`](../../rules/code-review.md) / [[cross-agent]] / [[skill-authoring]] / [[redaction]]。
- 観点チェックリスト: [`references/harness-review-checklist.md`](./references/harness-review-checklist.md)。
- ソース用: [`code-review`](../code-review/SKILL.md)。
- 再発指摘の流し先: [`pr-retrospective`](../pr-retrospective/SKILL.md) の learning（`🤖 改善提案`）。
