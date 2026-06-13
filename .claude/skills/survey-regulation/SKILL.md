---
name: survey-regulation
description: >-
  ポケモンチャンピオンズの**レギュレーション解禁情報を Serebii 第一優先で調査・複数ソース突き合わせ**し、
  各種族の**使用可能技を全件（curate せず全量）**・解禁持ち物を全件、出典付きで doc 化して、解禁エンティティ
  （種族 / 技 / 持ち物 / メガ）を `data/champions/catalog/*.yaml`（append-only）と
  `data/champions/regulations/<id>.yaml`（種族キー = 解禁・per-species `moves` 全量・block 記法）へ反映する手順
  skill。技の出自は Serebii 第一優先へ一本化する（PokeAPI は Champions 非対応のため learnset 照合はしない・ADR 0026）。「M-A の解禁データを集めて」
  「レギュレーション <id> の解禁種族・全技・持ち物を調べて投入して」「新レギュの解禁情報を取得して」
  「survey-regulation <id>」「M-B が公開されたので反映して」「レギュ情報を更新して」と言われたとき、または
  per-regulation データ（`02-data-model-redesign`）を新規投入 / 更新 / レギュ更新時に routine 実行したいときに使う。
  情報源は Serebii Champions 図鑑 / アイテムページを主・Game8 等を補助（件数検証）とし、信頼性評価と矛盾解消・
  再現可能な記録を重視する。生成 / 検証は `generate:data` / `check:regulation` / `verify` に委譲し、機械ゲート
  （型 / カバレッジ / Biome）は再実装しない。利用者パーティの点検は `review-party`、生成データの妥当性レビューは
  `pokemon-data-reviewer` agent を使う（こちらは解禁データの取得・投入が責務）。
