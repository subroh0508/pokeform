---
name: author-static-data
description: >-
  reg 非依存の**全件名辞書**（`data/languages/*.yaml`）を PokeAPI 由来の全件名（ja/en）で満たす手順 skill。
  「全件名を languages へ入れて」「名前辞書を埋めて」「ja/en 名が欠けている種族 / 持ち物 / 技 / 特性 / タイプを
  埋めて」「PokeAPI の names を全件取り込んで」「pokeapi-names workflow を回して languages を更新して」
  「languages の空骨格を scaffold して」「メガの ja 名を手作業で足して」「author-static-data <id...>」と言われた
  とき、または showdown 経路で解禁データを入れた後に名前が空のエントリを補うときに使う。取得 + 整形 + 書き込み +
  PR は **GitHub Actions `pokeapi-names.yml`**（全件列挙）が行い、本 skill はその dispatch → 生成 PR のドライブ →
  PokeAPI 非存在分（メガ ja 等）の手作業追加 commit → verify → merge をドライブする。構造データ（種族値 / タイプ /
  特性 id / 図鑑番号 / category）の取得は pokemon-showdown 経路（`showdown:*`）、Champions 解禁データ（roster / 技 /
  メガ）の取得は Serebii 速報 / showdown 経路の責務で、こちらは **reg 非依存の名前辞書**のみを担う。生成 / 検証は
  `generate:data` / `verify` に委譲し機械ゲートは再実装しない。
