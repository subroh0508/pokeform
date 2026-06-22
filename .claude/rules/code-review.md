---
paths:
  - "src/**"
  - "scripts/**"
  - ".claude/**"
  - "docs/**"
  - "AGENTS.md"
  - "CLAUDE.md"
description: PR マージ前の意味的レビュー（code-review / harness-review skill）の共通 SoT。レビュー基準「健全性の純改善」・機械ゲート非再実行・指摘フォーマット（重大度 / ファイル:行 / 根拠）・effort 段階・redaction を定める。ソース / ハーネス資産を変更する PR をレビューするとき適用する。
---

# code-review — 意味的レビューの共通規約（SoT）

機械ゲート（[ADR 0013](../../docs/adr/0013-git-hooks-over-claude-hooks.md) の Git hooks: 型 / カバレッジ100% / Biome）と merge **後**の KPT レトロ（[ADR 0015](../../docs/adr/0015-kpt-retrospective-loop.md)）の間に欠ける「**PR マージ前の、判断を要する意味的レビュー**」を担う。背景と決定は [ADR 0017](../../docs/adr/0017-semantic-code-review-skills.md)。

レビューは対象によって観点が本質的に異なるため 2 skill に分割する。本 rule はその**共通基準**で、観点チェックリストの実体は各 skill の `references/` にある:

- [`code-review`](../skills/code-review/SKILL.md) — `src/**` / `scripts/**` 等のソース・データパイプライン。
- [`harness-review`](../skills/harness-review/SKILL.md) — `.claude/rules` / `.claude/skills` / `AGENTS.md` / `CLAUDE.md` / `.githooks` / `docs/plan` / `docs/adr` 等のハーネス資産。

## レビュー基準（なぜ）

**「完璧さでなく、コード健全性の純改善（net improvement）」**（Google eng-practices）。レビューは理想形を求める場ではなく、マージで全体が良くなるかを判断する場。これを基準にする理由は、完璧主義は PR を停滞させ、提案的レビューを実質的な強制ゲートに変質させてしまうため。健全性を確実に上げる変更は、未解決の nit が残っていてもマージを妨げない。

## 機械ゲート非再実行の原則（なぜ）

型 / カバレッジ100% / Biome は [Phase 9](../../docs/plan/00-harness-setup/phase-09-verification-gates.md) の Git hooks と CI（`.github/workflows/ci.yml`）の責務。**レビューでこれらを再チェックしない。** 理由は二重化が無駄でドリフトの温床になるため。レビューは機械ゲートで捕れない層 — **仕様忠実性・設計・安全性・整合性** — に専念する。「lint が通るか」ではなく「この設計でよいか / エッジケースを取りこぼしていないか」を見る。

## 指摘フォーマット

各指摘は次を備える。理由は、重大度が曖昧だと nit がマージを止め、根拠がないと指摘が独断に見え、対話が空転するため。

- **重大度**: `blocking`（マージ前に必須）/ `non-blocking`（直すべきだが今でなくてよい）/ `nit`（任意・好み）。
- **位置**: `path:line`（範囲なら `path:line-line`）。
- **根拠**: なぜ問題か + 可能なら具体的な改善案。規約由来なら該当 rule / ADR を引く。

出力は冒頭に総括（`✅ ブロッキングなし` or `❌ blocking N 件`）を置き、重大度順（blocking → non-blocking → nit）に列挙する。

## 出力先（PR コメントに残す）

レビュー結果は**該当 PR のコメントとして残す**（`gh pr comment <N> --body-file <file>`）。理由は、指摘を PR 上に残すことでレビュー履歴が辿れ、`pr-retrospective` が PR コメントから learning を収集でき、auto-merge 判断の根拠が可視化されるため。

- **PR 番号があるとき**: 上記フォーマットの総括 + 指摘を **1 つの要約コメント**として投稿する（`gh pr comment`）。ブロッキングなしでも「✅ ブロッキングなし」のコメントを残す（レビュー実施の記録）。
- **ローカルブランチのみ（PR 未作成）でレビューするとき**: 投稿先が無いためチャット出力に留める。
- コメントは GitHub への書き出しなので、投稿**前**に [[redaction]] を適用する（Secrets / 最小 PII を `[REDACTED-*]` へ）。
- **コメントを残す = レビュー結果の記録**であり、**コードの修正コミットや auto-merge の実行とは別**。レビュー skill はコメント投稿までで、修正・マージはしない（auto-merge の発火条件は下記「auto-merge ゲート」節）。

