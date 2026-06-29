---
paths:
  - "scripts/**"
  - "data/**"
description: データ生成パイプライン（取得元 = pokemon-showdown 第一の正 / Serebii 速報 / PokeAPI ja 専任・SoT は構造 specs / 名前 languages / 解禁 per-reg の 3 軸直交・generated は raw 非依存合成の vendor 方式）。scripts/ や data/ を扱うとき適用する。
last_modified: "2026-06-29T00:00:00+09:00"
adr:
  - "ADR 0030"
  - "ADR 0035"
  - "ADR 0036"
  - "ADR 0039"
  - "ADR 0040"
---

# データ生成パイプラインの規約

取得元から構造・解禁・名前データを取り込み、構造の **SoT は specs YAML**（`data/champions/*-specs.yaml`）・名前の **SoT は languages YAML**（`data/languages/*.yaml`）・解禁の **SoT は per-reg YAML**（`<reg>/*.yaml`）に置いて `src/generated/` を出力する流れの規約。本 rule が規約 SoT で、設計俯瞰は [data-pipeline](../../docs/design/data-pipeline.md)、決定の「なぜ」は ADR `0039-showdown-authoritative-pokeapi-ja-only`（pokemon-showdown を第一の正に・PokeAPI を ja 専任へ・構造取得廃止 / 0012・0027 を supersede）/ ADR `0040-serebii-provisional-scraper-rebuild`（Serebii を速報経路へ降格・既存スクレイパー全廃 / 0033・0037 を supersede）/ ADR `0035-specs-languages-layout-redesign`（specs / languages / per-reg の 3 軸直交・名前 SoT を languages へ）/ ADR `0036-mega-independent-spec-entity`（メガ独立 spec エンティティ）。

## 取得元の権威序列（showdown=正 > Serebii=速報 > PokeAPI=ja 補完）

取得元は **3 経路**で、それぞれ役割と信頼度が違う（ADR 0039 / 0040）:

1. **pokemon-showdown = 第一の正（authoritative）**。`smogon/pokemon-showdown` の mod（`champions` / `championsregma`）が解禁・構造・技メタ・メガ・持ち物を一括かつ機械可読に保持し、`calculatePP` 等の Champions 固有仕様まで内包する。構造データ + 解禁データの取得元。GitHub Actions `showdown-sync.yml`（`workflow_dispatch` 手動）で clone → build → 抽出し YAML 更新 PR を自動作成する。
2. **Serebii = 速報（provisional）**。公式更新の反映が早く、各ページに日本語名を持つ。GitHub Actions `serebii-bulletin.yml`（`workflow_dispatch` 手動）で指定ページ群をスクレイプし `data:provisional` ラベルの速報 PR を立てる。showdown-sync（正）が追いついたら上書きされる暫定値。
3. **PokeAPI = ja 補完**。showdown は ja を持たないため、**日本語名 ja 専任**へ縮小して残す（`names` ja-Hrkt）。構造データ取得は廃止（ADR 0039）。

**食い違いの収束**: 速報（Serebii）と正（showdown）が食い違ったら、showdown-sync が追いついた時点で上書きする。showdown PR の正確性は **`verify-showdown-pr` skill が Serebii スクレイパーで機械照合**して裏取りする（公式そのものではない showdown を独立ソースで検証・ADR 0039）。

## レイアウトの 3 軸直交（specs / languages / per-reg・ADR 0035/0036）

`data/champions/`（構造 specs・ゲーム別・skill 著述）と `data/languages/`（名前・ゲーム非依存）と per-reg ディレクトリ（解禁）を **3 つの直交する関心**でディレクトリ分割する（ADR 0035）。`$ref` リテラルや YAML anchor は使わず、**`generate.ts` がディレクトリ同型の複数ファイルを読んで合成**して参照を解決する（外部依存ゼロ・tsc-only 検証を維持・ADR 0010）。

