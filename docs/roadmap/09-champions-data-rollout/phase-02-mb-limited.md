# Phase 2 — M-B 限定投入（M-A の 10 体 + M-B 追加解禁全種 + 全持ち物）

> Phase 1 と同じく **03 + 05 で整えた取得パイプライン + `survey-regulation` オーケストレーター**経由で、
> [04 の新レイアウト](../completed/04-generated-layout-redesign/README.md) の `data/champions/m-b/*` へ投入する。

## 目的 / スコープ

限定セット検証サイクルの 2 段目。M-B を「**M-A の 10 体 + M-B で追加解禁された全種族**」+ **解禁済み全持ち物**に絞って skill 経由投入し、レギュ間差分（追加解禁種・period・持ち物差分）を skill が正しく扱えるかを検証する。M-A（Phase 1）との重複種を二重投入せず、catalog は共有・per-reg `m-b/*` のみ差分追記する経路を踏む。

- スコープ内:
  - M-B 解禁種のうち **Phase 1 で投入した M-A の 10 体に含まれない「M-B 追加解禁全種」**を確定し、`survey-regulation` skill で解禁技 / 解禁持ち物（全件） / メガを取得 + 自己修復し出典付き doc 化。
  - 新規種・新規技・新規持ち物・新規特性・新規メガを各 catalog（specs / languages）へ append-only 転記（既存 M-A エントリは尊重・重複追記しない）。`fetch:data` → `materialize` で構造データ・ja 名補完。
  - per-reg `data/champions/m-b/*`（block 記法）を「M-A の 10 体 + M-B 追加解禁全種」+ 全持ち物で著述（各種族 `species-moves` = M-B 使用可能技全量、メガ運用種に `mega[]`、`items` = 解禁済み全持ち物、`index.yaml` の period は現行維持）。
  - `check:regulation` 0 終了 → `generate:data` 再生成 → `pokemon-data-reviewer` レビュー。
- スコープ外:
  - M-B の残り全種族（Phase 4 の本投入で M-A とともに全量化）。
  - skill 改修（Phase 3 のゲート判定後）。スクレイパー / skill / legality 実装（03 + 05 完了済み）。

## 前提（依存）

- **Phase 1 完了**（レコード全削除 + M-A 限定 10 体 + 全持ち物が投入済み）。本 phase はその catalog 上に M-B 差分を積む。
- Phase 1 と同じ確定済み前提（04 / 05 / 03 / 02・ADR 0024 / 0026 / 0027 / 0030）。
- 確定済み rule: [[data-pipeline]] / [[cli-and-io]] / [[type-conventions]] / [[testing]]。

## タスク

- [ ] M-B 追加解禁全種（M-A の 10 体に含まれない解禁種）を確定し、`survey-regulation` skill で解禁技 / 解禁持ち物（全件） / メガを取得 + 自己修復し出典付き roster-source doc 化（Serebii 第一優先）。
- [ ] 新規種・技・持ち物・特性・メガを各 catalog（specs / languages）へ append-only 転記（既存 M-A エントリは尊重・重複追記しない）。
- [ ] `pnpm fetch:data` → `pnpm materialize` で追加 slug の構造データ + ja 名を補完。
- [ ] per-reg `data/champions/m-b/*`（block 記法）を著述: species = M-A の 10 体 + M-B 追加解禁全種、各種族 `species-moves` = M-B 使用可能技全量、メガ運用種に `mega[]`、`items` = 解禁済み全持ち物。
- [ ] `node src/cli/index.ts check:regulation data/champions` が 0 終了することを確認（M-A・M-B 両レギュの参照整合）。
- [ ] `pnpm fetch:data && pnpm generate:data` で再生成。
- [ ] 生成データを `pokemon-data-reviewer` agent でレビュー（M-B の種族値・タイプ・日英名・解禁整合・メガ配列・M-A との差分整合）。

## この Phase で育てるハーネス（rule・skill）

- なし（データ投入が中心）。レギュ間差分（追加解禁・catalog 共有）の扱いで skill の不備が見えた場合は記録し、改修判定は Phase 3 のゲートに集約する。

## 受け入れ基準

- `pnpm verify` が緑。
- M-B が「M-A の 10 体 + M-B 追加解禁全種」+ 全持ち物の限定セットで skill 経由投入され、`data/champions/m-b/*` と M-B 生成 TS に反映される。
- M-A の catalog エントリが重複・破壊されていない（append-only・既存尊重）。
- `check:regulation` が 0 終了（M-A・M-B 両レギュ）。
- `pokemon-data-reviewer` のレビューで重大な不整合が無い。

## 検証手順

1. roster-source doc と投入後の M-B per-reg 種族 dex を突き合わせ、「M-A の 10 体 + M-B 追加解禁全種」が一致することを確認。
2. M-A の per-reg / catalog が Phase 1 から不変（重複追記なし）であることを確認。
3. `check:regulation` が 0 終了することを確認（両レギュ）。
4. `pnpm generate:data` 後、M-B 追加解禁種の `species-moves` が Serebii movepool を含むことをスポット確認。
5. `pokemon-data-reviewer` agent でレビューし指摘を解消。
6. `pnpm verify` 緑を確認。

## リスク・備考

- **レギュ間差分の検証が本 phase の主眼**。catalog 共有（M-A エントリの再利用）と per-reg 差分追記を skill が正しく扱えるかを確認する。重複投入・既存破壊は append-only 違反として `pokemon-data-reviewer` + diff レビューで弾く。
- M-B 追加解禁種の確定は本 phase 実行時に Serebii で確認する（公開済み M-B 解禁情報を第一優先）。
- 本 phase 完了で「全削除 → M-A 限定 → M-B 限定」の 1 サイクルが揃い、Phase 3 の人間検証ゲートに入る。
