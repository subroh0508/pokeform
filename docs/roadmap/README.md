# 実装ロードマップ（`docs/roadmap/`）

pokeform の実装ロードマップは **計画ディレクトリ単位**で分割し、各ディレクトリ配下を **Phase doc 単位（1 phase = 1 PR）** で進める。本 README は計画群の**採番/slug 規約・`completed/` 運用・全体進捗（計画単位の status ロールアップ）**を定める入口。Phase doc / OVERVIEW / README の見出しテンプレートの正本は [`plan-templates.md`](../../.claude/skills/plans-new/references/plan-templates.md)。

> **`docs/roadmap/` と `docs/design/` の棲み分け**: `docs/roadmap/` = **何をどの順で作るか・進捗・完了履歴**（計画＝mutable WIP）。[`docs/design/`](../design/README.md) = **なぜ・どう成り立っているか**（設計俯瞰＝コードなし Explanation・可変スナップショット）。決定の「なぜ・いつ」は `docs/adr/`（不変ログ）。

> **新しい計画群は [`plans-new`](../../.claude/skills/plans-new/SKILL.md) skill で起こす**（手動で OVERVIEW / phase doc を書かない）。`plans-new` が実装指示を OVERVIEW 化し、6 基準で 1 phase = 1 PR に分割する。**各計画は `OVERVIEW.md`（ゴール / 背景 / 設計方針 / 実装指針 / スコープ外 / 受け入れ基準）を入口ドキュメントに持つ**。手順 SoT は [`planning.md`](../../.claude/rules/planning.md)、決定の「なぜ」は [ADR 0020](../adr/0020-plans-new-entry-point.md)。既存計画も参考価値があれば OVERVIEW を遡及付与してよい（**00 は付与済み・01 は当面据え置き**）。

## 計画一覧

active（未着手・進行中）は直下、完了した計画群は [`completed/`](./completed/) 配下に集約する。

- M-A/M-B 解禁データ投入（限定セットでのスキル実地検証 → 本投入）計画 → [`09-champions-data-rollout/README.md`](./09-champions-data-rollout/)
- **完了計画群** → [`completed/`](./completed/)（下記ロールアップ表参照）
- 設計俯瞰（旧 `01-mvp/architecture.md` をテーマ別に分割昇格・コードなし）→ [`docs/design/`](../design/README.md)

> **`XX-` 番号プレースホルダの規約は残すが、現在使用中の計画は無い**（旧 `XX-ma-full-data` は本番前の挿入が無くなったため `09-champions-data-rollout` に採番確定した）。`06` は旧 `06-ma-full-data` の番号で、`XX-` 移行に伴い欠番（再利用しない）。

## 採番 / slug 規約

- 計画ディレクトリは **`NN-<slug>/` 形式**（**ゼロ埋め 2 桁連番** + **kebab-case スラッグ**）。例: `08-docs-restructure/`・`completed/00-harness-setup/`。
- **例外: `XX-<slug>/`（番号プレースホルダ）** — 「常に最後に実施し、手前に計画が挿入されても採番やり直しを避けたい」計画は `XX-` 接尾で置く。数値採番（`NN-`）は辞書順で常に `XX-` の手前に並ぶため、新計画追加時に `XX-` を振り直さずに済む。**現在 `XX-` を使う計画は無い**（旧 `XX-ma-full-data` は `09-champions-data-rollout` に採番確定した）。
- **確定済み**: `00-harness-setup`（ハーネス）/ `01-mvp`（ライブラリ本体 MVP）/ `02-data-model-redesign`（データ保持モデル再設計）/ `03-survey-regulation-rework`（survey-regulation 刷新）/ `04-generated-layout-redesign`（generated / YAML ディレクトリ再編）/ `05-move-master-scraper-refactor`（技マスター専用取得 + スクレイパー役割分割 + skill オーケストレーター化）/ `07-rules-skills-simplify`（rules / skills 純シンプル化）/ `08-docs-restructure`（ドキュメント構成再編）/ `09-champions-data-rollout`（M-A/M-B 解禁データ投入・限定セット検証 → 本投入）。**`06` は欠番**（旧 ma-full-data の番号・`XX-` 移行に伴い再利用しない）。
- **`10-<slug>/` 以降は事前スタブを作らない**。作業（テーマ）が出るたびに、その内容から slug を**都度生成**して採番する（例: 本格ダメージ計算なら `10-damage-calc/`）。`XX-` の手前（数値）に並ぶ。
- 各計画ディレクトリ配下の Phase doc も同様に **`phase-NN-<slug>.md`**（ゼロ埋め 2 桁）。ディレクトリ直下に当該計画の `README.md`（インデックス）を置く。