- **構造（specs・言語非依存・ゲーム別）**: `data/champions/*-specs.yaml`（`species-specs` / `mega-specs` / `item-specs` / `ability-specs` / `move-specs` / `type-specs`）＋ per-reg `<reg>/{index,species,items,mega,species-moves}.yaml` ＋ `rules.yaml`。いずれも **name を持たない**（各エンティティのフィールド schema は下記「ディレクトリの扱い」節）。
- **名前（languages・ゲーム非依存）**: `data/languages/*.yaml`（`species` / `mega` / `items` / `moves` / `abilities` / `types`、各 `id → { ja, en }`）。**名前の SoT を一本化**（旧 catalog 同居 / 生成 dex 埋め込みから移設・全エンティティ id-only と揃う）。逆引き（ja → id）は languages forward `{ id, name }` から実行時導出する（専用 `names.ts` は廃止・[[cli-and-io]]）。
- **メガは独立 spec エンティティ**（ADR 0036）: `mega-specs`（`id → { dex, types, baseStats, ability, baseSpecies }`・`baseSpecies` は base 種族 id への逆参照）で base 種族（`species-specs`・`megaEvolvesTo?` で前方参照）から構造データを分離する。`-mega` サフィックス命名規約への暗黙依存をやめ、エンティティ型で base / メガを判別する。**メガ id は両経路とも `<baseslug>-mega[-x|-y]` 語順へ収束**させる（showdown の forme id・Serebii 表示名 `Mega Charizard X` をこの kebab へ正規化・ADR 0040）。

## data/champions の運用方針（skill 著述・人間直編集 NG）

`data/champions/**`（`*-specs.yaml` / `<reg>/*.yaml` / `rules.yaml`）と `data/languages/*.yaml` は **skill 著述で維持し、人間が直接エディタで編集しない**。著述主体は **取得経路（GitHub Actions の抽出 / スクレイプ + 転記）または `author-individual` を実行する AI エージェント**で、showdown / Serebii / PokeAPI 等の取得元から YAML へ機械転記する。人間の直編集を禁じるのは、取得元との同期・再現性（同じ取得経路を再実行すれば同じ結果に収束する性質）を壊さないためで、決定の「なぜ」は [ADR 0030](../../docs/adr/0030-data-champions-skill-authored.md)（著述主体に GitHub Actions の機械抽出を含める解釈拡張は ADR 0039 で補足）。

- **取得経路は取得元で 3 分割**（取得元・更新頻度・情報源が異なるため・[[skill-authoring]]）:
  - **showdown 経路（正）**: 構造データ（種族値 / タイプ / 特性 id / 図鑑番号 / category）+ 解禁データ（roster / per-species 技 / 技メタ / メガ / 持ち物解禁集合）を `*-specs.yaml` / `<reg>/*` / `languages`(en) へ。`showdown:<dataset>`（抽出 + 転記）→ `showdown-sync.yml` が PR 化。
  - **Serebii 速報経路**: 同じ 5 データセット軸を速報スクレイプし `ja` / `en` を含めて転記。`serebii:<dataset>` → `serebii-bulletin.yml` が速報 PR 化。
  - **PokeAPI ja 経路**: `languages/*.yaml` の **日本語名 ja** を backfill（`fetch:ja-names` → `sync:ja-names`）。[`update-catalog`](../skills/update-catalog/SKILL.md) skill が担う。
- **照合**: showdown 経路の PR は [`verify-showdown-pr`](../skills/verify-showdown-pr/SKILL.md) skill が Serebii スクレイパー流用で機械照合し、roster 数 / 技件数 / 持ち物・メガ membership / 技メタ / 名前を裏取りする。
- **訂正経路**: 誤りの訂正は **取得経路の再実行または AI への直接指示**を経由する。`*-specs` / per-reg / `languages` の訂正は対応経路（`showdown:*` / `serebii:*` / `update-catalog` 等）の再実行で行う。**`rules.yaml` は対応経路が無いため改定経路を「AI への直接指示」と定義する**（人間が直接書き換えるのではなく AI に指示して書かせる）。
- **強制レベル**: 人間直編集 NG は **規約・方針レベルで担保**する。「誰が編集したか」は機械判定しづらく CI 強制が困難なため、本方針は機械ゲートでは強制しない（直編集を warn する check の要否は将来判断・ADR `0030`）。

