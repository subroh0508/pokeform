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
- **SoT レイアウトと検証機構は原則不変**（本刷新の安全弁）。3 軸直交（構造 `*-specs.yaml` / 名前 `languages/*.yaml` / 解禁 `<reg>/*.yaml`）・`generate.ts` の raw 非依存合成・tsc-only 検証・カバレッジ 100%・YAML block style ゲートは維持し、**入力 SoT を埋める取得元のみ差し替える**。規約は [[data-pipeline]]。
  - **限定的な例外（Phase 6）**: `languages/*.yaml` を specs 連動から**全件名辞書（reg 非依存・未解禁含む）**へ転換するため、`generate.ts` の `requireNames` を bijection → **specs ⊆ languages**（orphan languages を許容）へ緩和する。緩和は orphan チェックのみで「各 spec に ja/en 完備」の保護は維持する。ADR 0035（name SoT）を refine する新 ADR で根拠を残す。
  - **`rules.yaml` / `type-specs.yaml` は自動化しない**: 能力ポイント定数・タイプ相性表は変更頻度が極小のため、いずれの skill/workflow も自動更新せず**静的コミットファイル**として維持する（`data/` 完全削除時のみ手作業復元・[[data-pipeline]]）。
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
- **照合スキル** `verify-showdown-pr`: WebFetch ではなく**新 Serebii スクレイパースクリプトを流用**して showdown PR の diff を Serebii と照合し、一致 exit 0 / 差異 exit 1 + PR コメント。survey-regulation はこのスキルへ置換し廃止。
- **データ著述の 2 skill 分割**（`data/` 完全削除からの復元を「reg 非依存の全件名辞書」と「reg 依存の解禁データ」に分離。`author-static-data` ↔ `author-regulation-data` の対）:
  - **全件名辞書 `author-static-data`**（`update-catalog` をリネーム・基盤 Phase 6 / 投入 Phase 7）: `languages/{species,items,moves,abilities,types}.yaml` を **PokeAPI 由来の全件**（未解禁含む全ポケモン・持ち物・技・特性・タイプ名）で満たす。成果物は **担当 YAML の作成 / データ更新 PR**。取得 + 整形 + 書き込み + PR 作成は **新 GitHub Actions workflow**（`pokeapi-names.yml`・`showdown-sync.yml` と同型）で実行し、PokeAPI 非存在は **PR への手作業追加 commit** で補う。以降は差分（未記録 id）だけ追加。`fetch-pokeapi.ts` 全件化 + en 取得、`generate.ts` superset 緩和、`languages/*.yaml` scaffold も担う。これで per-reg 取得の ja gap が原則消える。**基盤（workflow/src/rename/generate緩和/ADR = Phase 6・code/harness-review）と全件データ投入（Phase 7・pokemon-data-reviewer）を別 phase に分ける**。
  - **レギュレーション取得 `author-regulation-data`**（Phase 8・`author-static-data` と対の命名）: 指定 reg 1 つの解禁データ取得を**オーケストレーション**（前提ゲート → per-reg reset → `showdown-sync.yml` dispatch → `verify-showdown-pr` 照合 → per-reg 著述）。名前は全件辞書済みゆえ **ja gap 補完は新規 id の差分追加（`author-static-data` 委譲）に縮小**。取得実体は再実装せず既存経路へ委譲し、**`showdown-sync.yml` workflow は据え置き**（skill が dispatch する取得層）。
  - **名前の取得元分担**: `species/items/moves/abilities/types` 名は **PokeAPI 全件**（`author-static-data`）。**`languages/mega.yaml` は PokeAPI 対象外**で、**en = showdown**（`sync-showdown`・per-reg = Phase 8）/ **ja = 手作業**（scaffold のみ `author-static-data`）。`languages/regulations.yaml`（per-reg 名）は `author-regulation-data` が reg 取得時に著述。**`rules.yaml` / `type-specs.yaml`** はどの skill も触らない静的コミット（上記「設計方針」参照）。

## スコープ外

