# AGENTS.md — pokeform 共有指示（Claude Code / Codex 共通）

pokeform は「Pokemon as Code」な TypeScript npm モジュール（ポケモンチャンピオンズ対応）。育成済み個体の管理とパーティ構築支援を、**コーディングエージェントが pnpm で機械的に検証しながら**ブラッシュアップできる土台を提供する。

このファイルは **Claude Code と Codex 両方が読む指示の SoT（Single Source of Truth）** です。詳細はインラインせず、正本（規約は `.claude/rules/*`・設計俯瞰は `docs/design/`）へ**ポインタ**で逃がす。決定の「なぜ」は `docs/adr/`。

> **Claude Code へ**: path-scoped rules（`.claude/rules/*`）と skill frontmatter は自動ロードされるため、本ファイルに再掲しません。`CLAUDE.md` が `@AGENTS.md` でこれを取り込みます。
> **Codex / path-scoped rules 非対応ツールへ**: ファイルを編集する前に **`docs/harness/rules-index.md`**（glob → rule 対応表）で該当 rule を確認して読むこと。

## コマンド

**正本は `package.json` の `scripts`**。日常的に使う要点のみ:

| コマンド | 用途 |
|---|---|
| `pnpm install` | 依存導入（`prepare` で Git hooks 設定 + `rules-index.md` 再生成） |
| `pnpm verify` | **緑のゲート** = `typecheck`（`tsc --noEmit`）→ `test:cov`（`vitest run --coverage`・閾値 100%）→ `lint`（`biome check .`）→ `check:yaml-style` |
| `pnpm typecheck` / `pnpm test` / `pnpm test:cov` | 型チェック / テスト / カバレッジ付きテスト |
| `pnpm lint` / `pnpm format` | Biome チェック / 自動修正 |

データ著述・検証・生成・CLI（`check:party` / `check:individual` / `check:regulation` / `check:yaml-style` / `analyze:coverage` / `generate:data` / `materialize` / `fetch:serebii` / `scrape:serebii` / `serebii:catalog` / `pokeform` / `compile` 等）は **`package.json` scripts が正本**で、手順は各 skill（`survey-regulation` / `update-catalog` / `author-individual` / `review-party` 等）に従う。

前進の単位は `pnpm verify` が**緑**になること。コミット / プッシュは Git hooks（`.githooks/`）が同じゲートを強制する（ツール非依存）。

## ディレクトリ構造（要点）

```
src/types/      型定義（XxxBase + XxxDex + XxxId パターン）
src/domain/     ドメインロジック（calc-stats / type-effectiveness / coverage）+ コロケーション test
src/io/         YAML/MD ローダ・パス解決
src/codegen/    YAML/MD → *.generated.ts + tsc 実行・診断整形
src/cli/        cac ルーティング・各コマンド
src/generated/  生成データ（champions/{6 種 *-specs + <reg>/} + languages/・型 + 値・コミット）
scripts/        fetch-pokeapi.ts / generate.ts / gen-rules-index.ts
data/raw/       PokeAPI キャッシュ（.gitignore）
data/champions/ 構造 SoT（種族値/タイプ/特性/図鑑/分類/技メタ）= rules.yaml + 6 種 *-specs.yaml（species/mega/item/ability/move/type）+ <reg>/（per-reg 解禁）・skill 著述・人間直編集 NG
data/languages/ 名前 SoT（id→{ja,en}・ゲーム非依存）= species/items/abilities/moves/types/mega/regulations.yaml・skill 著述
docs/design/    設計俯瞰（コードなし・Explanation 象限・なぜ / 全体図 / 責務）
docs/roadmap/   実装計画・進捗（フェーズ単位・完了は completed/ へ集約）
docs/adr/       アーキ決定の不変ログ
docs/harness/   自己改良ループ（learnings）+ rules-index.md（生成）
.claude/rules/  規約・知識（paths 自動ロード）
.claude/skills/ 手順 skill（canonical）/ .agents/skills は symlink（Codex 共有）
.githooks/      検証ゲート（core.hooksPath）
```

詳細なファイル単位の責務は各 rule（`.claude/rules/*`・paths スコープ）と設計俯瞰 [docs/design/](docs/design/README.md)。データの 3 つの SoT（構造 / 名前 / per-regulation）の俯瞰は [docs/design/data-pipeline.md](docs/design/data-pipeline.md)。

## 鉄の規約（要約・正本は rules と `src/`）

