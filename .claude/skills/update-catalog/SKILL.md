---
name: update-catalog
description: >-
  PokeAPI 由来の reg 非依存データ（構造データ = 種族値 / タイプ / 特性 id / 図鑑番号 / 持ち物 category、
  日本語名 ja、技 / 特性の名前補完）を `data/champions/catalog/*.yaml` へ取り込む手順 skill。実体は
  新規 / 更新 id について `pnpm fetch:data`（PokeAPI raw 取得・`data/raw` キャッシュ）→ `pnpm materialize`
  （raw → catalog 転記・append / 既存尊重）+ 種族の特性 id を `abilities.yaml` へ集約 → `pnpm generate:data`
  緑確認。名前 / 構造データ SoT は catalog YAML（ADR 0027 / 0032）。「catalog を更新したい」「PokeAPI の
  構造データ（種族値 / タイプ / 特性 / 図鑑番号 / category）を catalog に取り込んで」「日本語名 ja を catalog へ
  入れて」「新しい種族 / 持ち物を catalog に追加して」「update-catalog <id...>」「materialize で構造データを
  埋めて」「特性 id を catalog に集約して」と言われたとき、または regulations 取得（`survey-regulation`）の
  catalog 更新チェックポイントで未登録 id を catalog へ補うときに使う。Champions 解禁データ（roster / 技 /
  メガ）の取得は `survey-regulation`（こちらは PokeAPI 構造データ + 名前の取り込みが責務）。生成 / 検証は
  `generate:data` / `verify` に委譲し機械ゲートは再実装しない。
