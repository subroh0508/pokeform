# 09-champions-data-rollout — M-A/M-B 解禁データ投入（実装計画インデックス）

レギュレーション M-A・M-B の解禁データ（種族 / 技 / 持ち物 / メガ）を、整備済みの取得パイプライン + 新レイアウトの上で投入し両レギュを完成させる計画群。全量投入の前に **`survey-regulation` スキルを限定セット（M-A 代表 10 体・M-B 追加解禁種）で実地検証する人間ゲート**を挟み、skill 健全性を確認してから本投入する。02 の旧 phase-20 を起源に複数回の cross-plan move を経て独立計画群として確定し、本計画で採番を `XX-` → `09` に確定した。新規実装は原則せず、
[03-survey-regulation-rework](../completed/03-survey-regulation-rework/README.md)（取得刷新）+
[04-generated-layout-redesign](../completed/04-generated-layout-redesign/README.md)（レイアウト再編）+
[05-move-master-scraper-refactor](../completed/05-move-master-scraper-refactor/README.md)（技マスター取得 + 役割分割 + skill 再編）
で整えた仕組みに投入を委譲する（一方通行 04 → 05 → 09）。例外は検証ゲートで判明した範囲の skill 改修。

> 設計の正本は [`OVERVIEW.md`](./OVERVIEW.md)（ゴール / 背景 / 設計方針 / 実装指針 / スコープ外 / 計画群全体の受け入れ
> 基準）。規約は [`.claude/rules/data-pipeline.md`](../../../.claude/rules/data-pipeline.md)。情報源方針は
> [`serebii-sourcing.md`](../../../.claude/skills/survey-regulation/references/serebii-sourcing.md)。

## フェーズ依存グラフ

```mermaid
flowchart TD
    P04[04-generated-layout-redesign 完了] --> P05[05-move-master-scraper-refactor 完了]
    P05 --> P1[phase-01 — レコード全削除 + M-A 限定投入（10 体 + 全持ち物）]
    P1 --> P2[phase-02 — M-B 限定投入（10 体 + M-B 追加解禁全種 + 全持ち物）]
    P2 --> P3[phase-03 — 人間による skill 動作検証ゲート]
    P3 -->|NG: 修正してサイクル再実行| P1
    P3 -->|OK| P4[phase-04 — M-A・M-B 全解禁情報の本投入]
```

## フェーズ一覧（この順で実施）

- [ ] [Phase 1 — レコード全削除 + M-A 限定投入（リザードン・スターミー・ゲンガー含む 10 体 + 全持ち物）](./phase-01-reset-and-ma-limited.md)
- [ ] [Phase 2 — M-B 限定投入（M-A の 10 体 + M-B 追加解禁全種 + 全持ち物）](./phase-02-mb-limited.md)
- [ ] [Phase 3 — 人間による `survey-regulation` skill 動作検証ゲート（NG なら P1-2 サイクル再実行）](./phase-03-skill-verification-gate.md)
- [ ] [Phase 4 — M-A・M-B 全解禁情報の本投入（全種・全技・全持ち物・全メガ）](./phase-04-full-rollout.md)

> 計画群全体の受け入れ基準は [`OVERVIEW.md` の「受け入れ基準」節](./OVERVIEW.md#受け入れ基準) を参照。
> **依存は一方通行**: 先行する [04-generated-layout-redesign](../completed/04-generated-layout-redesign/README.md)（Phase 1-3 再編）
> → [05-move-master-scraper-refactor](../completed/05-move-master-scraper-refactor/README.md)（技マスター取得 + 役割分割）→ 本計画群
> （09）。04 / 05 へ戻る依存は無い。Phase 3 の検証ゲートのみ Phase 1 へ戻るサイクルを持つ（skill 改修時）。

## 補足

- 各 phase doc は [`plan-templates.md`](../../../.claude/skills/plans-new/references/plan-templates.md) の
  「phase-NN-<slug>.md」節（テンプレ正本）に従う。
- **Phase 4（本投入）は >1000 行を 1 PR 許容**: 全種・各種族数十技規模で意味ある粒度分割が困難なため 1 PR とする
  （[[planning]] の例外・[`OVERVIEW.md`](./OVERVIEW.md#phase-分割6-基準の評価サマリ) に根拠記載）。Phase 1-2 の限定セットは中規模。
- **着手前提**: 先行する 04（レイアウト再編）→ 05（技マスター取得 + 役割分割 + skill 再編）を完了済み。
  技メタの正しさは 05 Phase 2 で担保済み（旧 03 Phase 13 の手動是正を代替・根本解決）。
- **検証ゲートでの取りこぼし・使い勝手の問題**は `survey-regulation` を `skill-creator` で改修して解消する（[[skill-authoring]] / [[adr]]）。
