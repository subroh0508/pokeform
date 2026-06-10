---
name: survey-regulation
description: >-
  ポケモンチャンピオンズの**レギュレーション解禁情報を Serebii 第一優先で調査・複数ソース突き合わせ**し、
  各種族の**使用可能技を全件（curate せず全量）**・解禁持ち物を全件、出典付きで doc 化して、解禁エンティティ
  （種族 / 技 / 持ち物 / メガ）を `data/champions/catalog/*.yaml`（append-only）と
  `data/champions/regulations/<id>.yaml`（種族キー = 解禁・per-species `moves` 全量・block 記法）へ反映する手順
  skill。投入前に PokeAPI learnset へプログラム照合して覚えない技を排除する。「M-A の解禁データを集めて」
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
> ADR 0022・generate 責務 / 検証位置は ADR 0023）。Serebii 第一優先・全量 materialize・learnset 照合の詳細は
> [`references/serebii-sourcing.md`](./references/serebii-sourcing.md)、方針は メモリ
> `serebii-first-priority-champions-data`。本 SKILL.md は調査・投入手順に専念し、データ仕様を二重記述しない。

## なぜこの skill があるか

解禁情報は一次ソースが対戦コミュニティのサイト（Serebii / Bulbapedia / Game8 / Victory Road / MetaVGC 等）で、
**単一ソースは誤記・抽出ミス・更新遅れを含む**。中でも **Serebii の Champions 専用図鑑が最も網羅的・更新が早い**
ため、本 skill は **Serebii を第一優先の正**とし、Game8 等は補助・件数検証に回す（メモリ
`serebii-first-priority-champions-data`）。レギュレーションごとに毎回その場でやり方を考えると、突き合わせの粒度や
記録の仕方がぶれ、暫定でっち上げ（過去の不正確データ・少数サブセットの技）に逆戻りしやすい。本 skill は
「Serebii 主 + 補助で突き合わせ → 矛盾解消 → 各種族**全技** + 持ち物全件の出典付き doc → catalog / per-reg 反映
→ **投入前 learnset 照合** → 再生成 → 検証」を定型化し、**結果の再現性より判断過程の追跡可能性**を担保する
（WebSearch 出力は非決定的なため）。

## 入力 / 出力

- **入力**: レギュレーション id（例 `champions-m-a`）と解禁条件（基本最終進化・メガ可否・Restricted 除外・期間 等）。
- **出力**:
  - `docs/plan/<plan>/<id>-roster-source.md`（情報源・検証日・矛盾解消・各種族全技 / 持ち物全件の出典付き記録）。
  - `data/champions/catalog/{species,moves,items,abilities}.yaml` への **append-only 追記**（持ち物は全件）。
  - `data/champions/regulations/<id>.yaml`（`name` / `period` / `items` 予約キー + **トップレベル種族キー = 解禁**・
    各種族キー下に **`moves` 全量** + メガ種族に `mega[]`・block 記法）。
  - 投入前 learnset 照合で覚えない技を排除済みであること（`check:regulation` 0 終了）。
  - 再生成された `data/generated/**` と `pnpm verify` 緑。

## 手順

> Serebii 第一優先の URL パターン・全量 materialize・learnset 照合の機構は
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

解禁エンティティの id を `data/champions/catalog/*.yaml` に追記する（**append-only**: 既存を消さない・
[[data-pipeline]]）:

- `species.yaml`: 種族 slug（+ メガ運用するなら `megaLinks` 配列）。**PokeAPI default slug**を使う（複数フォルムは
  フォルム slug に注意）。
- `abilities.yaml`: **追加種族が持つ特性を必ず全て追記**する（catalog に無い特性を種族が参照すると
  `generate.ts` が生成段でエラーになる）。`pnpm fetch:data` 後に `data/raw/pokemon/<slug>.json` の
  `abilities[].ability.name` を集めると漏れない。
- `moves.yaml`: 各種族の全 learnable 技の id（全量・少数サブセットにしない）。
- `items.yaml`: 解禁持ち物の id を**全件**（一般 + きのみ + メガストーン）。メガストーンは `itemMeta` に
  `megaStone` を付与。**PokeAPI item slug の正確な綴り**を確認する（例: `oran-berry` / `garchompite`）。

### 6. per-regulation YAML を書く / 更新する（新スキーマ・block 記法）

`data/champions/regulations/<id>.yaml` を新スキーマで記述する（id は catalog 参照・[[data-pipeline]] / ADR 0022）:

- `name` / `period` / `items` は**予約キー**。`period.end` は開催中なら空（`null`）。`items` に解禁持ち物を**全件**。
- **トップレベルの種族 ID キー = 解禁**（キーの存在 = allow）。各種族キー下に **`moves` を全量**（block シーケンス）、
  メガ運用種族は **`mega`（配列・1 種族複数メガ可）** をコロケーション。`allow.{...}` ラッパーは使わない（廃止）。

### 7. 投入前に learnset へプログラム照合して覚えない技を排除する

