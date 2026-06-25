# 08-docs-restructure — ドキュメント構成の再編（実装計画インデックス）

`docs/plan/01-mvp/architecture.md`（規約 spec 正本）を `docs/design/`（コードなし設計俯瞰）へテーマ別分割昇格し、`docs/plan` → `docs/roadmap` 改名 + `completed/` 集約、front matter 規約導入（design / rules）、AGENTS.md 刷新、SoT 二重管理解消までを行う計画群。知識の種類ごとに正本を一意化し、他層は参照（point, don't repeat）する構成へ寄せる。

> 設計の正本は [`OVERVIEW.md`](./OVERVIEW.md)（ゴール / 背景 / 設計方針 / 実装指針 / スコープ外 / 計画群全体の受け入れ基準）。
>
> **棲み分け**: `docs/roadmap/`（旧 `docs/plan/`）= 実装の計画・進捗・完了履歴（mutable WIP）。`docs/design/`（本計画で新設）= 設計の俯瞰・なぜ（現在どう成り立っているか・コードなし Explanation）。
>
> **実施順**: 先行計画 [`07-rules-skills-simplify`](../07-rules-skills-simplify/README.md) を先、本計画（08）を後にする（先に冗長を削ってから構造を動かす。ハードな相互依存はなく、重なるファイルは後発がリベース）。

## フェーズ依存グラフ

```mermaid
flowchart TD
    P0[phase-00 — 配置・front matter 規約 ADR] --> P1[phase-01 — design 骨組み + README + data-pipeline]
    P1 --> P2[phase-02 — type-validation + individuals-and-parties]
    P2 --> P3[phase-03 — 参照張り替え + architecture.md 撤去 + 二重管理解消]
    P3 --> P4[phase-04 — docs/plan → docs/roadmap 改名 + completed/ 集約]
    P4 --> P5[phase-05 — AGENTS.md 刷新]
    P4 --> P6[phase-06 — 規約 / skill 是正 + rules への front matter]
```

## フェーズ一覧（この順で実施）

- [x] [Phase 0 — 配置・front matter 規約の ADR 起票](./phase-00-placement-adr.md)
- [ ] [Phase 1 — docs/design/ 骨組み + README + data-pipeline.md](./phase-01-design-scaffold-data-pipeline.md)
- [ ] [Phase 2 — type-validation.md + individuals-and-parties.md](./phase-02-design-type-and-individuals.md)
- [ ] [Phase 3 — inbound 参照張り替え + 旧 architecture.md 撤去 + 二重管理解消](./phase-03-rewire-and-retire-architecture.md)
- [ ] [Phase 4 — docs/plan → docs/roadmap 改名 + completed/ 集約 + 参照追従](./phase-04-roadmap-rename.md)
- [ ] [Phase 5 — AGENTS.md 刷新](./phase-05-agents-md-refresh.md)
- [ ] [Phase 6 — 規約 / skill の plan 参照違反・陳腐化是正 + rules への front matter](./phase-06-rule-skill-staleness-fix.md)

## 補足

- 各 phase doc は [plan-templates.md](../../../.claude/skills/plans-new/references/plan-templates.md) の「phase-NN-<slug>.md」節に従う。
- ADR は `adr-new`、skill 改修は `skill-creator`（[[adr]] / [[skill-authoring]]）。各 PR は `harness-review` でセルフレビューし cross-agent パリティを点検する（[[cross-agent]]）。
- rules / skills の純シンプル化（文体圧縮）は先行 [`07-rules-skills-simplify`](../07-rules-skills-simplify/README.md)。
