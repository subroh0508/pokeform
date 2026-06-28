---
id: 0036
status: Accepted
date: 2026-06-21
---

# 0036. メガを独立 spec エンティティ（mega-specs）化し base 種族から構造データを分離する

## Context

これまでメガ形態は **base 種族の表現に相乗り**していた。base 種族（`species-specs` 相当）が
`megaEvolvesTo?` / `megaLinks` でメガ先 id を指し、メガ先種族の構造データ（種族値 / タイプ / 特性）は
catalog の種族エントリ（base と同じ `pokemon` マップ）に**メガ先 id をキーにした別エントリ**として混在し、
per-reg では base 種族下の `mega[]` 配列でメガを列挙していた。メガ関連データの決定論自動著述は
[ADR 0033](./archive/0033-deterministic-mega-auto-authoring.md) が、メガ先 per-reg moves の base 継承は
[ADR 0024](./0024-mega-moves-inherit-base.md) が定めている。

この相乗り表現には弱点がある。**base 種族とメガ形態は別物**（メガは戦闘中の変身で、種族値 / タイプ / 特性が
変わる独立した構造データを持つ）なのに、両者が同じ `species` 名前空間・同じマップに同居するため、
(a) 「base 種族の dex」と「メガ形態の dex」の境界がコード上曖昧で、consumer がメガ先かどうかを id 命名規約
（`-mega` サフィックス）で判別する暗黙依存が生じる、(b) base ↔ メガの参照が `megaLinks`（前方）だけで、メガから
base への逆参照が構造化されていない、(c) メガ固有のフィールド（`baseSpecies` など）を持つ自然な置き場が無い、
という問題がある。[ADR 0035](./0035-specs-languages-layout-redesign.md) で generated / YAML を specs 軸へ再編する
機会に、メガの構造表現も整理する。

## Decision

**メガを独立した spec エンティティ `mega-specs` として切り出し、base 種族（`species-specs`）から構造データを
分離する。** メガ形態は `id → { dex, types, baseStats, ability, baseSpecies }`（`baseSpecies` は base 種族 id への
**逆参照**）で表現し、`species-specs` 側は base 種族のみ（`megaEvolvesTo?` で前方参照）を保持する。
生成物は `data/generated/champions/mega-specs.ts`、ソース YAML は `data/champions/mega-specs.yaml`。
名前（ja/en）は他エンティティと同じく languages へ置く（`data/generated/languages/mega.ts` /
`data/languages/mega.yaml`・[ADR 0035] の名前 SoT 一本化に従う）。per-reg の `mega`（`m-a/mega.ts` /
`m-a/mega.yaml`）は解禁メガの列挙として残り、`generate.ts` が `mega-specs` ＋ per-reg `mega` から派生する。

- **base ↔ メガの参照を双方向に構造化**: base は `megaEvolvesTo?`（前方）、メガは `baseSpecies`（逆参照）。
  id 命名規約（`-mega` サフィックス）への暗黙依存をやめ、エンティティの型で base / メガを判別する。
- **[ADR 0024] / [ADR 0033] の決定は不変**: メガ先 per-reg moves が base を継承する点（[ADR 0024]）は
  `baseSpecies` 逆参照を介して保たれる。Serebii メガ関連データの**決定論自動著述・append/既存尊重**
  （[ADR 0033]）も不変で、著述先のデータ表現が「base 種族エントリ ＋ `megaLinks` 埋め込み」から「独立
  `mega-specs` エンティティ ＋ `baseSpecies` 逆参照」へ変わる**所在改訂**に留まる（決定論性・冪等性は保つ）。
- **reg-aware 型機構を壊さない**: per-reg 種族 dex 合成時に `mega-specs` ＋ per-reg `mega` を結合して
  従来の `PerRegSpecies` 相当（メガ先の解禁判定）を満たす（[ADR 0021](./0021-per-regulation-species-and-legality.md) /
  [ADR 0035] の合成方針）。

これは [ADR 0011](./0011-species-dex-pattern.md) の `XxxBase` + `XxxDex` + `XxxId` パターンに沿った**新エンティティ
の追加**であり、メガを `species` の一種として埋め込む従来表現を改める。仕様の詳細（型 `MegaSpec` の形・
逆参照の解決）は [[type-conventions]] / [[data-pipeline]] を正本とし、
本 ADR は「なぜ」を記録する。

## Consequences

- **良い点**:
  - base 種族とメガ形態が型レベルで分離され、consumer が id 命名規約に頼らずエンティティ型で判別できる。
    `baseSpecies` 逆参照でメガ → base の解決が構造化される。
  - メガ固有フィールド（`baseSpecies` 等）の自然な置き場ができ、将来メガ固有の構造（複数メガ X/Y の関係など）を
    拡張しやすい。[ADR 0035] の specs 軸（言語非依存の構造）に sup species と並ぶ一級エンティティとして収まる。
- **悪い点 / コスト**:
  - エンティティが 1 つ増え、`generate.ts` の合成・型・consumer がメガを別 dex として扱うよう更新が要る
    （[ADR 0035] の一括再編に同梱）。
  - base とメガで構造データ（dex / types / baseStats）のスキーマが近く、二系統の似た型を保守する。
- **トレードオフ / 留意点**:
  - メガ先 per-reg moves の base 継承（[ADR 0024]）・決定論自動著述（[ADR 0033]）の**決定は変えない**。
    本 ADR は構造表現（独立エンティティ化）のみを定め、メガの moves 継承・著述機構には踏み込まない。

## Alternatives Considered

| 代替案 | 却下理由 |
|---|---|
| メガを `species-specs` 内エントリのまま維持し、派生ビューでメガだけ抽出する | base 種族とメガ形態が同じ `species` 名前空間に同居し続け、consumer が `-mega` サフィックスで判別する暗黙依存が残る。逆参照（`baseSpecies`）の自然な置き場も無い。型でエンティティを分けるほうが境界が明快。 |
| メガを base 種族の入れ子フィールド（`species.megaForms[]`）にする | per-reg 解禁列挙・逆参照・name(languages) 分離が入れ子の中に埋もれ、3 軸直交（[ADR 0035]）と揃わない。独立エンティティ（id キーの dex）のほうが他エンティティと同型で合成・参照が一貫する。 |
