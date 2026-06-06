# Architecture Decision Records (ADR)

pokeform の重要なアーキテクチャ決定を**不変の連番ログ**として記録する場所です。広く確立された Markdown ADR 形式を採用しています。

> **ADR は「なぜ」を記録する。** 仕様の詳細（What / How）の正本は `docs/plan/01-mvp/architecture.md` と `.claude/rules/*` であり、ADR はそこへ参照を張って二重記述を避けます。ADR が記録するのは「なぜその決定に至ったか・何を捨てたか（Why）」です。

## いつ書くか

**技術選定・パターンの採用・不可逆なトレードオフ**を伴う決定をしたら ADR を残します。例: ライブラリ/ツールの選定、データ表現の型パターン、検証ゲートの置き場所、クロスエージェント方針など。逆に、可逆で局所的な実装判断や、既存 rule で完結する些末な選択は ADR にしません。判断基準は `.claude/rules/adr.md` を参照。

## ファイルと採番

- 形式: `docs/adr/NNNN-<slug>.md`（`NNNN` は 4 桁ゼロ詰めの連番、`<slug>` は kebab-case の要約）。
- 採番: 既存の最大連番 + 1。連番は**飛ばさず・再利用しない**。
- 雛形: [`template.md`](./template.md)（`# NNNN. <タイトル>` / Status / Context / Decision / Consequences / 任意の Considered Options）。
- 新規作成は `adr-new "<タイトル>"` skill で行う（採番・slug 化・雛形展開を自動化）。手書きで起こさない。

## Status のライフサイクル

| Status | 意味 |
|---|---|
| `Proposed` | 提案中（議論・レビュー段階） |
| `Accepted` | 採用・有効 |
| `Deprecated` | 非推奨（後継 ADR なしに撤回） |
| `Superseded by ADR-NNNN` | 後継 ADR に置き換えられた |

## supersede（決定を覆す）手順

**Accepted の ADR は本文を書き換えません。** 決定を覆す場合は:

1. `adr-new "<新しい決定>"` で新 ADR（`MMMM`）を作成し、Context に「ADR-NNNN を見直す」経緯を書く。
2. 旧 ADR（`NNNN`）の **Status のみ** を `Superseded by ADR-MMMM` に更新する（本文は書き換えず、必要なら末尾に追記のみ）。
3. 新 ADR の Decision / Consequences で、何がどう変わったかを記す。

これにより「いつ・なぜ方針が変わったか」の履歴が連番ログとして連続します。`adr-new` の supersede フローもこの手順に従います。

## ADR 一覧

| # | タイトル | Status |
|---|---|---|
| [0001](./0001-record-architecture-decisions.md) | アーキテクチャ決定を ADR として記録する | Accepted |
| [0002](./0002-tsc-only-verification.md) | 型チェックは tsc のみで行う（Zod 等の実行時バリデーションを採用しない） | Accepted |
| [0003](./0003-species-dex-pattern.md) | 種族・技・タイプ・特性・持ち物を `XxxBase` + `XxxDex` パターンで統一し、種族粒度で表現する | Accepted |
| [0004](./0004-vendor-pokeapi-data.md) | PokeAPI データは vendor 方式で生成・コミットする | Accepted |
| [0005](./0005-git-hooks-over-claude-hooks.md) | 強制ゲートは Claude hooks ではなく Git ネイティブフックに置く | Accepted |
| [0006](./0006-pin-toolchain-and-dockerize.md) | ツールチェーンのバージョンをピン留めし、dev/CI 用に Docker 化する | Accepted |
| [0007](./0007-yaml-lang-per-file.md) | YAML / Markdown 入力の記述言語をファイル単位の `lang` 宣言で固定する | Accepted |
| [0008](./0008-kpt-retrospective-loop.md) | PR ごとに KPT レトロを行い、学びをハーネスへ書き戻すループを採用する | Accepted |
| [0009](./0009-cross-agent-shared-harness.md) | ハーネスを Claude Code / Codex 両対応で共有する（AGENTS.md SoT + skill symlink + Git hooks） | Accepted |
| [0010](./0010-semantic-code-review-skills.md) | PR マージ前の意味的レビューを `code-review` / `harness-review` の 2 skill に分割し、CI 緑 + 承認で auto-merge する | Accepted |
| [0011](./0011-implementation-workflow-orchestrator.md) | 実装ライフサイクルを多段フェーズで統合する `implementation-workflow` skill を置く | Accepted |
| [0012](./0012-skill-creation-via-skill-creator.md) | skill の新規作成・改修は `skill-creator` skill の利用を必須化する | Accepted |

> 一覧は ADR 追加・Status 変更のたびに更新します。`adr-new` は新規 ADR をこの表に追記します。
