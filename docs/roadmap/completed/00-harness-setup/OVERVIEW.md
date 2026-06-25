# 00-harness-setup — ハーネス環境整備 OVERVIEW

## ゴール

pokeform をコーディングエージェント（**Claude Code / Codex 両対応**）が**繰り返し・信頼性高く**実装して
いくための土台が動作している状態。各フェーズが「緑のゲート（型 OK / テスト100% / Lint OK）」を通って初めて
次へ進む、自己検証的な開発フローの基盤を用意する。ライブラリ本体のロジックは書かず、**以降の全フェーズを
駆動するハーネス**（共有指示 SoT `AGENTS.md`・ツールチェーン・rules・skills・検証ゲート・進捗ドキュメント・
ADR・レトロスペクティブ改良ループ）を整える。

## 背景 / 動機

エージェントが実装を駆動するには、着手・実装・検証・レビュー・マージ・記録の繋ぎ方を毎回判断させず、
**機械的に検証しながら前進できる土台**が要る。Claude Code と Codex の 2 ツールで運用するため、指示・規約・
skill・ゲートを各ツール固有の場所に二重管理するとドリフトする。そこで**共有ファイル（`AGENTS.md` / canonical
SKILL.md + symlink / Git hooks）を 1 箇所の SoT**にして、両ツールが同じ実体を参照する構成を最初に固める。

## 設計方針

### ハーネスの役割分担

| 機構 | 置き場所 | 役割 | 強制力 |
|---|---|---|---|
| 指示 SoT | `AGENTS.md`（Codex ネイティブ / Claude は `CLAUDE.md`→`@AGENTS.md`） | 両ツール共有の指示・規約要約・索引ポインタ | 提案的 |
| rules | `.claude/rules/*`（Claude paths 自動） + `docs/harness/rules-index.md`（生成・Codex 用） | 知識・規約（常にこうする） | 提案的 |
| Skills | canonical `.claude/skills/*/SKILL.md` + `.agents/skills/*`（symlink・Codex 用） | 手順・チェックリスト（両ツール共有） | 提案的 |
| Skills（レビュー） | `code-review` / `harness-review` skill（canonical + symlink） | PR open〜merge 前の**意味的レビュー**＋ゲート緑で auto-merge | 提案的 |
| Skills（オーケストレーション） | `implementation-workflow` skill（canonical + symlink） | 単一 PR の実装ライフサイクル統合（着手〜マージ〜レトロ〜worktree cleanup） | 提案的 |
| Git hooks | `.githooks/`（`core.hooksPath`） | 検証ゲート（ツール非依存・全コミッター/両ツールに強制） | 強制的 |
| Claude hooks（補助） | `.claude/settings.json` + `.claude/hooks/*` | Claude 限定の即時フィードバック | 補助的 |
| Phase docs | `docs/plan/*` | 実行単位・受け入れ基準・進捗 | — |
| ADR | `docs/adr/NNNN-*` | アーキ決定の不変ログ | — |
| Learnings（レトロ） | `docs/harness/learnings/*` | PR ごと KPT 学び→ハーネス改良へ書き戻し | — |

> **クロスエージェント方針**: Claude Code と Codex の両対応。指示は `AGENTS.md` を SoT に一本化、スキルは
> canonical 実体（`.claude/skills`）+ symlink（`.agents/skills`）で共有、ゲートは Git hooks で両対応。
> 詳細は ADR `0016` / `cross-agent.md`。

### ツールチェーン（採用ツールと版の SoT）

採用するツールと、それぞれの ADR は次のとおり。**具体バージョンはここに再掲しない**
（[ADR 0008](../../../adr/0008-toolchain-version-source-of-truth.md)）。

| 要素 | ツール | ADR |
|---|---|---|
| 言語 | TypeScript | [0003](../../../adr/0003-typescript-language.md) |
| ランタイム | Node.js | [0004](../../../adr/0004-nodejs-runtime.md) |
| パッケージ管理 | pnpm（corepack 非依存） | [0005](../../../adr/0005-pnpm-package-manager.md) |
| テスト | Vitest（+ coverage-v8） | [0006](../../../adr/0006-vitest-test-runner.md) |
| Linter/Formatter | Biome | [0007](../../../adr/0007-biome-linter.md) |
| Docker 化（dev/CI） | Dockerfile / compose | [0009](../../../adr/0009-dockerize-dev-ci.md) |

> **バージョンの唯一の情報源（SoT）** は `package.json`（devDeps）/ `pnpm-lock.yaml` / `.node-version`
> （[ADR 0008](../../../adr/0008-toolchain-version-source-of-truth.md)）。**メジャー含め最新追従**し、
> Dependabot + `dep-update` skill が `pnpm verify` / CI 緑で取り込む。pnpm CLI 本体の版は固定しない
> （最新を直接インストール）。

