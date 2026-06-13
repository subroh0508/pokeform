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
  - `regulations/<id>.yaml`（**1 レギュ = 1 ファイル**・**block 記法**。`name` / `period`（`start` 必須・`end` は開催中なら空＝`null`）/ `items` は**予約キー**。それ以外の**トップレベルキー = 解禁種族**（キーの存在 = allow）で、各種族キー下に **per-reg 習得技 `moves`** と、メガ運用種族は **`mega`（配列・1 種族複数メガ可）** をコロケーションする。`allow.{...}` ラッパーは廃止（ADR `0022`）。**解禁判定の正本**＝per-regulation 一本化（A案・ADR `0021`）。種族 / 持ち物 / メガの id は catalog を参照する。参照整合（種族 / 持ち物 / メガ / 技が catalog に存在）・schema は **authoring 時ゲート `check:regulation`** が検証する（`generate.ts` は変換専任・ADR `0023`）。**覚えない技（learnset legality）の照合は撤去した**（PokeAPI は Champions 非対応で learnset が実態と一致しないため・ADR `0026`）。技が実ゲームで覚えるかは authoring 段（`survey-regulation` skill・Serebii 第一優先）で担保し、`check:regulation` は `data/raw` 非依存）
  - `overrides.yaml`（習得技 / 特性の世代差・上書き）。**適用範囲は `generate.ts`（生成段の補正）のみ**。`check:regulation` は learnset 照合を撤去した（ADR `0026`）ため、override と check ゲートの相互作用は無い（技の出自は Serebii 第一優先で authoring 段＝`survey-regulation` skill に担保）。
  - `catalog/{species,moves,items,abilities,types}.yaml`（vendor スコープのマニフェスト = エンティティ種別ごとの **append-only マスター**。**Phase 10 以降、各エントリは `id → { ja, en }` 形式で名前の SoT を持つ**（手書き・コミット）。`species.yaml` は `pokemon`（id→名前）+ `megaLinks`、`items.yaml` は `items`（id→名前 + `megaStoneFor?`・旧 `itemMeta` は各エントリへ統合）、`abilities.yaml` は特性 id→名前、`types.yaml` は 18 タイプの id→名前 + **相性倍率 `damageTo`**（非 1.0 のみ・generate が 1.0 補完）。`moves.yaml` は id→名前 + **技メタ `type` / `damageClass` / `power` / `accuracy` / `pp` / `priority`**（hand-authored・PokeAPI は Champions 非対応で技威力等の信頼源にしないため catalog が SoT・ADR 0026）。`generate.ts` は名前 / タイプ相性 / 技メタについて **`data/raw` を読まず** YAML を変換する（vendor 方式の名前 + types 相性部分は ADR 0025・技メタ部分は ADR 0026 の改訂）。種族の構造データ（種族値・タイプ・特性 id・持ち物 `category` 等）は引き続き raw 由来）。**append-only 方針**: 一度解禁されたものは後のレギュレーションで没収されても消さない（レギュレーションごとの解禁/非解禁の正本は別管理）。種族の `abilities` はカタログ id を参照し、カタログに無い id を参照すると `generate.ts` が**生成段でエラー**にして整合を担保する。カタログの ja/en 欠落は `generate.ts` が**生成段で非0終了**にする（authoring ゲート）。
- **`data/generated/`** = **コミット**。`scripts/generate.ts` が raw と champions を合成して Dex 単位の `.ts` を出力する:
  - `types`（name + `damageTo`）/ `moves`（name + 技メタ `type`/`damageClass`/`power`/`accuracy`/`pp`/`priority`・catalog YAML 由来・ADR 0026）/ `abilities`（**id のみ**）/ `items`（**`id` + `category?` + `megaStoneFor?`**・name 無し）/ `names`（ja→id 逆引き）。abilities / items が name を持たないのは名前の SoT が catalog YAML だから（Phase 10・効果フィールドは後続で足す前提で生成ファイル自体は残す）。
  - **`species-base.ts`**（`speciesBaseDex`・**全種族の reg 不変フィールドのみ**＝種族値 / タイプ / 日英名 / メガ先）。実数値計算・名前表示・coverage はレギュ非依存のためこの派生 base view を引く（per-reg 化・ADR `0021` 設計判断5）。
  - **`regulations/<id>/`**（**1 レギュ = 1 ディレクトリ**）= `species.ts`（**per-reg 種族 dex**＝そのレギュの roster ∪ mega 先・**per-reg 習得技 `moves`** を含む legality の型正本）+ `index.ts`（レギュメタ＝`name`/`period`/解禁集合に `speciesDex` を同梱）。集約 `regulations/index.ts` が `regulationDex` に集める。**global 単一 `species.ts` は廃止**（統合 view へのフラット化は技プールが潰れ過剰許容になるため採らない・ADR `0021`）。
  - 各ファイルは `export const xxxDex = {...} as const` の**値**から `type XxxDex = typeof xxxDex` / `XxxId = keyof XxxDex` で**型を派生**し、値と型を単一ソース化する（別ファイルに二重管理しない）。親型適合は `satisfies` / `Assignable`（[[type-conventions]] / [[tsc-verification]]）で検証し、出力後に Biome 整形して機械ゲートと一致させる。
- 生成物は手書き編集しない。raw / champions を直し、再生成する（オフライン・決定論的・CI 高速のため vendor をコミットする）。

## PokeAPI 項目対応

| 要求項目 | PokeAPI ソース |
|---|---|
| 全国図鑑番号 | `pokemon-species.id` |
| 種族値 | `pokemon.stats[].base_stat` |
| タイプ / 特性 / 持ち物 category | `pokemon.types[]` / `pokemon.abilities[]` / `item.category` |
| **使用できる技（learnset legality）** | **PokeAPI に無し（Champions 非対応・ADR 0026）→ `regulations/<id>.yaml` の per-species `moves`**（出自は Serebii 第一優先） |
| **技メタ（type / damageClass / power / accuracy / pp / priority）** | **PokeAPI を信頼源にしない（ADR 0026）→ `data/champions/catalog/moves.yaml`**（hand-authored・SoT） |
| **日英名 / タイプ相性** | **PokeAPI に無し（Phase 10）→ `data/champions/catalog/*.yaml`**（名前の SoT・types は + `damageTo`） |
| **レギュレーション解禁** | **PokeAPI に無し → `data/champions/regulations/<id>.yaml`** |

日英名は **`data/champions/catalog/*.yaml`（`id → { ja, en }`）が SoT**（Phase 10・手書き・コミット）。`generate.ts` は名前 / タイプ相性 / 技メタについて PokeAPI を読まず YAML を変換する（`type` / `ability` / `pokemon-form` / `move` は raw 取得しない）。技メタを catalog SoT にするのは PokeAPI が Champions 非対応で技威力等が実態と一致しないため（ADR 0026）。MVP 時点で**全国図鑑の全種族分**を生成しておく。生成される型の形は [[type-conventions]]、検証は [[tsc-verification]] を参照。
