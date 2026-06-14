---
paths:
  - "docs/plan/**"
description: 実装指示を計画へ落とす手順の SoT。生の指示は必ず `plans-new` スキルを入口に通し、まず OVERVIEW（ゴール / 背景 / 設計方針 / 実装指針 / スコープ外）を作ってから 6 基準（意思決定の数 / 不可逆性 / スコープの広さ / 技術的難易度 / 想定 diff ~500行目安・>1000行は積極分割 / 並行実装のしやすさ）で 1 phase = 1 PR に分割する。1 PR 妥当なら GitHub issue + implementation-workflow、複数なら docs/plan/NN-{slug} 計画群を起こす。docs/plan/** を作る / 編集する・新しい計画群やテーマを起こすときに適用する。
---

# planning — 実装指示を計画へ落とす手順の SoT

生の実装指示・機能要望を、実装可能な phase（1 phase = 1 PR）へ分解する手順の**唯一の正本**。
スキル本体（[`plans-new`](../skills/plans-new/SKILL.md)）は手順の駆動に専念し、各ステージの基準と判断は
本 rule に集約する（二重記述を避ける）。決定の「なぜ」は
[ADR 0020](../../docs/adr/0020-plans-new-entry-point.md)。

## 大原則 — 実装指示は `plans-new` を入口に通す

**確定していない生の実装指示・機能要望（「〜を実装したい」「次はこれを作る」）を受けたら、着手の前に
必ず [`plans-new`](../skills/plans-new/SKILL.md) を一度経由する**。理由は、プロンプトで直に実装に入ると
着手の仕方・分割の粒度がエージェントごと・回ごとにぶれ、OVERVIEW を飛ばして巨大 PR を作る事故が起きる
ため。`plans-new` は `start-phase` / `implementation-workflow` の**手前の標準エントリポイント**であり、
計画化（指示 → OVERVIEW → 6 基準で分割）を定型化する。

例外は trivial な単発編集や会話的応答のみ。フェーズ単位の実装テーマではこれを既定とする。実装の駆動
（worktree〜マージ〜レトロ）は [[implementation-workflow]] の責務で、本 rule / `plans-new` は**計画化に
専念**する（役割分担）。

## ステージ（plans-new が駆動する順序）

### 1. OVERVIEW を先に作る（順序厳守）

生の指示をブラッシュアップし、`docs/plan/NN-{slug}/OVERVIEW.md`（ゴール / 背景 / 設計方針 / 実装指針 /
スコープ外）を作る。**必ず OVERVIEW を先に固めてから分割する**。何を実現するかが曖昧なまま phase を切ると
粒度がぶれるため。1 PR 妥当そうでも、まず OVERVIEW 相当の整理を済ませてから 3 の分岐へ進む。

### 2. 6 基準で 1 phase = 1 PR に分割する

OVERVIEW を実現する作業を洗い出し、次の **6 基準**で評価して分割する。どれか 1 つでも「重い」側に振れたら
分割を検討する（多面的に見るためのレンズ）。基準の運用詳細・判断例は
[`plans-new` の references/split-criteria.md](../skills/plans-new/references/split-criteria.md)。

1. **意思決定の数** — 独立した設計判断が複数混在するか。
2. **不可逆性** — 不可逆な決定（データ形式・公開 API・スキーマ）を複数含むか。
3. **スコープの広さ** — 複数レイヤ（types / domain / io / cli）を横断するか。
4. **技術的難易度** — 難所が複数あるか。
5. **想定 diff** — **~500 行が目安、>1000 行は積極的に分割**。ただしデータセット追加など意味ある粒度での
   分割が困難なケースは例外として 1 PR を許容し、**理由を OVERVIEW / issue に明記**する（行数だけで機械的に
   切らず、意味的完結性を優先）。
6. **並行実装のしやすさ** — 独立に並行で進められる塊に割れるか。

各 phase は「**単独でマージしても壊れない・レビュー可能・意味的に完結**」を満たすこと（[[code-review]] の
健全性の純改善）。

### 3. 書き出し（2 分岐）

- **1 PR 妥当**: `docs/plan/NN-{slug}/` は**作らず**、OVERVIEW 相当を本文にした **GitHub issue**
  （`gh issue create --body-file`）を起票し、そのまま [[implementation-workflow]] をキックする。issue 本文は
  GitHub への書き出しゆえ**投稿前に [[redaction]] を適用**する。
- **複数 phase**: `docs/plan/NN-{slug}/` に `OVERVIEW.md`（ゴール / 背景 / 設計方針 / 実装指針 /
  スコープ外 / **計画群全体の受け入れ基準**）/ `README.md`（薄索引 = 導入 + OVERVIEW ポインタ + Mermaid
  依存グラフ + phase 一覧の進捗チェック）/ `phase-NN-<slug>.md`×N を作る。**テンプレ・Phase doc 見出しの
  正本は [plan-templates.md](../skills/plans-new/references/plan-templates.md)**。トップ
  [`docs/plan/README.md`](../../docs/plan/README.md) の採番一覧・**全体進捗ロールアップ表**（計画 → 状況。
  新計画は `⬜ 未着手` で 1 行追加・分数は付けない）にも追記する。

### 4. 着手へ受け渡す

分割後、最初の phase を [`start-phase`](../skills/start-phase/SKILL.md) /
[[implementation-workflow]] へ繋ぐ。`plans-new` は計画化までで停止し、実装駆動はそちらに委ねる。

## 採番 / slug 規約（正本は docs/plan/README.md）

- 計画ディレクトリ = `NN-<slug>/`（ゼロ埋め 2 桁連番 + kebab-case）。`NN` は `ls docs/plan/` の既存最大 + 1 を
  **機械的に**決める（記憶・推測で振らない）。
- phase doc = `phase-NN-<slug>.md`（ゼロ埋め 2 桁）。
- **事前スタブを作らない**。テーマが出るたびに内容から slug を都度生成して採番する。
- **各計画は OVERVIEW を入口に持つ**。既存計画も参考価値があれば OVERVIEW を遡及付与してよい
  （**00 は付与済み・01 は当面据え置き**）。01-mvp は当面 OVERVIEW を作らず README 現状維持とする。

## phase の insert / renumber 追従チェックリスト

既存計画に phase を**挿入**して後続を**繰り下げる**（例 旧 Phase N → N+1）ときは、番号参照が複数ファイルに
散らばって**追従漏れ**が起きやすい（learning #70 / #76 / #50 で反復・dangling リンクや散文の素の数字残り）。
挿入・renumber を含む計画 doc PR は、書き出し後に次を**機械的に**確認する:

- **ファイル rename**: 繰り下げる phase doc を `git mv phase-NN-*.md phase-(N+1)-*.md` し、本体見出し
  `# Phase N` を更新する。
- **番号整合の全走査（cross-plan 含むリポジトリ全体）**: `git grep -n "Phase N"`（旧番号）を
  **計画ディレクトリに限定せず `git grep` をリポジトリ全体**に打ち、当該計画内だけでなく**他計画 doc・rule・
  skill・docs/harness からの cross-plan 参照**まで拾う。**表・mermaid だけでなく散文 bullet 中の素の phase 番号**
  （「全量投入（N）」等）と**完了済み phase doc の forward 参照**まで全 hit を追従する。新番号が旧テーマを
  誤指ししていないか逆方向も確認する（cross-plan dangling は learning #42 / #58 / #76 / #104 で反復）。
- **cross-plan move（phase を別計画群へ移す）**: `git mv` で移動し、本体見出し `# Phase N` を移動先番号へ更新。
  **移動元 README / OVERVIEW の索引から除去 + 移動注記**を残し、**移動先 README / OVERVIEW の構造記述
  （受け入れ基準 / 分割表 / 主鎖 / 総数）を必須更新**する。説明散文・**完了済み phase doc の forward 参照は
  凍結可**（[[harness-review]] checklist の「完了 phase forward 参照まで全 hit 追従」と整合・learning #90）。
- **README**: mermaid 依存グラフのノード・エッジと phase 一覧（チェックボックス + リンク）を更新し、各リンク先が
  **実在ファイルに解決**することを確認（`grep -oE '\./phase-[0-9]+-[a-z-]+\.md'` → 存在チェック）。
- **OVERVIEW**: phase 表の行追加 / 番号、直列チェーン記述、「全 N phase に分割」等の総数表記を更新する。
- **トップ `docs/plan/README.md`**: ロールアップ表の状況（計画が進行中なら 🚧 維持・分数は付けない）を確認。
- **ADR / rule への相対リンクは実ファイル存在を機械照合**する（`ls docs/adr/ | grep <NNNN>` 等で **slug を実体
  照合**）。手書きの ADR/rule 参照は slug 取り違えで dangling になりやすい（learning #42 / #58 / #76 反復）。

renumber を伴う plan PR は [[code-review]]（ハーネス資産は `harness-review`）でこの番号整合・リンク実在を
点検対象にする。

## やらないこと（再実装しない）

- 機械ゲート（型 / カバレッジ / Biome）は [[testing]] / [[tsc-verification]] / `.githooks/` の責務。
  計画化で再実装・再実行しない。
- レビュー観点は [[code-review]] の責務。
- `docs/harness/rules-index.md` は `paths` から生成される生成物。**手編集しない**（[[cross-agent]]）。

## 関連

- スキル本体: [`plans-new`](../skills/plans-new/SKILL.md)。
- 計画インデックス・全体進捗ロールアップ: [`docs/plan/README.md`](../../docs/plan/README.md)。
- テンプレート正本（OVERVIEW / README / phase doc 見出し）: [plan-templates.md](../skills/plans-new/references/plan-templates.md)。
- 着手・実装: [`start-phase`](../skills/start-phase/SKILL.md) / [[implementation-workflow]]。
- 決定の「なぜ」: [ADR 0020](../../docs/adr/0020-plans-new-entry-point.md)。
- 規約: [[skill-authoring]] / [[cross-agent]] / [[code-review]] / [[redaction]]。
