# 0011. 実装ライフサイクルを多段フェーズで統合する `implementation-workflow` skill を置く

- **Status**: Accepted
- **Date**: 2026-06-07

## Context

エージェント（Claude Code / Codex）は着手・実装・検証・PR・レビュー・マージ・レトロ・後片付けの繋ぎ方を都度判断しており、手順がぶれる。これまでの Phase で揃えた部品（rules / skills / Git hooks / ADR / レビュー / レトロ / 依存更新）を、1 本の PR の実装ライフサイクルとして端から端まで定型的に駆動する仕組みが欲しい。

## Decision

実装ライフサイクルを統合するオーケストレーター `implementation-workflow` skill を置く。Phase 0〜9（worktree 作成 + main fetch → `start-phase` で計画読込 → 整合性チェック → 実装 + `pnpm verify`（fix loop 上限 3）→ セルフ検証 → Draft PR → 独立レビュー（`code-review` / `harness-review` を `Agent` で起動）→ auto-merge → `finish-phase` + `pr-retrospective` → worktree 削除）を多段で駆動する。**既存 skill を再利用して束ねる**ことを主眼とし、機械ゲートやレビュー観点を再実装しない。マージ工程は [ADR 0010](./0010-semantic-code-review-skills.md) の auto-merge ゲートに委譲し、独自のマージ規約は導入しない。worktree で並走を物理分離する。SKILL.md 本体 ≤500 行、詳細手順は `.claude/rules/implementation-workflow.md` に分離。詳細は `docs/plan/00-harness-setup/phase-11-implementation-workflow.md`。

## Consequences

- **良い点**: 実装の繋ぎ方が定型化され、worktree で並走を物理分離できる。既存 skill の再利用で新規ロジックを最小に保てる。
- **悪い点 / コスト**: capstone ゆえ依存が広く（ほぼ全フェーズ）、権限も広い（`Agent` / `Write` / `Bash(gh *)`）。破壊的操作（merge / worktree 削除）は前提条件の必須化が要る。
- **トレードオフ / 留意点**: 「設置 ≠ 稼働」。実稼働は MVP 実装 PR 以降で、未整備の依存は前方参照で許容。worktree は Phase 0/9 のペアで管理（忘れると残置）。fix loop は上限 3、超過で `blocked` 記録 + 人間通知。
