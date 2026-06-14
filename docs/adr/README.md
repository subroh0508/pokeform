# Architecture Decision Records (ADR)

pokeform の重要なアーキテクチャ決定を**不変の連番ログ**として記録する場所です。広く確立された Markdown ADR 形式を採用しています。

> **ADR は「なぜ」を記録する。** 仕様の詳細（What / How）の正本は `docs/plan/01-mvp/architecture.md` と `.claude/rules/*` であり、ADR はそこへ参照を張って二重記述を避けます。ADR が記録するのは「なぜその決定に至ったか・何を捨てたか（Why）」です。

## いつ書くか

**技術選定・パターンの採用・不可逆なトレードオフ**を伴う決定をしたら ADR を残します。例: ライブラリ/ツールの選定、データ表現の型パターン、検証ゲートの置き場所、クロスエージェント方針など。逆に、可逆で局所的な実装判断や、既存 rule で完結する些末な選択は ADR にしません。判断基準は `.claude/rules/adr.md` を参照。

## ファイルと採番

- 形式: `docs/adr/NNNN-<slug>.md`（`NNNN` は 4 桁ゼロ詰めの連番、`<slug>` は kebab-case の要約）。
- 採番: **アクティブ（`docs/adr/*.md`）+ `docs/adr/archive/*.md` の最大連番 + 1**。連番は原則**飛ばさず・再利用しない**（archive へ退避した番号も retired。ブートストラップ期に未参照のまま撤回した番号のみ例外的に再利用可。詳細は `.claude/rules/adr.md`）。
- **アーカイブ**: `Superseded` / `Deprecated` になった ADR は `docs/adr/archive/` へ `git mv` で退避し、アクティブな `docs/adr/*.md` は「現行の決定」だけに保つ（下記「アーカイブ」節）。
- 雛形: [`template.md`](./template.md)。**`id`（番号）/ `status` / `date` は YAML frontmatter**、本文は `# NNNN. <タイトル>` / Context / Decision / Consequences / 任意の **Alternatives Considered**。`id` はファイル名の `NNNN` と一致させる。
- 新規作成は `adr-new "<タイトル>"` skill で行う（採番・slug 化・雛形展開を自動化）。手書きで起こさない。

## Status のライフサイクル

| Status | 意味 |
|---|---|
| `Proposed` | 提案中（議論・レビュー段階） |
| `Accepted` | 採用・有効 |
| `Deprecated` | 非推奨（後継 ADR なしに撤回） |
| `Superseded by ADR-NNNN` | 後継 ADR に置き換えられた |

> 1 つの ADR を複数の後継に**分割**して置き換える場合は、範囲表記 `Superseded by ADR-MMMM〜NNNN`（または `ADR-MMMM, ADR-PPPP, ...`）を使ってよい。

## supersede（決定を覆す）手順

**Accepted の ADR は本文を書き換えません。** 決定を覆す場合は:

1. `adr-new "<新しい決定>"` で新 ADR（`MMMM`）を作成し、Context に「ADR-NNNN を見直す」経緯を書く。
2. 旧 ADR（`NNNN`）の **frontmatter `status` フィールドのみ** を `Superseded by ADR-MMMM` に更新する（本文は書き換えず、必要なら末尾に追記のみ）。
3. 旧 ADR を **`docs/adr/archive/` へ `git mv`** で退避し、アクティブ一覧表から外して「アーカイブ」節へ移す。
4. 新 ADR の Decision / Consequences で、何がどう変わったかを記す。

これにより「いつ・なぜ方針が変わったか」の履歴が連番ログとして連続し、アクティブ一覧は現行の決定だけになります。`adr-new` の supersede フローもこの手順に従います。

## ADR 一覧

