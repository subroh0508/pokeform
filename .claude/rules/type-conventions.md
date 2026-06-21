---
paths:
  - "src/types/**"
  - "src/generated/**"
description: 型表現の統一パターン（`XxxBase` + `XxxDex` + `XxxId = keyof XxxDex`）・種族粒度（種族値が一意 = 1 種族）・日英 name と逆引きマップ。src/types/ や src/generated/ を扱うとき適用する。
---

# 型表現の規約

種族 / 技 / タイプ / 特性 / 持ち物を**同一パターン**で型表現するための規約。正本は `docs/plan/01-mvp/architecture.md`（「種族の型表現」節）。ここは取り違え防止の要約。

## 統一パターン（4 種すべて同形）

エントリ種別ごとに**3 点セット**を定義する:

- **親型 `XxxBase`（specs・構造・name 無し）**: 構造的に共通な形（`id` / その他フィールド）。**生成 specs dex（`SpeciesSpec` / `MegaSpec` / `MoveStats` / type-specs / item-specs / ability-specs）はいずれも `name` を持たない**（名前は languages へ分離・ADR 0035）。`SpeciesSpec` は dex/types/baseStats/abilities + `megaEvolvesTo?`、`MegaSpec` は dex/types/baseStats/ability + `baseSpecies` 逆参照（ADR 0036）、`MoveStats` は per-game 技メタ（type/damageClass/power/accuracy/pp/priority・Champions 固有値・ADR 0034）、type-specs は `damageTo`、item-specs は `category?`/`megaStoneFor?`、ability-specs は id のみ。
- **名前は別エンティティ `NameEntry`（languages・ゲーム非依存）**: 全エンティティの名前は `src/generated/languages/*.ts` の `id → { id, name: { ja, en } }`（`satisfies Record<string, NameEntry>`）に一本化する。構造（specs）と名前（languages）を直交させ、species / moves / types の dex 埋め込みと abilities / items の id-only という不均一を解消した（ADR 0035）。
- **`XxxDex`**: 各エントリを ID キーに集約した型（`XxxDex[Id]` でルックアップ）。生成物では値
  `export const xxxDex = {...} as const` から **`type XxxDex = typeof xxxDex` で派生**し、値と型を
  単一ソース化する（手書き interface でなく derive・親型適合は `satisfies` / `Assignable` で検証）。
- **`XxxId = keyof XxxDex`**: ID の union を `Dex` から導出する。

構造 specs の対象は `speciesSpecsDex`（`SpeciesSpec`）・`megaSpecsDex`（`MegaSpec`）・`moveSpecsDex`（`MoveStats`・per-game 技メタ・`src/generated/champions/move-specs.ts`）・`typeSpecsDex`/`PokemonType`・`abilitySpecsDex`/`AbilityId`・`itemSpecsDex`/`ItemId`。名前は `speciesNames` / `moveNames` / `typeNames` 等（`NameEntry`・`src/generated/languages/*.ts`）。巨大 union の分配コストを避けるため、**制約はプロパティアクセス主体**で行う（union を直接配らない）。

## 種族型は per-regulation（reg-aware 制約・ADR `0021`）

種族の習得技はレギュレーションごとに異なりうるため、**種族 dex は per-regulation** で生成する（global 単一 `SpeciesDex`/`SpeciesId` は廃止・[[data-pipeline]]）:

