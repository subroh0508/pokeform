# Phase 14 — data/ ディレクトリ説明 README（ポインタ式）を追加

## 目的 / スコープ

`data/` 配下に何が置かれ、各ファイル / ディレクトリが**何を表すか・スキーマ・情報源・どの skill / コマンドで
取得・更新するか**が、`data/` を開いた人にその場で分かる入口が無い（現状この情報は `.claude/rules/data-pipeline.md`
等に分散している）。本 Phase で **`data/README.md` を 1 枚追加**し、各ディレクトリの索引（何を表す / 情報源 /
取得・更新 skill・コマンド）を一望できるようにする。ただし**スキーマ定義の詳細は重複させず、SoT である rule へ
リンクするポインタ式**にする（同じ情報が複数箇所に分散しない・壁打ちで確定した方針）。Phase 12（PokeAPI 除外
決定）・Phase 13（構造データ catalog 化）の後に置き、情報源欄が確定済みの最終形（取得元・SoT・取得/更新の責務）を
反映する。

- スコープ内:
  - **`data/README.md` を 1 枚新規追加**。各エントリ（`raw/` / `champions/rules.yaml` /
    `champions/catalog/*.yaml` / `champions/regulations/<id>.yaml` / `generated/**`）について、
    **「何を表すか」「取得元」「SoT」「取得・更新する skill / コマンド（責務）」**を表形式で索引化する。
  - スキーマ定義・「なぜそうか」の詳細は **[[data-pipeline]] / [[type-conventions]] / [[cli-and-io]] /
    `architecture.md` / 関連 ADR へリンク**して委譲（ポインタ式・重複記述を持たない）。
  - 取得・更新の導線（`survey-regulation` / `author-individual` / `fetch:data` / `materialize` / `generate:data` /
    `check:regulation`）への参照を張り、「このディレクトリを更新したいときに何を使うか」と
    **raw 存在担保の責務（skill）/ スクリプト fail-fast** の責務分離を明示する。
- スコープ外:
  - data-pipeline.md 等 rule のスキーマ詳細の `data/README.md` への移設・複製（**しない**。SoT は rule 側）。
  - 各サブディレクトリへの個別 README 分散（**しない**。1 枚集約・壁打ちで確定）。
  - PokeAPI 利用方針・データモデルそのものの変更（**Phase 12 / 13** で確定済み・本 Phase は記述反映のみ）。
  - M-A 全量投入（**Phase 16**）。

## 前提（依存）

- **Phase 12（PokeAPI 除外決定 + harness 追従）完了**。Champions legality / 技威力 = Serebii 第一優先という
  確定済みの実態を README の取得元欄に反映できること。
- **Phase 13（構造データ catalog 化）完了**。種族値・タイプ・特性・図鑑番号・category の SoT が catalog YAML へ移り、
  `materialize` 経路・`overrides.yaml` 廃止・raw 存在担保の責務分離が確定済みで、README が**最終形**を索引化できること
  （途中状態を索引化してすぐ陳腐化するのを避けるため Phase 13 の後に置く）。
- **Phase 10（catalog 日英名 authoring）完了**。catalog の `id → { ja, en }` スキーマ・名前 SoT が確定済みで、
  README の情報源・スキーマ参照先がぶれないこと。
- 確定済み rule: [[data-pipeline]]（リンク先 SoT）/ [[type-conventions]] / [[cli-and-io]] / [[cross-agent]]。

## タスク

- [ ] `data/README.md` を新規作成し、`data/` 配下の各エントリを表で索引化:
  - [ ] 列 = **パス / 何を表すか / 取得元 / SoT / 取得・更新の skill・コマンド（責務）/ スキーマ詳細リンク**。
  - [ ] 行 = `raw/`・`champions/rules.yaml`・`champions/catalog/{species,moves,items,abilities,types}.yaml`・
        `champions/regulations/<id>.yaml`・`generated/{species-base,types,moves,abilities,items,names}.ts`・
        `generated/regulations/<id>/`（**`overrides.yaml` は Phase 13 で廃止済みのため載せない**）。
  - [ ] データの流れ（`PokeAPI →fetch:data→ raw →materialize→ catalog(SoT) →generate:data→ generated`・raw は
        materialize 元キャッシュ・raw 存在担保は skill 責務）の 1 行サマリと、詳細は [[data-pipeline]] へのリンク。
- [ ] スキーマ詳細・「なぜ」は [[data-pipeline]] / [[type-conventions]] / `architecture.md` / 関連 ADR へリンクし、
      README 本文に**重複記述を持たない**（ポインタ式）。
- [ ] 取得・更新導線（`survey-regulation` / `author-individual` / `fetch:data` / `materialize` / `generate:data` /
      `check:regulation`）への参照を張る。
- [ ] 検証フェーズ実施（下記「検証手順」）。

## この Phase で育てるハーネス（rule・skill）

- なし（既存 rule への**リンク集約**が中心で、新規 rule / skill は作らない）。SoT は引き続き
  [[data-pipeline]] 等の rule 側に置き、`data/README.md` はそこへ誘導する索引に徹する。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- `data/README.md` が存在し、`data/` 配下の各エントリについて「何を表すか / 情報源 / 取得・更新 skill・コマンド」が
  一望できる。
- スキーマ定義の詳細が `data/README.md` に**重複記述されておらず**、SoT（[[data-pipeline]] 等）へのリンクで委譲
  されている（同じ情報が複数箇所に分散しない）。
- 取得元 / SoT / 取得・更新の責務欄が確定済みの最終形（取得元 PokeAPI・SoT catalog・`materialize` 転記・技威力 /
  legality = Serebii・raw 存在担保 = skill 責務・`overrides.yaml` 廃止）を反映している。

## 検証手順

1. `data/README.md` 内のリンク先（rule / ADR / skill / architecture.md）が全て解決することを確認（リンク切れなし）。
2. README の各行が実在する `data/` 配下のパスと対応していることを確認（存在しないパス・抜けがない・廃止済み
   `overrides.yaml` を載せていない）。
3. スキーマ詳細が README に複製されていないこと（rule への参照になっていること）を目視確認（重複回避の方針遵守）。
4. 取得元 / SoT / 責務欄が Phase 12（legality / 技威力 = Serebii）/ Phase 13（構造データ = PokeAPI 取得→catalog SoT・
   materialize・raw 存在担保 = skill）の確定と矛盾しないことを確認。
5. `pnpm verify` 緑を確認。`harness-review` 観点でドキュメント整合・SoT 一貫性を点検。

## リスク・備考

- **重複の再発リスク**: README にスキーマ詳細を書き込むと rule とドリフトする。**ポインタ式を厳守**し、詳細は
  必ず SoT（rule / architecture.md / ADR）へリンクする（壁打ちで確定した体裁）。
- **取得元欄の鮮度**: PokeAPI が Champions 正式対応して Phase 12 の決定が見直されたら、本 README の取得元欄も
  追従が必要。SoT（rule）を直したら README のリンク先で吸収されるよう、README 側には方針の実体を持たせない。
- 本 README は索引であり、`data/raw/` の gitignore 方針・生成物の手書き編集禁止など運用ルールの SoT は
  [[data-pipeline]] 側に残す（README はそこへ誘導するだけ）。
