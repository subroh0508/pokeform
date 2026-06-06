---
name: verify
description: >-
  検証ゲート（`pnpm verify` = 型 / テスト / カバレッジ / Lint）を実行し、結果を要約して返す。
  「検証して」「ゲートを通したい」「型 / テスト / カバレッジ / Lint を確認したい」「verify を回して」
  「緑か確認して」と言われたとき、コミット / PR 前に変更が壊れていないか確かめたいとき、
  あるいは finish-phase など他 skill から検証が必要なときに使う。失敗時は最初の失敗箇所を指摘する。
allowed-tools: Bash(pnpm *)
---

# verify — 検証ゲートを実行して結果を要約する

`pnpm verify` を実行し、**型 / テスト / カバレッジ / Lint** の 4 ゲートの結果を人間が一目で分かる形に
要約して返す手順 skill。判定ロジック（しきい値・対象）の正本は `package.json` / `vitest.config.ts` /
`biome.jsonc` 側にあり、**この skill はゲートを再実装せず、`pnpm verify` の結果を写して要約するだけ**。

## なぜこの skill があるか

`pnpm verify` の生ログは長く、どのゲートで落ちたか・なぜ落ちたかを毎回読み解くのは負担になる。
この skill は「緑か / 赤か」「赤ならどこか」を即座に判断できるよう出力を定型化する。
コミット前・PR 前・他 skill（`finish-phase` 等）からの呼び出しで繰り返し正しく使えることを狙う。

## 入力

- 引数は不要。常にリポジトリルートで `pnpm verify` を実行する。
- 依存未インストールで落ちる場合のみ `pnpm install` を先に促す（自動実行はしない。判断はユーザーに委ねる）。

## 出力

- 4 ゲート（型 / テスト / カバレッジ / Lint）それぞれの **PASS / FAIL** と一行サマリ。
- 全緑なら「✅ verify 緑」、いずれか赤なら「❌ verify 赤」を冒頭に置く。
- 赤のときは**最初に落ちたゲートと、その最初の失敗箇所**（型エラーの最初の 1 件 / 失敗した最初のテスト名 /
  カバレッジ不足ファイルと行 / Biome の最初の指摘）をファイルパス付きで指摘する。

## 手順

### 1. 検証を実行する

```bash
pnpm verify
```

`pnpm verify` は `pnpm typecheck`（`tsc --noEmit`）→ `pnpm test:cov`（`vitest run --coverage`・しきい値 100%）
→ `pnpm lint`（`biome check .`）を**この順で直列実行**する。前段が落ちると後段は走らないため、落ちたゲートより
後ろは「未実行」となる点に注意する。

### 2. 結果を 4 ゲートに振り分けて要約する

ログを次の観点で読み、各ゲートの PASS / FAIL を判定する:

- **型**: `tsc` がエラー 0 で終了したか。エラーは `path(line,col): error TSxxxx` 形式。
- **テスト**: vitest の `Test Files` / `Tests` が全 pass か。失敗は `FAIL` 行とテスト名で分かる。
- **カバレッジ**: しきい値 100%（lines / branches / functions / statements）を満たすか。不足は
  `ERROR: Coverage ... does not meet threshold` とカバレッジ表の Uncovered 行に出る。
- **Lint**: `biome check .` が `No fixes applied` 等で 0 件か。指摘は `path:line:col` 付きで出る。

### 3. 失敗時は最初の失敗箇所を指摘する

直列実行なので**最初に落ちたゲートが根本原因**。そのゲートの**先頭の失敗 1 件**をファイルパス付きで示し、
「ここを直してから再 verify」と促す。後段ゲートは未実行である旨も添える（直しても別の赤が残る可能性に注意）。

## 例

**全緑のとき:**

```
✅ verify 緑
- 型: PASS（tsc エラー 0）
- テスト: PASS（1 files / 1 tests）
- カバレッジ: PASS（lines/branches/functions/statements すべて 100%）
- Lint: PASS（biome 指摘 0）
```

**型で落ちたとき:**

```
❌ verify 赤（型ゲートで停止 → テスト / カバレッジ / Lint は未実行）
- 型: FAIL — src/foo.ts(12,5): error TS2322 で最初に停止
- テスト / カバレッジ / Lint: 未実行
→ src/foo.ts:12 の型エラーを直してから再 verify。
```

## Gotchas

- **ゲートを再実装しない**: 型 / テスト / カバレッジ / Lint の判定基準は `package.json` /
  `vitest.config.ts` / Biome 設定が正本。この skill は結果を写すだけで、独自にしきい値を持たない。
- **直列停止を踏まえる**: 最初に落ちたゲートより後ろは未実行。「全部の赤」を一度に列挙しようとしない。
- **Node エンジン警告は赤ではない**: `Unsupported engine` 等の `[WARN]` は verify の成否に影響しない。
  終了コードと各ゲートの実体ログで PASS/FAIL を判定する。
- **自動修正しない**: `biome check --write`（`pnpm format`）はこの skill の責務外。指摘の提示までに留める。

## 関連

- 検証ゲートの定義: `package.json`（`verify` script）/ `vitest.config.ts`（カバレッジしきい値）。
- 強制ゲート: `.githooks/`（pre-commit / pre-push）— ツール非依存の Git hooks ゲート。
- 呼び出し元: [`finish-phase`](../finish-phase/SKILL.md) がフェーズ完了時にこの skill を使う。
