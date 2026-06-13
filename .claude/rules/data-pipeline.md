---
paths:
  - "scripts/**"
  - "data/**"
description: データ生成パイプライン（raw=取得キャッシュ / champions catalog=SoT / generated=raw 非依存合成の vendor 方式・取得元 PokeAPI / SoT catalog / materialize 転記）。scripts/ や data/ を扱うとき適用する。
---

# データ生成パイプラインの規約

PokeAPI を **取得元**に vendor 方式で取り込み、構造データの **SoT は catalog YAML** に置いて `data/generated/` を出力する流れの要点。正本は `docs/plan/01-mvp/architecture.md`（「データ生成パイプライン」節）と ADR `0012-vendor-pokeapi-data`（取得方式）/ ADR `0027-structural-data-catalog-sot`（構造データ SoT を catalog へ・generate raw 非依存）。

## data/champions の運用方針（skill 著述・人間直編集 NG）

`data/champions/**`（`catalog/*.yaml` / `regulations/*.yaml` / `rules.yaml`）は **skill 著述で維持し、人間が直接エディタで編集しない**。著述主体は **`survey-regulation` / `author-individual` を実行する AI エージェント**で、[ADR 0026](../../docs/adr/0026-pokeapi-not-champions-legality-source.md) の方針どおり Serebii 等の出典を閲覧して YAML へ転記する。人間の直編集を禁じるのは、出典との同期・再現性（同じ skill を再実行すれば同じ結果に収束する性質）を壊さないためで、決定の「なぜ」は [ADR 0030](../../docs/adr/0030-data-champions-skill-authored.md)。

- **訂正経路**: 誤りの訂正は **skill 再実行または AI への直接指示**を経由する。`catalog` / `regulations` の訂正は対応 skill（`survey-regulation` 等）の再実行で行う。**`rules.yaml` は対応 skill が無いため改定経路を「AI への直接指示」と定義する**（人間が直接書き換えるのではなく AI に指示して書かせる）。
- **強制レベル**: 人間直編集 NG は **規約・方針レベルで担保**する。「誰が編集したか」は機械判定しづらく CI 強制が困難なため、本方針は機械ゲートでは強制しない（直編集を warn する check の要否は将来判断・ADR `0030`）。

## 取得 → 転記 → 合成の三段（raw=キャッシュ / catalog=SoT / generated=合成）

- **取得元 = PokeAPI**（継続・`fetch:data`）。取得した構造データ（種族値 / タイプ / 特性 id / 図鑑番号 / 持ち物 category）の **SoT は `data/champions/catalog/*.yaml`**（skill-authored・コミット）。raw は転記元の取得キャッシュに過ぎず、`generate.ts` は raw を読まない（ADR `0027`）。
- **`scripts/materialize.ts`**（転記段）= raw → catalog の構造データ転記専任。**raw 必須・fail-fast**（不在なら ENOENT で即エラー・自前の存在チェックや `fetch:data` 誘導は持たない）。**append/既存尊重**: 未設定フィールドのみ raw 由来値で埋め、既存値は raw と異なっても上書きせず conflict を提示する（Champions 実態に合わせた skill 著述値を保護）。**raw 存在の担保は呼び出し側 `survey-regulation` skill の責務**（手順で `fetch:data` → `materialize` の順を保証する。スクリプトは前提が揃っている前提で動き、欠けたら fail-fast＝責務の二重化を避ける・ADR `0027`）。
- **`scripts/generate.ts`**（合成段）= catalog YAML のみを変換し `data/generated/` を出力。**raw 非依存**（決定論的・raw 不在でも動く）。

## 統一用語: skill-authored（定義 SoT）

ソースとして著述される SoT を **`skill-authored`**（英語ラベルのまま・日本語化しない）と呼ぶ。本節がこの語の定義の SoT で、SKILL / README 等はここへのポインタにする（二重管理回避）。

