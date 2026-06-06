---
name: finish-phase
description: >-
  指定したフェーズを締める。`verify` で検証ゲートを通し、受け入れ基準を照合し、計画 README の進捗チェックを
  更新し、確定した rule / skill の追従漏れを点検し、アーキ決定があれば `adr-new` を、関連 PR が merge 済なら
  `pr-retrospective` を促す。「フェーズ N を終わらせる」「Phase N 完了にして」「finish-phase N」
  「このフェーズの締めをして」「受け入れ基準を満たしたか確認して進捗を更新して」と言われたとき、
  実装が一段落して完了処理に入るときに使う。着手側は start-phase が担う。
allowed-tools: Read Edit Glob Grep Bash(pnpm *) Bash(gh *)
---

# finish-phase — フェーズの完了処理を定型化する

引数で受け取ったフェーズを締めるための手順 skill。**検証 → 受け入れ基準照合 → 進捗更新 → 追従点検 →
ADR / レトロの促し**を一連で行い、完了の取りこぼし（ゲート未通過・基準未達・進捗未更新・記録漏れ）を防ぐ。
着手側は [`start-phase`](../start-phase/SKILL.md) が担う。検証は [`verify`](../verify/SKILL.md) に委譲する。

## なぜこの skill があるか

フェーズ完了時にやるべきことは多い — ゲートを緑にし、受け入れ基準を 1 つずつ照合し、計画 README の進捗を
更新し、そのフェーズで確定した規約（rule）や手順（skill）が他箇所に反映されているか点検し、アーキ決定や
PR の学びを記録に残す。これを毎回手動でこなすと抜けが出る。この skill は完了の定型を 1 本にまとめ、
**機械ゲート（型 / テスト / Lint）や ADR 採番・レトロ生成は既存 skill に委譲**して再実装を避ける。

## 入力

- **フェーズ識別子**（引数）: `8` / `phase-08` / `Phase 8` 等。`start-phase` と同じ正規化で対象 doc を特定する。
- 任意で関連 PR 番号（未指定なら手順 6 で auto-detect を試みる）。

## 出力

- `verify` の結果サマリ（緑 / 赤）。
- 受け入れ基準の**項目ごとの充足 / 未充足**判定。
- 更新した計画 README の進捗チェック箇所（パスと差分の要約）。
- rule / skill 追従漏れの点検結果。
- **ADR を促すべきアーキ決定の有無**と、**`pr-retrospective` を促すべき merge 済 PR の有無**。

## 手順

### 1. 対象 phase doc を特定する

`start-phase` 手順 1 と同じく `docs/plan/**/phase-*.md` を Glob で特定する。受け入れ基準 / 検証手順 /
タスクを Read で押さえる（以降の照合に使う）。

### 2. 検証ゲートを通す（verify に委譲）

[`verify`](../verify/SKILL.md) skill を使って `pnpm verify` を実行し、型 / テスト / カバレッジ / Lint が
緑であることを確認する。**赤なら完了にしない**。最初の失敗箇所を提示し、修正してから再度この手順に戻る。
機械ゲートの判定はここで `verify` に一任し、独自に再実装しない。

### 3. 受け入れ基準を照合する

phase doc の「受け入れ基準」を 1 項目ずつ、リポジトリの現状（ファイルの実在・参照解決・記述整合・
`verify` 結果）と突き合わせて **充足 / 未充足** を判定する。未充足があれば列挙し、完了をブロックする。
判断に迷う項目は「検証手順」節の手順を実際に踏んで確認する。

### 4. 計画 README の進捗チェックを更新する

対象フェーズが属する計画の README（ハーネスなら `docs/plan/00-harness-setup/README.md`、MVP なら
`docs/plan/01-mvp/README.md` 等）のフェーズ一覧で、対象フェーズの行を `- [ ]` → `- [x]` に Edit で更新する。

- **対象フェーズの 1 行だけ**を変更する。他フェーズのチェックや無関係な記述には触れない。
- 既に `- [x]` なら idempotent に skip する（二重更新しない）。
- phase doc が README への追記（役割分担表など）を**明示的に要求**している場合のみ、その追記を行う
  （既に記載済みなら重複させない）。

