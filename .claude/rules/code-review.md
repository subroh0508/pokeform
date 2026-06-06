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

機械ゲート（[ADR 0005](../../docs/adr/0005-git-hooks-over-claude-hooks.md) の Git hooks: 型 / カバレッジ100% / Biome）と merge **後**の KPT レトロ（[ADR 0008](../../docs/adr/0008-kpt-retrospective-loop.md)）の間に欠ける「**PR マージ前の、判断を要する意味的レビュー**」を担う。背景と決定は [ADR 0010](../../docs/adr/0010-semantic-code-review-skills.md)。

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
- **コメントを残す = レビュー結果の記録**であり、**コードの修正コミットや auto-merge の実行とは別**。レビュー skill はコメント投稿までで、修正・マージはしない（auto-merge の発火条件は各 checklist の「auto-merge ゲート」節）。

## effort 段階

呼び出し時の effort で指摘の網羅度と確度を調整する。理由は、小さな PR に過剰な指摘を浴びせると本質が埋もれ、大きな PR に高確度だけだと見落とすため。

- **low / medium**: 高確度の少数指摘に絞る（明確な bug・規約違反・安全性問題）。既定。
- **high**: 観点を広げ、確度がやや低い設計改善・代替案も含める。大きな PR や重要変更で使う。

## redaction

レビュー出力や再発指摘を `docs/harness/` 配下（learning 等）へ書き出す場合や、**PR コメントとして投稿する**場合は、書き出し**前**に [[redaction]] を適用する（Secrets / 最小 PII を `[REDACTED-*]` へ）。レビューのチャット出力自体は対象外だが、ファイル化・PR コメント投稿の瞬間に適用する。

## 連携（一方向）

再発性のあるレビュー指摘は、[ADR 0008](../../docs/adr/0008-kpt-retrospective-loop.md) の KPT learning（`docs/harness/learnings/*`）の `🤖 ハーネス改善提案`（`[rule]` / `[skill]`）へ**一方向**に流す。`pr-retrospective` は PR review コメントを収集するため、指摘は自然に learning の素材になる。構造は [[retrospective-format]]。

## 関連

- 決定の「なぜ」: [ADR 0010](../../docs/adr/0010-semantic-code-review-skills.md)。
- 機械ゲート: [`testing`](./testing.md) / [`tsc-verification`](./tsc-verification.md) / `.githooks/`。
- skill 作成方針: [[skill-authoring]] / cross-agent 配置: [[cross-agent]]。
