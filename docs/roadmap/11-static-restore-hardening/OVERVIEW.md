# 11-static-restore-hardening — 名前辞書 from-scratch 復元堅牢化 + 非 third-party PR 作成 + distinct-forms 名対応 + 全件本投入 OVERVIEW

## ゴール

`author-static-data`（`pokeapi-names.yml`）の**完全撤去状態からの復元**が、GitHub Actions 上で
**third-party action 無し**に全ステップ緑で通り、**フォルム・リージョン・性別等でタイプ / 種族値が変わる
variety が canonical 明示 slug + 含有判定合成で正しく名付けられ**、最後に **M-A・M-B の全データセット本投入**まで
到達する状態。利用者（コーディングエージェント）が `data/` を完全削除しても、機械的な取得フローだけで
distinct-forms を含む名前辞書 → per-reg 解禁データを冪等に復元できる。

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
  **緑へ戻す**（以降の phase は緑 main 上で進む）。全件本投入（reg データ）は Phase 5。
- **フォルム対応（Phase 3-4・本投入の前段）**: PokeAPI と showdown の id スキームは体系的に食い違う
  （showdown はデフォルト bare `deoxys` / PokeAPI は明示 `deoxys-normal`）。**species id 正本を明示 slug 方式
  （PokeAPI 準拠）に定め、showdown を canonical へ正規化**（Phase 3）してから、**タイプ / 種族値が異なる全 form の
  ja/en を含有判定ルールで合成し reg 非依存の distinct-forms 辞書へ投入**（Phase 4）する。M-A・M-B が含む form を
  正しい id・表示名で投入するため全件本投入の前に置く。

## 実装指針

- **Phase 1**: `scripts/materialize.ts` + `src/codegen/materialize.ts`（P2）/ `scripts/fetch-pokeapi.ts`（P3）/
  `pokeapi-names.yml` 順序（P1）を修正し、fixed flow（`fetch:ja-names` → `sync:ja-names` → `generate:data` →
  `verify`）で languages を **scaffold/seed 無しに全件復元**してコミットする。復元データが CI を緑にする。
- **Phase 2**: 3 workflow の PR 作成段を `gh pr create` へ置換。撤去 test-branch から `pokeapi-names.yml` を
  dispatch し、**全ステップ緑 + gh 由来で PR 自動作成**を GitHub Actions 上で確認する（E2E 検証）。
- **Phase 3**: `src/codegen/showdown/` に `canonicalSpeciesId` + 正規化マップ 3 種（default→明示 / Class C 語彙差 /
  `CANONICAL_ID_OVERRIDE`）を純関数で追加し、specs id を canonical 明示 slug で emit する。決定を ADR 化。
- **Phase 4**: `src/codegen/materialize.ts` に含有判定合成（`composeFormName`）+ base 導出（`deriveBaseId`）+
  distinct 述語を追加、`scripts/fetch-pokeapi.ts` を distinct 列挙へ（`SPECIES_FORMS` 廃止）、`FORM_INCLUDE` /
  `MANUAL_NAME_OVERRIDE` を著述、`pokeapi-names.yml` に PR レビュー表を出力し distinct-forms 名（約87件）を投入。
- **Phase 5**: plan 10 Phase 9 を移植。`author-regulation-data` 実行 + `verify-showdown-pr` 照合で
  **M-A・M-B 全データセット本投入**。>1000 行 1 PR 許容（[[planning]] 6 基準⑤ 例外・全 movepool 規模）。

## スコープ外

- `src/cli/index.ts` の eager import を lazy 化して `check:yaml-style` を generated から decouple する根本対応
  （P1 は workflow 順序で回避・decouple は将来計画）。
- **純装飾フォルム**（同型・同種族値の vivillon 模様 / alcremie / minior 色 等）は distinct-forms 辞書に入れない
  （Phase 4 の distinct フィルタで除外）。`-mega` / `-gmax` / `-primal` / `-totem` / `-starter` も対象外
  （mega 名は mega.yaml・ADR 0043 経路で不変）。
- **構造データ（どの form が存在するか・baseStats / types / legality）の取得は showdown-sync の責務**（Phase 3-4 は
  id 正規化と名前生成のみで、form の構造抽出はしない）。
- reg（M 系以外）の解禁データ拡充・テラス / ダイマ対応。

## 受け入れ基準

1. 各フェーズ末で `pnpm verify`（型 / カバレッジ100% / Biome / yaml-style）が緑。
2. `data/languages/*.yaml` を全削除した状態から、`pokeapi-names.yml` の dispatch **単独**で
   scaffold / seed / 手作業無しに全件名辞書を復元し、全ステップ緑になる（P1・P2・P3 解消）。
3. `pokeapi-names.yml` / `showdown-sync.yml` / `serebii-bulletin.yml` が **third-party action を使わず**
   PR を自動作成する（P4 解消）。
4. species id が canonical 明示 slug で emit され（`canonicalSpeciesId` + 正規化 3 マップ・カバレッジ100%）、
   PokeAPI/showdown の id スキーム食い違いが吸収される。決定の ADR が採番・作成済み（Phase 3）。
5. **タイプ / 種族値が異なる全 form** の ja/en が含有判定合成で `data/languages/species.yaml` に投入され
   （約87件・canonical id キー）、`generate:data` が superset 許容で緑。代表確認: rotom 全5 / basculegion オス・メス /
   urshifu 一撃・連撃 / gimmighoul 箱・徒歩 / 各リージョン / greninja-battle-bond が正しい表示名で存在（Phase 4）。
6. M-A・M-B の全データセットが本投入され、`check:regulation` / `generate:data` / `verify` が緑
   （`pokemon-data-reviewer` のデータ妥当性レビュー込み・Phase 5）。

## phase 分割（6 基準の評価サマリ）

- **意思決定の数**: P1-3 の各修正方針 / gh pr create 配線（Phase 1-2）/ canonical id 正本の定義（Phase 3）/
  含有合成ルール・distinct フィルタ・3 リスト（Phase 4）/ 全件投入（Phase 5）と、独立した設計判断が層別に分かれる。
  構造側 id 正規化（Phase 3）と名前側生成（Phase 4）は関心が異なるため分割した。
- **不可逆性**: workflow / 純関数変更は可逆。canonical id 正本の定義（Phase 3）は個体 YAML 参照・specs id に及ぶ
  ため慎重に ADR 化。名前投入（Phase 4）・データ投入（Phase 5）は append-only。
- **スコープ / diff**: Phase 1 は小コード + languages 復元、Phase 2 は workflow 3 本、Phase 3 は showdown codegen
  純関数 + マップ（現行 specs 無変化）、Phase 4 は materialize/fetch 純関数 + distinct 名投入（約87件）、
  Phase 5 は全 roster（>1000 行・分割困難ゆえ 1 PR 許容）。
- **並行性**: 直列鎖 Phase 1 → 2 → 3 → 4 → 5。Phase 4 は Phase 3 の canonical id を前提、Phase 5 は Phase 4 の
  distinct-forms 名を前提とする（form を含む roster を正しく投入するため）。

→ **5 phase**（Phase 3-4 = フォルム対応の挿入・本投入の前段。Phase 5 = plan 10 Phase 9 の cross-plan move・
[[planning]] の cross-plan move チェックリストに従う）。
