# Phase 4 — M-A・M-B 全解禁情報の本投入（全種・全技・全持ち物・全メガ）

> Phase 3 の検証ゲートで `survey-regulation` skill が健全と確認できてから実施する本投入。投入手段は Phase 1-2 と
> 同一（03 + 05 の取得パイプライン + オーケストレーター化された `survey-regulation`）で、[04 の新レイアウト](../completed/04-generated-layout-redesign/README.md)
> の `data/champions/m-a/*` / `data/champions/m-b/*` へ全量投入する。

## 目的 / スコープ

検証済みの skill を使って、M-A・M-B の**全解禁情報（全種族・全使用可能技・全解禁持ち物・全メガ）**を投入し両レギュを完成させる。限定セット（Phase 1-2）と同一の駆動経路を全量で流す。

- スコープ内:
  - M-A・M-B 各レギュの**全解禁種族**を `survey-regulation` skill で取得 + 自己修復し出典付き doc 化（Serebii 第一優先・PokeAPI learnset 非依存）。収束しない種は人手エスカレーションで確定。
  - 全種・全技・全持ち物・全特性・全メガを各 catalog（specs / languages）へ append-only 転記。`fetch:data` → `materialize` で構造データ・ja 名補完。
  - per-reg `data/champions/m-a/*` / `data/champions/m-b/*`（block 記法）を全量化（各種族 `species-moves` = 使用可能技全量、メガ運用種に `mega[]`、`items` = 全持ち物）。
  - `check:regulation` 0 終了 → `generate:data` 再生成 → `pokemon-data-reviewer` レビュー。
- スコープ外:
  - M-C 以降のレギュレーション。新機能・新 rule。スキーマ / generate / skill の再設計（確定済み）。

## 前提（依存）

- **Phase 3 の検証ゲートを通過済み**（`survey-regulation` skill が健全と人間判定されている）。
- Phase 1-2 と同じ確定済み前提（04 / 05 / 03 / 02・ADR 0024 / 0026 / 0027 / 0030）。
- 確定済み rule: [[data-pipeline]] / [[cli-and-io]] / [[type-conventions]] / [[testing]]。

## タスク

- [ ] **全削除から再開**: Phase 1 と同じく per-reg / specs / languages を初期状態へ戻し、検証済み skill でゼロから全量を組み直す（限定セットの残骸を本投入に混ぜない）。
- [ ] M-A・M-B 各レギュの全解禁リスト（全種 / 使用可能技 / 解禁持ち物 / メガ）を `survey-regulation` skill で取得 + 自己修復し出典付き roster-source doc 化。
- [ ] 全種・技・持ち物・特性・メガを各 catalog（specs / languages）へ append-only 転記（ja/en 併記・技マスター値は 05 で是正済み・特性追記漏れ = 生成エラーに注意）。
- [ ] `pnpm fetch:data` → `pnpm materialize` で構造データ + ja 名を全量補完。
- [ ] per-reg `data/champions/m-a/*` / `data/champions/m-b/*` を全量化（解禁種族全列挙・各種族 `species-moves` 全量・メガ `mega[]`・`items` 全持ち物）。
- [ ] `node src/cli/index.ts check:regulation data/champions` が 0 終了することを確認（両レギュ）。
- [ ] `pnpm fetch:data && pnpm generate:data` で再生成。
- [ ] 生成データを `pokemon-data-reviewer` agent でレビュー（種族値・タイプ・日英名・解禁整合・メガ配列）。

## この Phase で育てるハーネス（rule・skill）

- なし（検証済み skill での全量投入）。M-A・M-B 確定に合わせ [[champions-regulation-data-placeholder]] メモリを解消（全量投入済みへ更新）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- M-A・M-B の**全解禁情報（全種・全技・全持ち物・全メガ）**が新スキーマ・新レイアウトで投入され、両レギュの生成 TS に反映される。
- 各種族に使用可能技（Serebii movepool 全量・ADR 0026）が紐づく。
- `check:regulation` が 0 終了（両レギュ・参照整合 / schema）。全 id が catalog 参照で解決できる。
- `pokemon-data-reviewer` のレビューで重大な不整合（種族値・タイプ・解禁整合・メガ・技マスター）が無い。

## 検証手順

1. roster-source doc と投入後の per-reg 種族 dex を突き合わせ、両レギュの種族数が一致することを確認。
2. `check:regulation` が 0 終了することを確認（両レギュ）。
3. `pnpm generate:data` 後、代表種族の `species-moves` が Serebii movepool を含むことをスポット確認。
4. `pokemon-data-reviewer` agent で生成データをレビューし指摘を解消。
5. `pnpm verify` 緑を確認。

## リスク・備考

- **データ投入 PR（>1000 行）を 1 PR 許容**: 全種・各種族数十技規模で意味ある粒度分割が困難なため 1 PR とする（[[planning]] の例外・OVERVIEW に根拠記載）。レビュー容易性のため、skill 著述カタログ / per-reg YAML の差分と生成物差分を分けて説明する。
- **検証済み skill 前提**: 本投入は Phase 3 で skill 健全と確認済みが前提。大量投入の取りこぼし・名称ゆれ・フォルム扱いは決定論パーサ + 自己修復 + `pokemon-data-reviewer` レビューで吸収する。Champions 実態との差分は catalog / per-reg YAML を直接編集して吸収する（`overrides.yaml` は廃止済み）。
- メガの多重表現（種族 `megaLinks` / 持ち物 megaStone / per-reg `mega[]`）の整合は `check:regulation` で担保。メガ先の技プールは base 継承（[ADR 0024](../../adr/0024-mega-moves-inherit-base.md)）。
- 本 phase 完了で 09 計画群が完了。`finish-phase` で `completed/09-champions-data-rollout` への集約を促す。
