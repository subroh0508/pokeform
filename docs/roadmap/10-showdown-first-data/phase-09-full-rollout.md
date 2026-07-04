# Phase 9 — M-A・M-B 全データセット本投入（author-regulation-data skill 実行）

> **plan 09 Phase 4（全データセット本投入）の cross-plan move 先**。旧フェーズは `survey-regulation` skill + `fetch:data`/`materialize` + Serebii 第一優先で全量投入する設計だったが、本計画群（10）の取得元転換に伴い **`author-regulation-data` skill（Phase 8）で全量投入し `verify-showdown-pr` で Serebii 照合する**新パイプライン版へ改訂した。移動・参照追従は [[planning]] の cross-plan move チェックリストに従う。

## 目的 / スコープ

Phase 1-8 で揃った新パイプライン（showdown 抽出 + 転記 + 全件名辞書 + GitHub Actions + 照合スキル + reg 取得 skill）を使い、M-A・M-B の**全解禁情報（全種族・全使用可能技・全解禁持ち物・全メガ）**を **`author-regulation-data` skill を各レギュに対して実行**して投入し、両レギュを完成させる（skill の dogfood でもある）。

- スコープ内: `author-regulation-data` skill を M-A → M-B の順で実行して本投入、`verify-showdown-pr` で Serebii 照合、`pokemon-data-reviewer` レビュー。
- スコープ外: M-C 以降のレギュレーション。新機能・新 rule。スキーマ / generate / skill の再設計（確定済み）。skill 手順そのものの新設（Phase 6-8 で確定）。

## 前提（依存）

- **Phase 1-5 完了**: showdown 抽出 + 転記（1）/ PokeAPI ja 専任（2）/ `showdown-sync.yml`（3）/ Serebii 速報 + 新スクレイパー（4）/ `verify-showdown-pr` skill + rules 改訂（5）がすべて揃っている。
- **Phase 6-7 完了**: 全件名辞書の基盤（Phase 6）+ 全件投入（Phase 7）で `languages/*.yaml` が全件揃う（[phase-06](./phase-06-author-static-data.md) / [phase-07](./phase-07-languages-populate.md)）。名前が事前に全件揃うため投入時の ja gap が原則出ない。
- **Phase 8 完了**: `author-regulation-data` skill（reg ごとの取得オーケストレーション = reset → `showdown-sync.yml` dispatch → 照合 → per-reg 著述・[phase-08](./phase-08-author-regulation-data-skill.md)）が新設されている。
- `rules.yaml` / `type-specs.yaml` がコミット済みで存在（静的コミット・自動化対象外）。
- 確定済み rule: [[data-pipeline]] / [[cli-and-io]] / [[type-conventions]] / [[testing]]。ADR 0039 / 0040。

## タスク

- [ ] **M-A 全量投入**: `author-regulation-data m-a` を実行（skill が前提ゲート → per-reg reset → `showdown-sync.yml` dispatch → `verify-showdown-pr` 照合 → per-reg 静的著述 を駆動・名前欠落は新規 id のみ差分追加）→ authoritative PR。
- [ ] **M-B 全量投入**: 同様に `author-regulation-data m-b` を実行 → authoritative PR。
- [ ] 各 authoritative PR を `verify-showdown-pr` で Serebii 照合し、差異（roster 数 / 技件数 / 持ち物・メガ / 技メタ / ja・en）を解消。
- [ ] `check:regulation data/champions` 0 終了（両レギュ）→ `generate:data` 再生成 → `pokemon-data-reviewer` レビュー。
- [ ] [[champions-regulation-data-placeholder]] メモリを「全量投入済み」へ更新。

## この Phase で育てるハーネス（rule・skill）

- なし（Phase 1-8 で確定したパイプライン・skill を**実行**する phase）。M-A・M-B 確定に合わせ [[champions-regulation-data-placeholder]] メモリを解消（全量投入済みへ更新）。`author-regulation-data` skill を実運用で dogfood し、手順の粗を Phase 8 skill へフィードバックする（改修が要れば別 PR）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- M-A・M-B の**全解禁情報（全種・全技・全持ち物・全メガ）**が showdown 経路で投入され、両レギュの生成 TS に反映される。
- 各種族に使用可能技（showdown learnset 全量）が紐づく。
- `check:regulation` が 0 終了（両レギュ・参照整合 / schema）。全 id が specs 参照で解決できる。
- `verify-showdown-pr` の Serebii 照合で blocking 差異が無く、`pokemon-data-reviewer` のレビューで重大な不整合（種族値・タイプ・解禁整合・メガ・技メタ）が無い。

## 検証手順

1. authoritative PR の counts と投入後の per-reg 種族 dex を突き合わせ、両レギュの種族数が一致することを確認。
2. `check:regulation` が 0 終了することを確認（両レギュ）。
3. `generate:data` 後、代表種族の `species-moves` が showdown learnset を含むことをスポット確認。
4. `verify-showdown-pr` の Serebii 照合 + `pokemon-data-reviewer` レビューで指摘を解消。
5. `pnpm verify` 緑を確認。

## リスク・備考

- **データ投入 PR（>1000 行）を 1 PR 許容**: 全種・全 movepool 規模で意味ある粒度分割が困難なため各レギュ 1 PR とする（[[planning]] 6 基準⑤ の例外・OVERVIEW に根拠）。skill 手順（harness 資産）は Phase 6/7/8 で分離済みゆえ、本 phase の PR はデータのみ（harness 資産を混ぜない）。レビュー容易性のため specs / per-reg YAML の差分と生成物差分を分けて説明する。
- 大量投入の取りこぼし・名称ゆれ・フォルム扱いは showdown 抽出の決定論性 + `verify-showdown-pr` の Serebii 照合 + `pokemon-data-reviewer` レビューで吸収する。
- メガの多重表現（`species-specs.megaEvolvesTo` / 持ち物 `megaSpecies` / per-reg `mega.yaml`）の整合は `check:regulation` で担保。
- 本 phase 完了で 10 計画群が完了。`finish-phase` で `completed/10-showdown-first-data` への集約を促す。
