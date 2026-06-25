@AGENTS.md

<!--
CLAUDE.md は AGENTS.md を import する薄いアダプタ（公式 Pattern 0）。
規約・アーキ詳細は AGENTS.md と各 rule（`.claude/rules/*`）・`docs/design/` に委譲し、本文へ再掲しない。
Claude 固有の上書き・注記のみを import 行の下に置く。方針 SoT は .claude/rules/cross-agent.md。
-->

## Claude 固有の注記

- **rules**: `.claude/rules/*` は `paths` frontmatter で**自動ロード**される。`docs/harness/rules-index.md`（Codex 等向けの生成索引）を読みに行く必要はない。
- **skills**: 手順 skill は `.claude/skills/<name>/`（canonical 実体）。`.agents/skills/<name>` はそこへの symlink（Codex 共有）。新規作成・改修は `skill-creator` skill を使う。
- **hooks（補助）**: Claude 限定の即時フィードバックは `.claude/settings.json` + `.claude/hooks/*`。強制ゲートではない。
- **強制ゲート**: 型 / カバレッジ100% / Biome の強制は `.githooks/`（`core.hooksPath`、ツール非依存）。Claude hooks で再実装しない。
