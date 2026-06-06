# Phase 4 — ツールチェーンとバージョン固定

## 目的 / スコープ

検証コマンド（`pnpm verify`）を**実在させる**ための最小ツールチェーンを用意し、Node / pnpm / 各パッケージのバージョンを固定する。ライブラリのロジックは書かない。バージョンピン留めの決定は Phase 3 で `0006-pin-toolchain-and-dockerize` として ADR 化済み。

## 前提（依存）

- なし（Phase 1〜3 と独立。並行可）。着手時に最新バージョンを `npm view <pkg> version` / `pnpm -v` で再確認する。

## タスク

- [ ] `pnpm init`。`package.json` を編集:
  - [ ] `"type": "module"`
  - [ ] `"packageManager": "pnpm@11.5.1"`
  - [ ] `"engines": { "node": ">=24", "pnpm": ">=11" }`
  - [ ] `"scripts"`:
    - `"typecheck": "tsc --noEmit"`
    - `"test": "vitest run"`
    - `"test:cov": "vitest run --coverage"`
    - `"lint": "biome check ."`
    - `"format": "biome check --write ."`
    - `"verify": "pnpm typecheck && pnpm test:cov && pnpm lint"`
    - `"prepare": "git config core.hooksPath .githooks"`（Phase 8 で使う Git hooks を有効化）
- [ ] `devDependencies`（メジャー固定）をインストール: `typescript@6` / `@biomejs/biome@2` / `vitest@4` / `@vitest/coverage-v8@4`
- [ ] `tsconfig.json`（`strict: true`, `moduleResolution: "bundler"`, `noEmit` 既定, `module: ESNext`, `target` は Node 24 相当）
- [ ] `tsconfig.generated.json`（雛形。`include: ["**/*.generated.ts"]`。本格運用は MVP Phase 2）
- [ ] `biome.json`（推奨ルール + フォーマッタ設定）
- [ ] `vitest.config.ts`: `coverage.provider: "v8"`, `coverage.thresholds: { lines:100, branches:100, functions:100, statements:100 }`, `coverage.exclude` は後続で薄い層を除外する想定で用意（現時点は空可）
- [ ] `.gitignore`: `node_modules` / `dist` / `coverage` / `data/raw`
- [ ] `.node-version`（または `.nvmrc`）: `24`
- [ ] 空でも `pnpm verify` が緑に通ることを保証（テスト 0 件で通らない場合は placeholder テストを 1 件置く）

## 受け入れ基準

- `pnpm install` 後、`pnpm verify` が 0 終了する。
- `node -v` が v24 系、`pnpm -v` が 11.5.1。
- カバレッジ閾値 100% の判定が機能している（意図的に未カバー行を作ると失敗する）。

## 検証手順

1. `pnpm install` → `pnpm verify` が緑。
2. `pnpm typecheck` / `pnpm test:cov` / `pnpm lint` が個別に通る。

## リスク・備考

- バージョンは着手時点の最新を再確認（このフェーズ doc の数値は 2026-06 時点）。メジャーは固定、マイナー/パッチは最新で可。
- `prepare` の `core.hooksPath` 設定は Phase 8 で `.githooks/` を作るまで実害なし（参照先が空でもエラーにならない）。
