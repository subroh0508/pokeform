---
id: 0017
status: Accepted
date: 2026-06-07
---

# 0017. PR マージ前の意味的レビューを `code-review` / `harness-review` の 2 skill に分割し、CI 緑 + 承認で auto-merge する

## Context

機械ゲート（[ADR 0013](./0013-git-hooks-over-claude-hooks.md) の Git hooks: 型 / カバレッジ100% / Biome）と、merge **後**の KPT レトロ（[ADR 0015](./0015-kpt-retrospective-loop.md)）の間に、「**PR マージ前の、判断を要する意味的レビュー**」層が欠けている。機械ゲートで捕れない仕様忠実性・設計・安全性・整合性を、マージ前に確認したい。文献調査の結論として、**ソースコードのレビュー観点とハーネス資産のレビュー観点は本質的に異なる**（ソースは Google eng-practices + AI 生成コード固有観点、ハーネスは trigger 精度・クロスエージェント整合・SoT 一貫性・redaction）。

## Decision

PR マージ前の意味的レビューを 2 skill に分割する: **`code-review`**（`src/**` / `scripts/**` 等のソース・データパイプライン）と **`harness-review`**（`.claude/rules` / `.claude/skills` / `AGENTS.md` / `CLAUDE.md` / `.githooks` / `docs/plan` / `docs/adr` 等のハーネス資産）。レビューは**提案的**で、機械ゲートが緑にした項目（型/カバレッジ/Biome）は**再実行しない**。auto-merge は server-side CI（`.github/workflows/ci.yml` でコンテナ内 `pnpm verify`）+ branch protection を前提に、**CI 緑 ＋ ブロッキング指摘なし**で `gh pr merge --auto` する。SKILL.md 本体は ≤500 行、観点チェックリストは `references/` に分離。詳細は [[code-review]]。

## Consequences

- **良い点**: 観点の異なる 2 種のレビューが適切な対象にだけ起動し、機械ゲートと二重化せず意味的層に専念できる。CI 緑 + 承認で auto-merge が回る。
- **悪い点 / コスト**: skill が 2 つに増え、`description` の trigger / SKIP 精度を保つ必要がある（誤起動防止）。auto-merge は server-side CI と branch protection の整備が前提。
- **トレードオフ / 留意点**: 提案的レビューを強制ゲートと誤認させない（最終 approve は人間または明示ルール）。組み込み `code-review` skill との名前衝突に注意。再発性の指摘は [ADR 0015](./0015-kpt-retrospective-loop.md) の learning へ一方向に流す。

## Alternatives Considered

- **単一のレビュー skill でソースとハーネスを両方見る**: シンプルだが、ソースコードのレビュー観点（正確性・性能・データパイプライン）とハーネス資産の観点（trigger 精度・cross-agent 整合・SoT 一貫性）は本質的に異なり、1 skill では焦点がぼやける。`code-review` / `harness-review` の 2 分割を採用。
