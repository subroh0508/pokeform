# Phase 10 — M-A 全データ投入（全186種 + 全 learnable 技）

## 目的 / スコープ

Phase 5〜6 で確定した新スキーマ（種族キー = 解禁・per-species `moves`/`mega[]`・block 記法）と
`check:regulation` ゲート、Phase 7（現ロスター持ち物・技 正確化）、および Phase 8（`survey-regulation`
skill の全量 materialize 手順の定型化）/ Phase 9（3 種小データセットでのパイプライン本格スケール検証）で
de-risk 済みの土台の上に、レギュレーション M-A で解禁されている**全種族・全技・全持ち物・全メガ**を
全量投入し M-A を完成させる。Phase 7 で正確化した現ロスターと Phase 9 で投入した 3 種を起点に種族を
全列挙へ拡張する（やり直しを避ける）。各種族の `moves` は
**learnset ∩ M-A legal(467)** で全量化し、全 learnable 技が紐づく（各種族 10+）。

- スコープ内:
  - `survey-regulation` で M-A 解禁の**全186種 + legal 技467 + 持ち物117 + メガ**を出典付き確定・doc 化。
  - `catalog/species.yaml` に**全186種**追記（+ `megaLinks` 配列）、`catalog/moves.yaml` / `items.yaml` /
    `abilities.yaml` に追加 id を append-only 追記。`fetch:data` で `data/raw` 取得。
  - `regulations/champions-m-a.yaml` の各種族キー下に `moves` = learnset ∩ legal を全量、解禁種族キーを全列挙、
    メガ種族に `mega[]` を付与。
  - `check:regulation` 緑 → `generate:data` 再生成 → `pokemon-data-reviewer` レビュー。
- スコープ外: M-B 以降の正確データ（未公開・暫定維持）。新機能・新 rule。01-mvp の機能拡張。スキーマ / generate の
  再設計（Phase 5〜6 で確定済み）。

## 前提（依存）

- **Phase 5（スキーマ再設計）/ Phase 6（generate 変換専任 + `check:regulation`）完了**。新スキーマと authoring
  ゲートが揃い、全量投入を**最終構造の上**で行えること。
- **Phase 7（現ロスター持ち物・技 正確化）完了**。現ロスターの正確化済みデータを起点に全186種へ拡張する。
- **Phase 8（`survey-regulation` skill 全量 materialize 手順の定型化）完了**。全 learnable 技 + 解禁持ち物を
  Serebii 第一優先で materialize する定型手順が skill 化されており、それに沿って全量投入する。
- **Phase 9（3 種小データセット検証投入）完了**。catalog 追記→`fetch:data`→`check:regulation`→`generate:data`→
  `verify` のパイプラインが本格スケール（各種族60〜70技 / 持ち物100件超）で通ることが確認済みで、全186種を de-risk
  済み。Phase 9 で投入した 3 種を起点に全列挙へ拡張する。
- **Phase 3（情報源確定 + 20匹サンプル検証）完了**（マージ済み）。情報源・全リスト doc・`survey-regulation` skill が確立済み。
- 確定済み rule: [[data-pipeline]] / [[cli-and-io]] / [[type-conventions]] / [[testing]]。

## タスク

- [ ] `survey-regulation` skill で M-A 全解禁リスト（全186種 / legal 技467 / 持ち物117 / メガ）を複数ソース突き合わせで確定・出典付き doc 化。
- [ ] M-A 解禁の**全186種**を `catalog/species.yaml` へ追記（Phase 3 の全リスト doc を正本に・`megaLinks` 配列）。
- [ ] 各種族が参照する**技 / 持ち物 / 特性 / メガ**を各 catalog へ append-only 追記（特性の追記漏れ = 生成エラーに注意）。
- [ ] `fetch-pokeapi.ts` で追加 slug（種族 / 技 / 持ち物 / 特性）を取得・`data/raw` キャッシュ。
- [ ] `regulations/champions-m-a.yaml`（block 記法）を全量化:
  - [ ] 解禁種族キーを全186種列挙。各種族キー下に `moves` = **learnset ∩ M-A legal(467)** を全量（block シーケンス）。
  - [ ] メガ運用種族に `mega:`（配列）を付与。`items` 予約キーを全量化。
- [ ] `node src/cli/index.ts check:regulation data/champions/regulations/champions-m-a.yaml` が 0 終了することを確認（覚えない技・参照切れ無し）。
- [ ] `pnpm fetch:data && pnpm generate:data` で再生成。
- [ ] 生成データの妥当性を `pokemon-data-reviewer` agent でレビュー（種族値・タイプ・日英名・解禁整合・メガ配列）。

## この Phase で育てるハーネス（rule・skill）

- なし（データ投入が中心）。M-A 確定に合わせ [[champions-regulation-data-placeholder]] メモリを更新 / 解消。
  取りこぼし・使い勝手の問題があれば `survey-regulation` を `skill-creator` で改修。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- M-A 解禁の**全186種・全技・全持ち物・全メガ**が新スキーマで投入され、`data/generated/regulations/champions-m-a/species.ts` に反映される。
- **各種族に全 learnable 技（learnset ∩ legal）が紐づく**（各種族 10+ 技）。
- `check:regulation` が 0 終了（覚えない技混入・参照切れ無し）。全 id が catalog 参照で解決できる。
- `pokemon-data-reviewer` のレビューで重大な不整合（種族値・タイプ・解禁整合・メガ）が無い。

## 検証手順

1. Phase 3 / 本 phase の全リスト doc と投入後の per-reg 種族 dex を突き合わせ、種族数（186）が一致することを確認。
2. `check:regulation` が 0 終了することを確認（authoring ゲート）。
3. `pnpm generate:data` 後、代表種族の `moves` が 10+ で全 learnable 技を含むことをスポット確認。
4. `pokemon-data-reviewer` agent で生成データをレビューし指摘を解消。
5. `pnpm verify` 緑を確認。

## リスク・備考

- **データ投入 PR（>1000 行）を 1 PR 許容**: M-A は約186種・各種族数十技規模で意味ある粒度分割が困難なため 1 PR とする
  （[[planning]] の例外・OVERVIEW に根拠記載）。レビュー容易性のため、手動カタログ / regulation YAML の差分と生成物差分を分けて説明する。
- 大量投入で PokeAPI 由来の取りこぼし・名称ゆれ・フォルム扱いの誤りが出やすい。`overrides.yaml` で補正する。
- learnset ∩ legal(467) の materialize 時、PokeAPI learnset の version_group 差異に注意（過去世代限定技の混入を `overrides` / legal フィルタで除外）。
- メガの多重表現（種族 `megaLinks` 配列 / 持ち物 megaStone / per-reg `mega[]`）の整合に注意。`check:regulation` で担保。
- M-A 完成後、M-B 詳細が公開されたら別計画（`03-*`）で M-B 投入を検討（本計画スコープ外）。