## 取得 → 転記 → 合成の三段（raw=キャッシュ / specs+languages=SoT / generated=合成）

取得元は経路ごとに異なるが、**SoT レイアウトと検証機構は取得元非依存で不変**（ADR 0039 の安全弁）。入力 SoT を埋める取得元のみが showdown / Serebii / PokeAPI に分かれる。

- **showdown 抽出層** `scripts/showdown/*`（`dex` / `species` / `moves` / `items` / `abilities` / `mega` / `cli`）= showdown ツリーで動く抽出（`../sim/dex` import ゆえ pokeform の `tsconfig.json` `exclude`・typecheck/coverage 非対象）。CI で `pokemon-showdown/tools/` へ copy → `node build` 後に実行し、データセット別の中間 JSON を stdout に出す（`calculatePP` で実 PP=8/12/16/20 を適用済み）。
- **showdown 転記層** `src/codegen/showdown/*-fields.ts`（純関数 + コロケーション test・カバレッジ 100%）+ `scripts/sync-showdown.ts`（薄い配線・fs/YAML I/O 専任・coverage 除外）= 中間 JSON → `*-specs.yaml` / `<reg>/*` / `languages`(en) へ **append/既存尊重**で転記。`showdown:<dataset> <regId>` で起動。**ja は書かない**（PokeAPI 経路が埋める）。
- **Serebii 速報層** `src/codegen/serebii/parse-*`（純関数 + コロケーション test + `__fixtures__`・カバレッジ 100%）+ `scripts/scrape-serebii.ts`（取得 + 配線・健全性 exit code 0/2/3/4）/ `scripts/sync-serebii.ts`（中間 JSON → SoT YAML・**速報ゆえ ja / en を埋める**）。`serebii:<dataset> <regId>` で起動。Serebii は latin-1 + CRLF + 数値文字参照の日本語で、文字コードと健全性 exit code を設計に含む（ADR 0040）。
- **`scripts/fetch-pokeapi.ts`（取得・`fetch:ja-names`）/ `scripts/materialize.ts`（転記・`sync:ja-names`）** = PokeAPI `names`(ja-Hrkt) の **ja backfill 専任**。`languages/*.yaml` の ja/en が欠けるエントリだけ best-effort 取得（404 は skip）し、**append/既存尊重**で未設定の ja（技 / 特性は en も）を埋める（既存の著述 / 速報値は上書きせず conflict 提示）。構造データ取得・転記は廃止（ADR 0039）。raw 必須・fail-fast（自前の存在チェックや取得誘導を持たない・raw 存在の担保は `update-catalog` skill の責務）。
- **`scripts/generate.ts`（合成段・`generate:data`）** = specs / languages / per-reg YAML のみを変換・合成し `src/generated/` を出力。**raw 非依存**（決定論的・raw 不在でも動く・ADR 0027 の合成方針は不変）。

## 統一用語: skill-authored（定義 SoT）

ソースとして著述される SoT を **`skill-authored`**（英語ラベルのまま・日本語化しない）と呼ぶ。本節がこの語の定義の SoT で、SKILL / README 等はここへのポインタにする（二重管理回避）。

- **意味**: 「`generate` の派生出力ではないソース著述。著述主体は取得経路（GitHub Actions の機械抽出 / スクレイプ + 転記）または skill を実行する AI（人間は直接編集せず経路/AI を経由する）」。`generate.ts` の派生出力（`src/generated/**`）と対比される語。
- **対象**: 上記「運用方針」の `data/champions/**`（`*-specs` の構造データ / 技メタ、per-reg の解禁・per-species `species-moves`・`mega`、`rules.yaml`）と `data/languages/*.yaml`（名前）。
- **転記の append/既存尊重が保護する対象 = skill-authored 値**: `sync-showdown.ts` / `sync-serebii.ts` / `materialize.ts` の **append/既存尊重**（未設定フィールドのみ取得元由来値で埋め、既存値は上書きせず conflict 提示）が保護するのは **skill-authored 値**である。設計自体は不変で、保護される値の主体が「人間の手修正」ではなく「経路/AI の著述値」だと整理されるだけ（ADR `0030`）。

