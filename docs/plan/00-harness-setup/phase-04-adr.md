# Phase 4 — ADR（アーキテクチャ決定記録）の仕組み

## 目的 / スコープ

重要なアーキ決定を**不変の連番ログ**として残し、「なぜそう決めたか」を後から辿れるようにする。広く確立された Markdown ADR 形式を採用し、汎用運用に限定する（特定の社内事情に依存しない）。

**早期に確立する理由**: ADR の仕掛け（template・rule・skill）を先に用意しておけば、以降の各ハーネスフェーズ（Docker・Git hooks 採用・ツールチェーンピン留め等）で**決定をその場で ADR 化**でき、最後にまとめてバックフィルする必要がなくなる（「決めてから作る」の流れ）。

## 前提（依存）

- Phase 1（`docs/` 構造 + `architecture.md` の場所）。本フェーズで `adr.md` rule も作成するため、rules フェーズ（Phase 7）には依存しない。

## タスク

- [ ] `docs/adr/template.md`: frontmatter（**id** / **status**: Proposed | Accepted | Deprecated | Superseded by ADR-NNNN / **date**）/ 見出し `# NNNN. <タイトル>` / **Context** / **Decision** / **Consequences**（良い点・悪い点・トレードオフ）/（任意）**Alternatives Considered**
- [ ] `docs/adr/README.md`: 運用ガイド（いつ書くか・採番・supersede 手順）と ADR 一覧
- [ ] **rule `.claude/rules/adr.md`**（paths なし=常時ロード）: 「**技術選定・パターン・不可逆なトレードオフ**を伴う決定をしたら ADR を残す」方針・採番/supersede 手順・`adr-new` skill 案内。※ Phase 7（rules）はこの adr.md を**再作成しない**（本フェーズが正）。
- [ ] `.claude/skills/adr-new/SKILL.md`（canonical・引数: タイトル）+ `.agents/skills/adr-new` symlink（クロスエージェント共有・`skill-creator` skill を使って作成、`skill-authoring.md`／`cross-agent.md`／Phase 7）:
  - frontmatter: `description`（trigger 明示）、`allowed-tools: Read Write Bash(ls *)`
  - 手順: `docs/adr/` の最大連番+1 を採番 → `template.md` から `NNNN-<slug>.md` を生成 → Context/Decision/Consequences を対話で記入 → Status 設定。supersede 時は旧 ADR の Status を `Superseded by ADR-NNNN` に更新（旧本文は書き換えず追記のみ）
- [ ] **初期 ADR のバックフィル**（本文は `architecture.md` の決定を要約・参照し二重記述を避ける）:
  - [ ] `0001-record-architecture-decisions`（ADR を残すこと自体）
  - [ ] `0010-tsc-only-verification`（Zod 不採用・tsc のみ検証）
  - [ ] `0011-species-dex-pattern`（`XxxBase`+`XxxDex` 統一・種族粒度）
  - [ ] `0012-vendor-pokeapi-data`（生成データの vendor）
  - [ ] `0013-git-hooks-over-claude-hooks`（強制ゲートを Git ネイティブに）
  - （分割・archive）`0002-pin-toolchain-and-dockerize`: ツールチェーン固定 + Docker を 1 つに混載していたため、要素別 ADR（`0003`〜`0009`）へ**分割し supersede**、`docs/adr/archive/` へ退避。具体バージョンは ADR に書かず SoT（package.json/.node-version）に集約（`0008`）、メジャー含め追従。corepack 依存も撤去（`0005`）。
  - [ ] `0014-yaml-lang-per-file`（YAML の言語をファイル単位 `lang` 宣言）
  - [ ] `0015-kpt-retrospective-loop`（PR ごと KPT レトロ→ハーネス書き戻しループ採用、Phase 2）
  - [ ] `0016-cross-agent-shared-harness`（AGENTS.md=指示 SoT + `@import` / スキル symlink 共有 / Git hooks ゲート。Claude+Codex 両対応）
  - [ ] `0017-semantic-code-review-skills`（PR merge 前の意味的レビューを `code-review`/`harness-review` の 2 skill に分割 + CI 緑＋承認で auto-merge。Phase 3）
  - [ ] `0018-implementation-workflow-orchestrator`（実装は原則 `implementation-workflow` skill 経由で駆動する。既存 skill を再利用、マージは Phase 3 の auto-merge と整合、worktree で並走を物理分離。Phase 11）
  - （撤回）`skill-creation-via-skill-creator`: skill-creator 必須化の規約は `.claude/rules/skill-authoring.md` で完結するため ADR 化を撤回・削除した。割り当てていた番号は未参照のまま撤回したため後続 ADR が再利用済み。

## 受け入れ基準

- `docs/adr/` に `template.md`・`README.md` と初期 ADR 群（`0001`〜）が存在する。
- `adr-new "<タイトル>"` が次番号を採番して新規 ADR を生成できる。
- 各 ADR が `architecture.md` の決定と整合（二重記述なし）。

## 検証手順

1. `adr-new "テスト決定"` → `docs/adr/00NN-test-decision.md` が template から採番生成されることを確認。
2. supersede フロー（旧 ADR の Status 更新 + 新 ADR 作成）を 1 件試す。

## リスク・備考

- Accepted の ADR は**書き換えない**。覆す場合は新 ADR + 旧 Status 更新（追記のみ）。
- ADR は決定の「なぜ」を記録する場。仕様の詳細は rules / architecture.md が正本で、ADR から参照する。
