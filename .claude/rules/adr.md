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

- `NNNN` は 4 桁ゼロ詰めの連番。既存の**最大連番 + 1**。飛ばさず・再利用しない。
- 新規作成は **`adr-new "<タイトル>"` skill** で行う（採番・slug 化・`template.md` 展開・README 一覧追記を自動化）。手書きで SKILL.md ならぬ ADR を起こさない。
- 構成は `docs/adr/template.md`（`# NNNN. <タイトル>` / Status / Context / Decision / Consequences / 任意の Considered Options）に従う。Decision は能動形・断定形で言い切る。

## Status と supersede

Status は `Proposed` | `Accepted` | `Deprecated` | `Superseded by ADR-NNNN`。

**Accepted の ADR は本文を書き換えない。** 決定を覆すときは:

1. `adr-new` で新 ADR（`MMMM`）を作成し、Context に旧 ADR を見直す経緯を書く。
2. 旧 ADR（`NNNN`）の **Status のみ** を `Superseded by ADR-MMMM` に更新する（本文は不変、必要なら末尾に追記のみ）。

これで「いつ・なぜ方針が変わったか」が連番ログとして連続する。運用の詳細は `docs/adr/README.md` を参照。
