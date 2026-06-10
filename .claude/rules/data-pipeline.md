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
  - `regulations/<id>.yaml`（**1 レギュ = 1 ファイル**・**block 記法**。`name` / `period`（`start` 必須・`end` は開催中なら空＝`null`）/ `items` は**予約キー**。それ以外の**トップレベルキー = 解禁種族**（キーの存在 = allow）で、各種族キー下に **per-reg 習得技 `moves`** と、メガ運用種族は **`mega`（配列・1 種族複数メガ可）** をコロケーションする。`allow.{...}` ラッパーは廃止（ADR `0022`）。**解禁判定の正本**＝per-regulation 一本化（A案・ADR `0021`）。種族 / 持ち物 / メガの id は catalog を参照する。覚えない技（`moves` ⊄ learnset）・参照整合・schema は **authoring 時ゲート `check:regulation`** が検証する（`generate.ts` は変換専任・ADR `0023`。learnset 検証は `data/raw` 依存で未取得時は参照整合のみに degrade・CI はオフライン維持で本ゲートを課さない）)
  - `overrides.yaml`（習得技 / 特性の世代差・上書き）。**適用範囲は `generate.ts`（生成段の補正）のみ**。`check:regulation` の覚えない技検証は `data/raw` の **raw PokeAPI learnset を正とし `overrides.yaml` を適用しない**。よって「Serebii にあり PokeAPI learnset に無い技」は override では `check:regulation` を通せず、per-reg YAML から**除去で解消**する（override は authoring ゲートには効かない・learning #59）。
  - `catalog/{species,moves,items,abilities}.yaml`（vendor スコープのマニフェスト = 取得対象を**エンティティ種別ごと**に列挙する **append-only マスター**。`species.yaml` は `pokemon` + `megaLinks`、`items.yaml` は `items` + `itemMeta`、`abilities.yaml` は種族が参照する特性 id を持つ）。**append-only 方針**: 一度解禁されたものは後のレギュレーションで没収されても消さない（レギュレーションごとの解禁/非解禁の正本は別管理）。種族の `abilities` はカタログ id を参照し、カタログに無い id を参照すると `generate.ts` が**生成段でエラー**にして整合を担保する。
- **`data/generated/`** = **コミット**。`scripts/generate.ts` が raw と champions を合成して Dex 単位の `.ts` を出力する:
  - `types` / `moves` / `abilities` / `items` / `names`。
  - **`species-base.ts`**（`speciesBaseDex`・**全種族の reg 不変フィールドのみ**＝種族値 / タイプ / 日英名 / メガ先）。実数値計算・名前表示・coverage はレギュ非依存のためこの派生 base view を引く（per-reg 化・ADR `0021` 設計判断5）。
  - **`regulations/<id>/`**（**1 レギュ = 1 ディレクトリ**）= `species.ts`（**per-reg 種族 dex**＝そのレギュの roster ∪ mega 先・**per-reg 習得技 `moves`** を含む legality の型正本）+ `index.ts`（レギュメタ＝`name`/`period`/解禁集合に `speciesDex` を同梱）。集約 `regulations/index.ts` が `regulationDex` に集める。**global 単一 `species.ts` は廃止**（統合 view へのフラット化は技プールが潰れ過剰許容になるため採らない・ADR `0021`）。
  - 各ファイルは `export const xxxDex = {...} as const` の**値**から `type XxxDex = typeof xxxDex` / `XxxId = keyof XxxDex` で**型を派生**し、値と型を単一ソース化する（別ファイルに二重管理しない）。親型適合は `satisfies` / `Assignable`（[[type-conventions]] / [[tsc-verification]]）で検証し、出力後に Biome 整形して機械ゲートと一致させる。
- 生成物は手書き編集しない。raw / champions を直し、再生成する（オフライン・決定論的・CI 高速のため vendor をコミットする）。

## PokeAPI 項目対応

| 要求項目 | PokeAPI ソース |
|---|---|
| 全国図鑑番号・種族名 | `pokemon-species`, `pokemon.id` |
| フォルム / リージョン / メガ | `pokemon-form`, variety 群 |
| 種族値 | `pokemon.stats[].base_stat` |
| 覚える技 | `pokemon.moves[]`（version_group で世代を絞り `overrides.yaml` で補正） |
| タイプ / 特性 / 持ち物 | `pokemon.types[]` / `pokemon.abilities[]` / `item` エンドポイント |
| **レギュレーション解禁** | **PokeAPI に無し → `data/champions/regulations/<id>.yaml`** |

日本語名は PokeAPI の `names`（language=`ja`/`ja-Hrkt`）から生成段で自動付与する（手動データ不要）。MVP 時点で**全国図鑑の全種族分**を生成しておく。生成される型の形は [[type-conventions]]、検証は [[tsc-verification]] を参照。
