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

## 参照のルール（可変な plan ファイルを引かない）

ADR 本文は **可変な plan ファイル（`docs/plan/**` の phase doc / `OVERVIEW.md` / 本文中の「Phase N」表記）を参照しない**。phase は insert / renumber / archive で番号・パスが移動する work-in-progress であり、**不変ログである ADR がこれらを引くと参照が陳腐化**し、「いつ・なぜ決めたか」を辿る価値が損なわれる。

- **引いてよい（安定 SoT）**: `.claude/rules/*`、`docs/plan/01-mvp/architecture.md`（規約の spec 正本・renumber されない）、他の ADR（`ADR-NNNN` / 相対リンク）。決定の根拠・詳細はこれらへ張る。
- **引かない（可変）**: `phase-NN-*.md` へのリンク、本文中の「Phase N」表記、`OVERVIEW.md` へのリンク。詳細が phase doc にしか無い場合は、対応する rule / `architecture.md` へ寄せるか、決定内容を ADR 本文で自己完結させる。
- **例外（概念参照）**: plan 運用そのものが主題の ADR（`0020` plans-new / `0018` implementation-workflow 等）は、`docs/plan/` 構造や「OVERVIEW」「6 基準」等を**概念として**言及してよい。陳腐化する**具体 phase 番号のみ**避ける。`implementation-workflow` の「Phase 0〜9」のような **skill 内部フェーズ番号**は plan phase ではないので可。

## 採番と作成

- `NNNN` は 4 桁ゼロ詰めの連番。既存の**最大連番 + 1**。原則飛ばさず・再利用しない。
  - 採番時は**アクティブ（`docs/adr/*.md`）と `docs/adr/archive/*.md` の両方**を走査して最大連番を取る（archive へ退避した番号も retired として再利用しない）。
  - 例外: **ブートストラップ期に未参照のまま撤回（削除）した ADR の番号**（過去に削除した skill-creator ADR の番号など）は、履歴に依存が無いため後続が再利用してよい。撤回理由は撤回 PR に残す。
- 新規作成は **`adr-new "<タイトル>"` skill** で行う（採番・slug 化・`template.md` 展開・README 一覧追記を自動化）。手書きで SKILL.md ならぬ ADR を起こさない。
- 構成は `docs/adr/template.md` に従う。**`id`（番号）/ `status` / `date` は YAML frontmatter** に持ち、`id` はファイル名の `NNNN` と一致させる。本文は `# NNNN. <タイトル>` / Context / Decision / Consequences / 任意の **Alternatives Considered**。Decision は能動形・断定形で言い切る。
- **Alternatives Considered**: 比較検討して捨てた代替案と却下理由を簡潔に残す（表 / 節どちらでも可）。後から「なぜ別案を採らなかったか」を辿れるようにする。真の代替案が無ければ省略してよい。

## Status と supersede

`status` は frontmatter の 1 フィールド。値は `Proposed` | `Accepted` | `Deprecated` | `Superseded by ADR-NNNN`。1→多の**分割** supersede は範囲表記 `Superseded by ADR-MMMM〜NNNN`（または列挙 `ADR-MMMM, ADR-PPPP`）でよい。

**Accepted の ADR は本文を書き換えない。** ただし次の **2 つの整備（決定の本質を変えない機械的な書き換え）は例外的に許可する**。いずれも決定文・理由・Alternatives を変えないため、不変ログの追跡可能性は損なわれない:

1. **可変な plan ファイル参照の遡及除去** — phase doc / 「Phase N」表記 / `OVERVIEW.md` リンクを取り除く整備（上記「参照のルール」に揃える）。
2. **用語 rename（表記の言い換え）** — 同一概念を指す用語を別表記へ機械的に置き換える整備（例: ある語を平易な別語へ統一する）。

**用語 rename の許可範囲と線引き**（不変ログを緩めすぎないため厳に限定する）:

- **許可**: 機械的・意味保存の言い換えに限る（同一指示対象を別表記に置換するだけで、決定の内容・適用範囲が一切変わらないもの）。逐一どの語をどう置換したか確認できる単位で行う。
- **非許可**: 決定文・理由・Consequences・Alternatives の**意味を変える**書き換え。これは整備ではなく決定の見直しであり、引き続き禁止する（覆すときは下記の supersede 手順 = 新 ADR + `status` 更新 + archive 退避による）。

決定を覆すときは:

1. `adr-new` で新 ADR（`MMMM`）を作成し、Context に旧 ADR を見直す経緯を書く。
2. 旧 ADR（`NNNN`）の **frontmatter `status` フィールドのみ** を `Superseded by ADR-MMMM` に更新する（本文は不変、必要なら末尾に追記のみ）。
3. 旧 ADR を **`docs/adr/archive/` へ `git mv`** して退避する（アクティブな `docs/adr/*.md` を「現行の決定」に絞る）。`deprecated`（後継なし撤回）も同様に archive へ退避してよい。番号は退避後も retired として再利用しない。
4. **archive `git mv` 直後に当該 ADR 番号への全 inbound 参照を走査して追従する**。`.md` に限らず **`.workflow` / `.ts` まで** `git grep -n "NNNN"` で拾い、**インライン相対リンク・reference 式リンク定義（`[ADR NNNN]: ./....md`）・素の番号参照**、および **skill / `references/` 等のライブ手順 SoT が再記述している決定（SoT 所在・型名）** を、archive/ パスまたは後継 ADR へ向け直す。ライブ手順 SoT の追従漏れは blocking 級の dangling を生む（learning #104 / #117 / #122 反復）。

これで「いつ・なぜ方針が変わったか」が連番ログとして連続し、アクティブ一覧は現行の決定だけになる。運用の詳細は `docs/adr/README.md` を参照。