| # | タイトル | Status |
|---|---|---|
| [0001](./0001-record-architecture-decisions.md) | アーキテクチャ決定を ADR として記録する | Accepted |
| [0003](./0003-typescript-language.md) | プログラミング言語に TypeScript を採用する | Accepted |
| [0004](./0004-nodejs-runtime.md) | ランタイムに Node.js を採用する | Accepted |
| [0005](./0005-pnpm-package-manager.md) | パッケージ管理に pnpm を採用する（corepack に依存しない） | Accepted |
| [0006](./0006-vitest-test-runner.md) | テストランナーに Vitest を採用する | Accepted |
| [0007](./0007-biome-linter.md) | Linter / Formatter に Biome を採用する | Accepted |
| [0008](./0008-toolchain-version-source-of-truth.md) | ツールチェーンのバージョンは package.json / lockfile / .node-version を唯一の情報源とし、メジャー含め最新追従する | Accepted |
| [0009](./0009-dockerize-dev-ci.md) | dev / CI 用に Docker 化する | Accepted |
| [0010](./0010-tsc-only-verification.md) | 型チェックは tsc のみで行う（Zod 等の実行時バリデーションを採用しない） | Accepted |
| [0011](./0011-species-dex-pattern.md) | 種族・技・タイプ・特性・持ち物を `XxxBase` + `XxxDex` パターンで統一し、種族粒度で表現する | Accepted |
| [0012](./0012-vendor-pokeapi-data.md) | PokeAPI データは vendor 方式で生成・コミットする | Accepted |
| [0013](./0013-git-hooks-over-claude-hooks.md) | 強制ゲートは Claude hooks ではなく Git ネイティブフックに置く | Accepted |
| [0014](./0014-yaml-lang-per-file.md) | YAML / Markdown 入力の記述言語をファイル単位の `lang` 宣言で固定する | Accepted |
| [0015](./0015-kpt-retrospective-loop.md) | PR ごとに KPT レトロを行い、学びをハーネスへ書き戻すループを採用する | Accepted |
| [0016](./0016-cross-agent-shared-harness.md) | ハーネスを Claude Code / Codex 両対応で共有する（AGENTS.md SoT + skill symlink + Git hooks） | Accepted |
| [0017](./0017-semantic-code-review-skills.md) | PR マージ前の意味的レビューを `code-review` / `harness-review` の 2 skill に分割し、CI 緑 + 承認で auto-merge する | Accepted |
| [0018](./0018-implementation-workflow-orchestrator.md) | 実装は原則 `implementation-workflow` skill 経由で駆動する（多段フェーズで統合） | Accepted |
| [0019](./0019-branded-error-types-and-source-mapping.md) | ブランドエラー型 + `@source` 逆引きで tsc 診断を可読化する | Accepted |
| [0020](./0020-plans-new-entry-point.md) | 実装の入口を計画分解スキル（plans-new）に一本化する | Accepted |
| [0021](./0021-per-regulation-species-and-legality.md) | レギュレーション解禁と種族型を per-regulation に一本化する | Accepted |
| [0022](./0022-per-regulation-species-keyed-moves.md) | per-regulation の技記録を species-keyed の明示記録にし generate を変換専任へ寄せる | Accepted |
| [0023](./0023-generate-transformer-and-check-regulation.md) | generate を変換専任にしレギュレーション妥当性検証を authoring 時ゲート check:regulation へ移設する | Accepted |
| [0024](./0024-mega-moves-inherit-base.md) | メガ先種族の per-reg moves は base 種族の per-reg moves を継承する | Accepted |
| [0025](./0025-catalog-name-and-type-chart-sot.md) | 名前 / タイプ相性の SoT を catalog YAML へ移し abilities / items 生成 dex を id-only 化する | Accepted |
| [0026](./0026-pokeapi-not-champions-legality-source.md) | PokeAPI を Champions レギュレーション情報・技威力の信頼源にしない | Accepted |
| [0027](./0027-structural-data-catalog-sot.md) | 構造データ（種族値 / タイプ / 特性 / 図鑑番号 / category）の SoT を catalog YAML へ移し generate を raw 非依存にする（materialize 新設・overrides 廃止・取得元 PokeAPI 維持） | Accepted |
| [0028](./0028-data-yaml-block-style-gate.md) | data YAML はブロックスタイルを CI ゲート（check:yaml-style・AST ベース）で強制する（tsc-only 検証の例外＝スタイル lint） | Accepted |
| [0029](./0029-term-rename-edit-exception.md) | 用語 rename（決定本質不変の表記言い換え）を ADR 本文の整備例外として許可する | Accepted |
| [0030](./0030-data-champions-skill-authored.md) | data/champions は skill 著述で維持し人間が直接編集しない（統一用語 skill-authored・rules.yaml は AI 直接指示・強制は規約レベル） | Accepted |
| [0032](./0032-japanese-name-source-pokeapi-names.md) | 日本語名の取得元を PokeAPI names（ja-Hrkt）に定める（materialize 転記・catalog SoT 不変・技メタは ADR 0026 不変） | Accepted |
| [0033](./0033-deterministic-mega-auto-authoring.md) | Serebii メガ関連データを決定論で自動著述する（megaLinks / メガ先種族 / per-reg mega / megaSpecies・Primal は escalation・ADR 0031 のメガ手動 linking を supersede） | Accepted |

> 一覧は ADR 追加・Status 変更のたびに更新します。`adr-new` は新規 ADR をこの表に追記します。

## アーカイブ

`Superseded` / `Deprecated` になった ADR は [`archive/`](./archive/) へ退避します（本文は当時の記録として不変）。

| # | タイトル | Status |
|---|---|---|
| [0002](./archive/0002-pin-toolchain-and-dockerize.md) | ツールチェーンのバージョンをピン留めし、dev/CI 用に Docker 化する | Superseded by ADR-0003〜0009 |
| [0031](./archive/0031-deterministic-serebii-scraper-hybrid-layers.md) | Champions 解禁データ取得を決定論スクレイパー + ハイブリッド3層へ刷新する（cheerio・層分離・層2-3 は Workflow・0026/0027 補完） | Superseded by ADR-0033 |
