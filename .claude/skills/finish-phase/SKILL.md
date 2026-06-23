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

完了時のタスク（ゲート緑・基準照合・進捗更新・rule/skill 追従点検・ADR/レトロ記録）は多く、手動だと
抜ける。定型化して取りこぼしを防ぎ、**機械ゲート・ADR 採番・レトロ生成は既存 skill に委譲**する。

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

進捗は二層で更新する（**この手順 4 が二層更新の SoT**）:

- **(a) サブ README の phase チェック**: 対象計画の README（`docs/plan/<NN>-*/README.md`）のフェーズ一覧で、
  **対象フェーズの 1 行だけ**を `- [ ]`→`- [x]` に Edit する（per-phase 進捗の SoT）。他行・無関係記述に触れない。
  phase doc が役割分担表等の追記を**明示要求**するときのみ追記する（重複させない）。
- **(b) トップ `docs/plan/README.md` の status ロールアップ**: 計画の**状況が変わったときだけ**
  （最初の着手で ⬜→🚧、最終 phase 完了で 🚧→✅）該当行の **status のみ**更新する（n/n の分数は付けない）。
  **🚧→✅ に上げる前に、サブ README の phase 一覧が全て `- [x]` であることを確認する**（(a) の per-phase 進捗と
  ロールアップの乖離・更新漏れを防ぐ・learning #165 / #166。並行 phase は順序前後の `[x]`/`[ ]` 混在を許容するが
  ✅ 化は全 `[x]` が前提）。

**idempotent**: 既に `- [x]` / 同 status なら触らない。

> 注: 並走 worktree でオーケストレーターが一括更新する運用なら、この手順は「更新すべき箇所の提示」に留めてよい。

### 5. rule / skill の追従漏れを点検する

そのフェーズで**新設・変更した rule / skill** が、参照すべき箇所に反映されているかを点検する:

- 新規 skill は canonical（`.claude/skills/<name>/SKILL.md`）+ `.agents/skills/<name>` symlink が揃い、
  両者が同一実体を指すか（cross-agent パリティ）。
- 新規 rule が索引（`docs/harness/rules-index.md` 等、存在すれば）や関連 doc から参照されているか。
- 確定した規約に対し、既存の skill / doc に古い記述が残っていないか（dangling・矛盾）。

漏れがあれば指摘する（修正は局所なら行い、波及が大きければ別タスクとして提案する）。

### 6. アーキ決定があれば adr-new を促す

このフェーズでアーキ決定（技術選定・パターン採用・不可逆なトレードオフ）を確定したなら
[`adr-new`](../adr-new/SKILL.md) を促す。**いつ ADR を残すかの基準は [adr.md](../../rules/adr.md) が SoT**。
**この skill は ADR を勝手に書かず起動を促すに留める**（採番・雛形展開は `adr-new` の責務）。

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

- **赤で完了にしない**: 手順 2 の `verify` が緑でなければ未完了。基準照合より前にゲートを通す。
- **委譲先を再実装せず、促しは促しに留める**: 検証は `verify`、ADR は `adr-new`、レトロは
  `pr-retrospective`。勝手に ADR 採番や learning 生成をしない（各 skill の採番 / idempotent を壊さない）。
- **README は対象行だけ**: 進捗は対象フェーズ 1 行のみ（手順 4）。並走 worktree では一括更新をオーケストレーターに委ねてよい。
- **idempotent**: 既に `- [x]`・learning 有り・ADR 有りなら二重実行しない。

## 関連

- 着手側: [`start-phase`](../start-phase/SKILL.md)。
- 検証: [`verify`](../verify/SKILL.md)。
- ADR: [`adr-new`](../adr-new/SKILL.md) / 方針 `.claude/rules/adr.md`。
- レトロ: [`pr-retrospective`](../pr-retrospective/SKILL.md) / `docs/harness/README.md`。
- マージ前レビュー: PR open 時は [`code-review`](../code-review/SKILL.md)（ソース）/ [`harness-review`](../harness-review/SKILL.md)（ハーネス資産）で意味的レビューしてから merge する（CI 緑 + ブロッキング指摘なしで auto-merge）。
- フェーズ一覧 / 受け入れ基準: `docs/plan/00-harness-setup/README.md`。
