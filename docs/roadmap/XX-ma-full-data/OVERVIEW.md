# XX-ma-full-data — M-A 全種族投入（新レイアウト + 整理済みパイプライン上での全量投入）OVERVIEW

## ゴール

レギュレーション M-A で解禁されている**全186種・全技・全持ち物・全メガ**を全量投入し、M-A を完成させる。投入は
[04-generated-layout-redesign](../completed/04-generated-layout-redesign/README.md) で再編した新レイアウト（specs / languages /
per-reg 4 オブジェクト）と、[05-move-master-scraper-refactor](../completed/05-move-master-scraper-refactor/README.md) で
**技マスター専用取得経路により Champions 準拠へ是正済みの `move-specs` + 役割分割済みパイプライン**の上で行う。利用者から
見た価値は、M-A の全解禁ポケモンを正しい技マスター値（威力・タイプ・PP）付きで個体・パーティ構築に使えるようになること。

## 背景 / 動機

本計画群は、02-data-model-redesign の旧 phase-20「M-A 全データ投入」を起源とし、複数回の cross-plan move を経て独立計画群
として確定したもの。全量投入は「**全量投入の手前で仕組みと値を確定させる**」de-risk パターン（learning #59/#76）に従い、
取得パイプライン刷新（03）・レイアウト再編（04）・技マスター取得 + 役割分割（05）をすべて完了してから最後に実行する。

当初は 04 の最終 phase（旧 04 Phase 4）として置かれていたが、04 が「レイアウト再編」に責務を純化し、04 が後続計画
（05）を挟んで分断される構造を避けるため、**全量投入を独立計画群 XX として切り出した**。これにより依存が
**04（レイアウト再編）→ 05（技マスター取得 + 役割分割）→ XX（全量投入）** の一方通行に整理される。

技メタの正しさは 05 Phase 2（技マスター専用取得経路）で担保される（旧 03 Phase 13 の手動是正を代替・根本解決）。投入時
には `move-specs` が Champions 準拠で揃っているため、誤った技メタが全186種・全 movepool へ広がらない。

## 設計方針

- **既存パイプラインへ投入を委譲**。03 の決定論スクレイパー + 自己修復 + 05 のオーケストレーター化された
  `survey-regulation` skill 手順に沿って取得・転記・検証する。本計画群は新規実装をせず、整備済みの仕組みで全量を流す。
- **技の出自は Serebii 第一優先・PokeAPI learnset 非依存**（ADR 0026）。Serebii の movepool を正として全量化し、
  learnset 照合は行わない（ゲートは撤去済み）。技マスター値は 05 で是正済み。
- **append-only / skill-authored / 新レイアウト**を守る（ADR 0027 / 0030・04 の新ツリー）。`check:regulation` で
  参照整合・schema を担保し、`pokemon-data-reviewer` で値の妥当性をレビューする。
- データの正しさは機械ゲートで完全には担保できないため、**複数ソース突き合わせ + `pokemon-data-reviewer` レビュー**で
  担保する（[`serebii-sourcing.md`](../../../.claude/skills/survey-regulation/references/serebii-sourcing.md)）。

## 実装指針

`survey-regulation`（オーケストレーター）→ 層2-3 Workflow で全186種を fan-out 取得 + 自己修復 → `serebii-to-catalog` で
catalog / per-reg へ append-only 転記 → `update-catalog`（`fetch:data` → `materialize`）で構造データ・ja 名を補完 →
`check:regulation` 0 終了 → `generate:data` 再生成 → `pokemon-data-reviewer` レビュー → `verify` 緑。詳細手順は唯一の
phase doc [`phase-01-ma-full-data.md`](./phase-01-ma-full-data.md) を参照。

## スコープ外

- **取得パイプライン・スクレイパー・skill の実装**（03 + 05 で完了済み）。本計画群は投入の実行に専念する。
- **generated/YAML レイアウト再編**（04 で完了済み）。新ツリー上で投入する。
- **技マスターの値是正**（05 Phase 2 で完了済み）。
- M-B 以降の正確データ（未公開・暫定維持）。新機能・01-mvp の機能拡張。

## 受け入れ基準

1. 各フェーズ末で `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
2. M-A 解禁の**全186種・全技・全持ち物・全メガ**が新スキーマ・新レイアウトで投入され、生成 TS に反映される。
3. 各種族に M-A 使用可能技（Serebii movepool 全量・ADR 0026）が紐づく（各種族 10+ 技）。
4. `check:regulation` が 0 終了（参照整合 / schema）。全 id が catalog 参照で解決できる。
5. `pokemon-data-reviewer` のレビューで重大な不整合（種族値・タイプ・解禁整合・メガ・技マスター）が無い。

## phase 分割（6 基準の評価サマリ）

データセット投入は意味ある粒度での分割が困難（種族・技を機械的に区切るとレビュー単位が無意味になる）ため、**1 phase =
1 PR**（>1000 行を [[planning]] の例外として許容）とする。6 基準:

- **意思決定の数 / 不可逆性**: 投入は既定の仕組み（03/04/05 で確定）に沿うデータ追加で、新しい設計判断は無い。
- **スコープの広さ / 技術的難易度**: catalog / regulations YAML への全量追記 + 生成・検証。難所は 03/05 で解決済み。
- **想定 diff**: 全186種・全 movepool で >1000 行。データセット追加のため意味ある分割が困難 → **1 PR 許容**
  （[[planning]] の例外・理由を本 OVERVIEW に明記）。ソース/生成物差分を分けて説明する。
- **並行実装のしやすさ**: 単一 phase。先行計画（04 → 05）完了が前提の直列。

| phase | 狙い | 主な diff |
|---|---|---|
| Phase 1 | M-A 全データ投入（全186種 + 全 movepool・新パイプライン経由・新レイアウト上） | data 投入 PR（>1000 行・例外 1 PR） |

直列チェーン: 先行する [04-generated-layout-redesign](../completed/04-generated-layout-redesign/README.md)（Phase 1-3 再編）→
[05-move-master-scraper-refactor](../completed/05-move-master-scraper-refactor/README.md)（技マスター取得 + 役割分割 + skill 再編）→
本計画群（XX Phase 1 全量投入）の**一方通行（04 → 05 → XX）**。
