---
paths:
  - ".claude/skills/**"
  - ".agents/skills/**"
description: skill の新規作成・改修は `skill-creator` skill の利用を必須化する方針（手書きで SKILL.md を起こさない・description=trigger・≤500 行・標準構成・canonical + symlink 配置）。.claude/skills/ や .agents/skills/ を扱うとき適用する。
---

# skill 作成の規約

skill（SKILL.md）はエージェントの挙動を左右するプロンプト資産。品質がぶれるとトリガ精度・保守性が落ちるため、作成・改修の手順を標準化する。**本 rule がこの規約の SoT**。

## `skill-creator` の利用を必須化

**skill の新規作成・改修は `skill-creator` skill を使う。手書きで SKILL.md を起こさない。** `skill-creator` に以下を担保させる:

- **`description` = trigger**: 「何を + いつ」を三人称で書き、under-trigger を避ける（呼ばれるべき場面で呼ばれない事故を防ぐ）。
- **本文 ≤500 行**。長い詳細は `references/` へ分離（progressive disclosure）。
- **説明型で書く**: 「ルール + なぜ」を優先し、`ALWAYS` / `NEVER` の羅列を避ける。
- **標準構成**: 役割 / 入力 / 出力 / Gotchas / 関連。

> **`skill-creator` が無い環境のフォールバック**: 本リポジトリにはプロジェクト固有の `skill-creator` skill が
> 存在しない場合がある（グローバルの汎用版は scaffolding 用途で本規約に最適化されていない）。その場合は
> **本 rule（skill-authoring）の基準を直接適用して SKILL.md を編集してよい**。`skill-creator` の不在を理由に
> 着手を止めない。品質基準（description=trigger / ≤500 行 / progressive disclosure / 説明型 / 標準構成 /
> canonical+symlink パリティ）は本 rule が SoT であり、`skill-creator` はその自動化手段に過ぎない。

## 配置（cross-agent 共有）

- canonical 実体を **`.claude/skills/<name>/SKILL.md`** に置く。
- `.agents/skills/<name>` を **相対 symlink `../../.claude/skills/<name>`** にして Codex と共有する（symlink 不可環境のみ copy フォールバック）。配置・パリティの SoT は [[cross-agent]]。

## 何を書き / 書かないか

- skill には**手順とトリガ**を書く。仕様の細部（数値・型パターン）は正本（`docs/plan/01-mvp/architecture.md` / 各 rule）に置き、skill からは**参照**する。
- **機械ゲート（型 / テスト / lint）やレビュー観点を skill 内で再実装しない**。既存の `pnpm verify` / Git hooks / レビュー skill を**再利用**する。
- 決定論的・小規模な手順 skill では eval 駆動の重い反復は簡素化してよい（`skill-creator` の重い検証は任意）。

## セルフチェック（SKILL.md 作成・改修後に確認）

機械ゲートで捕れない skill 固有の事故を防ぐため、編集後に次を確認する（理由づき）:

- **参照の実在確認**: ADR / rule / ファイルへのリンクは `ls` / grep で**実在を確認してから**書く。`[[wikilink]]` は
  対応 rule / memory の slug が実在するもののみ（dangling 防止・learning #42/#58）。推測でファイル名を書かない
  （ADR は採番が紛らわしく `0022-xxx.md` の slug を取り違えやすい）。
- **ファイル参照は markdown リンク**: skill 内のファイル参照は `[表示名](./path)` で書く。`[[...]]` は rule / memory
  名の wikilink 専用で、ファイルパスに使わない（記法の混同を避ける）。
- **`description` は文字数で ≤1024**: YAML folded scalar の `description` を `wc -c`（バイト数）で測ると日本語は
  3 バイト/字で誤判定する。**文字数**（rendered）で 1024 以内を確認する。
- **cross-agent パリティ**: canonical（`.claude/skills/<name>`）と `.agents/skills/<name>` symlink（または copy）が
  一致し、`references/` も symlink 経由で参照できるか（[[cross-agent]]）。
