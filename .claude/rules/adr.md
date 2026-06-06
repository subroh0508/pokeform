---
description: アーキテクチャ決定を ADR として残す方針・採番・supersede 手順。技術選定やパターン採用、不可逆なトレードオフを伴う決定をしたとき常に適用する。
---

# ADR（アーキテクチャ決定記録）の方針

重要なアーキテクチャ決定を `docs/adr/NNNN-<slug>.md` に**不変の連番ログ**として残す。狙いは「なぜそう決めたか・何を捨てたか（Why）」を後から辿れるようにすること。仕様の詳細（What / How）の正本は `docs/plan/01-mvp/architecture.md` と他の `.claude/rules/*` であり、ADR はそこへ参照を張って**二重記述を避ける**。

## いつ ADR を残すか

**技術選定・パターンの採用・不可逆なトレードオフ**を伴う決定をしたら ADR を残す。理由は、こうした決定は後から「なぜ」を失うと誤って覆されやすく、可逆な実装判断と違って取り返しがつきにくいため。

- 残す例: ライブラリ/ツールの選定、データの型表現パターン、検証ゲートの置き場所、クロスエージェント方針、運用ループの採用。
- 残さない例: 可逆で局所的な実装判断、既存 rule で完結する些末な選択、命名など linter/formatter に委ねられること。

迷ったら「この判断を半年後の自分やエージェントが見て、背景なしに正しく覆せるか？」を基準にする。覆すと高くつくなら ADR にする。

## 採番と作成

- `NNNN` は 4 桁ゼロ詰めの連番。既存の**最大連番 + 1**。原則飛ばさず・再利用しない。
  - 採番時は**アクティブ（`docs/adr/*.md`）と `docs/adr/archive/*.md` の両方**を走査して最大連番を取る（archive へ退避した番号も retired として再利用しない）。
  - 例外: **ブートストラップ期に未参照のまま撤回（削除）した ADR の番号**（過去に削除した skill-creator ADR の番号など）は、履歴に依存が無いため後続が再利用してよい。撤回理由は撤回 PR に残す。
- 新規作成は **`adr-new "<タイトル>"` skill** で行う（採番・slug 化・`template.md` 展開・README 一覧追記を自動化）。手書きで SKILL.md ならぬ ADR を起こさない。
- 構成は `docs/adr/template.md` に従う。**`id`（番号）/ `status` / `date` は YAML frontmatter** に持ち、`id` はファイル名の `NNNN` と一致させる。本文は `# NNNN. <タイトル>` / Context / Decision / Consequences / 任意の **Alternatives Considered**。Decision は能動形・断定形で言い切る。
- **Alternatives Considered**: 比較検討して捨てた代替案と却下理由を簡潔に残す（表 / 節どちらでも可）。後から「なぜ別案を採らなかったか」を辿れるようにする。真の代替案が無ければ省略してよい。

## Status と supersede

`status` は frontmatter の 1 フィールド。値は `Proposed` | `Accepted` | `Deprecated` | `Superseded by ADR-NNNN`。

**Accepted の ADR は本文を書き換えない。** 決定を覆すときは:

1. `adr-new` で新 ADR（`MMMM`）を作成し、Context に旧 ADR を見直す経緯を書く。
2. 旧 ADR（`NNNN`）の **frontmatter `status` フィールドのみ** を `Superseded by ADR-MMMM` に更新する（本文は不変、必要なら末尾に追記のみ）。
3. 旧 ADR を **`docs/adr/archive/` へ `git mv`** して退避する（アクティブな `docs/adr/*.md` を「現行の決定」に絞る）。`deprecated`（後継なし撤回）も同様に archive へ退避してよい。番号は退避後も retired として再利用しない。

これで「いつ・なぜ方針が変わったか」が連番ログとして連続し、アクティブ一覧は現行の決定だけになる。運用の詳細は `docs/adr/README.md` を参照。
