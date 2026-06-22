---
name: author-individual
description: >-
  育成済み個体の YAML を雛形から起こし、`check:individual`（覚えない技 / 使えない特性 / 性格 up=down /
  ポイント 66・各32）で tsc 検証して仕上げる手順 skill。「個体を作りたい」「ポケモンの育成データを書いて」
  「この個体 YAML を検証して」「author-individual <species>」「team/individuals に個体を追加して」
  「覚えない技が無いか確認して」と言われたとき、または個体ファイルを新規作成 / 修正してブラッシュアップ
  したいときに使う。対象レギュレーションを `regulations: [<id>...]` で宣言し、種族に応じて特性・技・持ち物を
  per-reg 種族 dex の許容値に絞り、合計66 を満たす雛形を提示してから `check:individual` で弾く。パーティ全体の
  整合・弱点点検は `review-party` を使う。
allowed-tools: Bash(pnpm *), Bash(node src/cli/*), Read, Write, Edit
---

# author-individual — 個体 YAML を雛形から起こして tsc 検証する

pokeform の利用者（コーディングエージェント / 人間）が、**1 体の育成済み個体 YAML** を書き起こす際の
入口。種族の許容値（特性・技・持ち物）と能力ポイント規約（合計66・各 ≤32・[[game-spec]]）に沿った雛形を
提示し、`pokeform check:individual` の tsc 検証で違反を弾かせる。検証ロジックは CLI / codegen / 型に委譲し、
本 skill は**雛形提示と検証実行・要約**に徹する（機械ゲートを再実装しない・[[skill-authoring]]）。

## 役割

- **雛形を出す** — per-reg 種族 dex の許容値から `regulations` 宣言付き YAML 雛形を提示（手順 1-2）。
- **検証する** — `check:individual` を実行し終了コードと診断を要約、非0なら最初の違反と修正案を出す（手順 3）。
- **言語を尊重する** — ファイル先頭の `lang: ja|en` に従う（既定 ja・日本語は名称を日本語、英語は安定 ID・
  [[cli-and-io]] / ADR 0014）。

## 入力 / 出力

- **入力**: 対象種族（日本語名 or 英名 ID）。任意で出力パス（既定 `team/individuals/<species>.yaml`）・
  性格 / 技 / 持ち物の希望。
- **出力**: 妥当な個体 YAML（`check:individual` が 0 終了）。違反が残る場合は診断の要約と修正案。

## 手順

1. **レギュ + 種族確認**: 対象レギュ `R` の `src/generated/champions/<R>/index.ts` の `speciesDex` で対象種族の
   `abilities` / `moves` / `items` を読む（その種族が `R` の roster に無ければ未解禁＝別レギュか scope 外
   として案内）。複数レギュ対象なら**全レギュで合法**な値を選ぶ（交差）。
2. **雛形作成**: 下記の形で YAML を `Write`。`regulations: [<id>...]` に対象レギュ（0〜N）を宣言する。
   `points` は合計 **66**・各 **≤32**（[[game-spec]]）。`nature` の `up` と `down` は別能力（同一は型エラー）。
   `ability` / `moves` / `item` は宣言した全レギュの許容値から選ぶ。
3. **検証**: `pnpm pokeform check:individual <path>`（または `node src/cli/index.ts check:individual <path>`）
   を実行。0 終了なら完了。非0なら診断（`MoveNotLearnedBy<...>` / `AbilityNotAvailable<...>` /
   `point total must be 66 ...` 等 + YAML 行）を要約し、許容値・合計から外れた項目を直して再実行する。

### 個体 YAML の形（英語ファイル例）

```yaml
lang: en
species: garchomp
regulations: [champions-m-a, champions-m-b]   # 対象レギュ（0〜N）。宣言した全レギュで合法なら通る
nature: { up: speed, down: spAttack }   # up と down は別能力
ability: rough-skin                     # speciesDex[species].abilities（per-reg）から
item: rocky-helmet                      # speciesDex[species].items（"any" は任意の ItemId）
points: { hp: 2, attack: 32, defense: 0, spAttack: 0, spDefense: 0, speed: 32 }  # 合計66・各≤32
moves: [earthquake, dragon-claw, stone-edge, swords-dance]  # speciesDex[species].moves（per-reg）から
```

`regulations: []`（空）は**どのレギュでも未解禁**の無制約デモ個体（fan-out なし）。通常は 1 つ以上宣言する。

日本語ファイルは `lang: ja` とし、`species`/`ability`/`item`/`moves` を日本語名、`nature`/`points` の
能力名を `HP`/`こうげき`/`ぼうぎょ`/`とくこう`/`とくぼう`/`すばやさ` で書く（codegen が ID 正規化する）。

## Gotchas

- **検証は tsc のみ**: 妥当性は `check:individual`（codegen→`tsc --noEmit`）が唯一の判定。本 skill で値の
  正否を独自判定しない（[[tsc-verification]] / ADR 0010）。合計66 は codegen が算出して型に埋める。
- **ポイント合計は厳密に 66**: 65 や 67 でも非0終了する。各能力は 0..32。
- **性格 up=down 不可**: `NatureSpec` が型レベルで別能力を強制する。
- **覚えない技 / 使えない特性**: 宣言レギュ `R` の `speciesDex[S]` に無いものはブランド型名（`R` 入り・
  例 `MoveNotLearnedBy<"champions-m-a","garchomp","surf">`）+ 行番号で弾かれる。複数レギュ宣言時は**各レギュ
  分**の診断が出る（fan-out・[[cli-and-io]]）。technical 詳細は [[tsc-verification]]、ゲーム数値は [[game-spec]]。
- **未知種族 / 未 vendor 技**: `*-specs.yaml` / `languages/*.yaml` 未登録の種族・技は ID 解決できない。データ拡張は
  `update-catalog` / `survey-regulation`→`generate:data` の範囲（[[data-pipeline]]）であり本 skill の外。
- **パーティ単位の点検は別 skill**: 同種族重複・未解禁混入・弱点集中・技範囲は `review-party` が担う。

## 関連

- 検証コマンド: `pokeform check:individual` / `compile` / `typecheck`（`src/cli` / `src/codegen`）。
- 型: `src/types/individual.ts`（`IndividualSpec<R,S>` / reg-aware ブランドエラー型）。
- 規約: [[tsc-verification]] / [[game-spec]] / [[cli-and-io]] / [[type-conventions]]。
- パーティ点検: `review-party` skill。skill 作成方針: [[skill-authoring]] / 配置: [[cross-agent]]。
