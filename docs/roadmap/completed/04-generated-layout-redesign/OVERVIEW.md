# 04-generated-layout-redesign — generated / YAML ディレクトリ構成の再編（specs / languages / per-reg 分割）OVERVIEW

## ゴール

`data/generated/`（生成 TS）と `data/champions/`（ソース YAML）のディレクトリ構成を、**「構造（言語非依存の specs）」「名前（ゲーム非依存の languages）」「レギュ解禁（per-reg）」の 3 軸で直交**させた形へ再編する（Phase 1-3）。さらに**配置の最終化**として、生成物を `src/generated/` へ移し（Phase 4）、レギュ名を languages へ移して名前 SoT を例外なく一本化し（Phase 5）、メガ可能種の `items` を対応メガストーンのみに型制約する（Phase 6）。これにより、将来の多言語・多ゲーム・新レギュ追加を局所変更で行える保守しやすい土台を作る。**M-A 全186種の全量投入は後続計画群 [`XX-ma-full-data`](../../XX-ma-full-data/README.md) へ分離**し、本計画群はレイアウト再編に責務を純化する。依存は **03-survey-regulation-rework（取得パイプライン刷新）→ 04（レイアウト再編）→ 05-move-master-scraper-refactor（技マスター取得 + 役割分割）→ XX（全種族投入）の一方通行**。

## 背景 / 動機

現状 `data/generated/` はエンティティ別フラット（`moves.ts` / `abilities.ts` / `items.ts` / `species-base.ts` / `types.ts` / `names.ts`）＋ `regulations/<id>/{index,species}.ts` ＋ `regulations/champions/moves.ts`（技メタ）で、名前（ja/en）は species/moves/types の dex に埋め込み・abilities/items は catalog YAML が名前 SoT・逆引きは `names.ts`、という ADR 0025/0027/0032/0034 の積み上げで成り立っている。構造・名前・レギュ解禁が同じファイルに混在し、per-reg も `index`/`species` の 2 ファイルに集約されていて、多言語化・多ゲーム化・新レギュ追加時の変更範囲が読みにくい。

**全種族投入（全186種・後続 [`XX-ma-full-data`](../../XX-ma-full-data/README.md)）の手前**でこのレイアウトを確定させておくことで、186 種を投入してから組み替える事故を避ける（既存の「全量投入の手前で仕組みを確定」de-risk と同型）。本計画群はレイアウト再編に専念し、全量投入は後続 05（技マスター取得 + 役割分割）を経た上で 06 で行う。

## 設計方針

確定済みの設計判断（ユーザ承認済み・plan-mode で合意）:

1. **YAML 参照機構 = ディレクトリ同型＋generate 合成**。`$ref` リテラルは使わず、`generate.ts` が複数ファイルを読んで結合する（外部依存ゼロ・[[tsc-verification]] の「検証は tsc のみ」を崩さない）。
2. **メガ = 独立 spec エンティティ**（`mega-specs`）。base 種族から構造データを分離する。
3. **タイプ相性表（damageTo）= `champions/type-specs.ts`**（名前は `languages/types.ts`）。
4. **破壊的変更 OK**。14 consumer ＋ 公開 API（`src/index.ts`）を一括更新し、恒久 compat shim は持たない。

守る制約（既存 rule / ADR の本質は不変・所在のみ組み替え）:
- 検証は **tsc のみ**（ADR 0010）。`as const satisfies XxxBase` ＋ `XxxDex=typeof` ＋ `XxxId=keyof` の派生パターンを踏襲（[[type-conventions]]）。
- ソースは **skill-authored・catalog/raw 非依存の generate**（ADR 0027 / 0030・[[data-pipeline]]）。`materialize` の append/既存尊重も不変。
- 技の出自 Serebii 第一優先・PokeAPI を Champions legality/技メタの信頼源にしない（ADR 0026/0034）も不変。
- **per-reg 種族 dex による reg-aware 型機構**（`ValidMove<R,S,M>` / ブランドエラー・ADR 0021/0024）を**壊さない**（最重要・後述）。

> ⚠️ 本再編は名前 SoT の**所在**を catalog/dex から `languages/` へ移すため、ADR 0025/0032/0034 を **supersede/追補する新 ADR**が必要。決定の本質（catalog/skill-authored が SoT・raw 非依存・per-reg 一本化）は保ち、所在の移動だけを記録する。

## 実装指針

### 目標ディレクトリ（生成物 `data/generated/`）