## `completed/` 運用

完了した計画群は [`completed/`](./completed/) 配下へ集約し、active（未着手・進行中）と一目で分離する。「ひと目で把握」を `completed/` ディレクトリと下記ロールアップ表で二重に担保する。

- **移動タイミング**: 計画群の**全 phase が完了**したとき、`git mv <NN>-<slug> completed/<NN>-<slug>` で集約する（個別 phase 完了では動かさない）。`finish-phase` skill が plan 全完了を検知して促す。
- **番号は維持**（再採番しない）。`completed/00-harness-setup` のように元の `NN-<slug>` をそのまま保つ。**移動 / 廃止した番号は別テーマで再利用しない**（`06` 欠番と同じ予防）。
- **移動に伴う参照追従**: `completed/` への移動は plan ディレクトリが 1 階層深くなる。`git grep` でリポジトリ全体の inbound 参照（rule / skill / ADR / AGENTS.md / 他計画 doc）を **`docs/roadmap/completed/<NN>-...` へ追従**し、移動した plan doc 内の相対リンクは深度を補正する（**インライン相対リンク・reference 式リンク定義・素のパス参照**を全走査・dangling ゼロ）。手順は [`planning.md`](../../.claude/rules/planning.md) の「phase の insert / renumber 追従チェックリスト」と同種（`completed/` 移動の追従項目もそこに集約）。learnings / archive ADR の歴史言及は不変（凍結）。

## 全体進捗（計画単位の status ロールアップ）

> **per-phase の進捗チェックはサブ README が SoT**。本表は計画単位の status のみを持つ（✅ 完了 /
> 🚧 進行中 / ⬜ 未着手）。n/n の分数は付けない（Markdown 間の状態ズレを減らすため）。計画の状況が
> 変わったとき（進行中 / 完了へ）だけ `finish-phase` / マージ時に更新する。完了時は `completed/` へ
> 集約する（上記「`completed/` 運用」）。各計画の詳細はサブ README へ。

| 計画 | 状況 |
|---|---|
| [completed/00-harness-setup](./completed/00-harness-setup/README.md) | ✅ 完了 |
| [completed/01-mvp](./completed/01-mvp/README.md) | ✅ 完了 |
| [completed/02-data-model-redesign](./completed/02-data-model-redesign/README.md) | ✅ 完了 |
| [completed/03-survey-regulation-rework](./completed/03-survey-regulation-rework/README.md) | ✅ 完了 |
| [completed/04-generated-layout-redesign](./completed/04-generated-layout-redesign/README.md) | ✅ 完了 |
| [completed/05-move-master-scraper-refactor](./completed/05-move-master-scraper-refactor/README.md) | ✅ 完了 |
| [completed/07-rules-skills-simplify](./completed/07-rules-skills-simplify/README.md) | ✅ 完了 |
| [completed/08-docs-restructure](./completed/08-docs-restructure/README.md) | ✅ 完了 |
| [09-champions-data-rollout](./09-champions-data-rollout/README.md) | ⬜ 未着手 |

## MVP の範囲

- **MVP の範囲 = `completed/01-mvp` の phase 0〜3 すべて**（ハーネス `completed/00-harness-setup` 整備済みを前提に実装する）。
- MVP 完了時点で次の 3 つが揃う:
  1. **個体・パーティの検証**（個体 tsc 検証層 / `check:party`）。
  2. **一貫性 / 技範囲チェック**（防御弱点の集中検出 + 攻撃範囲の穴検出 = MVP コア）。
  3. **ステータス調整**（実数値・耐久/火力指数・能力ポイント逆算の壁打ち）。
- 詳細な範囲・ゴールは [`completed/01-mvp/README.md`](./completed/01-mvp/) を参照。

## Phase doc / OVERVIEW / README テンプレート

Phase doc・OVERVIEW・計画群 README の見出し構成の**正本は [`plan-templates.md`](../../.claude/skills/plans-new/references/plan-templates.md)**（`plans-new` の references）。新しい計画群・phase doc はそのテンプレに従う（本 README にはインライン再掲しない）。
