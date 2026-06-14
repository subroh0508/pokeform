# 03-survey-regulation-rework — survey-regulation 刷新（決定論スクレイパー + 自己修復）（実装計画インデックス）

`survey-regulation` skill による Champions 解禁データ取得を、LLM の WebFetch 目視抽出から **決定論スクレイパー
（cheerio）+ Haiku 取得 SubAgent + 修正 SubAgent 自己修復（ハイブリッド3層）**へ刷新する計画群。トークン消費の
削減と正確性の向上を狙い、最後に新パイプラインで M-A 全186種を投入する。02-data-model-redesign の最終 phase
だった「M-A 全データ投入」は新パイプラインで実行すべきため、本計画群の最終 phase（Phase 10）へ移動した。
動作確認で判明した是正（per-reg 持ち物 legality・per-reg species name 削除・メガ決定論取り込み）を全量投入の前に
Phase 7-9 として追加している。

> 設計の正本は [`OVERVIEW.md`](./OVERVIEW.md)（ゴール / 背景 / 設計方針 / 実装指針 / スコープ外 /
> 計画群全体の受け入れ基準）。規約は [`.claude/rules/data-pipeline.md`](../../../.claude/rules/data-pipeline.md) /
> 情報源方針は [`serebii-sourcing.md`](../../../.claude/skills/survey-regulation/references/serebii-sourcing.md)。

## フェーズ依存グラフ

```mermaid
flowchart TD
    P1[phase-01 — 決定論パーサ純関数 + fixture] --> P3[phase-03 — serebii-to-catalog 転記 + ja 補完 + ADR]
    P2[phase-02 — items スクレイパー + fetch-serebii キャッシュ] --> P3
    P3 --> P4[phase-04 — Haiku 取得 SubAgent + Workflow fan-out]
    P4 --> P5[phase-05 — 修正 SubAgent + 自己修復ループ]
    P5 --> P6[phase-06 — SKILL 全面改訂 + cross-agent パリティ]
    P6 --> P7[phase-07 — per-reg 持ち物 legality + メガストーン保持ルール]
    P7 --> P8[phase-08 — per-reg species name 削除]
    P7 --> P9[phase-09 — メガ決定論自動取り込み]
    P8 --> P10[phase-10 — regulations ゲームグルーピング]
    P9 --> P10
    P10 --> P11[phase-11 — 技メタを per-game へ移転]
    P11 --> P12[phase-12 — 取得スキル 2 分割 + catalog チェックポイント]
    P12 --> P13[phase-13 — M-A 全データ投入（全186種・旧 02 phase-20）]
```

## フェーズ一覧（この順で実施）

- [x] [Phase 1 — 決定論パーサ純関数 + fixture テスト（cheerio・latin-1・slug 正規化・自己検証 exit code）](./phase-01-deterministic-parser.md)
- [x] [Phase 2 — items スクレイパー + fetch-serebii キャッシュ（Hold/Berries/Mega Stones・data/raw/serebii/）](./phase-02-items-and-fetch-cache.md)
- [x] [Phase 3 — serebii-to-catalog 転記 + ja 補完 + パイプライン結合 + ADR（append-only・PokeAPI names）](./phase-03-catalog-writer-and-adr.md)
- [x] [Phase 4 — Haiku 取得 SubAgent + Workflow fan-out（層2・HTML を読まない・冪等キャッシュ）](./phase-04-haiku-fetch-fanout.md)
- [x] [Phase 5 — 修正 SubAgent + 自己修復ループ（層3・K 回上限・エスカレーション）](./phase-05-self-healing-loop.md)
- [x] [Phase 6 — SKILL.md 全面改訂 + cross-agent パリティ + ツール整備](./phase-06-skill-rewrite-and-parity.md)
- [x] [Phase 7 — per-reg 持ち物 legality（メガストーン保持ルール = base 全件 / メガ形態 = 対応ストーンのみ・megaSpecies リンク）](./phase-07-per-reg-item-legality.md)
- [x] [Phase 8 — per-reg species から不要な種族名 ja/en を削除（speciesBaseDex に集約）](./phase-08-per-reg-species-name-trim.md)
- [x] [Phase 9 — メガ関連の決定論自動取り込み（megaLinks / mega[] / megaSpecies 自動著述・ADR 0031 supersede）](./phase-09-deterministic-mega-capture.md)
- [ ] [Phase 10 — regulations をゲームグルーピング（`regulations/champions/m-(a|b).yaml`）](./phase-10-game-grouped-regulations.md)
- [ ] [Phase 11 — 技メタを per-game へ移転（catalog = 名前 / `regulations/champions/moves.yaml` = 技メタ・ADR 0026 改訂）](./phase-11-per-game-move-meta.md)
- [ ] [Phase 12 — 取得スキルを 2 分割（catalog 取得 / regulations 取得）+ catalog 更新チェックポイント](./phase-12-update-skill-split.md)
- [ ] [Phase 13 — M-A 全データ投入（全186種 + 全 movepool・新パイプライン経由・旧 02 phase-20）](./phase-13-ma-full-data.md)

> 計画群全体の受け入れ基準は [`OVERVIEW.md` の「受け入れ基準」節](./OVERVIEW.md#受け入れ基準) を参照。

## 補足

- 各 phase doc は [`plan-templates.md`](../../../.claude/skills/plans-new/references/plan-templates.md) の
  「phase-NN-<slug>.md」節（テンプレ正本）に従う。
- スキル作成・改修は `skill-creator`、ADR は `adr-new`（[[skill-authoring]] / [[adr]]）。層2-3 の SubAgent
  オーケストレーションは Workflow スクリプトで実装する（OVERVIEW 設計方針）。
- Phase 7-9 は survey-regulation の動作確認で判明した是正（per-reg 持ち物 legality・per-reg species name 削除・
  メガ決定論取り込み）。M-A 全データ投入（Phase 13）の前段として、legality 強制とメガ自動取り込みを揃える。
- Phase 10-12 はデータレイアウト整備（ゲームグルーピング・per-game 技メタ・取得スキル 2 分割）。全種族投入
  （Phase 13）の手前で、`regulations/champions/` レイアウト・`catalog`(名前)/`regulations`(技メタ) の責務分離・
  catalog 取得 / regulations 取得スキルの分割を確定させる de-risk（learning #59/#76 の「全量投入の手前で仕組みを
  確定」と同型）。
- Phase 13 は 02-data-model-redesign の旧 phase-20（M-A 全データ投入）を移動・改稿したもの。新パイプライン
  （決定論スクレイパー + 自己修復 + メガ自動取り込み）経由で、Phase 10-12 の最終レイアウト・2 skill 体制で
  全186種を投入する点が旧 doc から更新されている。
