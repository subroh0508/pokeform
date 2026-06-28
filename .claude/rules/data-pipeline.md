---
paths:
  - "scripts/**"
  - "data/**"
description: データ生成パイプライン（raw=取得キャッシュ / champions catalog=SoT / generated=raw 非依存合成の vendor 方式・取得元 PokeAPI / SoT catalog / materialize 転記）。scripts/ や data/ を扱うとき適用する。
last_modified: "2026-06-26T00:00:00+09:00"
adr:
  - "ADR 0012"
  - "ADR 0027"
  - "ADR 0030"
  - "ADR 0033"
  - "ADR 0035"
  - "ADR 0036"
  - "ADR 0037"
---

# データ生成パイプラインの規約

PokeAPI を **取得元**に vendor 方式で取り込み、構造データの **SoT は specs YAML**（`data/champions/*-specs.yaml`）・名前の **SoT は languages YAML**（`data/languages/*.yaml`）に置いて `src/generated/` を出力する流れの規約。本 rule が規約 SoT で、設計俯瞰は [data-pipeline](../../docs/design/data-pipeline.md)、決定の「なぜ」は ADR `0012-vendor-pokeapi-data`（取得方式）/ ADR `0027-structural-data-catalog-sot`（構造データ SoT をソース YAML へ・generate raw 非依存）/ ADR `0035-specs-languages-layout-redesign`（specs / languages / per-reg の 3 軸直交・名前 SoT を languages へ）/ ADR `0036-mega-independent-spec-entity`（メガ独立 spec エンティティ）。

## レイアウトの 3 軸直交（specs / languages / per-reg・ADR 0035/0036）

`data/champions/`（構造 specs・ゲーム別・skill 著述）と `data/languages/`（名前・ゲーム非依存）と per-reg ディレクトリ（解禁）を **3 つの直交する関心**でディレクトリ分割する（ADR 0035）。`$ref` リテラルや YAML anchor は使わず、**`generate.ts` がディレクトリ同型の複数ファイルを読んで合成**して参照を解決する（外部依存ゼロ・tsc-only 検証を維持・ADR 0010）。

- **構造（specs・言語非依存・ゲーム別）**: `data/champions/*-specs.yaml`（`species-specs` / `mega-specs` / `item-specs` / `ability-specs` / `move-specs` / `type-specs`）＋ per-reg `<reg>/{index,species,items,mega,species-moves}.yaml` ＋ `rules.yaml`。いずれも **name を持たない**（各エンティティのフィールド schema は下記「ディレクトリの扱い」節）。
- **名前（languages・ゲーム非依存）**: `data/languages/*.yaml`（`species` / `mega` / `items` / `moves` / `abilities` / `types`、各 `id → { ja, en }`）。**名前の SoT を一本化**（旧 catalog 同居 / 生成 dex 埋め込みから移設・全エンティティ id-only と揃う）。逆引き（ja → id）は languages forward `{ id, name }` から実行時導出する（専用 `names.ts` は廃止・[[cli-and-io]]）。
- **メガは独立 spec エンティティ**（ADR 0036）: `mega-specs`（`id → { dex, types, baseStats, ability, baseSpecies }`・`baseSpecies` は base 種族 id への逆参照）で base 種族（`species-specs`・`megaEvolvesTo?` で前方参照）から構造データを分離する。`-mega` サフィックス命名規約への暗黙依存をやめ、エンティティ型で base / メガを判別する。

## data/champions の運用方針（skill 著述・人間直編集 NG）

`data/champions/**`（`*-specs.yaml` / `<reg>/*.yaml` / `rules.yaml`）と `data/languages/*.yaml` は **skill 著述で維持し、人間が直接エディタで編集しない**。著述主体は **取得スキル / `author-individual` を実行する AI エージェント**で、[ADR 0034](../../docs/adr/archive/0034-move-meta-per-game-sot.md)（ADR 0026 改訂・技メタ per-game SoT）の方針どおり Serebii / PokeAPI 等の出典を閲覧して YAML へ転記する。人間の直編集を禁じるのは、出典との同期・再現性（同じ skill を再実行すれば同じ結果に収束する性質）を壊さないためで、決定の「なぜ」は [ADR 0030](../../docs/adr/0030-data-champions-skill-authored.md)。

