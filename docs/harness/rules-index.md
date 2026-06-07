<!-- 生成物: scripts/gen-rules-index.ts が .claude/rules/*.md の paths frontmatter から生成。
     手書き編集しない。rule の paths を変えたら `node scripts/gen-rules-index.ts` で再生成する。 -->

# rules インデックス（Codex 等・path-scoped rules 非対応ツール向け）

このリポジトリの規約・知識は `.claude/rules/*.md` に置かれ、各 rule の `paths` frontmatter が
「どのファイルを編集するとき読むべきか」を宣言している。**Claude Code は `paths` を自動ロードする
ため本索引は不要**。path-scoped rules を自動ロードしないツール（Codex 等）は、ファイルを編集する前に
下表で対応 rule を確認して読むこと。クロスエージェント方針は `.claude/rules/cross-agent.md`。

## glob → 該当 rule

ファイルパスがこの glob にマッチしたら、対応 rule を読んでから編集する。

| glob | 該当 rule |
|---|---|
| `.agents/skills/**` | `skill-authoring.md` |
| `.claude/**` | `code-review.md` |
| `.claude/skills/**` | `skill-authoring.md` |
| `.claude/skills/harness-meta/**` | `harness-meta-criteria.md`, `retrospective-format.md` |
| `.claude/skills/implementation-workflow/**` | `implementation-workflow.md` |
| `.claude/skills/pr-retrospective/**` | `retrospective-format.md` |
| `**/*.test.ts` | `testing.md` |
| `AGENTS.md` | `code-review.md` |
| `CLAUDE.md` | `code-review.md` |
| `data/**` | `data-pipeline.md`, `game-spec.md` |
| `data/generated/**` | `type-conventions.md` |
| `docs/**` | `code-review.md` |
| `docs/harness/**` | `redaction.md` |
| `docs/harness/learnings/**` | `retrospective-format.md` |
| `docs/plan/**` | `planning.md` |
| `scripts/**` | `code-review.md`, `data-pipeline.md` |
| `src/**` | `code-review.md` |
| `src/cli/**` | `cli-and-io.md` |
| `src/codegen/**` | `tsc-verification.md` |
| `src/domain/**` | `game-spec.md` |
| `src/io/**` | `cli-and-io.md` |
| `src/types/**` | `tsc-verification.md`, `type-conventions.md` |

## 常時参照する rule（paths なし）

| rule | 概要 |
|---|---|
| `adr.md` | アーキテクチャ決定を ADR として残す方針・採番・supersede 手順。技術選定やパターン採用、不可逆なトレードオフを伴う決定をしたとき常に適用する。 |
| `cross-agent.md` | クロスエージェント共有方針の SoT（AGENTS.md=指示 SoT / CLAUDE.md=@AGENTS.md / skill symlink 共有と copy フォールバック / rules-index 生成 / Git hooks=ゲート SoT）。常時適用する。 |

## 全 rule 一覧

| rule | スコープ | 概要 |
|---|---|---|
| `adr.md` | _常時_ | アーキテクチャ決定を ADR として残す方針・採番・supersede 手順。技術選定やパターン採用、不可逆なトレードオフを伴う決定をしたとき常に適用する。 |
| `cli-and-io.md` | `src/cli/**`<br>`src/io/**` | CLI と I/O の規約（lang のファイル単位宣言・--lang 表示言語・終了コード 0/非0・ディレクトリ再帰 glob・診断の YAML 行マッピング）。src/cli/ や src/io/ を扱うとき適用する。 |
| `code-review.md` | `src/**`<br>`scripts/**`<br>`.claude/**`<br>`docs/**`<br>`AGENTS.md`<br>`CLAUDE.md` | PR マージ前の意味的レビュー（code-review / harness-review skill）の共通 SoT。レビュー基準「健全性の純改善」・機械ゲート非再実行・指摘フォーマット（重大度 / ファイル:行 / 根拠）・effort 段階・redaction を定める。ソース / ハーネス資産を変更する PR をレビューするとき適用する。 |
| `cross-agent.md` | _常時_ | クロスエージェント共有方針の SoT（AGENTS.md=指示 SoT / CLAUDE.md=@AGENTS.md / skill symlink 共有と copy フォールバック / rules-index 生成 / Git hooks=ゲート SoT）。常時適用する。 |
| `data-pipeline.md` | `scripts/**`<br>`data/**` | データ生成パイプライン（raw=gitignore / champions=手動 / generated=commit の vendor 方式・PokeAPI 項目対応・overrides）。scripts/ や data/ を扱うとき適用する。 |
| `game-spec.md` | `data/**`<br>`src/domain/**` | ポケモンチャンピオンズの確定ゲーム仕様（実数値の二重 floor 計算式・能力ポイント 66/32・性格 ±10%・Lv50/個体値31 固定・レギュ M 系）。data/ や src/domain/ を扱うとき適用する。 |
| `harness-meta-criteria.md` | `.claude/skills/harness-meta/**` | harness-meta skill が learning の改善提案を「採用 / 見送り / 撤去」へ振り分ける判定基準。 |
| `implementation-workflow.md` | `.claude/skills/implementation-workflow/**` | implementation-workflow skill の詳細手順 SoT。1 本の PR の実装ライフサイクル（Phase 0〜9: worktree 作成 → 着手 → 実装+verify fix loop → セルフ検証 → Draft PR → 独立レビュー → auto-merge → レトロ → worktree 削除）の各フェーズの入出力・成功条件・失敗 fallback と不変条件（fix loop 上限3・Generator/Evaluator 独立・worktree Phase 0/9 ペア・auto-merge 委譲）を定める。implementation-workflow skill を読む / 動かすときに適用する。 |
| `planning.md` | `docs/plan/**` | 実装指示を計画へ落とす手順の SoT。生の指示は必ず `plans-new` スキルを入口に通し、まず OVERVIEW（ゴール / 背景 / 設計方針 / 実装指針 / スコープ外）を作ってから 6 基準（意思決定の数 / 不可逆性 / スコープの広さ / 技術的難易度 / 想定 diff ~500行目安・>1000行は積極分割 / 並行実装のしやすさ）で 1 phase = 1 PR に分割する。1 PR 妥当なら GitHub issue + implementation-workflow、複数なら docs/plan/NN-{slug} 計画群を起こす。docs/plan/** を作る / 編集する・新しい計画群やテーマを起こすときに適用する。 |
| `redaction.md` | `docs/harness/**` | docs/harness/ 配下（特に learnings）へ書き出す前に Secrets / 最小 PII を `[REDACTED-*]` へ置換する規約と正規表現。 |
| `retrospective-format.md` | `docs/harness/learnings/**`<br>`.claude/skills/pr-retrospective/**`<br>`.claude/skills/harness-meta/**` | PR ごと KPT learning ファイルの構造 SoT。`pr-retrospective` が生成し `harness-meta` が parse する正規フォーマットを定義する。 |
| `skill-authoring.md` | `.claude/skills/**`<br>`.agents/skills/**` | skill の新規作成・改修は `skill-creator` skill の利用を必須化する方針（手書きで SKILL.md を起こさない・description=trigger・≤500 行・標準構成・canonical + symlink 配置）。.claude/skills/ や .agents/skills/ を扱うとき適用する。 |
| `testing.md` | `**/*.test.ts` | テストの規約（Vitest・カバレッジ100%・境界重点・プロダクションコードと同階層にコロケーション・fixture は近傍 __fixtures__/）。`*.test.ts` を扱うとき適用する。 |
| `tsc-verification.md` | `src/codegen/**`<br>`src/types/**` | 「検証は tsc のみ」方針（Zod 不採用）・YAML→codegen→`tsc --noEmit`・ブランドエラー型の命名・合計66 は codegen 算出。src/codegen/ や src/types/ を扱うとき適用する。 |
| `type-conventions.md` | `src/types/**`<br>`data/generated/**` | 型表現の統一パターン（`XxxBase` + `XxxDex` + `XxxId = keyof XxxDex`）・種族粒度（種族値が一意 = 1 種族）・日英 name と逆引きマップ。src/types/ や data/generated/ を扱うとき適用する。 |
