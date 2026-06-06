---
id: 0015
status: Accepted
date: 2026-06-07
---

# 0015. PR ごとに KPT レトロを行い、学びをハーネスへ書き戻すループを採用する

## Context

ハーネス（rules / skills / templates / ADR）は一度作って終わりではなく、実装を進める中で得た学びを反映して継続改善したい。改善の契機と判断基準が無いと、ハーネスは陳腐化するか、逆に場当たり的な追加で肥大化する。pokeform 規模に見合う軽量な自己改良ループが必要。

## Decision

**Pull Request ごとに KPT（Keep / Problem / Try）レトロスペクティブ**を行い、学びをハーネスへ書き戻す二段構えのループを採用する: `pr-retrospective`（1 PR = 1 learning を `docs/harness/learnings/` に生成）→ `harness-meta`（複数 learning を集約し、採用 / 見送り / 撤去を `harness-meta-criteria.md` で判定 → 改修 PR or `adr-new` 起票）。改善提案は `[rule]` / `[skill]` / `[template]` / `[remove]` / `[adr]` のプレフィックスで分類する。重量級の自動化（cron 自動起動・三層メトリクス・外部研究駆動）は pokeform 規模に合わせて簡素化／将来送り。詳細は `docs/plan/00-harness-setup/phase-02-retrospective-loop.md`。

## Consequences

- **良い点**: ハーネスが PR のたびに学びを取り込んで改善する自己改良ループになる。アーキ決定は `[adr]` 経由で本 ADR 体系に流れ込む。
- **悪い点 / コスト**: PR ごとの learning 生成・集約に手間がかかる（軽量化と idempotent 運用で緩和）。
- **トレードオフ / 留意点**: 撤去は誤削除を避けるため 2 段階運用（status `removed` → cooldown → 物理削除）を必須とする。本ループは「仕掛けの設置」であり、実稼働は MVP 実装で最初の PR が出てから。

## Alternatives Considered

- **重量級の自動化を導入**（cron 自動起動・三層メトリクス・外部研究駆動の改善）: 大規模では有効だが pokeform の規模には過剰で運用コストが見合わない。中核の KPT ループ（`pr-retrospective` → `harness-meta`）のみ採用し、重量級は簡素化／将来送りとした。
