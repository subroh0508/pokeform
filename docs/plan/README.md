# 実装計画インデックス（`docs/plan/`）

pokeform の実装計画は **計画ディレクトリ単位**で分割し、各ディレクトリ配下を **Phase doc 単位（1 phase = 1 PR）** で進める。本 README は計画群の**採番/slug 規約・全体進捗・Phase doc 共通テンプレート**を定める入口。

> **新しい計画群は [`plans-new`](../../.claude/skills/plans-new/SKILL.md) skill で起こす**（手動で OVERVIEW / phase doc を書かない）。`plans-new` が実装指示を OVERVIEW 化し、6 基準で 1 phase = 1 PR に分割する。**計画群は `OVERVIEW.md`（ゴール / 背景 / 設計方針 / 実装指針 / スコープ外）を標準の入口ドキュメントとする**。手順 SoT は [`planning.md`](../../.claude/rules/planning.md)、決定の「なぜ」は [ADR 0020](../adr/0020-plans-new-entry-point.md)。既存 `00` / `01` の OVERVIEW 後付け等の遡及改修はしない。

- ハーネス整備計画 → [`00-harness-setup/README.md`](./00-harness-setup/)
- ライブラリ本体（MVP）計画 → [`01-mvp/README.md`](./01-mvp/)
- データ保持モデル再設計計画 → [`02-data-model-redesign/README.md`](./02-data-model-redesign/)
- アーキ正本（旧 `plan.md`）→ [`01-mvp/architecture.md`](./01-mvp/architecture.md)

## 採番 / slug 規約

- 計画ディレクトリは **`NN-<slug>/` 形式**（**ゼロ埋め 2 桁連番** + **kebab-case スラッグ**）。例: `00-harness-setup/`・`01-mvp/`。
- **確定済み**: `00-harness-setup`（ハーネス）/ `01-mvp`（ライブラリ本体 MVP）/ `02-data-model-redesign`（データ保持モデル再設計）。
- **`03-<slug>/` 以降は事前スタブを作らない**。MVP 後の作業（テーマ）が出るたびに、その内容から slug を**都度生成**して採番する（例: 本格ダメージ計算なら `03-damage-calc/`）。
- 各計画ディレクトリ配下の Phase doc も同様に **`phase-NN-<slug>.md`**（ゼロ埋め 2 桁）。ディレクトリ直下に当該計画の `README.md`（インデックス）を置く。

## 全体進捗

> 各 phase = 1 PR。チェックは PR マージ時にまとめて更新する（個別 phase 実装中は触らない）。

### 00-harness-setup（ハーネス整備）

- [x] 00-harness-setup / phase-01 — 計画ドキュメント基盤と正本移動
- [x] 00-harness-setup / phase-02 — レトロスペクティブ & ハーネス改良ループ
- [x] 00-harness-setup / phase-03 — コードレビュー Skill
- [x] 00-harness-setup / phase-04 — ADR の仕組み
- [x] 00-harness-setup / phase-05 — ツールチェーンとバージョン固定
- [x] 00-harness-setup / phase-06 — Docker 化
- [x] 00-harness-setup / phase-07 — rules と CLAUDE.md
- [x] 00-harness-setup / phase-08 — 中核 Skills
- [x] 00-harness-setup / phase-09 — 検証ゲート（Git hooks + Claude 補助 hooks）
- [x] 00-harness-setup / phase-10 — Dependabot と dep-update skill
- [x] 00-harness-setup / phase-11 — 実装ワークフロー Skill

### 01-mvp（ライブラリ本体）

- [ ] 01-mvp / phase-00 — 足場 + 実数値計算（calc-stats）
- [ ] 01-mvp / phase-01 — データ生成 + 一貫性/技範囲チェック（MVP コア）
- [ ] 01-mvp / phase-02 — 個体 tsc 検証層
- [ ] 01-mvp / phase-03 — ステータス調整の壁打ち

### 02-data-model-redesign（データ保持モデル再設計）

- [x] 02-data-model-redesign / phase-01 — カタログ分離（種族 / 技 / 持ち物 / 特性の append-only マスター）
- [x] 02-data-model-redesign / phase-02 — レギュレーションモデル再設計（per-reg YAML + period + per-reg 型 + A案型機構）
- [x] 02-data-model-redesign / phase-03 — 情報源確定 + 20匹サンプル検証
- [x] 02-data-model-redesign / phase-04 — per-regulation 種族型 + 個体の複数レギュレーション宣言（global species.ts 廃止 → per-reg 正本・per-reg 習得技 + reg-aware 型機構 + 個体 regulations:[] fan-out）
- [ ] 02-data-model-redesign / phase-05 — M-A 全データ投入

## MVP の範囲

- **MVP の範囲 = `01-mvp` の phase 0〜3 すべて**（ハーネス `00-harness-setup` 整備済みを前提に実装する）。
- MVP 完了時点で次の 3 つが揃う:
  1. **個体・パーティの検証**（個体 tsc 検証層 / `check:party`）。
  2. **一貫性 / 技範囲チェック**（防御弱点の集中検出 + 攻撃範囲の穴検出 = MVP コア）。
  3. **ステータス調整**（実数値・耐久/火力指数・能力ポイント逆算の壁打ち）。
- 詳細な範囲・ゴールは [`01-mvp/README.md`](./01-mvp/) を参照。

## Phase doc 共通テンプレート

新しい Phase doc は次の見出し構成に従う（不要な節は省かず「なし」と明記する）。

```markdown
# Phase N — <タイトル>

## 目的 / スコープ
<このフェーズで何を達成するか・スコープ外は何か>

## 前提（依存）
<依存する phase / 確定済み rule・skill。無ければ「なし」>

## タスク
- [ ] <実装タスクをチェックボックスで列挙>

## この Phase で育てるハーネス（rule・skill）
<確定/追記する rule、作成する skill（canonical + symlink、`skill-creator` 利用）>

## 受け入れ基準
<完了の客観条件。原則 `pnpm verify` 緑を含む>

## 検証手順
1. <受け入れ基準を満たすか確認する具体手順>

## リスク・備考
<トレードオフ・注意点・将来計画への送り>
```

> スキル作成は必ず `skill-creator` skill を使い、canonical 実体 `.claude/skills/<name>/SKILL.md` + `.agents/skills/<name>` symlink で両ツール共有する（詳細は `00-harness-setup` の skill-authoring 方針 / `cross-agent`）。
