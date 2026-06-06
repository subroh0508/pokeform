---
paths:
  - ".claude/skills/**"
  - ".agents/skills/**"
description: skill の新規作成・改修は `skill-creator` skill の利用を必須化する方針（手書きで SKILL.md を起こさない・description=trigger・≤500 行・標準構成・canonical + symlink 配置）。.claude/skills/ や .agents/skills/ を扱うとき適用する。
---

# skill 作成の規約

skill（SKILL.md）はエージェントの挙動を左右するプロンプト資産。品質がぶれるとトリガ精度・保守性が落ちるため、作成・改修の手順を標準化する。背景は ADR `0012-skill-creation-via-skill-creator`。

## `skill-creator` の利用を必須化

**skill の新規作成・改修は `skill-creator` skill を使う。手書きで SKILL.md を起こさない。** `skill-creator` に以下を担保させる:

- **`description` = trigger**: 「何を + いつ」を三人称で書き、under-trigger を避ける（呼ばれるべき場面で呼ばれない事故を防ぐ）。
- **本文 ≤500 行**。長い詳細は `references/` へ分離（progressive disclosure）。
- **説明型で書く**: 「ルール + なぜ」を優先し、`ALWAYS` / `NEVER` の羅列を避ける。
- **標準構成**: 役割 / 入力 / 出力 / Gotchas / 関連。

## 配置（cross-agent 共有）

- canonical 実体を **`.claude/skills/<name>/SKILL.md`** に置く。
- `.agents/skills/<name>` を **相対 symlink `../../.claude/skills/<name>`** にして Codex と共有する（symlink 不可環境のみ copy フォールバック）。配置・パリティの SoT は [[cross-agent]]。

## 何を書き / 書かないか

- skill には**手順とトリガ**を書く。仕様の細部（数値・型パターン）は正本（`docs/plan/01-mvp/architecture.md` / 各 rule）に置き、skill からは**参照**する。
- **機械ゲート（型 / テスト / lint）やレビュー観点を skill 内で再実装しない**。既存の `pnpm verify` / Git hooks / レビュー skill を**再利用**する。
- 決定論的・小規模な手順 skill では eval 駆動の重い反復は簡素化してよい（`skill-creator` の重い検証は任意）。
