---
id: 0027
status: Superseded by ADR-0039
date: 2026-06-13
---

# 0027. 構造データ（種族値 / タイプ / 特性 / 図鑑番号 / category）の SoT を catalog YAML へ移し generate を raw 非依存にする

## Context

[ADR 0012](./0012-vendor-pokeapi-data.md) の vendor 方式では、`generate.ts` が種族値・タイプ・特性 id・
全国図鑑番号・持ち物 category といった構造データを `data/raw`（PokeAPI キャッシュ）から直読していた。
[ADR 0025](./0025-catalog-name-and-type-chart-sot.md) で名前 / タイプ相性の SoT を catalog YAML へ、
[ADR 0026](./0026-pokeapi-not-champions-legality-source.md) で技メタ / legality を catalog / Serebii へ移した
結果、`generate.ts` が raw を読むのは**構造データだけ**になり、構造データの SoT が「PokeAPI 由来の生成過程に
暗黙にある」状態が残っていた。

この状態は (a) 値が入力 YAML から直読できない、(b) Champions 実態との差分補正が間接レイヤー頼みになる、
(c) `generate` が raw 取得に依存し続けて決定論性が下がる、という弱点を持つ（名前 / 相性で ADR 0025 が解消した
ものの構造データ版）。`data/champions/catalog/*.yaml` は名前を持つようになったが、構造データのフィールドは
持たず、全データの SoT を catalog へ一本化できていなかった。

## Decision

**構造データ（種族値 / タイプ / 特性 id / 全国図鑑番号 / 持ち物 category）の SoT を `data/champions/catalog/*.yaml`
へ移す。** `species.yaml` の各エントリに `dex` / `types` / `stats`（H/A/B/C/D/S）/ `abilities`（id 配列）を、
`items.yaml` の各エントリに `category` を持たせ、メガ先エントリも種族値 / タイプ / 特性を持つ。`generate.ts` は
**`data/raw` を一切読まず catalog YAML のみを変換する**（名前 / 相性 / 技メタに続き構造データも raw 非依存）。
生成物の形・値は移行前と等価。

**取得元は PokeAPI を維持する。** 構造データは Champions 非依存で PokeAPI の値が信頼できるため、`fetch:data` は
残す。取得（raw キャッシュ）と SoT（catalog）の間の転記を専任スクリプト **`scripts/materialize.ts`（新設）**が
担う。`materialize` は raw → catalog へ構造データを転記し、**raw 必須・fail-fast**（不在なら即エラー終了・
自前の存在チェックや `fetch:data` 誘導は持たない）、**append/既存尊重**（未設定フィールドのみ埋め、既存値は
raw と異なっても上書きせず conflict を提示）で skill-authored 値を保護する。

**raw 存在の担保はスクリプトでなく `survey-regulation` skill の責務とする。** スクリプト
（`fetch-pokeapi` / `materialize` / `generate` / `check-regulation`）は前提が揃っている前提で動き、欠けたら
fail-fast する。raw を用意する順序（`fetch:data` → `materialize`）は skill が手順として保証し、スクリプト側に
存在チェックを再実装しない（責務の二重化を避ける）。

**`overrides.yaml` を廃止する。** 参照ゼロ（`generate` / `check:regulation` とも未参照）・中身空で、learnset
照合の撤去（ADR 0026）と構造データの catalog SoT 化により役割が消滅した。ファイルを削除し rule の記述も除去する。

これは ADR 0025（名前 / 相性 SoT）の構造データ版の拡張であり、vendor 方式の**取得元としての PokeAPI**（ADR 0012）
は supersede しない。仕様の詳細は [[data-pipeline]] / [[type-conventions]] を正本とし、本 ADR は「なぜ」を記録する。

## Consequences

- **良い点**:
  - 全データ（名前 / 解禁 / 技メタ / 構造データ）の SoT が catalog YAML に一本化され、値が入力から直読できる。
  - Champions 実態との差分を catalog YAML の直編集で吸収でき、補正レイヤーが不要になる。
  - `generate.ts` が raw 非依存になり決定論性が上がる（raw 不在でも生成でき、CI / オフライン再生が安定）。
  - 取得（`materialize`）と合成（`generate`）の責務が分離し、各スクリプトが fail-fast で前提崩れを早期検出する。
- **悪い点 / コスト**:
  - 構造データが catalog にコミットされ、種族追加時の `materialize` 転記が 1 手順増える（順序は skill が担保）。
  - catalog YAML が構造データぶん肥大化する（全量投入時は全186種ぶん）。
- **トレードオフ / 留意点**:
  - `materialize` の append/既存尊重は skill-authored 値を守るが、raw 側の更新を取り込むには既存値の手削除 +
    再 `materialize` か手修正が要る（conflict 提示で気づける）。
  - 既存エントリは `materialize` で初期移行し、`species-base` / per-reg dex / `items` 生成出力は移行前と等価。

## Alternatives Considered

| 代替案 | 却下理由 |
|---|---|
| 構造データを raw 直読のまま維持（現状） | 値が入力から直読できず、Champions 差分補正が間接的。名前 / 相性 / 技メタが catalog SoT になった後も raw 依存が残り、SoT が分散して決定論性も上がらない。 |
| `materialize` を作らず catalog を手書きで埋める | 全量投入時に種族値等を手入力するのは転記ミスの温床。取得元 PokeAPI の値を機械転記し、差分のみ手修正する方が安全。 |
| `materialize` に raw 存在チェック + `fetch:data` 誘導を持たせる | スクリプトと skill で前提担保が二重化しドリフトする。スクリプトは fail-fast、順序保証は skill 責務に分離する方が単純。 |
| PokeAPI 取得自体を廃止し構造データも完全 skill-authored 化 | 構造データは Champions 非依存で PokeAPI が信頼でき、取得を捨てると全種族の種族値等を手入力する負担が過大。取得元は維持し SoT だけ移す。 |