allowed-tools: Bash(pnpm *), Bash(node scripts/*), Bash(node src/cli/*), Bash(gh *), Read, Write, Edit
---

# author-static-data — reg 非依存の全件名辞書（languages）を整備する

`data/languages/*.yaml`（名前 SoT・ゲーム非依存）を **PokeAPI 由来の全件名（ja/en）で満たす** skill。
`author-regulation-data`（reg 依存の解禁データ）と対になり、こちらは **reg 非依存の「名前辞書」**を担当する。
languages は未解禁を含む**全件名辞書**で（ADR 0041）、`species` / `moves` / `abilities` / `types` を
PokeAPI から全件取得し、`mega` は PokeAPI 非対象ゆえ **en=showdown / ja=手作業**で補う。**`items` だけは list 全件でなく
item-category whitelist の union で列挙し対戦持ち物 ~270 件に絞る**（ADR 0042・詳細は [[data-pipeline]]）。

> データ構造・SoT の正本は [[data-pipeline]]（specs / languages / 取得 → 転記 → 合成 / 名前の取得元分担表）。
> languages を全件名辞書化し generate を superset 判定へ緩める「なぜ」は
> [ADR 0041](../../../docs/adr/0041-languages-full-name-dictionary.md)、3 軸直交・名前 SoT を languages へ一本化
> する「なぜ」は [ADR 0035](../../../docs/adr/0035-specs-languages-layout-redesign.md)。日本語名 ja の取得元を
> PokeAPI names にする「なぜ」は [ADR 0032](../../../docs/adr/archive/0032-japanese-name-source-pokeapi-names.md)。
> 本 SKILL.md は取り込み手順に専念し、SoT / 数式 / 型パターンを二重記述しない。

## なぜこの skill があるか

名前は**取得元で分担**する（取得元・更新頻度・情報源が異なるため・[[data-pipeline]]）: `species` / `items` /
`moves` / `abilities` / `types` の ja/en は **PokeAPI `names`** から全件取得（本 skill・reg 非依存）、`mega` の
en は **showdown**（per-reg 取得 = `author-regulation-data`）・ja は**手作業**。全件名を人手で 1 件ずつ入れると
漏れ・非決定になるため、取得 + 整形 + 書き込み + PR は **GitHub Actions `pokeapi-names.yml`**（全件列挙・
`showdown-sync.yml` / `serebii-bulletin.yml` と同型）に機械化し、本 skill はその **dispatch と生成 PR のドライブ**
（手作業 gap の補填含む）に専念する。

## 入力 / 出力

- **入力**: 全件名辞書を満たしたい / 名前が空のエントリを補いたい要求。多くは showdown / Serebii 経路で解禁
  データ（specs / per-reg / en）を入れた後に `languages/*.yaml` の名前が空で残ったエントリ、または全件投入。
- **出力**:
  - `data/languages/{species,items,moves,abilities,types}.yaml` への PokeAPI 由来**全件名（ja/en）**の
    append/既存尊重転記（`pokeapi-names.yml` が実行）。
  - `data/languages/mega.yaml` への**手作業**メガ名（ja・必要なら en）追加 commit（PokeAPI 非対象）。
  - `data/languages/*.yaml` の**空骨格 scaffold**（`data/` 完全削除からの復元時・`mega.yaml` 含む 6 ファイル）。
  - `pnpm generate:data` / `pnpm verify` が緑（生成段 tsc が spec の名前欠落・ja/en 欠けを弾く・余剰名は許容・ADR 0041）。

## 手順

### 1. workflow を dispatch する（全件取得 → 転記 → PR）

**`gh workflow run pokeapi-names.yml`**（`workflow_dispatch`・regulation 入力なし＝名前は reg 非依存）で、
PokeAPI list endpoint の全件列挙（**総数 `count` と受信 id 数の一致を fail-fast** し全件受信を保証する = 差分・
冪等判定の前提。200 応答でも `limit` cap で `results` が不足しうるため件数照合を初版から入れる。**ただし `items` は
list 全件でなく item-category whitelist の union で列挙し、category endpoint は count/limit ページングを持たないため
件数照合でなく各 cat 404 でない + union 空でないを fail-fast にする**・ADR 0042）→
`fetch:ja-names`（未記録 / 欠落 id のみ best-effort 取得・差分・冪等）→
`sync:ja-names`（raw → languages へ ja/en を append/既存尊重転記）→ `check:yaml-style` / `generate:data` /
`pnpm verify` → `data:names` ラベルの languages 更新 PR 作成、までを CI 上で回す。以降の再実行は**差分**（未記録
id）だけを追加する。ローカルで確認するなら `pnpm fetch:ja-names` → `pnpm sync:ja-names` を逐次実行する（同一挙動）。

### 2. 生成 PR をドライブする

立った PR を `gh pr view` で確認し、CI（`pnpm verify`）が緑・差分が意図どおり（未解禁名の追加のみ）かをレビュー
する。生成データの妥当性（名前の正しさ）は `pokemon-data-reviewer` agent に委ねる（本 skill は機械ゲートを再実装
しない・[[skill-authoring]]）。

### 3. PokeAPI 非存在分を手作業で追加 commit する（gap 補填）

**メガ名 ja**（および PokeAPI に無い名前）は全件取得の対象外なので、生成 PR のブランチへ**手作業で追加
commit**する。`data/languages/mega.yaml` の該当 id に **block スタイル**（`check:yaml-style` 通過・flow 禁止・
[[data-pipeline]]）で `ja:`（必要なら `en:`）を書き足す:

```yaml
mega:
  garchomp-mega:
    ja: メガガブリアス
    en: Mega Garchomp
```

メガ en は showdown（`author-regulation-data` の per-reg 取得）が正だが、手元で先に補うなら Serebii 表示名の
kebab（`Mega Garchomp` → `garchomp-mega`・[[data-pipeline]] のメガ id 正規化）に整合させる。追加後 `pnpm generate:data`
→ `pnpm verify` で緑を確認して commit する（既存値は上書きしない＝ append/既存尊重を手作業でも守る）。

### 4. scaffold（`data/` 完全削除からの復元時のみ）

`data/languages/` が無い状態から起こすときは、6 ファイル（`species` / `items` / `moves` / `abilities` / `types` /
`mega`）の**空骨格**を block スタイルで scaffold する（各ファイルは先頭コメント + `<mapKey>:` の空マップ）。以降は
手順 1 の workflow が `species` 〜 `types` を全件で満たし、`mega` は手順 3 で手入力する。`rules.yaml` /
`type-specs.yaml`（`data/champions`）は本 skill の対象外の静的コミットで、削除時は別途手作業復元する（[[data-pipeline]]）。

### 5. generate:data / verify で緑を確認する（委譲）

**`pnpm generate:data`**（specs / languages / per-reg YAML → TS 変換・合成・**raw 非依存**・spec の名前欠落は
生成段エラー・余剰名は許容・ADR 0041）で緑を確認する。検証まで通すなら [`verify`](../verify/SKILL.md)
（`pnpm verify`）。**機械ゲートは再実装せず委譲**する（[[skill-authoring]]）。

## Gotchas

- **責務は reg 非依存の名前辞書のみ**: 本 skill は名前 SoT（languages）の全件名（ja/en）だけを担う。構造データ
  （種族値 / タイプ / 特性 id / 図鑑番号 / category）と en の正は **pokemon-showdown 経路**（`showdown:*`）、
  Champions 解禁（roster / 技 / メガ）は Serebii 速報 / showdown 経路の責務（[[data-pipeline]]）。
- **append/既存尊重を壊さない**: `sync:ja-names` は未設定フィールドのみ埋め、既存の en（showdown 正）/ 著述値を
  上書きしない。conflict が出たら値の出自を確認して解消する（生成物を直さず languages を直す）。手作業 gap 補填も
  既存値を上書きしない。
- **mega は PokeAPI 対象外**: `languages/mega.yaml` の名前は workflow では埋まらない（en=showdown / ja=手作業）。
  本 skill が scaffold と手作業 gap commit を担う。
- **PokeAPI が ja を持たない id は捏造せず skip**: list に含まれても ja 未収録の id（GO 専用特性
  `is_main_series:false` / Legends Arceus 未ローカライズ球 `la*-ball` / 未ローカライズ新特性 等）は `NameEntry` の
  ja/en 必須と衝突するため **append せず skip**（推測 ja を発明しない = data 信頼性を守る・`sync:ja-names` は
  `skippedCount` を warn で可視化する）。spec が参照して ja が要る id だけ手作業 ja で補う。
- **「全件」の基準は PokeAPI list 列挙**（items を除く）: 全件辞書の母集合は PokeAPI の list endpoint 列挙で、
  pokeform 固有フォーム（`rotom-wash` 等・PokeAPI `pokemon-species` の外）は対象外。live count（例 species 1025）と
  languages 件数（1026）が僅差になりうるのは仕様どおりで、「壊れたデータ」ではない（`★XxxNNN` 等の未翻訳カタログ
  コードも PokeAPI の実データで正）。**`items` の母集合は list 全件でなく item-category whitelist の union**（対戦
  持ち物 ~270 件・ADR 0042）で、ボール / 回復薬 / TM / 料理素材等が意図的に落ちるのは仕様どおり（whitelist カテゴリの
  正本は [[data-pipeline]]）。
- **全件辞書は superset を許容**: languages は spec を持たない未解禁名（orphan）も持つ（reg 非依存の全件辞書・
  ADR 0041）。generate は「spec に名前がある / ja・en 完備」だけを保護し、余剰 languages 名は 0 終了で許容する。
  逆に spec に対応する名前が欠ける / ja・en 欠けは非0終了で弾く。
- **生成物を手編集しない**: `src/generated/**` は触らず languages を直して再生成する（[[data-pipeline]]）。
- **機械ゲートを再実装しない**: 検証は `generate:data` / `verify`、生成データの妥当性は `pokemon-data-reviewer`
  agent（[[skill-authoring]]）。
- **cross-agent**: workflow dispatch は `gh workflow run`、ローカルは `fetch:ja-names` → `sync:ja-names` の逐次実行で
  完結する。Claude 固有機構（Workflow）を持たず Codex / 素の CLI でも同手順で回る（[[cross-agent]]）。

## 関連

- データ構造・SoT 正本: [[data-pipeline]]（名前の取得元分担表・全件名辞書 / generate superset）。
- 決定の「なぜ」: [ADR 0041](../../../docs/adr/0041-languages-full-name-dictionary.md)（languages 全件名辞書・
  generate superset・PokeAPI 名前取得 workflow）/ [ADR 0035](../../../docs/adr/0035-specs-languages-layout-redesign.md)
  （構造 = specs / 名前 = languages の 3 軸直交）/
  [ADR 0032](../../../docs/adr/archive/0032-japanese-name-source-pokeapi-names.md)（日本語名 ja は PokeAPI names）。
- 名前取得 workflow: [`.github/workflows/pokeapi-names.yml`](../../../.github/workflows/pokeapi-names.yml)。
- 構造 / 解禁データ取得: `showdown:species` / `showdown:moves` / `showdown:items` / `showdown:abilities` / `showdown:mega`。
- 検証 / 生成: [`verify`](../verify/SKILL.md) / `pnpm generate:data`。
- 生成データ妥当性: `pokemon-data-reviewer` agent。
- skill 作成方針・cross-agent: [[skill-authoring]] / [[cross-agent]]。
