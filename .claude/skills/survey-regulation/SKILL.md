---
name: survey-regulation
description: >-
  ポケモンチャンピオンズの**レギュレーション解禁情報を、決定論スクレイパー（層1）+ Workflow 自己修復（層2-3・
  Claude 固有）で Serebii 第一優先に取得**し、各種族の**使用可能技を全件（curate せず全量）**・解禁持ち物を全件、
  出典付きで doc 化して、解禁エンティティ（種族 / 技 / 持ち物 / メガ）を `data/champions/catalog/*.yaml`
  （append-only）と `data/champions/regulations/<game>/<reg>.yaml`（例 `champions/m-a.yaml`・種族キー = 解禁・per-species `moves` 全量・block 記法）
  へ反映する手順 skill。HTML を LLM コンテキストに載せず exit code で判定し（トークン最小化）、取りこぼし種は
  自己修復 / 最終 WebFetch fallback で吸収する。技の出自は Serebii 第一優先へ一本化（PokeAPI は Champions 非対応で
  learnset 照合しない・ADR 0026）。「M-A の解禁データを集めて」「レギュレーション <id> の解禁種族・全技・持ち物を
  調べて投入して」「新レギュの解禁情報を取得して」「survey-regulation <id>」「M-B が公開されたので反映して」
  「レギュ情報を更新して」と言われたとき、または per-regulation データ（`02-data-model-redesign`）を新規投入 /
  更新 / レギュ更新時に routine 実行したいときに使う。生成 / 検証は `generate:data` / `check:regulation` /
  `verify` に委譲し、機械ゲート（型 / カバレッジ / Biome）は再実装しない。利用者パーティの点検は `review-party`、
  生成データの妥当性レビューは `pokemon-data-reviewer` agent を使う（こちらは解禁データの取得・投入が責務）。
