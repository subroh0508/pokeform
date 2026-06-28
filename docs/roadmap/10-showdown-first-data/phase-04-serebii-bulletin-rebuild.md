# Phase 4 — Serebii 完全廃止 + 新スクレイパー + serebii-bulletin + ADR 0040

## 目的 / スコープ

既存の Serebii スクレイパー（第一優先前提）を**完全廃止**し、指定ページ群向けの**新スクレイパー**を実装する。GitHub Actions（`workflow_dispatch` 手動）で Serebii をスクレイピングして**速報 PR** を立てる経路を作り、Serebii を速報経路へ降格する決定を ADR 0040 に記録する。

- スコープ内: 旧 Serebii コード削除、新 `src/codegen/serebii/parse-*` + `scrape-serebii`(新) / `sync-serebii`、`serebii-bulletin.yml`、ADR 0040（0033/0037 supersede）。
- スコープ外: 照合 skill（Phase 5）、全量本投入（Phase 6）。

## 前提（依存）

- **Phase 3 完了**（showdown-sync が正の経路として稼働）。Serebii を降格できる前提が揃う。
- 確定済み rule: [[data-pipeline]] / [[adr]] / [[skill-authoring]] / [[redaction]]。

## タスク

- [ ] 旧 Serebii コードを削除: `scripts/fetch-serebii.ts` / `scripts/scrape-serebii.ts`(旧) / `scripts/serebii-to-catalog.ts` / `src/codegen/serebii/*.ts`（parse / normalize / catalog-fields / per-game-fields / regulation-fields / schema + test + `__fixtures__`）。`package.json` から `fetch:serebii` / `scrape:serebii` / `serebii:catalog` を削除。
- [ ] 新スクレイパー `src/codegen/serebii/parse-{species,moves,items,abilities,mega}.ts` + `schema.ts`（純関数 + test + 実 HTML fixture・カバレッジ 100%）を実装。対象ページ:
  - `pokemonchampions/pokemon.shtml`（roster）+ `pokedex-champions/{種族id}`（構造 / 技 / メガ membership / ja）→ `parse-species`
  - `attackdex-champions/{技id}.shtml` → `parse-moves`
  - `pokemonchampions/items.shtml` + `itemdex/{持ち物id}.shtml`（category / ja）→ `parse-items`
  - `abilitydex/{特性id}.shtml`（ja）→ `parse-abilities`
  - 種族ページのメガセクション → `parse-mega`
- [ ] `scripts/scrape-serebii.ts`(新・配線) / `scripts/sync-serebii.ts`（中間 JSON → SoT YAML・ja/en 含む速報）を実装。`package.json` に `serebii:species/moves/items/abilities/mega` を追加（showdown 側と 1:1 対応）。
- [ ] `.github/workflows/serebii-bulletin.yml` を作成（入力 `regulation`）: `pnpm serebii:*` で速報スクレイプ → `check:regulation` → `generate:data` → `verify` → `create-pull-request`（ブランチ `data/serebii-bulletin-<regId>-<run>`・ラベル `data:provisional`・本文に「速報。showdown-sync が追いついたら上書き」+ 出典 URL + 検証日）。
- [ ] `adr-new` で **ADR 0040**（Serebii を速報経路へ降格・第一優先撤回・既存スクレイパー全廃）を起こす。ADR **0033**（Serebii メガ自動著述）/ **0037**（Serebii 技専用ページ取得）を `Superseded by ADR-0040` にし archive へ `git mv`、`git grep -nE "\b0*(33|37)\b"` で inbound 参照を追従（[[adr]]）。

## この Phase で育てるハーネス（rule・skill）

- ADR 0040 を起票。被 supersede ADR（0033/0037）の archive 退避と参照追従。新 Serebii スクレイパーは純関数として `src/codegen/serebii/` に実装（rule 改訂は Phase 5）。

## 受け入れ基準

- `pnpm verify` 緑。新 `src/codegen/serebii/*` のカバレッジ 100%。
- 旧 Serebii コードが完全削除され、`git grep "fetch-serebii\|serebii-to-catalog"` が新コード以外に残らない。
- `serebii-bulletin.yml` を `workflow_dispatch` で実行すると速報 PR が立ち CI 緑。ja（カタカナ/ひらがな）が languages へ反映される。
- ADR 0040 が存在し、0033/0037 が archive へ退避、dangling 参照ゼロ。

## 検証手順

1. `serebii-bulletin.yml` を `workflow_dispatch`（`regulation: champions-m-a`）で実行し、速報 PR と CI 緑を確認。
2. 速報 PR の diff で roster / 技 / 持ち物 / メガ / ja が妥当であることをスポット確認。
3. `ls docs/adr/archive/` で 0033/0037 退避、`git grep` で dangling 無しを確認。
4. `pnpm verify` 緑を確認。

## リスク・備考

- Serebii は latin-1 + CRLF + 超長行の HTML。新スクレイパーも文字コード・健全性 exit code（0/2/3/4）を設計する（既存コードを参考にしてよい）。
- 速報は暫定値。showdown-sync が追いついたら上書きされる旨を PR 本文・ラベル（`data:provisional`）で明示する。
- ADR 本文は可変 plan ファイルを参照しない（[[adr]]）。
