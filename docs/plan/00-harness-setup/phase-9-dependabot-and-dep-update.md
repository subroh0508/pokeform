# Phase 9 — Dependabot と dep-update skill

## 目的 / スコープ

依存の自動更新（Dependabot）と、その PR を**レビューしてマージ可否を判断・実行する Skill** を用意する。コーディングエージェントが依存追従を安全に回せるようにする。

## 前提（依存）

- Phase 8（`.claude/settings.json` の `Bash(gh pr *)` 権限）/ Phase 4（`pnpm verify`）/ Phase 5（docker エコシステムの対象 `Dockerfile`）。

## タスク

- [ ] `.github/dependabot.yml`:
  - [ ] `package-ecosystem: npm`（`/`）/ `github-actions`（`/`）/ `docker`（`Dockerfile` のベースイメージ）の 3 エコシステム
  - [ ] `schedule.interval: weekly`
  - [ ] マイナー/パッチをまとめる `groups`（例 `dev-dependencies`）で PR 数を抑制、`open-pull-requests-limit` を適度に
  - [ ] `commit-message.prefix: "chore(deps)"`（Conventional Commits）
- [ ] `.claude/skills/dep-update/SKILL.md`（canonical・引数: PR 番号 または 依存名）+ `.agents/skills/dep-update` symlink（クロスエージェント共有・skill-creator 準拠、`cross-agent.md`／Phase 6）:
  - frontmatter: `description`（trigger 明示）、`allowed-tools: Bash(gh *) Bash(pnpm *) Read Grep WebFetch`
  - 手順:
    1. **対象特定**: `gh pr view <PR>` で更新パッケージと from→to を取得（依存名なら `gh pr list` で該当 Dependabot PR を検索）
    2. **リリースノート/影響確認**: `gh api`（Releases）/ WebFetch で `from..to` の CHANGELOG・リリースノートを取得し、破壊的変更・非推奨・挙動変更を抽出。`Grep` で当該 API の使用箇所を洗い影響範囲を特定
    3. **検証**: `gh pr checkout` → `pnpm install` → `pnpm verify`。`gh pr checks` で CI も確認
    4. **マージ可否判断（明文化）**: 〈可〉= patch/minor かつ `verify` 緑 かつ 破壊的変更が使用箇所に無い かつ CI 緑。〈要人手〉= major / 破壊的変更が該当 / `verify` 失敗 / CI 赤
    5. **アクション**: 〈可〉→ 影響サマリを `gh pr comment` で残し `gh pr merge --squash --delete-branch`。〈要人手〉→ リスク要約と推奨対応をコメントしマージせず停止
  - **安全策**: マージは不可逆・外部影響のある操作。〈可〉基準を**すべて**満たす場合のみ自動実行し、1 つでも欠ければ停止して人手へエスカレーション。判定根拠（バージョン差分・該当/非該当の使用箇所・verify 結果）を必ず明示。

## 受け入れ基準

- `.github/dependabot.yml` が npm / github-actions / docker を対象に設定済み。
- `dep-update` skill が呼び出せ、手順（特定→影響確認→verify→可否判断→アクション）が定義済み（実 PR が無くても可）。

## 検証手順

1. `dependabot.yml` の構文・対象エコシステムを確認。
2. 既存 or テスト用の依存更新 PR に対し `dep-update <PR>` を実行し、判定根拠とアクションが妥当かを確認。

## リスク・備考

- 自動マージは〈可〉基準を厳格に満たす場合のみ。少しでも不確実なら人手へ。
- docker エコシステムにより Node ベースイメージ更新も PR 化される（Phase 5 のバージョン整合チェックと連携）。
