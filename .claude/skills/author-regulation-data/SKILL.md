---
name: author-regulation-data
description: >-
  指定レギュレーション <reg> の解禁データ（roster / 技 / 持ち物 / メガ）を pokemon-showdown 経路から取得して
  全量投入する per-reg オーケストレーション skill。「レギュレーション <reg> の解禁データを取得して」
  「M-A / M-B を全量投入して」「per-reg 解禁データを埋めて」「author-regulation-data <reg>」「data/ を削除した
  状態から reg を復元して」「showdown-sync を回して解禁データを入れて」と言われたとき、または reg 単位の解禁
  データを完全削除・部分欠損・完成済みのいずれからでも冪等に収束させたいときに使う。前提ゲート
  （author-static-data の全件名辞書 + rules.yaml / type-specs.yaml 存在）→ per-reg reset → showdown-sync.yml
  dispatch → verify-showdown-pr 照合 → check:regulation → generate:data → pokemon-data-reviewer 依頼 → per-reg
  静的著述（index.yaml の period + languages/regulations.yaml エントリ）を既存経路へ委譲してオーケストレーション
  する。取得実体・機械ゲートは再実装しない。新規 id の名前欠落は author-static-data へ委譲し、reg 非依存の全件名
  辞書そのものは author-static-data の責務。