`check:regulation` を通す**前**に、`pnpm fetch:data`（新規 slug 取得・`data/raw` キャッシュ）で learnset を取得し、
各種族 `moves` を **raw PokeAPI learnset** へ**プログラム照合**して覚えない技を洗い出して潰す（`check:regulation`
は overrides 非適用・raw learnset 正・[[data-pipeline]]）。全量
materialize は覚えない技が混入しやすいため、この前段で潰してから検証へ進む（差異の判断基準・補正方針は
[`references/serebii-sourcing.md`](./references/serebii-sourcing.md)）。**検出本体は `check:regulation` に委譲**し
（覚えない技 ⊄ learnset を非0終了で検出・ADR 0023）、skill に検証ロジックを書かない（[[skill-authoring]]）。

### 8. 検証して再生成する（委譲）

**`pnpm check:regulation data/champions/regulations`**（authoring 時ゲート・覚えない技 / 参照切れ / schema を
非0終了で検出・ADR 0023。`fetch:data` 後なら learnset full 検証）→ `pnpm generate:data`（YAML → TS 変換・
catalog 参照切れは生成段エラー）→ [`verify`](../verify/SKILL.md)（`pnpm verify`）。CLI で解禁判定を end-to-end
確認したいときは `node src/cli/index.ts check:party <party.md>`（解禁種 = exit0 / 未解禁混入 = exit1）。
**機械ゲートは再実装せず委譲**する（[[skill-authoring]]）。`generate.ts` は変換専任で妥当性検証はしない
（ADR 0023）ため、**覚えない技 / 参照切れの検出は `check:regulation` を必ず通す**こと。

## Gotchas

- **Serebii を第一優先・補助で件数検証**: Serebii Champions 図鑑を正とし、Game8 等補助ソースで総数・帰属を裏取り
  する。単一ソースの自動抽出は件数・帰属を誤りやすいため必ず 2 ソース以上で突き合わせ、矛盾と採用根拠を doc に残す
  （WebFetch は小型モデル抽出のため件数を誤カウントしうる・メモリ `serebii-first-priority-champions-data`）。
- **curate せず全量 materialize**: 各種族 `moves` は手選びの少数サブセットにせず、Serebii の全 learnable 技を全量
  入れる。少数サブセットは利用者の選択肢を塞ぐため不可（各種族数十技が正常・[`references/serebii-sourcing.md`](./references/serebii-sourcing.md)）。
- **全量は覚えない技が混入しやすい → 投入前 learnset 照合を必ず通す**: `check:regulation` 前に `fetch:data` で
  raw learnset を引き、覚えない技を潰す（version_group 差異・過去世代限定技は **per-reg YAML から除去**で解消。
  `check:regulation` は overrides 非適用のため override では通せない・[[data-pipeline]]）。
- **abilities の追記漏れ = 生成エラー**: 種族追加時は特性カタログへの追記を忘れない。`data/raw` から機械的に
  集めると確実。catalog に無い id を種族が参照すると `generate.ts` が throw する（整合担保・[[data-pipeline]]）。
- **append-only を守る**: 没収された種・技・**非解禁持ち物**（M-A の life-orb / assault-vest / rocky-helmet 等）も
  catalog から消さない。解禁/非解禁の現況は per-reg の種族キー存在 / `items` 予約キーが表す。
- **複数フォルム種の slug**: 地域フォルム・バトルフォルム・メガ先は PokeAPI slug が `<name>-<form>`。default
  slug が意図と違う種に注意（[[data-pipeline]] の vendor 方式）。
- **生成物を手編集しない**: `data/generated/**` は触らず catalog / per-reg を直して再生成する（[[data-pipeline]]）。
- **機械ゲート / レビュー観点を再実装しない**: 検証は `verify` / `check:regulation`、生成データの妥当性は
  `pokemon-data-reviewer` agent、利用者パーティ点検は `review-party`（[[skill-authoring]]）。
- **redaction**: doc へ外部リンク・引用を書き出す前に [[redaction]] を点検する（Secrets / PII 非混入）。

## 関連

- Serebii 第一優先・全量 materialize・learnset 照合の詳細: [`references/serebii-sourcing.md`](./references/serebii-sourcing.md)。
- データ構造正本: [[data-pipeline]] / [`02-data-model-redesign/OVERVIEW.md`](../../../docs/plan/02-data-model-redesign/OVERVIEW.md)。
- 決定の「なぜ」: [ADR 0021](../../../docs/adr/0021-per-regulation-species-and-legality.md)（解禁判定）/
  [ADR 0022](../../../docs/adr/0022-per-regulation-species-keyed-moves.md)（記録方法・block 記法）/
  [ADR 0023](../../../docs/adr/0023-generate-transformer-and-check-regulation.md)（generate 責務 / `check:regulation`）。
- 検証 / 生成: [`verify`](../verify/SKILL.md) / `pnpm check:regulation` / `pnpm generate:data`。
- 利用者パーティ点検: [`review-party`](../review-party/SKILL.md) / 生成データ妥当性: `pokemon-data-reviewer` agent。
- skill 作成方針・cross-agent: [[skill-authoring]] / [[cross-agent]] / [[redaction]]。
