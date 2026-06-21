# 08-rules-skills-simplify — rules / skills の純シンプル化 OVERVIEW

## ゴール

15 rules・16 skills の**冗長を削るが意味は保つ**圧縮を行い、全体で **rules 約 230〜300 行 / skills 約 250〜340 行（各 20〜30%）** の削減を達成する。trigger 精度・自己完結性・安全性記述を保ったまま、ARID（散文は言い換え可・**正本の実体は重複させない**）に従って「実体の重複」を削り、読みやすさを上げる。

調査レポート [`docs/refactor-survey-2026-06-21.md`](../../refactor-survey-2026-06-21.md) §5 が 1 件ずつ精読して洗い出した削減余地を、独立にマージ可能な phase 群へ落とす。

## 背景 / 動機

ハーネス資産は機能としては健全だが、横断的に 5 類型の冗長が蓄積している（§5.1）:

| # | パターン | 是正 |
|---|---|---|
| P1 | frontmatter description の肥大（key concept を全部詰め込む） | trigger 文を 1〜2 文に。詳細・例は本文へ |
| P2 | frontmatter ↔ 本文冒頭の重複 | 本文冒頭の重複説明を削除 |
| P3 | 「なぜ」を本文に書きすぎ | 決定根拠は ADR へ委譲、rule は「何をするか」に絞る（1 行要約は残す） |
| P4 | SoT 実体の再記述（リンクで足りる） | rule / references への参照に置換 |
| P5 | learning 番号の羅列・散文と表の二重説明 | 「過去 learning で反復」に集約、表を核に散文を脚注化 |

放置すると、rule / skill が肥大して trigger 精度の点検が重くなり、改修時に「どこが実体 SoT か」が曖昧になる。

## 設計方針

- **本計画は計画 07（ドキュメント構成再編）完了後に着手する**。07 が配置・参照・二重管理を確定させた上で、08 が文体を圧縮する（07 が触る AGENTS.md / `code-review.md` の plan 参照是正 / `planning.md` の roadmap 追従と競合させない）。
- **シンプル化の判断線（やりすぎ防止・§5.5）を厳守**:
  1. **rule の自己完結性は保つ**: 「なぜ」を全部 ADR へ出さない。1 行要約は残し、詳細のみ ADR 委譲。
  2. **learning 番号の削除は慎重に**: 追跡可能性とのトレードオフ。「再発防止の根拠」になっている番号（adr.md の archive 追従手順等）は残す。冗長な羅列のみ集約。
  3. **trigger 精度を落とさない**: description 短縮で under-trigger を招かないか、`skill-creator` の eval で確認してから縮める。
  4. **手順の安全性記述は削らない**: 機械ゲート委譲・取りこぼし吸収・redaction・idempotent など「踏み外すと壊れる」注意書きは保持。
  5. **references への移動 ≠ 削除**: SKILL.md からの参照リンクを必ず張り、dangling を作らない。
- **共通フレーム抽出**（§5.4）: `code-review` / `harness-review` の SKILL.md は手順 1-5 がほぼ同一。共通フレームを `code-review.md` rule に置き、両 skill は差分（各 checklist 参照）に集中させる。auto-merge ゲートも両 references から rule へ一本化。
- **機械ゲート / レビュー観点を再実装しない**。圧縮は文面のみで、ゲート（型 / カバレッジ / Biome）・レビュー基準の実体は変えない（[[skill-authoring]] / [[cross-agent]]）。

## 実装指針

- ファイル群が独立（別 rule / 別 skill）なので**並行実装しやすい**。重量級 / 軽量級 / 系統別に phase を割り、各 phase は独立にマージ可能。
- 各 phase で **`harness-review` セルフレビュー**（trigger 精度 / cross-agent パリティ / SoT 一貫性 / references dangling）を必須にする。
- skill 改修は `skill-creator`（description=trigger・≤500 行・progressive disclosure・canonical + symlink）。rule 改修は [[skill-authoring]] の品質基準を直接適用。
- `code-review.md` は計画 07 Phase 6 で plan 参照違反が是正済みの状態を前提に、本計画 Phase 2 で共通フレームを追記する（順序: 07 → 08）。

## スコープ外

- **ドキュメント構成再編**（design 新設・roadmap 改名・AGENTS.md 刷新・二重管理解消）= 先行計画 [`07-docs-restructure`](../07-docs-restructure/README.md)。本計画は文体圧縮に専念し、配置・参照は変えない。
- 機械ゲート・レビュー観点・規約の**意味**の変更。圧縮は文面のみ。
- skill の trigger（description の意味）を変える改修（精度を保つ圧縮のみ。意味変更は別 PR）。

## 受け入れ基準

この計画群全体の客観条件:

1. 各フェーズ末で `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
2. rules / skills の合計行数が目安（rules −230〜300 / skills −250〜340）に近づき、**意味・trigger 精度・安全性記述・自己完結性が保たれている**。
3. `code-review` / `harness-review` の共通手順が `code-review.md` rule に一本化され、両 skill は差分に集中（auto-merge ゲートも rule へ一本化）。
4. references へ移した内容はすべて SKILL.md からリンクされ dangling ゼロ。
5. 各 skill の description が `skill-creator` eval で under/over-trigger を招かないことを確認済み。
6. cross-agent パリティ（canonical + `.agents/skills` symlink）維持。各 phase `harness-review` 済み。

## phase 分割（6 基準の評価サマリ）

§5.6 が示した粒度（重量級 / 軽量級 / survey-regulation 単独 / 系統別 / 共通フレーム抽出）に従う。6 基準:

- **意思決定の数**: 各ファイルの「何を残し何を集約するか」は独立判断 → ファイル群でまとめて分割。
- **スコープの広さ**: rules と skills、さらに skill は系統（レビュー / ワークフロー / データ）で関心が分かれる → 系統別に分割。
- **想定 diff**: 合計 500 行超の削減 + 共通フレーム抽出 → 積極分割。
- **並行実装**: 別ファイル群なので独立に並行可能 → phase を細かく割って待ちを減らす。

→ **6 phase = 6 PR**:

| Phase | テーマ | 対象 |
|---|---|---|
| 0 | rules 重量級シンプル化 | implementation-workflow.md / data-pipeline.md |
| 1 | rules 軽量級シンプル化 | 残り rules（code-review.md を除く）の P1-P5 圧縮 |
| 2 | レビュー skill 共通フレーム抽出 | code-review.md rule + code-review / harness-review skill + references |
| 3 | survey-regulation 単独圧縮 | survey-regulation skill（最大削減 287→~180） |
| 4 | ワークフロー系 skills 圧縮 | plans-new / start-phase / finish-phase / implementation-workflow / verify / adr-new / pr-retrospective / harness-meta |
| 5 | データ系 skills 圧縮 | author-individual / stat-tuning / review-party / update-catalog / dep-update |

Phase 0〜5 は相互にほぼ独立（並行可能）。先行計画 07 の完了を着手前提にする。
