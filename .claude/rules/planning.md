---
paths:
  - "docs/roadmap/**"
description: 実装指示を計画へ落とす手順の SoT。生の指示は必ず `plans-new` スキルを入口に通し、まず OVERVIEW（ゴール / 背景 / 設計方針 / 実装指針 / スコープ外）を作ってから 6 基準（意思決定の数 / 不可逆性 / スコープの広さ / 技術的難易度 / 想定 diff ~500行目安・>1000行は積極分割 / 並行実装のしやすさ）で 1 phase = 1 PR に分割する。1 PR 妥当なら GitHub issue + implementation-workflow、複数なら docs/roadmap/NN-{slug} 計画群を起こす。docs/roadmap/** を作る / 編集する・新しい計画群やテーマを起こすときに適用する。
---

# planning — 実装指示を計画へ落とす手順の SoT

生の実装指示・機能要望を、実装可能な phase（1 phase = 1 PR）へ分解する手順の**唯一の正本**。スキル本体（[`plans-new`](../skills/plans-new/SKILL.md)）は手順の駆動に専念し、各ステージの基準と判断は本 rule に集約する（二重記述を避ける）。決定の「なぜ」は [ADR 0020](../../docs/adr/0020-plans-new-entry-point.md)。

## 大原則 — 実装指示は `plans-new` を入口に通す

**確定していない生の実装指示・機能要望（「〜を実装したい」「次はこれを作る」）を受けたら、着手の前に必ず [`plans-new`](../skills/plans-new/SKILL.md) を一度経由する**。プロンプトで直に実装に入ると着手・分割の粒度がエージェントごと・回ごとにぶれ、OVERVIEW を飛ばして巨大 PR を作る事故が起きるため。`plans-new` は `start-phase` / `implementation-workflow` の**手前の標準エントリポイント**で、計画化（指示 → OVERVIEW → 6 基準で分割）を定型化する。例外は trivial な単発編集や会話的応答のみ。実装の駆動（worktree〜マージ〜レトロ）は [[implementation-workflow]] の責務で、本 rule / `plans-new` は計画化に専念する（役割分担）。

## ステージ（plans-new が駆動する順序）

### 1. OVERVIEW を先に作る（順序厳守）

生の指示をブラッシュアップし、`docs/roadmap/NN-{slug}/OVERVIEW.md`（ゴール / 背景 / 設計方針 / 実装指針 / スコープ外）を作る。**必ず OVERVIEW を先に固めてから分割する**（何を実現するかが曖昧なまま phase を切ると粒度がぶれる）。1 PR 妥当そうでも、まず OVERVIEW 相当の整理を済ませてから 3 の分岐へ進む。

### 2. 6 基準で 1 phase = 1 PR に分割する

OVERVIEW を実現する作業を洗い出し、次の **6 基準**で評価して分割する。どれか 1 つでも「重い」側に振れたら分割を検討する（多面的に見るためのレンズ）。基準の運用詳細・判断例は [`plans-new` の references/split-criteria.md](../skills/plans-new/references/split-criteria.md)。

1. **意思決定の数** — 独立した設計判断が複数混在するか。
2. **不可逆性** — 不可逆な決定（データ形式・公開 API・スキーマ）を複数含むか。
3. **スコープの広さ** — 複数レイヤ（types / domain / io / cli）を横断するか。
4. **技術的難易度** — 難所が複数あるか。
5. **想定 diff** — **~500 行が目安、>1000 行は積極的に分割**。ただしデータセット追加など意味ある粒度での分割が困難なケースは例外として 1 PR を許容し、**理由を OVERVIEW / issue に明記**する（行数だけで機械的に切らず意味的完結性を優先）。
6. **並行実装のしやすさ** — 独立に並行で進められる塊に割れるか。

各 phase は「**単独でマージしても壊れない・レビュー可能・意味的に完結**」を満たすこと（[[code-review]] の健全性の純改善）。

### 3. 書き出し（2 分岐）

- **1 PR 妥当**: `docs/roadmap/NN-{slug}/` は**作らず**、OVERVIEW 相当を本文にした **GitHub issue**（`gh issue create --body-file`）を起票し、そのまま [[implementation-workflow]] をキックする。issue 本文は GitHub への書き出しゆえ**投稿前に [[redaction]] を適用**する。
- **複数 phase**: `docs/roadmap/NN-{slug}/` に `OVERVIEW.md`（ゴール / 背景 / 設計方針 / 実装指針 / スコープ外 / **計画群全体の受け入れ基準**）/ `README.md`（薄索引 = 導入 + OVERVIEW ポインタ + Mermaid 依存グラフ + phase 一覧の進捗チェック）/ `phase-NN-<slug>.md`×N を作る。**テンプレ・Phase doc 見出しの正本は [plan-templates.md](../skills/plans-new/references/plan-templates.md)**。トップ [`docs/roadmap/README.md`](../../docs/roadmap/README.md) の採番一覧・**全体進捗ロールアップ表**（計画 → 状況。新計画は `⬜ 未着手` で 1 行追加・分数は付けない）にも追記する。

### 4. 着手へ受け渡す

分割後、最初の phase を [`start-phase`](../skills/start-phase/SKILL.md) / [[implementation-workflow]] へ繋ぐ。`plans-new` は計画化までで停止し、実装駆動はそちらに委ねる。

## 採番 / slug 規約（正本は docs/roadmap/README.md）

- 計画ディレクトリ = `NN-<slug>/`（ゼロ埋め 2 桁連番 + kebab-case）。`NN` は `ls docs/roadmap/` の既存最大 + 1 を**機械的に**決める（記憶・推測で振らない）。
- phase doc = `phase-NN-<slug>.md`（ゼロ埋め 2 桁）。
- **事前スタブを作らない**。テーマが出るたびに内容から slug を都度生成して採番する。
- **各計画は OVERVIEW を入口に持つ**。既存計画も参考価値があれば OVERVIEW を遡及付与してよい（**00 は付与済み・01 は当面据え置き**で README 現状維持）。

## phase の insert / renumber 追従チェックリスト

既存計画に phase を**挿入**して後続を**繰り下げる**（例 旧 Phase N → N+1）ときは、番号参照が複数ファイルに散らばって**追従漏れ**が起きやすい（dangling リンク・散文の素の数字残りが過去 learning で反復・#70 / #76 / #50）。挿入・renumber を含む計画 doc PR は、書き出し後に次を**機械的に**確認する:

- **ファイル rename**: 繰り下げる phase doc を `git mv phase-NN-*.md phase-(N+1)-*.md` し、本体見出し `# Phase N` を更新する。
- **番号整合の全走査（cross-plan 含むリポジトリ全体）**: `git grep -n "Phase N"`（旧番号）を**計画ディレクトリに限定せずリポジトリ全体**に打ち、当該計画内だけでなく他計画 doc・rule・skill・docs/harness からの cross-plan 参照まで拾う。表・mermaid・リンクだけで満足せず、**導入散文・概要 / ゴール段落・bullet 中の素の phase 番号**（「全量投入（N）」等）と**完了済み phase doc の forward 参照**まで全 hit を追従し、新番号が旧テーマを誤指ししていないか逆方向も確認する。
- **cross-plan move（phase を別計画群へ移す）**: `git mv` で移動し本体見出し `# Phase N` を移動先番号へ更新。**移動元 README / OVERVIEW の索引から除去 + 移動注記**を残し、**移動先 README / OVERVIEW の構造記述（受け入れ基準 / 分割表 / 主鎖 / 総数）を必須更新**する。説明散文・**完了済み phase doc の forward 参照は凍結可**（[[harness-review]] checklist の「完了 phase forward 参照まで全 hit 追従」と整合・learning #90）。**ただし renumber で同一番号が別 phase を誤指しするようになった場合は凍結せず是正する**（凍結は「番号が指すテーマが不変」が前提・誤指しは dangling と同じ扱い）。
- **移動 / 廃止した phase 番号を別テーマで再利用しない**（予防）: cross-plan move や廃止で空いた番号は**再利用せず末尾連番で採番**する。空き番号に別テーマを充てると、過去の散文・完了 doc・cross-plan 参照が指す「番号 → テーマ」対応が 2 義化し、上記の誤指し是正コストを毎回生む。
- **README**: mermaid 依存グラフのノード・エッジと phase 一覧（チェックボックス + リンク）を更新し、各リンク先が**実在ファイルに解決**することを確認（`grep -oE '\./phase-[0-9]+-[a-z-]+\.md'` → 存在チェック）。
- **OVERVIEW**: phase 表の行追加 / 番号、直列チェーン記述、「全 N phase に分割」等の総数表記を更新する。
- **トップ `docs/roadmap/README.md`**: ロールアップ表の状況（計画が進行中なら 🚧 維持・分数は付けない）を確認。
- **ADR / rule への参照は実ファイル存在を機械照合**する（`ls docs/adr/ | grep <NNNN>` 等で **slug を実体照合**）。**インライン相対リンクだけでなく reference 式リンク定義（`[ADR NNNN]: ./....md`）・素の番号参照**も走査対象に含める（手書きの ADR/rule 参照は slug 取り違えで dangling になりやすい）。

cross-plan dangling・番号誤指しは learning #42 / #58 / #76 / #104 / #118 / #122 / #137 で反復している。renumber を伴う plan PR は [[code-review]]（ハーネス資産は `harness-review`）でこの番号整合・リンク実在を点検対象にする。

## 計画群完了時の `completed/` 集約（移動 + 参照追従チェックリスト）

計画群の**全 phase が完了**したら、その計画ディレクトリを `docs/roadmap/<NN>-<slug>` から **`docs/roadmap/completed/<NN>-<slug>` へ集約**する（active と完了を一目で分離する運用。正本は [`docs/roadmap/README.md`](../../docs/roadmap/README.md) の「`completed/` 運用」）。個別 phase 完了では動かさず、全完了時にまとめて移す。移動は plan ディレクトリが **1 階層深くなる** rename なので、cross-plan move と同じ網羅性で参照を追従する:

- **移動**: `git mv docs/roadmap/<NN>-<slug> docs/roadmap/completed/<NN>-<slug>`。**番号は維持**（再採番しない・空き番号も再利用しない）。
- **inbound 参照（リポジトリ全体）**: `git grep -n 'docs/roadmap/<NN>-<slug>'` をリポジトリ全体に打ち、rule / skill / ADR / AGENTS.md / 他計画 doc からの参照を **`docs/roadmap/completed/<NN>-<slug>` へ追従**する。**インライン相対リンク・reference 式リンク定義（`[..]: ../...`）・素のパス参照**を全走査し dangling ゼロを確認。
- **移動した plan doc 内の相対リンク**: 1 階層深くなるため、plan ディレクトリ外を指す相対リンク（`../../adr/` / `../../design/` / `../../../.claude/` / active 計画 `../<NN>-` 等）は**深度を +1 補正**する。完了 sibling 同士（`completed/` 内の `../<other-NN>-`）は不変。
- **凍結対象**: learnings / archive ADR の歴史言及、および移動する完了 plan doc 自身の**散文 path 言及（履歴記述）は不変**（リンクの深度補正のみ行い、prose は falsify しない）。
- **README / ロールアップ**: トップ [`docs/roadmap/README.md`](../../docs/roadmap/README.md) のロールアップ表リンクを `completed/` パスへ更新し、status を ✅ 完了に。

この集約は `finish-phase` が plan 全 phase 完了を検知して促す。完了判定・移動の手順 SoT は本節、運用の入口は `docs/roadmap/README.md`。

## 完了済み plan の決定を後続 PR が覆すとき（supersede 追補）

完了済み phase の決定（確定仕様・採用機構）を後続の fix / 別 PR が**覆した / 作り直した**ときは、当該 plan の `OVERVIEW.md` / `README.md` / 該当 phase doc の現状事実記述に **supersede 追補（「Phase N の決定は PR #M で見直し・現行 SoT は <rule / src> を参照」）を残す**（item legality が #145→#147→#149 と 3 度変遷した実例で反復）。plan doc は mutable WIP だが完了 phase の記述が**現状事実として読まれる**ため、正本 rule を直しても plan doc が旧モデルのまま残ると将来の参照源として誤誘導になる。

- **正本（rule / `src/`）の更新が最優先**。plan doc 追補はその次（mutable doc の鮮度維持）。
- 完了 phase doc の**本文は歴史記録として凍結可**だが、決定が覆ったことの**前方ポインタ（追補注記）**は残す。
- ADR で決定したことの supersede は [[adr]] の手順（新 ADR + `status` + archive 退避）に従う（plan doc 追補とは別系統）。

## やらないこと（再実装しない）

- 機械ゲート（型 / カバレッジ / Biome）は [[testing]] / [[tsc-verification]] / `.githooks/` の責務。計画化で再実装・再実行しない。
- レビュー観点は [[code-review]] の責務。
- `docs/harness/rules-index.md` は `paths` から生成される生成物。**手編集しない**（[[cross-agent]]）。

## 関連

- スキル本体: [`plans-new`](../skills/plans-new/SKILL.md)。
- 計画インデックス・全体進捗ロールアップ: [`docs/roadmap/README.md`](../../docs/roadmap/README.md)。
- テンプレート正本（OVERVIEW / README / phase doc 見出し）: [plan-templates.md](../skills/plans-new/references/plan-templates.md)。
- 着手・実装: [`start-phase`](../skills/start-phase/SKILL.md) / [[implementation-workflow]]。
- 決定の「なぜ」: [ADR 0020](../../docs/adr/0020-plans-new-entry-point.md)。
- 規約: [[skill-authoring]] / [[cross-agent]] / [[code-review]] / [[redaction]]。
