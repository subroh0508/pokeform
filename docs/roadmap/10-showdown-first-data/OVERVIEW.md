# 10-showdown-first-data — データ取得を pokemon-showdown 第一の正へ刷新（Serebii 速報 / PokeAPI ja 専任）OVERVIEW

## ゴール

レギュレーション別データ（解禁種族 / 技 / 持ち物 / メガ / 構造データ / 名前）の取得を、**pokemon-showdown を第一の正（authoritative）** とする方式へ刷新する。GitHub Actions 上で `smogon/pokemon-showdown` を clone → build → 抽出し **YAML 更新 PR を自動作成**、その正確性を **Serebii 照合スキル**で確認する。あわせて **Serebii を速報（provisional）経路**として GitHub Actions でスクレイピングし、公式更新を早く取り込む速報 PR を立てる。利用者から見た価値は、解禁データの取得が無人で再現性高く回り、最新レギュへの追従が速く・正確になること。

## 背景 / 動機

現状はデータ取得が **Serebii 第一優先**（解禁・技・メガ・技メタ）+ **PokeAPI**（構造データ + 日本語名 ja）の 2 系統で、取得は**ローカル / Claude Workflow** に依存していた。CI は `pnpm verify` のみで外部取得をしない。これを次の理由で根本転換する:

- pokemon-showdown は対戦シミュレーターの mod（`champions` / `championsregma`）として **解禁・構造・技メタ・メガ・持ち物を一括かつ機械可読**に保持し、`calculatePP` 等の Champions 固有仕様まで内包する（プロトタイプ `champions-data.ts` で抽出実証済み）。これを正にすれば取得の網羅性・一貫性・自動化適性が上がる。
- Serebii は公式更新の反映が早く**速報**に向き、日本語名（種族/メガ=カタカナ・特性/持ち物=ひらがな）も持つため、速報経路 + 照合の裏取りに最適。
- pokemon-showdown も Serebii も**日本語名以外は英語ベース**で、showdown は ja を持たない。ja の正は **PokeAPI `names`(ja-Hrkt)** に縮小して残す。

設計判断の確定経緯と詳細は計画化時の検討メモ（OVERVIEW 本節 + 各 phase doc）に集約する。

## 設計方針

- **権威序列 = showdown(正) > Serebii(速報) > PokeAPI(ja 補完)**。食い違いは showdown が追いついたら上書き。
- **SoT レイアウトと検証機構は不変**（本刷新の安全弁）。3 軸直交（構造 `*-specs.yaml` / 名前 `languages/*.yaml` / 解禁 `<reg>/*.yaml`）・`generate.ts` の raw 非依存合成・tsc-only 検証・カバレッジ 100%・YAML block style ゲートは維持し、**入力 SoT を埋める取得元のみ差し替える**。規約は [[data-pipeline]]。
- **取得は GitHub Actions（`workflow_dispatch` 手動のみ・cron なし）** へ移管。showdown checkout は `ref: master` + `fetch-depth: 1` で軽量化。
- **両ソースを同じ 5 データセット軸（species / moves / items / abilities / mega）で 1:1 対応**させ、抽出・転記スクリプトをデータセット別に分割する（`champions-data.ts` のモノリスを解体・保守性確保）。曖昧な `catalog` 命名は廃し、データセットが一目で分かる命名（`showdown:<dataset>` / `serebii:<dataset>`）にする。
- **アーキ決定は ADR に残す**（[[adr]]）。Phase 3 で ADR 0039（showdown 第一の正・PokeAPI ja 専任・構造取得廃止 / 0012・0027 を supersede）、Phase 4 で ADR 0040（Serebii 速報降格・既存スクレイパー全廃 / 0033・0037 を supersede）を起こす。
- **cross-agent パリティ**を保つ（[[cross-agent]] / [[skill-authoring]]）。survey-regulation 廃止に伴う symlink 除去、verify-showdown-pr 新設の symlink 整合を点検する。

## 実装指針

