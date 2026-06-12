# Phase 13 — 構造データの catalog 化（種族値/タイプ/特性/図鑑番号/category を YAML SoT へ・generate raw 非依存）

## 目的 / スコープ

Phase 10 で名前・タイプ相性の SoT を catalog YAML へ移したのに続き、**PokeAPI から取得している構造データ
（種族値・タイプ・特性 id・全国図鑑番号・持ち物 category）の SoT を `data/raw` 直読から catalog YAML へ移す**。
**取得元は PokeAPI のまま**（`fetch:data` 継続）で、`data/raw` → catalog への転記を専任スクリプト
`materialize.ts`（新設）で行い、`generate.ts` は **raw を一切読まず catalog のみを変換**する形にする。これにより
`data/champions/catalog/*.yaml` が全データの単一 SoT になり、(a) 値が入力 YAML から直読でき、(b) Champions 実態
との差分を YAML 直編集で吸収でき（補正レイヤー不要）、(c) `generate` の raw 依存が消えて決定論性が上がる。
全186種の全量投入（Phase 15）の**手前**に置き、構造データを旧スキーマ（raw 直読）で全量投入してからやり直す
事故を防ぐ（Phase 10 と同じ論理）。

- スコープ内:
  - **catalog スキーマ拡張**: `catalog/species.yaml` の各エントリに **`dex`（図鑑番号）/ `types` / `stats`
    （H/A/B/C/D/S）/ `abilities`（id 配列）** を追加。`catalog/items.yaml` の各エントリに **`category`** を追加。
    名前・`megaLinks` / `megaStoneFor` は現状維持。メガ先エントリも種族値・タイプ・特性を持つ。
  - **`materialize.ts`（新設）**: `data/raw`（PokeAPI キャッシュ）から構造データを読み、catalog YAML の該当
    フィールドへ転記する専任スクリプト。**raw 必須・不在なら fail-fast でエラー**（自前の存在チェック・誘導は
    持たない＝raw 存在の担保は呼び出し側 skill の責務）。`pnpm materialize` 等で実行。
  - **`generate.ts` の raw 非依存化**: 種族値・タイプ・特性・図鑑番号・category を **catalog YAML から読む**よう
    変更し、`raw()` ヘルパと `data/raw` 参照を generate から除去する。`species-base.ts` / `items.ts` が catalog
    100% 由来になる（技構造は Phase 12 で既に Serebii authoring・raw 非依存）。
  - **`overrides.yaml` 廃止**: 参照ゼロ（`generate` / `check:regulation` とも未参照）・中身空で、learnset 撤去
    （Phase 12）と構造データ catalog 化により役割が消滅。ファイル削除と data-pipeline.md の overrides 記述除去。
  - **責務分離の明文化**: スクリプト（`fetch-pokeapi` / `materialize` / `generate` / `check-regulation`）は
    **前提が揃っている前提で動き、欠けたら fail-fast**。**raw 存在の担保は `survey-regulation` skill の責務**
    （手順で `fetch:data` → `materialize` の順を保証）。
  - **`survey-regulation` skill 改修**: 新エンティティ追記時に `fetch:data` → `materialize`（raw→catalog 転記）→
    authoring（名前等）の手順を内包（`skill-creator`・canonical + symlink パリティ）。
  - **型 / 生成物 / rule 追従**: `SpeciesBase` 等の生成形は不変（入力経路のみ変更）。`data-pipeline.md` の
    「PokeAPI 項目対応」表と vendor 記述を「取得元 PokeAPI・SoT は catalog・materialize 転記」へ改訂。
  - **ADR 起票（`adr-new`）**: 構造データ SoT の raw → catalog 移設・materialize スクリプト/スキル責務分離・
    overrides 廃止の決定（ADR 0025 = catalog name/type SoT の構造データ版の拡張）。
