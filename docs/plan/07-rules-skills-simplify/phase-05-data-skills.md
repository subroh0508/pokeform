# Phase 5 — データ系 skills 圧縮

## 目的 / スコープ

データ系 skill を P1 / P2 中心に圧縮する:

- dep-update（167・25-30）: description 短縮 / 入力節 → frontmatter / 具体例（L121-148）を references 化。主因 P1 / P4。
- update-catalog（117・15-20）: frontmatter ↔ 本文の構造データ列挙重複 / 対象 id 確定ステップ自明。主因 P1 / P2。
- author-individual（86・12-15）: frontmatter ↔ 本文重複 / 役割の委譲説明くどい。主因 P2。
- stat-tuning（73・10-12）: frontmatter 過剰 / 役割のメソッド列挙。主因 P1。
- review-party（50・7-9）: frontmatter ↔ 本文冒頭の重複（既に短く余地小）。主因 P2。

スコープ外: rules・レビュー系・ワークフロー系・survey-regulation。

## 前提（依存）

- なし。本計画は後続 [`08-docs-restructure`](../08-docs-restructure/README.md) より先に実施する。データ系 skill は 08 の構造再編の影響が小さく、独立に着手できる。

## タスク

- [ ] 各 skill の frontmatter description をスリム化（P1・key concept 詰め込み解消・eval 確認）。
- [ ] frontmatter ↔ 本文冒頭の重複説明を削除（P2）。
- [ ] dep-update の具体例を `references/` 化し SKILL からリンク（P4・dangling を作らない）。
- [ ] **手順の安全性記述（check:* 委譲・合計66/各32 制約・マージ不可逆性・idempotent）は残す**。
- [ ] 委譲説明（domain / 他 skill への委譲）は冗長を削り要点 + リンクへ。

## この Phase で育てるハーネス（rule・skill）

- 上記データ系 skills の圧縮（`skill-creator` 利用）。検証ロジック（check:individual / check:party / damage / stat-tuning）は domain が SoT で skill はポインタ。

## 受け入れ基準

1. 対象 skills が目安行数に近づき、**検証委譲・制約・安全性記述・trigger が保たれている**。
2. dep-update の具体例が references へ移り SKILL からリンク（dangling ゼロ）。
3. 各 description が `skill-creator` eval で under-trigger を招かない。
4. cross-agent パリティ維持。`pnpm verify` 緑。`harness-review` 済み。

## 検証手順

1. `wc -m` で description 文字数、`wc -l` で本文削減を確認。
2. `skill-creator` eval で trigger（「個体を作りたい」「パーティを見て」「依存更新 PR を見て」等）を確認。
3. `harness-review` で「委譲先 domain / skill リンクの実在 / 安全性記述の欠落」を点検。

## リスク・備考

- データ系は機械ゲート（check:*）への委譲が安全性の核。委譲記述を削らない。
- review-party は既に短く余地小。過度な圧縮で自己説明性を失わない。
- 本 Phase 完了で計画 07（純シンプル化）が完了。
