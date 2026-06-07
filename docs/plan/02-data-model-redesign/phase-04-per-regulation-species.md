# Phase 4 — per-regulation 種族/メガ構造化

## 目的 / スコープ

生成される種族データを **per-regulation 構造**へ作り直す。現状の `data/generated/species.ts` は全レギュ
レーション共通の単一 `speciesDex`（＝ 種族定義が「全レギュ共通の固定型」になっている）だが、解禁種族・メガは
レギュレーションごとに異なるため、**1 レギュ = 1 species 定義**へ移す。`data/generated/regulations/<id>/species.ts`
を per-reg `speciesDex` の**正本**として生成し、`regulations/<id>.ts`（レギュメタ）がそれを参照する構成にする。

per-reg 化の対象は **species と mega のみ**（items / abilities / moves は当面 global カタログ由来のまま。
将来それらがレギュ差分を持つ必要が出た時点で同様に per-reg 化する）。

- スコープ内:
  - global `data/generated/species.ts` を**廃止**し、`data/generated/regulations/<id>/species.ts`
    （per-reg `speciesDex` / `SpeciesId` / `SpeciesDex`）を生成。各レギュの roster（`allow.species` + `mega` 先）
    に絞った種族エントリを catalog から materialize する。
  - `regulations/<id>.ts` が自分の `species.ts` を参照する（`champions-m-a.ts` → `champions-m-a/species.ts`）。
  - **regulation 非依存の消費側**（実数値計算・名前表示・coverage・個体定義）が種族 base データを引くための
    **codegen 派生の統合 view**（全 per-reg dex の和集合・手書き global ではなく派生物）を生成し、
    `src/types/species.ts` から re-export して既存 consumers の互換を保つ。
  - 参照付け替え: `scripts/generate.ts`（出力構造）/ `src/types/species.ts`（re-export 元）/
    `data/generated/regulations/index.ts`（per-reg species 集約）。consumers（types/io/cli/domain/index）は
    統合 view 経由で**型シグネチャ不変**を目指す。
  - ADR を起票（per-reg species 構造化＝ ADR 0021 の「生成 species を global 単一 dex とする」部分を改訂）。
- スコープ外:
  - items / abilities / moves の per-reg 化（本 Phase は species + mega に限定）。
  - M-A 解禁データの全量投入（Phase 5）。本 Phase は**構造変更**で、データ量は現状（20 匹サンプル）のまま等価。
  - 個体・パーティ型を「特定レギュレーションに束縛」する深い再設計（下記「設計判断」参照・本 Phase では採らない）。

## 前提（依存）

- **Phase 3（情報源確定 + 20匹サンプル検証）完了**。新構造が 20 匹で end-to-end に動くこと。
- ADR `0021`（解禁の per-regulation 一本化）を踏まえる（本 Phase はその生成層を改訂する後続決定）。
- 確定済み rule: [[data-pipeline]] / [[type-conventions]] / [[tsc-verification]] / [[testing]]。

## 設計判断（着手前に確定済み・実装中に覆さない）

1. **per-reg species.ts が生成 species の正本**: global 単一 `data/generated/species.ts` は廃止する。
   種族定義はレギュレーションごとに存在し、`regulations/<id>.ts` が自分の species.ts を参照する。
2. **base データは catalog 入力を単一ソースに per-reg へ materialize**: 種族値・タイプ・日英名は
   レギュレーション不変なので、入力（`data/champions/catalog/species.yaml` + 各 per-reg `allow`）を
   単一ソースとし、codegen が per-reg dex へ展開する（手動の二重管理はしない）。
3. **regulation 非依存の consumers は派生統合 view を使う**: 個体定義（`IndividualSpec<S>`）や実数値計算・
   名前表示・coverage は特定レギュに紐付かない。これらは per-reg dex 群から **codegen が派生する統合
   `speciesDex` / `SpeciesId`**（和集合）を参照する。これは「手書きの global 正本」ではなく per-reg からの
   派生物であり、「per-reg を正本にする」方針と両立する。consumers の型シグネチャは原則変えない。
4. **解禁判定は引き続き per-reg を参照**: `ConstrainParty` / `validateParty` は `RegulationDex[R].species`
   を見る（ADR 0021 のまま）。本 Phase は「base データを引く global 生成 dex」を per-reg へ移すのが主眼。
5. **ディレクトリは dir-per-reg**: `data/generated/regulations/champions-m-a/species.ts`。レギュメタは
   `champions-m-a.ts` を維持（or `champions-m-a/index.ts` へ寄せる。実装時に Biome/import 整合で確定）。