- スコープ外:
  - 技構造（威力等）の出自（**Phase 12** で Serebii authoring・PokeAPI 非依存に確定済み）。
  - M-A の全量データ投入（**Phase 15**）。本 Phase は**既存 catalog 分の移行 + 仕組み確定**のみ。
  - data ディレクトリ説明 README（**Phase 14**・本 Phase 後の最終形を索引化）。
  - PokeAPI からの取得そのものの廃止（**取得元は PokeAPI 継続**・`fetch:data` は残す）。

## 前提（依存）

- **Phase 10（catalog 日英名 authoring + generate 名前変換専任化）完了**。catalog が `id → { ja, en }` 形式で
  名前・タイプ相性を hand-authored SoT 化済み。本 Phase はその構造データ版で、同じ catalog エントリへ
  `dex` / `types` / `stats` / `abilities` / `category` を足す延長。ADR 0025 を拡張する。
- **Phase 12（PokeAPI を Champions legality / 技威力の信頼源から外す）完了**。learnset 照合が撤去され技構造が
  Serebii authoring 済みで、本 Phase で `generate` を raw 非依存化すると **raw を必要とするのは `materialize.ts`
  だけ**になる（`generate` / `check:regulation` は raw 不在でも動く）。`overrides.yaml` の役割消滅も Phase 12 の
  learnset 撤去が前提。
- 確定済み rule: [[data-pipeline]] / [[type-conventions]] / [[cli-and-io]] / [[cross-agent]] / [[adr]] /
  [[skill-authoring]] / [[testing]] / [[tsc-verification]]。
- 関連 ADR: ADR 0012（vendor PokeAPI・取得元として維持・SoT のみ catalog へ）/ ADR 0025（catalog name/type SoT・
  本 Phase で構造データへ拡張）。

## タスク

- [ ] **catalog スキーマ拡張**: `catalog/species.yaml` に `dex` / `types` / `stats` / `abilities`、
      `catalog/items.yaml` に `category` を追加（既存エントリ分を移行）。型（`SpeciesBase` 等）と整合。
- [ ] **`materialize.ts` 実装（新設）**: `data/raw` → catalog の構造データ転記。**raw 不在なら fail-fast でエラー**
      （存在チェック・`fetch:data` 誘導は持たない）。コロケーション test でカバレッジ 100%。
- [ ] **`generate.ts` 改修**: 種族値・タイプ・特性・図鑑番号・category を catalog から読むよう変更し、`raw()` /
      `data/raw` 参照を除去（raw 非依存化）。`species-base.ts` / `items.ts` が catalog 100% 由来に。
- [ ] **`overrides.yaml` 廃止**: ファイル削除 + `data-pipeline.md` の overrides 記述（description / ディレクトリ節 /
      項目対応表）除去。`generate` 等に残骸参照が無いことを確認。
- [ ] **`survey-regulation` skill 改修（`skill-creator`）**: 新エンティティ追記手順に `fetch:data` → `materialize`
      → authoring を内包し、**raw 存在の担保を skill 責務**として明文化。symlink パリティ。
- [ ] **`data-pipeline.md` 追従**: 「PokeAPI 項目対応」を「取得元 PokeAPI / SoT catalog / materialize 転記」へ改訂。
      vendor 記述を「raw=取得キャッシュ（materialize 元）/ catalog=SoT / generated=raw 非依存合成」へ。
- [ ] **ADR 起票（`adr-new`）**: 構造データ SoT 移設・materialize スクリプト/スキル責務分離・overrides 廃止の決定。
- [ ] 検証フェーズ実施（下記「検証手順」）。

## この Phase で育てるハーネス（rule・skill）

- **rule 追従**: [[data-pipeline]]（項目対応 / vendor 記述を SoT=catalog・materialize 転記・overrides 廃止へ）。
- **skill 改修**: `survey-regulation`（`fetch:data` → `materialize` → authoring の手順内包・raw 存在担保を責務化・
  `skill-creator`・[[skill-authoring]]）。
