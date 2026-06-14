---
id: 0032
status: Accepted
date: 2026-06-14
---

# 0032. 日本語名の取得元を PokeAPI `names`（ja-Hrkt）に定める

## Context

[ADR 0025](./0025-catalog-name-and-type-chart-sot.md) で日英名の **SoT を catalog YAML** へ移した際、
当時の `fetch-pokeapi.ts` は `type` / `ability` / `move` を取得せず、[[data-pipeline]] の取得元表は日英名を
「PokeAPI に無し（skill-authored）」と記述していた。しかし PokeAPI のリソースは `names`（多言語名・`ja-Hrkt` /
`ja` を含む）を持っており、**日本語名は PokeAPI から機械取得できる**。

[ADR 0031](./0031-deterministic-serebii-scraper-hybrid-layers.md) の決定論スクレイパーは Serebii から技メタ /
解禁を取るが、**Serebii には日本語名が無い**。新規種族 / 技 / 持ち物 / 特性を投入するたびに ja 名を人手著述すると
取得が止まり、決定論パイプラインの利点が薄れる。一方で技メタ（type/power 等）は引き続き PokeAPI を信頼源に
しない（ADR 0026 不変）— 名前と技メタは別物として扱える。

## Decision

日本語名の取得元を **PokeAPI の `names`（`ja-Hrkt` を優先・無ければ `ja`）** に定める。`materialize`（PokeAPI
vendor・append/既存尊重）が raw `names` から ja を catalog へ転記する。これにより [[data-pipeline]] の「日英名 =
PokeAPI に無し」記述を「ja 取得元 = PokeAPI names」へ改める。

- **catalog が SoT である点は不変**: PokeAPI names は**初期値の補完源**で、`materialize` は append/既存尊重
  （未設定 ja のみ埋め、既存 skill-authored 値は上書きせず conflict 提示）。Champions 実態に合わせた表記
  （メガ / 地域フォルムの form 別名など）は catalog 側が勝つ（[ADR 0027](./0027-structural-data-catalog-sot.md)
  の設計を names に拡張）。
- **取得対象**: 種族 / 持ち物の `names` は既存取得 raw（`pokemon-species` / `item`）に含まれる。技 / 特性は
  **日英名が欠けるエントリのみ** `move` / `ability` を best-effort 取得（404 等は skip）し、`names` から ja
  （特性は en も）を補完する。**技メタには使わない**（ADR 0026 不変・名前と技メタを分離）。
- **en の扱い**: 種族 / 技 / 持ち物の en は Serebii 表示名（`serebii-to-catalog` 著述）、特性の en は Serebii が
  表示名を渡さないため id から決定論導出（`rough-skin` → `Rough Skin`）し、`materialize` が PokeAPI names で
  突き合わせる。

詳細は [[data-pipeline]]（取得元 / SoT 表）/ [`serebii-sourcing.md`](../../.claude/skills/survey-regulation/references/serebii-sourcing.md)。

## Consequences

- **良い点**:
  - 新規エントリの ja 名が機械補完され、決定論パイプラインで取得が止まらない（人手著述を初期値に不要化）。
  - PokeAPI names と既存 catalog ja の差異が materialize の conflict 提示で可視化され、表記揺れを検出できる。
- **悪い点 / コスト**:
  - 技 / 特性の names 補完のため `move` / `ability` の best-effort 取得が増える（欠落エントリのみ・既存完備なら
    取得ゼロ）。
  - PokeAPI の ja-Hrkt が move / berry 等で表記揺れしうる（catalog SoT 側で吸収・初期値は PokeAPI・上書き可能）。
- **トレードオフ / 留意点**:
  - メガ / 地域フォルム種族の `pokemon-species` は base を指すため names は base 名になる。form 別 ja は catalog
    側で著述し、materialize の append/既存尊重が base 名による誤上書きを防ぐ（既存値保護）。

## Alternatives Considered

- **ja を skill-authored で人手著述継続（ADR 0025 の現状解釈）**: 決定論パイプラインで取得が止まり、186 種族規模で
  非現実的。PokeAPI に正確な ja があるのに使わないのは無駄。
- **Serebii から ja を取る**: Serebii Champions ページに日本語名が無いため不可。
- **技メタも含め PokeAPI を名前以外の正にする**: [ADR 0026](./0026-pokeapi-not-champions-legality-source.md)
  で却下済み。本 ADR は**名前のみ** PokeAPI を取得元にし、技メタ / legality は Serebii 第一優先を維持する。