## ディレクトリの扱い（vendor）

- **`data/raw/`** = `.gitignore`（取得キャッシュ。`scripts/fetch-pokeapi.ts`（PokeAPI ja）/ `scripts/scrape-serebii.ts`（Serebii 速報）が生成。`generate` は読まない）。showdown 抽出は CI 上の `pokemon-showdown/` ツリーで完結し raw を残さない。
- **`data/champions/`** = **コミット・skill 著述（人間直編集 NG）**。構造（specs）と解禁（per-reg）のソース。ゲーム = `champions`（`data/champions/` 自体がゲームスコープ）:
  - `rules.yaml`（能力ポイント 66/32・計算式定数）
  - `{species,mega,item,ability,move,type}-specs.yaml`（**構造 specs マニフェスト** = エンティティ種別ごとの **append-only マスター**で、**構造データの SoT**。**name を持たない**・skill 著述・コミット）。`species-specs.yaml` は `species`（id + **構造データ `dex` / `types` / `baseStats`(hp/attack/defense/spAttack/spDefense/speed) / `abilities` + `megaEvolvesTo?`**・ADR 0036）、`mega-specs.yaml` は `mega`（id + `dex` / `types` / `baseStats` / `ability` + **`baseSpecies` 逆参照**・ADR 0036）、`item-specs.yaml` は `items`（id + `megaStoneFor?`（メガストーン → base 種族 id）+ `megaSpecies?`（メガストーン → メガ形態 SpeciesId・generate が per-reg メガ形態種の `items` 対応ストーンタプルを本リンクから決定論導出する）+ **`category`**）、`ability-specs.yaml` は特性 id（id のみ）、`type-specs.yaml` は 18 タイプの id + **相性倍率 `damageTo`**（非 1.0 のみ・generate が 1.0 補完）。`move-specs.yaml` は **per-game 技メタ** `type` / `damageClass` / `power` / `accuracy` / `pp` / `priority`（Champions 固有値・skill-authored・showdown の `calculatePP` 適用済み実 PP を正とし PokeAPI は技メタの信頼源にしない・ADR 0039）。
  - `<reg>/{index,species,items,mega,species-moves}.yaml`（**1 レギュ = 1 ディレクトリ**＝`m-a/` 等。安定 id は `<game>-<reg>`（`champions-m-a`）を `generate.ts` がゲーム（`champions`）+ ディレクトリ名から導出し、`RegulationId` リテラル・`team/individuals/*.yaml` の `regulations:` 値・生成 `champions/<reg>/` を不変に保つ。**block 記法**）。`index.yaml` = レギュメタ（`period`（`start` 必須・`end` は開催中なら空＝`null`）。レギュ名 `name` は languages（`languages/regulations.yaml`・`id → { ja, en }`）が SoT で index.yaml には持たない＝名前 SoT を languages へ一本化・例外なし・ADR 0035）、`species.yaml` = 解禁種族 id 配列、`items.yaml` = 解禁持ち物 id 配列、`species-moves.yaml` = 種族キーごとの **per-reg 習得技 `moves`**、`mega.yaml` = 種族キーごとの解禁メガ id 配列（1 種族複数メガ可）。**解禁判定の正本**＝per-regulation 一本化（A案・ADR `0021`）。種族 / 持ち物 / メガ / 技の id は specs を参照する。参照整合・schema は **authoring 時ゲート `check:regulation`** が（split された per-reg ファイルを再構成して）検証する（`generate.ts` は変換専任・ADR `0023`）。**覚えない技（learnset legality）の照合は撤去した**（PokeAPI は Champions 非対応のため・ADR `0026`）。技が実ゲームで覚えるかは取得段（showdown の `getLearnsetData`・正）で担保し、`check:regulation` は `data/raw` 非依存。
  - **append-only 方針**: 一度解禁されたものは後のレギュレーションで没収されても消さない（レギュレーションごとの解禁/非解禁の正本は別管理）。種族の `abilities` は specs id を参照し、specs に無い id を参照すると `generate.ts` が**生成段でエラー**にして整合を担保する。specs / languages の id 集合不一致（名前欠落等）も `generate.ts` が**生成段で非0終了**にする（authoring ゲート）。
