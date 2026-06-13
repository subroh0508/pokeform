# Phase 1 — カタログ分離（種族 / 技 / 持ち物 / 特性の append-only マスター）

## 目的 / スコープ

`data/champions/roster.yaml` に混在する vendor 対象（pokemon / moves / items / megaLinks / itemMeta）を、
**エンティティ種別ごとの独立カタログ YAML** に分離する。チャンピオンズに解禁済みのものだけを記録し、
一度載せたら没収されても消さない **append-only マスター**として位置づける。特性も独立カタログ化し、
種族はその id を参照する形にする。

**この phase のゴールは構造の付け替えのみ**で、生成される `data/generated/*` の値は（特性カタログの明示化を除き）
**等価に保つ**。解禁情報・期間・per-reg 型は Phase 2 で扱う（ここではまだ `regulation.yaml` は現状維持）。

- スコープ内: `data/champions/catalog/{species,moves,items,abilities}.yaml` の新設、`roster.yaml` の廃止、
  `fetch-pokeapi.ts` / `generate.ts` のカタログ読み込みへの改修、`data-pipeline.md` rule の追従。
- スコープ外: レギュレーション YAML の per-reg 化・period・per-reg 型生成・`SpeciesBase.regulations[]` 廃止
  （すべて Phase 2）。M-A の実データ拡充（Phase 3/4）。

## 前提（依存）

- なし（本計画群の最初の phase）。
- 確定済み rule: [[data-pipeline]]（vendor 方式・ディレクトリの扱い）/ [[type-conventions]]（XxxBase + Dex + Id）/
  [[cross-agent]]。ADR 0012（vendor-pokeapi-data）。

## タスク

- [ ] `data/champions/catalog/` を新設し、`roster.yaml` の内容を 4 ファイルへ分離:
  - [ ] `species.yaml` — 解禁済み種族 slug 一覧 + `megaLinks`（base → メガ先）。
  - [ ] `moves.yaml` — 解禁済み技 id 一覧。
  - [ ] `items.yaml` — 解禁済み持ち物 id 一覧 + `itemMeta`（megaStoneFor）。
  - [ ] `abilities.yaml` — 解禁済み特性 id 一覧（現状 PokeAPI から自動収集している特性を明示カタログ化）。
- [ ] 各カタログ YAML の冒頭コメントに append-only 方針（没収されても消さない）と出典・更新規約を明記。
- [ ] `roster.yaml` を削除。
- [ ] `scripts/fetch-pokeapi.ts` を catalog 読み込みへ改修（取得対象 slug をカタログから集約）。
- [ ] `scripts/generate.ts` を catalog 読み込みへ改修。特性は abilities カタログを正本に生成し、種族の
      `abilities` はカタログ id を参照（カタログに無い id は生成段でエラーにし整合を担保）。
- [ ] 生成物 `data/generated/*` を再生成し、Phase 1 前後で値が等価（特性カタログ明示化を除く）であることを差分確認。
- [ ] `.claude/rules/data-pipeline.md` の「ディレクトリの扱い」をカタログ分離後の構造へ更新（`roster.yaml` →
      `catalog/*.yaml`、append-only 方針を追記）。Codex 向け `rules-index.md` は生成物なので手編集しない。

## この Phase で育てるハーネス（rule・skill）

- `.claude/rules/data-pipeline.md` を catalog 構造へ追従更新（rule 追記のみ・新規 skill なし）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- `pnpm fetch:data` → `pnpm generate:data`（コマンド名は実装に合わせる）が catalog から動作し、`data/generated/*`
  が再生成できる。
- `roster.yaml` が無く、種族 / 技 / 持ち物 / 特性が各 catalog YAML に分離されている。
- 種族 YAML（生成 species.ts）の `abilities` が abilities カタログの id を参照し、参照切れがない。
- Phase 1 前後で生成値が等価（特性カタログ明示化による差分のみ・差分理由を PR に明記）。

## 検証手順

1. `git stash` 等で再生成前の `data/generated/*` を退避 →（または再生成前後を `git diff` で比較）。
2. `pnpm fetch:data && pnpm generate:data` を実行し再生成。差分が特性カタログ明示化のみであることを確認。
3. `pnpm verify` 緑を確認。
4. catalog の id を 1 つ意図的に削っても生成段で参照切れエラーになる（append-only / 整合担保）ことを確認。

## リスク・備考

- **生成出力の等価維持**: ここで値が変わると Phase 2 以降の差分が読みにくくなる。abilities カタログ明示化に
  伴う差分（順序・収集元の違い）が出る場合は理由を PR に明記する。
- abilities を「種族から自動収集」から「明示カタログ参照」へ変える場合、初期カタログは現状の自動収集結果を
  seed にする（取りこぼし防止）。append-only なので以後は skill/AI 経由で追記。
- `roster.yaml` 削除に伴うドキュメント・スクリプト内パス参照の追従漏れに注意（grep で洗う）。
