# Phase 7 — per-reg 持ち物 legality（メガストーン保持ルール含む）

> survey-regulation の動作確認で判明したギャップの是正。個体の持ち物 legality が**レギュレーション単位に
> なっておらず**、M-A 個体が M-A 非解禁の `life-orb` / `rocky-helmet` を型エラーなく持ててしまう。技・特性は
> per-reg で型チェックされるのに持ち物だけ未接続だった。本 phase で per-reg 解禁プールへ接続し、あわせて
> メガストーン保持ルール（base = 全件 / メガ形態 = 対応ストーンのみ）を型で強制する。

## 目的 / スコープ

`HoldableItems<R,S>` の `items: "any"` 分岐が**グローバル `ItemId`（append-only 全カタログ）**を返している
のを、**そのレギュレーションの解禁持ち物プール**へ接続する。あわせてユーザー確定仕様のメガストーン保持
ルールを型で表現する。

- スコープ内:
  - `RegulationItemId<R> = RegulationDex[R]["items"][number]` 型を新設（`src/types/regulation.ts`）。
  - `HoldableItems<R,S>` の `"any"` 分岐を base 種族 / メガ形態種族で分岐:
    - **base（メガシンカ前）種族**: `RegulationItemId<R>`（R の解禁プール全件・全メガストーン含む）。
    - **メガ形態種族**（charizard-mega-x 等）: **対応するメガストーン1個のみ**（通常持ち物・他形態ストーン不可）。
  - メガストーン→メガ形態 SpeciesId のリンク `ItemBase.megaSpecies?: SpeciesId` を新設（`src/types/item.ts`）。
    X/Y を区別するため（現状 `megaStoneFor` は base を指し X↔Y を引けない）。`itemDex` に出力（`scripts/generate.ts`）。
    committed `items.yaml` の既存メガストーンへ `megaSpecies` を手動付与（append・既存尊重）。
  - enforcement で型エラー化する fixture を解禁持ち物へ修正（正しい検出）。
- スコープ外:
  - per-species 持ち物制約を per-reg YAML の種族下に書ける拡張（`Extract` 分岐の受け皿は残すが本 phase では未到達）。
  - 新規スクレイプ分の `megaSpecies` 自動付与（Phase 9 = メガ決定論取り込みが担う）。
  - メガ関連データ（`megaLinks` / per-reg `mega[]`）の自動著述（Phase 9）。

## 前提（依存）

- **03 Phase 1-6 完了**（取得パイプライン）。Phase 8（per-reg name 削除）とは独立だが、生成物差分の衝突を
  避けるため A → C（08）→ B（09）の順を推奨。
- 確定済み: per-reg 種族 dex（`RegulationDex`）・`RegulationBase.items`（解禁プールのリテラルタプル `as const`）・
  メガ形態種族が per-reg roster に含まれる（`rosterIds = speciesKeys ∪ megaToBase`・generate）。
- 確定済み rule: [[type-conventions]] / [[data-pipeline]] / [[cli-and-io]] / [[testing]]。
- 解禁判定モデルの正本 [ADR 0021](../../adr/0021-per-regulation-species-and-legality.md)。

## タスク

- [x] `src/types/regulation.ts`: `RegulationItemId<R> = RegulationDex[R]["items"][number]` を新設・export。
- [x] `src/types/item.ts`: `ItemBase` に `megaSpecies?`（メガ形態 SpeciesId・既存 `megaStoneFor` と同じく素の
      `string`。global SpeciesId への自己参照を避ける慣習に倣う）を追加。
- [x] `scripts/generate.ts`: `itemDex` 出力に `megaSpecies` を含める（items 生成箇所）。`materialize` は触らない
      （`megaSpecies` は skill 著述 / Phase 9 由来で PokeAPI 非由来）。
- [x] `data/champions/catalog/items.yaml`: 既存メガストーン4件へ `megaSpecies`（→メガ形態 SpeciesId）を手動付与。
- [x] `src/types/individual.ts`: `HoldableItems<R,S>` の `"any"` 分岐を差し替え:
  - [x] `MegaStoneOf<S>`（`ItemDex[I] extends { megaSpecies: S }` なストーン id）を追加。
  - [x] `[MegaStoneOf<S>] extends [never] ? RegulationItemId<R> : MegaStoneOf<S> & RegulationItemId<R>`。
  - [x] `Extract`（per-species 明示リスト）分岐は現状維持。`ItemDex`/`ItemId` を `data/generated/items.ts` から import。