## 共通レビュー手順（両 skill 共通の 5 ステップ）

`code-review` / `harness-review` は手順骨格を共有する。**対象 paths と参照する checklist だけが違う**（その差分は各 skill 本文が持つ）。両 skill はこのフレームを参照し、逐語の手順記述を持たない。

1. **対象 diff を収集する** — PR 番号があれば `gh pr diff <N>`、なければ `git diff origin/main...HEAD`。変更ファイルから自分の対象範囲（src/scripts/data ↔ ハーネス資産）だけを抽出し、対象外が混ざれば相方の skill を別途使う旨を添える。
2. **paths から重点観点を選ぶ** — 各 skill の `references/*-checklist.md` の「paths × 重点観点」表で、該当パスの観点に絞る（全観点を機械的に当てない）。
3. **checklist で評価する** — checklist の観点を変更の実体に当てる。**機械ゲート項目（型 / カバレッジ数値 / Biome 整形）は再実行・再チェックしない**（上記「機械ゲート非再実行の原則」）。
4. **重大度を付けて要約する** — 各指摘に `blocking` / `non-blocking` / `nit` を付け、総括 → 重大度順でまとめる（上記「指摘フォーマット」）。
5. **PR コメントとして残す** — `/tmp/<prefix>-review.md` に Write し `gh pr comment <N> --body-file` で投稿。ブロッキングなしでも「✅ ブロッキングなし」を 1 コメント残す。投稿**前**に [[redaction]] を適用する。PR 番号が無いローカルレビューはチャット出力に留める（上記「出力先」）。

## auto-merge ゲート（発火条件）

レビューは**提案的**。auto-merge は次の **2 条件がともに揃ったとき**のみ `gh pr merge --auto --merge` を予約する（[ADR 0017](../../docs/adr/0017-semantic-code-review-skills.md)）:

1. **server-side CI（`.github/workflows/ci.yml` の `pnpm verify`）が緑** — 機械ゲート（required status check）。ローカル Git hooks は GitHub の merge を gate しないため CI が必須。
2. **ブロッキング指摘なし** — レビューで `blocking` が 0 件。

どちらかが欠ければ auto-merge は**止まる**。最終 approve は人間（または branch protection の承認ルール）に置く。レビュー skill 自身は merge を実行しない（指摘までが責務）。auto-merge コマンドの予約は実装ワークフロー（[[implementation-workflow]]）が担う。

## effort 段階

呼び出し時の effort で指摘の網羅度と確度を調整する。理由は、小さな PR に過剰な指摘を浴びせると本質が埋もれ、大きな PR に高確度だけだと見落とすため。

- **low / medium**: 高確度の少数指摘に絞る（明確な bug・規約違反・安全性問題）。既定。
- **high**: 観点を広げ、確度がやや低い設計改善・代替案も含める。大きな PR や重要変更で使う。

## redaction

レビュー出力や再発指摘を `docs/harness/` 配下（learning 等）へ書き出す場合や、**PR コメントとして投稿する**場合は、書き出し**前**に [[redaction]] を適用する（Secrets / 最小 PII を `[REDACTED-*]` へ）。レビューのチャット出力自体は対象外だが、ファイル化・PR コメント投稿の瞬間に適用する。

## 連携（一方向）

再発性のあるレビュー指摘は、[ADR 0015](../../docs/adr/0015-kpt-retrospective-loop.md) の KPT learning（`docs/harness/learnings/*`）の `🤖 ハーネス改善提案`（`[rule]` / `[skill]`）へ**一方向**に流す。`pr-retrospective` は PR review コメントを収集するため、指摘は自然に learning の素材になる。構造は [[retrospective-format]]。

## 関連

- 決定の「なぜ」: [ADR 0017](../../docs/adr/0017-semantic-code-review-skills.md)。
- 機械ゲート: [`testing`](./testing.md) / [`tsc-verification`](./tsc-verification.md) / `.githooks/`。
- skill 作成方針: [[skill-authoring]] / cross-agent 配置: [[cross-agent]]。
