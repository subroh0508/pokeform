---
id: 0035
status: Accepted
date: 2026-06-21
---

# 0035. generated / YAML レイアウトを specs / languages / per-reg の 3 軸へ再編し名前 SoT を languages へ移す（ADR 0025 / 0032 / 0034 改訂）

## Context

[ADR 0025](./archive/0025-catalog-name-and-type-chart-sot.md)（名前 / タイプ相性の SoT を catalog YAML へ）/
[ADR 0027](./archive/0027-structural-data-catalog-sot.md)（構造データの SoT を catalog へ）/
[ADR 0032](./archive/0032-japanese-name-source-pokeapi-names.md)（ja 取得元 = PokeAPI names）/
[ADR 0034](./archive/0034-move-meta-per-game-sot.md)（技メタ SoT を per-game regulations へ）の積み上げで、
`data/champions/catalog/*.yaml` は **構造データ（種族値 / タイプ / 特性 id / category）と名前（ja/en）を同居**させ、
生成 `data/generated/` は **エンティティ別フラット**（`moves.ts` / `abilities.ts` / `items.ts` /
`species-base.ts` / `types.ts` / `names.ts`）＋ `regulations/<id>/{index,species}.ts` ＋
`regulations/champions/moves.ts`（技メタ）という形になっていた。

この積み上げは段階的拡張の結果として、**3 つの直交する関心（言語非依存の「構造」/ ゲーム非依存の「名前」/
レギュ依存の「解禁」）が同じファイルに混在**する。名前は species / moves / types では生成 dex に埋め込み、
abilities / items では catalog が名前 SoT で逆引きは `names.ts`、という不均一も残っていた。結果、多言語化
（言語追加）・多ゲーム化（別ゲーム追加）・新レギュ追加のいずれでも変更範囲が読みにくく、局所変更で閉じない。

全種族（全186種規模）を投入する前にこのレイアウトを確定しておかないと、大量データ投入後に組み替える事故が
起きる（「全量投入の手前で仕組みを確定する」de-risk と同型）。よって投入の前に、3 関心を**ディレクトリで
直交**させ、名前 SoT の所在を一本化する設計をここで確定する。

なお [ADR 0025 / 0032 / 0034] が定めた**決定の本質**——名前 / 構造 / 技メタは **skill-authored が SoT で
`generate.ts` は raw 非依存の変換専任**、ja の初期値補完源は PokeAPI names、技メタは **Champions 固有値で
PokeAPI を信頼源にしない**——は正しく、本 ADR でも**不変**である。本 ADR が改訂するのは SoT の**所在
（どのディレクトリ / ファイルに置くか）**のみである。所在変更は決定の意味変更に当たるため、[ADR 0034] が
[ADR 0026](./archive/0026-pokeapi-not-champions-legality-source.md) を改訂した際の先例どおり、補注ではなく
supersede で記録する（[[adr]] の supersede 手順）。

## Decision

**`data/generated/`（生成 TS）と `data/champions/`（ソース YAML）を、「構造（言語非依存の specs）」
「名前（ゲーム非依存の languages）」「レギュ解禁（per-reg）」の 3 軸で直交させたディレクトリ構成へ再編する。**

- **構造（specs・言語非依存・ゲーム別）**: `data/generated/champions/*-specs.ts`
  （`species-specs` / `mega-specs` / `item-specs` / `ability-specs` / `move-specs` / `type-specs`）と
  per-reg `champions/m-a/{index,species,items,mega,species-moves}.ts`。`move-specs` は現 `moveStatsDex`
  相当（技メタ = type / damageClass / power / accuracy / pp / priority）、`type-specs` は相性倍率 `damageTo`。
  いずれも **name を持たない**。ソース YAML は `data/champions/*-specs.yaml` ＋ `m-a/*.yaml` ＋ `rules.yaml`。
- **名前（languages・ゲーム非依存・ゲーム軸の外で共有）**: `data/generated/languages/*.ts`
  （`species` / `mega` / `items` / `moves` / `abilities` / `types`、各 `id → { id, name: { ja, en } }`）。
  ソース YAML は `data/languages/*.yaml`（各 `id → { ja, en }`）。**名前 SoT の所在を catalog / 生成 dex 埋め込み
  から `data/languages/*` へ一本化する。** species / moves / types の dex から `name` を外し、abilities / items の
  id-only と揃える（[ADR 0025] の id-only 化を全エンティティへ拡張）。逆引き（ja → id）は languages の forward
  `{ id, name }` から実行時導出する（`load-party` / `normalize`・専用 `names.ts` を廃止）。
