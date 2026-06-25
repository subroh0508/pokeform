# Phase 0 — rules 重量級シンプル化（implementation-workflow / data-pipeline）

## 目的 / スコープ

最も削減余地の大きい 2 rule を圧縮する:

- **implementation-workflow.md**（225 行・削減目安 50-60）: Phase 別詳細を表化 + 手順は SKILL.md へ。不変条件まとめ（L175-185）が各 Phase と重複 → 集約。ワーカーノート（L187-209）を references 化。主因 P3 / P5。
- **data-pipeline.md**（93 行・削減目安 40-50）: ディレクトリ巨大ブロック（L44-58）を分割。項目表の上下散文（L70-93）を脚注化。主因 P3 / P5。

スコープ外: 他 rules（Phase 1）・skills。

## 前提（依存）

- なし。本計画は後続 [`08-docs-restructure`](../../08-docs-restructure/README.md) より先に実施する（先に冗長を削ってから構造を動かす）。`data-pipeline.md` は本 Phase の圧縮対象。

## タスク

- [ ] implementation-workflow.md: Phase 別詳細を表へ集約、重複する不変条件まとめを 1 箇所化、ワーカーノートを `references/` へ移して SKILL からリンク（dangling を作らない）。
- [ ] data-pipeline.md: 巨大ディレクトリブロックを読みやすく分割、表の上下の重複散文を脚注 / 集約。
- [ ] 「なぜ」の長文は 1 行要約 + ADR / 既存リンクへ委譲（自己完結性は保つ）。安全性記述（決定論性・materialize/generate の責務）は残す。
- [ ] `paths` frontmatter・description は意味を変えない（trigger 維持）。

## この Phase で育てるハーネス（rule・skill）

- `implementation-workflow.md` / `data-pipeline.md` rule の圧縮。references への分離分は新規 `references/` ファイル + リンク。

## 受け入れ基準

1. 2 rule が目安行数に近づき、**手順の安全性記述・決定論性・SoT 表が保たれている**。
2. references へ移した内容は SKILL / rule からリンクされ dangling ゼロ。
3. description / paths が trigger・自動ロード範囲を変えていない。
4. `pnpm verify` 緑。`harness-review` でセルフレビュー済み。

## 検証手順

1. `wc -l .claude/rules/implementation-workflow.md .claude/rules/data-pipeline.md` で削減を確認。
2. `harness-review` で「実体の重複削減か / 安全性記述の欠落がないか / references dangling」を点検。
3. `git grep` で移動先 references リンクの実在を確認。

## リスク・備考

- 「なぜ」を削りすぎると rule 単体で意図が読めなくなる。1 行要約は残す。
- implementation-workflow は多段オーケストレーションの不変条件を持つ。圧縮で Phase 間の契約・auto-merge 整合を曖昧にしない。
