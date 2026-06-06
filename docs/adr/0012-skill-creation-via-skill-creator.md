# 0012. skill の新規作成・改修は `skill-creator` skill の利用を必須化する

- **Status**: Accepted
- **Date**: 2026-06-07

## Context

skill（SKILL.md）はエージェントの挙動を左右するプロンプト資産であり、品質がぶれるとトリガ精度・保守性が落ちる。手書きで SKILL.md を起こすと、`description` が trigger を明示しない（under-trigger する）、本文が肥大化する（≤500 行を超える）、標準構成（役割 / 入力 / 出力 / Gotchas / 関連）から外れる、といった問題が起きやすい。pokeform では複数の skill（`adr-new` / `pr-retrospective` / `harness-meta` / `code-review` / `harness-review` / `implementation-workflow` / 中核 skill 群）を作るため、作成手順の標準化が要る。

## Decision

**skill の新規作成・改修は `skill-creator` skill を利用することを必須化**する。`skill-creator` に、`description` = trigger（何を + いつ、三人称、under-trigger 回避）・本文 ≤500 行・progressive disclosure（長い詳細は `references/` へ分離）・説明型（「ルール + なぜ」を優先し `ALWAYS`/`NEVER` の羅列を避ける）・標準構成を担保させる。配置は canonical `.claude/skills/<name>/SKILL.md`（実体）+ `.agents/skills/<name>` symlink（[ADR 0009](./0009-cross-agent-shared-harness.md)）。この方針の SoT は `.claude/rules/skill-authoring.md`（Phase 7）。詳細は `docs/plan/00-harness-setup/phase-07-rules-and-claude-md.md`。

## Consequences

- **良い点**: 全 skill が標準構成・description=trigger・≤500 行で揃い、トリガ精度と保守性が安定する。手書きの品質ばらつきが消える。
- **悪い点 / コスト**: skill 作成のたびに `skill-creator` を起動する手間が増える。eval 駆動の重い反復は、決定論的・小規模な手順 skill では簡素化してよい。
- **トレードオフ / 留意点**: 仕様の細部は正本（architecture.md / rules）に置き、skill には手順とトリガを書く。skill 作成・改修時は `skill-authoring.md` を SoT として参照する。
