---
id: 0016
status: Accepted
date: 2026-06-07
---

# 0016. ハーネスを Claude Code / Codex 両対応で共有する（AGENTS.md SoT + skill symlink + Git hooks）

## Context

pokeform は Claude Code と Codex の両方で実装される前提。指示・規約・skill・ゲートを各ツール固有の場所に二重管理すると、片方だけ更新されてドリフトする。両ツールが同一の指示・skill・ゲートを参照し、1 箇所の修正が両方に反映される構成が要る。

## Decision

ハーネスをクロスエージェントで共有する:

- **指示の SoT = `AGENTS.md`**（Linux Foundation 標準・Codex がネイティブ読込）。`CLAUDE.md` は `@AGENTS.md` を import する薄いアダプタ（公式 Pattern 0）+ Claude 固有注記のみ。
- **skill = canonical `.claude/skills/<name>/SKILL.md`（実体）+ `.agents/skills/<name>` を `../../.claude/skills/<name>` への symlink**（Codex 共有）。symlink 不可環境のみ copy フォールバック。
- **ゲート = Git hooks**（[ADR 0013](./0013-git-hooks-over-claude-hooks.md)）でツール非依存に強制。
- path-scoped rules は Claude が自動ロード、Codex 等は `docs/harness/rules-index.md`（`paths` から生成）を参照。

詳細は `.claude/rules/cross-agent.md`（SoT）。

## Consequences

- **良い点**: skill 本文・指示の 1 箇所修正が両ツールに反映され、二重管理が消える。ゲートも両対応。
- **悪い点 / コスト**: symlink 前提のため、symlink 不可環境では copy 同期のフォールバック運用が要る。`rules-index.md` の生成ドリフト防止が要る（`prepare`/CI で再生成）。
- **トレードオフ / 留意点**: Claude が自動取得する情報（path-scoped rules / skill frontmatter）を `AGENTS.md` にインラインせず、ポインタに徹してコンテキスト肥大を避ける。canonical + symlink のパリティはレビュー観点（[ADR 0017](./0017-semantic-code-review-skills.md)）でも確認する。

## Alternatives Considered

- **ツールごとに固有の場所で指示・skill を二重管理**: 各ツールに最適化できるが、同じ規約が複数箇所に分散しドリフト（食い違い）が必ず生じる。AGENTS.md を指示 SoT、skill は canonical + symlink、ゲートは Git hooks に一本化し、1 箇所修正で両ツールへ反映する共有方式を採用。