- **per-reg 種族 dex**: `src/generated/champions/<reg>/index.ts` の `speciesDex`（`as const satisfies Record<string, PerRegSpecies>`）/ `SpeciesId = keyof speciesDex`。`index.ts` が `species-specs` ＋ `mega-specs` ＋ per-reg `species-moves` ＋ per-reg `mega` を**実行時合成**して narrow リテラルを作る（`$ref` 不使用・generate 合成・ADR 0035）。`RegulationDex[R]["speciesDex"]` から引ける（レギュメタに同梱）。
- **reg-aware アクセサ**（`src/types/individual.ts`）: `SpeciesDexOf<R> = RegulationDex[R]["speciesDex"]` / `SpeciesIdIn<R> = keyof SpeciesDexOf<R> & string`。エントリ参照は `SpeciesEntryOf<R,S> = SpeciesDexOf<R>[S] & PerRegSpecies`（generic `R` での深い indexed access の限界回避。`& PerRegSpecies` でキー存在を保証し narrow リテラルは交差で温存）。
- **reg-aware 制約**: `ValidMove<R,S,M>` / `ValidMoves` / `ValidAbility<R,S,A>` / `ValidItem<R,S,I>` / `HoldableItems<R,S>` / `IndividualSpec<R,S>` は `R` 付き。ブランドエラー型（`MoveNotLearnedBy<R,S,M>` 等）に `R` を表示する。パーティ制約 `ConstrainParty<T,R>` は per-reg roster（`RegulationDex[R]["species"]`）を、メンバーの宣言レギュ整合は `MemberDeclaresRegulation<R,Regs,S>` を使う（[[cli-and-io]]）。
- **メガストーン専有はメガ形態（メガシンカ後）種族のみ**（item legality の**確定モデル**・[[data-pipeline]]）: `<reg>/index.ts` の `speciesDex` で、**base（メガシンカ前）種族の `items` は `"any"`**（`HoldableItems<R,S>` が `RegulationItemId<R>`＝解禁プール全件・メガストーン含むへ接続。メガ可能種でも専有は課さない）、**メガ形態種族**（charizard-mega-x 等）の **`items` は対応メガストーン id のタプル**（generate が `item-specs` の `megaSpecies` リンクから決定論導出・例 `charizard-mega-x.items: ["charizardite-x"]`・reg プール外/欠落は generate 側で fail-fast）。`HoldableItems<R,S>` はタプルを Extract 分岐でそのストーン群へ絞り、メガ形態種族が対応ストーン以外（他形態ストーン・通常持ち物）を持つと `ItemNotHoldableBy<R,S,I>` で弾く。この legality は PR #145→#147→#149 で変遷の末**確定**した（base にストーン専有を課す方向 / `MegaStoneOf<S>` 暗黙分岐は採らない）。変える際は本 bullet が SoT。
- **reg 不変フィールド**（種族値 / タイプ / メガ先）は **specs（`speciesSpecsDex` / `megaSpecsDex`）** に、**名前は languages（`speciesNamesAll`）** に置く。実数値計算・coverage は specs を、名前表示は languages を引く（レギュ非依存・構造と名前を直交化・旧 `speciesBaseDex`（`species-base.ts`）派生 base view は廃止・ADR 0035）。`megaEvolvesTo`（base → メガ前方参照）/ `baseSpecies`（メガ → base 逆参照・ADR 0036）は per-reg dex 側で legality を見るため素の `string`（global `SpeciesId` への自己参照を避ける）。

## 種族の粒度

**種族値が一意に定まる粒度 = 1 種族**。フォルム / リージョン / メガで種族値が変わるものは別 `SpeciesId`（kebab-case の安定キー。例 `charizard`, `charizard-mega-x`, `rotom-wash`, `tauros-paldea-aqua`）。

## 日英名と逆引き

- すべて**英名（kebab-case の安定 ID）を型キー**にする。ID を型キーにするのは安定性（改名されにくい）のため。
- **名前の SoT は `data/languages/*.yaml`**（`id → { ja, en }`・ゲーム非依存・ADR 0035）。`generate.ts` は名前について `data/raw`（PokeAPI）を読まず languages YAML を変換し、`src/generated/languages/*.ts`（`speciesNames` / `moveNames` 等・`NameEntry`）を出力する。**全エンティティの生成 specs dex は name を持たない**（languages が唯一の名前ソース・構造と名前を直交）。
- 逆引き（日本語名 → ID）は **専用 `names.ts` を持たず、languages forward マップ（`{ id, name }`）から consumer が実行時導出**する（`load-party` / `normalize`・`speciesNamesAll` 等を逆引き・ADR 0035）。YAML を日英どちらでも書けるのはこの逆引きを loader が使うため（[[data-pipeline]] / [[cli-and-io]]）。

## 整合（ID 単一ソース）

種族の `moves` / `abilities` / `items` / `types` は**対応する `Dex` のキー（ID）参照**に統一し、詳細（倍率・日本語名・分類）は `Dex[Id]` ルックアップで取る。同一データを二重に持たない（codegen が両者を同一ソースから出力）。型と値の生成・検証方針は [[tsc-verification]] を参照。

固定の能力キー配列（`STAT_KEYS` = 6 能力）も**`src/types/stats.ts` に一元化して各所から import する**ことを指針とする。同じ配列を複数箇所（cli/stat・domain/stat-tuning・codegen/normalize 等）で定義するとドリフトの温床になるため、単一ソースへ寄せる（現状の重複の解消は後続のソース変更で行う）。