- **`data/languages/`** = **コミット・skill 著述（人間直編集 NG）**。`{species,mega,items,moves,abilities,types}.yaml`（各 `id → { ja, en }`・**名前の SoT**・ゲーム非依存）＋ `regulations.yaml`（レギュ名・`id`（= `<game>-<reg>`・例 `champions-m-a`）→ `{ ja, en }`・PokeAPI に無く ja/en とも skill 著述・ADR 0035）。**en は showdown の `.name`（正）/ Serebii 表示名（速報）**、**ja は PokeAPI `names`（正）/ Serebii 各ページ（速報）** で埋まる（取得経路は下表）。`generate.ts` は raw を読まずこれを変換する。
- **`src/generated/`** = **コミット**。`scripts/generate.ts` が specs / languages / per-reg を変換・合成して（raw 非依存・ADR 0027）Dex 単位の `.ts` を出力する:
  - `champions/{species,mega,item,ability,move,type}-specs.ts`（**構造 specs dex**・name 無し）= 各 `*-specs.yaml` を `speciesSpecsDex` / `megaSpecsDex` / `moveSpecsDex` / `typeSpecsDex` / `itemSpecsDex` / `abilitySpecsDex` に変換。攻撃範囲分析（coverage）・ダメージ / 火力指数は `moveSpecsDex` を引く。
  - `languages/{species,mega,items,moves,abilities,types,regulations}.ts`（**名前 dex**・各 `id → { id, name: { ja, en } }`・`satisfies Record<string, NameEntry>`。`regulations.ts` の `regulationNames` を per-reg `index.ts` が引いて `regulationDex[R].name` を合成・ADR 0035）。`languages/index.ts` が各 forward マップを再 export し、`speciesNamesAll = { ...speciesNames, ...megaNames }`（base + メガ統合の実行時ルックアップ用 forward マップ）を組む。**逆引き（ja → id）は consumer が forward マップから実行時導出**（専用 `names.ts` は廃止・ADR 0035）。名前表示・名称正規化はこの languages dex を引く。
  - `champions/<reg>/{index,species,items,mega,species-moves}.ts` ＋ `champions/index.ts`（**per-reg・1 レギュ = 1 ディレクトリ**）= `index.ts` が `species-specs` ＋ `mega-specs` ＋ per-reg `species-moves` ＋ per-reg `mega` を**合成**して `PerRegSpecies` を満たす **per-reg 種族 dex `speciesDex`**（そのレギュの roster ∪ mega 先・per-reg 習得技 `moves` を含む legality の型正本）を作り、`RegulationBase` を満たすレギュメタ（`championsMA` 等）を export する。**base（メガシンカ前）種族は `items: "any"`**（`HoldableItems<R,S>` が reg 解禁プール全件・メガストーン含むへ接続）、**メガ形態（メガシンカ後）種族は対応メガストーン id のタプルで emit** する（`item-specs` の `megaSpecies` リンクから決定論導出・対応ストーン欠落 / reg プール外は generate 側で fail-fast・例 `charizard-mega-x.items: ["charizardite-x"]`）。これにより `HoldableItems<R,S>` の Extract 分岐が効き、メガ形態種族が対応ストーン以外を持つと `ItemNotHoldableBy<R,S,I>` で弾く（item legality・[[type-conventions]]）。集約 `champions/index.ts` が `regulationDex` に集める。**global 単一 `species.ts` は廃止**（統合 view へのフラット化は技プールが潰れ過剰許容になるため採らない・ADR `0021`）。実数値計算・名前表示・coverage はレギュ非依存のため `species-specs` / `mega-specs`（構造）＋ `languages`（名前）を引く（ADR 0035）。
  - 各ファイルは `export const xxxDex = {...} as const` の**値**から `type XxxDex = typeof xxxDex` / `XxxId = keyof XxxDex` で**型を派生**し、値と型を単一ソース化する（別ファイルに二重管理しない）。親型適合は `satisfies` / `Assignable`（[[type-conventions]] / [[tsc-verification]]）で検証し、出力後に Biome 整形して機械ゲートと一致させる。
