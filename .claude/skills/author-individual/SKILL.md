---
name: author-individual
description: >-
  育成済み個体の YAML を雛形から起こし、`check:individual`（覚えない技 / 使えない特性 / 性格 up=down /
  ポイント 66・各32）で tsc 検証して仕上げる手順 skill。「個体を作りたい」「ポケモンの育成データを書いて」
  「この個体 YAML を検証して」「author-individual <species>」「team/individuals に個体を追加して」
  「覚えない技が無いか確認して」と言われたとき、または個体ファイルを新規作成 / 修正してブラッシュアップ
  したいときに使う。種族に応じて特性・技・持ち物を `SpeciesDex[S]` の許容値に絞り、合計66 を満たす雛形を
  提示してから `check:individual` で弾く。パーティ全体の整合・弱点点検は `review-party` を使う。
allowed-tools: Bash(pnpm *), Bash(node src/cli/*), Read, Write, Edit
---

# author-individual — 個体 YAML を雛形から起こして tsc 検証する

pokeform の利用者（コーディングエージェント / 人間）が、**1 体の育成済み個体 YAML** を書き起こす際の
入口。種族の許容値（特性・技・持ち物）と能力ポイント規約（合計66・各 ≤32・[[game-spec]]）に沿った
雛形を提示し、`pokeform check:individual` で**覚えない技・使えない特性・性格 up=down・ポイント違反**を
tsc に弾かせる。検証ロジックは CLI / codegen / 型に委譲し、本 skill は**雛形提示と検証実行・要約**に
徹する（機械ゲートを再実装しない・[[skill-authoring]]）。

## 役割

- **雛形を出す**: 対象種族 `S` の `SpeciesDex[S]`（`abilities` / `moves` / `items` / `regulations`）を
  `data/generated/species.ts` から確認し、許容値の範囲で個体 YAML 雛形を提示する。
- **検証する**: `pokeform check:individual <path>` を実行し、終了コードと診断（ブランド型名 + YAML 行）を
  要約する。非0なら最初の違反を指摘し修正案を出す。
- **言語を尊重する**: ファイル先頭の `lang: ja|en` 宣言に従う（既定 ja）。日本語ファイルは名称・能力名を
  日本語で、英語ファイルは安定 ID（kebab 英名 / StatKey）で書く（[[cli-and-io]] / ADR 0014）。

## 入力 / 出力

- **入力**: 対象種族（日本語名 or 英名 ID）。任意で出力パス（既定 `team/individuals/<species>.yaml`）・
  性格 / 技 / 持ち物の希望。
- **出力**: 妥当な個体 YAML（`check:individual` が 0 終了）。違反が残る場合は診断の要約と修正案。

## 手順

1. **種族確認**: `data/generated/species.ts` で対象種族の `abilities` / `moves` / `items` / `regulations`
   を読む（存在しなければ `data/champions/catalog/*.yaml` への追加が必要＝scope 外として案内）。
2. **雛形作成**: 下記の形で YAML を `Write`。`points` は合計 **66**・各 **≤32**（[[game-spec]]）。`nature` の
   `up` と `down` は別能力（同一は型エラー）。`ability` / `moves` / `item` は種族の許容値から選ぶ。
3. **検証**: `pnpm pokeform check:individual <path>`（または `node src/cli/index.ts check:individual <path>`）
   を実行。0 終了なら完了。非0なら診断（`MoveNotLearnedBy<...>` / `AbilityNotAvailable<...>` /
   `point total must be 66 ...` 等 + YAML 行）を要約し、許容値・合計から外れた項目を直して再実行する。

### 個体 YAML の形（英語ファイル例）

```yaml
lang: en
species: garchomp
nature: { up: speed, down: spAttack }   # up と down は別能力
ability: rough-skin                     # SpeciesDex[species].abilities から
item: rocky-helmet                      # SpeciesDex[species].items（"any" は任意の ItemId）
points: { hp: 2, attack: 32, defense: 0, spAttack: 0, spDefense: 0, speed: 32 }  # 合計66・各≤32
moves: [earthquake, dragon-claw, stone-edge, swords-dance]  # SpeciesDex[species].moves から
```

日本語ファイルは `lang: ja` とし、`species`/`ability`/`item`/`moves` を日本語名、`nature`/`points` の
能力名を `HP`/`こうげき`/`ぼうぎょ`/`とくこう`/`とくぼう`/`すばやさ` で書く（codegen が ID 正規化する）。

## Gotchas

- **検証は tsc のみ**: 妥当性は `check:individual`（codegen→`tsc --noEmit`）が唯一の判定。本 skill で値の
  正否を独自判定しない（[[tsc-verification]] / ADR 0010）。合計66 は codegen が算出して型に埋める。
- **ポイント合計は厳密に 66**: 65 や 67 でも非0終了する。各能力は 0..32。
- **性格 up=down 不可**: `NatureSpec` が型レベルで別能力を強制する。
- **覚えない技 / 使えない特性**: `SpeciesDex[S]` に無いものはブランド型名 + 行番号で弾かれる。technical
  詳細は [[tsc-verification]]、ゲーム数値は [[game-spec]]。
- **未知種族 / 未 vendor 技**: `catalog/*.yaml` 未登録の種族・技は ID 解決できない。データ拡張は
  `fetch:data`→`generate:data` の範囲（[[data-pipeline]]）であり本 skill の外。
- **パーティ単位の点検は別 skill**: 同種族重複・未解禁混入・弱点集中・技範囲は `review-party` が担う。

## 関連

- 検証コマンド: `pokeform check:individual` / `compile` / `typecheck`（`src/cli` / `src/codegen`）。
- 型: `src/types/individual.ts`（`IndividualSpec<S>` / ブランドエラー型）。
- 規約: [[tsc-verification]] / [[game-spec]] / [[cli-and-io]] / [[type-conventions]]。
- パーティ点検: `review-party` skill。skill 作成方針: [[skill-authoring]] / 配置: [[cross-agent]]。