- **取得スキルは取得元で 2 分割**（取得元・更新頻度・情報源が異なるため・[[skill-authoring]]）: **`update-catalog`** = PokeAPI 由来の reg 非依存データ（構造データ = 種族値 / タイプ / 特性 id / 図鑑番号 / category を `*-specs.yaml` へ、日本語名 ja を `languages/*.yaml` へ）を取り込む（`fetch:data` → `materialize` + 特性 id 集約）。**`survey-regulation`** = Champions 解禁データ（roster / per-species `moves` / per-game 技メタ / メガ）を Serebii 第一優先で per-reg `<reg>/*` と `*-specs.yaml` へ取り込む。`survey-regulation` は **specs 更新チェックポイント**（`check:regulation` の参照整合エラーが未登録 id を列挙）で不足を検出したら `update-catalog` を先に回すよう誘導する。

- **訂正経路**: 誤りの訂正は **skill 再実行または AI への直接指示**を経由する。`*-specs` / per-reg / `languages` の訂正は対応 skill（`survey-regulation` / `update-catalog` 等）の再実行で行う。**`rules.yaml` は対応 skill が無いため改定経路を「AI への直接指示」と定義する**（人間が直接書き換えるのではなく AI に指示して書かせる）。
- **強制レベル**: 人間直編集 NG は **規約・方針レベルで担保**する。「誰が編集したか」は機械判定しづらく CI 強制が困難なため、本方針は機械ゲートでは強制しない（直編集を warn する check の要否は将来判断・ADR `0030`）。

## 取得 → 転記 → 合成の三段（raw=キャッシュ / specs+languages=SoT / generated=合成）

- **取得元 = PokeAPI**（継続・`fetch:data`）。取得した構造データ（種族値 / タイプ / 特性 id / 図鑑番号 / 持ち物 category）の **SoT は `data/champions/*-specs.yaml`**、日本語名 ja の補完先は `data/languages/*.yaml`（いずれも skill-authored・コミット）。raw は転記元の取得キャッシュに過ぎず、`generate.ts` は raw を読まない（ADR `0027`）。
- **`scripts/serebii-to-catalog.ts`**（Serebii 著述転記段・[ADR 0033](../../docs/adr/archive/0033-deterministic-mega-auto-authoring.md) / 技専用取得は [ADR 0037](../../docs/adr/archive/0037-serebii-move-master-dedicated-path.md)・スクレイパー基盤は [ADR 0031](../../docs/adr/archive/0031-deterministic-serebii-scraper-hybrid-layers.md)）= `scrape-serebii` の中間 JSON → specs / per-reg / languages YAML。**責務別サブコマンドに分かれる**（ADR 0037）: `species <slug> <regId>` = 種族 / **覚える技の名前一覧** / メガ先 / per-reg 解禁 / 技名 en（`languages/moves.yaml`）を append/既存尊重で書く（**技メタは書かない**）。`move-master` = 技専用ページ（`attackdex-champions`）の中間 JSON → **技メタ `type`/`damageClass`/`power`/`accuracy`/`pp`/`priority` を `move-specs.yaml`（per-game）へ後勝ちで上書き是正**（前作 PP 残存を根絶・冪等＝既存と一致なら書き戻さない）+ 技名 en を append/既存尊重。`items <regId>` = `item-specs`（`megaStoneFor`/`megaSpecies`）/ `languages/items`（en）/ per-reg `<reg>/items.yaml`。いずれも構造データ・日本語名 ja は**空で残して** `materialize` に委ねる。per-reg `species-moves` は既存種族エントリを保護（部分集合で上書き縮小しない）。**メガ linking は決定論で自動著述**（base slug 既知 + メガ名の枝サフィックスから `<baseslug>-mega[-x|-y]` を導出し、`species-specs` の `megaEvolvesTo` / `mega-specs` の `baseSpecies` 逆参照 / per-reg `mega` / メガストーンの `megaSpecies` を append/既存尊重で書く・ADR 0033/0036）。`Mega ` 接頭の無い特殊形（Primal 等）・未知 id だけ escalation（diagnostic）。実行: `pnpm serebii:catalog`。
- **`scripts/materialize.ts`**（転記段）= raw → `*-specs.yaml`（構造データ）+ `languages/*.yaml`（日本語名 ja）転記専任。**raw 必須・fail-fast**（不在なら ENOENT で即エラー・自前の存在チェックや `fetch:data` 誘導は持たない）。**append/既存尊重**: 未設定フィールドのみ raw 由来値で埋め、既存値は raw と異なっても上書きせず conflict を提示する（Champions 実態に合わせた skill 著述値を保護）。**raw 存在の担保は呼び出し側 `update-catalog` skill の責務**（PokeAPI 構造データ + 名前の取り込みを担い、手順で `fetch:data` → `materialize` の順を保証する。`survey-regulation` は specs 更新チェックポイントで未登録 id を検出したら `update-catalog` を回すよう誘導する。スクリプトは前提が揃っている前提で動き、欠けたら fail-fast＝責務の二重化を避ける・ADR `0027`）。
- **`scripts/generate.ts`**（合成段）= specs / languages / per-reg YAML のみを変換・合成し `src/generated/` を出力。**raw 非依存**（決定論的・raw 不在でも動く）。