- 生成物は手書き編集しない。**ソース（specs / languages / per-reg・skill 著述）を経路/AI 経由で直し**、再生成する（オフライン・決定論的・CI 高速のため vendor をコミットする・ADR 0012 の vendor 運用は取得元が変わっても不変）。

## YAML はブロックスタイルで書く（flow 禁止ゲート）

`data/` 配下の skill 著述 YAML（`champions/*-specs.yaml` / `champions/<reg>/*.yaml` / `languages/*.yaml` / `rules.yaml`）は **flow スタイル**（`[ a, b ]` / `{ k: v }` のインライン記法）を**使わず、すべてブロックスタイル**で書く。理由は、flow と block が混在すると diff の可読性が落ち（1 行に複数値が入ると行単位 diff で値の変化を追えない）、レビューで値の変化を見落としやすくなるため。Champions M-A 全量（全186種）のような大量データを最初から block で投入し、後から全量を再整形し直す事故を防ぐ。

- **強制ゲート = `check:yaml-style`**（`src/cli/commands/check-yaml-style.ts`・薄い CLI 配線）。`data/**/*.yaml`（`data/raw` は `.gitignore` の取得キャッシュなので**対象外**）を走査し、flow コレクションを 1 つでも検出したら**非0終了**して該当 `path:line` を報告する。検出は **AST ベース**の純関数 `src/domain/yaml-block-style.ts`（`findFlowCollections`）に委譲する。正規表現で `[` / `{` を弾くと文字列値中の括弧で誤検出するため採らない（[[testing]] の純関数として網羅・カバレッジ 100%）。
- **配線**: local は `.githooks/pre-commit`、CI は `pnpm verify`（`= typecheck && test:cov && lint && check:yaml-style`）が同一スクリプトを呼ぶ（ゲートは `.githooks` / `verify` に集約し二重実装しない・[ADR 0013](../../docs/adr/0013-git-hooks-over-claude-hooks.md)）。
- **検証は tsc のみ（[ADR 0010](../../docs/adr/0010-tsc-only-verification.md)）の例外**: 本ゲートはデータの正当性検証ではなく**スタイル lint**で、型で表現できない。tsc-only の対象外カテゴリとして `verify` / `.githooks` に置く（線引きは ADR `0028`）。
- **転記段の追従**: `sync-showdown.ts` / `sync-serebii.ts` / `materialize.ts` は中間 JSON / raw → specs / languages / per-reg 転記を **block スタイルで書き出す**。再実行しても flow を生まない。
- **スコープ**: 本ゲートは `data/` 配下限定。`team/` 配下の利用者 YAML（個体 / パーティ）は対象外（将来拡張は別途検討）。インデント幅・キー順・引用符など block/flow 以外のスタイルは Biome / 既存慣習に委ね、本ゲートは flow 排除のみを担う。

## 項目の取得元 / SoT / 転記

全項目の **SoT はソース YAML**（構造 = `*-specs.yaml` / 名前 = `languages/*.yaml` / 解禁 = per-reg・`generate.ts` は raw を読まない・ADR 0027/0035）。取得元は権威序列（showdown=正 > Serebii=速報 > PokeAPI=ja 補完・ADR 0039/0040）に従い、転記は経路別スクリプト（`sync-showdown.ts` / `sync-serebii.ts` / `materialize.ts`）が append/既存尊重で行う。

