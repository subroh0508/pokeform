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

- **親型 `XxxBase`**: 構造的に共通な形（`id` / `name: { en; ja }` / その他フィールド）。
- **`XxxDex`**: 各エントリを ID キーに集約した型（`XxxDex[Id]` でルックアップ）。生成物では値
  `export const xxxDex = {...} as const` から **`type XxxDex = typeof xxxDex` で派生**し、値と型を
  単一ソース化する（手書き interface でなく derive・親型適合は `satisfies` / `Assignable` で検証）。
- **`XxxId = keyof XxxDex`**: ID の union を `Dex` から導出する。

対象は `SpeciesDex`/`SpeciesId`・`MoveDex`/`MoveId`・`TypeDex`/`PokemonType`・`AbilityDex`/`AbilityId`・`ItemDex`/`ItemId`。巨大 union の分配コストを避けるため、**制約は `SpeciesDex[S]` のプロパティアクセス主体**で行う（union を直接配らない）。

## 種族の粒度

**種族値が一意に定まる粒度 = 1 種族**。フォルム / リージョン / メガで種族値が変わるものは別 `SpeciesId`（kebab-case の安定キー。例 `charizard`, `charizard-mega-x`, `rotom-wash`, `tauros-paldea-aqua`）。

## 日英名と逆引き

- すべて**英名（kebab-case の安定 ID）を型キー**にし、**日本語名は各エントリの `name.ja`** に持つ。ID を型キーにするのは安定性（PokeAPI 由来・改名されにくい）のため。
- 逆引き（日本語名 → ID）は双方向リテラル型 `IdByJaName<"ピカチュウ"> = "pikachu"` 等で引ける（`data/generated/names.ts` に生成）。YAML を日英どちらでも書けるのはこの逆引きを codegen が使うため（[[data-pipeline]] / [[cli-and-io]]）。

## 整合（ID 単一ソース）

種族の `moves` / `abilities` / `items` / `types` は**対応する `Dex` のキー（ID）参照**に統一し、詳細（倍率・日本語名・分類）は `Dex[Id]` ルックアップで取る。同一データを二重に持たない（codegen が両者を同一ソースから出力）。型と値の生成・検証方針は [[tsc-verification]] を参照。

固定の能力キー配列（`STAT_KEYS` = 6 能力）も**`src/types/stats.ts` に一元化して各所から import する**ことを指針とする。同じ配列を複数箇所（cli/stat・domain/stat-tuning・codegen/normalize 等）で定義するとドリフトの温床になるため、単一ソースへ寄せる（現状の重複の解消は後続のソース変更で行う）。
