---
name: adr-new
description: 新しい ADR（アーキテクチャ決定記録）を docs/adr/ に採番して作成する。技術選定・パターン採用・不可逆なトレードオフを伴う決定をしたとき、あるいは既存 ADR を覆す（supersede する）ときに使う。ユーザーが「ADR を書きたい / 残したい」「この決定を記録して」「○○の ADR を起こして」と言ったり、明示せずともアーキ決定を確定させた文脈で必ず使う。
allowed-tools: Read Write Bash(ls *) Bash(git mv *)
---

# adr-new — ADR を採番して作成する

アーキテクチャ決定を `docs/adr/NNNN-<slug>.md` として採番・生成する手順スキル。方針の正本は `.claude/rules/adr.md`、運用ガイドは `docs/adr/README.md`、雛形は `docs/adr/template.md`。**このスキルは採番と雛形展開を間違えないための定型化**であり、判断基準（いつ ADR を残すか）は rule に委ねる。

## 入力

- **タイトル**（必須・引数）: 決定を一文で表す日本語タイトル。例: `"検証は tsc のみで行う"`。
- supersede する場合は、対象の旧 ADR 番号（対話で確認してよい）。

## 出力

- 新規 ADR ファイル `docs/adr/NNNN-<slug>.md`（`template.md` から展開、frontmatter `id`/`status`/`date` 設定済み、Context/Decision/Consequences 記入済み）。
- `docs/adr/README.md` の ADR 一覧表に 1 行追記。
- supersede 時は、旧 ADR の frontmatter `status` フィールドのみ更新。

## 手順

### 1. 採番する

`ls docs/adr/ docs/adr/archive/` で既存の `NNNN-*.md` を**アクティブ + archive 両方**から列挙し、**最大連番 + 1** を新番号 `NNNN`（4 桁ゼロ詰め）とする。連番は飛ばさず・再利用しない（archive へ退避した番号も retired）。`README.md` / `template.md` は ADR ファイルではないので採番対象から除外する。

### 2. slug を決める

タイトルから kebab-case の英語 slug を作る（例: 「検証は tsc のみで行う」→ `tsc-only-verification`）。簡潔に決定の主旨を表す。ファイル名は `NNNN-<slug>.md`。

### 3. 雛形を展開する

`docs/adr/template.md` を Read し、その構成（frontmatter `id`/`status`/`date` + `# NNNN. <タイトル>` / Context / Decision / Consequences / 任意 Alternatives Considered）に沿って新ファイルを Write する。frontmatter の **`id` は採番した番号（4 桁ゼロ詰め・ファイル名の `NNNN` と一致）**、`date` は今日の日付（`YYYY-MM-DD`）にする。見出し `# NNNN. <タイトル>` の番号・タイトルも実値に置換する。

### 4. 本文を対話で記入する

Context / Decision / Consequences（必要なら Alternatives Considered）を埋める。**ADR は「なぜ」を記録する場**なので、次の点を意識する（理由は `.claude/rules/adr.md`）:

- **Context**: どんな制約・前提でこの決定が必要になったか。背景なしに後から覆されないよう「なぜ今これを決めるか」を書く。
- **Decision**: 「何を」決めたかを能動形・断定形で言い切る。仕様の細部は正本（`docs/plan/01-mvp/architecture.md` / 各 rule）に置き、ここからは参照する（二重記述を避ける）。
- **Consequences**: 良い点・悪い点/コスト・トレードオフを率直に。決定の代償を隠さない。
- **Alternatives Considered**（推奨）: 比較検討して捨てた代替案と却下理由を簡潔に（表 / 節どちらでも可）。真の代替案が無ければ省略してよい。

必要な情報が足りなければユーザーに確認する。関連 ADR があれば `[ADR NNNN](./NNNN-....md)` の相対リンクで参照する。

### 5. status を設定する

- frontmatter の `status` を設定する: 議論段階なら `Proposed`、その場で確定済みなら `Accepted`。
- frontmatter の `date` を今日の日付にする。

### 6. README 一覧を更新する

`docs/adr/README.md` の「ADR 一覧」表に `| [NNNN](./NNNN-<slug>.md) | <タイトル> | <Status> |` を末尾に追記する。

## supersede（既存 ADR を覆す）

決定を覆すときは**旧 ADR の本文を書き換えない**（不変ログのため）。手順:

1. 上記 1〜6 で新 ADR（`MMMM`）を作成。Context に「ADR-NNNN を見直す」経緯を書く。
2. 旧 ADR（`NNNN`）を Read し、**frontmatter `status` フィールドのみ**を `Superseded by ADR-MMMM` に更新する（本文は不変。補足が要れば末尾に追記のみ）。
3. 旧 ADR を **`docs/adr/archive/` へ `git mv`** して退避する（`deprecated` も同様）。アクティブ `docs/adr/*.md` は現行の決定だけにする。移動で本文内の相対リンクがずれるので、**旧 ADR 本文の他 ADR への相対リンク（`./NNNN` → `../NNNN`）を機械的に追従修正**する（決定内容は変えない）。
4. `README.md` の旧 ADR をアクティブ一覧表から外し、「アーカイブ」節へ（`archive/` への相対リンク・Status を `Superseded by ADR-MMMM`）移す。退避に伴い旧 ADR への参照リンクの相対パスがずれる場合は追従修正する。

## Gotchas

- **採番は ls 結果から機械的に**。記憶や推測で番号を振らない（衝突・抜けの原因）。
- **Accepted を書き換えない**。覆すのは supersede フローで。これを破ると「なぜ変わったか」の履歴が消える。
- **二重記述しない**。仕様の詳細は architecture.md / rules が正本。ADR からはリンクで参照する。
- **README 一覧の更新を忘れない**。一覧が ADR の索引になっている。

## 関連

- 方針 SoT: `.claude/rules/adr.md`
- 運用ガイド・採番/supersede 詳細・一覧: `docs/adr/README.md`
- 雛形: `docs/adr/template.md`