- **SoT スキーマ・型・検証ゲートの再設計**（取得元非依存ゆえ原則不変）。ただし `generate.ts` の `requireNames` は Phase 6 で languages 全件辞書化のため orphan チェックのみ緩和する（上記「設計方針」の限定例外・その他の検証機構・合成ロジックは不変）。
- **`rules.yaml` / `type-specs.yaml` の自動化**（変更頻度極小の静的コミット維持・skill/workflow で触らない）。
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
7. `update-catalog` が `author-static-data` へリネームされ、新 GitHub Actions workflow（`pokeapi-names.yml`）+ `fetch-pokeapi` 全件化 + `generate.ts` superset 緩和 + ADR 0035 refine の**基盤**が揃う。`generate.ts` が languages ⊋ specs（orphan 許容）でも 0 終了し、`fetch:ja-names` 再実行は未記録 id のみ差分追加する（Phase 6）。
8. `languages/{species,items,moves,abilities,types}.yaml` が PokeAPI 由来の全件（未解禁含む）で満たされ ja/en が揃う（PokeAPI 非存在は手作業 commit）。`src/generated/languages/*.ts` に全件が反映される（Phase 7・`pokemon-data-reviewer` レビュー）。
9. reg ごとの取得オーケストレーション（前提ゲート → reset → dispatch → 照合 → per-reg 著述）が `author-regulation-data` skill に定式化され、`showdown-sync.yml` workflow を据え置いたまま既存経路へ委譲する（Phase 8）。
10. Phase 9 完了時: M-A・M-B の**全解禁情報（全種・全技・全持ち物・全メガ）**が `author-regulation-data` skill 実行で投入され、`verify-showdown-pr` の Serebii 照合と `pokemon-data-reviewer` レビューで重大な不整合が無い。

## phase 分割（6 基準の評価サマリ）

取得元の根本転換は**不可逆な決定（取得元・第一優先・vendor 方式・SoT の埋め方）が複数**あり、**複数レイヤ（scripts / codegen / CI / skill / rule / ADR / plan doc）を横断**するため段階分割する。各 phase は単独でマージしても壊れず意味的に完結する（[[planning]] 6 基準）。

| phase | 狙い | 主な diff |
|---|---|---|
| Phase 1 | showdown 抽出 + 転記 + 等価検証（PokeAPI/Serebii はまだ温存） | 新 scripts/codegen（中〜大） |
| Phase 2 | PokeAPI を ja 専任へ縮小・構造取得廃止 + update-catalog 改訂 | scripts/codegen 改修（中） |
| Phase 3 | `showdown-sync.yml` + ADR 0039（0012/0027 supersede） | CI + ADR（中） |
| Phase 4 | Serebii 完全廃止 + 新スクレイパー + `serebii-bulletin.yml` + ADR 0040（0033/0037 supersede） | 削除 + 新規 + CI + ADR（大） |
| Phase 5 | `verify-showdown-pr` skill + `.claude/rules/*` 5 ファイル + docs / AGENTS 改訂 | skill + rule + docs（中） |
| Phase 6 | 全件名辞書の**基盤**（`author-static-data` リネーム + `pokeapi-names.yml` workflow + `fetch-pokeapi` 全件化 + `generate` superset 緩和 + ADR）（**本投入の手前へ挿入**） | workflow + src + skill + ADR（中） |
| Phase 7 | 全件名辞書の**初回データ投入**（`author-static-data` 実行・PokeAPI 全件 + 手作業 gap） | data 投入 PR（大・pokemon-data-reviewer） |
| Phase 8 | reg 取得オーケストレーション skill `author-regulation-data` 新設（`showdown-sync.yml` は据え置き） | skill + rule 追記（小） |
| Phase 9 | M-A・M-B 全データセット本投入（`author-regulation-data` 実行・**plan 09 Phase 4 の cross-plan move を含む**） | data 投入 PR（>1000 行・例外 1 PR） |

直列チェーン: Phase 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 の一方通行。Phase 9 は全パイプライン（正 + 速報 + 照合スキル + 全件名辞書 + reg 取得スキル）が揃ってから全量投入する。**Phase 6-8 は本投入の手前へ後から挿入した分割 phase**（`data/` 完全削除からの復元を「reg 非依存の全件名辞書（基盤 6 + 投入 7・`author-static-data`）」と「reg 依存の解禁取得（8・`author-regulation-data`）」に分離。基盤（src/workflow/skill/ADR）とデータ投入（Phase 7・9）を別 phase に割り、`code-review`/`harness-review` 対象と `pokemon-data-reviewer` 対象の PR を分ける方針。`rules.yaml`・`type-specs.yaml` はどの skill も触らない静的コミット。renumber の参照追従は [[planning]] の insert / renumber チェックリストに従う）。**Phase 9 は plan 09 の最終 Phase 4（全データセット本投入）を本計画群へ移植して新パイプライン版に改訂したもの**（[[planning]] cross-plan move チェックリストに従い移動・参照追従する）。本投入は全種・全 movepool で >1000 行になるが、データセット追加で意味ある分割が困難なため 1 PR を許容する（[[planning]] 6 基準⑤ の例外）。
