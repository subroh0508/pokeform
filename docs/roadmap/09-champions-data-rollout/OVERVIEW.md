# 09-champions-data-rollout — M-A/M-B 解禁データ投入（限定セットでのスキル実地検証 → 本投入）OVERVIEW

## ゴール

レギュレーション M-A・M-B の解禁データ（種族 / 技 / 持ち物 / メガ）を、整備済みの取得パイプライン
（[03-survey-regulation-rework](../completed/03-survey-regulation-rework/README.md) / [05-move-master-scraper-refactor](../completed/05-move-master-scraper-refactor/README.md)）と
新レイアウト（[04-generated-layout-redesign](../completed/04-generated-layout-redesign/README.md)）の上で投入し、両レギュを完成させる。

ただし全量投入の前に **`survey-regulation` スキルが解禁データ投入を正しく駆動できるか**を、限定セット（M-A の代表 10 体・M-B の追加解禁種）で**実地検証**する。利用者から見た価値は、M-A・M-B の解禁ポケモンを正しい技マスター値付きで個体・パーティ構築に使えるようになること。あわせてスキル自体が次レギュ（M-C 以降）でも再現性高く使える状態になること。

## 背景 / 動機

本計画群は 02-data-model-redesign の旧 phase-20「M-A 全データ投入」を起源とし、複数回の cross-plan move を経て独立計画群として確定した（旧 `XX-ma-full-data`）。採番は本計画で **09 に確定**する（プレースホルダ `XX-` を卒業）。

当初は「M-A 全186種を 1 PR で一括投入」する単一フェーズ計画だったが、**全量を投入してから skill の不備が判明すると手戻りが全種族へ波及する**。そこで「**全量投入の手前で仕組みと値を確定させる**」de-risk パターン（learning #59/#76）を一段強め、**限定セットで skill を実地検証する人間ゲートを挟んでから本投入する**方針へ再構成した。

- まず**現行のプレースホルダ・レコードを全削除**し、skill 経由でゼロから組み直せることを確認する。
- M-A を代表 10 体（リザードン・スターミー・ゲンガーを含む）+ 全持ち物に限定して投入し、skill の出力（catalog / per-reg / 生成 TS）をレビュー可能な小さな単位で検証する。
- 続いて M-B を「M-A の 10 体 + M-B 追加解禁全種」+ 全持ち物に限定して投入し、レギュ間差分（追加解禁・period）の扱いも検証する。
- **人間が skill 動作を確認**し、問題があれば skill を改修して「全削除 → M-A 限定 → M-B 限定」サイクルを再実行する。skill が健全と確認できて初めて M-A・M-B 全解禁情報を本投入する。

技メタの正しさは 05 Phase 2（技マスター専用取得経路）で担保済み。投入時には `move-specs` が Champions 準拠で揃っているため、誤った技メタが全 movepool へ広がらない。

## 設計方針

- **既存パイプラインへ投入を委譲**。03 の決定論スクレイパー + 自己修復 + 05 のオーケストレーター化された `survey-regulation` skill 手順に沿って取得・転記・検証する。本計画群は原則新規実装をせず、整備済みの仕組みで投入する。**例外は skill の不備が検証で判明した場合の改修**（`skill-creator` 経由・[[skill-authoring]]）。
- **限定セットは skill を end-to-end で動かす検証手段**。10 体規模はレビュー可能で、全量投入前に skill の取りこぼし・転記ミス・使い勝手の問題を炙り出すための最小単位。種族を絞っても skill の駆動経路（取得 → 転記 → 補完 → 検証 → 生成 → レビュー）は本投入と同一にする。
- **技の出自は Serebii 第一優先・PokeAPI learnset 非依存**（ADR 0026）。Serebii の movepool を正として投入し、learnset 照合は行わない。
- **append-only / skill-authored / 新レイアウト**を守る（ADR 0027 / 0030・04 の新ツリー）。`check:regulation` で参照整合・schema を担保し、`pokemon-data-reviewer` agent で値の妥当性をレビューする。
- **レコード全削除はサイクルの起点**。検証で skill を直すたびに、プレースホルダ・前サイクルの残骸を残さずゼロから skill で組み直す（再現性の担保）。

## 実装指針

