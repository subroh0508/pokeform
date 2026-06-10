# Phase 7 — M-A 現ロスター持ち物・技 正確化（interim）

## 目的 / スコープ

`data/champions/regulations/champions-m-a.yaml` に**既に記載済みの現ロスター種族（26種）**に限定して、
持ち物（`items` 予約キー）と各種族の `moves` を、チャンピオンズ M-A レギュレーションの**実情に正確化**する
interim phase。現状データは暫定でっち上げ（[[champions-regulation-data-placeholder]]）で、(1) `items` に
**未解禁の持ち物**（`rocky-helmet` / `life-orb` 等）が混入、(2) 各種族の `moves` が手選びの少数サブセット
（全種族で共有プール ~22 技のみ・`excadrill` 2 技等）で全 learnable 技に程遠い。これを現ロスター分だけ先に
正す（全186種への拡張は後続の Phase 12 = M-A 全データ投入に残す）。

- スコープ内:
  - `survey-regulation` で **M-A の正確な解禁持ち物リスト**と、**現ロスター26種の learnset ∩ M-A legal**を
    複数ソース突き合わせで出典付き確定・doc 化。
  - `champions-m-a.yaml` の `items` 予約キーを正確化（未解禁を除去・解禁分を反映）。
  - 現ロスター26種の各種族 `moves` を **learnset ∩ M-A legal** へ正確化（各種族 10+ 技目安・実情準拠）。
    メガ運用種族の `mega[]` は現状維持 / 正確化。
  - 追加で参照する技 / 持ち物 id を `catalog/moves.yaml` / `items.yaml` へ append-only 追記
    （未解禁を catalog から消さない・append-only マスター方針）。必要なら `fetch:data` で `data/raw` 取得。
  - `check:regulation` 緑 → `generate:data` 再生成 → `pokemon-data-reviewer` レビュー。
- スコープ外:
  - **全186種への拡張・全 legal 技/持ち物/メガの全量投入**（後続の Phase 12 = M-A 全データ投入が担う）。
  - 現ロスターに**未記載の種族の追加**（種族キーの追加は本 phase では行わない・正確化のみ）。
  - スキーマ / generate の再設計（Phase 5〜6 で確定済み）・新機能・新 rule・M-B 以降。

## 前提（依存）

- **Phase 5（技記録スキーマ再設計）/ Phase 6（generate 変換専任 + `check:regulation`）完了**（マージ済み）。
  新スキーマ（種族キー = 解禁・per-species `moves`/`mega[]`・block 記法）と authoring ゲートの上で正確化する。
- **Phase 3（情報源確定 + 20匹サンプル検証）完了**。`survey-regulation` skill と情報源 doc が確立済み。
- 確定済み rule: [[data-pipeline]] / [[cli-and-io]] / [[type-conventions]] / [[testing]]。

## タスク

- [x] `survey-regulation` で M-A の**正確な解禁持ち物リスト**を複数ソース突き合わせで確定・出典付き doc 化
      （`rocky-helmet` / `life-orb` / `assault-vest` は**非解禁**と判定・`ma-roster-source.md` Phase 7 節）。
- [x] 現ロスター26種それぞれの **learnset ∩ M-A legal** を確定（PokeAPI learnset を `fetch:data` で取得し
      競技 movepool を learnset 照合・覚えない技 2 件を差し替え）。
- [x] `champions-m-a.yaml` の `items` 予約キーを正確化（life-orb / assault-vest / rocky-helmet 除去・3 解禁維持）。
- [x] 現ロスター26種の各種族キー下 `moves` を learnset ∩ legal へ正確化（block シーケンス・各種族 13〜16 技）。
- [x] 追加 id（126 技）を `catalog/moves.yaml` へ append-only 追記。
- [x] `node src/cli/index.ts check:regulation data/champions/regulations/champions-m-a.yaml` が 0 終了
      （覚えない技混入・参照切れ無し）。
- [x] `pnpm fetch:data && pnpm generate:data` で再生成し、`data/generated/regulations/champions-m-a/` に反映。
- [x] 生成データの妥当性を `pokemon-data-reviewer` agent でレビュー（重大な不整合なし）。

## この Phase で育てるハーネス（rule・skill）

- なし（データ正確化が中心）。取りこぼし・使い勝手の問題があれば `survey-regulation` を `skill-creator` で改修。
  M-A 確定の進捗に応じ [[champions-regulation-data-placeholder]] メモリを更新する。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- `champions-m-a.yaml` の `items` から**未解禁の持ち物が除去**され、M-A 実情に整合する（出典付き）。
- 現ロスター26種の各種族 `moves` が **learnset ∩ M-A legal** で正確化され（各種族 10+ 技目安・少数サブセット解消）、
  手選びの共有プールではなく実情準拠になっている。
- `check:regulation` が 0 終了（覚えない技混入・参照切れ無し）。全 id が catalog 参照で解決できる。
- `pokemon-data-reviewer` のレビューで重大な不整合が無い。
- **現ロスターの種族数は不変**（種族キーの追加 / 削除をしない・正確化のみ）。

## 検証手順

1. `survey-regulation` 出典 doc と投入後の `items` / 各種族 `moves` を突き合わせ、未解禁混入が無いことを確認。
2. `check:regulation` が 0 終了することを確認（authoring ゲート）。
3. `pnpm generate:data` 後、代表種族（例: `excadrill` / `meowscarada`）の `moves` が 10+ で全 learnable 技を
   含むことをスポット確認（少数サブセットの解消）。
4. `pokemon-data-reviewer` agent で生成データをレビューし指摘を解消。
5. `pnpm verify` 緑を確認。

## リスク・備考

- **interim の位置づけ**: 本 phase は現ロスター限定の正確化で、全186種の全量投入は Phase 12（M-A 全データ投入）が
  担う。Phase 12 は本 phase の正確化済みデータを土台に種族を全列挙して拡張する（やり直しを避ける）。
- learnset ∩ legal の materialize 時、PokeAPI learnset の version_group 差異に注意（過去世代限定技の混入を
  `overrides` / legal フィルタで除外）。
- `data/raw` は gitignore・worktree 非共有のため、`fetch:data` 未実行時 `check:regulation` の learnset 検証は
  参照整合のみに degrade する（[[data-pipeline]]）。本 phase は learnset を引くため `fetch:data` を実行する。
- 持ち物の解禁判定はソースで揺れやすい（メガストーン / 汎用持ち物）。`survey-regulation` で出典を残し矛盾を解消する。
