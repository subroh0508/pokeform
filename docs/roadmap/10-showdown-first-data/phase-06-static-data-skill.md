# Phase 6 — 静的データの欠落チェック + 導出著述 skill（author-static-data）新設

> 全量本投入（Phase 7）の手前に**挿入**した phase。`data/` 完全削除状態からの復元を「**静的データ（取得経路なし・reg 非依存）の著述**」と「**レギュレーション情報の取得**（showdown / PokeAPI / Serebii 経路）」に分離し、前者を skill 化する（静的 bootstrap と reg 取得の 2 skill 分割方針）。挿入に伴う renumber（旧 Phase 6 → Phase 7）の参照追従は [[planning]] の insert / renumber チェックリストに従う。

## 目的 / スコープ

`data/` 配下のうち**取得経路が存在しない静的データ** = `data/champions/rules.yaml` / `data/champions/type-specs.yaml` / `data/languages/types.yaml` の 3 ファイルについて、**欠落チェックと導出著述**を行う `author-static-data` skill を新設する。シードファイル（テンプレの複写）は持たず、各ファイルを**既存の SoT から導出**して著述する。存在するデータには触れない（ファイル単位の冪等スキップ）。

- スコープ内: skill 新設（canonical + symlink）、欠落チェック手順、導出著述手順、[[data-pipeline]] への著述経路ポインタ追記、Phase 7（本投入）との責務境界の明文化。
- スコープ外: レギュレーション情報の取得（showdown 5 データセット / PokeAPI ja / Serebii 速報 = 既存経路と Phase 7 の責務）。per-reg 静的データ（`<reg>/index.yaml` の period・`languages/regulations.yaml` のエントリ = reg 依存ゆえ Phase 7 側）。`type-specs` の showdown 抽出自動化（`showdown:types` 新設 = OVERVIEW スコープ外の維持・将来計画へ送り）。`data/` 全削除の実行そのもの（Phase 7）。

## 前提（依存）

- Phase 1-5 完了（showdown 経路・PokeAPI ja 専任・Serebii 速報・照合 skill が確定済み）。
- 確定済み rule: [[data-pipeline]]（skill-authored の定義・「項目の取得元」表）/ [[game-spec]]（`rules.yaml` の値の SoT）/ [[skill-authoring]] / [[cross-agent]]。

## タスク

- [ ] `skill-creator` skill（公式）で `author-static-data` を新設する（canonical `.claude/skills/author-static-data/` + `.agents/skills/author-static-data` symlink を同一 PR で追加・[[cross-agent]]）。作成時は Anthropic の skill ベストプラクティス（<https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices>）を参照し、description trigger（何を + いつ）・progressive disclosure（本文 ≤500 行・詳細は `references/`）・説明型の文体を守る（[[skill-authoring]]）。
- [ ] **欠落チェック**: 対象 3 ファイルの存在 + スキーマ充足（必須キーの欠落）を点検し、欠落項目のみ列挙する手順を含める。**存在するファイルはスキップ**（冪等・「存在 = 正」とみなし完全性検証はしない）。値を疑って再著述したい場合は先に該当ファイルを削除する = 再著述の明示的な意思表示、を skill 本文に明記する。
- [ ] **導出著述**（シード非所持・復元元は既存 SoT）:
  - `rules.yaml` ← [[game-spec]] rule（Lv50 / 個体値31 固定・能力ポイント合計66・各≤32・性格±10%・二重 floor の計算式定数）から導出。
  - `type-specs.yaml` ← pokemon-showdown `typechart.ts` 由来の相性倍率 `damageTo`（非 1.0 のみ・skill-authored 維持 = OVERVIEW スコープ外と整合）。
  - `languages/types.yaml` ← 18 タイプの ja/en（固定知識）。
- [ ] **Phase 7 前提ゲートの明文化**: reg 取得（showdown-sync / serebii 経路）を実行する前に本 skill の欠落チェックを通す **fail-fast 誘導**を skill 本文に記す（skill 間の自動連鎖はしない・束ねる場合は明示的オーケストレーションの責務）。
- [ ] [[data-pipeline]] の「項目の取得元」表の skill-authored 行（タイプ相性 damageTo / タイプ名 / 計算式定数）に本 skill への著述経路ポインタを追記する。

## この Phase で育てるハーネス（rule・skill）

- **新設 skill**: `author-static-data`（canonical + `.agents/skills` symlink・`skill-creator` 利用・[[skill-authoring]]）。
- **rule 追記**: [[data-pipeline]]（skill-authored 静的データの著述経路として本 skill を指す）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome / yaml-style）が緑。
- 一時ブランチで対象 3 ファイルを削除した状態から skill を実行すると 3 ファイルが復元され、削除前 main と内容等価（`git diff` で意図差分なし）で `check:yaml-style` を通過する。
- 全ファイル存在状態で skill を実行すると**変更ゼロ**（冪等スキップ）。
- canonical と `.agents/skills` symlink のパリティが取れている（[[cross-agent]]）。`description` は文字数 ≤1024。

## 検証手順

1. 一時ブランチで `data/champions/rules.yaml` / `data/champions/type-specs.yaml` / `data/languages/types.yaml` を削除 → skill 実行 → 3 ファイルが復元され `git diff` で内容等価を確認。
2. そのまま skill を再実行 → working tree に変更が無いこと（冪等スキップ）を確認。
3. `ls -la .agents/skills/author-static-data` が相対 symlink で canonical を指すことを確認。
4. `pnpm verify` 緑。

## リスク・備考

- **相性表の著述ミス**: type chart は 18×18 で手著述の取り違えが混入しうる。pokemon-showdown `typechart.ts` を参照して著述し、`pokemon-data-reviewer` の相性表点検で裏取りする。将来 `showdown:types` 抽出（6 本目のデータセット）として機械取得へ移す拡張は別計画へ送る。
- **境界はファイル単位でなくデータ単位**: `languages/regulations.yaml` はファイルとしては reg 非依存だがエントリが per-reg のため本 skill は触らない（Phase 7 の責務）。転記スクリプトが前提とするファイル骨格（空 map）の要否は実装時に確定する。
- 本 phase の変更はハーネス資産（skill + rule 追記）のみで src / data 変更なし。独立レビューは `harness-review`。
