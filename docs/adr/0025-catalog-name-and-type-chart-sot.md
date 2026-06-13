---
id: 0025
status: Accepted
date: 2026-06-11
---

# 0025. 名前 / タイプ相性の SoT を catalog YAML へ移し abilities / items 生成 dex を id-only 化

## Context

[ADR 0012](./0012-vendor-pokeapi-data.md) の vendor 方式では、エンティティの日英名を `generate.ts` が
`data/raw`（PokeAPI の `names`）から導出し、タイプ相性も `type` リソースの `damage_relations` から導出して
いた。これは「名前 / 相性の SoT が PokeAPI 由来の生成物にある」ことを意味し、(a) チャンピオンズ独自表記・
表記揺れの補正が `overrides` 頼みになる、(b) `generate.ts` が名前のために raw 取得へ依存し続ける、(c) 名前が
入力（手書き YAML）から直読できない、という弱点があった。

`data/champions/catalog/*.yaml` は append-only マスターとして id を列挙していたが名前を持たず、特性 / 持ち物の
**効果**を将来定義する余地も無かった。名前を skill-authored の入力へ寄せ、`generate.ts` を名前について変換専任に
する必要が生じた。

## Decision

**日英名とタイプ相性の SoT を `data/champions/catalog/*.yaml` へ移す。** カタログは `id → { ja, en }` 形式で名前を
手書きの正本として持ち、`types.yaml` はさらに攻撃側相性倍率 `damageTo`（非 1.0 のみ・`generate` が 1.0 を補完）を
持つ。`generate.ts` は**名前 / タイプ相性について `data/raw`（PokeAPI）を読まず** YAML を変換する（`type` /
`ability` / `pokemon-form` は raw 取得もしない）。種族値・タイプ・`damageClass`・`category` 等の構造データは
引き続き raw 由来（vendor 方式の**名前 + types 相性部分のみ**の改訂であり、ADR 0012 を supersede しない）。

**abilities / items の生成 dex は `name` を持たない。** `abilityDex` は `{ id }` のみ、`itemDex` は
`{ id, category?, megaStoneFor? }` とし、`AbilityBase` / `ItemBase` から `name` を外す。名前は catalog YAML と
`data/generated/names.ts`（ja→id 逆引き）が持つ。生成ファイル自体は**特性 / 持ち物の効果を後続で定義する**ために
残す。`species` / `moves` / `types` は従来どおり生成 dex に `name` を保持する。

カタログの ja/en 欠落は `generate.ts` が生成段で非0終了にする（authoring ゲート）。仕様の詳細は
[[data-pipeline]] / [[type-conventions]] を正本とし、本 ADR は「なぜ」を記録する。

## Consequences

- **良い点**:
  - 名前 / 相性が手書きの入力から直読でき、チャンピオンズ独自表記を `overrides` でなく正本で表現できる。
  - `generate.ts` が名前 / types について PokeAPI 非依存になり、`type` / `ability` / `pokemon-form` の raw 取得が
    不要になる（取得対象が縮小）。
  - abilities / items の生成 dex が id のみになり、将来の**効果フィールド**追加の素地ができる。
- **悪い点 / コスト**:
  - 名前が skill-authored になり、新規 id 追加時に ja/en の記入（出典確認）が必要になる（取りこぼしは authoring
    ゲートが非0終了で弾く）。
  - `AbilityBase` / `ItemBase` から `name` を外す不可逆な型変更で、`type-conventions` の「XxxBase は name を持つ」
    前提に例外が入る（species / moves / types のみ name 保持）。
- **トレードオフ / 留意点**:
  - 既存名は現生成物から機械抽出して移行し、`types` / `moves` / `names` / `species-base` の生成出力はバイト不変
    （lossless）。差分は abilities / items の name 除去に限定される。
  - `types` は名前 + 相性とも YAML だが、相性表の構造（18×18）は raw からの移行で担保し、以後は手書きで保つ。

## Alternatives Considered

| 代替案 | 却下理由 |
|---|---|
| 名前を PokeAPI 由来のまま維持（現状） | 独自表記の補正が `overrides` 頼みで、名前が入力から直読できない。`generate` が名前のため raw に依存し続ける。 |
| abilities / items にも `name` を生成 dex へ残す | 名前を catalog YAML と生成 dex で二重に持つ。効果定義の素地として id-only が素直で、逆引きは `names.ts` で足りる。 |
| `types` 相性は raw 由来のまま、名前のみ YAML 化 | `generate` が types について raw 依存を残し「名前 / 相性は YAML」の一貫性が崩れる。18 タイプ固定で相性も手書き可能なため YAML 化した。 |
