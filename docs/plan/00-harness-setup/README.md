# 00. ハーネス環境整備（実装計画インデックス）

pokeform をコーディングエージェント（**Claude Code / Codex 両対応**）が**繰り返し・信頼性高く**実装していくための土台（共有指示 SoT `AGENTS.md`・ツールチェーン・rules・skills・検証ゲート・進捗ドキュメント・ADR・レトロスペクティブ改良ループ）を整備するフェーズ。ライブラリ本体のロジックは書かず、**以降の全フェーズを駆動するハーネス**を用意する。両ツールは共有ファイル（AGENTS.md / canonical SKILL.md + symlink / Git hooks）を参照し、二重管理を避ける。

## ゴール / アウトカム

各フェーズが「緑のゲート（型 OK / テスト100% / Lint OK）」を通って初めて次へ進む、自己検証的な開発フローの土台が動作している状態。

## ハーネスの役割分担

| 機構 | 置き場所 | 役割 | 強制力 |
|---|---|---|---|
| 指示 SoT | `AGENTS.md`（Codex ネイティブ / Claude は `CLAUDE.md`→`@AGENTS.md`） | 両ツール共有の指示・規約要約・索引ポインタ | 提案的 |
| rules | `.claude/rules/*`（Claude paths 自動） + `docs/harness/rules-index.md`（生成・Codex 用） | 知識・規約（常にこうする） | 提案的 |
| Skills | canonical `.claude/skills/*/SKILL.md` + `.agents/skills/*`（symlink・Codex 用） | 手順・チェックリスト（両ツール共有） | 提案的 |
| Git hooks | `.githooks/`（`core.hooksPath`） | 検証ゲート（ツール非依存・全コミッター/両ツールに強制） | 強制的 |
| Claude hooks（補助） | `.claude/settings.json` + `.claude/hooks/*` | Claude 限定の即時フィードバック | 補助的 |
| Phase docs | `docs/plan/*` | 実行単位・受け入れ基準・進捗 | — |
| ADR | `docs/adr/NNNN-*` | アーキ決定の不変ログ | — |
| Learnings（レトロ） | `docs/harness/learnings/*` | PR ごと KPT 学び→ハーネス改良へ書き戻し | — |

> **クロスエージェント方針**: Claude Code と Codex の両対応。指示は `AGENTS.md` を SoT に一本化、スキルは canonical 実体（`.claude/skills`）+ symlink（`.agents/skills`）で共有、ゲートは Git hooks で両対応。詳細は ADR `0009` / `cross-agent.md`。

## 確定バージョン（2026-06 時点で最新を確認済み・実装着手時に再確認）

| ツール | バージョン | 備考 |
|---|---|---|
| Node.js | 24（LTS） | 26 は LTS 化前（2026-10）。LTS の 24 を採用 |
| pnpm | 11.5.1 | `packageManager` + corepack で固定 |
| TypeScript | 6.0 | 7.0 はネイティブ移植の β のため不採用 |
| Vitest + @vitest/coverage-v8 | 4.1.x | 5.0 は β |
| Biome | 2.4.x | — |

> メジャーは上記固定、マイナー/パッチは最新を採用。以後は Dependabot + `dep-update` skill で追従。

## フェーズ一覧（この順で実施）

- [ ] [Phase 1 — 計画ドキュメント基盤と正本移動](./phase-1-plan-docs-and-canon-move.md)
- [ ] [Phase 2 — レトロスペクティブ & ハーネス改良ループ](./phase-2-retrospective-loop.md) ← PR ごと KPT レトロ→ハーネス書き戻し（colormaster 参考・簡素化）
- [ ] [Phase 3 — ADR の仕組み](./phase-3-adr.md) ← 早期に確立し、以降の決定をその場で記録
- [ ] [Phase 4 — ツールチェーンとバージョン固定](./phase-4-toolchain-and-versions.md)
- [ ] [Phase 5 — Docker 化](./phase-5-dockerize.md)
- [ ] [Phase 6 — rules と CLAUDE.md](./phase-6-rules-and-claude-md.md)
- [ ] [Phase 7 — 中核 Skills](./phase-7-core-skills.md)
- [ ] [Phase 8 — 検証ゲート（Git hooks + Claude 補助 hooks）](./phase-8-verification-gates.md)
- [ ] [Phase 9 — Dependabot と dep-update skill](./phase-9-dependabot-and-dep-update.md)

## このフェーズ全体の受け入れ基準

1. `pnpm verify`（= `tsc --noEmit` → `vitest run --coverage`（閾値100%）→ `biome check .`）が緑。
2. `docker build` 成功 + コンテナ内で `pnpm verify` 緑（Node 24 / pnpm 11.5.1）。
3. 旧 `plan.md` が `docs/plan/01-mvp/architecture.md` に移動済み（内容維持）。
4. `CLAUDE.md` から rules / architecture.md への参照が解決。
5. Git の pre-commit / pre-push ゲートが**素の git でも**機能（ツール非依存）。
6. 中核 skill（`verify` / `start-phase` / `finish-phase`）+ `adr-new` + `dep-update` + `pr-retrospective` + `harness-meta` が動作。
7. `.github/dependabot.yml`（npm / github-actions / docker）設定済み。
8. `docs/adr/` に template・README・初期 ADR 群が存在し、`adr-new` が採番生成できる。
9. `docs/harness/learnings/` とレトロループ rules/skills が存在し、PR ごと KPT レトロ→ハーネス書き戻しが実行できる。
10. **Codex 両対応**: `AGENTS.md`（共有 SoT）+ `CLAUDE.md`=`@AGENTS.md`、スキルは canonical + `.agents/skills` symlink、`docs/harness/rules-index.md` 生成、Git hooks ゲートが Codex でも効く。スキル本文の 1 箇所修正で両ツールに反映。

## 補足

- 各フェーズ doc は共通テンプレート（目的 / 前提 / タスク / 受け入れ基準 / 検証手順 / リスク）に従う。
- ライブラリ本体（MVP = phase 0〜3）は `docs/plan/01-mvp/` の別計画で、このハーネス上で実装する。