- **意味**: 「`generate` / `materialize` の派生出力ではないソース著述。著述主体は skill を実行する AI（人間は直接編集せず skill/AI を経由する）」。機械転記の `materialize` と対比される語。
- **対象**: 上記「運用方針」の `data/champions/**`（`catalog` の名前 / 構造データ / 技メタ、`regulations` の解禁・per-species `moves`、`rules.yaml`）。表「項目の取得元 / SoT / 転記」で転記列が `materialize` でないソース著述値がこれにあたる。
- **`materialize` の保護対象 = skill-authored 値**: `materialize` の **append/既存尊重**（未設定フィールドのみ raw 由来値で埋め、既存値は上書きせず conflict 提示・ADR `0027`）が保護するのは **skill-authored 値**である。append/既存尊重の設計自体は不変で、保護される値の主体が「人間の手修正」ではなく「skill/AI の著述値」だと整理されるだけ（ADR `0030`）。

## ディレクトリの扱い（vendor）

- **`data/raw/`** = `.gitignore`（PokeAPI 取得キャッシュ＝`materialize` の転記元。`scripts/fetch-pokeapi.ts` が生成。`generate` は読まない）。
- **`data/champions/`** = **コミット・skill 著述（人間直編集 NG）**。PokeAPI に無い情報の唯一のソース:
  - `rules.yaml`（能力ポイント 66/32・計算式定数）
  - `regulations/<id>.yaml`（**1 レギュ = 1 ファイル**・**block 記法**。`name` / `period`（`start` 必須・`end` は開催中なら空＝`null`）/ `items` は**予約キー**。それ以外の**トップレベルキー = 解禁種族**（キーの存在 = allow）で、各種族キー下に **per-reg 習得技 `moves`** と、メガ運用種族は **`mega`（配列・1 種族複数メガ可）** をコロケーションする。`allow.{...}` ラッパーは廃止（ADR `0022`）。**解禁判定の正本**＝per-regulation 一本化（A案・ADR `0021`）。種族 / 持ち物 / メガの id は catalog を参照する。参照整合（種族 / 持ち物 / メガ / 技が catalog に存在）・schema は **authoring 時ゲート `check:regulation`** が検証する（`generate.ts` は変換専任・ADR `0023`）。**覚えない技（learnset legality）の照合は撤去した**（PokeAPI は Champions 非対応で learnset が実態と一致しないため・ADR `0026`）。技が実ゲームで覚えるかは authoring 段（`survey-regulation` skill・Serebii 第一優先）で担保し、`check:regulation` は `data/raw` 非依存）
  - `catalog/{species,moves,items,abilities,types}.yaml`（vendor スコープのマニフェスト = エンティティ種別ごとの **append-only マスター**で、**全データの SoT**。**Phase 10 以降、各エントリは `id → { ja, en }` 形式で名前の SoT を持つ**（skill 著述・コミット）。`species.yaml` は `pokemon`（id→名前 + **構造データ `dex` / `types` / `stats`(H/A/B/C/D/S) / `abilities`**・ADR 0027）+ `megaLinks`、`items.yaml` は `items`（id→名前 + `megaStoneFor?` + **`category`**・旧 `itemMeta` は各エントリへ統合）、`abilities.yaml` は特性 id→名前、`types.yaml` は 18 タイプの id→名前 + **相性倍率 `damageTo`**（非 1.0 のみ・generate が 1.0 補完）。`moves.yaml` は id→名前 + **技メタ `type` / `damageClass` / `power` / `accuracy` / `pp` / `priority`**（skill-authored・PokeAPI は Champions 非対応で技威力等の信頼源にしないため catalog が SoT・ADR 0026）。`generate.ts` は名前 / タイプ相性 / 技メタ / **構造データとも raw を読まず** YAML を変換する（名前 + types 相性は ADR 0025・技メタは ADR 0026・構造データ（種族値 / タイプ / 特性 id / 図鑑番号 / 持ち物 `category`）は ADR 0027 で catalog SoT 化）。構造データの転記は `materialize.ts`（raw → catalog・append/既存尊重）が担う。**append-only 方針**: 一度解禁されたものは後のレギュレーションで没収されても消さない（レギュレーションごとの解禁/非解禁の正本は別管理）。種族の `abilities` はカタログ id を参照し、カタログに無い id を参照すると `generate.ts` が**生成段でエラー**にして整合を担保する。カタログの ja/en 欠落は `generate.ts` が**生成段で非0終了**にする（authoring ゲート）。