allowed-tools: Bash(pnpm *), Bash(node scripts/*), Bash(node src/cli/*), Bash(gh *), Bash(git *), Read, Write, Edit
---

# author-regulation-data — レギュレーション解禁データを取得・投入する

指定レギュレーション 1 つ分の解禁データ（roster / per-species 技 / 解禁持ち物 / 解禁メガ）を、`data/` 完全削除・
部分欠損・完成済みのいずれの状態からでも同じ手順で収束させる**冪等な取得オーケストレーション** skill。
`author-static-data`（reg 非依存の全件名辞書）と対になり、こちらは **reg 依存の「解禁データ」**を担当する。
skill は取得実体を再実装せず、確定済みの機械経路（`showdown-sync.yml` / `verify-showdown-pr` /
`check:regulation` / `generate:data`）を**オーケストレーション**する。

> データ構造・SoT・取得元の権威序列（showdown=正 > Serebii=速報 > PokeAPI=ja 補完）の正本は [[data-pipeline]]
> （3 軸直交・「項目の取得元」表・per-reg レイアウト）。showdown を第一の正にする「なぜ」は
> [ADR 0039](../../../docs/adr/0039-showdown-authoritative-pokeapi-ja-only.md)、名前を全件名辞書化して per-reg
> 取得の ja gap を消す「なぜ」は [ADR 0041](../../../docs/adr/0041-languages-full-name-dictionary.md)、per-reg
> ディレクトリ（1 レギュ = 1 ディレクトリ）の「なぜ」は
> [ADR 0035](../../../docs/adr/0035-specs-languages-layout-redesign.md)。本 SKILL.md は取得オーケストレーション
> 手順に専念し、SoT レイアウト・数式・型パターンを二重記述しない。

## なぜこの skill があるか

per-reg 解禁データの投入は「reset → 取得 → 照合 → 検証 → per-reg 著述 → データレビュー依頼」という**多段の手順**
だが、各段の実体（抽出・転記・照合・検証）は既に確定済みの機械経路（GitHub Actions / npm script / 既存 skill）
が持つ。手順をエージェントの記憶に委ねると段の抜け・順序ずれ・取得実体の再実装が起きるため、**順序と委譲先を
skill に定式化**して収束を再現可能にする。

名前は Phase の全件名辞書化（`author-static-data` / ADR 0041）で事前整備されるため、per-reg 取得時の ja gap は
**原則出ない**。従来の「投入のたびに ja を埋める」ループは不要になり、本 skill の主タスクは**解禁データ（構造は
別途 specs）**の取得に絞られる。名前欠落は「showdown が全件辞書に無い新規 id を導入した稀なケース」だけに縮小し、
その差分補完は `author-static-data`（差分追加）へ委譲する。

## 入力 / 出力

- **入力**: 対象レギュレーション id（例 `m-a` / `m-b`）。`data/` の状態は問わない（完全削除・部分欠損・完成済み
  のいずれからでも同手順で収束する）。
- **出力**:
  - `data/champions/<reg>/{species,items,mega,species-moves}.yaml` への解禁データ（`showdown-sync.yml` が
    抽出 → 転記 → `data:authoritative` PR）。
  - `data/champions/<reg>/index.yaml` の `period`（公式スケジュール・ユーザー確認）と
    `data/languages/regulations.yaml` の当該 reg エントリ（命名規約から導出）の**静的著述**。
  - `verify-showdown-pr` の Serebii 照合コメント / `check:regulation` の参照整合 / `generate:data` の緑 /
    `pokemon-data-reviewer` のデータ妥当性レビュー。

## 手順

各段は既存経路へ**委譲**する（再実装しない・[[skill-authoring]]）。段の順序が収束の本体で、実体は下記委譲先が持つ。

### 0. 前提ゲート（fail-fast・欠けていれば先に埋めさせる）

取得を始める前に、per-reg 取得が前提とする**前提層**が揃っているかを確認する。欠けていれば取得を進めず、先に
該当 skill / 手作業を促す（skill 間の自動連鎖はせず**明示的オーケストレーション**に委ねる）:

- **全件名辞書**（`author-static-data`・reg 非依存）: `data/languages/{species,items,moves,abilities,types}.yaml`
  が全件名（ja/en）で満たされているか。空 / 未整備なら先に [`author-static-data`](../author-static-data/SKILL.md)
  を実行する（未整備のまま取得すると generate 段で名前欠落の非0終了になる・[[data-pipeline]]）。
- **静的コミット**: `data/champions/rules.yaml`（能力ポイント定数）/ `data/champions/type-specs.yaml`（タイプ相性表）
  が存在するか。これらは自動化対象外で（[[data-pipeline]]）、`data/` を完全削除した場合のみ手作業で復元する。
  無ければ generate 前に手作業で復元する。

前提が揃っていれば取得へ進む。前提ゲートは「先に何を埋めるべきか」を示す誘導で、機械ゲートの再実装ではない。

### 1. per-reg reset（取得可能面を空スタブ化・staleness 排除）

対象 `<reg>` の**取得で埋まる面**（`<reg>/{species,items,mega,species-moves}.yaml`）を空スタブへ戻し、値の
staleness を排除する。**共有 specs（`*-specs.yaml`）は append-only ゆえ触らない**（union で成長し、reset すると
他 reg の値まで失う）。`index.yaml` の `period`（静的著述・手順 5）も reset 対象外。

reset は「値を疑って全取り直しする = 再取得の明示的意思表示」に相当する（下記「冪等スキップ」参照）。部分欠損の
補完だけが目的なら reset は不要で、取得層の append/既存尊重に任せてよい（既存レコードは触れない）。

### 2. showdown-sync.yml を dispatch する（authoritative 取得）

**`gh workflow run showdown-sync.yml -f regulation=<reg>`**（`workflow_dispatch` 手動）で、
`smogon/pokemon-showdown` の clone → build → `showdown:{species,moves,items,abilities,mega}` 抽出 → SoT YAML 転記 →
ja backfill → `check:regulation` → `generate:data` → `pnpm verify` → `data:authoritative` ラベルの PR 自動作成、
までを CI 上で回す。**workflow は据え置き**（本 skill は dispatch するのみ・取得実体は
[`showdown-sync.yml`](../../../.github/workflows/showdown-sync.yml) が持つ）。立った PR は `gh pr view` / `gh pr list
--label data:authoritative` で確認する。

### 3. 新規 id の名前欠落のみ差分補完（`author-static-data` 委譲）

showdown が**全件名辞書に無い新規 id**（新登場ポケモン・新技等）を導入した場合**だけ**、その名前を
[`author-static-data`](../author-static-data/SKILL.md)（差分追加）で補完する。メガ ja 等 PokeAPI 未存在分も同経路
（手作業 commit）。全件辞書化（ADR 0041）済みゆえ**通常はここが空振り**する（名前 gap は原則出ない）。空振りなら
このステップは skip してよい。

### 4. 照合 → 検証 → 生成 → データレビュー依頼

`showdown-sync.yml` の PR を、確定済み経路でマージ前に裏取りする:

- **Serebii 照合**: [`verify-showdown-pr`](../verify-showdown-pr/SKILL.md) を PR 番号で実行し、roster / 技件数 /
  持ち物・メガ membership / 技メタ / 名前を Serebii スクレイパーで機械照合する（一致 = 承認可 / 差異 = blocking を
  PR コメントへ）。
- **参照整合**: `pnpm check:regulation data/champions`（per-reg ファイルを再構成して参照整合・schema を検証・
  authoring ゲート・[[data-pipeline]]）。
- **生成**: `pnpm generate:data`（specs / languages / per-reg YAML → TS 変換・合成・raw 非依存・spec の名前欠落や
  参照不整合は生成段で非0終了）。検証まで通すなら [`verify`](../verify/SKILL.md)（`pnpm verify`）。
- **データ妥当性**: 生成データ（種族値 / タイプ / 相性 / 日英名 / 解禁 / メガ links）の妥当性は
  `pokemon-data-reviewer` agent に委ねる（本 skill は機械ゲートを再実装しない・[[skill-authoring]]）。

`showdown-sync.yml` は CI 内で `check:regulation` / `generate:data` / `verify` を通すため、PR 側で緑が確認できる。
ローカルで再確認する場合のみ上記 npm script を逐次実行する。

### 5. per-reg 静的著述（`index.yaml` period + `languages/regulations.yaml`）

取得で埋まらない **reg 依存の静的メタ**を著述する（reg 依存ゆえ `author-static-data` スコープ外・データ単位の境界）:

- **`<reg>/index.yaml` の `period`**: 公式スケジュールの開催期間（`start` 必須・開催中なら `end` は空 = null）。
  日付は公式発表を**ユーザーに確認**して埋める（取得元に無い運用情報）。
- **`languages/regulations.yaml` の当該 reg エントリ**: `<game>-<reg>`（例 `champions-m-a`）→ `{ ja, en }` を命名
  規約（`チャンピオンズ レギュレーション<X>` / `Champions Regulation <X>`）から導出して著述する（PokeAPI に無く
  ja/en とも skill 著述・[[data-pipeline]]）。

いずれも **block スタイル**で書く（`check:yaml-style` 通過・flow 禁止・[[data-pipeline]]）。既存エントリは上書き
しない（append/既存尊重）。

### 6. 冪等スキップ（再実行が安全な理由）

取得層（`sync-showdown.ts`）は **append/既存尊重**（roster は sorted union・値は空欄のみ補完・既存値は上書きせず
conflict 提示）ゆえ**再実行が安全**で、「存在するレコードはスキップ」は転記側で自然に実現される。よって本 skill を
同じ reg で再実行しても、既存レコードは触れず差分だけが追加される。

値を疑って**全取り直し**する場合は、先に該当ファイル（`<reg>/*.yaml`）を**削除 = 再取得の明示的意思表示**してから
手順 1〜4 を回す（append/既存尊重は既存値を守るため、削除しない限り古い値は残る）。

## Gotchas

- **責務は reg 依存の解禁データのみ**: 本 skill は per-reg の解禁データ（roster / 技 / 持ち物 / メガ）と reg 依存の
  静的メタ（period / reg 名）を担う。reg 非依存の**全件名辞書**（species/items/moves/abilities/types の ja/en）は
  [`author-static-data`](../author-static-data/SKILL.md) の責務（[[data-pipeline]]）。
- **取得実体・機械ゲートを再実装しない**: 抽出 + 転記は `showdown-sync.yml`、照合は `verify-showdown-pr`、参照整合は
  `check:regulation`、生成は `generate:data`、検証は `verify` へ委譲する。本 skill は順序と委譲のオーケストレーション
  だけを持つ（[[skill-authoring]]）。
- **showdown-sync.yml は据え置き**: 本 skill は workflow を dispatch するのみで改修しない。取得ロジックの変更は
  workflow / 抽出層（`scripts/showdown/*`・`src/codegen/showdown/*`）側の責務。
- **共有 specs を reset しない**: reset 対象は per-reg の取得可能面（`<reg>/{species,items,mega,species-moves}.yaml`）
  のみ。`*-specs.yaml` は append-only の union マスターで、reset すると他 reg の構造・技メタまで失う（[[data-pipeline]]）。
- **ja gap は原則解消済み**: 名前は全件名辞書（ADR 0041）で事前整備される。per-reg 取得時の ja gap は原則出ず、
  手順 3 は通常空振りする。新規 id を導入した稀なケースのみ `author-static-data`（差分追加）で補う。
- **メガ名は PokeAPI（本 skill の責務外）**: `languages/mega.yaml` の ja/en は PokeAPI `pokemon-form` の form_names
  から `author-static-data`（`pokeapi-names.yml`）が全件埋める（ADR 0043）。本 skill（per-reg 取得）は mega の
  **構造 + linking**（`mega-specs` / `megaEvolvesTo` / `<reg>/mega.yaml`）のみ showdown から取得し、mega 名は書かない
  （[[data-pipeline]] の名前取得元分担表）。
- **生成物を手編集しない**: `src/generated/**` は触らず SoT（specs / languages / per-reg）を経路/AI 経由で直して
  再生成する（[[data-pipeline]]）。
- **cross-agent フォールバック**: 本 skill は `gh workflow run`（GitHub Actions dispatch）を含むため Claude / Codex
  いずれからも駆動できる。dispatch 不可環境では workflow の各ステップに相当する npm script を**逐次実行 + 人手**へ
  縮退する（`pnpm showdown:{species,moves,items,abilities,mega} <reg>` → `pnpm fetch:ja-names` → `pnpm sync:ja-names`
  → `pnpm check:regulation data/champions` → `pnpm generate:data` → `pnpm verify` → 手動 PR）。正しさは各 npm script
  （テスト済み転記層）に宿り workflow は自動化に過ぎない（[[cross-agent]]）。

## 関連

- データ構造・SoT・権威序列の正本: [[data-pipeline]]（per-reg レイアウト・「項目の取得元」表・全件名辞書）。
- 決定の「なぜ」: [ADR 0039](../../../docs/adr/0039-showdown-authoritative-pokeapi-ja-only.md)（showdown 第一の正）/
  [ADR 0041](../../../docs/adr/0041-languages-full-name-dictionary.md)（全件名辞書で ja gap 解消）/
  [ADR 0035](../../../docs/adr/0035-specs-languages-layout-redesign.md)（3 軸直交・per-reg ディレクトリ）。
- 取得経路（authoritative・据え置き）: [`showdown-sync.yml`](../../../.github/workflows/showdown-sync.yml) /
  `scripts/showdown/*` / `src/codegen/showdown/*-fields.ts`。
- 照合 / 検証 / 生成: [`verify-showdown-pr`](../verify-showdown-pr/SKILL.md) / `pnpm check:regulation` /
  `pnpm generate:data` / [`verify`](../verify/SKILL.md)。
- 対になる skill（reg 非依存の全件名辞書）: [`author-static-data`](../author-static-data/SKILL.md)。
- 生成データ妥当性: `pokemon-data-reviewer` agent / 利用者パーティ点検: [`review-party`](../review-party/SKILL.md)。
- skill 作成方針・cross-agent: [[skill-authoring]] / [[cross-agent]]。
