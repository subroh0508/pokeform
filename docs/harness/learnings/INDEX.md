# Learnings 索引

PR ごとの KPT レトロスペクティブ learning の索引。`pr-retrospective` skill が learning を生成するたびに
本表へ 1 行追記する（同 PR の既存行があれば idempotent skip）。

- learning の構造 SoT: [`.claude/rules/retrospective-format.md`](../../../.claude/rules/retrospective-format.md)
- 書き戻し判定: [`.claude/rules/harness-meta-criteria.md`](../../../.claude/rules/harness-meta-criteria.md)
- ループ全体像: [`../README.md`](../README.md)

| PR | タイトル | 生成日 | 関連 Plan | status | ファイル |
|---|---|---|---|---|---|
| #22 | 01-mvp Phase 0 足場 + 実数値計算 | 2026-06-06 | 01-mvp/phase-00 | draft | [2026-06-06-pr-22.md](./2026-06-06-pr-22.md) |
| #24 | 01-mvp Phase 1 データ生成 + 一貫性/技範囲チェック | 2026-06-06 | 01-mvp/phase-01 | draft | [2026-06-06-pr-24.md](./2026-06-06-pr-24.md) |
| #26 | 01-mvp Phase 2 個体 tsc 検証層 | 2026-06-07 | 01-mvp/phase-02 | draft | [2026-06-07-pr-26.md](./2026-06-07-pr-26.md) |
| #29 | 01-mvp Phase 3 ステータス調整の壁打ち | 2026-06-07 | 01-mvp/phase-03 | draft | [2026-06-07-pr-29.md](./2026-06-07-pr-29.md) |
| #31 | チャンピオンズ M-A 解禁データ修正 | 2026-06-07 | — | draft | [2026-06-07-pr-31.md](./2026-06-07-pr-31.md) |
| #34 | 実装の入口スキル plans-new を新設 | 2026-06-07 | — | draft | [2026-06-07-pr-34.md](./2026-06-07-pr-34.md) |
| #38 | 02-data-model-redesign 計画群を plans-new で起票 | 2026-06-07 | 02-data-model-redesign | draft | [2026-06-07-pr-38.md](./2026-06-07-pr-38.md) |
| #40 | 02 Phase 1 カタログ分離（生成物バイト等価） | 2026-06-07 | 02-data-model-redesign/phase-01 | draft | [2026-06-07-pr-40.md](./2026-06-07-pr-40.md) |
| #42 | 02 Phase 2 解禁の per-regulation 一本化（A案・ADR 0021） | 2026-06-07 | 02-data-model-redesign/phase-02 | draft | [2026-06-07-pr-42.md](./2026-06-07-pr-42.md) |
| #44 | 02 Phase 3 M-A情報源確定 + survey-regulation skill + 20匹 | 2026-06-07 | 02-data-model-redesign/phase-03 | draft | [2026-06-07-pr-44.md](./2026-06-07-pr-44.md) |
| #47 | 02 Phase 4 per-regulation 種族型 + 個体複数レギュ宣言 | 2026-06-07 | 02-data-model-redesign/phase-04 | draft | [2026-06-07-pr-47.md](./2026-06-07-pr-47.md) |
| #50 | plan README 群の薄索引化・テンプレ正本一本化 | 2026-06-09 | 00-harness-setup（横断） | draft | [2026-06-09-pr-50.md](./2026-06-09-pr-50.md) |
| #52 | 02 Phase 5 per-regulation 技記録 species-keyed 化 + mega 配列化 | 2026-06-09 | 02-data-model-redesign/phase-05 | draft | [2026-06-09-pr-52.md](./2026-06-09-pr-52.md) |
| #54 | 02 Phase 6 generate 変換専任化 + check:regulation 新設 | 2026-06-09 | 02-data-model-redesign/phase-06 | draft | [2026-06-09-pr-54.md](./2026-06-09-pr-54.md) |
| #55 | 02 Phase 7 M-A 現ロスター26種 持ち物・技 正確化 | 2026-06-10 | 02-data-model-redesign/phase-07 | draft | [2026-06-10-pr-55.md](./2026-06-10-pr-55.md) |
| #58 | 02 Phase 8 survey-regulation を Serebii 第一優先・全量 materialize へ拡張 | 2026-06-10 | 02-data-model-redesign/phase-08 | draft | [2026-06-10-pr-58.md](./2026-06-10-pr-58.md) |
| #59 | 02 Phase 9 3種小データセット全 movepool + M-A 持ち物全件 投入 | 2026-06-10 | 02-data-model-redesign/phase-09 | draft | [2026-06-10-pr-59.md](./2026-06-10-pr-59.md) |
| #62 | メガ先 moves を base の per-reg moves 継承へ（ADR 0024・#59 follow-up） | 2026-06-10 | 02-data-model-redesign（follow-up） | draft | [2026-06-10-pr-62.md](./2026-06-10-pr-62.md) |
| #67 | 02 Phase 11 ADR の可変 plan 参照除去 + adr.md codify | 2026-06-10 | 02-data-model-redesign/phase-11 | draft | [2026-06-10-pr-67.md](./2026-06-10-pr-67.md) |
| #69 | 02 Phase 10 名前/タイプ相性 SoT を catalog YAML へ・abilities/items id-only 化 | 2026-06-10 | 02-data-model-redesign/phase-10 | draft | [2026-06-10-pr-69.md](./2026-06-10-pr-69.md) |
| #70 | 02 PokeAPI 除外/構造データ catalog 化/data README フェーズ挿入 + renumber | 2026-06-12 | 02-data-model-redesign/phase-12〜15 | draft | [2026-06-12-pr-70.md](./2026-06-12-pr-70.md) |
| #72 | 02 Phase 12 PokeAPI を Champions legality/技威力の信頼源から除外（learnset 撤去・技メタ SoT 移設・ADR 0026） | 2026-06-13 | 02-data-model-redesign/phase-12 | draft | [2026-06-13-pr-72.md](./2026-06-13-pr-72.md) |
| #73 | 02 Phase 13 構造データ SoT を catalog へ・materialize 新設・generate raw 非依存・overrides 廃止（ADR 0027） | 2026-06-13 | 02-data-model-redesign/phase-13 | draft | [2026-06-13-pr-73.md](./2026-06-13-pr-73.md) |
| #74 | 02 Phase 14 data/ ディレクトリ索引 README をポインタ式で追加 | 2026-06-13 | 02-data-model-redesign/phase-14 | draft | [2026-06-13-pr-74.md](./2026-06-13-pr-74.md) |
| #76 | 02 Phase 15 挿入 + M-A 全量 Phase 16 へ renumber（計画化・plans-new） | 2026-06-13 | 02-data-model-redesign | draft | [2026-06-13-pr-76.md](./2026-06-13-pr-76.md) |
| #77 | 02 Phase 15 data/ 全 YAML ブロックスタイル強制ゲート新設（AST 検出 + check コマンド + materialize block 化・ADR 0028） | 2026-06-13 | 02-data-model-redesign/phase-15 | draft | [2026-06-13-pr-77.md](./2026-06-13-pr-77.md) |
| #80 | 02 に phase-16〜19（data 著述方針の明確化）を挿入し M-A 投入を Phase 20 へ renumber（計画 scaffolding・plans-new） | 2026-06-13 | 02-data-model-redesign | draft | [2026-06-13-pr-80.md](./2026-06-13-pr-80.md) |
| #82 | 02 Phase 16 ADR 整備例外に用語 rename を追加・hygiene→整備（ADR 0029） | 2026-06-13 | 02-data-model-redesign/phase-16 | draft | [2026-06-13-pr-82.md](./2026-06-13-pr-82.md) |
| #84 | 02 Phase 17 data/champions 運用方針 + 統一用語 skill-authored 確定（ADR 0030） | 2026-06-13 | 02-data-model-redesign/phase-17 | draft | [2026-06-13-pr-84.md](./2026-06-13-pr-84.md) |
| #85 | 02 Phase 18 skill-authored 統一用語 + 人間直編集 NG を全資産展開（30 files・ADR 本文 rename） | 2026-06-13 | 02-data-model-redesign/phase-18 | draft | [2026-06-13-pr-85.md](./2026-06-13-pr-85.md) |
| #86 | 02 Phase 19 情報源 3 系統の役割 SoT 集約 + フロー図 Mermaid 化 | 2026-06-13 | 02-data-model-redesign/phase-19 | draft | [2026-06-13-pr-86.md](./2026-06-13-pr-86.md) |
| #90 | 03 計画群 survey-regulation 刷新を plans-new で起票 + phase-20 を 03 phase-07 へ計画群間移動 | 2026-06-13 | 03-survey-regulation-rework | draft | [2026-06-13-pr-90.md](./2026-06-13-pr-90.md) |
| #92 | 03 Phase 1 Serebii 決定論パーサ純関数 + fixture テスト | 2026-06-13 | 03-survey-regulation-rework/phase-01 | draft | [2026-06-13-pr-92.md](./2026-06-13-pr-92.md) |
| #94 | 03 Phase 2 Serebii items パーサ + fetch-serebii キャッシュ層 | 2026-06-14 | 03-survey-regulation-rework/phase-02 | draft | [2026-06-14-pr-94.md](./2026-06-14-pr-94.md) |
| #96 | 03 Phase 3 serebii-to-catalog 転記 + ja 補完（PokeAPI names）+ パイプライン結合 + ADR 0031/0032 | 2026-06-14 | 03-survey-regulation-rework/phase-03 | draft | [2026-06-14-pr-96.md](./2026-06-14-pr-96.md) |
| #98 | 03 Phase 4 Haiku 取得 SubAgent + Workflow fan-out（層2・`.workflow` ゲート除外・read-only Explore） | 2026-06-14 | 03-survey-regulation-rework/phase-04 | draft | [2026-06-14-pr-98.md](./2026-06-14-pr-98.md) |
| #100 | 03 Phase 5 修正 SubAgent + 自己修復ループ（層3・K回上限+dedup+進捗ゼロ停止・write/read-only 権限分離・workflow() ネスト再利用） | 2026-06-14 | 03-survey-regulation-rework/phase-05 | draft | [2026-06-14-pr-100.md](./2026-06-14-pr-100.md) |
| #102 | 03 Phase 6 survey-regulation SKILL 全面改訂（決定論スクレイパー + 自己修復・allowed-tools 整理・cross-agent フォールバック・26 種 end-to-end 実証） | 2026-06-14 | 03-survey-regulation-rework/phase-06 | draft | [2026-06-14-pr-102.md](./2026-06-14-pr-102.md) |
| #104 | plan 03 へ 3 phase 挿入（per-reg 持ち物 legality / per-reg species name 削除 / メガ決定論取り込み）+ M-A 投入を Phase 10 へ renumber・cross-plan 追従 | 2026-06-14 | 03-survey-regulation-rework | draft | [2026-06-14-pr-104.md](./2026-06-14-pr-104.md) |
| #114 | per-reg 持ち物 legality + メガストーン保持ルールの型強制（HoldableItems の "any" を per-reg プールへ・MegaStoneOf/megaSpecies・dual-reg 3 個体を M-A 単独へ） | 2026-06-14 | 03-survey-regulation-rework/phase-07 | draft | [2026-06-14-pr-114.md](./2026-06-14-pr-114.md) |
| #116 | per-reg species から不要な種族名 ja/en を削除（PerRegSpecies = Omit<SpeciesBase,"name">・種族名 SoT を speciesBaseDex へ一本化・純減 136 行） | 2026-06-14 | 03-survey-regulation-rework/phase-08 | draft | [2026-06-14-pr-116.md](./2026-06-14-pr-116.md) |
| #117 | メガ関連データの決定論自動著述（megaSpeciesId 純関数・megaLinks/メガ先/per-reg mega[]/megaSpecies・ADR 0031 を 0033 で supersede し archive 退避・SKILL/rule 追従） | 2026-06-14 | 03-survey-regulation-rework/phase-09 | draft | [2026-06-14-pr-117.md](./2026-06-14-pr-117.md) |

<!--
追記フォーマット例（ファイル列は [表示名](./YYYY-MM-DD-pr-N.md) のリンク形式）:
| #42 | 個体値型チェック導入 | 2026-07-01 | 01-mvp/phase-02 | draft | 2026-07-01-pr-42.md |
status: draft | reviewed | actioned
-->