> **PP の落とし穴**: showdown の `move.pp` は基礎値で、実 PP は mod の `calculatePP`（`(pp/5+1)*4`=8/12/16/20、`noPPBoosts` 据置）を通した値。`scripts/showdown/moves.ts` が適用済みで `move-specs.yaml` には実 PP が入る。`verify-showdown-pr` で Serebii 基礎値と比較する際はこの換算を踏まえる。

| 項目 | 正（authoritative） | 速報（provisional） | SoT YAML（generate 入力・不変） |
|---|---|---|---|
| 図鑑番号 dex | showdown `species.num` | Serebii 種族ページ | `species-specs.yaml` / `mega-specs.yaml` `dex` |
| 種族値 baseStats | showdown `species.baseStats` | Serebii | `*-specs.yaml` `baseStats` |
| タイプ types | showdown `species.types` | Serebii | `*-specs.yaml` `types` |
| 特性 abilities(id) | showdown `species.abilities` | Serebii abilitydex | `species-specs.yaml` `abilities` + `ability-specs.yaml` |
| 持ち物 category | showdown item `category` | Serebii itemdex | `item-specs.yaml` `category` |
| 解禁種族 roster | showdown mod フィルタ | Serebii pokemon.shtml | `<reg>/species.yaml` |
| per-species 技 | showdown `getLearnsetData` | Serebii 種族ページ | `<reg>/species-moves.yaml` |
| 技メタ type/damageClass/power/accuracy/pp/priority | showdown `getSpecs().moves`（`calculatePP` 適用） | Serebii 技ページ | `move-specs.yaml`（per-game） |
| メガ（構造 + linking） | showdown（`isMega`/`isPrimal`/forme + `megaStone`/`megaEvolves`） | Serebii | `mega-specs.yaml` + `species-specs.megaEvolvesTo` + `<reg>/mega.yaml` + `item-specs.megaSpecies` |
| 持ち物（解禁集合 + megaStoneFor/megaSpecies） | showdown `isUsableItem` | Serebii items.shtml | `item-specs.yaml` + `<reg>/items.yaml` |
| **日本語名 ja** | **PokeAPI `names`(ja-Hrkt)** | **Serebii 各ページ** | `languages/*.yaml` `ja` |
| 英語名 en | showdown `.name` | Serebii 表示名 | `languages/*.yaml` `en` |
| レギュメタ name/period | skill-authored | — | `<reg>/index.yaml` + `languages/regulations.yaml` |
| タイプ相性 damageTo | skill-authored（`typechart.ts` 由来・任意） | — | `type-specs.yaml` |

表に表れない補足（安全性・取得経路の要点。「なぜ」の詳細は上記「三段」節と各 ADR を参照）:

- **構造データ + 解禁データの取得元は pokemon-showdown（正）**。mod が機械可読に一括保持し `calculatePP` 等 Champions 固有仕様を内包する。SoT を specs / per-reg YAML へ置く合成方針は不変（ADR 0027/0035）、取得元を PokeAPI から showdown へ差し替えた根拠は ADR 0039。
- **日本語名 ja の取得元は PokeAPI `names`（ja-Hrkt 優先）/ Serebii（速報）の二経路**。`materialize`（`sync:ja-names`）が raw `names` から `languages/*.yaml` へ転記する（append/既存尊重・初期値補完で名前 SoT は不変・既存値は上書きせず conflict 提示）。メガ名 ja・タイプ名は PokeAPI に無いため showdown(en) + Serebii(ja 速報) / skill 著述で補う。
- **技メタ（type / power 等）に PokeAPI を使わない**（Champions 非対応）。技メタ SoT は per-game `move-specs.yaml` で、showdown の `calculatePP` 適用済み実 PP を正とする（ADR 0039）。
- **raw 存在の担保は `update-catalog` skill（ja）の責務**（`materialize.ts` は fail-fast で前提が揃っている前提に動く）。生成型は [[type-conventions]]、検証は [[tsc-verification]]。