- **ADR**: 本 Phase の決定を `adr-new` で起票（ADR 0025 の構造データ拡張・[[adr]]・可変 plan 参照を本文に書かない）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- `catalog/species.yaml` が種族値 / タイプ / 特性 id / 図鑑番号を、`catalog/items.yaml` が category を保持し、
  これらが各エンティティの SoT になっている。
- `generate.ts` が **`data/raw` を一切読まず**、`species-base.ts` / `items.ts` を含む生成物を catalog YAML のみから
  生成する（生成物の形・値は移行前と等価）。
- `materialize.ts` が raw → catalog 転記を行い、**raw 不在時は fail-fast でエラー**になる（存在チェックを持たない）。
- `overrides.yaml` が削除され、参照・記述が残っていない。
- `survey-regulation` skill が `fetch:data` → `materialize` → authoring の順序と raw 存在担保を手順に持つ。
- 構造データ SoT 移設・責務分離・overrides 廃止の決定が ADR として残る（取得元 = PokeAPI 維持を明記）。

## 検証手順

1. `git grep -n 'data/raw\|RAW\|raw(' scripts/generate.ts` が空（generate が raw を読まない）ことを確認。
2. `pnpm generate:data` を **`data/raw` を空/退避した状態**で実行し、エラーなく生成物が出る（raw 非依存）ことを確認。
   生成物 diff が移行前と等価（種族値・タイプ・特性・図鑑番号・category が一致）であることをスポット確認。
3. `data/raw` 不在で `pnpm materialize` を実行し、**fail-fast でエラー終了**する（存在チェックで握りつぶさない）ことを確認。
4. `pnpm fetch:data` → `pnpm materialize` の順で catalog に構造データが転記され、再 `generate:data` で等価生成されることを確認。
5. `git grep -n overrides` が docs/rule/コード に残っていないことを確認（`overrides.yaml` 廃止の取り残しなし）。
6. `survey-regulation` skill を読み、`fetch:data` → `materialize` → authoring 手順と raw 存在担保が明記され、
   canonical / symlink パリティが取れていることを確認。
7. `pnpm verify` 緑を確認。`code-review`（src/scripts）/ `harness-review`（rule/skill/ADR）観点で点検。

## リスク・備考

- **意味的 atomic な 1 PR**: catalog スキーマ拡張・`materialize.ts`・`generate` raw 非依存化・型・生成物・overrides
  廃止は途中状態が壊れる（species-base が一部 raw / 一部 catalog だと整合しない）ため、Phase 10 同様に
  **意味的 atomic な 1 PR** とする。diff が過大なら「種族（species.yaml + generate species 経路）」と「持ち物
  （items.yaml + category）+ overrides 廃止」へ 2 PR 分割を許容（[[planning]] の分割・OVERVIEW に根拠記載）。
- **取得元は PokeAPI 維持**: 本 Phase は SoT の置き場所を変えるだけで、PokeAPI からの取得（`fetch:data`）は廃止
  しない。種族値・タイプ・特性・図鑑番号・category は Champions 非依存の構造データで PokeAPI の値が信頼できる
  （Phase 12 の「Champions legality / 技威力は PokeAPI 非依存」とは対象が異なる）。
- **materialize の上書き事故**: raw → catalog 転記時に hand-authored 値（Champions 実態に合わせた手修正）を
  上書きしないよう、materialize は append/既存尊重・diff 提示の方針にする（具体仕様は実装 + ADR で確定）。
- **raw 不在ハンドリングの責務**: スクリプトは fail-fast、raw 存在担保は `survey-regulation` skill。この分離を
  ADR と data-pipeline.md に明記し、スクリプト側に存在チェックを再実装しない（責務の二重化を避ける）。
- **Phase 15 への前提**: 本 Phase 完了後、Phase 15（M-A 全量投入）は全186種の構造データを catalog YAML へ
  `materialize` で投入する（raw 直読の旧経路は無い）。Phase 14（README）は本 Phase 後の最終形を索引化する。
- ADR 本文は可変 plan ファイル（phase doc / phase 番号 / OVERVIEW リンク）を参照しない（[[adr]]）。
