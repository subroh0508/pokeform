# AGENTS.md — pokeform 共有指示（Claude Code / Codex 共通）

pokeform は「Pokemon as Code」な TypeScript npm モジュール（ポケモンチャンピオンズ対応）。育成済み個体の管理とパーティ構築支援を、**コーディングエージェントが pnpm で機械的に検証しながら**ブラッシュアップできる土台を提供する。

このファイルは **Claude Code と Codex 両方が読む指示の SoT（Single Source of Truth）** です。詳細はインラインせず、正本（`docs/plan/01-mvp/architecture.md` と `.claude/rules/*`）へ**ポインタ**で逃がす。決定の「なぜ」は `docs/adr/`。

> **Claude Code へ**: path-scoped rules（`.claude/rules/*`）と skill frontmatter は自動ロードされるため、本ファイルに再掲しません。`CLAUDE.md` が `@AGENTS.md` でこれを取り込みます。
> **Codex / path-scoped rules 非対応ツールへ**: ファイルを編集する前に **`docs/harness/rules-index.md`**（glob → rule 対応表）で該当 rule を確認して読むこと。

## コマンド

| コマンド | 用途 |
|---|---|
| `pnpm install` | 依存導入（`prepare` で Git hooks 設定 + `rules-index.md` 再生成） |
| `pnpm verify` | **緑のゲート** = `tsc --noEmit` → `vitest run --coverage`（閾値 100%） → `biome check .` |
| `pnpm typecheck` | 型チェックのみ（`tsc --noEmit`） |
| `pnpm test` / `pnpm test:cov` | テスト / カバレッジ付きテスト |
| `pnpm lint` / `pnpm format` | Biome チェック / 自動修正 |

前進の単位は `pnpm verify` が**緑**になること。コミット / プッシュは Git hooks（`.githooks/`）が同じゲートを強制する（ツール非依存）。

## ディレクトリ構造（要点）

```
src/types/      型定義（XxxBase + XxxDex + XxxId パターン）
src/domain/     ドメインロジック（calc-stats / type-effectiveness / coverage）+ コロケーション test
src/io/         YAML/MD ローダ・パス解決
src/codegen/    YAML/MD → *.generated.ts + tsc 実行・診断整形
src/cli/        cac ルーティング・各コマンド
scripts/        fetch-pokeapi.ts / generate.ts / gen-rules-index.ts
data/raw/       PokeAPI キャッシュ（.gitignore）
data/champions/ skill 著述（rules.yaml/regulations/catalog・SoT・人間直編集 NG・コミット）
data/generated/ 生成データ（型 + 値・コミット）
docs/plan/      実装計画（01-mvp/architecture.md が規約正本）
docs/adr/       アーキ決定の不変ログ
docs/harness/   自己改良ループ（learnings）+ rules-index.md（生成）
.claude/rules/  規約・知識（paths 自動ロード）
.claude/skills/ 手順 skill（canonical）/ .agents/skills は symlink（Codex 共有）
.githooks/      検証ゲート（core.hooksPath）
```

詳細なファイル単位の責務は `docs/plan/01-mvp/architecture.md`（「ディレクトリ構成」節）。

## 鉄の規約（要約・正本は architecture.md と rules）

- **検証は tsc のみ**（Zod 等の実行時バリデーション不採用）。不正は YAML/MD → codegen → `tsc --noEmit` で**型エラー**として弾く。→ `tsc-verification.md` / ADR `0010`
- **カバレッジ 100%**（lines/branches/functions/statements）。ドメインロジックは完全網羅、薄い層は明示除外。テストは**プロダクションコードと同階層にコロケーション**。→ `testing.md`
- **Linter = Biome**（設定 1 ファイル）。
- **型は `XxxBase` + `XxxDex` + `XxxId = keyof XxxDex` で統一**。種族粒度は「種族値が一意 = 1 種族」。英名 ID をキー・日本語名を `name.ja`、逆引きマップで日英両対応。→ `type-conventions.md`
- **PokeAPI は vendor 方式**（取得 → 整形 → `data/generated/` をコミット）。`data/raw` のみ gitignore。→ `data-pipeline.md` / ADR `0012`
- **入力言語はファイル単位で `lang: ja|en` 宣言**。表示言語は `--lang`（独立）。問題検出時は**非0終了**。→ `cli-and-io.md` / ADR `0014`
- **ゲーム数値**: Lv50 / 個体値31 固定、能力ポイント 合計66・各 ≤32、性格 ±10%、実数値は**二重 floor**、レギュ M 系（メガ可 / テラス・ダイマ不可）。→ `game-spec.md`

