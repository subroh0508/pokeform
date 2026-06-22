---
description: アーキテクチャ決定を ADR として残す方針・採番・supersede 手順。技術選定やパターン採用、不可逆なトレードオフを伴う決定をしたとき常に適用する。
---

# ADR（アーキテクチャ決定記録）の方針

重要なアーキテクチャ決定を `docs/adr/NNNN-<slug>.md` に**不変の連番ログ**として残す。狙いは「なぜそう決めたか・何を捨てたか（Why）」を後から辿れること。仕様の詳細（What / How）の正本は `docs/plan/01-mvp/architecture.md` と他の `.claude/rules/*` であり、ADR はそこへ参照を張って**二重記述を避ける**。

## いつ ADR を残すか

**技術選定・パターンの採用・不可逆なトレードオフ**を伴う決定をしたら残す。こうした決定は「なぜ」を失うと誤って覆されやすく、可逆な実装判断と違い取り返しがつかないため。

- 残す例: ライブラリ/ツール選定、データの型表現パターン、検証ゲートの置き場所、クロスエージェント方針、運用ループの採用。
- 残さない例: 可逆で局所的な実装判断、既存 rule で完結する些末な選択、命名など linter/formatter に委ねられること。

迷ったら「半年後に背景なしで正しく覆せるか・覆すと高くつくか」を基準にする。

## 参照のルール（可変な plan ファイルを引かない）

ADR 本文は **可変な plan ファイル（`docs/plan/**` の phase doc / `OVERVIEW.md` / 「Phase N」表記）を参照しない**。phase は insert / renumber / archive で移動する WIP で、不変ログが引くと参照が陳腐化するため。

- **引いてよい（安定 SoT）**: `.claude/rules/*`、`docs/plan/01-mvp/architecture.md`（renumber されない規約 spec 正本）、他の ADR（`ADR-NNNN` / 相対リンク）。
- **引かない（可変）**: `phase-NN-*.md` リンク・「Phase N」表記・`OVERVIEW.md` リンク。詳細が phase doc にしか無ければ rule / `architecture.md` へ寄せるか ADR 本文で自己完結させる。
- **例外（概念参照）**: plan 運用が主題の ADR（`0020` / `0018` 等）は `docs/plan/` 構造・「OVERVIEW」「6 基準」等を**概念として**言及してよい。陳腐化する**具体 phase 番号のみ**避ける（`implementation-workflow` の「Phase 0〜9」のような skill 内部フェーズ番号は可）。

## 具体値を不変ログに抱えない

ADR 本文は**決定の根拠（Why）と捨てた代替案**を持つ。**変わりうる「値」（具体数値・スキーマ値・DOM 契約値・型名）の SoT はライブ手順 SoT（`.claude/skills/*/references/*` / 各 `.claude/rules/*` / `architecture.md`）に置き、ADR からは参照する**。ADR に具体値を抱えると更新時に陳腐化し、追跡可能性と現行値の正しさを共に損なうため（Accepted な ADR 本文は書き換えない）。「可変な plan ファイルを引かない」と同根の原則で、コードシンボル・スキーマ値は実装 SoT を引き ADR で再記述しない。

## 採番と作成

- `NNNN` は 4 桁ゼロ詰めの連番 = 既存の**最大連番 + 1**（原則飛ばさず・再利用しない）。採番時は**アクティブ（`docs/adr/*.md`）と `archive/*.md` の両方**を走査して最大を取る（archive 退避番号も retired として再利用しない）。
  - 例外: **ブートストラップ期に未参照のまま撤回（削除）した ADR 番号**は履歴に依存が無いため再利用してよい（撤回理由は撤回 PR に残す）。
- 新規作成は **`adr-new "<タイトル>"` skill**（採番・slug 化・`template.md` 展開・README 追記を自動化）。手書きで起こさない。
- 構成は `docs/adr/template.md` に従う。**`id` / `status` / `date` は YAML frontmatter**、`id` はファイル名の `NNNN` と一致。本文は `# NNNN. <タイトル>` / Context / Decision / Consequences / 任意の **Alternatives Considered**（比較検討して捨てた代替案と却下理由・真の代替案が無ければ省略可）。Decision は能動形・断定形で言い切る。

## Status と supersede

`status` は frontmatter の 1 フィールド。値は `Proposed` | `Accepted` | `Deprecated` | `Superseded by ADR-NNNN`。1→多の分割は範囲表記 `Superseded by ADR-MMMM〜NNNN`（または列挙）でよい。

**Accepted の ADR は本文を書き換えない。** ただし決定の本質を変えない機械的整備に限り 2 つを許可する（決定文・理由・Alternatives を変えないため追跡可能性は損なわれない）:

1. **可変な plan ファイル参照の遡及除去**（上記「参照のルール」に揃える）。
2. **用語 rename**: 同一指示対象を別表記へ機械的に置換するだけの**意味保存**の言い換えに限る。決定文・理由・Consequences・Alternatives の**意味を変える**書き換えは非許可（それは整備でなく決定の見直し = 下記 supersede 手順による）。

決定を覆すときは:

1. `adr-new` で新 ADR（`MMMM`）を作成し、Context に旧 ADR を見直す経緯を書く。
2. 旧 ADR（`NNNN`）の **frontmatter `status` のみ**を `Superseded by ADR-MMMM` に更新（本文は不変・必要なら末尾追記のみ）。
3. 旧 ADR を **`docs/adr/archive/` へ `git mv`**（アクティブを現行の決定に絞る）。`deprecated`（後継なし撤回）も同様。番号は退避後も再利用しない。
4. **archive `git mv` 直後に当該番号への全 inbound 参照を追従する**。`.md` に限らず **`.workflow` / `.ts` まで** `git grep -n "NNNN"` で拾い、**インライン相対リンク・reference 式リンク定義（`[ADR NNNN]: ./....md`）・素の番号参照**、および **skill / `references/` 等ライブ手順 SoT が再記述する決定（SoT 所在・型名）**を archive/ パスか後継 ADR へ向け直す。ライブ手順 SoT の追従漏れは blocking 級 dangling を生む（learning #104 / #117 / #122 反復）。

これで「いつ・なぜ方針が変わったか」が連番ログとして連続し、アクティブ一覧は現行の決定だけになる。運用詳細は `docs/adr/README.md` を参照。
