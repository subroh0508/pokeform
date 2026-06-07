---
paths:
  - "scripts/**"
  - "data/**"
description: データ生成パイプライン（raw=gitignore / champions=手動 / generated=commit の vendor 方式・PokeAPI 項目対応・overrides）。scripts/ や data/ を扱うとき適用する。
---

# データ生成パイプラインの規約

PokeAPI を vendor 方式で取り込み `data/generated/` を出力する流れの要点。正本は `docs/plan/01-mvp/architecture.md`（「データ生成パイプライン」節）と ADR `0012-vendor-pokeapi-data`。

## ディレクトリの扱い（vendor）

- **`data/raw/`** = `.gitignore`（PokeAPI 取得キャッシュ。`scripts/fetch-pokeapi.ts` が生成）。
- **`data/champions/`** = **コミット・手動管理**。PokeAPI に無い情報の唯一のソース:
  - `rules.yaml`（能力ポイント 66/32・計算式定数）
  - `regulation.yaml`（各レギュの解禁許可リスト）
  - `overrides.yaml`（習得技 / 特性の世代差・上書き）
  - `roster.yaml`（vendor スコープのマニフェスト = 取得対象 pokemon / moves / items・メガ links）
- **`data/generated/`** = **コミット**。`scripts/generate.ts` が raw と champions を合成して Dex 単位の `.ts`（`types` / `moves` / `abilities` / `items` / `species` / `regulations` / `names`）を出力する。各ファイルは `export const xxxDex = {...} as const` の**値**から `type XxxDex = typeof xxxDex` / `XxxId = keyof XxxDex` で**型を派生**し、値と型を単一ソース化する（別ファイルに二重管理しない）。親型適合は `satisfies` / `Assignable`（[[type-conventions]] / [[tsc-verification]]）で検証し、出力後に Biome 整形して機械ゲートと一致させる。
- 生成物は手書き編集しない。raw / champions を直し、再生成する（オフライン・決定論的・CI 高速のため vendor をコミットする）。

## PokeAPI 項目対応

| 要求項目 | PokeAPI ソース |
|---|---|
| 全国図鑑番号・種族名 | `pokemon-species`, `pokemon.id` |
| フォルム / リージョン / メガ | `pokemon-form`, variety 群 |
| 種族値 | `pokemon.stats[].base_stat` |
| 覚える技 | `pokemon.moves[]`（version_group で世代を絞り `overrides.yaml` で補正） |
| タイプ / 特性 / 持ち物 | `pokemon.types[]` / `pokemon.abilities[]` / `item` エンドポイント |
| **レギュレーション解禁** | **PokeAPI に無し → `data/champions/regulation.yaml`** |

日本語名は PokeAPI の `names`（language=`ja`/`ja-Hrkt`）から生成段で自動付与する（手動データ不要）。MVP 時点で**全国図鑑の全種族分**を生成しておく。生成される型の形は [[type-conventions]]、検証は [[tsc-verification]] を参照。