- **YAML 参照機構 = ディレクトリ同型 ＋ generate 合成**。`$ref` リテラルや YAML anchor は**使わない**。
  `generate.ts` が複数ファイルを読んで結合する（例: `m-a/index` が `species-specs` ＋ `mega-specs` ＋
  `species-moves` ＋ per-reg `mega` を合成して `RegulationBase` を満たす `speciesDex` を作る）。外部依存ゼロで
  [ADR 0010](./0010-tsc-only-verification.md)（検証は tsc のみ）を崩さない。
- **決定の本質は不変**: catalog という統合マスターは specs（構造）＋ languages（名前）へ分解されるが、
  **skill-authored が SoT・`generate.ts` は raw 非依存の変換専任**は保つ。ja の初期値補完源は PokeAPI names の
  まま（[ADR 0032] の核・`materialize` の転記先が catalog → languages へ移るのみ・append/既存尊重も不変）。
  技メタは Champions 固有値で PokeAPI を信頼源にしない（[ADR 0034] の核・所在が
  `regulations/champions/moves` → `champions/move-specs` へ移るのみ）。
- **reg-aware 型機構を壊さない**: per-reg 種族 dex による解禁判定（`ValidMove<R,S,M>` / ブランドエラー・
  [ADR 0021](./0021-per-regulation-species-and-legality.md) / [ADR 0024](./0024-mega-moves-inherit-base.md)）は
  合成後の `speciesDex` が従来の `PerRegSpecies` 相当を満たすことで保全する。`RegulationId` は `champions-m-a` の
  まま不変（dir は `champions/m-a/` でも id は `<game>-<reg>` を維持）。

これにより [ADR 0025] / [ADR 0032] / [ADR 0034] の名前・技メタ SoT の**所在決定を本 ADR が改訂**する
（本質は不変）。仕様の詳細（ディレクトリ規約・型の形・取得元表）は [[data-pipeline]] / [[type-conventions]] を
正本とし、本 ADR は「なぜ」を記録する。

## Consequences

- **良い点**:
  - 構造 / 名前 / 解禁が 3 軸でディレクトリ直交し、言語追加は `languages/` のみ・別ゲーム追加は別 game ディレクトリ・
    新レギュ追加は per-reg ディレクトリ追加、と**変更が局所化**する。全種族投入の前に保守しやすい土台が固まる。
  - 名前 SoT が `languages/` に一本化され、species / moves / types の dex 埋め込みと abilities / items の id-only という
    **不均一が解消**する。逆引きが forward マップ由来になり専用 `names.ts` が不要になる。
  - `$ref` リゾルバを持たず generate 合成で参照を解決するため、外部依存ゼロ・tsc-only 検証を維持できる。
- **悪い点 / コスト**:
  - 生成ツリー・ソース YAML ツリー・型レイヤ・14 consumer ＋ 公開 API（`src/index.ts`）を**一括更新する破壊的変更**で
    diff が大きい（恒久 compat shim は持たない）。中途半端な赤コミットを残せないため再編は 1 PR にまとまる。
  - catalog という単一マスターが specs / languages の 2 系統に分かれ、新規エントリ追加時に構造（specs）と名前
    （languages）の双方へ記入する責任が生じる（id 集合の不一致は generate が生成段で弾く）。
- **トレードオフ / 留意点**:
  - 名前 SoT 所在の移動は [ADR 0025 / 0032 / 0034] の**所在再決定**であり、**決定の本質（skill-authored が SoT・
    raw 非依存・catalog の名前マスター性）は保つ**。誤って「raw 直読へ戻す」「PokeAPI を技メタ信頼源にする」等と
    読まれてはならない。
  - 生成物の値は所在移設のみで等価（決定論性は不変）。consumer の import パスと名前参照経路が languages 由来へ移る。

## Alternatives Considered

| 代替案 | 却下理由 |
|---|---|
| YAML 参照を `$ref` リゾルバ / YAML anchor で解決する | 外部ライブラリ or 自前リゾルバが要り、[ADR 0010] の「検証は tsc のみ・外部依存最小」を崩す。generate 合成（ディレクトリ同型＋複数ファイル結合）で同じ参照を外部依存ゼロで解ける。 |
| 名前を species / moves / types の生成 dex 埋め込みのまま維持する | 構造（言語非依存）と名前（ゲーム非依存）が同居し続け、多言語化で dex 全体に手が入る。abilities / items の id-only と不均一なまま。languages 分離で 3 軸直交と局所変更が成立する。 |
| catalog 統合マスターを維持し名前のみ別ファイル化 | 構造と名前が同一スコープ（reg / ゲーム非依存の catalog）に残り、ゲーム軸の外で共有すべき名前と、ゲーム別の構造の境界が曖昧になる。specs（ゲーム別構造）/ languages（ゲーム外名前）へ分けるのが軸として正しい。 |