> **不採択（本 Phase ではやらない）**: 個体・パーティ型を特定レギュレーションにパラメタライズし、
> `SpeciesId` を完全に per-reg のみ（統合 view なし）にする案。全 consumers（individual/party/io/cli/domain）が
> regulation を要求するようになり diff が過大かつ個体が regulation 非依存でなくなる。将来 legality を型で
> レギュ別に締めたくなった時点で別計画（`03-*`）として検討する。

## タスク

- [ ] `scripts/generate.ts` を改修: global `species.ts` の出力を廃し、各レギュの roster に絞った
      `regulations/<id>/species.ts`（per-reg `speciesDex` + 派生型 + `@source` + `satisfies`）を出力。
- [ ] per-reg dex 群から**統合 view**（和集合の `speciesDex` / `SpeciesId` / `SpeciesDex`）を生成
      （`regulations/index.ts` か専用ファイル）。同一 base データの衝突が無いこと（reg 不変）を前提に merge。
- [ ] `regulations/<id>.ts` が自分の `species.ts` を import 参照するよう生成（`champions-m-a` / `champions-m-b`）。
- [ ] `src/types/species.ts` の `speciesDex` / `SpeciesId` / `SpeciesDex` re-export 元を統合 view へ付け替え。
- [ ] 参照整合: `src/types/item.ts`（`megaStoneFor`）/ `regulation.ts` / `index.ts` 公開 API /
      io・cli・domain の `speciesDex` ランタイム参照が統合 view 経由で解決することを確認。
- [ ] `pnpm generate:data` で再生成し、`data/generated/species.ts` が消え per-reg 構造になることを確認。
- [ ] 型テスト・ユニットテストを新構造へ追従（カバレッジ 100% 維持）。
- [ ] `adr-new` で ADR を起票（per-reg species 構造化）。ADR 0021 の該当部（生成 species を global 単一 dex と
      する記述）を `Superseded by` / 改訂として整理し、archive 退避要否を判断。
- [ ] rule 追従: [[data-pipeline]]（生成構造の図）/ [[type-conventions]]（SpeciesDex の per-reg + 派生統合）/
      OVERVIEW の「data/generated 構造」節を新構造へ更新。

## この Phase で育てるハーネス（rule・skill）

- [[data-pipeline]] / [[type-conventions]] の生成構造記述を per-reg species + 派生統合 view へ更新。
- ADR 起票（`adr-new`）。新 ADR 番号は採番時に確定（現在の最大連番 + 1）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- `data/generated/species.ts`（global 単一）が**存在せず**、`data/generated/regulations/<id>/species.ts` が
  各レギュの species 定義の正本として生成される。
- `regulations/<id>.ts` が自分の `species.ts` を参照する（`champions-m-a.ts` → `champions-m-a/species.ts`）。
- regulation 非依存の consumers（個体定義・実数値計算・名前・coverage・公開 API）が破綻せず動く
  （統合 view 経由・型シグネチャ原則不変）。
- per-reg 化が species と mega に限定され、items/abilities/moves は global カタログ由来のまま。
- ADR が起票され、ADR 0021 との関係（生成層の改訂）が整理されている。

## 検証手順

1. `pnpm generate:data` 後、`data/generated/species.ts` が消え `regulations/<id>/species.ts` が出力される
   ことをツリーで確認。各 per-reg dex のキーが当該レギュの `allow.species` + `mega` 先と一致することを確認。
2. `champions-m-a.ts` が `champions-m-a/species.ts` を参照していることを確認。
3. `pnpm test` で個体・パーティ・coverage・stat の既存テストが新構造で緑になることを確認。
4. `pnpm verify` 緑を確認。
5. ADR が採番・起票され README 一覧に載っていることを確認。

## リスク・備考

- **波及が広い**: `SpeciesId` / `speciesDex` は types（individual/party/item/regulation）・codegen・io・cli・
  domain・公開 `index.ts` に参照がある。統合 view 経由で型シグネチャを保つ設計で consumers 改修を最小化するが、
  **想定 diff が >1000 行に膨らむ場合は**「(a) per-reg 生成 + 統合 view 導入」と「(b) consumers 付け替え /
  global 削除」へ 2 PR 分割する（[[planning]] の分割・着手時 `start-phase` で判断）。
- **append-only マスターの扱い**: 入力 `catalog/species.yaml` は vendor 取得スコープ兼 base データ master として
  当面維持する（生成層のみ per-reg 化）。master 概念自体の見直しが必要なら ADR で整理する。
- **メガの二重表現**: 種族 `megaEvolvesTo` / 持ち物 `megaStoneFor`（`data/generated/items.ts`）/ per-reg `mega`
  集合の整合に注意。per-reg dex にはメガ先種族エントリも含める（`megaEvolvesTo` 参照を解決するため）。
- **データ等価性**: 本 Phase は構造変更でありデータ量は不変（20 匹サンプルのまま）。全量投入は Phase 5。