allowed-tools: Bash(pnpm *), Bash(node scripts/*), Bash(node src/cli/*), Read, Write, Edit
---

# update-catalog — PokeAPI 構造データ・日本語名を catalog へ取り込む

`data/champions/catalog/*.yaml` の **reg / ゲーム非依存データ**（構造データ = 種族値 / タイプ / 特性 id /
図鑑番号 / 持ち物 category、日本語名 ja、技 / 特性の名前補完）を **PokeAPI vendor 由来で取り込む**手順を定型化する。
これは Champions レギュレーションに依存しない「種族や持ち物そのものの事実」であり、取得元・更新頻度・情報源が
Champions 解禁データ（Serebii 由来）とは異なるため、**取得スキルを取得元で分離する**（regulations 取得は
[`survey-regulation`](../survey-regulation/SKILL.md)）。

> データ構造・SoT の正本は [[data-pipeline]]（catalog / 取得 → 転記 → 合成の三段）。構造データ SoT を catalog へ
> 移し generate を raw 非依存にする「なぜ」は [ADR 0027](../../../docs/adr/0027-structural-data-catalog-sot.md)、
> 日本語名 ja の取得元を PokeAPI names にする「なぜ」は [ADR 0032](../../../docs/adr/archive/0032-japanese-name-source-pokeapi-names.md)。
> 本 SKILL.md は取り込み手順に専念し、SoT / 数式 / 型パターンを二重記述しない。

## なぜこの skill があるか

catalog は **2 系統の情報源**で埋まる: (a) **PokeAPI vendor**（構造データ + 日本語名 ja・機械転記）と (b)
**Serebii**（Champions 解禁・技メタ・skill 著述）。両者は取得元も更新頻度も異なる（PokeAPI 構造データは Champions
非依存で安定・Serebii 解禁データはレギュ更新ごとに変わる）。1 skill に混ぜると責務が肥大し、どちらを更新すべきかの
判断がぶれる。本 skill は **(a) PokeAPI 系統のみ**を担い、Champions 解禁（b）は [`survey-regulation`](../survey-regulation/SKILL.md)
が担う。境界は明快で、**名前 + 構造データ = catalog（本 skill）/ 解禁 + 技メタ = regulations（survey-regulation）**
（技メタを per-game regulations へ移した [ADR 0034](../../../docs/adr/archive/0034-move-meta-per-game-sot.md) で境界が確定した）。

## 入力 / 出力

- **入力**: catalog の新規 / 更新が要るエンティティ id（種族 slug / 持ち物 id）。`survey-regulation` の
  catalog 更新チェックポイントから渡される「未登録 id の列挙」もここで受ける。
- **出力**:
  - `data/champions/catalog/{species,items}.yaml` への構造データ（`dex` / `types` / `stats` / `abilities` /
    `category`）と**日本語名 ja**（PokeAPI `names`・ja-Hrkt 優先・ADR 0032）の **append / 既存尊重**転記。
  - `data/champions/catalog/abilities.yaml` への**特性 id → 名前の集約**（種族が参照する特性 id が未登録だと
    `generate.ts` が throw するため・下記）。
  - `pnpm generate:data` が catalog 参照切れ / 構造データ欠落なく緑（生成段 tsc が欠落を弾く・ADR 0027）。

## 手順

### 1. 対象 id を確定する

catalog に**新規追加 / 更新が要る** species slug・item id を確定する。典型的には:

- **新規種族 / 持ち物の投入**（全種族投入など）で catalog に未登録の id。
- **`survey-regulation` の catalog 更新チェックポイント**（`check:regulation` の参照整合エラーが「未登録の種族 /
  持ち物」を列挙）で渡される不足 id。

### 2. PokeAPI raw を取得する（fetch:data）

**`pnpm fetch:data`** で対象 slug の PokeAPI raw（`pokemon` / `pokemon-species` / `item` / `names` を含む）を
`data/raw`（gitignore キャッシュ）へ取得する。技 / 特性は日英名が欠けるエントリのみ `move` / `ability` を
best-effort 取得して ja（特性は en も）の補完源にする（[[data-pipeline]]）。**raw 存在の担保は本 skill の責務**で、
`materialize` は raw 不在なら fail-fast するだけ（存在チェック・`fetch:data` 誘導を持たない＝責務の二重化を避ける・
ADR 0027）。

### 3. catalog へ転記する（materialize + 特性 id 集約）

**`pnpm materialize`** で raw → catalog の構造データ（種族値 / タイプ / 特性 id / 図鑑番号 / 持ち物 category）と
**日本語名 ja** を転記する（**append / 既存尊重**・未設定フィールドのみ raw 由来値で埋め、既存の skill 著述値は
上書きせず conflict 提示・ADR 0027 / 0032）。

> **特性の追記漏れ = 生成エラー**: catalog に無い特性 id を種族が参照すると `generate.ts` が throw する。
> `materialize` 後に `species.yaml` の `abilities`（または `data/raw/pokemon/<slug>.json` の
> `abilities[].ability.name`）の id を **`abilities.yaml` へ id → 名前で集約**してから手順 4 へ進む。

### 4. generate:data で緑を確認する（委譲）

**`pnpm generate:data`**（catalog YAML → TS 変換・**raw 非依存**・catalog 参照切れ / 構造データ欠落は生成段
エラー・ADR 0027）で緑を確認する。さらに検証まで通すなら [`verify`](../verify/SKILL.md)（`pnpm verify`）。
**機械ゲートは再実装せず委譲**する（[[skill-authoring]]）。

## Gotchas

- **責務は PokeAPI 系統のみ**: 本 skill は構造データ + 名前（reg 非依存）だけを catalog へ取り込む。Champions
  解禁（roster / per-species `moves` / 技メタ / メガ）は [`survey-regulation`](../survey-regulation/SKILL.md) の
  責務で、本 skill では著述しない（取得元 = PokeAPI / Serebii で分離・[[data-pipeline]]）。
- **append / 既存尊重を壊さない**: `materialize` は未設定フィールドのみ埋め、既存の skill 著述値（Champions 実態に
  合わせた手修正）を上書きしない。conflict が出たら値の出自を確認して解消する（生成物を直さず catalog を直す）。
- **特性 id 集約を忘れない**: 種族の `abilities` が参照する特性 id を `abilities.yaml` へ集約しないと `generate.ts`
  が throw する（手順 3 の補足）。大量投入時の取りこぼしが最も多い箇所。
- **生成物を手編集しない**: `data/generated/**` は触らず catalog を直して再生成する（[[data-pipeline]]）。
- **機械ゲートを再実装しない**: 検証は `generate:data` / `verify`、生成データの妥当性は `pokemon-data-reviewer`
  agent（[[skill-authoring]]）。
- **cross-agent**: 本 skill は npm script の逐次実行のみで Claude 固有機構（Workflow）を持たない。Codex / 素の CLI
  でも `fetch:data` → `materialize` → 特性集約 → `generate:data` を逐次実行で完結する（[[cross-agent]]）。

## 関連

- データ構造・SoT 正本: [[data-pipeline]] / [`02-data-model-redesign/OVERVIEW.md`](../../../docs/plan/02-data-model-redesign/OVERVIEW.md)。
- 決定の「なぜ」: [ADR 0027](../../../docs/adr/0027-structural-data-catalog-sot.md)（構造データ SoT を catalog へ・`materialize` 新設）/
  [ADR 0032](../../../docs/adr/archive/0032-japanese-name-source-pokeapi-names.md)（日本語名 ja は PokeAPI names）/
  [ADR 0034](../../../docs/adr/archive/0034-move-meta-per-game-sot.md)（名前 = catalog / 技メタ = per-game regulations の境界）。
- regulations 取得（Champions 解禁・Serebii）: [`survey-regulation`](../survey-regulation/SKILL.md)。
- 検証 / 生成: [`verify`](../verify/SKILL.md) / `pnpm generate:data`。
- 生成データ妥当性: `pokemon-data-reviewer` agent。
- skill 作成方針・cross-agent: [[skill-authoring]] / [[cross-agent]]。
