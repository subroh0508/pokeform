# Phase 3 — showdown-sync ワークフロー + ADR 0039

## 目的 / スコープ

Phase 1-2 で確立した showdown 抽出 + 転記 + ja backfill を **GitHub Actions（`workflow_dispatch` 手動）** で無人実行し、**YAML 更新 PR を自動作成**する経路を作る。取得元の根本転換（showdown 第一の正・PokeAPI ja 専任・構造取得廃止）を ADR 0039 に記録する。

- スコープ内: `showdown-sync.yml`、showdown の CI clone/build/抽出配線、ADR 0039（0012/0027 supersede + archive 退避 + 参照追従）。
- スコープ外: Serebii 速報（Phase 4）、照合 skill（Phase 5）。

## 前提（依存）

- **Phase 1-2 完了**（抽出・転記・ja 専任が揃っている）。
- 確定済み rule: [[data-pipeline]] / [[adr]] / [[redaction]]。

## タスク

- [ ] `.github/workflows/showdown-sync.yml` を作成（入力 `regulation`）:
  - Checkout pokeform + Checkout `smogon/pokemon-showdown`（`ref: master`, `fetch-depth: 1`, `path: pokemon-showdown`）
  - showdown 内 `npm ci && node build` → `scripts/showdown/` を `pokemon-showdown/tools/` へ copy → 再 `node build`
  - `pnpm showdown:species/moves/items/abilities/mega <regulation>`（抽出 → `sync-showdown.ts` 転記）
  - `pnpm fetch:ja-names` → `pnpm sync:ja-names`（ja backfill）
  - `pnpm check:regulation data/champions` → `pnpm generate:data` → `pnpm verify`
  - `peter-evans/create-pull-request`: ブランチ `data/showdown-<regId>-<run>`・ラベル `data:authoritative`・本文に showdown commit SHA / mod / counts
- [ ] PR 作成権限（`GITHUB_TOKEN` の permissions または PAT）と branch protection の整合を確認。
- [ ] `adr-new` で **ADR 0039**（pokemon-showdown を第一の正・PokeAPI を ja 専任・構造取得廃止）を起こす。
- [ ] ADR **0012**（PokeAPI vendor=構造取得元）/ **0027**（構造 SoT を PokeAPI→specs 転記）の frontmatter `status` を `Superseded by ADR-0039` に更新し `docs/adr/archive/` へ `git mv`。`git grep -nE "\b0*(12|27)\b" -- '*.md' '*.workflow' '*.ts'` で inbound 参照を archive/0039 へ追従（[[adr]]）。

## この Phase で育てるハーネス（rule・skill）

- ADR 0039 を起票（`adr-new`）。被 supersede ADR（0012/0027）の archive 退避と参照追従。

## 受け入れ基準

- `pnpm verify` 緑。
- `showdown-sync.yml` を `workflow_dispatch` で手動実行すると、抽出 → 転記 → generate → verify を経て PR が立ち、CI（`pnpm verify`）が緑。
- ADR 0039 が `docs/adr/` に存在し、0012/0027 が `Superseded by ADR-0039` で archive へ退避、dangling 参照ゼロ。

## 検証手順

1. ワークフローを `workflow_dispatch`（`regulation: champions-m-a`）で実行し、PR 自動作成と CI 緑を確認。
2. 生成された PR の diff が showdown 由来データで妥当であることをスポット確認。
3. `ls docs/adr/archive/` で 0012/0027 退避を確認、`git grep` で 0012/0027 への dangling リンクが無いことを確認。
4. `pnpm verify` 緑を確認。

## リスク・備考

- showdown の clone + build は CI で重い。`fetch-depth: 1` + `ref: master` で軽量化し、必要なら build キャッシュを検討。
- PR 自動作成のトークン権限は外向き操作。`create-pull-request` の権限スコープを最小化し、PR 本文は [[redaction]] 適用。
- ADR 本文は可変 plan ファイルを参照しない（[[adr]]）。決定の根拠と被 supersede のみ記す。
