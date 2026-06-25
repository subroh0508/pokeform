# Phase 1 — rules 軽量級シンプル化（残り rules）

## 目的 / スコープ

軽量級 rules を P1-P5 パターンで圧縮する。**`code-review.md` は Phase 2（共通フレーム抽出）で扱うため本 Phase では除外**。`implementation-workflow.md` / `data-pipeline.md` は Phase 0。

対象と削減目安:
- adr.md（64・15-20）: 前置き圧縮 / 参照ルール箇条統一 / learning 番号削除。
- cross-agent.md（34・15-20）: 表直下の散文 20 行を脚注化。
- tsc-verification.md（49・12-18）: ブランド型実装詳細・@source 仕組み・合計66 算出を圧縮。
- planning.md（140・15-20）: 大原則の重複 / renumber チェックリストの learning 羅列統合。
- skill-authoring.md（74・12-16）: フォールバック注記・Workflow 背景・セルフチェック列挙削減。
- testing.md（32・10-14）: 除外パス具体例・legality 手順を code-review 参照化。
- type-conventions.md（49・10-14）: 定義分散統合 / メガストーン変遷追補削除。
- harness-meta-criteria.md（62・8-12）: 採用/見送り/撤去の粒度均等化・見出し分割。
- game-spec.md（57・8-12）: 自己言及削除 / 計算式コードブロック化 / 逆算詳細を src へ。
- cli-and-io.md（38・8-10）: 長い 1 文分割 / 冗長修飾削除。
- retrospective-format.md（96・8-12）: 理由圧縮 / frontmatter と本文の二重削除。
- redaction.md（67・5-8）: 理由説明削除 / 例外ケース簡潔化。

スコープ外: code-review.md（Phase 2）・skills（Phase 3-5）。

## 前提（依存）

- なし。本計画は後続 [`08-docs-restructure`](../../08-docs-restructure/README.md) より先に実施する。`planning.md` の `paths` は本計画時点では `docs/plan/**`（`docs/roadmap/**` への追従は 08 が行う）。本 Phase は本文圧縮のみで `paths` は変えないため競合しない。

## タスク

- [ ] 各 rule を P1-P5 で圧縮。**learning 番号は「再発防止の根拠」になっているものを残し**、冗長な羅列のみ「過去 learning で反復」へ集約。
- [ ] 「なぜ」の長文は 1 行要約 + ADR / リンク委譲（自己完結性維持）。
- [ ] `paths` / description は意味・自動ロード範囲を変えない。
- [ ] 各 rule の `[[wikilink]]` / リンクが実在へ解決することを確認。

## この Phase で育てるハーネス（rule・skill）

- 上記軽量級 rules の圧縮（実体追加なし・冗長削減のみ）。

## 受け入れ基準

1. 対象 rules が目安行数に近づき、規約の**実体・安全性記述・trigger（paths）が保たれている**。
2. 残した learning 番号が「再発防止の根拠」に限定され、冗長羅列が集約されている。
3. `[[...]]` / 相対リンクが dangling ゼロ。
4. `pnpm verify` 緑。`harness-review` でセルフレビュー済み。

## 検証手順

1. `wc -l` で各 rule の削減を確認。
2. `harness-review` で「実体重複の削減か / 規約値の欠落がないか / paths 不変か」を点検。
3. `git grep -oE '\[\[[a-z-]+\]\]'` の参照先 rule / memory が実在することを確認。

## リスク・備考

- 軽量級でもファイル数が多い。diff が膨らむ場合は「ワークフロー/計画系」と「検証/型系」の 2 PR に割ってよい（OVERVIEW の 6 基準・並行可）。
- `paths` frontmatter を不用意に縮めると Claude の自動ロードが効かなくなる（機能影響）。trigger は維持する。