各投入フェーズは共通して: `survey-regulation`（オーケストレーター）→ 層2-3 Workflow で対象種を fan-out 取得 + 自己修復 → `serebii-to-catalog` で catalog / per-reg へ append-only 転記 → `update-catalog`（`fetch:data` → `materialize`）で構造データ・ja 名を補完 → `check:regulation` 0 終了 → `generate:data` 再生成 → `pokemon-data-reviewer` レビュー → `verify` 緑。各 phase doc に具体手順を記す。

Phase 3 の人間検証ゲートは PR を伴わない検証マイルストーン。OK なら Phase 4（本投入）へ、NG なら skill 改修 PR を挟んで Phase 1-2 を再実行する。

## スコープ外

- **取得パイプライン・スクレイパー・skill の新規実装**（03 + 05 で完了済み）。本計画群は投入の実行と、検証で判明した範囲の skill 改修に限る。
- **generated/YAML レイアウト再編**（04 で完了済み）。新ツリー上で投入する。
- **技マスターの値是正**（05 Phase 2 で完了済み）。
- M-C 以降のレギュレーション。新機能・01-mvp の機能拡張。

## 受け入れ基準

1. 各フェーズ末で `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
2. Phase 1 完了時: 旧プレースホルダ・レコードが全削除され、M-A が代表 10 体（リザードン・スターミー・ゲンガー含む）+ 全持ち物の限定セットで skill 経由投入され、生成 TS に反映される。
3. Phase 2 完了時: M-B が「M-A の 10 体 + M-B 追加解禁全種」+ 全持ち物の限定セットで skill 経由投入される。
4. Phase 3（人間ゲート）: `survey-regulation` skill が解禁データ投入を正しく駆動できることを人間が確認。問題があれば skill を改修し、Phase 1-2 サイクルを再実行して再確認する。
5. Phase 4 完了時: M-A・M-B の**全解禁情報（全種・全技・全持ち物・全メガ）**が skill 経由で投入される。
6. 全フェーズで `check:regulation` が 0 終了（参照整合 / schema）、`pokemon-data-reviewer` のレビューで重大な不整合（種族値・タイプ・解禁整合・メガ・技マスター）が無い。

## phase 分割（6 基準の評価サマリ）

全量投入を限定セット検証で de-risk するため、**段階を 4 phase に分ける**。データ投入そのものは意味ある粒度での種族分割が困難なため各投入 phase は 1 PR（本投入は >1000 行を [[planning]] の例外として許容）。6 基準:

- **意思決定の数 / 不可逆性**: 投入は既定の仕組み（03/04/05 で確定）に沿うデータ追加で新しい設計判断は無い。限定セットの roster 選定（M-A の他 7 体）は Phase 1 実行時に代表種で確定する。
- **スコープの広さ / 技術的難易度**: catalog / per-reg YAML への append-only 転記 + 生成・検証。難所は 03/05 で解決済み。検証ゲートで skill 改修が必要になった場合のみハーネス改修が混じる。
- **想定 diff**: Phase 1-2（限定セット）は中規模、Phase 4（本投入）は全種・全 movepool で >1000 行（データセット追加のため 1 PR 許容）。
- **並行実装のしやすさ**: 直列。Phase 1 → 2 → 検証ゲート(3) → 4 の順で、検証 OK が本投入の前提。

| phase | 狙い | 主な diff |
|---|---|---|
| Phase 1 | レコード全削除 + M-A 限定投入（10 体 + 全持ち物） | data 投入 PR（中規模） |
| Phase 2 | M-B 限定投入（M-A の 10 体 + M-B 追加解禁全種 + 全持ち物） | data 投入 PR（中規模） |
| Phase 3 | 人間による `survey-regulation` skill 動作検証ゲート（PR なし・NG なら P1-2 サイクル再実行） | — |
| Phase 4 | M-A・M-B 全解禁情報の本投入（全種・全技・全持ち物・全メガ） | data 投入 PR（>1000 行・例外 1 PR） |

直列チェーン: 先行する [04-generated-layout-redesign](../completed/04-generated-layout-redesign/README.md)（Phase 1-3 再編）→ [05-move-master-scraper-refactor](../completed/05-move-master-scraper-refactor/README.md)（技マスター取得 + 役割分割 + skill 再編）→ 本計画群（09 Phase 1 → 2 → 3 → 4）の**一方通行**。04 / 05 へ戻る依存は無い。