- **`data/generated/`** = **コミット**。`scripts/generate.ts` が champions catalog を変換して（raw 非依存・ADR 0027）Dex 単位の `.ts` を出力する:
  - `types`（name + `damageTo`）/ `moves`（name + 技メタ `type`/`damageClass`/`power`/`accuracy`/`pp`/`priority`・catalog YAML 由来・ADR 0026）/ `abilities`（**id のみ**）/ `items`（**`id` + `category?` + `megaStoneFor?`**・name 無し）/ `names`（ja→id 逆引き）。abilities / items が name を持たないのは名前の SoT が catalog YAML だから（Phase 10・効果フィールドは後続で足す前提で生成ファイル自体は残す）。
  - **`species-base.ts`**（`speciesBaseDex`・**全種族の reg 不変フィールドのみ**＝種族値 / タイプ / 日英名 / メガ先）。実数値計算・名前表示・coverage はレギュ非依存のためこの派生 base view を引く（per-reg 化・ADR `0021` 設計判断5）。
  - **`regulations/<id>/`**（**1 レギュ = 1 ディレクトリ**）= `species.ts`（**per-reg 種族 dex**＝そのレギュの roster ∪ mega 先・**per-reg 習得技 `moves`** を含む legality の型正本）+ `index.ts`（レギュメタ＝`name`/`period`/解禁集合に `speciesDex` を同梱）。集約 `regulations/index.ts` が `regulationDex` に集める。**global 単一 `species.ts` は廃止**（統合 view へのフラット化は技プールが潰れ過剰許容になるため採らない・ADR `0021`）。
  - 各ファイルは `export const xxxDex = {...} as const` の**値**から `type XxxDex = typeof xxxDex` / `XxxId = keyof XxxDex` で**型を派生**し、値と型を単一ソース化する（別ファイルに二重管理しない）。親型適合は `satisfies` / `Assignable`（[[type-conventions]] / [[tsc-verification]]）で検証し、出力後に Biome 整形して機械ゲートと一致させる。
- 生成物は手書き編集しない。**champions catalog（skill 著述）を skill/AI 経由で直し**、再生成する（オフライン・決定論的・CI 高速のため vendor をコミットする）。

## YAML はブロックスタイルで書く（flow 禁止ゲート）

`data/` 配下の skill 著述 YAML（`catalog/*` / `regulations/*` / `rules.yaml`）は **flow スタイル**（`[ a, b ]` / `{ k: v }` のインライン記法）を**使わず、すべてブロックスタイル**で書く。理由は、flow と block が混在すると diff の可読性が落ち（1 行に複数値が入ると行単位 diff で値の変化を追えない）、レビューで値の変化を見落としやすくなるため。Champions M-A 全量（全186種）のような大量データを最初から block で投入し、後から全量を再整形し直す事故を防ぐ。

