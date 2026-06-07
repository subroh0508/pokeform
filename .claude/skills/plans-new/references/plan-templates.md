# 計画ドキュメントのテンプレート

`plans-new` が書き出す `OVERVIEW.md` / `README.md` / `phase-NN-<slug>.md` の雛形。既存の
[`docs/plan/00-harness-setup`](../../../../docs/plan/00-harness-setup/README.md) /
[`docs/plan/01-mvp`](../../../../docs/plan/01-mvp/README.md) と
[`docs/plan/README.md`](../../../../docs/plan/README.md) の共通テンプレに揃えてある。Phase doc の見出し構成の
**正本は `docs/plan/README.md`「Phase doc 共通テンプレート」節**なので、ずれたらそちらに合わせる。

## OVERVIEW.md

計画群の入口。「**何を実現するか**」を先に固める（分割より前に作る）。

```markdown
# NN-{slug} — <計画群タイトル> OVERVIEW

## ゴール
<この計画群で最終的に達成する状態。利用者から見た価値で書く>

## 背景 / 動機
<なぜ今これをやるか。解こうとしている課題・きっかけ>

## 設計方針
<採用する方針・守る制約（既存 rule / ADR への参照）。確定アーキの要点>

## 実装指針
<どう作るか の大枠。レイヤ構成・主要コンポーネント・データの流れ>

## スコープ外
<この計画群で扱わないこと。将来計画への送り>

## phase 分割（6 基準の評価サマリ）
<6 基準で評価した結果と、分割した phase の一覧・狙い。1 PR 妥当ならその判断根拠>
```

## README.md（計画群インデックス）

進捗チェックリスト + **Mermaid 依存グラフ** + phase 一覧。

```markdown
# NN-{slug} — <計画群タイトル>（実装計画インデックス）

<1〜2 段落の概要。OVERVIEW.md / architecture.md など正本へのポインタ>

## ゴール / アウトカム
<OVERVIEW のゴールを 1〜2 行で。詳細は OVERVIEW.md を参照>

## フェーズ依存グラフ

\`\`\`mermaid
flowchart TD
    P0[phase-00 — 足場] --> P1[phase-01 — コア]
    P0 --> P2[phase-02 — 検証層]
    P1 --> P3[phase-03 — 調整]
    P2 --> P3
\`\`\`

## フェーズ一覧（この順で実施）

- [ ] [Phase 0 — <タイトル>](./phase-00-<slug>.md)
- [ ] [Phase 1 — <タイトル>](./phase-01-<slug>.md)
- [ ] [Phase 2 — <タイトル>](./phase-02-<slug>.md)

## この計画群全体の受け入れ基準

1. 各フェーズ末で `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
2. <計画群固有の客観条件>

## 補足
- 各 phase doc は `docs/plan/README.md` の Phase doc 共通テンプレートに従う。
- スキル作成は `skill-creator`、ADR は `adr-new`（[[skill-authoring]] / [[adr]]）。
```

> **Mermaid グラフの要点**: ノード = phase、エッジ = 依存（`A --> B` は「B は A に依存」）。並行可能な
> phase は同じ親から分岐させる（基準 6「並行実装のしやすさ」が一目で分かる）。直列なら一本の線でよい。

## phase-NN-<slug>.md（個別 phase doc）

`docs/plan/README.md`「Phase doc 共通テンプレート」と同一構成。不要な節は省かず「なし」と明記する。

```markdown
# Phase N — <タイトル>

## 目的 / スコープ
<このフェーズで何を達成するか・スコープ外は何か>

## 前提（依存）
<依存する phase / 確定済み rule・skill。無ければ「なし」>

## タスク
- [ ] <実装タスクをチェックボックスで列挙>

## この Phase で育てるハーネス（rule・skill）
<確定/追記する rule、作成する skill（canonical + symlink、`skill-creator` 利用）。無ければ「なし」>

## 受け入れ基準
<完了の客観条件。原則 `pnpm verify` 緑を含む>

## 検証手順
1. <受け入れ基準を満たすか確認する具体手順>

## リスク・備考
<トレードオフ・注意点・将来計画への送り>
```

## 採番 / slug 規約（再掲・正本は docs/plan/README.md）

- 計画ディレクトリ = `NN-<slug>/`（ゼロ埋め 2 桁連番 + kebab-case）。`NN` は既存最大 + 1。
- phase doc = `phase-NN-<slug>.md`（ゼロ埋め 2 桁）。
- 事前スタブは作らない。テーマが出るたびに内容から slug を都度生成して採番する。