- **検証は tsc のみ**（Zod 等の実行時バリデーション不採用）。不正は YAML/MD → codegen → `tsc --noEmit` で**型エラー**として弾く。→ `tsc-verification.md` / ADR `0010`
- **カバレッジ 100%**（lines/branches/functions/statements）。ドメインロジックは完全網羅、薄い層は明示除外。テストは**プロダクションコードと同階層にコロケーション**。→ `testing.md`
- **Linter = Biome**（設定 1 ファイル）。
- **型は `XxxBase` + `XxxDex` + `XxxId = keyof XxxDex` で統一**。種族粒度は「種族値が一意 = 1 種族」。英名 ID をキー・日本語名を `name.ja`、逆引きマップで日英両対応。→ `type-conventions.md`
- **PokeAPI は vendor 方式**（取得 → 整形 → `src/generated/` をコミット）。`data/raw` のみ gitignore。→ `data-pipeline.md` / ADR `0012`
- **入力言語はファイル単位で `lang: ja|en` 宣言**。表示言語は `--lang`（独立）。問題検出時は**非0終了**。→ `cli-and-io.md` / ADR `0014`
- **ゲーム数値**: Lv50 / 個体値31 固定、能力ポイント 合計66・各 ≤32、性格 ±10%、実数値は**二重 floor**、レギュ M 系（メガ可 / テラス・ダイマ不可）。→ `game-spec.md`

## 進め方

- **実装指示・機能要望を受けたら、着手の前に必ず `plans-new` skill を一度経由する**（入口）。指示を OVERVIEW にまとめ 6 基準で 1 phase = 1 PR に分割してから着手へ繋ぐ。trivial な単発編集・会話的応答のみ例外。→ `planning.md` / ADR `0020`
- 作業単位は `docs/roadmap/` のフェーズ。各フェーズは受け入れ基準を満たし `pnpm verify` が**緑**で前進する。
- アーキ決定（技術選定・パターン採用・不可逆なトレードオフ）をしたら **`adr-new` skill で ADR を残す**。→ `adr.md`
- ハーネス資産（rules / skills / templates / AGENTS.md / CLAUDE.md / .githooks）を変えるときは cross-agent パリティを保つ。→ `cross-agent.md`
- PR は `.github/pull_request_template.md`（ソース）/ `.github/PULL_REQUEST_TEMPLATE/harness.md`（ハーネス改修）/ `.github/PULL_REQUEST_TEMPLATE/plan.md`（計画起票・plan doc / renumber / cross-plan move）を使う。
- **ブランチ命名**: `<type>/<scope>-<purpose>`。例 = フェーズ実装 `harness/phase-NN-<slug>` / ソース機能 `feat/<slug>` / 修正 `fix/<slug>` / learning 集約 `harness/learnings-batch-YYYY-WW` / 個別ハーネス改修 `harness/<purpose>`。

## skill（手順・チェックリスト）

skill は両ツール共有（canonical `.claude/skills/<name>/` + `.agents/skills/<name>` symlink）。**正本一覧は `.claude/skills/`**（各 `SKILL.md` frontmatter の `description` が発火 trigger）。**新規作成・改修は `skill-creator` skill を使う**（手書きしない）。→ `skill-authoring.md`

入口となる skill を用途別に挙げる（全 skill・詳細は `.claude/skills/` 参照）:

- **計画**: `plans-new`（**実装の入口**・指示 → `docs/roadmap/NN-{slug}/OVERVIEW.md` → 6 基準で 1 phase = 1 PR に分割）。→ `planning.md`
- **実装駆動**: `implementation-workflow`（worktree〜マージ〜レトロ〜後片付けを多段で統合）。単発は `start-phase`（着手）/ `verify`（検証ゲート）/ `finish-phase`（締め）。
- **レビュー**: `code-review`（`src/**` / `scripts/**`）/ `harness-review`（ハーネス資産）。→ `code-review.md`
- **レトロ / メタ**: `pr-retrospective`（マージ済 1 PR → KPT learning）/ `harness-meta`（複数 learning 集約 → ハーネス書き戻し）。
- **データ著述**: `survey-regulation`（レギュ解禁）/ `update-catalog`（PokeAPI 構造 + 名前）/ `author-individual`（個体）/ `review-party`（パーティ点検）/ `stat-tuning`（振り調整）。
- **その他**: `adr-new`（ADR 採番・supersede 対応）/ `dep-update`（依存更新 PR の可否判断）。

## 規約索引へのポインタ

path-scoped rules を自動ロードしないツール（Codex 等）は、編集前に **`docs/harness/rules-index.md`** を参照して該当 rule を読む。Claude Code は `paths` で自動ロードされるため不要。この索引は `paths` frontmatter から `scripts/gen-rules-index.ts` で**生成**される（手書き禁止）。

## 正本リンク

- 設計俯瞰: [`docs/design/`](docs/design/README.md)（コードなし・README が index）
- 規約・具体値: `.claude/rules/*`（1 rule = 1 正本）
- 決定の「なぜ」: `docs/adr/`（`README.md` に一覧）
- rules: `.claude/rules/*`（索引は `docs/harness/rules-index.md`）
- クロスエージェント方針: `.claude/rules/cross-agent.md` / ADR `0016`
