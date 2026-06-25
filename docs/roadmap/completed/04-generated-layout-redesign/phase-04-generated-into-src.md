# Phase 4 — 生成物を `data/generated/` から `src/generated/` へ移動

## 目的 / スコープ

生成 TS の配置を `data/generated/` から **`src/generated/`** へ移し、生成物をソースツリー内に置く。`data/` は
**ソース YAML（`champions/` / `languages/`）専用**に純化し、生成 TS はソースと同じ `src/` ツリーに集約する。
意味変更（名前 SoT・items legality）は伴わない**配置の移動のみ**。

- スコープ内:
  - `scripts/generate.ts` の **emit ルートを `src/generated/` へ**（`champions/*` / `m-*/` / `languages/*` の
    出力先ディレクトリ変更・相対 import の自動追従）。
  - **全 consumer の import パス**（`src/types/**` / `src/io/**` / `src/cli/**` / `src/index.ts` /
    テスト fixture）を `../../data/generated/...` → 新パス（`./generated/...` 等）へ一括更新。
  - **ツール設定の include/exclude glob**: `tsconfig.json`・`biome.json`・`vitest.config.ts`（カバレッジ）・
    `package.json`（`exports` / `files`）・`.gitignore` を新パスへ。**生成物はカバレッジ / Biome / 「ソースとしての
    型検査対象」から除外**する扱いを `src/generated/**` へ移設する（[[testing]] の「生成物は明示除外」）。
  - **生成物は引き続きコミット**（vendor 方式・ADR 0012）。`data/raw` のみ gitignore は不変。
  - rule / skill / docs / README の `data/generated` パス参照を `git grep` で一掃（旧パス残存ゼロ）。
- スコープ外: ソース YAML（`data/champions` / `data/languages`）の移動はしない。レギュ名の languages 移動
  （Phase 5）。items の型 legality（Phase 6）。生成値の変更。

## 前提（依存）

- **Phase 1-3 完了**（新レイアウトが生成・型・consumer・ハーネスで確定済み）。
- [[testing]]（生成物のカバレッジ除外）/ [[data-pipeline]]（vendor 方式・生成物コミット）/ [[tsc-verification]]。

## タスク

- [ ] `scripts/generate.ts` の emit ルート定数を `data/generated` → `src/generated` へ変更。
- [ ] `pnpm generate:data` を実行し `src/generated/` に生成ツリーを出力、`data/generated/` を `git rm`（移動）。
- [ ] 全 consumer の import パスを新パスへ更新（`git grep -l "data/generated"` で機械的に拾う）。
- [ ] `tsconfig.json` / `biome.json` / `vitest.config.ts` / `package.json` / `.gitignore` の glob を新パスへ。
      **`src/generated/**` をカバレッジ・Biome・型検査の「ソース」扱いから除外**（生成物として明示除外）。
- [ ] rule / skill / architecture.md / README 群の `data/generated` 参照を `git grep` で一掃。
- [ ] `pnpm generate:data` → `pnpm verify` 緑。

## この Phase で育てるハーネス（rule・skill）

- [[testing]] / [[data-pipeline]] の「生成物の配置 = `src/generated/`」追従（パス記述の更新）。新規 rule/skill は作らない。

## 受け入れ基準

- 生成ツリーが `src/generated/`（`champions/*-specs.ts` / `champions/m-*/` / `languages/*`）に出力され、
  `data/generated/` が消える。`data/` 配下はソース YAML（`champions/` / `languages/`）のみになる。
- `pnpm verify`（型 / カバレッジ100% / Biome / `check:yaml-style`）が緑。**`src/generated/**` がカバレッジ /
  Biome の対象外**で、生成物に 100% カバレッジ要求や lint 違反が出ない。
- **reg-aware 型機構の回帰なし**: 既存個体 YAML が解禁判定で正しく通り、覚えない技でブランドエラーが出る。
- `data/generated` への参照が rule / skill / docs / src / scripts に残らない（`git grep` で確認）。
- `pnpm generate:data` が決定論的に `src/generated` を再生成（再実行で `git diff --quiet`）。

## 検証手順

1. `pnpm generate:data` 後、`src/generated/` にツリーが出力され `data/generated/` が存在しないことを確認。
2. `git grep -n "data/generated"` が 0 hit（移行注記を除く）。
3. `pnpm verify` 緑。カバレッジ集計に `src/generated/**` が含まれない（除外 glob 有効）ことを確認。
4. 既存個体 YAML で `pnpm typecheck` 緑、覚えない技ダミーで tsc ブランドエラー → 復帰。

## リスク・備考

- **最大リスク = ツール glob の追従漏れ**。`src/**` は通常カバレッジ100%・Biome・型検査の対象。生成物を
  `src/generated/` に置くと、除外 glob を更新しない限り「生成物に 100% カバレッジ要求」「生成コードの
  lint 違反」で `pnpm verify` が割れる。`vitest.config.ts`（`coverage.exclude`）・`biome.json`
  （`files.includes` / ignore）・`tsconfig.json` を**同一 PR で**更新する（learning #102 = doc-data 乖離防止と同型）。
- import パスは相対が多数（`../../data/generated/...`）。`src/generated/` 化で相対深さが変わるため機械的に
  全置換し、tsc で解決を担保する。
- 生成物のコミットは継続（vendor・ADR 0012）。`.gitignore` は `data/raw` のみ無視を維持し、`src/generated` を
  誤って ignore しない。
