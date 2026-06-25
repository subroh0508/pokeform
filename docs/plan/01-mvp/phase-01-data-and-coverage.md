# Phase 1 — データ生成 + 一貫性/技範囲チェック（MVP コア）

## 目的 / スコープ

PokeAPI を vendor して全種族データを生成し、**`check:party`（パーティ一貫性）** と **`analyze:coverage`（技範囲・防御弱点）** を提供する。**ここまでで要求 MVP を達成**。アーキ詳細は [`docs/design/`](../../design/README.md)（旧 `architecture.md` を分割昇格）。

## 前提（依存）

- Phase 0（`StatKey`/相性型/`calc-stats`）。
- 規約 `data-pipeline` / `cli-and-io` / `type-conventions`（本フェーズで確定）。

## タスク

### データ生成パイプライン（vendor）

- [ ] `scripts/fetch-pokeapi.ts`: PokeAPI を取得し `data/raw/`（gitignore）にキャッシュ。
- [ ] `data/champions/*.yaml`（手動・コミット）: `rules.yaml`（能力ポイント 66/32・計算定数）/ `regulation.yaml`（解禁許可リスト）/ `overrides.yaml`（習得技・特性の世代差）。
- [ ] `scripts/generate.ts`: raw + champions を合成し `data/generated/` を出力（コミット）:
  - `SpeciesBase`/`SpeciesDex`、`TypeDex`、`MoveDex`、`AbilityDex`、`ItemDex`（`XxxBase` + `XxxId = keyof XxxDex` 統一・**日英 `name`** と逆引きマップ）。
  - 種族粒度＝種族値一意（フォルム/リージョン/メガは別 `SpeciesId`）。
- [ ] `src/types/species.ts` ほか: 生成物の re-export と公開型。

### I/O と分析

- [ ] `src/io/resolve-paths.ts`: ディレクトリ再帰 glob（`tinyglobby`）。
- [ ] `src/io/load-party.ts`: `gray-matter` で frontmatter + 本文。`lang: ja|en` でメンバー/名称を ID 正規化。
- [ ] `src/domain/type-effectiveness.ts`: 単/複合タイプ倍率（第9世代準拠の静的相性表、複合は積）。
- [ ] `src/domain/coverage.ts`:
  - **攻撃範囲**: 各個体の攻撃技（`damageClass != status`）からタイプ集合→18 防御タイプ中、等倍超を出せない「穴」を列挙。
  - **防御弱点**: 攻撃タイプ A ごとに `weakCount = #{倍率≥2}` / `resistCount = #{倍率≤0.5}`。`weakCount ≥ 3` を脆弱警告。メガ持ちは `megaEvolvesTo` 先タイプでも追加分析。

### CLI（`cac`）

- [ ] `src/cli/index.ts` + `commands/`:
  - [ ] `pokeform check:party <path>`: frontmatter のメンバー解決・**同種族重複**・**未解禁混入**・体数 ≤6・参照切れを検出。非0終了。
  - [ ] `pokeform analyze:coverage <path>`: 弱点集中（例 Fire 3 体）と技範囲の穴を表で出力。脆弱時は非0終了。`--lang ja|en` で表示言語。
- [ ] `package.json` scripts に `check:party` / `analyze:coverage` を割当。

## この Phase で育てるハーネス

- rule: `data-pipeline` / `cli-and-io` / `type-conventions` を確定。
- skill: `review-party`（`check:party` + `analyze:coverage` 実行→要約）を canonical + symlink で作成。
- agent: `pokemon-data-reviewer`（生成データ妥当性レビュー）。

## 受け入れ基準

- サンプル `team/`（個体 YAML + パーティ MD）に対し `analyze:coverage` が弱点集中/技範囲の穴を表示し脆弱時に非0終了。
- `check:party team/parties/`（ディレクトリ再帰）が重複/未解禁/参照切れを検出。
- `pnpm verify` 緑（`type-effectiveness`/`coverage` のドメイン純関数は 100% カバレッジ）。

## 検証手順

1. `pnpm generate:data` で `data/generated/` が全種族分生成される。
2. `pnpm pokeform analyze:coverage team/parties/standard.md` の出力と終了コードを確認。
3. 重複/未解禁を含むパーティで `check:party` が非0終了することを確認。
4. タイプ相性テスト（18×18 代表セル + ×4/×0.25/×0）が緑。

## リスク・備考

- PokeAPI に無い情報（能力ポイント・解禁レギュ）は `data/champions/` が唯一のソース。生成は決定論的に（raw キャッシュ固定）。
- 生成データのコミットでリポジトリは肥大化するが、オフライン・CI 速度を優先（`data/raw` のみ gitignore）。
