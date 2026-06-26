# Phase 2 — レビュー skill 共通フレーム抽出

## 目的 / スコープ

`code-review` / `harness-review` の SKILL.md は手順 1-5（diff 収集 → paths 絞込 → checklist 評価 → 重大度 → PR コメント）がほぼ同一構造。**共通フレームを `code-review.md` rule に置き、両 skill は差分（各 checklist 参照）に集中**させる。auto-merge ゲートも両 references から rule へ一本化する。

削減目安: code-review(skill) 102→−15-20 / harness-review(skill) 101→−10-15。共通手順・auto-merge ゲートを rule へ移すぶん。

スコープ外: rules 単体圧縮（Phase 0/1）・他 skills（Phase 3-5）。

## 前提（依存）

- なし。本計画は後続 [`08-docs-restructure`](../08-docs-restructure/README.md) より先に実施する。`code-review.md:27` の plan 参照違反是正は 08 が行う（本 Phase の共通フレーム抽出とは別編集で、08 が本計画の圧縮後にリベースする）。

## タスク

- [ ] `code-review.md` rule に**共通レビュー手順フレーム**（diff 収集 → paths 絞込 → checklist 評価 → 重大度 → PR コメント）と **auto-merge ゲート**の一本化記述を追加。
- [ ] `code-review` skill / `harness-review` skill から共通手順の逐語記述を削り、rule の共通フレームを参照 + 各自の差分（checklist references）に集中。
- [ ] `references/` の auto-merge ゲートを rule へ寄せ、両 skill / references からリンク（dangling を作らない）。
- [ ] 両 skill の description（trigger = 対象の住み分け src vs ハーネス）は意味を変えない。

## この Phase で育てるハーネス（rule・skill）

- `code-review.md` rule に共通フレーム + auto-merge ゲートを集約。`code-review` / `harness-review` skill を差分集中へ圧縮（`skill-creator` 利用）。

## 受け入れ基準

1. 共通手順・auto-merge ゲートが `code-review.md` rule に一本化され、両 skill は重複記述を持たず差分に集中。
2. references から rule への参照が張られ dangling ゼロ。
3. 両 skill の description（src 用 / ハーネス用の住み分け）の trigger 精度が維持されている。
4. cross-agent パリティ（canonical + symlink）維持。
5. `pnpm verify` 緑。`harness-review` でセルフレビュー済み。

## 検証手順

1. `code-review` / `harness-review` の SKILL.md を diff し、手順 1-5 の逐語重複が消えたことを確認。
2. `harness-review` で「共通フレームが rule に一本化されたか / auto-merge ゲートの二重化が解消したか」を点検。
3. `skill-creator` eval で両 skill の trigger（対象の住み分け）が崩れていないことを確認。

## リスク・備考

- 共通フレームを rule へ寄せても、各 skill の「対象が違う（src vs ハーネス）」差分は明示し続ける（住み分けが trigger の核）。
- auto-merge は不可逆な操作のゲート。一本化で発火条件を緩めない（安全性記述は保持）。