## 統一用語: skill-authored（定義 SoT）

ソースとして著述される SoT を **`skill-authored`**（英語ラベルのまま・日本語化しない）と呼ぶ。本節がこの語の定義の SoT で、SKILL / README 等はここへのポインタにする（二重管理回避）。

- **意味**: 「`generate` / `materialize` の派生出力ではないソース著述。著述主体は skill を実行する AI（人間は直接編集せず skill/AI を経由する）」。機械転記の `materialize` と対比される語。
- **対象**: 上記「運用方針」の `data/champions/**`（`*-specs` の構造データ / 技メタ、per-reg の解禁・per-species `species-moves`・`mega`、`rules.yaml`）と `data/languages/*.yaml`（名前）。表「項目の取得元 / SoT / 転記」で転記列が `materialize` でないソース著述値がこれにあたる。
- **`materialize` の保護対象 = skill-authored 値**: `materialize` の **append/既存尊重**（未設定フィールドのみ raw 由来値で埋め、既存値は上書きせず conflict 提示・ADR `0027`）が保護するのは **skill-authored 値**である。append/既存尊重の設計自体は不変で、保護される値の主体が「人間の手修正」ではなく「skill/AI の著述値」だと整理されるだけ（ADR `0030`）。

## ディレクトリの扱い（vendor）

- **`data/raw/`** = `.gitignore`（PokeAPI 取得キャッシュ＝`materialize` の転記元。`scripts/fetch-pokeapi.ts` が生成。`generate` は読まない）。
- **`data/champions/`** = **コミット・skill 著述（人間直編集 NG）**。構造（specs）と解禁（per-reg）のソース。ゲーム = `champions`（`data/champions/` 自体がゲームスコープ）:
  - `rules.yaml`（能力ポイント 66/32・計算式定数）
  - `{species,mega,item,ability,move,type}-specs.yaml`（**構造 specs マニフェスト** = エンティティ種別ごとの **append-only マスター**で、**構造データの SoT**。**name を持たない**・skill 著述・コミット）。`species-specs.yaml` は `species`（id + **構造データ `dex` / `types` / `baseStats`(hp/attack/defense/spAttack/spDefense/speed) / `abilities` + `megaEvolvesTo?`**・ADR 0027/0036）、`mega-specs.yaml` は `mega`（id + `dex` / `types` / `baseStats` / `ability` + **`baseSpecies` 逆参照**・ADR 0036）、`item-specs.yaml` は `items`（id + `megaStoneFor?`（メガストーン → base 種族 id）+ `megaSpecies?`（メガストーン → メガ形態 SpeciesId・generate が per-reg メガ形態種の `items` 対応ストーンタプルを本リンクから決定論導出する）+ **`category`**）、`ability-specs.yaml` は特性 id（id のみ）、`type-specs.yaml` は 18 タイプの id + **相性倍率 `damageTo`**（非 1.0 のみ・generate が 1.0 補完）。`move-specs.yaml` は **per-game 技メタ** `type` / `damageClass` / `power` / `accuracy` / `pp` / `priority`（Champions 固有値・skill-authored・PokeAPI は Champions 非対応で技威力等の信頼源にしない・ADR 0034 = ADR 0026 改訂）。
  - `<reg>/{index,species,items,mega,species-moves}.yaml`（**1 レギュ = 1 ディレクトリ**＝`m-a/` 等。安定 id は `<game>-<reg>`（`champions-m-a`）を `generate.ts` がゲーム（`champions`）+ ディレクトリ名から導出し、`RegulationId` リテラル・`team/individuals/*.yaml` の `regulations:` 値・生成 `champions/<reg>/` を不変に保つ。**block 記法**）。`index.yaml` = レギュメタ（`period`（`start` 必須・`end` は開催中なら空＝`null`）。レギュ名 `name` は languages（`languages/regulations.yaml`・`id → { ja, en }`）が SoT で index.yaml には持たない＝名前 SoT を languages へ一本化・例外なし・ADR 0035）、`species.yaml` = 解禁種族 id 配列、`items.yaml` = 解禁持ち物 id 配列、`species-moves.yaml` = 種族キーごとの **per-reg 習得技 `moves`**、`mega.yaml` = 種族キーごとの解禁メガ id 配列（1 種族複数メガ可）。**解禁判定の正本**＝per-regulation 一本化（A案・ADR `0021`）。種族 / 持ち物 / メガ / 技の id は specs を参照する。参照整合・schema は **authoring 時ゲート `check:regulation`** が（split された per-reg ファイルを再構成して）検証する（`generate.ts` は変換専任・ADR `0023`）。**覚えない技（learnset legality）の照合は撤去した**（PokeAPI は Champions 非対応で learnset が実態と一致しないため・ADR `0026`）。技が実ゲームで覚えるかは authoring 段（`survey-regulation` skill・Serebii 第一優先）で担保し、`check:regulation` は `data/raw` 非依存。
  - **append-only 方針**: 一度解禁されたものは後のレギュレーションで没収されても消さない（レギュレーションごとの解禁/非解禁の正本は別管理）。種族の `abilities` は specs id を参照し、specs に無い id を参照すると `generate.ts` が**生成段でエラー**にして整合を担保する。specs / languages の id 集合不一致（名前欠落等）も `generate.ts` が**生成段で非0終了**にする（authoring ゲート）。
