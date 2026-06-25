---
paths:
  - ".claude/skills/implementation-workflow/**"
description: implementation-workflow skill の詳細手順 SoT。1 本の PR の実装ライフサイクル（Phase 0〜9: worktree 作成 → 着手 → 実装+verify fix loop → セルフ検証 → Draft PR → 独立レビュー → auto-merge → レトロ → worktree 削除）の各フェーズの入出力・成功条件・失敗 fallback と不変条件（fix loop 上限3・Generator/Evaluator 独立・worktree Phase 0/9 ペア・auto-merge 委譲）を定める。implementation-workflow skill を読む / 動かすときに適用する。
---

# implementation-workflow — 実装ライフサイクル統合の詳細手順 SoT

[`implementation-workflow`](../skills/implementation-workflow/SKILL.md) skill が駆動する Phase 0〜9 の
**詳細手順の唯一の正本**。skill 本体（SKILL.md）は ≤500 行に収めるため概要に留め、各フェーズの
入出力・成功条件・失敗時 fallback・worktree 規律は本 rule に逃がす（progressive disclosure）。決定の
「なぜ」は [ADR 0018](../../docs/adr/0018-implementation-workflow-orchestrator.md)、役割分担・受け入れ基準は
[phase-11 doc](../../docs/roadmap/completed/00-harness-setup/phase-11-implementation-workflow.md) / [README](../../docs/roadmap/completed/00-harness-setup/README.md)（本 rule はそれらと二重記述しない）。

## 大原則: 実装は原則このワークフロー経由

**確定した Plan / Phase の実装は、原則すべて本 skill 経由で駆動する**（実装の標準エントリポイント）。
着手〜マージの繋ぎ方を都度判断してぶれるのを避け、定型化されたワークフローに統一する。例外は trivial な
単発編集や会話的応答のみ。

> **入口は [`plans-new`](../skills/plans-new/SKILL.md)**（[[planning]]）。生の実装指示はまず `plans-new` が
> OVERVIEW 化 → 6 基準で分割し、その**産出物（GitHub issue または `docs/roadmap/NN-{slug}/` の phase doc）を
> 本ワークフローが消費**して Phase 0〜9 を駆動する。計画化（1→多）は `plans-new`、1 本の PR の実装ライフ
> サイクルは本 skill、と役割を分ける（[ADR 0020](../../docs/adr/0020-plans-new-entry-point.md)）。

## 設計の核（なぜこの形か）

この skill は**既存 skill を束ねるオーケストレーター**であり、新規ロジックは最小に保つ。着手・実装・検証・
PR・レビュー・マージ・レトロ・後片付けの繋ぎ方をエージェントが都度判断すると手順がぶれるため。検証
（`pnpm verify`）・レビュー観点・ADR 採番・レトロ生成・README 進捗更新は**それぞれ専任 skill に委譲**し、
本 skill では**再実装しない**（[[skill-authoring]] の機械ゲート非再実装）。「**設置 ≠ 稼働**」: capstone ゆえ
依存は広いが、未整備の依存は前方参照で許容し、あるものから順に駆動する。

## 入力 / 出力

- **入力**: 対象 phase / plan の識別子（例 `phase-08` / `01-mvp/phase-1`）。任意で branch 名・effort。
- **出力**: 各フェーズの成功条件の充足状況、最終的に MERGED された PR の URL、生成された learning。
  途中で停止した場合は停止フェーズと理由（`blocked` 記録先）。

## フェーズ別 詳細手順（Phase 0〜9）

各フェーズは **成功条件を満たしてから次へ進む**。満たせない場合は当該フェーズの fallback に従う。
横断する不変条件は末尾「不変条件（まとめ）」に集約し、各フェーズはそれを参照する（二重記述しない）。

### Phase 0 — Worktree 作成 + main fetch

