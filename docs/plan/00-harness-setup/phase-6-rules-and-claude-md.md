# Phase 6 — AGENTS.md / CLAUDE.md / rules（クロスエージェント共有 SoT）

## 目的 / スコープ

仕様・規約を `.claude/rules/`（paths スコープで遅延ロード）に外在化しつつ、**Claude Code と Codex の両方が同一の指示・規約を参照**できるようにする。指示の SoT を **`AGENTS.md`**（Linux Foundation 標準・Codex がネイティブ読込）に一本化し、`CLAUDE.md` は **`@AGENTS.md` を import する薄いアダプタ**（公式 Pattern 0）にする。規約正本は `docs/plan/01-mvp/architecture.md`。

**設計原則**: Claude が自動取得する情報（path-scoped rules / skill frontmatter）を `AGENTS.md` にインラインしない。`AGENTS.md` には**ポインタ**だけ置き、path↔rule 対応表の実体は `docs/harness/rules-index.md`（`paths` から**生成**）に分離して Claude のコンテキスト肥大を避ける。

## 前提（依存）

- Phase 1（`architecture.md` の移動完了。rules はこの新パスを参照）。
- Phase 3（`adr.md` rule は既に作成済み）。Phase 2（`retrospective-format.md` / `harness-meta-criteria.md` / `redaction.md` も作成済み）。本フェーズではこれらを**再作成しない**。
- クロスエージェント共有方針は ADR `0009-cross-agent-shared-harness`（Phase 3）として記録。

## タスク

- [ ] `.claude/rules/` を作成（各ファイル冒頭に paths frontmatter。要点を簡潔に再記述し「詳細は `docs/plan/01-mvp/architecture.md` 参照」と明記。二重記述は最小化）。※ `adr.md`（Phase 3）/ `retrospective-format.md`・`harness-meta-criteria.md`・`redaction.md`（Phase 2）は作成済みのため本フェーズの対象外:

| rule | paths | 要点 |
|---|---|---|
| `game-spec.md` | `data/**`, `src/domain/**` | HP/非HP 計算式（二重 floor）・能力ポイント 66/32・性格 ±10%・Lv50/個体値31 固定・レギュ M系（メガ可/テラス・ダイマ不可） |
| `type-conventions.md` | `src/types/**`, `data/generated/**` | `XxxBase`+`XxxDex`+`XxxId=keyof XxxDex` 統一パターン・種族粒度（種族値一意=1種族）・日英 `name` と逆引きマップ |
| `tsc-verification.md` | `src/codegen/**`, `src/types/**` | 「tsc のみ検証」方針・YAML→codegen→`tsc --noEmit`・ブランドエラー型命名（`MoveNotLearnedBy<...>` 等）・合計66 は codegen 算出 |
| `testing.md` | `**/*.test.ts` | Vitest・カバレッジ100%・境界重点（二重 floor / ポイント 0・32）・**テストはプロダクションコードと同階層に `<name>.test.ts` コロケーション**（`tests/` ディレクトリは作らない）・fixture は近傍 `__fixtures__/` |
| `data-pipeline.md` | `scripts/**`, `data/**` | raw=gitignore / champions=手動 / generated=commit・PokeAPI 項目対応・overrides・vendor 方針 |
| `cli-and-io.md` | `src/cli/**`, `src/io/**` | `lang: ja\|en` のファイル単位宣言・`--lang` 表示言語・終了コード(0/非0)・ディレクトリ再帰 glob |

- [ ] **`AGENTS.md`（共有 SoT・≤32KiB を意識）を作成**:
  - [ ] **コマンド一覧**（`pnpm verify` 等）/ **ディレクトリ構造** / **鉄の規約の要約**（tsc のみ検証・カバレッジ100%・Biome・vendor・日英 lang・`XxxBase`+`XxxDex`）/ **進め方**（フェーズは `docs/plan/` 単位、緑のゲートで前進）/ **スキル最小概要**（名前＋1 行 description）/ 正本リンク（`docs/plan/01-mvp/architecture.md`）。
  - [ ] **規約索引への 1 行ポインタ**のみ記載（path↔rule 表はインラインしない）: 「path-scoped rules 非対応ツール（Codex 等）は編集前に `docs/harness/rules-index.md` を参照。Claude Code は自動ロードのため不要」。
- [ ] **`CLAUDE.md`（薄いアダプタ・公式 Pattern 0）を作成**:
  - [ ] 先頭に `@AGENTS.md`。続けて Claude 固有の注記のみ（rules は `paths` 自動ロード / skills は `.claude/skills`（`.agents/skills` は symlink）/ hooks は `.claude/settings.json` / 強制ゲートは `.githooks`）。Claude 固有の上書きは import 行の**下**に置く。
  - [ ] 規約・アーキ詳細は `AGENTS.md` と `@docs/plan/01-mvp/architecture.md` に委譲（本文へ再掲しない）。
- [ ] **`docs/harness/rules-index.md` を生成**: `scripts/gen-rules-index.ts`（小スクリプト）で `.claude/rules/*.md` の `paths` frontmatter を走査し glob→rule 表を生成。`prepare`/CI で再生成して**ドリフト防止**。手書きしない。
- [ ] **`.claude/rules/skill-authoring.md`** を作成（paths: `.claude/skills/**`, `.agents/skills/**`）: skill-creator 準拠（description=trigger・≤500 行・説明型・標準構成 役割/入力/出力/Gotchas/関連）+ 「canonical を `.claude/skills/<name>/` 実体に置き `.agents/skills/<name>` を symlink」配置を明文化。
- [ ] **`.claude/rules/cross-agent.md`** を作成（常時ロード）: 共有方針の SoT（AGENTS.md=指示 SoT / CLAUDE.md=`@AGENTS.md` / スキル symlink 共有と copy フォールバック手順 / `rules-index.md` 生成 / Git hooks=ゲート SoT）。

## 受け入れ基準

- `AGENTS.md` が共有 SoT として存在し、コマンド/構造/鉄の規約/スキル最小概要/規約索引ポインタを含む（path↔rule 表は**インラインしない**）。
- `CLAUDE.md` は `@AGENTS.md` + Claude 固有注記のみ（≤50 行目安）。`@AGENTS.md` import が解決する。
- `docs/harness/rules-index.md` が `paths` から生成され、Claude の `@AGENTS.md` 取込には**含まれない**（Codex 等のみが参照）。
- `src/types/**` を読むと `type-conventions.md` が、`data/**` を読むと `data-pipeline.md`/`game-spec.md` が paths スコープで遅延ロードされる。
- `skill-authoring.md` / `cross-agent.md` rule が存在し、skill-creator 準拠 + symlink 共有 + copy フォールバックを規定。

## 検証手順

1. 新規 Claude セッションで `CLAUDE.md`→`@AGENTS.md` の規約が文脈に載り、path↔rule 表は載っていないことを確認。
2. Codex セッションで `AGENTS.md` がネイティブ読込され、ポインタから `docs/harness/rules-index.md` を辿れることを確認。
3. `src/types/` 配下と `data/` 配下のファイルを読み、対応 rule が paths で遅延ロードされることを確認。
4. rules の `paths` を変更 → `gen-rules-index.ts` 再生成で `rules-index.md` が同期されることを確認。

## リスク・備考

- `AGENTS.md` は 32KiB 上限を意識し要約＋ポインタに徹する。詳細は `docs/`・`.claude/rules` へ逃がす。
- rules と architecture.md の内容が乖離しないよう、決定変更時は ADR + 両者の更新をセットで行う。
- `rules-index.md` は**生成物**。手書き編集せず、`paths` frontmatter を SoT とする。
