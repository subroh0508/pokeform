# 実装計画インデックス（`docs/plan/`）

pokeform の実装計画は **計画ディレクトリ単位**で分割し、各ディレクトリ配下を **Phase doc 単位（1 phase = 1 PR）** で進める。本 README は計画群の**採番/slug 規約・全体進捗（計画単位の status ロールアップ）**を定める入口。Phase doc / OVERVIEW / README の見出しテンプレートの正本は [`plan-templates.md`](../../.claude/skills/plans-new/references/plan-templates.md)。

> **新しい計画群は [`plans-new`](../../.claude/skills/plans-new/SKILL.md) skill で起こす**（手動で OVERVIEW / phase doc を書かない）。`plans-new` が実装指示を OVERVIEW 化し、6 基準で 1 phase = 1 PR に分割する。**各計画は `OVERVIEW.md`（ゴール / 背景 / 設計方針 / 実装指針 / スコープ外 / 受け入れ基準）を入口ドキュメントに持つ**。手順 SoT は [`planning.md`](../../.claude/rules/planning.md)、決定の「なぜ」は [ADR 0020](../adr/0020-plans-new-entry-point.md)。既存計画も参考価値があれば OVERVIEW を遡及付与してよい（**00 は付与済み・01 は当面据え置き**）。

- ハーネス整備計画 → [`00-harness-setup/README.md`](./00-harness-setup/)
- ライブラリ本体（MVP）計画 → [`01-mvp/README.md`](./01-mvp/)
- データ保持モデル再設計計画 → [`02-data-model-redesign/README.md`](./02-data-model-redesign/)
- survey-regulation 刷新（決定論スクレイパー + 自己修復）計画 → [`03-survey-regulation-rework/README.md`](./03-survey-regulation-rework/)
- generated / YAML ディレクトリ構成の再編（specs / languages / per-reg 分割）計画 → [`04-generated-layout-redesign/README.md`](./04-generated-layout-redesign/)
- 技マスター専用取得 + スクレイパー役割分割 + survey-regulation オーケストレーター化 計画 → [`05-move-master-scraper-refactor/README.md`](./05-move-master-scraper-refactor/)
- rules / skills の純シンプル化（文体圧縮・SoT 実体重複削減）計画 → [`07-rules-skills-simplify/README.md`](./07-rules-skills-simplify/)
- ドキュメント構成再編（`docs/design/` 新設・`docs/plan` → `docs/roadmap` 改名・front matter 規約・AGENTS.md 刷新・SoT 二重管理解消）計画 → [`08-docs-restructure/README.md`](./08-docs-restructure/)
- M-A 全種族投入（新レイアウト + 整理済みパイプライン上での全量投入）計画 → [`XX-ma-full-data/README.md`](./XX-ma-full-data/)
- アーキ正本（旧 `plan.md`）→ [`01-mvp/architecture.md`](./01-mvp/architecture.md)

> **`XX-ma-full-data` の `XX-` は「常に最後」の番号プレースホルダ**（全種族投入は本番前にまだ計画が前に挿入されうるため、固定の数値採番を避けて採番やり直しの頻度を下げる）。数値採番の新計画（09・10…）は常に `XX-` の手前に並ぶ。`06` は旧 `06-ma-full-data` の番号で、`XX-` 移行に伴い欠番（再利用しない）。
> **実施順**: `07-rules-skills-simplify`（文体圧縮）を先、`08-docs-restructure`（構造再編）を後にする（先に冗長を削ってから構造を動かす）。

## 採番 / slug 規約

