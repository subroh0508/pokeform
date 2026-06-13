# Phase 16 — M-A 全データ投入（全186種 + 全 movepool）

## 目的 / スコープ

Phase 5〜6 で確定した新スキーマ（種族キー = 解禁・per-species `moves`/`mega[]`・block 記法）と
`check:regulation` ゲート、Phase 7（現ロスター持ち物・技 正確化）、Phase 8（`survey-regulation`
skill の全量 materialize 手順の定型化）/ Phase 9（3 種小データセットでのパイプライン本格スケール検証）、
および **Phase 12（PokeAPI を Champions legality / 技威力の信頼源から外す決定 + harness 追従）**で
de-risk 済みの土台の上に、レギュレーション M-A で解禁されている**全種族・全技・全持ち物・全メガ**を
全量投入し M-A を完成させる。Phase 7 で正確化した現ロスターと Phase 9 で投入した 3 種を起点に種族を
全列挙へ拡張する（やり直しを避ける）。各種族の `moves` は **Phase 12 で確定した情報源
（Serebii 第一優先・PokeAPI learnset 非依存）に基づく M-A の使用可能技**で全量化し、全 movepool が紐づく
（各種族 10+）。

- スコープ内:
  - `survey-regulation` で M-A 解禁の**全186種 + 使用可能技 + 解禁持ち物 + メガ**を出典付き確定・doc 化
    （Serebii 第一優先・PokeAPI learnset 非依存・Phase 12 の決定に従う）。
  - `catalog/species.yaml` に**全186種**追記（+ `megaLinks` 配列・**種族値 / タイプ / 特性 / 図鑑番号は Phase 13 の
    `materialize` で raw→catalog 転記**）、`catalog/moves.yaml` / `items.yaml` / `abilities.yaml` に追加 id を
    append-only 追記（技メタは Phase 12 の SoT・category は Phase 13 の `materialize`）。`fetch:data` → `materialize`
    で構造データを catalog へ載せる。
  - `regulations/champions-m-a.yaml` の各種族キー下に `moves` = M-A 使用可能技を全量、解禁種族キーを全列挙、
    メガ種族に `mega[]` を付与。
  - `check:regulation` 緑（参照整合 / schema・**learnset 照合は Phase 12 で撤去済み**）→ `generate:data` 再生成 →
    `pokemon-data-reviewer` レビュー。
- スコープ外: M-B 以降の正確データ（未公開・暫定維持）。新機能・新 rule。01-mvp の機能拡張。スキーマ / generate の
  再設計（Phase 5〜6 で確定済み）。

## 前提（依存）

- **Phase 5（スキーマ再設計）/ Phase 6（generate 変換専任 + `check:regulation`）完了**。新スキーマと authoring
  ゲートが揃い、全量投入を**最終構造の上**で行えること。
- **Phase 7（現ロスター持ち物・技 正確化）完了**。現ロスターの正確化済みデータを起点に全186種へ拡張する。
- **Phase 8（`survey-regulation` skill 全量 materialize 手順の定型化）完了**。全 movepool + 解禁持ち物を
  Serebii 第一優先で materialize する定型手順が skill 化されており、それに沿って全量投入する。
- **Phase 9（3 種小データセット検証投入）完了**。catalog 追記→`fetch:data`→`check:regulation`→`generate:data`→
  `verify` のパイプラインが本格スケール（各種族60〜70技 / 持ち物100件超）で通ることが確認済みで、全186種を de-risk
  済み。Phase 9 で投入した 3 種を起点に全列挙へ拡張する。
- **Phase 10（catalog 日英名 authoring + generate 名前変換専任化）完了**。catalog YAML が `id → { ja, en }` 形式に
  なり、各 id 追記時に ja/en 名も同時記録するスキーマが確定済み。全186種・全技・全持ち物・全特性の投入時、
  catalog エントリに ja/en 名を含めて materialize する（`survey-regulation` skill が ja/en 記録手順を内包）。
- **Phase 12（PokeAPI を Champions legality / 技威力の信頼源から外す決定 + harness 追従）完了**。技の出自が
  Serebii 第一優先へ一本化され、`check:regulation` から learnset 照合が撤去され、技メタの SoT が PokeAPI raw から
  移設済み。本 Phase はこの確定済み前提（learnset ∩ legal ではなく Serebii movepool 全量）の上で投入する。
- **Phase 13（構造データ catalog 化）完了**。種族値・タイプ・特性・図鑑番号・category の SoT が catalog YAML へ移り、
  `fetch:data` → `materialize`（raw→catalog 転記）→ `generate:data`（raw 非依存）のパイプラインが確定済み。本 Phase は
  全186種の構造データを `materialize` 経由で catalog へ投入する（raw 直読の旧経路は無い）。
- **Phase 14（data/ ディレクトリ説明 README）完了**。`data/` 配下の索引が整備済みで、投入対象の各エントリの
  取得元・SoT・更新導線が `data/README.md` から辿れる。
- **Phase 15（data/ 全 YAML ブロックスタイル強制ゲート）完了**。`materialize` が block 出力になり flow 禁止
  ゲートが verify/CI に組み込まれているため、全186種を**最初から block スタイルで投入**でき、後で全量を整形し直す
  事故が無い（全量の手前でスタイルを確定）。flow を入れると本 Phase の `verify` が非0で弾かれる。
