# Phase 3 — ハーネス追従（rules / skills / architecture / docs・cross-agent パリティ）

## 目的 / スコープ

新レイアウト（specs / languages / per-reg 4 オブジェクト・メガ独立エンティティ）に、エージェント指示（rule・skill）と設計正本（architecture.md）・README 群を追従させ、旧パス・旧構造への参照を一掃する。cross-agent パリティ（canonical + `.agents/skills` symlink）を保つ。

- スコープ内:
  - **rules 改訂**: `data-pipeline.md`（取得元/SoT/転記表・ディレクトリ節を新ツリーへ。名前 SoT＝`data/languages/*`・メガ独立エンティティ・per-reg 4 オブジェクト）・`type-conventions.md`（specs/languages パターン・`NameEntry`・mega-specs・名前 SoT 所在）・`cli-and-io.md`（逆引きを languages forward 導出へ）。
  - **skills 改訂**（`skill-creator`）: `update-catalog`（転記先 specs/languages）・`survey-regulation`（書き出し先 `m-*`/specs・serebii-sourcing 参照）・`author-individual` / `stat-tuning` 等のパス参照。canonical + symlink パリティ。
  - **architecture / docs**: `docs/plan/01-mvp/architecture.md`（ディレクトリ構成・型表現節）。`data/README.md`（あれば新ツリーへ）。
  - 旧パス（`data/generated/{moves,abilities,items,species-base,types,names}.ts` / `regulations/<id>/`）・旧構造記述の参照を `git grep` で一掃。
- スコープ外: コア実装（Phase 2）。ADR 起票（Phase 1）。技仕様値是正（後続計画群 05）・全種族投入（後続計画群 XX）。

## 前提（依存）

- **Phase 1（ADR）・Phase 2（コア実装）完了**。新レイアウトが生成・型・consumer で確定していること。

## タスク

- [ ] `data-pipeline.md` / `type-conventions.md` / `cli-and-io.md` を新ツリー・新 SoT（名前＝languages・メガ独立）へ改訂。
- [ ] `update-catalog` / `survey-regulation` / `author-individual` / `stat-tuning` の SKILL を新パス・新転記先へ改訂（`skill-creator`・canonical + symlink パリティ）。
- [ ] `docs/plan/01-mvp/architecture.md` のディレクトリ構成・種族型表現節を新レイアウトへ更新。
- [ ] `git grep` で旧パス・旧構造記述の残存参照を一掃（rule / skill / docs / README）。
- [ ] cross-agent パリティ点検（canonical = symlink/copy 一致・機械ゲートを skill 内で再実装していない）。

## この Phase で育てるハーネス（rule・skill）

- rule 3 本改訂（data-pipeline / type-conventions / cli-and-io）・skill 群改訂（update-catalog / survey-regulation / author-individual / stat-tuning）。新規 rule/skill は作らない（既存追従）。

## 受け入れ基準

- 新レイアウトに矛盾する旧パス・旧構造記述が rule / skill / docs に残らない（`git grep` で確認）。
- cross-agent パリティが保たれる（`.agents/skills` symlink 経由で同一実体・[[cross-agent]]）。
- `pnpm verify` 緑（doc/skill 改訂のため型・テストに影響なし。rules-index は `prepare` 再生成）。

## 検証手順

1. `git grep -nE "generated/(moves|abilities|items|species-base|types|names)\.ts|regulations/<id>"` 等で旧パス参照が残らないことを確認。
2. `data-pipeline.md` の取得元/SoT/転記表が新ツリー（specs / languages）と一致。
3. `.agents/skills/<name>` が canonical を指す symlink であることを確認（パリティ）。
4. `pnpm verify` 緑。

## リスク・備考

- skill のパス参照追従漏れは利用者（エージェント）の誤動作を生む。`git grep` で機械的に拾う（learning #104/#117/#122 反復の dangling 防止）。
- 本 phase 完了で 04 計画群が完了。次は後続 [05-move-master-scraper-refactor](../05-move-master-scraper-refactor/README.md)（技マスター取得 + 役割分割 + skill 再編）→ [XX-ma-full-data](../XX-ma-full-data/README.md)（全種族投入）。
