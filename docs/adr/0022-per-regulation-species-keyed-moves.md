---
id: 0022
status: Accepted
date: 2026-06-10
---

# 0022. per-regulation の技記録を species-keyed の明示記録にし generate を変換専任へ寄せる

## Context

[ADR 0021](./0021-per-regulation-species-and-legality.md) で解禁判定と習得技の正本を per-regulation に
一本化したが、入力 YAML（`data/champions/regulations/<id>.yaml`）は `allow.{species,items,mega,moves}` の
**フラット構造**で、技は「記録のみ・型生成しない」とし、生成段（`scripts/generate.ts`）が各種族の習得技を
**`global catalog/moves.yaml ∩ PokeAPI learnset` でその場導出**していた。これには 2 つの問題があった:

- **種族×レギュレーションの技対応が YAML で確認できない**。「どの種族がそのレギュで何の技を覚えるか」は
  生成された `species.ts` を読むしかなく、入力 YAML からは追えない（`allow.moves` はフラットな全体集合で、
  しかも generate 未使用＝飾りだった）。
- **各種族に数技しか紐づかない**。catalog が少数技のため、レギュレーションの実態（例: チャンピオンズ M-A は
  解禁技467・各種族の全 learnable 技）に全く届かない。

あわせて、ポケモンチャンピオンズはメガシンカが **1 種族に複数あり得る**（リザードン X/Y 等）が、`megaEvolvesTo`
は単一 `string` でこれを表現できなかった。仕様の詳細は
[`docs/plan/02-data-model-redesign/OVERVIEW.md`](../plan/02-data-model-redesign/OVERVIEW.md)「設計方針の再々改訂」
と [[data-pipeline]] / [[type-conventions]] を正本とし、本 ADR は「なぜ」を記録する。

本 ADR は ADR 0021 の **記録方法・generate 責務に関する箇所のみを改訂**する。per-regulation 種族 dex を
legality の型正本とする・reg-aware 型機構という 0021 の**核は不変**であり、**full supersede はしない**
（0021 はアクティブのまま）。

## Decision

**per-regulation YAML を species-keyed の明示記録にし、`generate.ts` を YAML → TS 変換専任に寄せる。**

- **記録方法**: `regulations/<id>.yaml` は `name` / `period` / `items` を**予約キー**とし、それ以外の
  **トップレベルキー = 解禁種族（キーの存在 = allow）**。各種族キー下に **per-reg の習得技 `moves`** と、
  メガ運用種族は **`mega`（配列・1 種族複数メガ可）**をコロケーションする。YAML は **block 記法**で統一する。
  `allow.{...}` ラッパーは廃止する。種族×レギュの技対応が YAML で直読できる。
- **メガの配列化**: `SpeciesBaseInfo.megaEvolvesTo` / 生成 `megaEvolvesTo` / `catalog/species.yaml` の
  `megaLinks` を `string` → `string[]` にする（1 種族複数メガ）。`species.ts` の他フィールドの出力形は不変。
- **generate の責務縮小（段階的）**: per-reg 種族 dex の `moves` は YAML 値を採用する（`catalog ∩ learnset` の
  その場導出を廃止）。**本決定の Phase 5 では覚えない技の検出（YAML moves ⊆ learnset）を generate に残す**が、
  後続（02 Phase 6）で `check:regulation`（authoring 時ゲート）へ移設し、`generate.ts` を完全な変換専任にする。
- 解禁集合（メタの `species`/`items`/`mega`）は種族キー・予約 `items`・per-species `mega` の和集合から導出する。
  id がカタログに無ければ生成段でエラーにする（参照整合・append-only マスター担保）は不変。

## Consequences

- **良い点**:
  - 種族×レギュレーションの技対応が入力 YAML で直読・レビューでき、各種族に全 learnable 技を紐づけられる。
  - 1 種族複数メガを `mega[]` / `megaEvolvesTo[]` で表現できる。
  - generate のロジックが「導出」から「変換」へ単純化に向かい、検証位置が authoring 時に集約されていく。
- **悪い点 / コスト**:
  - 入力データ形式（YAML スキーマ）と型（`megaEvolvesTo` 配列化）の不可逆変更で、generate・型・
    `party-analysis`（メガ先タイプ分析）・テストに波及する。
  - 種族キーと予約キーを同階層に混在させるため、generate / ローダは明示的な予約キーセットで仕分ける必要がある。
- **トレードオフ / 留意点**:
  - Phase 5 時点では検証が generate に残る（安全性のため）。完全な変換専任化と `check:regulation` は Phase 6。
  - メガ先が複数になった場合、どのメガストーンがどのメガ先かの解決は持ち物側メタの拡張余地として残す
    （現状は単一前提で先頭を採用）。

## Alternatives Considered

- **生成ビュー追加（入力は据え置き）**: 導出を維持しつつ種族×レギュ技対応の確認用 YAML を生成出力する案。
  入力 YAML 自体では確認できず「YAML で記録方法を直したい」という要件を満たさないため却下。
- **`allow.species` をマップ化（`allow` 維持）**: `allow.species: { <id>: { moves } }` とする案。`allow` ラッパーが
  残り階層が深くなる。「キーの種族ID = 解禁」というユーザー合意の単純さを優先して却下。
- **per-reg × per-species ファイル分割**: 粒度は明快だがファイル数が膨大で保守が重く、1 レギュ = 1 ファイルの
  既存粒度を崩す。却下。