- **手順**: `git fetch origin main` → unstaged があれば `git stash push -u` →
  `git worktree add <abs-path> -b <branch> origin/main`。branch 名は命名規約（`<type>/<scope>-<purpose>`、
  [AGENTS.md](../../AGENTS.md) / [[cross-agent]]）に従い、worktree パスは**絶対パス**で扱う。worktree 作成後は
  **`pnpm install`**（git worktree は node_modules を共有しないため必須）。**`data/raw`（gitignore・PokeAPI
  キャッシュ）も worktree 間で共有されない**ため、`generate:data` で raw が要るデータ系作業では着手前に
  **`pnpm fetch:data` で `data/raw` を完全化してから** `generate` する（メイン側からの cp は取得済み種だけで
  部分的になりうる・全量の完全性が要るなら cp でなく `fetch:data`・learning #94 / #96）。`check:regulation` は
  参照整合 / schema のみで `data/raw` 非依存（ADR 0034 = ADR 0026 改訂・[[data-pipeline]]）。
- **成功条件**: 対象 branch が origin/main 起点で checkout 済み。
- **fallback**: 同名 worktree / branch があれば再利用（再作成しない）。stash は Phase 9 後に `git stash pop`。

### Phase 1 — 計画 / 設計 Read（start-phase に委譲）

- **手順**: [`start-phase <id>`](../skills/start-phase/SKILL.md) で対象 `docs/roadmap/.../phase-*.md`・依存・
  受け入れ基準・検証手順・関連 ADR / rule を読込・提示させる。
- **成功条件**: 受け入れ基準と検証手順を把握済み（以降の自己照合の基準）。
- **fallback**: 依存が未充足なら `start-phase` がブロック要因を提示する。前方参照で進める場合は
  「設置 ≠ 稼働」を理由に明示して続行可。

### Phase 2 — 整合性チェック

- **手順**: 受け入れ基準を `docs/design/` / 関連 rules / リポジトリ現状と突き合わせる。pokeform は
  SPEC/REQ 分離が無く **phase doc が基準**。相互参照（リンク・パス）の dangling がゼロになるよう設計する。
- **成功条件**: 整合レポート（基準と現状の差分・dangling 有無）が揃う。
- **fallback**: 完了済みタスクがあれば**現状に適応**し、失敗するコマンドを盲目的に再実行しない。

### Phase 3 — 実装 + 検証（fix loop・上限 3）

- **手順**: phase doc のタスクを実装 → [`verify`](../skills/verify/SKILL.md)（`pnpm verify` = `tsc --noEmit` /
  `vitest run --coverage` 閾値100% / `biome check .`）→ 赤なら最初の失敗箇所を修正して再実行。
- **成功条件**: `pnpm verify` が緑。
- **fallback**: fix loop は**上限 3 回**（不変条件）。超過で `blocked` 記録 + 人間通知して停止する。
- **注**: `pnpm verify` 未整備の段階（Phase 5 マージ前等）は手動検証（ファイル実在・参照解決・dangling
  ゼロ・記述整合）で代替する。

### Phase 4 — セルフ検証

- **手順**: redaction / secrets 混入なし（[[redaction]]）、cross-agent パリティ（canonical +
  symlink/copy 一致・[[cross-agent]]）、生成物（`src/generated/**` 等）への手編集なし、命名規約準拠、
  受け入れ基準の充足を点検する。あわせて次の doc 同期を点検（過去の doc-data 乖離の再発防止）:
  - **rule が正本（`src/` / 他 rule）を宣言しつつ数式・仕様を追記する場合、同一 PR で当該正本を
    同期しているか**。
  - phase doc に紐づく実装 PR で **README 進捗・doc 同期コミットを当該フィーチャー PR に同梱したか**
    （Phase 8「README 進捗・doc 同期の取り込み方」と対・オーケストレーター主導マージで進捗が main 未反映 /
    別 PR へ分離するのを防ぐ・learning #82 / #102）。
- **成功条件**: 規約違反ゼロ。
- **fallback**: scope 縮小指示が出たら `git reset --soft` でコミットを巻き直し scope を絞り直す。

### Phase 5 — Draft PR 作成（gh CLI・body-file 経由）

- **手順**: commit message を `/tmp/<prefix>-commit.txt`、PR body を `/tmp/<prefix>-pr.md` に `Write` →
  `git add -A && git commit -F /tmp/<prefix>-commit.txt`（Conventional Commits・フッタに `Co-Authored-By:`）→
  `git push -u origin <branch>` → `gh pr create --draft --base main --body-file /tmp/<prefix>-pr.md`。PR テンプレは
  `.github/PULL_REQUEST_TEMPLATE/<type>.md`（ハーネス改修は `harness.md`）を**複写してカスタマイズ**する。