#### ブートストラップ時点のバージョン（作業ログ・参考）

> 以下はハーネス整備（2026-06）着手時に採用した版の**過去の作業ログ**。現在の正は上記 SoT
> （`package.json` / `pnpm-lock.yaml` / `.node-version`）であり、**この表は追従更新しない**（当時のスナップショット）。

| ツール | 着手時バージョン | 備考 |
|---|---|---|
| Node.js | 24（LTS） | 当時 26 は LTS 化前のため 24 を採用 |
| pnpm | 11.5.1 | 当時は `packageManager` + corepack で固定（後に corepack 依存を撤去・非固定化） |
| TypeScript | 6.0 | 当時 7.0 はネイティブ移植 β のため不採用 |
| Vitest + @vitest/coverage-v8 | 4.1.x | — |
| Biome | 2.4.x | — |

## 実装指針

- 1 phase = 1 PR で順に整備する（フェーズ一覧は [README](./README.md)）。各フェーズ末で `pnpm verify` 緑を
  満たして前進する。
- 両ツールは共有ファイル（`AGENTS.md` / canonical SKILL.md + symlink / Git hooks）を参照し、二重管理を避ける。
- 機械ゲート（型 / カバレッジ100% / Biome）は `.githooks/` と CI に集約し、skill / rule では再実装しない。
- アーキ決定はその場で `adr-new` で ADR に残し、PR ごとの学びは `pr-retrospective` → `harness-meta` で
  ハーネスへ書き戻す（自己改良ループ）。

## スコープ外

- ライブラリ本体（MVP = `01-mvp` の phase 0〜3）のロジック実装。本計画はそれを駆動するハーネスに限定する。
- データ保持モデルの再設計（`02-data-model-redesign`）。
- 自動起動（cron / 閾値）・三層メトリクス・外部研究駆動の `harness-evolution` 等（`docs/harness/README.md`
  のスコープ外を参照）。

## 受け入れ基準

この計画群全体の客観条件（計画完了の判定基準）:

1. `pnpm verify`（= `tsc --noEmit` → `vitest run --coverage`（閾値100%）→ `biome check .`）が緑。
2. `docker build` 成功 + コンテナ内で `pnpm verify` 緑（版は `.node-version` / `pnpm-lock.yaml` 準拠。
   具体版はハードコードしない・[ADR 0008](../../../adr/0008-toolchain-version-source-of-truth.md)）。
3. 旧 `plan.md` が `docs/plan/01-mvp/architecture.md` に移動済み（内容維持）。
4. `CLAUDE.md` から rules / architecture.md への参照が解決。
5. Git の pre-commit / pre-push ゲートが**素の git でも**機能（ツール非依存）。
6. 中核 skill（`verify` / `start-phase` / `finish-phase`）+ `adr-new` + `dep-update` + `pr-retrospective` + `harness-meta` が動作。
7. `.github/dependabot.yml`（npm / github-actions / docker）設定済み。
8. `docs/adr/` に template・README・初期 ADR 群が存在し、`adr-new` が採番生成できる。
9. `docs/harness/learnings/` とレトロループ rules/skills が存在し、PR ごと KPT レトロ→ハーネス書き戻しが実行できる。
10. **Codex 両対応**: `AGENTS.md`（共有 SoT）+ `CLAUDE.md`=`@AGENTS.md`、スキルは canonical + `.agents/skills` symlink、`docs/harness/rules-index.md` 生成、Git hooks ゲートが Codex でも効く。スキル本文の 1 箇所修正で両ツールに反映。
11. **コードレビュー**: `code-review`（ソース用）/ `harness-review`（ハーネス資産用）skill が両ツールから起動でき、機械ゲート（Git hooks）を再実行せず意味的観点のみ指摘。CI（server-side `pnpm verify`）緑＋レビュー承認で auto-merge できる。
12. **実装ワークフロー**: `implementation-workflow` skill が Phase 0〜9（worktree 作成 → 着手 → 実装+`pnpm verify` → セルフ検証 → Draft PR → 独立レビュー → マージ → レトロ → cleanup）を**既存 skill の再利用**で駆動でき、マージは Phase 3 の auto-merge と整合、worktree は Phase 0/9 ペアで管理される。

## phase 分割

直列の 11 フェーズに分割（一覧・依存は [README](./README.md)）。ハーネス整備は各機構が後続の前提になるため
おおむね順序依存だが、ADR / レビュー / レトロのループは早期に確立し以降の全フェーズで稼働させる。