- **強制ゲート = `check:yaml-style`**（`src/cli/commands/check-yaml-style.ts`・薄い CLI 配線）。`data/**/*.yaml`（`data/raw` は `.gitignore` の取得キャッシュなので**対象外**）を走査し、flow コレクションを 1 つでも検出したら**非0終了**して該当 `path:line` を報告する。検出は **AST ベース**の純関数 `src/domain/yaml-block-style.ts`（`findFlowCollections`）に委譲する。正規表現で `[` / `{` を弾くと文字列値中の括弧で誤検出するため採らない（[[testing]] の純関数として網羅・カバレッジ 100%）。
- **配線**: local は `.githooks/pre-commit`、CI は `pnpm verify`（`= typecheck && test:cov && lint && check:yaml-style`）が同一スクリプトを呼ぶ（ゲートは `.githooks` / `verify` に集約し二重実装しない・[ADR 0013](../../docs/adr/0013-git-hooks-over-claude-hooks.md)）。
- **検証は tsc のみ（[ADR 0010](../../docs/adr/0010-tsc-only-verification.md)）の例外**: 本ゲートはデータの正当性検証ではなく**スタイル lint**で、型で表現できない。tsc-only の対象外カテゴリとして `verify` / `.githooks` に置く（線引きは ADR `0028`）。
- **転記段の追従**: `scripts/materialize.ts` は raw → catalog 転記を **block スタイルで書き出す**（`flow` ヘルパは廃止）。再実行しても flow を生まない。
- **スコープ**: 本ゲートは `data/` 配下限定。`team/` 配下の利用者 YAML（個体 / パーティ）は対象外（将来拡張は別途検討）。インデント幅・キー順・引用符など block/flow 以外のスタイルは Biome / 既存慣習に委ね、本ゲートは flow 排除のみを担う。

## 項目の取得元 / SoT / 転記

全項目の **SoT は catalog YAML**（`generate.ts` は raw を読まない・ADR 0027）。構造データは PokeAPI を**取得元**とし、`materialize.ts` が raw → catalog へ転記する。技 / 名前 / 解禁は PokeAPI 非依存で skill-authored。

| 要求項目 | 取得元 | SoT（generate の入力） | 転記 |
|---|---|---|---|
| 全国図鑑番号 | `pokemon-species.id` | `catalog/species.yaml` の `dex` | `materialize` |
| 種族値 | `pokemon.stats[].base_stat` | `catalog/species.yaml` の `stats`(H/A/B/C/D/S) | `materialize` |
| タイプ / 特性 | `pokemon.types[]` / `pokemon.abilities[]` | `catalog/species.yaml` の `types` / `abilities` | `materialize` |
| 持ち物 category | `item.category` | `catalog/items.yaml` の `category` | `materialize` |
| **使用できる技（learnset legality）** | **PokeAPI に無し（Champions 非対応・ADR 0026）** | `regulations/<id>.yaml` の per-species `moves`（Serebii 第一優先） | skill-authored |
| **技メタ（type / damageClass / power / accuracy / pp / priority）** | **PokeAPI を信頼源にしない（ADR 0026）** | `catalog/moves.yaml`（skill-authored） | skill-authored |
| **日英名 / タイプ相性** | **PokeAPI に無し（Phase 10）** | `catalog/*.yaml`（名前 SoT・types は + `damageTo`） | skill-authored |
| **レギュレーション解禁** | **PokeAPI に無し** | `regulations/<id>.yaml` | skill-authored |

構造データ（種族値 / タイプ / 特性 / 図鑑番号 / category）は Champions 非依存で PokeAPI の値が信頼できるため**取得元は PokeAPI 継続**。SoT を catalog へ移したのは値を入力 YAML から直読でき、Champions 実態との差分を YAML 著述で吸収でき、`generate` の決定論性が上がるため（ADR 0027）。`materialize` は **append/既存尊重**で skill 著述値を上書きしない。

日英名は **`data/champions/catalog/*.yaml`（`id → { ja, en }`）が SoT**（Phase 10・skill 著述・コミット）。`generate.ts` は名前 / タイプ相性 / 技メタ / 構造データのいずれも PokeAPI を読まず YAML を変換する（`type` / `ability` / `pokemon-form` / `move` は raw 取得もしない）。構造データ（種族値 / タイプ / 特性 id / 図鑑番号 / category）の SoT を catalog へ移したのは ADR 0027、技メタを catalog SoT にするのは ADR 0026（PokeAPI が Champions 非対応）。raw → catalog の転記は `materialize.ts`（fail-fast・append/既存尊重）が担い、**raw 存在の担保は `survey-regulation` skill の責務**。MVP 時点で**全国図鑑の全種族分**を生成しておく。生成される型の形は [[type-conventions]]、検証は [[tsc-verification]] を参照。
