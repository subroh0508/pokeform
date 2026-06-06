---
name: pr-retrospective
description: >-
  マージ済の 1 Pull Request から KPT（Keep / Problem / Try）レトロスペクティブの learning
  ファイルを生成し、ハーネス改善提案を起票する。「PR のレトロ」「KPT 振り返り」「この PR の学びを
  残したい」「PR #NNN の learning を作って」「マージした PR を振り返って」と言われたとき、または
  finish-phase 後に PR が merge 済みのときに使う。複数 PR を集約してハーネスへ書き戻すのは
  harness-meta skill を使う。
allowed-tools: Bash(gh *) Bash(git *) Bash(pnpm *) Read Write Grep
---

# pr-retrospective — 1 PR = 1 learning 生成

マージ済 PR を 1 件取り、KPT 振り返りと 📊 指標、🤖 ハーネス改善提案を含む learning ファイルを
`docs/harness/learnings/YYYY-MM-DD-pr-<n>.md` に生成する。これが pokeform のハーネス自己改良ループの
**入口**（一段目）。複数 learning の集約・採用判定・書き戻しは [`harness-meta`](../harness-meta/SKILL.md) が担う。

## なぜこの skill があるか

PR ごとに「何がうまくいき / 何に詰まり / 次どう改善するか」を構造化して残すと、`harness-meta` が
**複数 PR で反復した課題**を機械的に拾い、rule / skill / template / ADR の改修へ繋げられる。
口頭の振り返りは消えるが、learning は commit され SoT として残る。だから出力は人間向けメッセージでなく
**正規フォーマットのファイル**である（見出しを `harness-meta` が parse する）。

## 前提と SoT

- **learning 構造の SoT**: [`.claude/rules/retrospective-format.md`](../../rules/retrospective-format.md)。
  本 skill はこの構造に厳密に従う（見出し・絵文字・frontmatter を変えない）。
- **雛形**: [`docs/harness/learnings/template.md`](../../../docs/harness/learnings/template.md)。
- **redaction**: [`.claude/rules/redaction.md`](../../rules/redaction.md)。書き出し**前**に必ず適用する。
- gh / git は読み取り中心（PR 情報収集 + learning ブランチへの commit/push）。**merge はしない**。

> bootstrap 注記: 本ループの実稼働は最初の実装 PR が出てから。設置時点では gh 権限（Phase 9）/
> ADR（Phase 4）/ 型・カバレッジゲート（Phase 5）への前方参照を許容する。

## 手順

### 1. 対象 PR を決める

- 引数で PR 番号が与えられればそれを使う。
- 未指定なら未処理のマージ済 PR を auto-detect:
  ```bash
  gh pr list --state merged --limit 20 --json number,title,mergedAt
  ```
  `docs/harness/learnings/` に既存の `*-pr-<n>.md` が無い PR のうち、最も古い未処理を選ぶ。

### 2. idempotent チェック

- `docs/harness/learnings/` に対象 PR の learning（`*-pr-<n>.md`）が既にあれば**生成せずに skip**し、
  その旨を報告する（二重生成を防ぐ）。Grep で `related_pr: <n>` を確認するのが確実。

### 3. 情報収集

- diff / レビュー / メタ情報:
  ```bash
  gh pr view <n> --json number,title,url,mergeCommit,mergedAt,additions,deletions,changedFiles,body
  gh pr diff <n>
  gh pr view <n> --comments
  ```
- CI が失敗していた場合のみログを参照（成功時は不要）:
  ```bash
  gh run view --log-failed
  ```
- 📊 指標は pokeform のゲート結果（型 / カバレッジ / Biome / CI / 差分 files・行数）を埋める。
  ローカルで再確認が要るなら `pnpm verify` を使う（**機械ゲートの再実装はしない**。結果を要約するだけ）。

### 4. KPT 分析

- diff・レビューコメント・CI 結果から **✅ Keep / ⚠️ Problem / 🚀 Try** を各**最低 3**（推奨 5-10）抽出。
- `🚀 Try` は抽象論で終えず、「どの rule / skill / template / ADR をどう変えるか」まで具体化する。

### 5. 🤖 ハーネス改善提案を起票

- `🚀 Try` を 5 プレフィックス + `[ ]` チェックボックスに落とす:
  `[rule]` / `[skill]` / `[template]` / `[adr]`（アーキ決定）/ `[remove]`。
- このセクションは `harness-meta` が parse する正規構造なので、プレフィックスと `[ ]` 形式を厳守する。

### 6. redaction（書き出し前）

- [`redaction.md`](../../rules/redaction.md) の正規表現で token / key / メール / PAT / JWT 等を
  `[REDACTED-*]` 置換する。**learning に生の Secret を絶対に残さない**。
- commit SHA（要約・指標の正規項目）は redact しない。

### 7. ファイル生成 + INDEX 追記

- 雛形をベースに `docs/harness/learnings/YYYY-MM-DD-pr-<n>.md` を生成。
  - `YYYY-MM-DD` は対象 PR の merge 日（`mergedAt`）を使う。
  - frontmatter（`id` / `title` / `status: draft` / `related_pr` / `related_plan` / `generated_at` /
    `generator: pr-retrospective skill`）を埋める。
  - `📝 harness-meta フィードバック` は**空の見出しのまま**残す（meta が後で追記する）。
- [`learnings/INDEX.md`](../../../docs/harness/learnings/INDEX.md) に 1 行追記（同 PR 行があれば idempotent skip）。

### 8. commit / push（merge はしない）

- 集約ブランチ `harness/learnings-batch-YYYY-WW`（ISO 週番号）に commit/push:
  ```bash
  git checkout -B harness/learnings-batch-<YYYY-WW>
  git add docs/harness/learnings/
  git commit -m "docs(harness): add learning for PR #<n>"
  git push -u origin harness/learnings-batch-<YYYY-WW>
  ```
- 件数閾値（既定 **10**）到達 or 週次で集約 PR を **Draft** 起票（`gh pr create --draft`）。
- **merge は人間 approve 後**。skill は merge しない。**PR 本体へコメントは投稿しない**（learning が SoT）。

## 出力

- 生成 / skip した learning のパスと、KPT・🤖 改善提案の件数を簡潔に報告する。
- redaction で置換した項目があればその種別数を報告（生値は出さない）。

## Gotchas

- **二重生成**: 必ず手順 2 の idempotent チェックを先に行う。
- **見出しを変えない**: `harness-meta` が文字列一致で section を特定する。絵文字・文言を保つ。
- **merge しない / PR にコメントしない**: SoT は learning ファイル。
- **機械ゲートを再実装しない**: 型 / テスト / Biome の判定は `pnpm verify`（Phase 5/9）に委ね、結果を写すだけ。
- **redaction を飛ばさない**: 書き出し前に必ず適用。迷う高エントロピー文字列は redact 寄りに倒す。

## 関連

- [`harness-meta`](../harness-meta/SKILL.md) — 複数 learning を集約しハーネスへ書き戻す（二段目）。
- [`retrospective-format.md`](../../rules/retrospective-format.md) — learning 構造の SoT。
- [`harness-meta-criteria.md`](../../rules/harness-meta-criteria.md) — 採用 / 見送り / 撤去 判定基準。
- [`redaction.md`](../../rules/redaction.md) — Secrets / PII 置換規約。
- [`docs/harness/README.md`](../../../docs/harness/README.md) — ループ全体像。
