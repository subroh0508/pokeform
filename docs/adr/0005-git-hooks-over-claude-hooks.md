---
id: 0005
status: Accepted
date: 2026-06-07
---

# 0005. 強制ゲートは Claude hooks ではなく Git ネイティブフックに置く

## Context

検証ゲート（型 / カバレッジ100% / Lint）を「強制」したい。Claude Code 固有の hooks（`.claude/settings.json` + `.claude/hooks/*`）に置くと、Codex・素の git・CI・他の人間コミッターには効かず、ツール依存の片手落ちになる。pokeform は Claude Code / Codex 両対応のハーネスを目指しており（[ADR 0009](./0009-cross-agent-shared-harness.md)）、ゲートはツール非依存である必要がある。

## Decision

強制ゲートを **Git ネイティブフック**（`.githooks/` + `core.hooksPath`）に集約する。`pre-commit` で高速ゲート（`pnpm typecheck` → `pnpm lint`）、`pre-push` で重ゲート（`pnpm test:cov`、カバレッジ100%）を実行し、失敗で `exit 1`。`core.hooksPath=.githooks` は `package.json` の `prepare` で設定し、新規 clone でも `pnpm install` で有効化される。Claude 固有の即時フィードバック（編集直後の Biome 等）は**補助**として `.claude/hooks` に併設するが、ゲートとは二重化しない（commit ブロックの PreToolUse は置かない）。詳細は `docs/plan/00-harness-setup/phase-09-verification-gates.md`。

## Consequences

- **良い点**: Claude・Codex・素の git・CI すべてにゲートが効く（ツール非依存）。追加依存なし（`core.hooksPath` のみ）。
- **悪い点 / コスト**: Git hook は実行権限（`chmod +x`）が必要。ローカル hook は GitHub の merge を gate しないため、server-side CI を別途用意する（[ADR 0010](./0010-semantic-code-review-skills.md)）。
- **トレードオフ / 留意点**: 重い検証は push 境界に集約し commit を軽く保つ（編集毎の全実行はループを遅くするため不採用）。Claude 補助 hook は任意機能であり、ゲートの正本は `.githooks/`。

## Alternatives Considered

- **強制ゲートを Claude 固有 hooks（`.claude/settings.json` + `.claude/hooks/*`）に置く**: Claude Code には効くが Codex・素の git・CI には効かずツール依存になる。ツール非依存で全コミッターに効く Git ネイティブフックをゲートに採用し、Claude hooks は補助に留める。