allowed-tools: WebSearch, WebFetch, Read, Write, Edit, Bash(pnpm *), Bash(node src/cli/*)
---

# survey-regulation — レギュレーション解禁情報の調査と投入

ポケモンチャンピオンズはレギュレーションごとに解禁される**種族・技・持ち物・メガシンカ**が変化する。
この情報は PokeAPI に無く（[[data-pipeline]]）、外部の対戦情報サイトにしか無い。本 skill は、その解禁情報を
**Serebii を第一優先に複数ソースから集めて突き合わせ**、各種族の**使用可能技を全件**・解禁持ち物を全件、
再現可能な形で doc 化し、`02-data-model-redesign` で定めた per-regulation データ構造（種族キー = 解禁・
per-species `moves` 全量・block 記法・ADR 0021 / 0022 / 0023）へ反映する手順を定型化する。M-A だけでなく
**M-B 以降や将来のレギュレーション更新で routine として繰り返し使う**。

> データ構造の正本は [[data-pipeline]]（catalog / per-reg の扱い）と
> [`docs/plan/02-data-model-redesign/OVERVIEW.md`](../../../docs/plan/02-data-model-redesign/OVERVIEW.md)、
> 解禁判定モデルの「なぜ」は [ADR 0021](../../../docs/adr/0021-per-regulation-species-and-legality.md)（記録方法は
> ADR 0022・generate 責務 / 検証位置は ADR 0023・技メタ / legality を PokeAPI から外す決定は ADR 0026）。Serebii 第一優先・全量 materialize の詳細は
> [`references/serebii-sourcing.md`](./references/serebii-sourcing.md)、方針は メモリ
> `serebii-first-priority-champions-data`。本 SKILL.md は調査・投入手順に専念し、データ仕様を二重記述しない。

## なぜこの skill があるか

解禁情報は一次ソースが対戦コミュニティのサイト（Serebii / Bulbapedia / Game8 / Victory Road / MetaVGC 等）で、
**単一ソースは誤記・抽出ミス・更新遅れを含む**。中でも **Serebii の Champions 専用図鑑が最も網羅的・更新が早い**
ため、本 skill は **Serebii を第一優先の正**とし、Game8 等は補助・件数検証に回す（メモリ
`serebii-first-priority-champions-data`）。レギュレーションごとに毎回その場でやり方を考えると、突き合わせの粒度や
記録の仕方がぶれ、暫定でっち上げ（過去の不正確データ・少数サブセットの技）に逆戻りしやすい。本 skill は
「Serebii 主 + 補助で突き合わせ → 矛盾解消 → 各種族**全技** + 持ち物全件の出典付き doc → catalog / per-reg 反映
→ 再生成 → 検証」を定型化し、**結果の再現性より判断過程の追跡可能性**を担保する
（WebSearch 出力は非決定的なため）。

## 入力 / 出力

- **入力**: レギュレーション id（例 `champions-m-a`）と解禁条件（基本最終進化・メガ可否・Restricted 除外・期間 等）。
- **出力**:
  - `docs/plan/<plan>/<id>-roster-source.md`（情報源・検証日・矛盾解消・各種族全技 / 持ち物全件の出典付き記録）。
  - `data/champions/catalog/{species,moves,items,abilities}.yaml` への **append-only 追記**（持ち物は全件）。
  - `data/champions/regulations/<id>.yaml`（`name` / `period` / `items` 予約キー + **トップレベル種族キー = 解禁**・
    各種族キー下に **`moves` 全量** + メガ種族に `mega[]`・block 記法）。
  - `materialize` による構造データ（`dex` / `types` / `stats` / `abilities` / `category`）の catalog 転記（ADR 0027）。
  - `check:regulation` が参照整合 / schema で 0 終了すること（覚えない技照合はしない・ADR 0026）。
  - 再生成された `data/generated/**` と `pnpm verify` 緑。

## 手順

> Serebii 第一優先の URL パターン・全量 materialize の機構は
> [`references/serebii-sourcing.md`](./references/serebii-sourcing.md) に詳細。本節は順序の骨子に専念する。

### 1. Serebii を第一優先に情報源を集め信頼性を評価する

`<id>` と条件で、**Serebii Champions 専用図鑑を主ソース**に解禁情報を集める（最も網羅的・更新が早い・
メモリ `serebii-first-priority-champions-data`）。Game8 / Victory Road / Bulbapedia 等は**補助・件数検証**に回す:

- 解禁種族 / 各種族の使用可能技: `https://www.serebii.net/pokedex-champions/<species>/`（英名小文字）。
- 解禁持ち物: `https://www.serebii.net/pokemonchampions/items.shtml`。

各ソースの「総数・期間・メガ可能数」など**検証しやすい要約値**を先に押さえ、Serebii を正・補助で件数突き合わせる。

### 2. 全リスト・各種族の全技・持ち物全件を取得し突き合わせる（WebFetch）

Serebii から解禁種族の全リストと**各種族の使用可能技 全件**、解禁持ち物 全件を WebFetch で取得し、補助ソースの
サンプル / 総数と**帰属（membership）と件数を突き合わせる**。**矛盾は必ず doc に残し、採用根拠を明記**する
（Serebii を正とし、差異は補助ソースで裏取りした旨を記す）。1 ソースだけに依存しない。

### 3. 各種族全技・持ち物全件を出典付きで doc 化する

`docs/plan/<plan>/<id>-roster-source.md` に次を記録する（再現可能性のため）:

- 権威ある事実（総数 / メガ数 / 期間 / 形式条件）と各出典 URL・**検証日**。
- ソース間の差異と解消（何を正とし、なぜそう判断したか）。
- 解禁種族の全リスト + **各種族の使用可能技 全件**（Serebii 由来・補助で帰属検証）+ 解禁持ち物 全件
  （一般 + きのみ + メガストーン）。確定列挙が難所なら未確定部分を明記する。

### 4. 解禁条件と既存データの整合を確認する

条件（基本最終進化・メガ可・Restricted 除外 等）に反する種が混ざっていないか、既存
`data/champions/regulations/<id>.yaml` の種が新リストと矛盾しないかを確認する。**curate ではなく全量**が原則
（少数サブセットにしない・[`references/serebii-sourcing.md`](./references/serebii-sourcing.md)）。

### 5. catalog へ append-only 追記する

解禁エンティティを `data/champions/catalog/*.yaml` に追記する（**append-only**: 既存を消さない・
[[data-pipeline]]）。**Phase 10 以降、各エントリは `id → { ja, en }` 形式で日英名も併記する**（名前の SoT は
catalog YAML・ja/en 欠落は `generate.ts` が生成段で非0終了にする）:

- `species.yaml`: `pokemon` 下に `slug: { ja, en }`（+ メガ運用するなら `megaLinks` 配列）。**PokeAPI default slug**を
  使う（複数フォルムはフォルム slug に注意）。**構造データ（`dex` / `types` / `stats` / `abilities`）は手書きせず
  `materialize` が raw から転記する**（手順 7・ADR 0027）。メガ先 slug も同様に構造データを持つ。
- `abilities.yaml`: **追加種族が持つ特性を必ず全て** `id: { ja, en }` で追記する（catalog に無い特性を種族が参照すると
  `generate.ts` が生成段でエラーになる）。`pnpm fetch:data` 後に `data/raw/pokemon/<slug>.json` の
  `abilities[].ability.name` を集めると id の漏れが無い（ja/en 名は Serebii 等で確定する）。
- `moves.yaml`: 各種族の全 learnable 技を `id: { ja, en, type, damageClass, power, accuracy, pp, priority }` で
  （全量・少数サブセットにしない）。**技メタ（type / power 等）の SoT は本 catalog**（PokeAPI は Champions 非対応で
  技威力等の信頼源にしない・ADR 0026）。技メタは Serebii 等で確定し、欠落は `generate.ts` の生成段 tsc が弾く。
  既存技は追記不要（id が既にあれば技メタ済み）。`power` / `accuracy` は変化技なら `null`。
- `items.yaml`: 解禁持ち物を**全件** `id: { ja, en }` で（一般 + きのみ + メガストーン）。メガストーンは各エントリに
  `megaStoneFor`（メガ先 base SpeciesId）を付与する（旧 `itemMeta` は廃止・各エントリへ統合）。**PokeAPI item slug の
  正確な綴り**を確認する（例: `oran-berry` / `garchompite`）。**`category` は手書きせず `materialize` が raw から
  転記する**（手順 7・ADR 0027）。
- `types.yaml`（18 タイプ固定・通常は追記不要）: `id: { ja, en, damageTo }`。名前・相性とも catalog が SoT。

### 6. per-regulation YAML を書く / 更新する（新スキーマ・block 記法）

`data/champions/regulations/<id>.yaml` を新スキーマで記述する（id は catalog 参照・[[data-pipeline]] / ADR 0022）:

- `name` / `period` / `items` は**予約キー**。`period.end` は開催中なら空（`null`）。`items` に解禁持ち物を**全件**。
- **トップレベルの種族 ID キー = 解禁**（キーの存在 = allow）。各種族キー下に **`moves` を全量**（block シーケンス）、
  メガ運用種族は **`mega`（配列・1 種族複数メガ可）** をコロケーション。`allow.{...}` ラッパーは使わない（廃止）。

### 7. 構造データを取得し catalog へ転記する（fetch:data → materialize・learnset 照合はしない）

**`pnpm fetch:data`**（新規 slug 取得・`data/raw` キャッシュ）で**構造データ**（種族値 / タイプ / 特性 id / 図鑑番号 /
持ち物 category）を PokeAPI から取得し、続けて **`pnpm materialize`** で raw → catalog YAML へ転記する。`materialize`
は `species.yaml` の `dex` / `types` / `stats` / `abilities` と `items.yaml` の `category` を埋める（append/既存尊重・
hand-authored 修正は上書きせず conflict 提示・ADR 0027）。**この順序（fetch:data → materialize）を保証するのは本
skill の責務**である（スクリプトは raw 不在なら fail-fast するだけで存在チェック・`fetch:data` 誘導を持たない＝責務の
二重化を避ける・[[data-pipeline]] / ADR 0027）。**learnset 照合はしない**（PokeAPI は Champions 非対応で learnset が
実態と一致しないため撤去・ADR 0026）。技の出自は手順 1〜3 の Serebii 第一優先調査で担保済みで、覚えない技の機械照合
ゲートは存在しない。`abilities.yaml`（id→名前）の集約も raw 取得 + materialize 後に行う（下記 Gotcha の順序）。技メタ
（type / power 等）は catalog/`moves.yaml` が SoT で raw 取得しない（ADR 0026）。

### 8. 検証して再生成する（委譲）

**`pnpm check:regulation data/champions/regulations`**（authoring 時ゲート・参照整合 / schema を非0終了で検出・
ADR 0023。覚えない技照合はしない・ADR 0026）→ **`pnpm generate:data`**（catalog YAML → TS 変換・**raw 非依存**・
catalog 参照切れ / 技メタ・構造データ欠落は生成段エラー・ADR 0027）→ [`verify`](../verify/SKILL.md)（`pnpm verify`）。
CLI で解禁判定を end-to-end 確認したいときは `node src/cli/index.ts check:party <party.md>`（解禁種 = exit0 /
未解禁混入 = exit1）。**機械ゲートは再実装せず委譲**する（[[skill-authoring]]）。`generate.ts` は変換専任で妥当性検証
はしない（ADR 0023）ため、**参照整合 / schema の検出は `check:regulation` を必ず通す**こと。

## Gotchas

- **Serebii を第一優先・補助で件数検証**: Serebii Champions 図鑑を正とし、Game8 等補助ソースで総数・帰属を裏取り
  する。単一ソースの自動抽出は件数・帰属を誤りやすいため必ず 2 ソース以上で突き合わせ、矛盾と採用根拠を doc に残す
  （WebFetch は小型モデル抽出のため件数を誤カウントしうる・メモリ `serebii-first-priority-champions-data`）。
- **curate せず全量 materialize**: 各種族 `moves` は手選びの少数サブセットにせず、Serebii の全 learnable 技を全量
  入れる。少数サブセットは利用者の選択肢を塞ぐため不可（各種族数十技が正常・[`references/serebii-sourcing.md`](./references/serebii-sourcing.md)）。
- **覚えない技の機械照合ゲートは無い → Serebii 第一優先で出自を担保する**: PokeAPI は Champions 非対応のため
  learnset 照合は撤去した（ADR 0026）。`check:regulation` は参照整合 / schema のみで覚えない技は検出しない。
  全量 materialize 時の混入防止は手順 1〜3 の Serebii 突き合わせ（矛盾 / 採用根拠を doc 化）に依存する。
  技メタ（type / power 等）も Serebii で確定し、誤記の構造欠落のみ生成段 tsc が弾く（数値の正しさは Serebii 照合）。
- **abilities の追記漏れ = 生成エラー**: 種族追加時は特性カタログへの追記を忘れない。catalog に無い id を種族が
  参照すると `generate.ts` が throw する（整合担保・[[data-pipeline]]）。**順序が肝**: 構造データ（特性 id 含む）は
  raw 取得 + materialize 後でないと catalog に揃わないため、**(1) `species.yaml` 等の catalog へ種族 / 技 / 持ち物
  slug + 名前を追記 → (2) `pnpm fetch:data` で `data/raw` 取得 → (3) `pnpm materialize` で構造データ（`dex` / `types`
  / `stats` / `abilities` / `category`）を catalog へ転記 → (4) 転記済み `species.yaml` の `abilities`（または
  `data/raw/pokemon/<slug>.json`）の特性 id を集約して `abilities.yaml` へ id→名前 を追記 → (5) `generate:data`** の
  順で進める（追記→fetch→materialize→特性名追記→generate）。先に generate すると特性漏れで throw する。
- **append-only を守る**: 没収された種・技・**非解禁持ち物**（M-A の life-orb / assault-vest / rocky-helmet 等）も
  catalog から消さない。解禁/非解禁の現況は per-reg の種族キー存在 / `items` 予約キーが表す。
- **複数フォルム種の slug**: 地域フォルム・バトルフォルム・メガ先は PokeAPI slug が `<name>-<form>`。default
  slug が意図と違う種に注意（[[data-pipeline]] の vendor 方式）。
- **生成物を手編集しない**: `data/generated/**` は触らず catalog / per-reg を直して再生成する（[[data-pipeline]]）。
- **機械ゲート / レビュー観点を再実装しない**: 検証は `verify` / `check:regulation`、生成データの妥当性は
  `pokemon-data-reviewer` agent、利用者パーティ点検は `review-party`（[[skill-authoring]]）。
- **redaction**: doc へ外部リンク・引用を書き出す前に [[redaction]] を点検する（Secrets / PII 非混入）。

## 関連

- Serebii 第一優先・全量 materialize の詳細: [`references/serebii-sourcing.md`](./references/serebii-sourcing.md)。
- データ構造正本: [[data-pipeline]] / [`02-data-model-redesign/OVERVIEW.md`](../../../docs/plan/02-data-model-redesign/OVERVIEW.md)。
- 決定の「なぜ」: [ADR 0021](../../../docs/adr/0021-per-regulation-species-and-legality.md)（解禁判定）/
  [ADR 0022](../../../docs/adr/0022-per-regulation-species-keyed-moves.md)（記録方法・block 記法）/
  [ADR 0023](../../../docs/adr/0023-generate-transformer-and-check-regulation.md)（generate 責務 / `check:regulation`）/
  [ADR 0026](../../../docs/adr/0026-pokeapi-not-champions-legality-source.md)（PokeAPI を legality / 技メタの信頼源にしない）/
  [ADR 0027](../../../docs/adr/0027-structural-data-catalog-sot.md)（構造データ SoT を catalog へ・`materialize` 新設・raw 存在担保は本 skill 責務）。
- 検証 / 生成: [`verify`](../verify/SKILL.md) / `pnpm check:regulation` / `pnpm generate:data`。
- 利用者パーティ点検: [`review-party`](../review-party/SKILL.md) / 生成データ妥当性: `pokemon-data-reviewer` agent。
- skill 作成方針・cross-agent: [[skill-authoring]] / [[cross-agent]] / [[redaction]]。