- **Phase 3（情報源確定 + 20匹サンプル検証）完了**（マージ済み）。情報源・全リスト doc・`survey-regulation` skill が確立済み。
- 確定済み rule: [[data-pipeline]] / [[cli-and-io]] / [[type-conventions]] / [[testing]]。

## タスク

- [ ] `survey-regulation` skill で M-A 全解禁リスト（全186種 / 使用可能技 / 解禁持ち物 / メガ）を複数ソース突き合わせで確定・出典付き doc 化（Serebii 第一優先・PokeAPI learnset 非依存）。
- [ ] M-A 解禁の**全186種**を `catalog/species.yaml` へ追記（Phase 3 の全リスト doc を正本に・`megaLinks` 配列）。各 id に **`ja` / `en` 名を併記**（Phase 10 のスキーマ・`id → { ja, en }` 形式）。
- [ ] 各種族が参照する**技 / 持ち物 / 特性 / メガ**を各 catalog へ append-only 追記（**ja/en 名併記**・技メタは Phase 12 で確定した SoT・特性の追記漏れ = 生成エラーに注意）。
- [ ] `pnpm fetch:data` で追加 slug の**構造データ（種族値 / タイプ / 特性 / 持ち物 category）**を `data/raw` 取得 → `pnpm materialize` で catalog YAML へ転記（Phase 13 の経路・技威力等の技メタは Phase 12 の決定により raw から取らず Serebii authoring）。
- [ ] `regulations/champions-m-a.yaml`（block 記法）を全量化:
  - [ ] 解禁種族キーを全186種列挙。各種族キー下に `moves` = **M-A 使用可能技（Serebii movepool 全量・Phase 12 の情報源）**を全量（block シーケンス）。
  - [ ] メガ運用種族に `mega:`（配列）を付与。`items` 予約キーを全量化。
- [ ] `node src/cli/index.ts check:regulation data/champions/regulations/champions-m-a.yaml` が 0 終了することを確認（参照切れ無し・schema 整合。**learnset 照合は Phase 12 で撤去済み**）。
- [ ] `pnpm fetch:data && pnpm generate:data` で再生成。
- [ ] 生成データの妥当性を `pokemon-data-reviewer` agent でレビュー（種族値・タイプ・日英名・解禁整合・メガ配列）。

## この Phase で育てるハーネス（rule・skill）

- なし（データ投入が中心）。M-A 確定に合わせ [[champions-regulation-data-placeholder]] メモリを更新 / 解消。
  取りこぼし・使い勝手の問題があれば `survey-regulation` を `skill-creator` で改修。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- M-A 解禁の**全186種・全技・全持ち物・全メガ**が新スキーマで投入され、`data/generated/regulations/champions-m-a/species.ts` に反映される。
- **各種族に M-A 使用可能技（Serebii movepool 全量・Phase 12 の情報源）が紐づく**（各種族 10+ 技）。
- `check:regulation` が 0 終了（参照切れ無し・schema 整合）。全 id が catalog 参照で解決できる。
- `pokemon-data-reviewer` のレビューで重大な不整合（種族値・タイプ・解禁整合・メガ）が無い。

## 検証手順

1. Phase 3 / 本 phase の全リスト doc と投入後の per-reg 種族 dex を突き合わせ、種族数（186）が一致することを確認。
2. `check:regulation` が 0 終了することを確認（authoring ゲート・参照整合 / schema）。
3. `pnpm generate:data` 後、代表種族の `moves` が 10+ で Serebii movepool を含むことをスポット確認。
4. `pokemon-data-reviewer` agent で生成データをレビューし指摘を解消。
5. `pnpm verify` 緑を確認。

## リスク・備考

- **データ投入 PR（>1000 行）を 1 PR 許容**: M-A は約186種・各種族数十技規模で意味ある粒度分割が困難なため 1 PR とする
  （[[planning]] の例外・OVERVIEW に根拠記載）。レビュー容易性のため、手動カタログ / regulation YAML の差分と生成物差分を分けて説明する。
- 大量投入で取りこぼし・名称ゆれ・フォルム扱いの誤りが出やすい。Champions 実態との差分は **catalog / regulations YAML を直接編集して吸収**する（`overrides.yaml` は Phase 13 で廃止済み・補正レイヤー不要）。
- 技の出自は **Serebii 第一優先・PokeAPI learnset 非依存**（Phase 12）。Serebii の movepool を正として全量化し、
  PokeAPI learnset との突き合わせは行わない（learnset 照合ゲートは撤去済み）。技の正確性は複数ソース突き合わせと
  `pokemon-data-reviewer` レビューで担保する。
- メガの多重表現（種族 `megaLinks` 配列 / 持ち物 megaStone / per-reg `mega[]`）の整合に注意。`check:regulation` で担保。
- **メガ先の技プール（解決済み・[ADR 0024](../../adr/0024-mega-moves-inherit-base.md)）**: Phase 9 で
  `pokemon-data-reviewer` が検出した「`generate.ts` が mega 先の `moves` を base より過大表現する」問題は、
  **メガ先 `moves` を base 種族の per-reg `moves` へ継承する設計**（ADR 0024）で解消済み。
  全量投入時もメガ先は base 継承で自動的に整合する（メガ先に per-reg `moves` を別途書かない）。
- M-A 完成後、M-B 詳細が公開されたら別計画（`03-*`）で M-B 投入を検討（本計画スコープ外）。
