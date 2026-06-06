<!--
ハーネス改修 PR 用テンプレート（rules / skills / templates / AGENTS.md / CLAUDE.md / .githooks / docs/harness 等）。
ソース（src/** 等）の変更は通常 PR テンプレート（.github/pull_request_template.md）を使うこと。
利用方法: PR 作成時に ?template=harness.md を URL に付与、または gh pr create --body-file で本テンプレを複写。
-->

## 概要

<!-- 何を・なぜ変えるか。1-3 行。 -->

## 採用根拠（harness-meta-criteria に対応）

<!-- .claude/rules/harness-meta-criteria.md の採用基準のどれに該当するか。 -->

- [ ] 複数 PR（≥2）で反復した提案
- [ ] 明確な Problem を解消
- [ ] 既存 rule / ADR と直接対応
- [ ] コスト < 効果
- [ ] 人間が採用を明示

## 対象 learning

<!-- 採用元の learning ファイルと該当の 🤖 改善提案。複数可。 -->

- `docs/harness/learnings/YYYY-MM-DD-pr-<n>.md` — `[rule|skill|template|adr|remove]` …

## 変更したハーネス資産

- [ ] `.claude/rules/*`
- [ ] `.claude/skills/*`（+ `.agents/skills/*` symlink パリティ確認）
- [ ] PR テンプレート / learning template
- [ ] ADR（`adr-new` で起票）
- [ ] その他: …

## dry-run メモ（リスキー変更時）

<!-- rule 全文書換 / skill 新規 / template 構造変更などは想定 before/after を記述。 -->

## チェック

- [ ] cross-agent パリティ（canonical + `.agents/skills` symlink 一致）
- [ ] 機械ゲートを skill 内で再実装していない
- [ ] dangling 参照ゼロ（相互リンク解決）
- [ ] redaction 適用済み（Secrets / PII 非混入）
- [ ] 採用提案を learning 内で `[ ]`→`[x]` + 採用先 PR リンク追記

## 関連

- learning: …
- ADR: …
- phase doc: …
