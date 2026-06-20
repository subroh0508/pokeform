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
| #118 | plan 03 へ 3 phase 挿入（ゲームグルーピング / per-game 技メタ / 取得スキル 2 分割）+ 全投入を Phase 13 へ renumber・cross-plan/intra-doc forward 参照追従（#104 同型反復） | 2026-06-14 | 03-survey-regulation-rework | draft | [2026-06-14-pr-118.md](./2026-06-14-pr-118.md) |
| #120 | regulations をゲームでグルーピング（`<game>/<reg>.yaml`）・生成 id `<game>-<reg>` を不変に保ち RegulationId/個体値/import を非破壊・harness-review nit で architecture.md 旧パスを同 PR 同期 | 2026-06-14 | 03-survey-regulation-rework/phase-10 | draft | [2026-06-14-pr-120.md](./2026-06-14-pr-120.md) |
| #122 | 技メタを per-game へ移転（`catalog/moves.yaml` → `regulations/champions/moves.yaml`・`MoveBase`/`MoveStats` 分離・219 技等価移設）・ADR 0026 を 0034 へ supersede し archive 退避 | 2026-06-14 | 03-survey-regulation-rework/phase-11 | draft | [2026-06-14-pr-122.md](./2026-06-14-pr-122.md) |
| #123 | 取得スキルを 2 分割（`update-catalog` 新設で PokeAPI 構造データ + 名前の catalog 取り込みを分離 / survey-regulation を Champions 取得へ refocus + catalog 更新チェックポイント追加）・harness-review blocking 0 nit 1 でクリーン通過・ADR 不要（境界 0027/0034 確立済） | 2026-06-14 | 03-survey-regulation-rework/phase-12 | draft | [2026-06-14-pr-123.md](./2026-06-14-pr-123.md) |
| #125 | plan 群再構成（技マスター専用取得 + スクレイパー役割分割を `05` 新設・M-A 全種族投入を `06` 独立・`04` をレイアウト再編へ純化・`03` Phase 13 を 05 へ吸収）・依存を 03→04→05→06 の一方通行へ整理・cross-plan dangling 一掃 | 2026-06-20 | 04/05/06 (plan 再構成) | draft | [2026-06-20-pr-125.md](./2026-06-20-pr-125.md) |
| #126 | dep-update #89（biome 2.4.16→2.5.0）の biome.json 追従漏れ是正（`biome migrate` で `$schema` を 2.5.0・非推奨 `recommended` を `preset:"recommended"` へ）・biome check の info を 2→0 | 2026-06-20 | — | draft | [2026-06-20-pr-126.md](./2026-06-20-pr-126.md) |
| #128 | plan 04 Phase 1: ADR 0035（generated/YAML を specs/languages/per-reg の 3 軸へ再編・名前 SoT を languages へ）/ 0036（メガ独立 spec エンティティ）起票・ADR 0025/0032/0034 を supersede し archive 退避＋inbound 全件追従 | 2026-06-20 | 04-generated-layout-redesign/phase-01 | draft | [2026-06-20-pr-128.md](./2026-06-20-pr-128.md) |
| #133 | plan 04 Phase 2: generated/YAML を 3 軸直交レイアウトへコア実装移行（codegen 全面改修・型・14 consumer・メガ独立 spec）・reg-aware 型機構を無回帰で維持・値不変・生成 raw 非依存。tsc 先行実験で spread 合成の narrow 温存を de-risk | 2026-06-20 | 04-generated-layout-redesign/phase-02 | draft | [2026-06-20-pr-133.md](./2026-06-20-pr-133.md) |
| #135 | plan 04 Phase 3: 新レイアウト（specs/languages/per-reg・メガ独立 spec）へ rule 3 + skill 4 + architecture/data README/AGENTS + 計画 README を追従し旧パス一掃。MVP 設計 doc は supersede redirect 注記で現行 SoT へ誘導。harness-review blocking 0（reverseEn 架空シンボルを fix） | 2026-06-20 | 04-generated-layout-redesign/phase-03 | draft | [2026-06-20-pr-135.md](./2026-06-20-pr-135.md) |
| #137 | plan 04 へ配置最終化 3 件を新 Phase 4-6（src/generated 移動 / レギュ名 SoT を languages へ / メガ items legality）として 1 phase = 1 PR で追加・OVERVIEW/README/mermaid/rollup 追従・先行 plan 03 を ✅ 完了化。harness-review blocking 0（新旧 Phase 4 番号 2 義 + 05/06 依存粒度ズレを non-blocking/nit） | 2026-06-20 | 04-generated-layout-redesign | draft | [2026-06-20-pr-137.md](./2026-06-20-pr-137.md) |
| #139 | plan 04 Phase 4: 生成物配置を data/generated → src/generated へ移動（git mv 中心 62 files・値不変）・ツール glob を三分割（vitest coverage / biome lint 除外 + tsconfig 型検査継続でブランド機構保持）・生成物コミット継続（ADR 0012）。実装中 API 障害で worker idle 化し orchestrator が commit→PR→review→merge 代行。code-review blocking 0 nit 1（biome formatter 非除外） | 2026-06-20 | 04-generated-layout-redesign/phase-04 | draft | [2026-06-20-pr-139.md](./2026-06-20-pr-139.md) |
| #141 | plan 04 Phase 5: レギュ名 name:{ja,en} を m-*/index.yaml → 新 data/languages/regulations.yaml へ移し名前 SoT を例外なく languages へ一本化（値不変・所在移動のみ）。langFiles 再利用 + per-reg index で regulationNames[id].name 合成 + reg id 突き合わせゲート。RESERVED_REGULATION_KEYS から name 除去で fixture 追従要。code-review/harness-review とも blocking 0（rule doc-data 乖離 nit を同 PR で追従） | 2026-06-20 | 04-generated-layout-redesign/phase-05 | draft | [2026-06-20-pr-141.md](./2026-06-20-pr-141.md) |
| #145 | plan 04 Phase 6: メガ可能種の items を "any" → 対応メガストーン id タプルで emit（item-specs の megaSpecies リンクから per-reg 決定論導出・X/Y 全要素・欠落/プール外は fail-fast）。型資産（HoldableItems/ItemNotHoldableBy/PerRegSpecies.items）は不変で emit 値のみ変更。回帰を正負両方（charizard×stone 通過 / life-orb で ItemNotHoldableBy）+ 連続再生成一致で確認。team 個体/fixture/rule doc を新モデルへ追従。code-review/data/harness とも blocking 0。plan 04 計画群が完了 | 2026-06-20 | 04-generated-layout-redesign/phase-06 | draft | [2026-06-20-pr-145.md](./2026-06-20-pr-145.md) |

<!--
追記フォーマット例（ファイル列は [表示名](./YYYY-MM-DD-pr-N.md) のリンク形式）:
| #42 | 個体値型チェック導入 | 2026-07-01 | 01-mvp/phase-02 | draft | 2026-07-01-pr-42.md |
status: draft | reviewed | actioned
-->
