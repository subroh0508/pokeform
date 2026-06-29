# Phase 1 — レコード全削除 + M-A 限定投入（10 体 + 全持ち物）

> 投入手段は **03-survey-regulation-rework で構築した新パイプライン（決定論スクレイパー + Haiku 取得 fan-out +
> 自己修復ループ）+ 05-move-master-scraper-refactor で整理した役割分割済みパイプライン**経由。投入先は
> [04-generated-layout-redesign の Phase 1-3](../04-generated-layout-redesign/README.md) で再編した新レイアウト
> （specs / languages / per-reg 4 オブジェクト・`data/champions/m-a/*` / `data/languages/*`）。技メタは 05 Phase 2 で
> Champions 準拠へ是正済みの `move-specs` を使う。

## 目的 / スコープ

全量投入の前に **`survey-regulation` skill を限定セットで実地検証する**サイクルの起点。現行のプレースホルダ・レコードを全削除し、M-A を代表 10 体（リザードン・スターミー・ゲンガーを含む）+ 全持ち物に絞って skill 経由でゼロから投入する。種族を絞っても skill の駆動経路（取得 → 転記 → 補完 → 検証 → 生成 → レビュー）は本投入（Phase 4）と同一にし、小さくレビュー可能な単位で skill の取りこぼし・転記ミス・使い勝手を炙り出す。技の出自は **Serebii 第一優先・PokeAPI learnset 非依存**（ADR 0026）、日本語名は PokeAPI names から補完。

- スコープ内:
  - **現行レコードの全削除**: `data/champions/m-a/*`・`data/champions/m-b/*` の per-reg 解禁データ（species / items / mega / species-moves）と、それに紐づく `data/champions/*-specs.yaml` / `data/languages/*.yaml` のプレースホルダ由来エントリを、skill でゼロから組み直せる初期状態へ戻す。
  - M-A の代表 **10 体**（**リザードン・スターミー・ゲンガー** + 解禁済みから選ぶ代表 7 体）+ **解禁済み全持ち物**を、`survey-regulation` skill 経由で取得 + 出典付き roster-source doc 化（複数ソース突き合わせ）。
  - `serebii-to-catalog` で対象種・技・持ち物・特性・メガを各 catalog（specs / languages）へ append-only 転記。`fetch:data` → `materialize` で構造データ（種族値 / タイプ / 特性 / dex / category）と ja 名を補完。
  - per-reg `data/champions/m-a/*`（block 記法）を 10 体 + 全持ち物で著述（各種族 `species-moves` = M-A 使用可能技全量、メガ運用種に `mega[]`、`items` = 全持ち物）。
  - `check:regulation` 0 終了 → `generate:data` 再生成 → `pokemon-data-reviewer` レビュー。
- スコープ外:
  - M-A の残り全種族（本投入は [10-showdown-first-data Phase 6](../../10-showdown-first-data/phase-06-full-rollout.md) へ移管）。M-B（Phase 2）。
  - スキーマ / generate の再設計（02 で確定済み）。スクレイパー / skill / legality / メガ取り込みの実装（03 + 05 で完了済み）。技マスターの値是正（05 Phase 2 で完了済み）。
  - 検証で判明する前の skill 改修（Phase 3 のゲート判定後に行う）。

## 前提（依存）

- **04-generated-layout-redesign の Phase 1-3 完了**（新レイアウト）/ **05-move-master-scraper-refactor 完了**（技マスター専用取得で `move-specs` 是正済み + スクレイパー役割分割 + `survey-regulation` オーケストレーター化）/ **03-survey-regulation-rework 完了（Phase 1-12）**（新パイプライン + legality / メガ / 生成整備）/ **02-data-model-redesign 完了**（新スキーマ + `check:regulation` ゲート + catalog 化 + materialize）。
- メガ先の技プールは base 継承（[ADR 0024](../../../adr/0024-mega-moves-inherit-base.md)）。技の出自 = Serebii 第一優先（ADR 0026）。append-only / skill-authored（ADR 0027 / 0030）。
- 確定済み rule: [[data-pipeline]] / [[cli-and-io]] / [[type-conventions]] / [[testing]]。

