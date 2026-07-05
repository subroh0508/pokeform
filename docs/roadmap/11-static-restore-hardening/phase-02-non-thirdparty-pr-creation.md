# Phase 2 — PR 作成を非 third-party 化（cpr → gh pr create ×3）+ E2E 検証

## 目的 / スコープ

3 つの取得 workflow の PR 自動作成を **third-party action（`peter-evans/create-pull-request`）から
非 third-party（`git push` + `gh pr create` / GITHUB_TOKEN）へ移行**する。撤去 test-branch から
`pokeapi-names.yml` を dispatch し、from-scratch 復元が全ステップ緑 + gh 由来で PR 自動作成されることを
GitHub Actions 上で E2E 確認する（Phase 1 の機構修正の最終検証を兼ねる）。

## 前提（依存）

- **Phase 1 完了**（P1-3 修正 + languages 復元で main が緑）。
- `gh` は GitHub Actions runner に既定インストール済み・`GITHUB_TOKEN` で認証。

## タスク

- [ ] `.github/workflows/pokeapi-names.yml` の `Create Pull Request` 段を `git switch -c` + `git commit` +
  `git push` + `gh pr create`（`--base main --head <branch> --title --body-file --label`）へ置換。
- [ ] `.github/workflows/showdown-sync.yml` の同段を同様に置換（label `data:authoritative`）。
- [ ] `.github/workflows/serebii-bulletin.yml` の同段を同様に置換（label `data:provisional`）。
- [ ] **label 事前作成**: `gh pr create --label` は label を自動作成しないため、各 workflow に
  `gh label create <name> --force`（冪等）を PR 作成前に足すか、リポジトリに label を事前作成する。
- [ ] `permissions:`（`contents: write` / `pull-requests: write`）が gh 経路でも足りるか確認（既存の cpr 用
  権限を流用）。差分無し・空 push はスキップする配線（`git diff --quiet` ガード）を維持する。
- [ ] `env: GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` を PR 作成段に付与（`gh` の認証）。

## この Phase で育てるハーネス（rule・skill）

- **`author-static-data` / `verify-showdown-pr` / `author-regulation-data` SKILL.md**: 生成 PR の作成機構が
  `gh pr create`（非 third-party）である旨へ更新（label 事前作成の注意含む）。
- **ADR 要否**: 「PR 作成を third-party action から `gh` へ移行」は取得インフラの方針変更ゆえ ADR 候補
  （不可逆でないが「なぜ third-party を避けるか」を残す価値。`adr-new` で判断）。

## 受け入れ基準

1. `pnpm verify` 緑（workflow yaml 変更は verify 対象外だが構文健全性を確認）。
2. 3 workflow が `peter-evans/create-pull-request` を含まない（`git grep` で 0 件）。
3. 撤去 test-branch から `pokeapi-names.yml` を dispatch → **全ステップ緑 + `gh` 由来で PR が自動作成**される
   （P1-4 すべて解消の E2E 確認）。
4. 作成された PR の label / base / body が従来 cpr と同等。

## 検証手順

1. `git grep -n "peter-evans/create-pull-request" .github/workflows/` が 0 件。
2. `data/languages/*` を削除した test-branch を push し `gh workflow run pokeapi-names.yml --ref <branch>`。
3. Actions の run で `Fetch and sync` / `Generate, style, verify` / `Create Pull Request`（gh）が全て緑。
4. 生成された PR が `data:names` label 付き・base main・body に件数 / run link を含むことを確認。

## リスク・備考

- `gh pr create` は cpr の cherry-pick を介さないため、撤去 main への divergent branch でも衝突しない
  （P4 の cherry-pick 衝突が解消する）。
- `secrets.GITHUB_TOKEN` で作られた PR は他の workflow（CI）を**自動トリガしない**制約がある（GitHub 仕様）。
  必要なら PAT / workflow_run で補うが、本計画は手動 dispatch 運用ゆえ CI は PR 上で手動再実行 or 通常 push で発火。
  この制約を skill / workflow コメントに明記する。
- label 事前作成を忘れると `gh pr create --label` が失敗する（PR2 #219 で `data:names not found` を実測）。
