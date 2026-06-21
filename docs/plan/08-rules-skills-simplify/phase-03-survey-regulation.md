# Phase 3 — survey-regulation 単独圧縮

## 目的 / スコープ

最大の単独削減対象 `survey-regulation` skill（287 行・削減目安 80-120）を圧縮する（調査レポート §5.3）。主因 P1 / P2 / P4:

- frontmatter（240 字超）を trigger 1-2 文へ。
- blockquote・「なぜ」節が `references/` を逐語再掲 → 参照へ置換。
- Gotchas（L235-265）の冗長を整理。
- 関連 ADR の過剰列挙を要点へ。

スコープ外: 他 skills・rules。

## 前提（依存）

- 先行計画 07 完了（`survey-regulation/references/serebii-sourcing.md` の陳腐化表記は 07 Phase 6 で是正済みの状態を前提に圧縮）。

## タスク

- [ ] frontmatter description を trigger 1-2 文へ圧縮（key concept の詰め込みを解消・§5.5 で eval 確認）。
- [ ] 本文冒頭の frontmatter 重複説明を削除（P2）。
- [ ] `references/` を逐語再掲している箇所を参照リンクへ置換（P4・dangling を作らない）。
- [ ] Gotchas の冗長整理（**安全性記述 = HTML を LLM に載せない / exit code 判定 / 取りこぼし自己修復 / redaction は残す**）。
- [ ] 関連 ADR の過剰列挙を要点 + リンクへ。
- [ ] cross-agent パリティ + `.workflow` 参照（層1/層2-3 の縮退記述）を保持。

## この Phase で育てるハーネス（rule・skill）

- `survey-regulation` skill の圧縮（`skill-creator` 利用）。references は SoT として現状維持（逐語再掲を参照へ）。

## 受け入れ基準

1. `survey-regulation` SKILL.md が目安行数（~180）に近づき、**手順の安全性記述・取りこぼし吸収・redaction が保たれている**。
2. references の逐語再掲が参照へ置換され dangling ゼロ。
3. description が `skill-creator` eval で under-trigger を招かない（多数の発火パターンを維持）。
4. cross-agent パリティ（canonical + symlink）+ `.workflow` 縮退記述維持。
5. `pnpm verify` 緑。`harness-review` でセルフレビュー済み。

## 検証手順

1. `wc -m`（文字数）で description ≤1024 と本文削減を確認。
2. `skill-creator` eval で trigger 精度（「M-A の解禁データを集めて」等の多様な発火）を確認。
3. `harness-review` で「references への参照化が dangling を作っていないか / 安全性記述の欠落」を点検。

## リスク・備考

- survey-regulation は層2-3 Workflow（Claude 固有）と層1 縮退を持つ。圧縮で「正しさは層1 に宿る」記述を落とさない。
- description が長大なぶん under-trigger リスクが高い。短縮は eval で確認してから（§5.5）。
