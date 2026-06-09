# 00. ハーネス環境整備（実装計画インデックス）

pokeform をコーディングエージェント（**Claude Code / Codex 両対応**）が**繰り返し・信頼性高く**実装していくための土台（共有指示 SoT `AGENTS.md`・ツールチェーン・rules・skills・検証ゲート・進捗ドキュメント・ADR・レトロスペクティブ改良ループ）を整備するフェーズ。ライブラリ本体のロジックは書かず、**以降の全フェーズを駆動するハーネス**を用意する。

> 設計の正本は [`OVERVIEW.md`](./OVERVIEW.md)（ゴール / 背景・動機 / 設計方針〈ハーネスの役割分担表・
> ツールチェーンと版の SoT・ブートストラップ時点のスナップショット〉/ 実装指針 / スコープ外 /
> 計画群全体の受け入れ基準）。本 README は薄索引（導入 + OVERVIEW ポインタ + フェーズ一覧）。

## フェーズ一覧（この順で実施）

- [x] [Phase 1 — 計画ドキュメント基盤と正本移動](./phase-01-plan-docs-and-canon-move.md)
- [x] [Phase 2 — レトロスペクティブ & ハーネス改良ループ](./phase-02-retrospective-loop.md) ← PR ごと KPT レトロ→ハーネス書き戻し（merge **後**）
- [x] [Phase 3 — コードレビュー Skill](./phase-03-code-review.md) ← PR merge **前**の意味的レビュー＋auto-merge。Phase 2 と対の品質ループ
- [x] [Phase 4 — ADR の仕組み](./phase-04-adr.md) ← 早期に確立し、以降の決定をその場で記録
- [x] [Phase 5 — ツールチェーンとバージョン固定](./phase-05-toolchain-and-versions.md)
- [x] [Phase 6 — Docker 化](./phase-06-dockerize.md)
- [x] [Phase 7 — rules と CLAUDE.md](./phase-07-rules-and-claude-md.md)
- [x] [Phase 8 — 中核 Skills](./phase-08-core-skills.md)
- [x] [Phase 9 — 検証ゲート（Git hooks + Claude 補助 hooks）](./phase-09-verification-gates.md)
- [x] [Phase 10 — Dependabot と dep-update skill](./phase-10-dependabot-and-dep-update.md)
- [x] [Phase 11 — 実装ワークフロー Skill](./phase-11-implementation-workflow.md) ← 着手〜マージ〜レトロ〜cleanup を統合する総仕上げ（capstone）

> 計画群全体の受け入れ基準（12 項目）は [`OVERVIEW.md` の「受け入れ基準」節](./OVERVIEW.md#受け入れ基準) を参照。

## 補足

- 各フェーズ doc は [`plan-templates.md`](../../../.claude/skills/plans-new/references/plan-templates.md) の
  「phase-NN-<slug>.md」節（テンプレ正本）に従う。
- ライブラリ本体（MVP = phase 0〜3）は `docs/plan/01-mvp/` の別計画で、このハーネス上で実装する。