allowed-tools: Bash(pnpm *), Bash(node scripts/*), Bash(node src/cli/*), Workflow, Agent, Read, Write, Edit, WebFetch, WebSearch
---

# survey-regulation — レギュレーション解禁情報の調査と投入

ポケモンチャンピオンズはレギュレーションごとに解禁される**種族・技・持ち物・メガシンカ**が変化する。
この情報は PokeAPI に無く（[[data-pipeline]]）、外部の対戦情報サイト（Serebii）にしか無い。本 skill は、その
解禁情報を **決定論スクレイパー（層1）+ Workflow 自己修復（層2-3）で Serebii 第一優先に取得**し、各種族の
**使用可能技を全件**・解禁持ち物を全件、再現可能な形で doc 化して、`02-data-model-redesign` で定めた
per-regulation データ構造（種族キー = 解禁・per-species `moves` 全量・block 記法・ADR 0021 / 0022 / 0023）へ
反映する手順を定型化する。M-A だけでなく **M-B 以降や将来のレギュレーション更新で routine として繰り返し使う**。

> データ構造の正本は [[data-pipeline]]（catalog / per-reg の扱い）と
> [`docs/plan/02-data-model-redesign/OVERVIEW.md`](../../../docs/plan/02-data-model-redesign/OVERVIEW.md)、
> 解禁判定モデルの「なぜ」は [ADR 0021](../../../docs/adr/0021-per-regulation-species-and-legality.md)（記録方法は
> ADR 0022・generate 責務 / 検証位置は ADR 0023・技メタ / legality を PokeAPI から外す決定は ADR 0026・3 層
> ハイブリッドの「なぜ」は ADR 0031）。
> **情報源の役割・関係性（① Serebii 第一優先 / ② 補助件数裏取り / ③ PokeAPI 構造データ）・決定論スクレイパーの
> DOM / slug 正規化 / latin-1 / exit code・全量 materialize の機構の SoT は
> [`references/serebii-sourcing.md`](./references/serebii-sourcing.md)**。memory
> `serebii-first-priority-champions-data` は方針の要約ポインタ。本 SKILL.md は調査・投入手順に専念し、情報源の
> 役割・パーサ仕様を二重記述しない。

## なぜこの skill があるか

解禁情報の一次ソースは対戦コミュニティのサイトで、**単一ソースの目視抽出は誤記・抽出ミス・更新遅れ・件数取り
こぼしを含む**。かつては各種族ページを WebFetch で LLM に丸ごと読ませて目視抽出していたが、(a) 各種族 100KB 超の
HTML を LLM コンテキストに載せるためトークンを大量消費し、(b) 小型モデル抽出は技数を誤カウントし、(c) 結果が
非決定的で再現できない、という弱点があった。本 skill はこれを **決定論スクレイパー（テスト済み純関数 + npm
script）を正しさの核**に据え、(1) HTML を LLM に載せず **exit code だけで成否判定**（トークン最小化）、(2)
取りこぼし種は **Workflow 自己修復（パーサ一般化 + 回帰 fixture）** で吸収、(3) どうしても収束しない種だけ
**最終 WebFetch fallback で目視**する、という多層で「Serebii 第一優先・全量・再現可能」を担保する
（情報源の役割・3 系統の関係性の SoT は [`references/serebii-sourcing.md`](./references/serebii-sourcing.md)）。

## 3 層ハイブリッド（決定論スクレイパー + 自己修復）

正しさの核は**層1**（cross-agent 共有の npm script + テスト済み純関数）にあり、層2-3 は **Claude 固有の取得
加速・自動修復層**である（[ADR 0031](../../../docs/adr/archive/0031-deterministic-serebii-scraper-hybrid-layers.md)）。
詳細な DOM / 正規化 / exit code は [`references/serebii-sourcing.md`](./references/serebii-sourcing.md)。

| 層 | 何をするか | 実体 | エージェント |
|---|---|---|---|
| **層1** | 決定論取得 + パース + 自己検証 exit code | `pnpm fetch:serebii` / `scrape:serebii` / `serebii:catalog`（`src/codegen/serebii/*.ts` 純関数） | 全ツール共通（Codex はこれを逐次実行） |
| **層2** | roster を礼儀バッチで取得 fan-out（read-only Haiku・HTML を読まず exit code 判定） | [`workflows/fetch-fanout.workflow`](./workflows/fetch-fanout.workflow) | Claude のみ（Workflow） |
| **層3** | 失敗種のパーサを一般化修正 + 回帰 fixture を足し失敗種のみ再取得（自己修復ループ） | [`workflows/self-heal.workflow`](./workflows/self-heal.workflow) | Claude のみ（Workflow） |

- **exit code 契約**（`scrape:serebii` が決定論判定・層2-3 のトリガ）: `0` 健全 / `2` 取得失敗 / `3` schema 欠落 /
  `4` 件数・健全性違反。stderr に `{slug, stage, missingFields, rawHtmlPath}` の 1 行 JSON 診断。**HTML 本文は
  読まない**（LLM コンテキストに載せない＝トークン最小化）。
- **メガ linking は決定論で自動著述する**（[ADR 0033](../../../docs/adr/0033-deterministic-mega-auto-authoring.md)）。
  base slug 既知 + メガ名の枝サフィックス（`""`/`X`/`Y`）から `serebii:catalog` が `megaLinks` / メガ先種族
  エントリ / per-reg `mega[]` / メガストーンの `megaSpecies` を著述する。`Mega ` 接頭の無い特殊形（Primal 等）・
  未知 id だけ escalation（diagnostic）に残るので、手順 5 で **escalation の有無を確認**する（通常メガは手動著述不要）。

### cross-agent フォールバック（正しさは層1 に宿る）

層2-3 は Claude 固有（Workflow / SubAgent）の**最適化**であり、**正しさは層1（テスト済み純関数 + npm script）に
宿る**。したがって Codex / 素の CLI など Workflow 非対応ツールは、**層1 を逐次実行 + 人手修正で完結**し、同じ成果へ
収束する（[[cross-agent]] / ADR 0031）:

- **Claude**: `Workflow({ scriptPath: ".claude/skills/survey-regulation/workflows/self-heal.workflow", args: <roster slug 配列> })`
  で 層2 fan-out → 層3 自己修復を駆動する。返り値 `{ ok, escalated, counts }`。
- **Codex / 素の CLI**: roster の各 slug を `node scripts/fetch-serebii.ts species <slug>` →
  `node scripts/scrape-serebii.ts species <slug>` で逐次実行し、exit 3/4 の種は **人が `src/codegen/serebii/parse.ts`
  / `normalize.ts` を直して fixture テストを足す**（層3 の自動修復と同じことを手で行う）。

正しさの核（共有パーサ層）を両ツールで共有するため、cross-agent でパイプラインが破綻しないことが本設計の必須条件。

## 入力 / 出力

- **入力**: レギュレーション id（例 `champions-m-a`）と解禁条件（基本最終進化・メガ可否・Restricted 除外・期間 等）。
- **出力**:
  - `docs/plan/<plan>/<id>-roster-source.md`（情報源・検証日・矛盾解消・取得 counts / escalated 種・各種族全技 /
    持ち物全件の出典付き記録）。
  - `data/champions/catalog/{species,moves,items,abilities}.yaml` への **append-only 追記**（持ち物は全件）。
  - `data/champions/regulations/<game>/<reg>.yaml`（例 `champions/m-a.yaml`・id `champions-m-a` は `<game>-<reg>` 導出）（`name` / `period` / `items` 予約キー + **トップレベル種族キー = 解禁**・
    各種族キー下に **`moves` 全量** + メガ種族に `mega[]`・block 記法）。
  - `materialize` による構造データ（`dex` / `types` / `stats` / `abilities` / `category`）と日本語名 ja の
    catalog 転記（ADR 0027 / 0032）。
  - `check:regulation` が参照整合 / schema で 0 終了すること（覚えない技照合はしない・ADR 0026）。
  - 再生成された `data/generated/**` と `pnpm verify` 緑。

## 手順

> Serebii 第一優先の URL パターン・決定論スクレイパーの DOM / 正規化 / exit code・全量 materialize の機構は
> [`references/serebii-sourcing.md`](./references/serebii-sourcing.md) に詳細。本節は順序の骨子に専念する。

### 1. roster を確定する（WebFetch・Serebii Champions 索引 + 件数裏取り）

`<id>` と解禁条件で、**Serebii Champions 索引から解禁種族の slug 配列（roster）・解禁持ち物・メガ membership を
確定**する。ここは「どの種族がこのレギュで解禁か」という**判断**であり、決定論スクレイパーでは決まらないため
**WebFetch を使う唯一の主経路**（索引ページ 1 枚で済み、各種族の技テーブル全件取得は層1-3 が担うので軽い）:

- 解禁種族索引・解禁持ち物: `https://www.serebii.net/pokemonchampions/` 配下の索引 / `items.shtml`。
- **件数裏取りは機械的件数比較に縮退する**: Game8 / Victory Road 等の補助ソースは「総数・メガ可能数」などの
  **検証しやすい要約値の件数突き合わせ**に使う（roster 総数・持ち物総数の sanity）。各種族の技の帰属は層1 の
  `scrape:serebii` 自己検証 exit code（schema / 件数・健全性）が機械担保するため、補助ソースでの技の逐一突き
  合わせはしない（過去の目視突き合わせから件数比較へ縮退・Serebii 第一優先は不変）。矛盾は `<id>-roster-source.md`
  に残す。

### 2. roster を決定論取得する（層1-3・HTML を LLM に載せない）

確定した roster slug 配列を、3 層ハイブリッドで決定論取得する（cross-agent フォールバックは上記の通り）:

- **Claude**: `Workflow({ scriptPath: ".claude/skills/survey-regulation/workflows/self-heal.workflow", args: <roster> })`
  で 層2 fan-out（read-only Haiku・exit code 判定）→ 層3 自己修復（パーサ一般化 + 回帰 fixture）を回す。失敗が
  少数で済むと見込めるなら 層2 のみ（[`fetch-fanout.workflow`](./workflows/fetch-fanout.workflow)）でもよい。
- **Codex / 素の CLI**: 各 slug を `node scripts/fetch-serebii.ts species <slug>` → `node scripts/scrape-serebii.ts species <slug>` で逐次実行し、exit 3/4 は人手修正（上記）。

返り値 `counts`（total / ok / escalated / rounds）と `escalated`（収束しない種）を、手順 6 の roster-source doc の
進捗・成功/失敗記録へ転記する。**冪等キャッシュ**（`data/raw/serebii/`）により再実行は成功種を skip する。
`escalated` 種は手順 7 の**最終 WebFetch fallback**で吸収する。

### 3. catalog / regulations へ転記する（serebii:catalog）

**`pnpm serebii:catalog`** で、層1 の中間 JSON から **Serebii 由来データ**（種族 / 各種族の全技 / 技メタ /
メガ先 / per-reg 解禁 / 英名 en）を catalog（`species` / `moves` / `items`）と `regulations/<game>/<reg>.yaml` へ
**append / 既存尊重**で転記する（skill 著述値・既存値は上書きせず conflict 提示）。**構造データ（`dex` / `types` /
`stats` / `abilities` / `category`）と日本語名 ja は書かない**（手順 4 の `materialize` が埋める）。

### 4. 構造データ・日本語名を埋める（fetch:data → materialize）

**`pnpm fetch:data`**（新規 slug の PokeAPI raw 取得・`data/raw` キャッシュ）→ **`pnpm materialize`** の順で、
構造データ（種族値 / タイプ / 特性 id / 図鑑番号 / 持ち物 category）と**日本語名 ja**（PokeAPI `names`・ja-Hrkt
優先・ADR 0032）を catalog へ転記する（append / 既存尊重・skill 著述値は上書きせず conflict 提示・ADR 0027）。
**この順序（fetch:data → materialize）の保証は本 skill の責務**である（スクリプトは raw 不在なら fail-fast する
だけで存在チェック・`fetch:data` 誘導を持たない＝責務の二重化を避ける・[[data-pipeline]] / ADR 0027）。
**learnset 照合はしない**（PokeAPI は Champions 非対応・ADR 0026）。技の出自は手順 1-2 の Serebii 取得で担保済み。

> **特性の追記漏れ = 生成エラー**: catalog に無い特性 id を種族が参照すると `generate.ts` が throw する。
> `materialize` 後に `species.yaml` の `abilities`（または `data/raw/pokemon/<slug>.json` の
> `abilities[].ability.name`）の id を `abilities.yaml` へ id→名前 で集約してから手順 6 の generate に進む。

### 5. per-reg `mega[]` 確認 + per-reg 予約キーを仕上げる

メガ linking は手順 2（`serebii:catalog`）が決定論で自動著述するので、ここでは確認と残りの仕上げに絞る:

- **メガ linking 確認**: `species.yaml` の `megaLinks` / メガ先種族エントリ、per-reg 種族の `mega[]`、メガストーンの
  `megaSpecies` は `serebii:catalog` が自動著述済み（[ADR 0033](../../../docs/adr/0033-deterministic-mega-auto-authoring.md)）。
  `serebii:catalog` の **escalation diagnostic**（`Mega ` 接頭の無い特殊形 = Primal 等・未知 id）が出た種だけ手動著述する
  （通常の `Mega <Base>[ X|Y]` は手動不要）。
- **per-reg 予約キー**: `regulations/<game>/<reg>.yaml` の `name` / `period`（開催中は `period.end` を `null`）/ `items`
  予約キー（解禁持ち物 全件）を確認・補う。トップレベル種族キーの存在 = 解禁（`allow.{...}` ラッパーは使わない）。

### 6. roster-source doc を書き、検証して再生成する（委譲）

- **`docs/plan/<plan>/<id>-roster-source.md`** に記録する（再現可能性のため）: 権威ある事実（総数 / メガ数 /
  期間 / 形式条件）と各出典 URL・**検証日**、ソース間差異と解消、手順 2 の取得 `counts` / `escalated` 種、各種族の
  使用可能技 全件・解禁持ち物 全件の出典。確定が難所なら未確定部分を明記する。
- **`pnpm check:regulation data/champions/regulations`**（authoring 時ゲート・参照整合 / schema を非0終了で検出・
  ADR 0023。覚えない技照合はしない・ADR 0026）→ **`pnpm generate:data`**（catalog YAML → TS 変換・**raw 非依存**・
  catalog 参照切れ / 技メタ・構造データ欠落は生成段エラー・ADR 0027）→ [`verify`](../verify/SKILL.md)（`pnpm verify`）。
  CLI で解禁判定を end-to-end 確認したいときは `node src/cli/index.ts check:party <party.md>`（解禁種 = exit0 /
  未解禁混入 = exit1）。**機械ゲートは再実装せず委譲**する（[[skill-authoring]]）。

### 7. 最終 fallback: escalated 種を目視で吸収する（WebFetch）

層3 / 逐次実行でも収束しない `escalated` 種（DOM 揺れ・フォルム slug の取得失敗 = exit 2 等）だけを、
`https://www.serebii.net/pokedex-champions/<species>/` を **WebFetch して目視**し、catalog / per-reg を手で著述する。
あわせて当該ページの最小化 fixture（`__fixtures__/serebii-<slug>.html`）+ 回帰テストを足して層1 パーサを一般化し
（層3 と同じ手当て）、次回からは決定論経路に乗せる。WebFetch はこの**最終 fallback と手順 1 の roster 確定に縮小**
する（各種族の技テーブル全件取得は層1-3 が担うため、目視抽出は例外ケースに限定）。

## Gotchas

- **正しさは層1（決定論スクレイパー）に宿る**: 各種族の技・種族値・タイプの抽出と件数・健全性検証は層1 の
  テスト済み純関数 + exit code が担保する。層2-3（Workflow）は Claude 固有の**取得加速・自動修復**に過ぎず、
  Codex / 素の CLI は層1 逐次 + 人手修正で同じ成果へ収束する（[[cross-agent]] / ADR 0031）。
- **HTML を LLM コンテキストに載せない**: 取得 SubAgent / 逐次実行は `scrape:serebii` の **exit code と stderr の
  1 行 JSON 診断だけ**を見て判定する。100KB 超の HTML 本文を Read / cat しない（トークン最小化・本 phase の核）。
- **件数裏取りは機械的件数比較に縮退**: Game8 等補助ソースは roster 総数・持ち物総数の要約値突き合わせに使う
  （Serebii 第一優先は不変）。各種族の技の帰属は層1 の自己検証 exit code が機械担保するため逐一目視しない。
- **curate せず全量**: 各種族 `moves` は手選びの少数サブセットにせず、Serebii の全 learnable 技を全量入れる
  （各種族数十技が正常・[`references/serebii-sourcing.md`](./references/serebii-sourcing.md)）。
- **覚えない技の機械照合ゲートは無い → Serebii 第一優先で出自を担保**: PokeAPI は Champions 非対応のため learnset
  照合は撤去した（ADR 0026）。`check:regulation` は参照整合 / schema のみ。技の出自は手順 1-2 の Serebii 取得
  （層1 の自己検証）に依存する。技メタ（type / power 等）も Serebii で確定し、構造欠落のみ生成段 tsc が弾く。
- **append-only を守る**: 没収された種・技・**非解禁持ち物**（M-A の life-orb / assault-vest / rocky-helmet 等）も
  catalog から消さない。解禁/非解禁の現況は per-reg の種族キー存在 / `items` 予約キーが表す。
- **メガ linking は決定論で自動著述**: base slug 既知 + メガ名の枝サフィックス（`""`/`X`/`Y`）から `serebii:catalog`
  が `megaLinks` / メガ先種族エントリ / per-reg `mega[]` / メガストーンの `megaSpecies` を append/既存尊重で書く
  （[ADR 0033](../../../docs/adr/0033-deterministic-mega-auto-authoring.md)）。`Mega ` 接頭の無い特殊形（Primal 等）・
  未知 id だけ escalation（diagnostic）に残り手順 5 で手当する。通常メガを手で著述しようとしない。
- **複数フォルム種の slug**: 地域フォルム・バトルフォルム・メガ先は PokeAPI / Serebii slug が `<name>-<form>`。
  default slug が意図と違う種・Serebii で別 URL になるフォルム（例: rotom 系）は手順 7 の fallback で吸収する。
- **生成物を手編集しない**: `data/generated/**` は触らず catalog / per-reg を直して再生成する（[[data-pipeline]]）。
- **機械ゲート / レビュー観点を再実装しない**: 検証は `verify` / `check:regulation`、生成データの妥当性は
  `pokemon-data-reviewer` agent、利用者パーティ点検は `review-party`（[[skill-authoring]]）。
- **redaction**: doc へ外部リンク・引用を書き出す前に [[redaction]] を点検する（Secrets / PII 非混入）。

## 関連

- 情報源の役割・決定論スクレイパー（DOM / 正規化 / exit code）・全量 materialize の詳細:
  [`references/serebii-sourcing.md`](./references/serebii-sourcing.md)。
- Workflow（層2-3・Claude 固有）: [`workflows/fetch-fanout.workflow`](./workflows/fetch-fanout.workflow) /
  [`workflows/self-heal.workflow`](./workflows/self-heal.workflow)。
- データ構造正本: [[data-pipeline]] / [`02-data-model-redesign/OVERVIEW.md`](../../../docs/plan/02-data-model-redesign/OVERVIEW.md)。
- 決定の「なぜ」: [ADR 0021](../../../docs/adr/0021-per-regulation-species-and-legality.md)（解禁判定）/
  [ADR 0022](../../../docs/adr/0022-per-regulation-species-keyed-moves.md)（記録方法・block 記法）/
  [ADR 0023](../../../docs/adr/0023-generate-transformer-and-check-regulation.md)（generate 責務 / `check:regulation`）/
  [ADR 0034](../../../docs/adr/0034-move-meta-per-game-sot.md)（PokeAPI を legality / 技メタの信頼源にしない・技メタ per-game SoT・ADR 0026 改訂）/
  [ADR 0027](../../../docs/adr/0027-structural-data-catalog-sot.md)（構造データ SoT を catalog へ・`materialize` 新設）/
  [ADR 0031](../../../docs/adr/archive/0031-deterministic-serebii-scraper-hybrid-layers.md)（決定論スクレイパー + 3 層ハイブリッド）/
  [ADR 0032](../../../docs/adr/0032-japanese-name-source-pokeapi-names.md)（日本語名 ja は PokeAPI names）。
- 検証 / 生成: [`verify`](../verify/SKILL.md) / `pnpm check:regulation` / `pnpm generate:data`。
- 利用者パーティ点検: [`review-party`](../review-party/SKILL.md) / 生成データ妥当性: `pokemon-data-reviewer` agent。
- skill 作成方針・cross-agent: [[skill-authoring]] / [[cross-agent]] / [[redaction]]。