- **`data/languages/`** = **コミット・skill 著述（人間直編集 NG）**。`{species,mega,items,moves,abilities,types}.yaml`（各 `id → { ja, en }`・**名前の SoT**・ゲーム非依存）＋ `regulations.yaml`（レギュ名・`id`（= `<game>-<reg>`・例 `champions-m-a`）→ `{ ja, en }`・PokeAPI に無く ja/en とも skill 著述・ADR 0035）。ja は `materialize` が PokeAPI `names` から補完、en は skill 著述（取得経路は下表と末尾の補足）。`generate.ts` は raw を読まずこれを変換する。
- **`src/generated/`** = **コミット**。`scripts/generate.ts` が specs / languages / per-reg を変換・合成して（raw 非依存・ADR 0027）Dex 単位の `.ts` を出力する:
  - `champions/{species,mega,item,ability,move,type}-specs.ts`（**構造 specs dex**・name 無し）= 各 `*-specs.yaml`（フィールドは上記スキーマ）を `speciesSpecsDex` / `megaSpecsDex` / `moveSpecsDex` / `typeSpecsDex` / `itemSpecsDex` / `abilitySpecsDex` に変換。攻撃範囲分析（coverage）・ダメージ / 火力指数は `moveSpecsDex` を引く。
  - `languages/{species,mega,items,moves,abilities,types,regulations}.ts`（**名前 dex**・各 `id → { id, name: { ja, en } }`・`satisfies Record<string, NameEntry>`。`regulations.ts` の `regulationNames` を per-reg `index.ts` が引いて `regulationDex[R].name` を合成・ADR 0035）。`languages/index.ts` が各 forward マップを再 export し、`speciesNamesAll = { ...speciesNames, ...megaNames }`（base + メガ統合の実行時ルックアップ用 forward マップ）を組む。**逆引き（ja → id）は consumer が forward マップから実行時導出**（専用 `names.ts` は廃止・ADR 0035）。名前表示・名称正規化はこの languages dex を引く。
  - `champions/<reg>/{index,species,items,mega,species-moves}.ts` ＋ `champions/index.ts`（**per-reg・1 レギュ = 1 ディレクトリ**）= `index.ts` が `species-specs` ＋ `mega-specs` ＋ per-reg `species-moves` ＋ per-reg `mega` を**合成**して `PerRegSpecies` を満たす **per-reg 種族 dex `speciesDex`**（そのレギュの roster ∪ mega 先・per-reg 習得技 `moves` を含む legality の型正本）を作り、`RegulationBase` を満たすレギュメタ（`championsMA` 等）を export する。**base（メガシンカ前）種族は `items: "any"`**（`HoldableItems<R,S>` が reg 解禁プール全件・メガストーン含むへ接続）、**メガ形態（メガシンカ後）種族は対応メガストーン id のタプルで emit** する（`item-specs` の `megaSpecies` リンクから決定論導出・対応ストーン欠落 / reg プール外は generate 側で fail-fast・例 `charizard-mega-x.items: ["charizardite-x"]`）。これにより `HoldableItems<R,S>` の Extract 分岐が効き、メガ形態種族が対応ストーン以外を持つと `ItemNotHoldableBy<R,S,I>` で弾く（item legality・[[type-conventions]]）。集約 `champions/index.ts` が `regulationDex` に集める。**global 単一 `species.ts` は廃止**（統合 view へのフラット化は技プールが潰れ過剰許容になるため採らない・ADR `0021`）。実数値計算・名前表示・coverage はレギュ非依存のため `species-specs` / `mega-specs`（構造）＋ `languages`（名前）を引く（旧 `species-base.ts` 派生 base view は廃止・specs / languages 直交へ・ADR 0035）。
  - 各ファイルは `export const xxxDex = {...} as const` の**値**から `type XxxDex = typeof xxxDex` / `XxxId = keyof XxxDex` で**型を派生**し、値と型を単一ソース化する（別ファイルに二重管理しない）。親型適合は `satisfies` / `Assignable`（[[type-conventions]] / [[tsc-verification]]）で検証し、出力後に Biome 整形して機械ゲートと一致させる。