- **成功条件**: PR URL を取得。
- **不変条件**: PR 操作は gh CLI、PR body / commit message は `/tmp` body-file 経由（heredoc 直送・
  `--template` と `--body-file` 同時指定は壊れやすく不定なので避ける）。

### Phase 6 — 独立レビュー（Evaluator・Generator から分離）

- **手順**: `Agent` ツールでレビュー skill を**独立サブエージェントとして起動**する。`src/**` / `scripts/**` の
  変更は [`code-review`](../skills/code-review/SKILL.md)、ハーネス資産（`.claude/**` / `AGENTS.md` /
  `CLAUDE.md` / `.githooks` / `docs/**`）は [`harness-review`](../skills/harness-review/SKILL.md)。両方含む PR は
  分担する。各レビュー skill は結果を **PR コメントとして残す**（`gh pr comment`）。
- **レビューコメント投稿の確認（不変条件）**: レビュー Agent 完了後、**`gh pr view <N> --comments` で
  レビュー結果の PR コメントが投稿済みであることを確認してから** Phase 7 へ進む。ブロッキングなしでも
  `✅ ブロッキングなし` のコメントを残す（レビュー実施の記録・[[code-review]] の出力先規約）。未投稿なら
  投稿させてから次へ進む（レビュー記録なしでマージされる死角の再発防止）。
- **成功条件**: `blocking` 指摘が 0 件、**かつレビュー結果の PR コメントが投稿済み**。
- **fallback**: blocking 指摘があれば Phase 3 へ戻って修正（**レビュー fix loop も上限 3 回**・不変条件）。
  累計超過で `blocked` 記録 + 人間通知。`non-blocking` / `nit` のみならマージを妨げない（健全性の純改善
  基準・[[code-review]]）。
- **不変条件（worker/orchestrator マージ同期点）**: ワーカーとオーケストレーターを分業する運用では、ワーカーは
  **レビュー fix を Draft 解除前に取り込んでから** `READY_FOR_MERGE` を**最終 HEAD SHA 付き**で報告し、
  オーケストレーターは**マージ対象がその SHA であることを照合**してからマージする（fix のマージ取りこぼし防止）。
  分業運用の詳細ノートは [worker-orchestration-notes](../skills/implementation-workflow/references/worker-orchestration-notes.md)。

### Phase 7 — マージ（auto-merge・Phase 3 のゲートに委譲）

- **手順**: レビュー待ち中の main 再進化を `gh pr view --json mergeable,mergeStateStatus` で検出し、必要なら
  `git rebase origin/main`（競合解決）→ `gh pr ready`（Draft 解除）→ **CI 緑 ＋ ブロッキング指摘なしで
  `gh pr merge --auto --merge`**（通常マージ = merge commit）。
- **成功条件**: PR が auto-merge 予約済み / MERGED。
- **不変条件（auto-merge 委譲）**: マージ可否ゲートは [ADR 0017](../../docs/adr/0017-semantic-code-review-skills.md)
  / [[code-review]] の auto-merge に**委譲**する。独自のマージ規約（独自「auto-merge 禁止」や人間 approve
  必須型）を**導入しない**。Phase 3 のゲートを見直す場合は本 rule と Phase 3 を**同時更新**する。

### Phase 8 — マージ後処理（finish-phase + pr-retrospective に委譲）

- **手順**: [`finish-phase <id>`](../skills/finish-phase/SKILL.md)（`verify` 再実行・受け入れ基準照合・
  `docs/roadmap` README 進捗更新・アーキ決定があれば [`adr-new`](../skills/adr-new/SKILL.md) を促す）→
  [`pr-retrospective <PR#>`](../skills/pr-retrospective/SKILL.md)（KPT learning 生成・[[retrospective-format]]）。
- **成功条件**: README 進捗が更新され、learning が生成済み。
- **不変条件**: ADR 採番・レトロ生成・README 更新は各専任 skill の責務。本 skill は**起動・委譲のみ**で
  再実装しない（idempotent: 既に `- [x]` / learning 有りなら二重実行しない）。