> 注: bootstrap 期に複数 worktree が並走している場合、進捗チェックの一括更新はオーケストレーターが行う
> 運用なら、この手順は「更新すべき箇所の提示」に留めてよい。リポジトリの運用方針に従う。

### 5. rule / skill の追従漏れを点検する

そのフェーズで**新設・変更した rule / skill** が、参照すべき箇所に反映されているかを点検する:

- 新規 skill は canonical（`.claude/skills/<name>/SKILL.md`）+ `.agents/skills/<name>` symlink が揃い、
  両者が同一実体を指すか（cross-agent パリティ）。
- 新規 rule が索引（`docs/harness/rules-index.md` 等、存在すれば）や関連 doc から参照されているか。
- 確定した規約に対し、既存の skill / doc に古い記述が残っていないか（dangling・矛盾）。

漏れがあれば指摘する（修正は局所なら行い、波及が大きければ別タスクとして提案する）。

### 6. アーキ決定があれば adr-new を促す

このフェーズで**技術選定・パターン採用・不可逆なトレードオフ**を確定したなら、[`adr-new`](../adr-new/SKILL.md)
で ADR を残すよう促す（判断基準は `.claude/rules/adr.md`）。「半年後に背景なしで正しく覆せるか？」を
基準に、覆すと高くつく決定だけを ADR にする。可逆で局所的な実装判断は ADR にしない。
**この skill は ADR を勝手に書かず、`adr-new` の起動を促すに留める**（採番・雛形展開は `adr-new` の責務）。

### 7. 関連 PR が merge 済なら pr-retrospective を促す

このフェーズの PR が既に merge 済なら、[`pr-retrospective`](../pr-retrospective/SKILL.md) で KPT learning を
生成するよう促す。検出は次の要領:

```bash
gh pr list --state merged --limit 20 --json number,title,mergedAt
```

- 引数で PR 番号が与えられていればそれを使う。
- 該当 PR の learning（`docs/harness/learnings/*-pr-<n>.md`）が既にあれば促さない（idempotent）。
- **この skill はレトロを生成しない**。`pr-retrospective` の起動を促すに留める（生成は当該 skill の責務）。

> bootstrap 注記: マージは別運用（オーケストレーター / auto-merge）が担うことがある。その場合この手順は
> 「merge 後に `pr-retrospective` を回す」リマインドに留め、merge 前に無理に起動しない。

### 8. 完了サマリを提示する

**出力**の形で、verify 結果・受け入れ基準の充足状況・進捗更新箇所・追従点検結果・ADR / レトロの要否を
まとめる。未充足やブロッカーがあれば、それを最上段に明示する。

## Gotchas

- **赤で完了にしない**: 手順 2 の `verify` が緑でなければフェーズは未完了。基準照合より前にゲートを通す。
- **機械ゲート / ADR / レトロを再実装しない**: 検証は `verify`、ADR は `adr-new`、レトロは
  `pr-retrospective` に委譲する。この skill はそれらを**呼び出して促す**オーケストレーション役。
- **README は対象行だけ**: 進捗チェックは対象フェーズ 1 行のみ更新。他フェーズや無関係な記述に触れない。
  並走 worktree 運用では一括更新をオーケストレーターに委ねる選択肢もある。
- **促しは促しに留める**: ADR・レトロは「起動を促す」までが責務。勝手に ADR を採番したり learning を
  生成したりしない（各 skill の idempotent / 採番ロジックを壊さないため）。
- **idempotent**: 既に `- [x]`・既に learning 有り・既に ADR 有りなら二重実行しない。

## 関連

- 着手側: [`start-phase`](../start-phase/SKILL.md)。
- 検証: [`verify`](../verify/SKILL.md)。
- ADR: [`adr-new`](../adr-new/SKILL.md) / 方針 `.claude/rules/adr.md`。
- レトロ: [`pr-retrospective`](../pr-retrospective/SKILL.md) / `docs/harness/README.md`。
- フェーズ一覧 / 受け入れ基準: `docs/plan/00-harness-setup/README.md`。
