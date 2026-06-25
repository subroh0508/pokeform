# Phase 5 — ツールチェーンとバージョン固定

## 目的 / スコープ

検証コマンド（`pnpm verify`）を**実在させる**ための最小ツールチェーンを用意する。ライブラリのロジックは書かない。採用ツールの決定は ADR `0003`〜`0009`（旧 `0002` を要素別に分割・archive）。版は固定せず SoT（`package.json`/`pnpm-lock.yaml`/`.node-version`）に集約し、メジャー含め追従する（ADR `0008`）。

## 前提（依存）

- なし（Phase 1〜3 と独立。並行可）。着手時に最新バージョンを `npm view <pkg> version` / `pnpm -v` で再確認する。

## タスク

- [ ] `pnpm init`。`package.json` を編集:
  - [ ] `"type": "module"`
  - [ ] `"engines": { "node": ">=24" }`（soft floor。pnpm は corepack/packageManager に依存しない＝ADR 0005）
  - [ ] `"scripts"`:
    - `"typecheck": "tsc --noEmit"`
    - `"test": "vitest run"`
    - `"test:cov": "vitest run --coverage"`
    - `"lint": "biome check ."`
    - `"format": "biome check --write ."`
    - `"verify": "pnpm typecheck && pnpm test:cov && pnpm lint"`
    - `"prepare": "git config core.hooksPath .githooks"`（Phase 9 で使う Git hooks を有効化）
- [ ] `devDependencies` をインストール: `typescript` / `@biomejs/biome` / `vitest` / `@vitest/coverage-v8`（版は SoT=package.json/lockfile に集約。メジャー含め追従＝ADR 0008）
- [ ] `tsconfig.json`（`strict: true`, `moduleResolution: "bundler"`, `noEmit` 既定, `module: ESNext`, `target` は Node 24 相当）
- [ ] `tsconfig.generated.json`（雛形。`include: ["**/*.generated.ts"]`。本格運用は MVP Phase 2）
- [ ] `biome.json`（推奨ルール + フォーマッタ設定）
- [ ] `vitest.config.ts`: `include: ["src/**/*.test.ts"]`（**テストはプロダクションコードと同階層にコロケーション**・`tests/` ディレクトリは作らない）, `coverage.provider: "v8"`, `coverage.thresholds: { lines:100, branches:100, functions:100, statements:100 }`, `coverage.exclude` に `**/*.test.ts` / `**/__fixtures__/**` ＋後続で薄い層を除外
- [ ] `.gitignore`: `node_modules` / `dist` / `coverage` / `data/raw`
- [ ] `.node-version`（または `.nvmrc`）: `24`
- [ ] 空でも `pnpm verify` が緑に通ることを保証（テスト 0 件で通らない場合は placeholder テストを 1 件置く）

## 受け入れ基準

- `pnpm install` 後、`pnpm verify` が 0 終了する。
- `node -v` が `.node-version` に整合し、`pnpm -v` が取得できる（pnpm の版は固定しない）。
- カバレッジ閾値 100% の判定が機能している（意図的に未カバー行を作ると失敗する）。

## 検証手順

1. `pnpm install` → `pnpm verify` が緑。
2. `pnpm typecheck` / `pnpm test:cov` / `pnpm lint` が個別に通る。

## リスク・備考

- バージョンは着手時点の最新を再確認（このフェーズ doc の数値は 2026-06 時点）。メジャーは固定、マイナー/パッチは最新で可。
- `prepare` の `core.hooksPath` 設定は Phase 9 で `.githooks/` を作るまで実害なし（参照先が空でもエラーにならない）。
