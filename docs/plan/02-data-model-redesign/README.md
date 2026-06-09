# 02-data-model-redesign — ポケモンデータ保持モデルの再設計（実装計画インデックス）

ポケモンチャンピオンズの**レギュレーションごとに変化する解禁情報**（種族・技・持ち物・メガシンカ）を
正しく保持できるよう、データ保持モデルを再設計する計画群。入力 YAML の構造（カタログ分離 / per-regulation 化）と
生成 TS 型（per-reg 型・解禁判定の正本一本化）を作り直し、最後にレギュレーション M-A の解禁データを
信頼できる情報源から全量投入する。設計の正本は [`OVERVIEW.md`](./OVERVIEW.md)、規約は
[`.claude/rules/data-pipeline.md`](../../../.claude/rules/data-pipeline.md) / [`type-conventions.md`](../../../.claude/rules/type-conventions.md)。

> 設計の正本は [`OVERVIEW.md`](./OVERVIEW.md)（ゴール / 背景 / 設計方針 / 実装指針 / スコープ外 /
> 計画群全体の受け入れ基準）。本 README は薄索引（導入 + OVERVIEW ポインタ + 依存グラフ + phase 一覧）。

## フェーズ依存グラフ

```mermaid
flowchart TD
    P1[phase-01 — カタログ分離] --> P2[phase-02 — レギュレーションモデル再設計]
    P2 --> P3[phase-03 — 情報源確定 + 20匹サンプル検証]
    P3 --> P4[phase-04 — per-regulation 種族型 + 個体複数レギュ宣言]
    P4 --> P5[phase-05 — 技記録スキーマ再設計]
    P5 --> P6[phase-06 — generate 変換専任 + 検証ゲート]
    P6 --> P7[phase-07 — M-A 全データ投入]
```

## フェーズ一覧（この順で実施）

- [x] [Phase 1 — カタログ分離（種族 / 技 / 持ち物 / 特性の append-only マスター）](./phase-01-catalog-split.md)
- [x] [Phase 2 — レギュレーションモデル再設計（per-reg YAML + period + per-reg 型 + A案型機構）](./phase-02-regulation-model.md)
- [x] [Phase 3 — 情報源確定 + 20匹サンプル検証](./phase-03-source-and-sample.md)
- [x] [Phase 4 — per-regulation 種族型 + 個体の複数レギュレーション宣言（global species.ts 廃止 → per-reg species.ts 正本・per-reg 習得技 + reg-aware 型機構 + 個体 regulations:[] fan-out）](./phase-04-per-regulation-species.md)
- [ ] [Phase 5 — 技記録スキーマ再設計（種族キー = 解禁 + per-species moves/mega[]・block 記法・generate 読取り追従・ADR 0022）](./phase-05-move-recording-schema.md)
- [ ] [Phase 6 — generate.ts を変換専任へ縮小 + authoring 検証ゲート check:regulation 新設（ADR-B）](./phase-06-generator-and-validation.md)
- [ ] [Phase 7 — M-A 全データ投入（全186種 + 全 learnable 技）](./phase-07-ma-full-data.md)

> 計画群全体の受け入れ基準は [`OVERVIEW.md` の「受け入れ基準」節](./OVERVIEW.md#受け入れ基準) を参照。

## 補足

- 各 phase doc は [`plan-templates.md`](../../../.claude/skills/plans-new/references/plan-templates.md) の
  「phase-NN-<slug>.md」節（テンプレ正本）に従う。
- スキル作成は `skill-creator`、ADR は `adr-new`（[[skill-authoring]] / [[adr]]）。Phase 2 はデータ保持モデルの
  アーキ決定（解禁判定正本の一本化 / カタログ分離 / period）として ADR を起票する（ADR 0012 / 0014 を踏まえる）。