- 生成物は手書き編集しない。**ソース（specs / languages / per-reg・skill 著述）を skill/AI 経由で直し**、再生成する（オフライン・決定論的・CI 高速のため vendor をコミットする）。

## YAML はブロックスタイルで書く（flow 禁止ゲート）

`data/` 配下の skill 著述 YAML（`champions/*-specs.yaml` / `champions/<reg>/*.yaml` / `languages/*.yaml` / `rules.yaml`）は **flow スタイル**（`[ a, b ]` / `{ k: v }` のインライン記法）を**使わず、すべてブロックスタイル**で書く。理由は、flow と block が混在すると diff の可読性が落ち（1 行に複数値が入ると行単位 diff で値の変化を追えない）、レビューで値の変化を見落としやすくなるため。Champions M-A 全量（全186種）のような大量データを最初から block で投入し、後から全量を再整形し直す事故を防ぐ。

- **強制ゲート = `check:yaml-style`**（`src/cli/commands/check-yaml-style.ts`・薄い CLI 配線）。`data/**/*.yaml`（`data/raw` は `.gitignore` の取得キャッシュなので**対象外**）を走査し、flow コレクションを 1 つでも検出したら**非0終了**して該当 `path:line` を報告する。検出は **AST ベース**の純関数 `src/domain/yaml-block-style.ts`（`findFlowCollections`）に委譲する。正規表現で `[` / `{` を弾くと文字列値中の括弧で誤検出するため採らない（[[testing]] の純関数として網羅・カバレッジ 100%）。
- **配線**: local は `.githooks/pre-commit`、CI は `pnpm verify`（`= typecheck && test:cov && lint && check:yaml-style`）が同一スクリプトを呼ぶ（ゲートは `.githooks` / `verify` に集約し二重実装しない・[ADR 0013](../../docs/adr/0013-git-hooks-over-claude-hooks.md)）。
- **検証は tsc のみ（[ADR 0010](../../docs/adr/0010-tsc-only-verification.md)）の例外**: 本ゲートはデータの正当性検証ではなく**スタイル lint**で、型で表現できない。tsc-only の対象外カテゴリとして `verify` / `.githooks` に置く（線引きは ADR `0028`）。
- **転記段の追従**: `scripts/materialize.ts` は raw → specs / languages 転記を **block スタイルで書き出す**（`flow` ヘルパは廃止）。再実行しても flow を生まない。
- **スコープ**: 本ゲートは `data/` 配下限定。`team/` 配下の利用者 YAML（個体 / パーティ）は対象外（将来拡張は別途検討）。インデント幅・キー順・引用符など block/flow 以外のスタイルは Biome / 既存慣習に委ね、本ゲートは flow 排除のみを担う。

## 項目の取得元 / SoT / 転記

全項目の **SoT はソース YAML**（構造 = `*-specs.yaml` / 名前 = `languages/*.yaml` / 解禁 = per-reg・`generate.ts` は raw を読まない・ADR 0027/0035）。構造データは PokeAPI を**取得元**とし、`materialize.ts` が raw → specs / languages へ転記する。技 / 名前 / 解禁は PokeAPI 非依存で skill-authored。

