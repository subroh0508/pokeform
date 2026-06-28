# Phase 5 — verify-showdown-pr skill + rules / docs 改訂

## 目的 / スコープ

showdown-sync が作る authoritative PR の正確性を **Serebii で照合するスキル `verify-showdown-pr`** を新設し、旧 `survey-regulation` skill を廃止して置換する。取得元転換に伴うハーネス資産（`.claude/rules/*` / `docs/design` / `AGENTS.md`）を実態へ整合させる。

- スコープ内: `verify-showdown-pr` skill 新設、`survey-regulation` 廃止、`.claude/rules/*` 5 ファイル改訂、`docs/design/data-pipeline.md` / `AGENTS.md` / `data/README.md` 改訂。
- スコープ外: 全量本投入（Phase 6）。

## 前提（依存）

- **Phase 4 完了**（新 Serebii スクレイパーが存在し、照合スキルが流用できる）。
- 確定済み rule: [[skill-authoring]] / [[cross-agent]] / [[data-pipeline]] / [[code-review]] / [[redaction]]。

## タスク

- [ ] `skill-creator` で `verify-showdown-pr` skill を新設（canonical `.claude/skills/verify-showdown-pr/SKILL.md` + `.agents/skills/` 相対 symlink）:
  - trigger: `data:authoritative` ラベルの data 更新 PR を Serebii で照合 / 「showdown の PR を Serebii で確認」/「verify-showdown-pr <PR>」
  - 手順: `gh pr diff` で変更 YAML 抽出 → **新 Serebii スクレイパースクリプト（`pnpm serebii:*`）を流用**して中間 JSON 取得（WebFetch は使わない）→ roster 数 / 技件数 / 持ち物・メガ membership / 技メタ（PP 8/12/16/20）/ priority / ja・en を照合 → exit 0(一致) / 1(差異) + PR コメント（[[code-review]] / [[redaction]] 準拠）
- [ ] `.claude/skills/survey-regulation/` を削除（SKILL.md / references/serebii-sourcing.md / workflows/*.workflow）+ `.agents/skills/survey-regulation` symlink 削除。
- [ ] `.claude/rules/data-pipeline.md` を**大幅改訂**: 取得元 SoT 表を showdown 序列へ全面差し替え（materialize=ja 専任 / Serebii=速報 / catalog 命名廃止）、ADR 参照を 0039/0040 へ更新。
- [ ] `.claude/rules/` 軽微改訂: `skill-authoring.md`（survey-regulation の workflow 例を verify-showdown-pr へ）/ `cli-and-io.md`（名前解決の由来・ADR 参照）/ `redaction.md`（pokemon-showdown repo / Serebii public URL を公開 URL 例外へ）/ `cross-agent.md`（survey-regulation symlink 削除・verify-showdown-pr symlink 新設の点検 note）。
- [ ] `docs/design/data-pipeline.md`（情報源系統・mermaid を showdown=正 / Serebii=速報 / PokeAPI=ja へ）、`AGENTS.md`（vendor 方式・skill 説明・scripts 一覧・ディレクトリ説明）、`data/README.md` を改訂。`pnpm gen:rules-index` で索引再生成。

## この Phase で育てるハーネス（rule・skill）

- `verify-showdown-pr` skill 新設（`skill-creator`）、`survey-regulation` skill 廃止、`update-catalog` は Phase 2 で縮小済み。`.claude/rules/*` 5 ファイル + design / AGENTS の整合。

## 受け入れ基準

- `pnpm verify` 緑（docs/rule/skill のみでも pre-commit ゲート通過）。
- `verify-showdown-pr` が canonical + symlink パリティで存在し、Serebii スクレイパー流用で showdown PR を照合できる。
- `survey-regulation` が完全削除され、`git grep "survey-regulation"` が歴史記述（learnings / archive ADR）以外に残らない。
- `.claude/rules/*` / `docs/design` / `AGENTS.md` の取得元記述が showdown 序列に整合し、dangling 参照ゼロ。

## 検証手順

1. `verify-showdown-pr` を Phase 3 で作った showdown PR（または fixture）に対して走らせ、一致 exit 0 / 差異 exit 1 + PR コメントを確認。
2. `git grep -n "survey-regulation"` / `git grep -n "serebii-sourcing"` で残存参照（歴史記述以外）が無いことを確認。
3. `docs/harness/rules-index.md` が再生成され `.claude/rules/*` と整合することを確認。
4. `pnpm verify` 緑を確認。

## リスク・備考

- skill 廃止・新設は cross-agent パリティの追従漏れが起きやすい（[[cross-agent]]）。symlink 除去・新設を機械確認する。
- data-pipeline.md は取得元表の正本。改訂時に項目 × 取得元 × SoT の整合を [[data-pipeline]] のレビュー観点で点検する。
- `verify-showdown-pr` は WebFetch ではなくスクレイパー流用。Serebii DOM 契約が変わるとスクレイパー側で吸収する（照合スキルは契約値を持たない）。
