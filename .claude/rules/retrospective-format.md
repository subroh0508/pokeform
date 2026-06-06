---
paths:
  - "docs/harness/learnings/**"
  - ".claude/skills/pr-retrospective/**"
  - ".claude/skills/harness-meta/**"
description: PR ごと KPT learning ファイルの構造 SoT。`pr-retrospective` が生成し `harness-meta` が parse する正規フォーマットを定義する。
---

# retrospective-format — learning ファイル構造の SoT

PR ごとの KPT（Keep / Problem / Try）レトロスペクティブを記録する learning ファイルの
**唯一の正本（Single Source of Truth）**。`pr-retrospective` skill が本構造で生成し、
`harness-meta` skill が `🤖 ハーネス改善提案` セクションを機械 parse する。手書き生成も本構造に従う。

> ループ全体像は [`docs/harness/README.md`](../../docs/harness/README.md)、判定基準は
> [`harness-meta-criteria.md`](./harness-meta-criteria.md)、秘匿情報の置換は
> [`redaction.md`](./redaction.md) を参照。

## ルール（なぜ）

- **1 PR = 1 ファイル**: 粒度を PR に固定すると、後から `harness-meta` が「複数 PR で反復した提案」を
  数えやすく、採用判定（criteria ①）が機械的に行える。
- **ファイル名 `docs/harness/learnings/YYYY-MM-DD-pr-<n>.md`**: 日付プレフィックスで時系列に並び、
  PR 番号で idempotent（同 PR を二重生成しない）に判定できる。
- **見出しは固定**: `harness-meta` が見出し文字列で section を特定するため、絵文字・文言を変えない。
  空でも見出しは維持する（`📝 harness-meta フィードバック` は meta が後追記するため）。
- **改善提案は 5 プレフィックス + `[ ]`**: `[rule]` / `[skill]` / `[template]` / `[adr]` / `[remove]` の
  チェックボックスで起票する。`harness-meta` は**未処理（`[ ]`）のみ**を集約し、採用後に `[x]` へ更新する。
  プレフィックスを固定することで「どのハーネス資産を触る提案か」を parse 時に分類できる。
- **指標は pokeform のゲートに限定**: 型チェック / カバレッジ% / Biome 違反 / CI / 差分 files・行数のみ。
  重量級メトリクス（複雑度・三層メトリクス等）は本規模では不採用。

## frontmatter

```yaml
---
id: learning-pr-NNN
title: PR #NNN レトロスペクティブ (<要約>)
type: learning
status: draft | reviewed | actioned
related_pr: NNN
related_plan: <phase/plan id> | —
generated_at: YYYY-MM-DDTHH:MM:SSZ
generator: pr-retrospective skill | 手動
---
```

- `status`: `draft`（生成直後）→ `reviewed`（人間/レビュー確認済）→ `actioned`（提案が `harness-meta` で処理済）。
- `related_plan`: 対応する phase/plan の id（例 `00-harness-setup/phase-02`）。無ければ `—`。

## 本文構造（この順・見出し固定）

```markdown
> **要約(5行以内)**: 対象PR <url> / commit <sha> / merge <日時> / 差分 <files> files +<add>/-<del>

## ✅ Keep（継続したいこと）
- … （最低 3 / 推奨 5-10）

## ⚠️ Problem（詰まった点・制約）
- … （最低 3 / 推奨 5-10）

## 🚀 Try（次回の改善案）
- … （rule / skill / template / ADR 単位まで具体化）

## 📊 指標
| 指標 | Before | After | Δ | 備考 |
|---|---|---|---|---|
| 型チェック | pass | pass | — | tsc --noEmit |
| カバレッジ | 100% | 100% | ±0 | Vitest |
| Biome 違反 | 0 | 0 | ±0 | biome check |
| CI | pass | pass | — | server-side pnpm verify |
| 差分 files/行 | … | … | … | gh pr diff |

## 🤖 ハーネス改善提案   <!-- harness-meta が parse する正規構造 -->
- [ ] `[rule]` …
- [ ] `[skill]` …
- [ ] `[template]` …
- [ ] `[adr]` …        ← アーキ決定は ADR 化（Phase 4 の adr-new）
- [ ] `[remove]` …

## 📝 harness-meta フィードバック  <!-- 空でも見出し維持。meta が後追記 -->
### 採用
<!-- meta が採用提案を採用先 PR リンク付きで追記 -->
### 見送り
<!-- meta が見送り理由を追記 -->
### 保留
<!-- meta が保留理由を追記 -->
```

## 制約

- KPT 各セクションは**最低 3 項目**（推奨 5-10）。観点が薄い PR でも形式を保ち、空欄にしない。
- `🚀 Try` は抽象論で終えず、**どの資産（rule / skill / template / ADR）をどう変えるか**まで具体化し、
  対応する `🤖 ハーネス改善提案` のチェックボックスへ落とす。
- 生成前に [`redaction.md`](./redaction.md) の正規表現で token / key / メール等を `[REDACTED-*]` 置換する。
- PR レビューコメントの収集はするが、**learning ファイルが SoT**。PR 本体へコメントは投稿しない。
