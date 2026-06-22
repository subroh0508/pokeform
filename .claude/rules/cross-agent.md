---
description: クロスエージェント共有方針の SoT（AGENTS.md=指示 SoT / CLAUDE.md=@AGENTS.md / skill symlink 共有と copy フォールバック / rules-index 生成 / Git hooks=ゲート SoT）。常時適用する。
---

# クロスエージェント共有の規約

pokeform のハーネスは **Claude Code と Codex 両方**から使う。各ツール固有の場所に二重管理するとドリフトするため、**1 箇所の修正が両ツールに反映される**構成を SoT とする。背景は ADR `0016-cross-agent-shared-harness`。常時ロード（paths なし）の方針 rule。

## 分担と SoT

| 機構 | 実体 / SoT | 各ツールの参照 |
|---|---|---|
| 指示 | **`AGENTS.md`**（指示 SoT・Linux Foundation 標準） | Codex はネイティブ読込 / Claude は `CLAUDE.md` → `@AGENTS.md` |
| rules | `.claude/rules/*`（paths frontmatter が SoT） | Claude は paths で自動ロード / Codex は **生成された `docs/harness/rules-index.md`** を参照 |
| skills | **canonical `.claude/skills/<name>/SKILL.md`（実体）** | Codex は `.agents/skills/<name>`（symlink）で同一実体を参照 |
| ゲート | `.githooks/`（`core.hooksPath`） | ツール非依存・素の git に強制（ADR `0013`） |

各機構の補足:

- **CLAUDE.md = `@AGENTS.md`**: `CLAUDE.md` は `AGENTS.md` を import する**薄いアダプタ**（公式 Pattern 0）+ Claude 固有注記のみ。規約・アーキ詳細を本文へ再掲しない（二重管理になる）。Claude 固有の上書きは import 行の**下**に置く。
- **skill 配置**: canonical は `.claude/skills/<name>/`、`.agents/skills/<name>` を**相対 symlink `../../.claude/skills/<name>`** にして Codex と共有する。作成・改修は **`skill-creator` skill**（[[skill-authoring]]）。**copy フォールバック**（symlink 不可環境）では `.agents/skills/<name>/` へコピー同期し、canonical を編集したら**コピー側も必ず更新**してパリティを保つ（レビュー観点 ADR `0017`）。
- **rules-index は生成物**: `docs/harness/rules-index.md` は `paths` frontmatter から **`scripts/gen-rules-index.ts` で生成**する（手編集しない）。`prepare`（`pnpm install` 時）で再生成してドリフトを防ぐ。**Claude の `@AGENTS.md` 取込には含めない**（paths 自動ロードのため不要・Codex 等のみ参照）。

## ハーネス資産を変えるとき

rule / skill / template / `AGENTS.md` / `CLAUDE.md` / `.githooks` を変更する PR は、cross-agent パリティ（canonical + symlink/copy 一致）を確認し、機械ゲートを skill 内で再実装していないかを点検する。skill 作成方針は [[skill-authoring]]。
