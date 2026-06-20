# Phase 18 — 用語 rename + 人間直編集文言の全資産展開

## 目的 / スコープ

phase-17 で確定した**統一用語 `skill-authored`** と**データ運用方針（skill 著述・人間直編集 NG）**を、
ハーネス資産全体へ**機械的・意味保存で展開**する。`hand-authored` の語を `skill-authored` へ置換し、
「手動管理」「手書き編集」「champions catalog を直し」「hand-authored 修正を保護」等の**人間直編集を前提と
した文言**を phase-17 方針（skill/AI 経由の訂正）に沿って改訂する。ADR 本文（0025 / 0026 / 0027）の rename は
**phase-16 で確立した整備例外**に依拠して行う（決定本質を変えない表記の言い換えに限定・逐一確認）。

- スコープ内:
  - **可変資産の `hand-authored → skill-authored` 置換**: `.claude/rules/data-pipeline.md` /
    `.claude/skills/survey-regulation/SKILL.md` / `data/README.md` / `docs/plan/01-mvp/architecture.md` /
    02 の `OVERVIEW.md` / 該当 phase docs / `data/champions/catalog/moves.yaml` の該当箇所 等。
  - **ADR 本文の rename**: [ADR 0025] / [ADR 0026] / [ADR 0027] 本文の `hand-authored → skill-authored`
    （phase-16 整備例外に依拠・**決定本質を変えないことを逐一確認**）。
  - **人間直編集前提文言の改訂**: 「手動管理」「手書き編集」「champions catalog を直し、再生成」「hand-authored
    修正を保護」「手動編集」等を、phase-17 方針（skill 著述・人間直編集 NG・誤りは skill/AI 経由）へ書き換え。
    `materialize` の append/既存尊重の保護対象は「skill 著述値」と表現する。
  - **cross-agent パリティ維持**: canonical（`.claude/skills/<name>`）と `.agents/skills/<name>` symlink の一致を
    保つ（[[cross-agent]]）。
- スコープ外:
  - 用語・方針そのものの決定（**phase-16 / phase-17** で確定済み）。本 Phase は**全資産への適用のみ**。
  - 情報源の役割・関係性の整理とフロー図改訂（**phase-19**）。図の構造変更は本 Phase では行わない（用語の
    置換に伴う図中ラベルの追従は許容）。
  - **不変ログの過去記録**（`docs/harness/learnings/**` / `docs/adr/archive/**`）の書き換え。執筆時点の語のまま
    据え置く。
  - ADR 本文への新方針（人間直編集 NG）の rationale 遡及挿入（決定本質の改変になるため不可・新方針は
    phase-17 の新 ADR に記録済み）。

## 前提（依存）

- **phase-16（ADR 不変ログの整備例外）完了**。ADR 本文の用語 rename が規約上許可されていること。
- **phase-17（運用方針 + 統一用語の確定）完了**。`skill-authored` の定義と方針が `data-pipeline.md` / ADR に
  確定していること（置換先の語と改訂後の文言の根拠）。
- 関連 ADR: [ADR 0025] / [ADR 0026] / [ADR 0027]（本文 rename 対象）。
- 確定済み rule: [[data-pipeline]] / [[cross-agent]] / [[adr]] / [[skill-authoring]]。

[ADR 0025]: ../../adr/archive/0025-catalog-name-and-type-chart-sot.md
[ADR 0026]: ../../adr/archive/0026-pokeapi-not-champions-legality-source.md
[ADR 0027]: ../../adr/0027-structural-data-catalog-sot.md

## タスク

- [ ] 可変資産の `hand-authored → skill-authored` を全置換（意味保存・1 件ずつ文脈確認）。grep で対象を列挙して
      漏れなく適用。
- [ ] ADR 本文（0025 / 0026 / 0027）の `hand-authored → skill-authored` を適用。**各箇所で決定本質のニュアンス**
      （例 [ADR 0026]「PokeAPI 派生でなく権威ソースから著述」）が置換語で保たれることを逐一確認。
- [ ] 人間直編集前提文言（「手動管理」「手書き編集」「catalog を直し」「修正を保護」「手動編集」等）を phase-17
      方針へ改訂。`materialize` の保護対象を「skill 著述値」と表現。
