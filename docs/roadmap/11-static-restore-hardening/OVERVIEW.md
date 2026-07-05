# 11-static-restore-hardening — 名前辞書の from-scratch 復元堅牢化 + 非 third-party PR 作成 + 全件本投入 OVERVIEW

## ゴール

`author-static-data`（`pokeapi-names.yml`）の**完全撤去状態からの復元**が、GitHub Actions 上で
**third-party action 無し**に全ステップ緑で通り、最後に **M-A・M-B の全データセット本投入**まで到達する状態。
利用者（コーディングエージェント）が `data/` を完全削除しても、機械的な取得フローだけで名前辞書 →
per-reg 解禁データを冪等に復元できる。

## 背景 / 動機

`author-static-data` の動作確認（本セッション）で、`data/languages/*.yaml` + 生成 ts を全撤去（PR #218）した
状態から `pokeapi-names.yml` を回したところ、from-scratch 復元に 3 つの未文書化の前提が必要と判明した。
これらは skill step 4（scaffold 手順）が支えきれておらず、workflow 単独では復元できない:

- **P1（生成 ts 依存の順序）**: `pokeapi-names.yml` の `Style, generate, verify` 段が
  `check:yaml-style → generate:data` の順。`check:yaml-style` は `src/cli/index.ts` 経由で全 command runner を
  eager import し `src/generated/languages/*.ts` に依存するため、生成 ts が無いと sync 直後に CLI 起動不可。
- **P2（空 block map 不可）**: `sync:ja-names`（`scripts/materialize.ts`）は既存 languages yaml を
  `readFileSync` + `doc.get(mapKey)` で読む前提。ファイル欠損は ENOENT、`mapKey:`(null) は undefined map で
  crash、`mapKey: {}`(flow) は `check:yaml-style` に弾かれる。空 block map は YAML 構文上表現できず scaffold が破綻。
- **P3（PokeAPI 非提供の固有フォーム）**: `rotom-wash` 等 pokeform 固有フォームは PokeAPI `pokemon-species`
  list 外で fetch されず `generate` が `no name entry` で fail。ただし `pokemon-form/rotom-wash` は `form_names` に
  ja/en を持つ（mega と同経路）。

加えて **P4**: `pokeapi-names.yml` / `showdown-sync.yml` / `serebii-bulletin.yml` の PR 作成が
third-party action（`peter-evans/create-pull-request`）依存で、撤去 main への divergent branch では cherry-pick
衝突する。これを非 third-party（`gh pr create` / GITHUB_TOKEN）へ移行する。

復元 PR #219 は seed + ローカル等価の workaround で作ったため close 済。本計画で機構を正して、復元を
**クリーンな取得フロー**で通す。plan 10（showdown-first-data）の未完 Phase 9（全件本投入）を本計画の最終
フェーズへ移し、plan 10 を完了に集約する。

## 設計方針

- **SoT レイアウト・`generate.ts`・型・検証ゲートは不変**（plan 10 / ADR 0035/0039/0041 を踏襲）。触るのは
  取得・転記スクリプトと workflow の配線のみ。→ [[data-pipeline]] / [[tsc-verification]]
- **P1 は workflow 順序で解く**（`generate:data` を `check:yaml-style` の前へ）。CLI の eager import 自体の
  decouple は本計画のスコープ外（latent footgun として備考に残す）。
- **P2 は `materialize.ts` の耐性化**で解く。欠損ファイル / null map のとき **block スタイルの `YAMLMap` を新規
  作成**して append する（`flow=false`）。scaffold 手順（seed / 空マップ）を不要化する。純関数側（
  `src/codegen/materialize.ts`）にロジックを寄せてコロケーション test でカバレッジ 100%。→ [[testing]]
- **P3 は取得元の curated whitelist で解く**。`scripts/fetch-pokeapi.ts` に **固有フォーム whitelist**
  （`items` の `ITEM_CATEGORIES` と同型）を足し、`pokemon-form` の `form_names` から species 名を取得する。
  手作業 seed を排し全件辞書の不変条件（ADR 0041）を満たす。→ [[data-pipeline]]
