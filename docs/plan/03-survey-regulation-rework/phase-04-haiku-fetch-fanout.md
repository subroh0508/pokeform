# Phase 4 — Haiku 取得 SubAgent + Workflow fan-out（層2）

## 目的 / スコープ

層1（決定論スクレイパー）の上に、Claude 固有の**加速層（層2）**を乗せる。roster（解禁種族リスト）を受け、
`scrape-serebii.ts` を多種に **Workflow の `pipeline()`/`parallel()` でバッチ fan-out** する。取得 SubAgent は
**Haiku**・「HTML を読まずスクリプトを呼び exit code を判定するだけ」に縮退させ、トークンを最小化する。

- スコープ内:
  - 層2 の Workflow スクリプト（fan-out オーケストレータ）。roster を受けて多種を Haiku 取得 SubAgent へ分配。
  - 取得 SubAgent（Haiku）: `scrape-serebii.ts species <slug>`（Phase 1-2 の層1）を Bash 実行し exit code を判定。
    成功種は冪等キャッシュ（`data/raw/serebii/`）で再実行不要。失敗種（exit 3/4）は構造化レポートに集約。
  - 進捗・成功/失敗カウントを roster-source doc に記録（現行 doc 化要件と整合）。
  - SKILL.md に層2 手順を追記。
- スコープ外: 修正 SubAgent / 自己修復ループ（Phase 5）・SKILL 全面改訂（Phase 6）・全186種実投入（04 Phase 4）。

## 前提（依存）

- **Phase 3 完了**（層1 が catalog 結合まで通り、`scrape-serebii` の中間 JSON 契約・exit code が確定）。
- Workflow ツール（`pipeline()`/`parallel()`・agent model 指定 haiku）が使える環境。
- 確定済み rule: [[data-pipeline]] / [[cross-agent]]（層2 は Claude 固有・正しさは層1 に宿る）。

## タスク

- [ ] 層2 Workflow スクリプト: roster（解禁種族 slug リスト）を入力に、バッチ（同時実行キャップ + 礼儀 sleep）で
      fan-out。各 slug を Haiku 取得 SubAgent へ。
- [ ] 取得 SubAgent（Haiku）のプロンプト方針 = 「判断するな、スクリプトを呼べ」。`scrape-serebii.ts species <slug>` を
      Bash 実行 → exit code 分岐（0=成功・中間 JSON / 2=再試行 / 3,4=失敗レポート）。HTML を LLM コンテキストに載せない。
      取得 SubAgent は read-only。
- [ ] 成功種の中間 JSON を集約。失敗種（exit 3/4）を `{slug, stage, missingFields, rawHtmlPath}` で構造化レポート。
- [ ] 進捗・成功/失敗カウントを roster-source doc に記録。
- [ ] SKILL.md に層2 手順を追記（最小・全面改訂は Phase 6）。

## この Phase で育てるハーネス（rule・skill）

- 層2 Workflow スクリプト（オーケストレータ）。SKILL.md 層2 手順追記。cross-agent パリティ点検（Workflow は
  Claude 固有・Codex は層1 逐次で代替・[[cross-agent]]）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- 数十種を Workflow で fan-out → 中間 JSON 群が出揃う。取得 SubAgent が Haiku で安定動作する。
- 意図的に壊した種（fixture 外の構造）で失敗が構造化レポートされ、人手エスカレーション経路が機能する
  （自動修正は Phase 5）。

## 検証手順

1. roster 数十種で Workflow を実行し、成功種の中間 JSON 群と失敗レポートが出ることを確認。
2. 成功種が冪等キャッシュで再実行 skip されることを確認。
3. 取得 SubAgent が HTML を読まず exit code 判定のみで動くこと（Haiku で安定）をログで確認。
4. `pnpm verify` 緑を確認。

## リスク・備考

- **Haiku の判断力**: 取得 SubAgent を「scrape 実行 + exit code 分岐」に縮退できれば Haiku で十分。URL/slug 解決は
  スクリプト側に寄せ、Haiku の自然言語判断を最小化する。
- **186 並列のレート制限**: Workflow の同時実行キャップ + 礼儀 sleep でバッチ化し、Serebii への過負荷を避ける。
- 本 phase は失敗種を人手エスカレーションで吸収する（自動修復ループは Phase 5）。正しさは層1（決定論パーサ）に
  宿るため、層2 は速度の最適化に徹する。
