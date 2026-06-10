---
paths:
  - "src/types/**"
  - "data/generated/**"
description: 型表現の統一パターン（`XxxBase` + `XxxDex` + `XxxId = keyof XxxDex`）・種族粒度（種族値が一意 = 1 種族）・日英 name と逆引きマップ。src/types/ や data/generated/ を扱うとき適用する。
---

# 型表現の規約

種族 / 技 / タイプ / 特性 / 持ち物を**同一パターン**で型表現するための規約。正本は `docs/plan/01-mvp/architecture.md`（「種族の型表現」節）。ここは取り違え防止の要約。

## 統一パターン（4 種すべて同形）

エントリ種別ごとに**3 点セット**を定義する:

- **親型 `XxxBase`**: 構造的に共通な形（`id` / その他フィールド）。`name: { en; ja }` は **species / moves / types のみ**が持つ。**abilities / items は `name` を持たない**（生成 dex は id のみ + items は `category?`/`megaStoneFor?`。名前の SoT は `data/champions/catalog/{abilities,items}.yaml`・効果フィールドは後続で足す前提・Phase 10）。
- **`XxxDex`**: 各エントリを ID キーに集約した型（`XxxDex[Id]` でルックアップ）。生成物では値
  `export const xxxDex = {...} as const` から **`type XxxDex = typeof xxxDex` で派生**し、値と型を
  単一ソース化する（手書き interface でなく derive・親型適合は `satisfies` / `Assignable` で検証）。
- **`XxxId = keyof XxxDex`**: ID の union を `Dex` から導出する。

対象は `MoveDex`/`MoveId`・`TypeDex`/`PokemonType`・`AbilityDex`/`AbilityId`・`ItemDex`/`ItemId`。巨大 union の分配コストを避けるため、**制約はプロパティアクセス主体**で行う（union を直接配らない）。

## 種族型は per-regulation（reg-aware 制約・ADR `0021`）

種族の習得技はレギュレーションごとに異なりうるため、**種族 dex は per-regulation** で生成する（global 単一 `SpeciesDex`/`SpeciesId` は廃止・[[data-pipeline]]）:

- **per-reg 種族 dex**: `data/generated/regulations/<id>/species.ts` の `speciesDex`（`as const satisfies Record<string, SpeciesBase>`）/ `SpeciesId = keyof speciesDex`。`RegulationDex[R]["speciesDex"]` から引ける（レギュメタに同梱）。
- **reg-aware アクセサ**（`src/types/individual.ts`）: `SpeciesDexOf<R> = RegulationDex[R]["speciesDex"]` / `SpeciesIdIn<R> = keyof SpeciesDexOf<R> & string`。エントリ参照は `SpeciesEntryOf<R,S> = SpeciesDexOf<R>[S] & SpeciesBase`（generic `R` での深い indexed access の限界回避。`& SpeciesBase` でキー存在を保証し narrow リテラルは交差で温存）。
- **reg-aware 制約**: `ValidMove<R,S,M>` / `ValidMoves` / `ValidAbility<R,S,A>` / `ValidItem<R,S,I>` / `HoldableItems<R,S>` / `IndividualSpec<R,S>` は `R` 付き。ブランドエラー型（`MoveNotLearnedBy<R,S,M>` 等）に `R` を表示する。パーティ制約 `ConstrainParty<T,R>` は per-reg roster（`RegulationDex[R]["species"]`）を、メンバーの宣言レギュ整合は `MemberDeclaresRegulation<R,Regs,S>` を使う（[[cli-and-io]]）。
- **reg 不変フィールド**（種族値 / タイプ / 日英名 / メガ先 = `SpeciesBaseInfo`）は派生 base view `speciesBaseDex`（`data/generated/species-base.ts`・全種族）に切り出し、実数値計算・名前表示・coverage はこれを引く。型の正本は per-reg のまま（base view は runtime ルックアップ専用）。`megaEvolvesTo` / `megaStoneFor` は per-reg dex 側で legality を見るため素の `string`（global `SpeciesId` への自己参照を避ける）。

## 種族の粒度

**種族値が一意に定まる粒度 = 1 種族**。フォルム / リージョン / メガで種族値が変わるものは別 `SpeciesId`（kebab-case の安定キー。例 `charizard`, `charizard-mega-x`, `rotom-wash`, `tauros-paldea-aqua`）。

## 日英名と逆引き

- すべて**英名（kebab-case の安定 ID）を型キー**にする。ID を型キーにするのは安定性（改名されにくい）のため。
- **名前の SoT は `data/champions/catalog/*.yaml`**（`id → { ja, en }`・types は + `damageTo`・Phase 10）。`generate.ts` は名前について `data/raw`（PokeAPI）を読まず YAML を変換する。species / moves / types は生成 dex の各エントリ `name.ja` に持ち、**abilities / items は生成 dex に name を持たない**（catalog YAML が唯一の名前ソース）。
- 逆引き（日本語名 → ID）は `data/generated/names.ts`（`speciesIdByJa` / `moveIdByJa` / `abilityIdByJa` / `itemIdByJa` / `typeIdByJa`）に生成し、catalog YAML の `ja` 由来で作る。YAML を日英どちらでも書けるのはこの逆引きを codegen が使うため（[[data-pipeline]] / [[cli-and-io]]）。

## 整合（ID 単一ソース）

種族の `moves` / `abilities` / `items` / `types` は**対応する `Dex` のキー（ID）参照**に統一し、詳細（倍率・日本語名・分類）は `Dex[Id]` ルックアップで取る。同一データを二重に持たない（codegen が両者を同一ソースから出力）。型と値の生成・検証方針は [[tsc-verification]] を参照。

固定の能力キー配列（`STAT_KEYS` = 6 能力）も**`src/types/stats.ts` に一元化して各所から import する**ことを指針とする。同じ配列を複数箇所（cli/stat・domain/stat-tuning・codegen/normalize 等）で定義するとドリフトの温床になるため、単一ソースへ寄せる（現状の重複の解消は後続のソース変更で行う）。