- **P4 は非 third-party 化**。3 workflow の PR 作成を `git push` + `gh pr create`（GITHUB_TOKEN）へ置換し、
  label は事前作成（`gh label create` 冪等）で担保する。cherry-pick を介さないため divergent branch でも衝突しない。
- **broken main の解消**: main は撤去状態（PR #218）で verify が赤。Phase 1 が fixed flow で languages を復元して
  **緑へ戻す**（以降の phase は緑 main 上で進む）。全件本投入（reg データ）は Phase 3。

## 実装指針

- **Phase 1**: `scripts/materialize.ts` + `src/codegen/materialize.ts`（P2）/ `scripts/fetch-pokeapi.ts`（P3）/
  `pokeapi-names.yml` 順序（P1）を修正し、fixed flow（`fetch:ja-names` → `sync:ja-names` → `generate:data` →
  `verify`）で languages を **scaffold/seed 無しに全件復元**してコミットする。復元データが CI を緑にする。
- **Phase 2**: 3 workflow の PR 作成段を `gh pr create` へ置換。撤去 test-branch から `pokeapi-names.yml` を
  dispatch し、**全ステップ緑 + gh 由来で PR 自動作成**を GitHub Actions 上で確認する（E2E 検証）。
- **Phase 3**: plan 10 Phase 9 を移植。`author-regulation-data` 実行 + `verify-showdown-pr` 照合で
  **M-A・M-B 全データセット本投入**。>1000 行 1 PR 許容（[[planning]] 6 基準⑤ 例外・全 movepool 規模）。

## スコープ外

- `src/cli/index.ts` の eager import を lazy 化して `check:yaml-style` を generated から decouple する根本対応
  （P1 は workflow 順序で回避・decouple は将来計画）。
- 名前辞書の母集合拡張（rotom 以外の固有フォームの網羅）は、spec が参照する id が出た時点で whitelist に足す
  差分運用に留める（先回りで全フォーム列挙しない）。
- reg（M 系以外）の解禁データ拡充・テラス / ダイマ対応。

## 受け入れ基準

1. 各フェーズ末で `pnpm verify`（型 / カバレッジ100% / Biome / yaml-style）が緑。
2. `data/languages/*.yaml` を全削除した状態から、`pokeapi-names.yml` の dispatch **単独**で
   scaffold / seed / 手作業無しに全件名辞書を復元し、全ステップ緑になる（P1・P2・P3 解消）。
3. `pokeapi-names.yml` / `showdown-sync.yml` / `serebii-bulletin.yml` が **third-party action を使わず**
   PR を自動作成する（P4 解消）。
4. M-A・M-B の全データセットが本投入され、`check:regulation` / `generate:data` / `verify` が緑
   （`pokemon-data-reviewer` のデータ妥当性レビュー込み）。

## phase 分割（6 基準の評価サマリ）

- **意思決定の数**: P1-3 の各修正方針 / whitelist 粒度 / gh pr create 配線 = 中。Phase 1 に機構修正、
  Phase 2 に PR 作成機構、Phase 3 にデータ投入と関心を分けた。
- **不可逆性**: workflow 変更は可逆。データ投入（Phase 3）は append-only で慎重。
- **スコープ / diff**: Phase 1 は小コード + languages 復元（機械データ）、Phase 2 は workflow 3 本、
  Phase 3 は全 roster（>1000 行・分割困難ゆえ 1 PR 許容）。
- **並行性**: Phase 2（PR 作成機構）は Phase 1 の緑 main を前提とし直列。Phase 3 は Phase 2 の非 third-party
  PR 作成 + E2E 緑を前提に直列。

→ **3 phase**（Phase 3 = plan 10 Phase 9 の cross-plan move・[[planning]] の cross-plan move チェックリストに従う）。
