---
id: 0020
status: Accepted
date: 2026-06-07
---

# 0020. 実装の入口を計画分解スキル（plans-new）に一本化する

## Context

pokeform の実装は [ADR 0018](./0018-implementation-workflow-orchestrator.md) で
`implementation-workflow` skill 経由の駆動に統一した。しかし「**確定していない生の実装指示・機能要望を
受けてから、最初の phase / plan が確定するまで**」の前段が定型化されておらず、エージェント（Claude Code /
Codex）はプロンプトを直に受けて着手の仕方・分割の粒度を都度判断していた。結果として、OVERVIEW（何を実現
するか）を固めずにいきなり phase を切る・巨大すぎる 1 PR を作る・分割基準が回ごとにぶれる、という非一貫性が
起きやすい。

`implementation-workflow` は「確定した Plan / Phase の**実装ライフサイクル**」を担うが、「指示を計画へ落とす
**前段**」は守備範囲外。ここを埋める入口が必要になった。ADR を残すのは、これが「実装の標準フローに新しい
必須ステージを追加する」不可逆寄りの運用決定であり、後から背景なしに覆されると一貫性が崩れるため。

## Decision

生の実装指示・機能要望は、着手の前に**必ず `plans-new` スキルを入口に通す**。`plans-new` は次を定型化する:

1. 指示をブラッシュアップし、**まず `OVERVIEW.md`（ゴール / 背景 / 設計方針 / 実装指針 / スコープ外）を
   作る**（順序厳守）。
2. OVERVIEW を **6 基準**（意思決定の数 / 不可逆性 / スコープの広さ / 技術的難易度 / 想定 diff〔~500 行
   目安・>1000 行は積極分割・データセット等の分割困難は例外〕/ 並行実装のしやすさ）で 1 phase = 1 PR に
   分割する。
3. **1 PR 妥当**なら `docs/plan/` を作らず GitHub issue を起票して `implementation-workflow` をキック、
   **複数 phase** なら `docs/plan/NN-{slug}/` 計画群（OVERVIEW + README〔Mermaid 依存グラフ〕+ phase doc）を
   起こして `start-phase` / `implementation-workflow` へ繋ぐ。

`plans-new` は**計画化に専念**し、実装駆動（worktree〜マージ〜レトロ）は `implementation-workflow` に委ねる
（役割分担）。手順の正本は [`.claude/rules/planning.md`](../../.claude/rules/planning.md)、6 基準の運用詳細は
`plans-new` の `references/`。機械ゲート・レビュー観点は再実装せず既存 skill を再利用する。

## Consequences

- **良い点**:
  - 実装着手の前段が定型化され、OVERVIEW → 6 基準分割の順序が保証される（粒度のぶれ・巨大 PR を抑制）。
  - `adr-new`（決定を採番して起こす）と同系の「採番して新しい計画群を起こす入口」が揃い、ハーネスの
    エントリポイントが一貫する。
  - 1 PR / 複数 phase の判断と書き出し先（issue / 計画群）が明文化され、Claude Code / Codex 双方で再現する。
- **悪い点 / コスト**:
  - 実装着手までに 1 ステージ増える。trivial な単発編集にまで適用すると過剰なので、例外（trivial / 会話的
    応答）を明示して回避する。
- **トレードオフ / 留意点**:
  - `implementation-workflow` との責務境界（計画化 = plans-new / 実装駆動 = implementation-workflow）を
    曖昧にすると二重管理になる。相互参照を軽く張るに留め、手順 SoT は `planning.md` に一本化する。

## Alternatives Considered

- **`start-phase` を拡張して計画化も担わせる** — 却下。`start-phase` は「確定済み phase doc を読み着手準備を
  整える」入口であり、「未確定の指示を OVERVIEW 化して分割する」前段とは責務が異なる。混ぜると単一責務が
  崩れ、トリガが曖昧になる（着手前なのか着手なのかが判別不能になる）。
- **`implementation-workflow` の Phase 0 手前に計画化サブステップを足す** — 却下。`implementation-workflow`
  は「1 本の PR の実装ライフサイクル」を担う skill で、複数 phase を生む計画分解（1→多）はスコープが合わない。
  計画化を別スキルに切り出し、両者を相互参照で繋ぐ方が責務が明快。
- **rule のみで運用しスキルを作らない** — 却下。rule（planning.md）は知識の SoT だが、「OVERVIEW を作る →
  採番する → issue / 計画群を書き出す」という**手順の駆動**には skill が要る（`adr-new` と同じ理由）。
