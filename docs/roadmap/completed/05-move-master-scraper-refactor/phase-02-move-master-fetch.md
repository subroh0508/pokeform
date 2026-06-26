# Phase 2 — 技マスター専用取得経路の実装（Serebii 技専用ページ → move-specs を Champions 準拠値で populate）

## 目的 / スコープ

技そのものの情報（威力・命中・タイプ・分類・PP）を **Serebii の技専用ページから独立スクレイピング取得する経路**を
決定論スクレイパー（層1）として新設し、`move-specs`（04 で独立エンティティ化）を **Champions 準拠の正しい値**で populate
する。これにより、現状残る前作値の誤り（PP 5/10/15/25/30/40 等）を是正する。**旧 03 Phase 13（技メタ値の手動是正）を
本 phase が吸収**し、手動是正の代わりに専用取得経路で根本解決する。

- スコープ内:
  - `src/codegen/serebii/parse.ts` に新 `parseMoveMaster`（技専用ページから `type` / `damageClass` / `power` /
    `accuracy` / `pp` / `priority` を抽出）+ `*.test.ts`（fixture 網羅・カバレッジ100%）。
  - `scripts/fetch-serebii.ts` に技専用ページ URL を追加（latin-1 / CRLF・キャッシュ `data/raw/serebii/`）。
    `scripts/scrape-serebii.ts` に技マスター実行の配線 + exit code 自己検証（Phase 1 で確定した契約）。
  - `scripts/serebii-to-catalog.ts` に技マスター転記（`transcribe-move-master` 相当）を追加し、`move-specs`
    （`data/champions/move-specs.yaml`）へ append/既存尊重で書き込む。Champions 準拠値で前作値を上書き是正。
  - `pnpm generate:data` 再生成で `champions/move-specs.ts` に反映。
- スコープ外: 種族ページ側の技メタ副産物抽出の**除去**（Phase 3 のリファクタで実施・本 phase は新経路の追加に専念）。
  skill 再編（Phase 4）。役割分割リファクタ（Phase 3）。

## 前提（依存）

- **Phase 1 完了**（技マスター取得経路の DOM 契約・exit code・SoT が ADR / 設計メモで確定）。
- **04-generated-layout-redesign の Phase 1-3 完了**（`move-specs` が独立エンティティ・新ツリー）。
- 技の出自は **Serebii 第一優先・PokeAPI 非依存**（ADR 0026 の核を継承する ADR 0035）。技メタ SoT は `move-specs`（ADR 0035）。
  専用取得経路の DOM 契約（`attackdex-champions/<move>.shtml`・Speed Priority 含む）・exit code 契約（0/2/3/4）は
  [ADR 0037](../../../adr/0037-serebii-move-master-dedicated-path.md) を正とする。
- 層1-3 ハイブリッド構造（決定論スクレイパー + Workflow 自己修復）は 03 で確立済み（[[data-pipeline]] /
  [`serebii-sourcing.md`](../../../../.claude/skills/survey-regulation/references/serebii-sourcing.md)）。

## タスク

- [ ] `parseMoveMaster`（技専用ページパーサ）を `src/codegen/serebii/parse.ts` に実装。必中 accuracy（`101`）・
      変化技（`--`→`null`）・PP の 8/12/16/20 化を決定論判定。`__fixtures__/` に技専用ページの実 HTML 最小切片を
      コミットし `*.test.ts` でカバレッジ100%（物理・特殊・変化の各分類 + 優先度技を含める）。
- [ ] `scripts/fetch-serebii.ts` に技専用ページ取得を追加（latin-1 + CRLF + 超長行対応・`data/raw/serebii/` キャッシュ）。
- [ ] `scripts/scrape-serebii.ts` に技マスター実行を配線し、exit code（0/2/3/4）と stderr 構造化診断
      `{move, stage, missingFields, rawHtmlPath}` を Phase 1 契約どおり出力。
- [ ] `scripts/serebii-to-catalog.ts` に技マスター転記を追加し、`data/champions/move-specs.yaml` へ Champions 準拠値で
      append/既存尊重転記（前作値は Champions 値へ是正）。
- [ ] `pnpm generate:data` で `champions/move-specs.ts` に反映。`pnpm check:regulation data/champions` 0 終了・
      `pnpm verify` 緑。
- [ ] `pokemon-data-reviewer` agent で技マスター値の妥当性をレビュー（PP が 8/12/16/20 に収まる・power/type が
      Champions 実態と整合）。

## この Phase で育てるハーネス（rule・skill）

- なし（取得経路の実装が中心）。取得手順への影響は Phase 4 の skill 再編で反映する。技メタ取得元方針の更新があれば
  [[data-pipeline]] / [`serebii-sourcing.md`](../../../../.claude/skills/survey-regulation/references/serebii-sourcing.md) を
  Phase 4 で追補する。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome / `check:yaml-style`）が緑。`parseMoveMaster` のテストがカバレッジ100%。
- `data/champions/move-specs.yaml` の**全技の PP が 8/12/16/20 のいずれか**（前作 PP の残存ゼロ・機械確認）。
- power / type が Serebii Champions 図鑑と整合（前作からの変更が反映済み）。`pnpm generate:data` 後
  `champions/move-specs.ts` に反映される。
- `check:regulation` 0 終了。`pokemon-data-reviewer` レビューで技マスター値の重大な誤りが無い。

## 検証手順

1. `data/champions/move-specs.yaml` の `pp` 値の集合が `{8,12,16,20}` に収まることを機械確認（逸脱 PP を検出し 0 件）。
2. 代表技（物理 / 特殊 / 変化 / 優先度技）を Serebii Champions の技専用ページとスポット照合し power/type/PP が一致。
3. `pnpm generate:data` 後 `champions/move-specs.ts` に是正が載ることを確認。
4. `pnpm check:regulation data/champions` 0 終了・`pnpm verify` 緑。
5. `pokemon-data-reviewer` agent で技マスターをレビューし指摘を解消。

## リスク・備考

- **Serebii 単一ソースの誤記リスク**: PP/power/type は補助ソース（Game8 等）で裏取りし、矛盾と採用根拠を記録する
  （数値の正しさは機械ゲートで担保できないため Serebii 照合 + `pokemon-data-reviewer` で担保・
  [`serebii-sourcing.md`](../../../../.claude/skills/survey-regulation/references/serebii-sourcing.md) の突き合わせ原則）。
- **本 phase は新経路の追加に専念**し、種族ページ側の技メタ副産物抽出は残したまま（Phase 3 で除去）。両者が同じ
  `move-specs` を書く間は、技マスター専用取得を後勝ちにするか、種族ページ側を読み取り専用にするかを実装で決める
  （Champions 準拠値が消えないこと）。
- **旧 03 Phase 13 の吸収**: 全種族投入（09）の前に技メタを正すことで、誤った技メタが全186種・全 movepool へ広がるのを
  防ぐ（「全量投入の手前で値を正す」de-risk）。手動是正ではなく専用取得経路による自動是正なので、再取得で再現可能。
