# Phase 5 — 修正 SubAgent + 自己修復ループ（層3）

## 目的 / スコープ

層2（Haiku 取得 fan-out）の失敗レポートを受けて、**修正 SubAgent（Sonnet+）が層1 の純関数パーサを直す**
自己修復ループを実装する。「取得 → 失敗集約 → 修正 → 失敗種のみ再取得」を Workflow で K 回上限のループにし、
収束しない種は人手エスカレーションへ落とす。

- スコープ内:
  - 修正 SubAgent（Sonnet+）: 失敗レポート（`{slug, stage, missingFields, rawHtmlPath}`）+ 失敗 HTML +
    パーサソース（`src/codegen/serebii/parse.ts` / `normalize.ts`）を受け、パーサ/正規化を修正 + fixture テスト追加
    （回帰固定・カバレッジ100%維持）。修正 SubAgent **のみ write 権限**・取得 SubAgent は read-only。
  - 層3 Workflow: 「取得 → 失敗集約 → 修正 → 失敗種のみ再 fan-out」を **K 回上限**でループ。dedup で無限ループ防止。
    収束しない種は人手エスカレーション（roster-source doc に未確定として明記）。
  - SKILL.md に層3 手順を追記。
- スコープ外: SKILL 全面改訂（Phase 6）・全186種実投入（Phase 13）。

## 前提（依存）

- **Phase 4 完了**（層2 fan-out・失敗の構造化レポート契約）。
- Workflow ツール（agent model 指定・write 権限分離・ループ制御）が使える環境。
- 確定済み rule: [[cross-agent]]（層3 は Claude 固有・Codex は人手修正で代替）/ [[testing]]（カバレッジ100%）。

## タスク

- [ ] 修正 SubAgent のプロンプト方針 = 「セレクタを修正し、その種専用ハックを避けて一般化せよ。既存テストを
      壊すな。失敗ケースをテスト化せよ」。出力 = パーサ修正 diff + 追加 fixture/テスト。完了条件 = `pnpm test` 緑。
- [ ] 層3 Workflow: 失敗レポート群を修正 SubAgent へ（同じパーサ欠陥が複数種で出るためバッチ起動）→ 修正後、
      失敗種のみ取得 SubAgent へ再 fan-out。**同一 slug の修復試行 K 回上限**・dedup で無限ループ防止。
- [ ] 収束しない種を人手エスカレーション（roster-source doc に未確定として記録・現行の doc 化要件と整合）。
- [ ] write 権限分離（修正 SubAgent のみ write・取得 SubAgent は read-only）を Workflow で担保。
- [ ] SKILL.md に層3 手順を追記（最小・全面改訂は Phase 6）。

## この Phase で育てるハーネス（rule・skill）

- 層3 Workflow スクリプト（自己修復オーケストレータ）。SKILL.md 層3 手順追記。cross-agent パリティ点検
  （Workflow は Claude 固有・[[cross-agent]]）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。追加 fixture/テストでカバレッジ100%維持。
- 意図的に壊した fixture/パーサで「取得失敗 → 修正 SubAgent が parse 修正 + テスト追加 → 再取得で緑化」の
  ループが回る。
- 無限ループ防止（K 回上限・dedup）が機能し、収束しない種が人手エスカレーションへ落ちる。

## 検証手順

1. パーサに意図的な欠陥を入れ、層2→層3 のループで自動修復→再取得が緑化することを確認。
2. 修復不能なケースで K 回上限・エスカレーションが働き、無限ループしないことを確認。
3. 修正 SubAgent が追加した fixture/テストでカバレッジ100%が維持されることを確認。
4. `pnpm verify` 緑を確認。

## リスク・備考

- **自己修復の収束性**: 同一 slug の修復試行 K 回上限・dedup で無限ループを防止。収束しない種は人手フォールバック。
- **一般化 vs 種専用ハック**: 修正 SubAgent には Serebii のレイアウト揺れ（地域フォルム・複数セクション種）へ
  一般対応させる。種専用ハックは将来の揺れで破綻するため避ける。
- 正しさは層1（決定論パーサ + テスト）に宿る。修復 = パーサとテストの更新であり、Codex でも「人が parse.ts を
  直す」に縮退するだけで成果は同一（cross-agent フォールバック）。
