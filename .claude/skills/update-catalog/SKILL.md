---
name: update-catalog
description: >-
  PokeAPI 由来の **日本語名 ja**（reg / ゲーム非依存）を、名前 SoT `data/languages/*.yaml` へ取り込む ja 専任の
  手順 skill。「日本語名 ja を languages へ入れて」「ja 名が欠けている種族 / 持ち物 / 技 / 特性を埋めて」
  「PokeAPI の names を取り込んで」「update-catalog <id...>」「ja 名を backfill して」と言われたとき、または
  showdown 経路で構造データを入れた後に ja 名が空のエントリを補うときに使う。構造データ（種族値 / タイプ /
  特性 id / 図鑑番号 / category）の取得は pokemon-showdown 経路（`showdown:*`）の責務、Champions 解禁データ
  （roster / 技 / メガ）の取得は Serebii 速報経路の責務で、こちらは **PokeAPI の日本語名 ja のみ**を担う。
  生成 / 検証は `generate:data` / `verify` に委譲し機械ゲートは再実装しない。
allowed-tools: Bash(pnpm *), Bash(node scripts/*), Bash(node src/cli/*), Read, Write, Edit
---

# update-catalog — PokeAPI の日本語名 ja を languages へ取り込む

`data/languages/*.yaml`（名前 SoT・ゲーム非依存）の **日本語名 ja** を **PokeAPI `names`(ja-Hrkt) 由来で取り込む**
手順を定型化する。pokemon-showdown も Serebii も日本語名以外は英語ベースで、showdown は ja を持たないため、
**ja の正は PokeAPI `names`(ja-Hrkt) に縮小して残す**（権威序列 = showdown(正) > Serebii(速報) > PokeAPI(ja 補完)）。

> データ構造・SoT の正本は [[data-pipeline]]（specs / languages / 取得 → 転記 → 合成）。日本語名 ja の取得元を
> PokeAPI names にする「なぜ」は [ADR 0032](../../../docs/adr/archive/0032-japanese-name-source-pokeapi-names.md)、
> specs / languages の 3 軸直交・名前 SoT を languages へ一本化する「なぜ」は
> [ADR 0035](../../../docs/adr/0035-specs-languages-layout-redesign.md)。本 SKILL.md は取り込み手順に専念し、
> SoT / 数式 / 型パターンを二重記述しない。

## なぜこの skill があるか

`data/languages/*.yaml` の名前は **2 経路の ja** で埋まる: 正 = **PokeAPI `names`(ja-Hrkt)**（機械転記・本 skill）と
速報 = **Serebii 各ページ**（公式更新を早く取り込む・別経路）。構造データ（種族値 / タイプ / 特性 id / 図鑑番号 /
category）と en は **pokemon-showdown 経路**（`showdown:*`）が正として供給し、本 skill は触れない。責務を取得元で
分離するのは、取得元・更新頻度・情報源が異なる（PokeAPI ja は安定・showdown 構造はビルド由来・Serebii 解禁は
レギュ更新ごと）ため。本 skill は **PokeAPI の日本語名 ja 補完のみ**を担う。

## 入力 / 出力

- **入力**: ja 名の新規 / 補完が要るエンティティ id（種族 slug / 持ち物 id / 技 id / 特性 id）。多くは showdown 経路で
  構造データ / en を入れた後に `languages/*.yaml` の ja が空で残ったエントリ。
- **出力**:
  - `data/languages/{species,items,moves,abilities}.yaml` への **日本語名 ja**（PokeAPI `names`・ja-Hrkt 優先・
    ADR 0032）の **append / 既存尊重**転記（技 / 特性は en も PokeAPI から補完しうる）。メガ名 ja・タイプ名は
    PokeAPI に無いため対象外（skill 著述 / Serebii 速報）。
  - `pnpm generate:data` が specs↔languages の id 集合不一致（ja/en 欠落）なく緑（生成段 tsc が欠落を弾く・ADR 0035）。

## 手順

### 1. 対象 id を確定する

`languages/*.yaml` に **ja（技 / 特性は ja/en）が欠けている** species slug・item id・move id・ability id を確定する
（showdown 経路で構造データを入れた後に名前が空のエントリ、または `generate:data` の id 集合不一致エラーが列挙する
名前欠落 id）。

### 2. PokeAPI raw を取得する（fetch:ja-names）

**`pnpm fetch:ja-names`** で、`languages/*.yaml` の ja/en が欠けるエントリだけの PokeAPI `names` を
（種族 = `pokemon-species` / 持ち物 = `item` / 技 = `move` / 特性 = `ability`）`data/raw`（gitignore キャッシュ）へ
**best-effort 取得**する（404 等は skip）。Champions 固有メガストーン等は PokeAPI 非存在（404）になるが正常で、ja は
Serebii 速報 / 手入力で補う。raw 存在の担保は本 skill の責務で、`sync:ja-names` は raw 不在なら当該エントリを
スキップするだけ（存在チェック・取得誘導を持たない＝責務の二重化を避ける）。

### 3. languages へ転記する（sync:ja-names）

**`pnpm sync:ja-names`** で raw `names` → `languages/*.yaml` の **日本語名 ja**（技 / 特性は ja/en）を転記する
（**append / 既存尊重**・未設定フィールドのみ raw 由来値で埋め、既存の著述 / 速報値は上書きせず conflict 提示・
ADR 0032 / 0035）。

### 4. generate:data で緑を確認する（委譲）

**`pnpm generate:data`**（specs / languages / per-reg YAML → TS 変換・合成・**raw 非依存**・id 集合不一致は生成段
エラー・ADR 0035）で緑を確認する。さらに検証まで通すなら [`verify`](../verify/SKILL.md)（`pnpm verify`）。
**機械ゲートは再実装せず委譲**する（[[skill-authoring]]）。

## Gotchas

- **責務は PokeAPI の ja のみ**: 本 skill は名前 SoT（languages）の **日本語名 ja**（技 / 特性は en も）だけを取り込む。
  構造データ（種族値 / タイプ / 特性 id / 図鑑番号 / category）と en の正は **pokemon-showdown 経路**（`showdown:*`）、
  Champions 解禁（roster / 技 / メガ）は Serebii 速報経路の責務で、本 skill では著述しない（[[data-pipeline]]）。
- **append / 既存尊重を壊さない**: `sync:ja-names` は未設定フィールドのみ埋め、既存の著述 / 速報値を上書きしない。
  conflict が出たら値の出自を確認して解消する（生成物を直さず languages を直す）。
- **メガ名 ja・タイプ名は対象外**: PokeAPI に無いため本 skill では埋まらない（skill 著述 / Serebii 速報で補う）。
- **specs↔languages の id 対応**: 構造（specs）に id があるのに名前（languages）の ja/en が欠けると `generate.ts` が
  生成段で弾く・ADR 0035。showdown 経路で specs / en を入れたら本 skill で ja を揃える。
- **生成物を手編集しない**: `src/generated/**` は触らず languages を直して再生成する（[[data-pipeline]]）。
- **機械ゲートを再実装しない**: 検証は `generate:data` / `verify`、生成データの妥当性は `pokemon-data-reviewer`
  agent（[[skill-authoring]]）。
- **cross-agent**: 本 skill は npm script の逐次実行のみで Claude 固有機構（Workflow）を持たない。Codex / 素の CLI
  でも `fetch:ja-names` → `sync:ja-names` → `generate:data` を逐次実行で完結する（[[cross-agent]]）。

## 関連

- データ構造・SoT 正本: [[data-pipeline]] / [`02-data-model-redesign/OVERVIEW.md`](../../../docs/roadmap/completed/02-data-model-redesign/OVERVIEW.md)。
- 決定の「なぜ」: [ADR 0032](../../../docs/adr/archive/0032-japanese-name-source-pokeapi-names.md)（日本語名 ja は PokeAPI names）/
  [ADR 0035](../../../docs/adr/0035-specs-languages-layout-redesign.md)（構造 = specs / 名前 = languages の 3 軸直交）。
- 構造データ取得（pokemon-showdown 経路）: `showdown:species` / `showdown:moves` / `showdown:items` / `showdown:abilities` / `showdown:mega`。
- 検証 / 生成: [`verify`](../verify/SKILL.md) / `pnpm generate:data`。
- 生成データ妥当性: `pokemon-data-reviewer` agent。
- skill 作成方針・cross-agent: [[skill-authoring]] / [[cross-agent]]。
