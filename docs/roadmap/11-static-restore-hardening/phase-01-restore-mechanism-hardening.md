# Phase 1 — 復元機構の堅牢化（P1 順序 / P2 materialize scaffold-free / P3 固有フォーム whitelist）+ languages 復元

## 目的 / スコープ

`author-static-data` の from-scratch 復元を阻む 3 前提を機構側で解消し、fixed flow で `data/languages/*.yaml`
を **scaffold / seed / 手作業無し**に全件復元して main を緑へ戻す。PR 作成の非 third-party 化（P4）は Phase 2、
全件本投入（reg データ）は Phase 5 でスコープ外。

## 前提（依存）

- なし（broken main = PR #218 の撤去状態から着手）。
- 確定規約: [[data-pipeline]]（名前辞書 / 取得元分担 / ADR 0041）/ [[testing]]（コロケーション・カバレッジ100%）/
  [[tsc-verification]]。

## タスク

- [ ] **P1**: `.github/workflows/pokeapi-names.yml` の `Style, generate, verify` 段を
  `generate:data → check:yaml-style → verify` の順へ変更（生成 ts を先に作り CLI 起動可能にする）。
- [ ] **P2**: `src/codegen/materialize.ts` に「欠損ファイル / null・undefined map のとき block `YAMLMap` を新規
  作成して返す」純関数を足し、`scripts/materialize.ts` の `backfillNames` が既存ファイル不在 / map 不在でも
  block スタイルで append できるようにする（`flow=false` を担保）。scaffold（seed / 空マップ）を不要化。
- [ ] P2 のコロケーション test を追加（欠損ファイル・null map・既存 block map への append の 3 系統・カバレッジ100%）。
- [ ] **P3**: `scripts/fetch-pokeapi.ts` に固有フォーム whitelist（`SPECIES_FORMS = ["rotom-wash", ...]`・
  `ITEM_CATEGORIES` と同型の curated 定数）を足し、`pokemon-form` の `form_names`（ja/en）を species 名として
  raw 化する。`materialize` 側で species.yaml へ append する経路を通す。
- [ ] fixed flow（`fetch:ja-names` → `sync:ja-names` → `generate:data`）で languages を全件復元し、生成 ts と
  ともにコミット（`rotom-wash` は P3 で自動取得・seed 不要）。
- [ ] `data/champions/rules.yaml` / `type-specs.yaml` は撤去対象外で存在済み（本 phase は触らない）。

## この Phase で育てるハーネス（rule・skill）

- **[[data-pipeline]] 追記**: 固有フォーム whitelist（`SPECIES_FORMS`）を species 名取得の一部として明文化
  （「pokeform 固有フォームは対象外」の但し書きを「curated whitelist で `pokemon-form` から取得」へ更新）。
- **`author-static-data` SKILL.md 更新**: step 4 scaffold の記述を「materialize が欠損 / 空を耐性化したため
  scaffold 不要」へ改訂。生成 ts 事前存在の注意（P1）と固有フォーム whitelist（P3）を Gotchas に追記。
- 機構修正の ADR 要否は判断（材料化の耐性化・取得元 whitelist 拡張は既存 ADR 0041/0042 の運用内なら ADR 不要）。

## 受け入れ基準

1. `pnpm verify` 緑。
2. `data/languages/*.yaml` を全削除した状態から `pnpm fetch:ja-names` → `pnpm sync:ja-names` →
   `pnpm generate:data` → `pnpm verify` が **scaffold / seed 無し**で緑（P1 は workflow 順序、ローカルは順序自由）。
3. `rotom-wash` の ja/en が PokeAPI `pokemon-form` 由来で languages に入る（手作業 seed 無し）。
4. main が緑へ復帰（撤去 PR #218 分の languages + 生成 ts が復元済み）。

## 検証手順

1. ローカルで `data/languages/{species,items,moves,abilities,types,mega}.yaml` を削除。
2. `pnpm fetch:ja-names`（固有フォーム whitelist 込み）→ `pnpm sync:ja-names`（欠損ファイルから block map 新規
   作成）→ `pnpm generate:data`（`no name entry` 無し）→ `pnpm verify` 緑を確認。
3. `rotom-wash` が species.yaml に ja「ウォッシュロトム」/ en「Wash Rotom」で入っていることを確認。
4. コロケーション test でカバレッジ100%（欠損 / null map / 既存 map の 3 系統）。

## リスク・備考

- P1 は workflow 順序での回避。`check:yaml-style` が `src/cli/index.ts` 経由で generated に依存する eager import
  自体は残る（fresh checkout で generate 前に CLI コマンドを叩くと同様に落ちる）。根本 decouple は将来計画。
- P3 の whitelist は差分運用（spec が参照する固有フォーム id が出るたび追加）。先回りで全フォーム列挙しない。
- 本 phase の PR は languages 復元（機械データ・大 diff）を含む。コード修正部（materialize / fetch / workflow）は
  独立してレビュー可能。データ妥当性は `pokemon-data-reviewer` に委ねる。
