---
name: harness-meta
description: >-
  複数の PR learning（docs/harness/learnings/*.md）の未処理ハーネス改善提案を集約 parse し、採用 /
  見送り / 撤去 を判定して rule・skill・template の改修 PR や ADR 起票へ書き戻す。「learning を集約して」
  「ハーネス改善提案をまとめて」「溜まった learning を処理して」「どの改善を採用すべき?」「ハーネスへ
  書き戻して」と言われたときに使う。1 PR から learning を生成するのは pr-retrospective skill を使う。
allowed-tools: Bash(gh *) Bash(git *) Read Write Edit Grep
---

# harness-meta — 複数 learning 集約 → ハーネス書き戻し

`pr-retrospective` が溜めた learning 群の **🤖 ハーネス改善提案（未処理 `[ ]`）** を集約し、
[採用 / 見送り / 撤去](../../rules/harness-meta-criteria.md) を判定して、ハーネス（rule / skill /
template / ADR）へ**書き戻す**。これがループの**二段目**。改修 PR は作るが **merge は人間 approve**。

## なぜこの skill があるか

1 件の learning だけでは「たまたまの気づき」か「反復する構造的課題」か判別できない。複数 PR を横断して
**反復シグナル**（同種 Problem / Try が ≥2 PR で再出）を数えると、効果の高い改善だけをハーネスに昇格できる。
人手で全 learning を読み比べるのは高コストなので、parse → 判定 → 書き戻しを定型化する。

## 前提と SoT

- **判定基準の SoT**: [`harness-meta-criteria.md`](../../rules/harness-meta-criteria.md)。
- **learning 構造の SoT**: [`retrospective-format.md`](../../rules/retrospective-format.md)。
- 提案プレフィックス `[rule]` / `[skill]` / `[template]` / `[adr]` / `[remove]` で改修先を分類する。
- skill 改修は **`skill-creator` 経由**（手書きで SKILL.md を起こさない・SoT は [[skill-authoring]]）。ADR が要る決定は **`adr-new`** で起票する。

## 手順

### 1. 未処理提案を集約 parse

- 全 learning の `🤖 ハーネス改善提案` セクションから**未処理（`[ ]`）のみ**を抽出する。`[x]` 済は skip:
  ```bash
  grep -rn "^- \[ \] \`\[" docs/harness/learnings/
  ```
- プレフィックス（`[rule]` 等）と対象資産で**グルーピング**し、同種提案が何 PR で出たかを数える
  （採用基準①「複数 PR ≥2 で反復」の判定材料）。

### 2. 採用 / 見送り / 撤去 を判定

[`harness-meta-criteria.md`](../../rules/harness-meta-criteria.md)（**判定基準の SoT**）に照らして各提案を
**採用 / 見送り / 撤去**へ振り分ける。**迷ったら見送り**を既定にする（撤去は全基準充足 + 2 段階必須）。

### 3. リスキー変更は dry-run メモを先行

- rule 全文書換 / skill 新規 / template 構造変更などリスキーな採用は、改修前に**軽量 dry-run メモ**
  （想定 before/after を記述し妥当性を確認）を残す。定量 dry-run は不採用。

### 4. 書き戻し

採用区分ごとに処理する（**プレフィックス別の処理先は [criteria rule](../../rules/harness-meta-criteria.md) が SoT**）:

- **採用** → `harness/<purpose>` ブランチで改修 PR を作る。`[skill]` は **`skill-creator` 経由**で canonical +
  `.agents/skills` symlink パリティを維持、`[adr]` は `adr-new` で ADR 化。
- **見送り** → 元 learning の `📝 harness-meta フィードバック > 見送り` に**理由を追記**（Edit）。
- **撤去** → **2 段階必須**（段階1: `status: removed` + cooldown / 段階2: cooldown 後に dangling ゼロ再確認して物理削除）。
  1 段階での即削除は禁止。

### 5. learning を更新

- 採用した提案を learning 内で `[ ]`→`[x]` に更新し、`📝 feedback > 採用` に**採用先 PR リンク**を追記。
- 必要なら learning frontmatter の `status` を `actioned` に更新。

### 6. PR 起票（merge はしない）

- 改修 PR は `.github/PULL_REQUEST_TEMPLATE/harness.md` を複写してカスタマイズ:
  ```bash
  gh pr create --base main --title "<title>" --body-file /tmp/<branch-slug>-pr.md
  ```
- **merge は人間 approve 後**。skill は merge しない。

## 出力

- 集約した提案件数、採用 / 見送り / 撤去 の内訳、作成した改修 PR / ADR / feedback 追記を簡潔に報告する。

## Gotchas

- **未処理のみ集約**: `[x]` 済を再処理しない（手順 1 で除外）。
- **dedup**: 同一資産への重複提案は 1 つにまとめてから判定する（採用が同じ PR に二重起票されるのを防ぐ）。
- **merge しない**: 人間 approve が最終ゲート。
- **撤去は 2 段階必須**: いきなり物理削除しない。dangling 参照ゼロを段階 2 で再確認する。
- **機械ゲートを再実装しない**: 品質ゲートは Git hooks / `pnpm verify` の責務。
- **skill 改修は `skill-creator` 経由**: 手書きで SKILL.md を起こさない。

## 関連

- [`pr-retrospective`](../pr-retrospective/SKILL.md) — 1 PR から learning を生成する（一段目）。
- [`harness-meta-criteria.md`](../../rules/harness-meta-criteria.md) — 採用 / 見送り / 撤去 判定基準。
- [`retrospective-format.md`](../../rules/retrospective-format.md) — learning 構造の SoT。
- [`docs/harness/README.md`](../../../docs/harness/README.md) — ループ全体像。
