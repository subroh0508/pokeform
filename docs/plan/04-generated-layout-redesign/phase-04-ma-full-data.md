# Phase 4 — M-A 全データ投入（全186種 + 全 movepool）

> 本 phase は 02-data-model-redesign の旧 phase-20（M-A 全データ投入）を移動・改稿したもの。投入手段を
> **03-survey-regulation-rework で構築した新パイプライン（決定論スクレイパー + Haiku 取得 fan-out + 自己修復ループ）**経由へ
> 更新した点が旧 doc から変わっている（旧 doc の「`survey-regulation` skill の WebFetch 全量 materialize」は刷新済み）。
> あわせて 03 のデータレイアウト整備（ゲームグルーピング `regulations/champions/`・per-game 技メタ・取得スキル 2 分割）の上で投入する。
>
> **本 phase は本計画群（04）の前段 [Phase 1-3](./README.md) で再編した新レイアウト**
> （specs / languages / per-reg 4 オブジェクト・`data/champions/m-a/*` / `data/languages/*`）**と、04 着手前に完了する
> [03-survey-regulation-rework の Phase 13（技仕様の Champions 対応）](../03-survey-regulation-rework/phase-13-move-spec-champions-fix.md) で
> 値を是正済みの move-specs の上で実施する**（投入時の技メタは Champions 実値で正しい）。
> 以下の本文中の旧レイアウト表記（`catalog/*` / `regulations/champions/m-a.yaml`）は
> [04 OVERVIEW の実装指針](./OVERVIEW.md#実装指針) の新ツリー対応に読み替える。

## 目的 / スコープ

03 で刷新した取得パイプライン（Phase 1-9：決定論 cheerio パーサ + Haiku 取得 SubAgent + 修正 SubAgent 自己修復 +
全面改訂済み `survey-regulation` skill + per-reg 持ち物 legality + メガ決定論取り込み）を使って、レギュレーション M-A で解禁されている**全種族・全技・全持ち物・
全メガ**を全量投入し M-A を完成させる。技の出自は **Serebii 第一優先・PokeAPI learnset 非依存**（ADR 0026）。
日本語名は PokeAPI names から補完（03 Phase 3）。

- スコープ内:
  - 新パイプラインで M-A 解禁の**全186種 + 使用可能技 + 解禁持ち物 + メガ**を取得（層2-3 Workflow で fan-out +
    自己修復）し、`survey-regulation` skill 手順に沿って出典付き doc 化（roster-source）。
  - `serebii-to-catalog` で `catalog/species.yaml`（全186種・`ja`/`en` 併記・`megaLinks` 配列）/ `moves.yaml` /
    `items.yaml` / `abilities.yaml` へ append-only 転記。`fetch:data` → `materialize` で構造データ（種族値 / タイプ /
    特性 / dex / category）と ja 名を catalog へ載せる。
  - `regulations/champions/m-a.yaml`（block 記法）の各種族キー下に `moves` = M-A 使用可能技を全量、解禁種族キーを
    全列挙、メガ種族に `mega[]` を付与、`items` 予約キーを全量化。
  - `check:regulation` 緑（参照整合 / schema・learnset 照合は ADR 0026 で撤去済み）→ `generate:data` 再生成 →
    `pokemon-data-reviewer` レビュー。
- スコープ外: M-B 以降の正確データ（未公開・暫定維持）。新機能・新 rule。01-mvp の機能拡張。スキーマ / generate の
  再設計（02 で確定済み）。スクレイパー / skill / legality / メガ取り込みの実装（03 Phase 1-9 で完了済み）。

## 前提（依存）

- **本計画群（04）の Phase 1-3 完了**。generated / YAML が新レイアウト（specs / languages / per-reg 4 オブジェクト・メガ独立エンティティ）へ再編済みで、投入はこの最終レイアウト上で行う。
- **03-survey-regulation-rework 完了（Phase 1-13）**。特に **Phase 13（技仕様の Champions 対応）**で move-specs（技メタ）の PP（8/12/16/20）・power・type が Champions 実値へ是正済みで、全量投入時に誤った技メタが広がらない。新パイプラインと legality / メガ / レイアウト整備 / 生成整備が揃っていること:
  - Phase 1-2: 決定論パーサ純関数 + fetch-serebii キャッシュ + items スクレイパー。
  - Phase 3: `serebii-to-catalog` 転記 + PokeAPI names による ja 補完 + ADR + rule 更新。
  - Phase 4-5: Haiku 取得 SubAgent + Workflow fan-out + 修正 SubAgent 自己修復ループ。
  - Phase 6: `survey-regulation` skill 全面改訂 + cross-agent パリティ + 数十種での end-to-end 実証。
  - Phase 7: per-reg 持ち物 legality（メガストーン保持ルール = base は全件・メガ形態は対応ストーンのみ・`megaSpecies` リンク）。
  - Phase 8: per-reg species から不要な種族名 ja/en を削除。
  - Phase 9: メガ関連の決定論自動取り込み（`megaLinks` / per-reg `mega[]` / `megaSpecies` を自動著述・全量投入でメガが落ちない）。
  - Phase 10: regulations をゲームグルーピング（`regulations/champions/m-(a|b).yaml`）。
  - Phase 11: 技メタを per-game へ移転（`catalog/moves.yaml` = 名前 / `regulations/champions/moves.yaml` = 技メタ）。
  - Phase 12: 取得スキルを 2 分割（catalog 取得 / regulations 取得）+ catalog 更新チェックポイント。投入はこの 2 skill 体制で行う。
- **02-data-model-redesign 完了**（マージ済み）。確定済みの土台:
  - 新スキーマ（種族キー = 解禁・per-species `moves`/`mega[]`・block 記法）と `check:regulation` ゲート（02 Phase 5-6）。
  - 技の出自 = Serebii 第一優先・learnset 照合撤去・技メタ catalog SoT（02 Phase 12 / ADR 0026）。
  - 構造データ catalog 化・`materialize`（raw→catalog 転記・append/既存尊重）・generate raw 非依存（02 Phase 13 / ADR 0027）。
  - catalog 日英名 authoring（`id → { ja, en }`・02 Phase 10）。YAML block スタイル強制ゲート（02 Phase 15）。
  - メガ先の技プールは base 継承（[ADR 0024](../../adr/0024-mega-moves-inherit-base.md)）。
- 確定済み rule: [[data-pipeline]] / [[cli-and-io]] / [[type-conventions]] / [[testing]]。

## タスク

- [ ] 03 の新パイプライン（層2-3 Workflow）で M-A 全解禁リスト（全186種 / 使用可能技 / 解禁持ち物 / メガ）を
      取得 + 自己修復し、`survey-regulation` skill 手順に沿って複数ソース突き合わせ・出典付き roster-source doc 化
      （Serebii 第一優先・PokeAPI learnset 非依存）。収束しない種は人手エスカレーションで確定。
- [ ] `serebii-to-catalog` で M-A 解禁の**全186種**を `catalog/species.yaml` へ追記（`megaLinks` 配列・各 id に
      `ja`/`en` 併記）。各種族が参照する技 / 持ち物 / 特性 / メガを各 catalog へ append-only 追記（ja/en 併記・
      技メタは Serebii 由来・特性の追記漏れ = 生成エラーに注意）。
- [ ] `pnpm fetch:data` で追加 slug の**構造データ（種族値 / タイプ / 特性 / category）と ja 名**を `data/raw` 取得 →
      `pnpm materialize` で catalog YAML へ転記（ADR 0027 の経路・技威力等の技メタは ADR 0026 により raw から取らず
      Serebii authoring）。
- [ ] `regulations/champions/m-a.yaml`（block 記法）を全量化:
  - [ ] 解禁種族キーを全186種列挙。各種族キー下に `moves` = M-A 使用可能技（Serebii movepool 全量）を全量（block
        シーケンス）。
  - [ ] メガ運用種族に `mega:`（配列）を付与。`items` 予約キーを全量化。
- [ ] `node src/cli/index.ts check:regulation data/champions/regulations/champions/m-a.yaml` が 0 終了することを確認
      （参照切れ無し・schema 整合・learnset 照合は ADR 0026 で撤去済み）。
- [ ] `pnpm fetch:data && pnpm generate:data` で再生成。
- [ ] 生成データの妥当性を `pokemon-data-reviewer` agent でレビュー（種族値・タイプ・日英名・解禁整合・メガ配列）。

## この Phase で育てるハーネス（rule・skill）

- なし（データ投入が中心）。M-A 確定に合わせ [[champions-regulation-data-placeholder]] メモリを更新 / 解消。
  取りこぼし・使い勝手の問題があれば `survey-regulation` を `skill-creator` で改修（本計画群 Phase 1-6 で刷新済み）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- M-A 解禁の**全186種・全技・全持ち物・全メガ**が新スキーマで投入され、`data/generated/regulations/champions-m-a/
  species.ts` に反映される。
- **各種族に M-A 使用可能技（Serebii movepool 全量・ADR 0026 の情報源）が紐づく**（各種族 10+ 技）。
- `check:regulation` が 0 終了（参照切れ無し・schema 整合）。全 id が catalog 参照で解決できる。
- `pokemon-data-reviewer` のレビューで重大な不整合（種族値・タイプ・解禁整合・メガ）が無い。

## 検証手順

1. roster-source doc と投入後の per-reg 種族 dex を突き合わせ、種族数（186）が一致することを確認。
2. `check:regulation` が 0 終了することを確認（authoring ゲート・参照整合 / schema）。
3. `pnpm generate:data` 後、代表種族の `moves` が 10+ で Serebii movepool を含むことをスポット確認。
4. `pokemon-data-reviewer` agent で生成データをレビューし指摘を解消。
5. `pnpm verify` 緑を確認。

## リスク・備考

- **データ投入 PR（>1000 行）を 1 PR 許容**: M-A は約186種・各種族数十技規模で意味ある粒度分割が困難なため 1 PR と
  する（[[planning]] の例外・OVERVIEW に根拠記載）。レビュー容易性のため、skill 著述カタログ / regulation YAML の
  差分と生成物差分を分けて説明する。
- **新パイプライン経由で投入**: 旧 doc（02 phase-20）は WebFetch 目視前提だったが、本 phase は 03 で構築した決定論
  スクレイパー + 自己修復で取得する。大量投入の取りこぼし・名称ゆれ・フォルム扱いの誤りは、決定論パーサ + 自己修復
  ループ + `pokemon-data-reviewer` レビューで吸収する。Champions 実態との差分は catalog / regulations YAML を直接編集
  して吸収する（`overrides.yaml` は 02 Phase 13 で廃止済み・補正レイヤー不要）。
- 技の出自は **Serebii 第一優先・PokeAPI learnset 非依存**（ADR 0026）。Serebii の movepool を正として全量化し、
  learnset 照合は行わない（ゲートは撤去済み）。技の正確性は複数ソース突き合わせと `pokemon-data-reviewer` で担保。
- メガの多重表現（種族 `megaLinks` 配列 / 持ち物 megaStone / per-reg `mega[]`）の整合に注意。`check:regulation` で
  担保。メガ先の技プールは base 継承（[ADR 0024](../../adr/0024-mega-moves-inherit-base.md)）で自動整合
  （メガ先に per-reg `moves` を別途書かない）。
- M-A 完成後、M-B 詳細が公開されたら別 phase / 別計画で M-B 投入を検討（本計画スコープ外）。
