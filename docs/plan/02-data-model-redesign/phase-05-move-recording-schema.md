# Phase 5 — 技記録スキーマ再設計（block 記法・種族キー = 解禁・generate 読取り追従）

## 目的 / スコープ

`data/champions/regulations/<id>.yaml` の記録方法を再設計し、**種族×レギュレーションの技対応を YAML で
直読できる**ようにする。`allow.{species,items,mega,moves}` のフラット構造を廃し、**トップレベルの種族IDキー
（キーの存在 = 解禁）+ per-species `moves`・`mega`** へ移す。`name`/`period`/`items` は予約キー。YAML は
**ブロック記法**で統一する。`scripts/generate.ts` を新スキーマ読取りへ追従させ、生成物
`data/generated/regulations/<id>/species.ts` を**出力等価**に保つ（現行値の構造移行のみ）。

本 phase は **記録方法（データ形式）の変更に専念**する。`generate.ts` の learnset 検証は**この phase では
残す**（安全性を割らないため・除去は Phase 6）。各種族の技の全量化は Phase 7。

- スコープ内:
  - 新 YAML スキーマ（block 記法・種族キー = 解禁・per-species `moves`/`mega[]`・予約キー `name`/`period`/`items`）への移行。
  - `mega` を**配列**化（1 種族が複数メガを持ちうる）。型・generate・`catalog/species.yaml` の `megaLinks` を配列対応へ。
  - `generate.ts`：roster をトップレベル種族キー（予約キー除外）から取得、`moves` を YAML 値から採用。
  - `src/io/*`（`data/champions` ローダ）・`src/types/*`（regulation 入力型）を新スキーマへ追従。
  - ADR 0022 起票（per-reg 技記録方法）。`.claude/rules/data-pipeline.md` 追従。
- スコープ外:
  - `generate.ts` の learnset 検証除去・`check:regulation` 新設（**Phase 6**）。
  - 各種族の技の全量化・全186種への roster 拡張（**Phase 7**）。M-B 正確データ。`species.ts` の `moves`/その他形の変更
    （`megaEvolvesTo` の単数→配列化のみ本 phase で行う）。

## 前提（依存）

- **Phase 4（per-regulation 種族型）完了**（マージ済み）。`regulations/<id>/species.ts` が per-reg 種族 dex の正本で
  `moves` を per-reg 属性に持つこと。
- 確定済み rule: [[data-pipeline]] / [[cli-and-io]] / [[type-conventions]] / [[testing]]。ADR 0021。
- 確定した設計判断（OVERVIEW「設計方針の再々改訂」・ユーザー合意済み）:
  - 種族IDキー = 解禁（`allow` 廃止）。per-species `moves`・`mega[]`（配列）。`items` 予約キー。block 記法。
  - `generate.ts` は最終的に変換専任（本 phase は読取り追従まで・検証除去は Phase 6）。`species.ts` 出力等価。

## タスク

- [ ] `data/champions/regulations/champions-m-a.yaml` / `champions-m-b.yaml` を新スキーマ（block 記法）へ書き換え:
  - [ ] 予約キー `name` / `period` / `items` を block 記法で維持。`allow` ラッパー廃止。
  - [ ] トップレベルに種族IDキーを列挙（キー存在 = 解禁）。各値に `moves:`（block シーケンス・現行値を等価移行）。
  - [ ] メガ運用種族は `mega:`（**block シーケンス = 配列**）を種族にコロケーション（例 `charizard.mega: [charizard-mega-x]`）。
- [ ] `src/types/*` を更新:
  - [ ] regulation 入力型を新スキーマ（種族キー map + 予約キー）へ。
  - [ ] per-reg 種族 dex / `species-base.ts` の `megaEvolvesTo` を**単数 → `readonly string[]`** に変更（配列化）。
- [ ] `scripts/generate.ts` を新スキーマ読取りへ追従:
  - [ ] per-reg roster をトップレベル種族キー（予約キーセットで除外）から取得（旧 `allow.species` 置換）。
  - [ ] 各種族の `moves` を YAML 値から採用（**learnset 検証はこの phase では残す**＝覚えない技はエラー）。
  - [ ] `megaEvolvesTo` を配列で出力。`species.ts` の他フィールド形（`dex`/`name`/`types`/`baseStats`/`abilities`/`moves`/`items`）は不変。
- [ ] `data/champions/catalog/species.yaml` の `megaLinks` を 1 base → 複数メガ先（配列）対応へ（型・generate の追従。データ全量は Phase 7）。
- [ ] `src/io/*` ローダ・パス解決を新スキーマへ追従。
- [ ] `adr-new` で **ADR 0022** 起票（per-reg 技記録方法＝species-keyed・block・mega 配列）。0021 の記録方法の該当箇所を改訂
      （per-reg species 正本の核は不変＝full supersede でなく改訂・status 運用は `adr-new` で判断）。
- [ ] `.claude/rules/data-pipeline.md` を新スキーマへ更新。
- [ ] テスト追従（コロケーション・カバレッジ100%）: io ローダ・生成スナップショット等価・mega 配列の型テスト。

## この Phase で育てるハーネス（rule・skill）

- `.claude/rules/data-pipeline.md`（新 YAML スキーマ・block 記法・mega 配列・予約キー仕分け）を更新。
- ADR 0022 1 本（`adr-new`）。新規 skill なし（`survey-regulation` の更新は Phase 6）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- `regulations/<id>.yaml` を読むだけで種族ごとの解禁技（種族IDキー下の `moves`）が確認できる。block 記法。
- `mega` が配列で、1 種族複数メガを表現できる（型・generate・catalog が配列対応）。
- 移行後の `species.ts` が移行前と**出力等価**（記録方法と `megaEvolvesTo` の配列化以外に差分なし）。
- ADR 0022 が `docs/adr/` に起票されている。

## 検証手順

1. 新スキーマ（block 記法）へ移行後 `pnpm generate:data` し、`species.ts` の差分が記録方法 + `megaEvolvesTo` 配列化のみであることを確認。
2. `mega` に複数要素を持つ fixture（例 charizard X/Y）で per-reg dex の `megaEvolvesTo` が配列で生成されることを確認。
3. 覚えない技を混ぜた YAML で `generate:data` がエラーになることを確認（learnset 検証はこの phase では generate に残存）。
4. `pnpm verify` 緑を確認。

## リスク・備考

- **不可逆性**: 入力データ形式（YAML スキーマ）と型（`megaEvolvesTo` 配列化）の変更。1 PR 内で緑を維持する。
- 予約キー（`name`/`period`/`items`）と種族IDキーの同階層共存は、種族 slug が小文字 kebab で予約語と衝突しない
  前提に依存する。`generate.ts` / ローダは明示的な予約キーセットで仕分ける。
- **安全性を割らない**: 本 phase では generate の learnset 検証を残す。検証の authoring 移設は Phase 6 で
  `check:regulation` を用意してから行う（順序厳守）。
- `catalog/moves.yaml` は引き続き fetch 対象の append-only マニフェストとして残す。
