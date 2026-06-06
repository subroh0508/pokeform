---
id: 0011
status: Accepted
date: 2026-06-07
---

# 0011. 実装は原則 `implementation-workflow` skill 経由で駆動する

## Context

エージェント（Claude Code / Codex）は着手・実装・検証・PR・レビュー・マージ・レトロ・後片付けの繋ぎ方を都度判断しており、手順がぶれる。これまでの Phase で揃えた部品（rules / skills / Git hooks / ADR / レビュー / レトロ / 依存更新）を、1 本の PR の実装ライフサイクルとして端から端まで定型的に駆動する仕組みが欲しい。単に skill を「用意する」だけでは各エージェントが従う保証がなく、繋ぎ方のぶれが残る。

## Decision

**確定した Plan / Phase の実装は、原則として `implementation-workflow` skill 経由で駆動する**（オーケストレーターを「置く」だけでなく、実装の標準エントリポイントとして使うことを既定とする）。同 skill は Phase 0〜9（worktree 作成 + main fetch → `start-phase` で計画読込 → 整合性チェック → 実装 + `pnpm verify`（fix loop 上限 3）→ セルフ検証 → Draft PR → 独立レビュー（`code-review` / `harness-review` を `Agent` で起動）→ auto-merge → `finish-phase` + `pr-retrospective` → worktree 削除）を多段で駆動する。**既存 skill を再利用して束ねる**ことを主眼とし、機械ゲートやレビュー観点を再実装しない。マージ工程は [ADR 0010](./0010-semantic-code-review-skills.md) の auto-merge ゲートに委譲し、独自のマージ規約は導入しない。worktree で並走を物理分離する。例外（trivial な単発編集や会話的応答）は skill を介さなくてよいが、フェーズ単位の実装では原則これを使う。SKILL.md 本体 ≤500 行、詳細手順と「全実装を原則 skill 経由」の原則は `.claude/rules/implementation-workflow.md` に記す。詳細は `docs/plan/00-harness-setup/phase-11-implementation-workflow.md`。

## Consequences

- **良い点**: 実装の繋ぎ方が定型化・既定化され、エージェントが手順を都度判断する余地（=ぶれ）を減らせる。worktree で並走を物理分離でき、既存 skill の再利用で新規ロジックを最小に保てる。
- **悪い点 / コスト**: capstone ゆえ依存が広く（ほぼ全フェーズ）、権限も広い（`Agent` / `Write` / `Bash(gh *)`）。破壊的操作（merge / worktree 削除）は前提条件の必須化が要る。原則化により、軽微な変更にも一度ワークフロー要否の判断が要る。
- **トレードオフ / 留意点**: 「設置 ≠ 稼働」。実稼働は MVP 実装 PR 以降で、未整備の依存は前方参照で許容。worktree は Phase 0/9 のペアで管理（忘れると残置）。fix loop は上限 3、超過で `blocked` 記録 + 人間通知。原則の例外（trivial 変更）は乱用しない。

## Alternatives Considered

- **skill は用意するが利用は任意（エージェントが着手〜マージの繋ぎ方を都度手動で判断）**: 柔軟だが手順がぶれ、worktree 管理・fix loop 上限・レビュー独立性が抜けやすい。フェーズ単位の実装は原則 `implementation-workflow` 経由に統一し、定型化する方を採用。
