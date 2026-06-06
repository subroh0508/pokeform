---
id: learning-pr-NNN
title: PR #NNN レトロスペクティブ (<要約>)
type: learning
status: draft
related_pr: NNN
related_plan: <phase/plan id> | —
generated_at: YYYY-MM-DDTHH:MM:SSZ
generator: pr-retrospective skill | 手動
---

<!--
この雛形は `.claude/rules/retrospective-format.md`（SoT）に準拠する。
見出し（絵文字・文言）は harness-meta が parse するため変更しないこと。
書き出し前に `.claude/rules/redaction.md` の正規表現で Secrets / PII を [REDACTED-*] 置換すること。
-->

> **要約(5行以内)**: 対象PR <url> / commit <sha> / merge <日時> / 差分 <files> files +<add>/-<del>

## ✅ Keep（継続したいこと）

<!-- 最低 3 / 推奨 5-10 -->

- …
- …
- …

## ⚠️ Problem（詰まった点・制約）

<!-- 最低 3 / 推奨 5-10 -->

- …
- …
- …

## 🚀 Try（次回の改善案）

<!-- rule / skill / template / ADR 単位まで具体化し、下の 🤖 改善提案へ落とす -->

- …
- …
- …

## 📊 指標

| 指標 | Before | After | Δ | 備考 |
|---|---|---|---|---|
| 型チェック | pass | pass | — | tsc --noEmit |
| カバレッジ | 100% | 100% | ±0 | Vitest |
| Biome 違反 | 0 | 0 | ±0 | biome check |
| CI | pass | pass | — | server-side pnpm verify |
| 差分 files/行 | … | … | … | gh pr diff |

## 🤖 ハーネス改善提案

<!-- harness-meta が parse する正規構造。未処理は [ ]、採用後に [x] + PR リンク。 -->

- [ ] `[rule]` …
- [ ] `[skill]` …
- [ ] `[template]` …
- [ ] `[adr]` …        <!-- アーキ決定は ADR 化（Phase 4 の adr-new） -->
- [ ] `[remove]` …

## 📝 harness-meta フィードバック

<!-- 空でも見出しは維持する。harness-meta が後から各表に追記する。 -->

### 採用

<!-- 採用した提案と採用先 PR リンク -->

### 見送り

<!-- 見送り理由（harness-meta-criteria.md の見送り基準に対応） -->

### 保留

<!-- 保留理由 -->
