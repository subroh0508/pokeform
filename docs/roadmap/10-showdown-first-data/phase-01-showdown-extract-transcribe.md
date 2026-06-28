# Phase 1 — showdown 抽出 + 転記 + 等価検証

## 目的 / スコープ

pokemon-showdown から解禁・構造・技メタ・メガ・持ち物を抽出し、SoT YAML へ転記する経路をローカルで構築する。既存の M-A/M-B データを showdown 経路で**再生成**し、現状の `data/champions/<reg>/*` と `src/generated/` に対し**取得元変更の意図差分以外が出ない**ことを等価検証する。この phase では PokeAPI / Serebii は温存し、取得元の置き換えは行わない（次 phase 以降）。

- スコープ内: `champions-data.ts` プロトの分割、抽出スクリプト群、転記の純関数 + 配線、tsconfig 除外、等価検証。
- スコープ外: GitHub Actions、Serebii 廃止、PokeAPI 縮小、ADR、skill 改廃（後続 phase）。

## 前提（依存）

- なし（本計画群の起点）。動作確認用プロトタイプ `champions-data.ts` と解説 `CHAMPIONS-DATA.md`（計画起票時のスクラッチ成果物・本セッションの scratchpad に退避済み）、`~/pokemon-showdown` clone を入力とする。
- 確定済み rule: [[data-pipeline]] / [[type-conventions]] / [[testing]]。

## タスク

- [x] `champions-data.ts`（346 行モノリス）を `scripts/showdown/` へデータセット別に分割: `dex.ts`（Dex.mod 解決 + calculatePP + isUsable* フィルタ）/ `species.ts` / `moves.ts` / `items.ts` / `abilities.ts` / `mega.ts` / `cli.ts`。
- [x] `tsconfig.json` の `exclude` に `scripts/showdown/**` を追加（`../sim/dex` 依存ゆえ typecheck/coverage 非対象）。
- [x] `src/codegen/showdown/{species,moves,items,abilities,mega}-fields.ts`（純関数）+ コロケーション test を作成（id kebab 化・types 小文字化・damageClass 写像・accuracy `true→null`・power `0(status)→null`・PP 8/12/16/20 検証）。カバレッジ 100%。
- [x] `scripts/sync-showdown.ts`（薄い配線・fs/YAML I/O のみ）を作成し、中間 JSON → `*-specs.yaml` + `<reg>/*.yaml` + `languages/*.yaml`(en) を append/上書き是正で更新。
- [x] `package.json` に `showdown:species/moves/items/abilities/mega` を追加（抽出 → 転記をデータセット別に駆動）。
- [x] `scripts/showdown/README.md` に `CHAMPIONS-DATA.md` の要点（mod 機構・calculatePP・実行手順）を移植する（scratchpad のスクラッチプロトは正式分割で役目を終える）。
- [x] M-A/M-B を showdown 経路で再生成し、既存 `data/champions/<reg>/*` と `src/generated/` の diff を確認（等価検証）。

## この Phase で育てるハーネス（rule・skill）

- なし（rule/skill の改訂は Phase 5 に集約）。本 phase は scripts/codegen の新設のみ。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。`src/codegen/showdown/*` のカバレッジ 100%。
- showdown 経路で再生成した M-A/M-B が、既存データと**取得元変更による意図差分以外で一致**する（差分は説明可能）。
- `scripts/showdown/**` が typecheck/coverage から除外され、`pnpm typecheck` が `../sim/dex` 未解決で落ちない。

## 検証手順

1. `pnpm showdown:species/moves/items/abilities/mega champions-m-a`（および m-b）で再生成し、`git diff data/champions/ src/generated/` を確認。
2. 差分が取得元変更の意図差分のみであることをスポット確認（種族値・タイプ・技メタ・メガ linking）。
3. `pnpm verify` 緑を確認。

## リスク・備考

- showdown ツリーでしか動かない `scripts/showdown/**` は機械ゲート対象外。最小の構文ネット（`node --check` 等）を手元で張る。
- PP は `move.pp`（基礎値）でなく `calculatePP` 適用後（8/12/16/20）を転記する（`CHAMPIONS-DATA.md` §3.4 の落とし穴）。
- 等価検証で意図しない差分が出た場合は転記純関数を是正してから次 phase へ進む（取得元置き換え前に経路の正しさを固める de-risk）。
