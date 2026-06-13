# Phase 6 — SKILL.md 全面改訂 + cross-agent パリティ + ツール整備

## 目的 / スコープ

`survey-regulation` skill を「LLM WebFetch 目視抽出」から「**決定論スクレイパー + Workflow 自己修復**」へ全面
改訂する。`allowed-tools` を見直し、cross-agent フォールバック（Codex は層1 を逐次 + 人手修正で完結）を明記する。
数十種での実証までを本 phase で行い、全186種フル投入は Phase 7 に分離する。

- スコープ内:
  - `SKILL.md` / `references/serebii-sourcing.md` を新パイプラインへ全面改訂（手順 1-3 の WebFetch 目視を
    決定論スクレイパー + 自己修復へ差し替え）。WebFetch は roster 確定・最終エスカレーション fallback に縮小。
  - `allowed-tools` 見直し（Bash 中心 + Workflow/Agent・重い WebFetch 依存を外す）。
  - cross-agent フォールバックの明記（正しさは層1・SubAgent/Workflow は Claude 固有の最適化・Codex は
    `node scripts/...` 逐次 + 人手修正で完結）。
  - 数十種での end-to-end 実証（fetch→scrape→自己修復→転記→materialize→generate→verify）。
- スコープ外: 全186種フル投入（Phase 7）。

## 前提（依存）

- **Phase 5 完了**（層1-3 が揃い、自己修復ループが機能）。
- 確定済み rule: [[skill-authoring]]（skill 改修は `skill-creator`・description=trigger・≤500 行・cross-agent
  パリティ）/ [[cross-agent]] / [[data-pipeline]]。

## タスク

- [ ] `skill-creator` で `SKILL.md` を全面改訂（手順を決定論スクレイパー + 層2-3 Workflow へ）。WebFetch を
      roster 確定・最終 fallback に縮小。`allowed-tools` 見直し。
- [ ] `references/serebii-sourcing.md` を新パイプラインへ改訂（DOM 構造・slug 正規化・latin-1・accuracy の SoT は
      Phase 3 で追記済みを統合・「Serebii 第一優先」「全量 materialize」の方針は不変として再確認）。
- [ ] cross-agent フォールバックを SKILL に明記（Codex は層1 を逐次 + 人手修正で完結・正しさは共有パーサ層）。
- [ ] cross-agent パリティ（canonical `.claude/skills` + `.agents/skills` symlink・`references/` 参照）を点検。
- [ ] 数十種で end-to-end 実証し、トークン消費が現行比で大幅減（HTML を LLM に載せない）ことを確認。

## この Phase で育てるハーネス（rule・skill）

- `SKILL.md` 全面改訂（`skill-creator`）。`serebii-sourcing.md` 改訂。ハーネス資産変更のため `harness-review` で
  description trigger 精度・cross-agent 整合・SoT 一貫性・ゲート二重化を点検（機械ゲートは再実装しない）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- `SKILL.md` が新パイプラインへ全面改訂され、`description`（trigger）が新手順を反映。`allowed-tools` が
  決定論スクレイパー + Workflow 中心に整理される。
- cross-agent フォールバックが明記され、canonical + symlink パリティが一致。`harness-review` 通過。
- 数十種で end-to-end が緑・トークン消費が現行比で大幅減。

## 検証手順

1. 数十種で fetch→scrape→自己修復→転記→materialize→check:regulation→generate→verify を通し緑を確認。
2. `SKILL.md` の `description` 文字数 ≤1024・本文 ≤500 行・参照（ADR/rule/ファイル）の実在を確認。
3. canonical（`.claude/skills/survey-regulation`）と `.agents/skills/survey-regulation` symlink の一致を確認。
4. `harness-review` を通し指摘を解消。`pnpm verify` 緑。

## リスク・備考

- **cross-agent 非対称**: SubAgent/Workflow は Claude 固有。Codex は層1 を逐次 + 人手修正で完結するフォールバックを
  明記し、正しさの核（共有パーサ層）を守る。これが本計画が cross-agent で破綻しない必須条件。
- **2 ソース件数検証**: 現行の Game8 等での裏取りは件数の機械比較に縮退するか、skill 層に薄く残すかを本 phase で
  判断する（Serebii 第一優先は不変）。
- skill 改訂は `skill-creator` を使い手書きしない（[[skill-authoring]]）。機械ゲート / レビュー観点を skill 内で
  再実装しない。