## 進め方

- **実装指示・機能要望を受けたら、着手の前に必ず `plans-new` skill を一度経由する**（入口）。指示を OVERVIEW にまとめ 6 基準で 1 phase = 1 PR に分割してから着手へ繋ぐ。trivial な単発編集・会話的応答のみ例外。→ `planning.md` / ADR `0020`
- 作業単位は `docs/plan/` のフェーズ。各フェーズは受け入れ基準を満たし `pnpm verify` が**緑**で前進する。
- アーキ決定（技術選定・パターン採用・不可逆なトレードオフ）をしたら **`adr-new` skill で ADR を残す**。→ `adr.md`
- ハーネス資産（rules / skills / templates / AGENTS.md / CLAUDE.md / .githooks）を変えるときは cross-agent パリティを保つ。→ `cross-agent.md`
- PR は `.github/pull_request_template.md`（ソース）/ `.github/PULL_REQUEST_TEMPLATE/harness.md`（ハーネス改修）を使う。
- **ブランチ命名**: `<type>/<scope>-<purpose>`。例 = フェーズ実装 `harness/phase-NN-<slug>` / ソース機能 `feat/<slug>` / 修正 `fix/<slug>` / learning 集約 `harness/learnings-batch-YYYY-WW` / 個別ハーネス改修 `harness/<purpose>`。

## skill（手順・チェックリスト・最小概要）

skill は両ツール共有（canonical `.claude/skills/<name>/` + `.agents/skills/<name>` symlink）。**新規作成・改修は `skill-creator` skill を使う**（手書きしない）。→ `skill-authoring.md`

現行 skill:

- **`plans-new`** — **実装の入口**。実装指示をブラッシュアップし `docs/plan/NN-{slug}/OVERVIEW.md` にまとめ、6 基準で 1 phase = 1 PR に分割する。1 PR 妥当なら issue + `implementation-workflow`、複数なら計画群を起こして `start-phase` / `implementation-workflow` へ繋ぐ。→ `planning.md`
- **`start-phase`** — phase doc を読み依存・必要な rule/skill・受け入れ基準を整理して着手準備を整える。
- **`verify`** — `pnpm verify`（型 / テスト / カバレッジ / Lint）を実行し結果を要約。失敗時は最初の失敗箇所を指摘。
- **`finish-phase`** — `verify` で検証し受け入れ基準を照合・進捗更新、ADR / レトロの起動を促してフェーズを締める。
- **`adr-new`** — ADR を採番して `docs/adr/` に作成（supersede 対応）。
- **`pr-retrospective`** — マージ済 1 PR から KPT learning を生成しハーネス改善提案を起票。
- **`harness-meta`** — 複数 learning の改善提案を集約し採用 / 見送り / 撤去を判定してハーネスへ書き戻す。

> レビュー skill（`code-review` / `harness-review`）・`implementation-workflow` 等は後続フェーズで追加される。skill の正本一覧は `.claude/skills/` を参照。

## 規約索引へのポインタ

path-scoped rules を自動ロードしないツール（Codex 等）は、編集前に **`docs/harness/rules-index.md`** を参照して該当 rule を読む。Claude Code は `paths` で自動ロードされるため不要。この索引は `paths` frontmatter から `scripts/gen-rules-index.ts` で**生成**される（手書き禁止）。

## 正本リンク

- 規約・アーキ詳細: `docs/plan/01-mvp/architecture.md`
- 決定の「なぜ」: `docs/adr/`（`README.md` に一覧）
- rules: `.claude/rules/*`（索引は `docs/harness/rules-index.md`）
- クロスエージェント方針: `.claude/rules/cross-agent.md` / ADR `0016`
