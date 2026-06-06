# `.githooks/` — 検証ゲート（ツール非依存・強制）

このディレクトリは pokeform の**強制検証ゲート**を Git ネイティブフックとして提供する。
`core.hooksPath=.githooks` は `package.json` の `prepare` スクリプト（Phase 5）で設定され、
新規 clone でも `pnpm install` だけで自動有効化される（追加依存なし）。

採用判断は ADR `0013-git-hooks-over-claude-hooks`。

## フック

| フック | 境界 | ゲート内容 | 失敗時 |
|---|---|---|---|
| `pre-commit` | コミット | `pnpm typecheck` → `pnpm lint`（高速・軽量） | `exit 1` でブロック |
| `pre-push` | プッシュ | `pnpm test:cov`（カバレッジ100%・重い） | `exit 1` でブロック |

コミット境界は軽く保ち、重い検証（テスト+カバレッジ）は push 境界へ集約する
（編集毎の全テスト実行はループを遅くするため不採用）。

## クロスエージェントの位置づけ

- **強制ゲート（`.githooks/`）はツール非依存**。Claude Code・Codex・素の `git`・CI の
  すべてのコミッターに等しく効く。ここが品質の最終防衛線。
- **Claude 補助 hook（編集直後の Biome、`.claude/hooks/post-edit-biome.sh`）は Claude 固有**の
  即時フィードバックであり、**強制ゲートではない**。`.claude/settings.json` の
  `PostToolUse(Edit)` から呼ばれる。
- **Codex の即時フィードバックは任意**。同等処理を `.codex/config.toml` の command hooks に
  置くことも可能だが、**既定では作らない** — ゲートは Git hooks に集約し、設定の二重管理を避ける。