- [ ] cross-agent パリティ確認（canonical + symlink 一致・`survey-regulation` 等）。
- [ ] 検証フェーズ実施（下記「検証手順」）。

## この Phase で育てるハーネス（rule・skill）

- **rule 追従**: [[data-pipeline]]（用語 + 人間直編集文言の本展開）・必要に応じ関連 rule。
- **skill 追従**: `survey-regulation` SKILL の該当語・文言（`skill-creator` での改修・canonical 編集で symlink へ
  自動反映）。
- **ADR**: 本文 rename のみ（新規 ADR は起こさない・整備例外の適用）。
- 新規 ADR・新 skill は無し（適用 Phase）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- `grep -rn "hand-authored"`（`docs/harness/learnings` / `docs/adr/archive` 等の不変ログを除く）が **0 件**
  （意図的に残す箇所があれば理由を doc 化）。
- ADR 本文（0025 / 0026 / 0027）の rename が**決定本質を変えていない**ことを逐一確認済み。
- 「手動管理」「手書き編集」「catalog を直し」「hand-authored 修正を保護」等の**人間直編集前提文言が解消**され、
  skill 著述・人間直編集 NG・skill/AI 経由訂正の表現になっている。
- cross-agent パリティ（canonical + symlink）が保たれている。
- `harness-review` 観点で blocking なし。

## 検証手順

1. `grep -rn "hand-authored"` で不変ログ以外に残存がないことを確認。
2. ADR 0025 / 0026 / 0027 の rename 箇所を 1 件ずつ読み、決定本質が保たれていることを確認。
3. 人間直編集前提文言（grep「手動管理」「手書き編集」「catalog を直し」「修正を保護」）が方針表現へ改訂済みか確認。
4. `.agents/skills/survey-regulation` が canonical を指す symlink で内容一致することを確認（[[cross-agent]]）。
5. `pnpm verify` 緑を確認。`harness-review` で点検。

## リスク・備考

- **機械一括 sed の誤爆に注意**: 文脈によっては置換語が決定本質のニュアンスを落とす。特に ADR 本文は 1 件ずつ
  読んで確認する（機械置換 → 目視確認の二段）。
- **不変ログは触らない**: learnings / archive の `hand-authored` や旧 phase 番号表記（当時の M-A 投入 phase 等）は
  執筆時点の記録として据え置く。
- **図の構造変更は phase-19**: 本 Phase は用語・文言のみ。フロー図の描き直し（情報源の明記・2 系統合流）は
  phase-19 が担う。本 Phase 後に着手すると図中ラベルの用語が揃い churn が最小になる。
- ADR 本文は可変 plan ファイル（phase doc / phase 番号 / OVERVIEW リンク）を参照しない（[[adr]]）。

## 意図的に残す `hand-authored` / 旧文言（理由を doc 化）

受け入れ基準の `grep -rn "hand-authored"`（不変ログ除外）が拾う以下は、**rename 自体を説明するため旧用語を
引用しているメタ参照**で、現状システムの記述ではない。旧語を `skill-authored` に置換すると「旧 X を新 Y へ
rename した」という説明が成立しなくなるため、**意図的に旧用語のまま残す**:

- **ADR `0030`**（phase-17 の方針 ADR）: Context / Alternatives が「手動管理 / 手書き編集 / hand-authored」を
  **置換対象の旧表記として引用**する。決定の記録ゆえ据え置く。
- **`docs/plan/02-data-model-redesign/` の phase-16 / 17 / 18 doc・`OVERVIEW.md`（rename を説明する行）・
  `README.md` の Phase 18 エントリ**: いずれも「`hand-authored → skill-authored`」の rename / 方針確定を
  **記述する計画 doc**で、旧用語の引用が必須。

また **ADR `0012`（vendor 方式）/ `0028`（YAML block style）本文の「手動管理 / 手編集」**は、本 Phase の rename
対象 ADR（`0025` / `0026` / `0027`）に含まれず、**執筆時点の決定 rationale**である。新方針（人間直編集 NG）の
遡及挿入はスコープ外（[[adr]] の整備例外は決定本質を変えない用語 rename のみ許可）のため据え置く。新方針は
ADR `0030` が記録する。