- **抽出層** `scripts/showdown/`（showdown ツリーで動く・`../sim/dex` 依存ゆえ pokeform tsc から `exclude`）: 共通 dex アクセス + データセット別抽出。CI で `pokemon-showdown/tools/` へ copy し `node build` 後に実行。
- **転記層** `src/codegen/showdown/*-fields.ts`（純関数 + コロケーション test・カバレッジ 100%）+ `scripts/sync-showdown.ts`（薄い配線）。中間 JSON → SoT YAML を append / 上書き是正。
- **Serebii 速報** は既存スクレイパーを**全廃**し、指定ページ群（`pokemonchampions/pokemon.shtml` / `items.shtml` / `pokedex-champions/{id}` / `attackdex-champions/{id}.shtml` / `abilitydex/{id}.shtml` / `itemdex/{id}.shtml`）向けに `src/codegen/serebii/parse-*` を新規実装 + `scripts/scrape-serebii.ts`(新) / `scripts/sync-serebii.ts`。
- **PokeAPI は ja 専任**へ縮小（`fetch:ja-names` / `sync:ja-names`）。構造取得は廃止。
- **GitHub Actions**: `showdown-sync.yml`（正）/ `serebii-bulletin.yml`（速報）。両者末尾で `check:regulation` → `generate:data` → `pnpm verify` → `create-pull-request`。
- **照合スキル** `verify-showdown-pr`: WebFetch ではなく**新 Serebii スクレイパースクリプトを流用**して showdown PR の diff を Serebii と照合し、一致 exit 0 / 差異 exit 1 + PR コメント。survey-regulation はこのスキルへ置換し廃止、update-catalog は ja 専任へ縮小。

## スコープ外

- **SoT スキーマ・`generate.ts`・型・検証ゲートの再設計**（取得元非依存ゆえ不変）。
- **M-C 以降の新レギュレーション**・01-mvp の機能拡張・新ドメイン機能。
- **GitHub Actions の cron 定期実行**（手動 dispatch のみ・将来必要なら別計画）。
- タイプ相性 `type-specs.yaml` の showdown 化（`typechart.ts` 由来・任意拡張・本計画では skill-authored 維持）。

## 受け入れ基準

1. 各フェーズ末で `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
2. Phase 1 完了時: showdown 抽出 + 転記で M-A/M-B を再生成し、既存 `data/champions/<reg>/*` と `src/generated/` に対し**取得元変更の意図差分以外が出ない**（等価検証）。
3. PokeAPI が ja 専任に縮小され、構造取得コードが除去される（Phase 2）。
4. `showdown-sync.yml` / `serebii-bulletin.yml` を `workflow_dispatch` で手動実行すると PR が立ち CI（`pnpm verify`）が緑（Phase 3 / 4）。
5. 旧 Serebii スクレイパー・survey-regulation skill が削除され、`verify-showdown-pr` skill と新 Serebii スクレイパーへ置換される（Phase 4 / 5）。
6. 取得元・第一優先・vendor 方式の変更が ADR 0039 / 0040 に記録され、被 supersede ADR が archive へ退避し inbound 参照が追従される。
7. Phase 6 完了時: M-A・M-B の**全解禁情報（全種・全技・全持ち物・全メガ）**が showdown 経路で投入され、`verify-showdown-pr` の Serebii 照合と `pokemon-data-reviewer` レビューで重大な不整合が無い。

## phase 分割（6 基準の評価サマリ）

取得元の根本転換は**不可逆な決定（取得元・第一優先・vendor 方式・SoT の埋め方）が複数**あり、**複数レイヤ（scripts / codegen / CI / skill / rule / ADR / plan doc）を横断**するため段階分割する。各 phase は単独でマージしても壊れず意味的に完結する（[[planning]] 6 基準）。

| phase | 狙い | 主な diff |
|---|---|---|
| Phase 1 | showdown 抽出 + 転記 + 等価検証（PokeAPI/Serebii はまだ温存） | 新 scripts/codegen（中〜大） |
| Phase 2 | PokeAPI を ja 専任へ縮小・構造取得廃止 + update-catalog 改訂 | scripts/codegen 改修（中） |
| Phase 3 | `showdown-sync.yml` + ADR 0039（0012/0027 supersede） | CI + ADR（中） |
| Phase 4 | Serebii 完全廃止 + 新スクレイパー + `serebii-bulletin.yml` + ADR 0040（0033/0037 supersede） | 削除 + 新規 + CI + ADR（大） |
| Phase 5 | `verify-showdown-pr` skill + `.claude/rules/*` 5 ファイル + docs / AGENTS 改訂 | skill + rule + docs（中） |
| Phase 6 | M-A・M-B 全データセット本投入（**plan 09 Phase 4 の cross-plan move を含む**） | data 投入 PR（>1000 行・例外 1 PR） |

直列チェーン: Phase 1 → 2 → 3 → 4 → 5 → 6 の一方通行。Phase 6 は全パイプライン（正 + 速報 + 照合スキル）が揃ってから全量投入する。**Phase 6 は plan 09 の最終 Phase 4（全データセット本投入）を本計画群へ移植して新パイプライン版に改訂したもの**（[[planning]] cross-plan move チェックリストに従い移動・参照追従する）。本投入は全種・全 movepool で >1000 行になるが、データセット追加で意味ある分割が困難なため 1 PR を許容する（[[planning]] 6 基準⑤ の例外）。