```
champions/
  species-specs.ts   # id→{ dex, types, baseStats, abilities, megaEvolvesTo? }   ※base種族のみ・name無し
  mega-specs.ts      # id→{ dex, types, baseStats, ability, baseSpecies }         ※メガ形態のみ・name無し
  item-specs.ts      # id→{ category, megaStoneFor?, megaSpecies? }                ※name無し
  ability-specs.ts   # id→{ id }
  move-specs.ts      # id→{ type, damageClass, power, accuracy, pp, priority }     ※現 moveStatsDex 相当
  type-specs.ts      # id→{ damageTo }
  index.ts           # regulationDex（m-a/m-b 集約）+ RegulationId
  m-a/{ index, species, items, mega, species-moves }.ts
  m-b/ … 同型
languages/
  index.ts           # species/mega/items/moves/abilities/types の name マップ集約
  species.ts … types.ts   # 各 id→{ id, name:{ ja, en } }（ブロック）
```

- `m-a/index.ts` が `species-specs`＋`mega-specs`＋`species-moves`＋per-reg `mega` を結合し、現 `PerRegSpecies`（moves/abilities/items/megaEvolvesTo）相当の `speciesDex` を合成して `RegulationBase` を満たす（**reg-aware 型機構の保全のため必須**）。
- RegulationId は `champions-m-a` のまま不変（dir は `champions/m-a/` だが id は `<game>-<reg>` を維持）。
- 逆引き（ja→id）は languages の forward `{id,name}` から実行時導出（`load-party`/`normalize`）。

### 目標ディレクトリ（ソース YAML）

`data/champions/`（↔ generated/champions/・ゲーム別）に `*-specs.yaml` ＋ `m-a/{index,species,items,mega,species-moves}.yaml` ＋ `rules.yaml`(据え置き)。名前はゲーム非依存なので `data/languages/`（↔ generated/languages/・ゲーム軸の外で共有）に `{species,mega,items,moves,abilities,types}.yaml`（各 id→{ja,en}）。レギュ名 `name:{ja,en}` は `m-a/index.yaml` に period と同居（languages 列挙の例外）。全 YAML は block スタイル維持。

### 主要改修

- `scripts/generate.ts`（emit 全面）/ `materialize.ts`（構造→specs・ja→languages）/ `fetch-pokeapi.ts`（列挙元）/ `src/codegen/serebii/to-catalog.ts`（書き出し先）。
- `src/types/**`（specs/languages 型・`SpeciesBaseInfo` から name 除去・新 `MegaSpec`・`NameEntry`・reg-aware 機構保全）。
- 14 consumer（名前参照を languages へ・逆引き導出・import パス）＋公開 `src/index.ts`。
- `check:regulation`/`check:yaml-style` の走査パス拡張。

## スコープ外

- **M-A 全186種の全量投入** = 後続計画群 [`XX-ma-full-data`](../../XX-ma-full-data/README.md)。本計画群はレイアウト再編（Phase 1-3）に専念し、全量投入はしない。
- **技仕様の Champions 対応**（技マスターの値を Champions 準拠へ是正）= 後続計画群 [`05-move-master-scraper-refactor`](../05-move-master-scraper-refactor/README.md) の技マスター専用取得経路が担う（旧 03 Phase 13 の手動是正は 05 へ吸収して廃止）。本計画はレイアウト再編に専念し、**技メタの値の正誤是正はしない**（現行値を新ツリーへ移行するのみ・是正は 05 で実施）。
- 取得パイプライン刷新（決定論スクレイパー / 自己修復）そのもの（03 Phase 1-12 で完了済み）。
- 新機能・01-mvp の機能拡張。技の効果テキスト（effect %）のスキーマ化。

## 受け入れ基準

1. 各フェーズ末で `pnpm verify`（型 / カバレッジ100% / Biome / `check:yaml-style`）が緑。
2. `pnpm generate:data` が新 YAML ツリー（`data/champions/*-specs.yaml` + `m-*/` + `data/languages/*`）から新 generated ツリー（`champions/*-specs.ts` + `champions/m-*/` + `languages/*`）を決定論的に出力する（raw 非依存）。
3. **reg-aware 型機構の保全**: 既存個体 YAML（`team/individuals/*.yaml`）が引き続き解禁判定で正しく弾く/通る。意図的に覚えない技を混ぜると tsc がブランドエラー（`MoveNotLearnedBy<R,S,M>` 等）を出す。
4. `check:regulation data/champions` が 0 終了（参照整合 / schema）。`node src/cli/index.ts check:party <party.md>` が end-to-end で解禁判定（exit0/1）。
5. 名前 SoT 所在移動・メガ独立エンティティの ADR が起票され、ADR 0025/0032/0034 の status / 参照が追従される。
6. ハーネス資産（rules/skills/architecture/docs）が新レイアウトへ追従し、cross-agent パリティが保たれる。
7. **全種族投入（後続 XX）の前提が整う**: レイアウト再編が完了し、後続 [05-move-master-scraper-refactor](../05-move-master-scraper-refactor/README.md)（技マスター取得 + 役割分割）→ [XX-ma-full-data](../../XX-ma-full-data/README.md)（全量投入）へ繋げられる状態になる。
8. **配置最終化（Phase 4-6）**: (a) 生成物が `src/generated/` に移り `data/` がソース YAML 専用になる・`src/generated/**` がカバレッジ / Biome 除外で verify 緑。(b) レギュ名が `data/languages/regulations.yaml` に移り `m-*/index.yaml` に `name` が無く、名前 SoT が例外なく languages に一本化される。(c) メガ可能種の `items` が対応メガストーンのタプルになり、個体で他持ち物を持つと `ItemNotHeldBy` ブランドエラーが出る（reg-aware 機構の回帰なし）。各 phase 末で値不変・`pnpm verify` 緑。

