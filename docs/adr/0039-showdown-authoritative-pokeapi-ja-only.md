---
id: 0039
status: Accepted
date: 2026-06-29
---

# 0039. pokemon-showdown を第一の正にし PokeAPI を ja 専任へ縮小・構造取得を廃止する

## Context

[ADR 0012](./archive/0012-vendor-pokeapi-data.md) の vendor 方式は PokeAPI を構造データ（種族値 / タイプ /
特性 id / 図鑑番号 / 持ち物 category）+ 日本語名の**取得元**とし、[ADR 0027](./archive/0027-structural-data-catalog-sot.md)
で構造データの SoT をソース YAML へ移したうえで取得元 PokeAPI を維持していた。しかし PokeAPI は
ポケモンチャンピオンズ（Champions）に非対応で、解禁種族 / per-species 技 / 技メタ / メガ / 持ち物の解禁集合を
持たない。これらは別系統（Serebii 第一優先）の手作業著述に依存し、取得がローカル / Workflow 任せで再現性と
網羅性に欠けていた。

対して `smogon/pokemon-showdown` は対戦シミュレーターの mod（`champions` / `championsregma`）として
**解禁・構造・技メタ・メガ・持ち物を一括かつ機械可読**に保持し、`calculatePP` 等の Champions 固有仕様まで
内包する。これを取得の第一の正に据えれば、構造データも解禁データも単一の取得元から機械抽出でき、網羅性・
一貫性・自動化適性が上がる。一方 showdown は日本語名を持たないため、ja の取得元は引き続き必要になる。

## Decision

**pokemon-showdown を構造データ + 解禁データの第一の正（authoritative）にする。** GitHub Actions
（`showdown-sync.yml`・`workflow_dispatch` 手動）で `smogon/pokemon-showdown` を `ref: master` +
`fetch-depth: 1` で clone → build → 抽出し、`scripts/showdown/*`（抽出層）と `src/codegen/showdown/*-fields.ts`
（転記純関数）越しに SoT YAML（`data/champions/*-specs.yaml` / `<reg>/*.yaml` / `data/languages/*.yaml` の en）へ
転記して **YAML 更新 PR を自動作成**する。権威序列は **showdown(正) > Serebii(速報) > PokeAPI(ja 補完)** とする。

**PokeAPI は日本語名 ja 専任へ縮小し、構造データ取得を廃止する。** `fetch:ja-names`（旧 `fetch:data`）/
`sync:ja-names`（旧 `materialize`）は `names`(ja-Hrkt) の backfill のみを担い、種族値 / タイプ / 特性 id /
図鑑番号 / category の取得・転記コードは除去する。ja の正は PokeAPI `names`、速報は Serebii とする二経路に
縮小する（[ADR 0032](./archive/0032-japanese-name-source-pokeapi-names.md) の ja=PokeAPI names は維持）。

**SoT レイアウトと検証機構は不変。** 3 軸直交（構造 `*-specs.yaml` / 名前 `languages/*.yaml` / 解禁
`<reg>/*.yaml`・[ADR 0035](./0035-specs-languages-layout-redesign.md)）・`generate.ts` の raw 非依存合成・
tsc-only 検証（[ADR 0010](./0010-tsc-only-verification.md)）・カバレッジ 100%・YAML block style ゲート
（[ADR 0028](./0028-data-yaml-block-style-gate.md)）はすべて維持し、**入力 SoT を埋める取得元のみを差し替える**。
仕様の詳細は [[data-pipeline]] を正本とし、本 ADR は「なぜ」を記録する。

これは ADR 0012（vendor=PokeAPI を構造取得元とする）/ ADR 0027（構造 SoT を PokeAPI→specs 転記・取得元 PokeAPI
維持・materialize structural）の取得元と取得範囲の根本転換であり、両者を supersede する。生成物の vendor
コミット（オフライン・決定論・CI 高速のため `src/generated/` をコミット）という ADR 0012 の運用は本 ADR でも
維持する（取得元のみが変わる）。

## Consequences

- **良い点**:
  - 構造データと解禁データが単一の機械可読な取得元（showdown）に集約され、取得が GitHub Actions で無人・再現
    可能に回る。`calculatePP` 等の Champions 固有仕様も取得元が内包するため転記の正確性が上がる。
  - PokeAPI 依存が ja 専任に縮小し、Champions 非対応 API を構造の信頼源に使う矛盾が解消する。
  - SoT レイアウト・検証ゲートが不変なので、取得元差し替えのブラスト半径が「入力 YAML を埋める経路」に限定される。
- **悪い点 / コスト**:
  - CI で pokemon-showdown を clone + build するため実行が重い（`fetch-depth: 1` + `ref: master` で軽量化）。
  - showdown は Smogon コミュニティの再現データで公式そのものではないため、正確性は別途 Serebii 照合
    （`verify-showdown-pr`）で裏取りする必要がある。
- **トレードオフ / 留意点**:
  - 取得が外向きの自動 PR 作成（`peter-evans/create-pull-request`）を伴うため、トークン権限を最小化し PR 本文に
    [[redaction]] を適用する。
  - ja の取得元が PokeAPI / Serebii の二経路になり、食い違いは showdown が追いついた時点で上書きする運用で収束させる。

## Alternatives Considered

| 代替案 | 却下理由 |
|---|---|
| PokeAPI を構造取得元のまま維持（ADR 0012/0027 継続） | PokeAPI は Champions 非対応で解禁 / 技メタ / メガを持たず、別系統の手作業著述が再現性・網羅性を欠く。単一の機械可読取得元（showdown）へ集約する利得が大きい。 |
| Serebii を第一の正にする | Serebii は HTML スクレイピング依存で構造化されておらず、`calculatePP` 等の Champions 固有仕様を機械抽出しづらい。速報経路に向くため第一の正は showdown とし Serebii は速報・照合に使う。 |
| ja も showdown / Serebii のみで賄い PokeAPI を全廃 | showdown は ja を持たず、Serebii 単独だと ja の網羅性・安定性が劣る。ja の正は PokeAPI `names`（ADR 0032）を残すのが堅実。 |
| 取得を CI へ移さずローカル / Workflow 継続 | 取得の再現性・無人化が得られず、最新レギュへの追従が属人的になる。`workflow_dispatch` で手動トリガーしつつ実行は GitHub Actions に固定する。 |