> **情報源の役割・関係性のポインタ**: 本表は**パイプライン機構**（どの項目がどこから来て・どこが SoT か・誰が転記するか）の SoT。一方、解禁データの**情報源の役割・関係性**（① Serebii = 第一優先の正 / ② Game8 等 = 補助・件数裏取り / ③ PokeAPI = 構造データ取得元・突き合わせ原則）の SoT は [`survey-regulation` の `references/serebii-sourcing.md`](../skills/survey-regulation/references/serebii-sourcing.md) の「情報源の役割・関係性」節にある（ここでは二重記述しない）。

| 要求項目 | 取得元 | SoT（generate の入力） | 転記 |
|---|---|---|---|
| 全国図鑑番号 | `pokemon-species.id` | `species-specs.yaml` の `dex` | `materialize` |
| 種族値 | `pokemon.stats[].base_stat` | `species-specs.yaml` の `baseStats`(hp/attack/defense/spAttack/spDefense/speed) | `materialize` |
| タイプ / 特性 | `pokemon.types[]` / `pokemon.abilities[]` | `species-specs.yaml` の `types` / `abilities` | `materialize` |
| 持ち物 category | `item.category` | `item-specs.yaml` の `category` | `materialize` |
| **使用できる技（learnset legality）** | **PokeAPI に無し（Champions 非対応・ADR 0034）** | per-reg `<reg>/species-moves.yaml` の per-species `moves`（Serebii 第一優先） | skill-authored |
| **技名（ja / en）** | **Serebii 表示名 / ja は PokeAPI names（ADR 0032）** | `languages/moves.yaml`（名前 SoT・ゲーム非依存） | skill-authored / `materialize`（ja） |
| **技メタ（type / damageClass / power / accuracy / pp / priority）** | **Serebii 技専用ページ `attackdex-champions`（PokeAPI を信頼源にしない・ADR 0034/0037）** | `move-specs.yaml`（per-game・Champions 固有値） | skill-authored（`serebii:catalog move-master` で後勝ち上書き是正・ADR 0037） |
| **日本語名 ja** | **PokeAPI `names`（ja-Hrkt 優先・ADR 0032）** | `languages/*.yaml`（名前 SoT・上書き可） | `materialize` |
| **英語名 en** | **Serebii 表示名 / 特性は id 由来（PokeAPI names で突き合わせ）** | `languages/*.yaml`（名前 SoT） | skill-authored |
| **タイプ相性** | **PokeAPI に無し** | `type-specs.yaml` の `damageTo` | skill-authored |
| **メガ構造（dex / types / baseStats / ability / baseSpecies）** | **PokeAPI（構造）/ baseSpecies は Serebii 著述（ADR 0036）** | `mega-specs.yaml` | skill-authored / `materialize`（dex/types/stats） |
| **レギュレーション解禁** | **PokeAPI に無し** | per-reg `<reg>/{species,items,mega}.yaml` | skill-authored |

表に表れない補足（安全性・取得経路の要点。「なぜ」の詳細は上記「三段」節と各 ADR を参照）:

- **構造データ取得元は PokeAPI 継続**（Champions 非依存で値が信頼できる）。SoT を specs YAML へ移した根拠は ADR 0027。
- **日本語名 ja の取得元は PokeAPI `names`（ja-Hrkt 優先・[ADR 0032](../../docs/adr/archive/0032-japanese-name-source-pokeapi-names.md)）**。`materialize` が raw `names` から `languages/*.yaml` へ転記する（append/既存尊重・初期値補完で名前 SoT は不変・既存値は上書きせず conflict 提示）。
- `fetch-pokeapi.ts` は種族 / 持ち物の `names` に加え、**技 / 特性は日英名が欠けるエントリのみ** `move` / `ability` を best-effort 取得（404 等は skip）して ja（特性は en も）を補完する。**技メタ（type / power 等）には PokeAPI を使わない**（名前と技メタを分離・技メタ SoT は per-game `move-specs.yaml`・ADR 0034 = ADR 0026 改訂 / 所在は ADR 0035）。
- **raw 存在の担保は `update-catalog` skill の責務**（`materialize.ts` は fail-fast で前提が揃っている前提に動く・`survey-regulation` は specs 更新チェックポイントで誘導）。MVP 時点で**全国図鑑の全種族分**を生成する。生成型は [[type-conventions]]、検証は [[tsc-verification]]。
