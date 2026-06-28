# Phase 2 — PokeAPI を日本語名 ja 専任へ縮小・構造取得廃止

## 目的 / スコープ

構造データ（種族値 / タイプ / 特性 id / 図鑑番号 / category）の取得を Phase 1 の showdown 経路へ委ね、**PokeAPI は日本語名 ja の取得専任**へ縮小する。PokeAPI の構造取得コードを除去し、`update-catalog` skill を ja 専任手順へ改訂する。

- スコープ内: `fetch-pokeapi.ts` / `materialize.ts` / `src/codegen/materialize.ts` の縮小、`update-catalog` 改訂、package.json scripts 改名。
- スコープ外: showdown-sync ワークフロー（Phase 3）、Serebii（Phase 4）、ADR（Phase 3/4）。

## 前提（依存）

- **Phase 1 完了**（showdown 経路で構造データを供給できる状態）。
- 確定済み rule: [[data-pipeline]] / [[cli-and-io]] / [[type-conventions]]。

## タスク

- [ ] `scripts/fetch-pokeapi.ts` を `names`(ja-Hrkt) 取得専任へ縮小（pokemon/pokemon-species/item の構造取得を除去）。`package.json` で `fetch:data` → `fetch:ja-names` に改名。
- [ ] `scripts/materialize.ts` を languages の ja backfill 専任へ縮小（構造 specs への書き込みを除去）。`package.json` で `materialize` → `sync:ja-names` に改名。
- [ ] `src/codegen/materialize.ts`(+test) から `extractSpeciesStructural` / `extractItemCategory` / 構造系 `planFields` を削除し、ja 系（`extractJaName` 等）のみ残す。カバレッジ 100%。
- [ ] `.claude/skills/update-catalog/SKILL.md` を「PokeAPI 構造 + ja」→「ja 専任（`fetch:ja-names` → `sync:ja-names`）」へ縮小改訂（`skill-creator` / [[skill-authoring]]）。canonical + symlink パリティ確認。

## この Phase で育てるハーネス（rule・skill）

- `update-catalog` skill を ja 専任へ縮小（`skill-creator` 利用）。data-pipeline.md の本格改訂は Phase 5 に集約するが、update-catalog の trigger/手順は本 phase で実態に合わせる。

## 受け入れ基準

- `pnpm verify` 緑。`src/codegen/materialize.ts` のカバレッジ 100%（構造系削除後）。
- PokeAPI 由来の構造書き込みが無くなり、ja のみが `languages/*.yaml` へ補完される。
- `pnpm fetch:ja-names` → `pnpm sync:ja-names` で既存 ja が再現でき、構造 specs に差分が出ない。

## 検証手順

1. `pnpm fetch:ja-names && pnpm sync:ja-names` を実行し、`git diff data/champions/*-specs.yaml`（構造）が空・`data/languages/*.yaml`（ja）のみ更新対象であることを確認。
2. `pnpm generate:data` → `pnpm verify` 緑を確認。
3. `update-catalog` SKILL.md の手順が ja 専任で完結することをレビュー。

## リスク・備考

- Champions 固有メガストーン（`starminite` 等）は PokeAPI 404 のままで ja が空になりうる。従来同様 generate の ja/en 必須ゲートが検出し、必要なら手入力補完（Phase 4 で Serebii 速報 ja でも補える）。
- 構造取得の削除で raw キャッシュの一部が不要化するが、`data/raw` は gitignore のため影響は限定的。