- 計画ディレクトリは **`NN-<slug>/` 形式**（**ゼロ埋め 2 桁連番** + **kebab-case スラッグ**）。例: `00-harness-setup/`・`01-mvp/`。
- **例外: `XX-<slug>/`（番号プレースホルダ）** — 「常に最後に実施し、手前に計画が挿入されても採番やり直しを避けたい」計画は `XX-` 接尾で置く。数値採番（`NN-`）は辞書順で常に `XX-` の手前に並ぶため、新計画追加時に `XX-` を振り直さずに済む。現在は `XX-ma-full-data`（M-A 全種族投入）。
- **確定済み**: `00-harness-setup`（ハーネス）/ `01-mvp`（ライブラリ本体 MVP）/ `02-data-model-redesign`（データ保持モデル再設計）/ `03-survey-regulation-rework`（survey-regulation 刷新）/ `04-generated-layout-redesign`（generated / YAML ディレクトリ再編）/ `05-move-master-scraper-refactor`（技マスター専用取得 + スクレイパー役割分割 + skill オーケストレーター化）/ `07-rules-skills-simplify`（rules / skills 純シンプル化）/ `08-docs-restructure`（ドキュメント構成再編）/ `XX-ma-full-data`（M-A 全種族投入・番号プレースホルダ）。**`06` は欠番**（旧 ma-full-data の番号・`XX-` 移行に伴い再利用しない）。
- **`09-<slug>/` 以降は事前スタブを作らない**。作業（テーマ）が出るたびに、その内容から slug を**都度生成**して採番する（例: 本格ダメージ計算なら `09-damage-calc/`）。`XX-` の手前（数値）に並ぶ。
- 各計画ディレクトリ配下の Phase doc も同様に **`phase-NN-<slug>.md`**（ゼロ埋め 2 桁）。ディレクトリ直下に当該計画の `README.md`（インデックス）を置く。

## 全体進捗（計画単位の status ロールアップ）

> **per-phase の進捗チェックはサブ README が SoT**。本表は計画単位の status のみを持つ（✅ 完了 /
> 🚧 進行中 / ⬜ 未着手）。n/n の分数は付けない（Markdown 間の状態ズレを減らすため）。計画の状況が
> 変わったとき（進行中 / 完了へ）だけ `finish-phase` / マージ時に更新する。各計画の詳細はサブ README へ。

| 計画 | 状況 |
|---|---|
| [00-harness-setup](./00-harness-setup/README.md) | ✅ 完了 |
| [01-mvp](./01-mvp/README.md) | ✅ 完了 |
| [02-data-model-redesign](./02-data-model-redesign/README.md) | ✅ 完了 |
| [03-survey-regulation-rework](./03-survey-regulation-rework/README.md) | ✅ 完了 |
| [04-generated-layout-redesign](./04-generated-layout-redesign/README.md) | ✅ 完了 |
| [05-move-master-scraper-refactor](./05-move-master-scraper-refactor/README.md) | ✅ 完了 |
| [07-rules-skills-simplify](./07-rules-skills-simplify/README.md) | ⬜ 未着手 |
| [08-docs-restructure](./08-docs-restructure/README.md) | ⬜ 未着手 |
| [XX-ma-full-data](./XX-ma-full-data/README.md) | ⬜ 未着手 |

## MVP の範囲

- **MVP の範囲 = `01-mvp` の phase 0〜3 すべて**（ハーネス `00-harness-setup` 整備済みを前提に実装する）。
- MVP 完了時点で次の 3 つが揃う:
  1. **個体・パーティの検証**（個体 tsc 検証層 / `check:party`）。
  2. **一貫性 / 技範囲チェック**（防御弱点の集中検出 + 攻撃範囲の穴検出 = MVP コア）。
  3. **ステータス調整**（実数値・耐久/火力指数・能力ポイント逆算の壁打ち）。
- 詳細な範囲・ゴールは [`01-mvp/README.md`](./01-mvp/) を参照。

## Phase doc / OVERVIEW / README テンプレート

Phase doc・OVERVIEW・計画群 README の見出し構成の**正本は [`plan-templates.md`](../../.claude/skills/plans-new/references/plan-templates.md)**（`plans-new` の references）。新しい計画群・phase doc はそのテンプレに従う（本 README にはインライン再掲しない）。