## phase 分割（6 基準の評価サマリ）

承認済みプラン（plan-mode・`~/.claude/plans/generated-reglurations-...md`）を、独立判断（ADR）・密結合のコア実装・ハーネス追従の境界で **3 phase = 3 PR**（Phase 1-3）に分割した（当初含めていた全種族投入は後続計画群 [`XX-ma-full-data`](../../XX-ma-full-data/README.md) へ分離）。さらに**配置最終化の追加再編 3 件**（生成物を `src/generated/` へ / レギュ名を languages へ / メガ items legality を型化）を、いずれも独立判断・別レイヤ・独立にマージ可能なため **Phase 4-6（各 1 PR）** として末尾に追加した（計 6 phase = 6 PR）。6 基準:

- **意思決定の数 / 不可逆性**: 名前 SoT 所在移動（ADR 0025/0032/0034 追補）・メガ独立エンティティ化・ディレクトリ規約は ADR 級の独立判断 → **Phase 1 で ADR 起票**（コードなし・設計確定）。
- **スコープの広さ / 技術的難易度**: codegen 全面改修・型レイヤ（reg-aware 機構保全が難所）・14 consumer・パイプライン script を横断。これらは生成 TS を型が consume する**密結合で、verify 緑を満たすには 1 PR にまとめる必要**がある（中途半端な赤コミットを残さない）→ **Phase 2**。
- **想定 diff**: Phase 2 は YAML 移行 + codegen + 型 + consumer で大きめ（>1000 行になりうる）。型と生成物が相互依存し意味ある分割が困難なため **1 PR を許容**（[[planning]] の例外・本 OVERVIEW に根拠記載）。ソース/生成物差分と型/consumer 差分を分けて説明する。
- **並行実装のしやすさ**: Phase 1（ADR）→ 2（実装）→ 3（ハーネス追従）の直列。

| phase | 狙い | 主な diff |
|---|---|---|
| Phase 1 | ADR 起票（ディレクトリ再編 + 名前 SoT を languages へ / メガ独立 spec エンティティ） | `docs/adr/*`・rule 追補方針 |
| Phase 2 | コア実装（YAML 新ツリー移行 + `generate.ts` 全面改修 + `materialize`/`fetch`/`serebii-to-catalog` 追従 + 型レイヤ + 14 consumer + 公開API + テスト fixture） | `scripts/*`・`src/types/*`・`src/codegen/*`・`src/{io,cli}/*`・`data/**` |
| Phase 3 | ハーネス追従（rules / skills / architecture / docs・cross-agent パリティ・パス参照一掃） | `.claude/rules/*`・`.claude/skills/*`・`docs/*` |
| Phase 4 | 生成物を `data/generated/` → `src/generated/` へ移動（emit ルート + consumer パス + ツール glob 除外・旧パス一掃） | `scripts/generate.ts`・`src/**`・`tsconfig.json`/`biome.json`/`vitest.config.ts`/`package.json`・`.gitignore` |
| Phase 5 | レギュ名 `name:{ja,en}` を `data/languages/` へ移し名前 SoT を一本化（例外解消） | `data/languages/regulations.yaml`・`data/champions/m-*/index.yaml`・`scripts/generate.ts`・`src/types/regulation.ts` |
| Phase 6 | メガ可能種の `items` を対応メガストーンのみに型制約（`ItemNotHeldBy` で他持ち物をブランド） | `scripts/generate.ts`（per-reg species emit）・テスト fixture |

直列チェーン: Phase 1 → 2 → 3 →（配置最終化）4 → 5 → 6。Phase 1-3 で 3 軸直交レイアウトを確立し、**Phase 4-6 は別テーマの配置最終化**（生成物を `src/generated/` へ・レギュ名を languages へ・メガ items legality を型化）として末尾に追加した（いずれも独立判断・独立にマージ可能・1 phase = 1 PR）。先行する [03-survey-regulation-rework](../03-survey-regulation-rework/README.md)（取得刷新・Phase 1-12）を完了してから本計画群に入る。本計画群（04）完了後、後続 [05-move-master-scraper-refactor](../05-move-master-scraper-refactor/README.md)（技マスター取得 + 役割分割）→ [XX-ma-full-data](../../XX-ma-full-data/README.md)（全種族投入）へ**一方通行（03 → 04 → 05 → XX）**で繋ぐ。全種族投入は再編後レイアウトと、05 で是正済みの技メタ値の上で 06 で実施する。