## タスク

- [ ] **現行レコードの全削除**: `data/champions/m-a/*`・`data/champions/m-b/*` の解禁データと、specs / languages のプレースホルダ由来エントリを初期状態へ戻す（skill でゼロから組み直す前提）。削除後に `check:regulation` / `verify` が初期状態で通ることを確認。
- [ ] M-A の代表 10 体（リザードン・スターミー・ゲンガー + 代表 7 体）を確定し、`survey-regulation` skill で解禁技 / 解禁持ち物（全件） / メガを取得 + 自己修復し、出典付き roster-source doc 化（Serebii 第一優先・PokeAPI learnset 非依存）。
- [ ] `serebii-to-catalog` で対象 10 体 + 全持ち物を各 catalog（specs / languages）へ append-only 転記（ja/en 併記・技マスター値は 05 で是正済み・特性の追記漏れ = 生成エラーに注意）。
- [ ] `pnpm fetch:data` で追加 slug の構造データ + ja 名を `data/raw` 取得 → `pnpm materialize` で specs / languages へ転記。
- [ ] per-reg `data/champions/m-a/*`（block 記法）を著述: species = 10 体、各種族 `species-moves` = M-A 使用可能技全量、メガ運用種に `mega[]`、`items` = 解禁済み全持ち物。
- [ ] `node src/cli/index.ts check:regulation data/champions` が 0 終了することを確認。
- [ ] `pnpm fetch:data && pnpm generate:data` で再生成。
- [ ] 生成データを `pokemon-data-reviewer` agent でレビュー（種族値・タイプ・日英名・解禁整合・メガ配列）。

## この Phase で育てるハーネス（rule・skill）

- なし（データ投入が中心）。投入過程で skill の不備が見えた場合も、改修判定は Phase 3 の検証ゲートに集約する（本 phase では記録に留める）。[[champions-regulation-data-placeholder]] メモリを限定セット投入の実態に合わせて更新。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- 旧プレースホルダ・レコードが全削除され、M-A が代表 10 体（リザードン・スターミー・ゲンガー含む）+ 全持ち物の限定セットで skill 経由投入され、`data/generated/` の M-A 生成 TS に反映される。
- 各種族に M-A 使用可能技（Serebii movepool 全量・ADR 0026）が紐づく。
- `check:regulation` が 0 終了（参照整合 / schema）。全 id が catalog 参照で解決できる。
- `pokemon-data-reviewer` のレビューで重大な不整合が無い。

## 検証手順

1. 全削除後に初期状態で `check:regulation` / `verify` が通ることを確認。
2. roster-source doc と投入後の per-reg 種族 dex を突き合わせ、10 体 + 全持ち物が一致することを確認。
3. `check:regulation` が 0 終了することを確認。
4. `pnpm generate:data` 後、代表種族の `species-moves` が Serebii movepool を含むことをスポット確認。
5. `pokemon-data-reviewer` agent で生成データをレビューし指摘を解消。
6. `pnpm verify` 緑を確認。

## リスク・備考

- **限定セットは skill の実地検証手段**。10 体規模はレビュー可能で、本投入前に skill の不備を炙り出す。種族を絞っても skill 駆動経路は本投入と同一にする（検証の妥当性のため）。
- **全削除はサイクルの起点**。Phase 3 の検証で skill を直すたびに本 phase からやり直す（プレースホルダ・前サイクルの残骸を残さない）。
- 代表 7 体の選定は本 phase 実行時に確定する（タイプ・メガ運用・持ち物運用が多様な代表種を選び、skill の各経路を踏む）。
- 技の出自は Serebii 第一優先・PokeAPI learnset 非依存（ADR 0026）。メガの多重表現（種族 `megaLinks` / 持ち物 megaStone / per-reg `mega[]`）の整合は `check:regulation` で担保。メガ先の技プールは base 継承（[ADR 0024](../../../adr/0024-mega-moves-inherit-base.md)）。