- [x] enforcement で型エラー化する fixture を解禁持ち物へ修正（dual-reg 3 個体は M-A 単独へ絞り、
      代替持ち物をオーケストレーター確定値で適用: garchomp=focus-sash / dragapult=lum-berry /
      hydreigon=choice-scarf + nasty-plot→u-turn）:
  - [x] `src/types/individual.test.ts`（rocky-helmet/life-orb → focus-sash/lum-berry・expect 追従）。
  - [x] `team/individuals/{garchomp,dragapult,hydreigon}.yaml`（非解禁 → 解禁へ・説明コメントも追従）。
  - [x] `team/_demo/garchomp-bad-move.yaml`（PR 内で新規作成・item=leftovers・「psystrike のみ不正」のデモ単一性を維持）。
- [x] `pnpm generate:data` 再生成（`itemDex` に `megaSpecies` 反映）→ `pnpm verify` 緑。

## この Phase で育てるハーネス（rule・skill）

- ADR は**新規不要・[ADR 0021](../../adr/0021-per-regulation-species-and-legality.md) への補注で足りる**
  （per-reg item legality は 0021 の解禁判定モデルの忠実な適用で新たなトレードオフではない）。「`"any"` の意味を
  グローバル → per-reg プールへ確定」を 0021 Consequences か本 phase doc に決定として記録。判定が揺れる場合のみ
  `adr-new` を検討。

> **決定の記録（本 phase で確定）**: `SpeciesBase.items` の `"any"` は、これまで `HoldableItems<R,S>` で
> **グローバル `ItemId`**（append-only 全カタログ）へ解決していたが、本 phase で **そのレギュレーション `R` の
> 解禁持ち物プール `RegulationItemId<R>`** へ解決する意味に確定した。さらにメガ形態種族（`MegaStoneOf<S>` が
> 非 `never`）は **対応するメガストーン 1 個のみ**（`MegaStoneOf<S> & RegulationItemId<R>`）に絞る。これは
> [ADR 0021](../../adr/0021-per-regulation-species-and-legality.md) の per-regulation 解禁判定モデルの忠実な適用で
> あり、新たなトレードオフを伴わないため新規 ADR は起こさない（判定が揺れた場合のみ `adr-new` を検討）。

## 受け入れ基準

- `HoldableItems<R,S>` の `"any"` が base = `RegulationItemId<R>` / メガ形態 = 対応ストーンのみへ解決する
  （グローバル `ItemId` を返さない）。`pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- `check:individual team/individuals` 全緑（charizard が base として全メガストーン・自分の charizardite-x を持てる）。
- `check:individual team/_demo/garchomp-bad-move.yaml` が **psystrike のみ**を不正として報告（item で追加エラーを出さない）。

## 検証手順

1. `pnpm verify` 緑を確認。
2. `pnpm check:individual team/individuals` 全緑・`team/_demo/garchomp-bad-move.yaml` は psystrike のみ検出。
3. **負例①（非解禁持ち物）**: garchomp.yaml の item を一時 `rocky-helmet`（M-A 非解禁）に戻すと
   `item '...' is not holdable by 'garchomp' in regulation 'champions-m-a'` を YAML 行付きで弾く → 戻す。
4. **負例②（メガ形態の持ち物ロック）**: メガ形態 `charizard-mega-x` に `charizardite-y` / `leftovers` を
   持たせると型エラー・`charizardite-x` のみ通る。base `charizard` は全メガストーン可。

## リスク・備考

- enforcement で既存 team/individuals・テストが「非解禁持ち物」として型エラー化するのは**正しい検出**。
  dual-reg 個体は M-A ∩ M-B = `{charizardite-x, choice-scarf, leftovers}` しか持てないため、代替持ち物の選定は
  個体性能の判断（`stat-tuning` / `author-individual` の領分）。着手時にユーザー確認を1回挟む。
- `megaSpecies` は Phase 9（メガ決定論取り込み）が新規スクレイプ分へ自動付与する。本 phase は committed 分の
  手動付与 + 型接続まで。Phase 9 の自動著述と矛盾しない append-only 設計にする。
- `check:yaml-style` は team/ 非対象（data/ 限定）。team YAML の item 値差し替えは block スタイルを変えない。