- **進捗更新の二層（finish-phase に委譲）**: README 進捗は **(a) サブ README の対象 phase チェック**
  （`- [ ]`→`- [x]`）に加え、計画の状況が変わったとき **(b) トップ `docs/roadmap/README.md` の status
  ロールアップ表**（🚧 進行中 / ✅ 完了・分数は付けない）も更新する（いずれも `finish-phase` 手順 4 の責務）。
- **README 進捗・doc 同期の取り込み方**: 進捗・doc 同期コミットは**フィーチャー PR に同梱してからマージ**するか
  別 follow-up PR に切り出す（オーケストレーター主導マージで同期が main 未反映になるのを防ぐ）。ただし
  **`docs/roadmap` の phase doc に紐づかない単発ハーネス PR は finish-phase の README 進捗更新をスキップ可**。

### Phase 9 — Worktree 削除（Phase 0 とペア）

- **手順**: `gh pr view --json state,mergedAt` で **MERGED を確認**してから `git worktree remove <abs-path>` +
  `git branch -d <branch>`（失敗時のみ `-D`）。Phase 0 で stash した変更があれば `git stash pop` で復帰させる。
- **成功条件**: worktree / branch が削除済み。
- **fallback（不変条件）**: **未マージなら強制削除しない**（停止して人間へ通知）。MERGED 確認前の
  `git worktree remove --force` / `git branch -D` は禁止（作業消失リスク）。

## 不変条件（まとめ）

各フェーズが参照する横断不変条件の集約。**ここが唯一の正本**で、各フェーズは再説明しない:

- **fix loop 上限 3**: 実装+`pnpm verify`（Phase 3）/ レビュー blocking 修正（Phase 6）は各々上限 3 回。
  累計超過で対象 plan / phase doc に `blocked` を記録し人間へ通知して停止する（無理に進めない）。
- **Generator / Evaluator 独立**: 実装（本 skill = Generator）と評価（`code-review` / `harness-review` =
  Evaluator）を分離。Phase 6 は `Agent` でレビュー skill を独立起動し、自己採点で代替しない。
- **gh CLI / body-file 経由**: PR 操作は gh CLI、PR body・commit message は `/tmp` body-file 経由。
  heredoc 直送・`--template` と `--body-file` 同時指定を避ける。
- **worktree 規律**: 絶対パス・Phase 0 冒頭で `git fetch origin main`・unstaged は `git stash push -u`・
  **Phase 0 と Phase 9 はペア**・未マージ時は強制削除しない。
- **auto-merge 委譲**: マージゲートは Phase 3（ADR 0017）に委譲。独自マージ規約を導入しない。

## ワーカー分業（worker/orchestrator split・任意）

実装を別ワーカーに委ねて本ワークフローを駆動する側がオーケストレーターになる分業の運用ノート（編集分割・
権限モード・進捗検知・Read 優先・マージ同期点）と、取り込まない多段ワークフロー機構は
[worker-orchestration-notes](../skills/implementation-workflow/references/worker-orchestration-notes.md) に逃がす
（progressive disclosure）。本分業は機構でなく**委譲の作法**であり、特定の端末多重化ツールに依存しない。

## 関連

- skill 本体: [`implementation-workflow`](../skills/implementation-workflow/SKILL.md)。
- 委譲先 skill: [`start-phase`](../skills/start-phase/SKILL.md) / [`verify`](../skills/verify/SKILL.md) /
  [`code-review`](../skills/code-review/SKILL.md) / [`harness-review`](../skills/harness-review/SKILL.md) /
  [`finish-phase`](../skills/finish-phase/SKILL.md) / [`adr-new`](../skills/adr-new/SKILL.md) /
  [`pr-retrospective`](../skills/pr-retrospective/SKILL.md)。
- 決定の「なぜ」: [ADR 0018](../../docs/adr/0018-implementation-workflow-orchestrator.md) /
  マージゲート [ADR 0017](../../docs/adr/0017-semantic-code-review-skills.md)。
- 規約: [[skill-authoring]] / [[cross-agent]] / [[code-review]] / [[retrospective-format]] / [[redaction]]。
