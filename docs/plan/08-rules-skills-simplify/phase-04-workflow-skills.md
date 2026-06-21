# Phase 4 — ワークフロー系 skills 圧縮

## 目的 / スコープ

ワークフロー系 skill を P1-P5 で圧縮する（調査レポート §5.3）:

- finish-phase（136・38-50）: 「なぜ」節 / README 更新詳細 / ADR 基準が adr.md と重複。
- plans-new（116・30-40）: 6 基準が概要・rule・split-criteria.md の三重記述 / issue 作成詳細。
- implementation-workflow(skill)（96・26-40）: Generator/Evaluator 説明の表↔本文重複 / Gotchas が rule 不変条件と重複。
- harness-meta（100・18-22）: 判定基準を criteria rule へポインタ化 / 書き戻し手順圧縮。
- pr-retrospective（124・15-20）: description 短縮 / 前置き削除 / Gotchas 重複。
- start-phase（81・14-20）: 識別子バリエーション列挙 / Gotchas の自明項目。
- verify（96・24-38）: ゲート説明の反復 / 例セクション削除推奨。
- adr-new（86・20-32）: supersede 手順が adr.md / README と重複。

スコープ外: レビュー系（Phase 2）・survey-regulation（Phase 3）・データ系（Phase 5）・rules。

## 前提（依存）

- 先行計画 07 完了（`finish-phase` は 07 Phase 4 で `completed/` 移動運用が追記済み・`start-phase` は 07 Phase 6 で使い分け明確化済みの状態を前提に圧縮）。

## タスク

- [ ] 各 skill を P1-P5 で圧縮。**SoT 実体の再記述（6 基準・判定基準・supersede 手順・不変条件）は rule へポインタ化**（P4）。
- [ ] frontmatter ↔ 本文冒頭の重複削除（P2）、description のスリム化（P1・eval 確認）。
- [ ] 「なぜ」の長文は 1 行要約 + ADR / rule 委譲。**安全性記述（auto-merge 整合・worktree ペア管理・redaction）は残す**。
- [ ] references / rule への参照リンクを張り dangling を作らない。

## この Phase で育てるハーネス（rule・skill）

- 上記ワークフロー系 skills の圧縮（`skill-creator` 利用）。判定基準・6 基準・supersede は既存 rule（[[planning]] / [[harness-meta-criteria]] / [[adr]]）が SoT で skill はポインタ。

## 受け入れ基準

1. 対象 skills が目安行数に近づき、**手順・分岐・安全性記述・trigger が保たれている**。
2. 6 基準 / 判定基準 / supersede 手順 / 不変条件の**実体が rule 側 1 箇所**になり、skill はポインタ（三重記述解消）。
3. references / rule リンクが dangling ゼロ。各 description が eval で trigger 維持。
4. cross-agent パリティ維持。`pnpm verify` 緑。`harness-review` 済み。

## 検証手順

1. `wc -l` で各 skill の削減を確認。
2. `harness-review` で「SoT 実体が rule へ一本化されたか / 手順の安全性記述の欠落がないか」を点検。
3. `skill-creator` eval で各 skill の trigger（呼ばれるべき場面）を確認。

## リスク・備考

- ワークフロー系は相互に呼び合う（plans-new → start-phase → implementation-workflow → finish-phase → pr-retrospective → harness-meta）。圧縮で skill 間の受け渡し・住み分け記述を曖昧にしない。
- ファイル数が多いので diff が大きい場合は 2 PR に割ってよい（並行可）。
