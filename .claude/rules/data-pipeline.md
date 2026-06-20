---
paths:
  - "scripts/**"
  - "data/**"
description: データ生成パイプライン（raw=取得キャッシュ / champions catalog=SoT / generated=raw 非依存合成の vendor 方式・取得元 PokeAPI / SoT catalog / materialize 転記）。scripts/ や data/ を扱うとき適用する。
---

# データ生成パイプラインの規約

PokeAPI を **取得元**に vendor 方式で取り込み、構造データの **SoT は catalog YAML** に置いて `data/generated/` を出力する流れの要点。正本は `docs/plan/01-mvp/architecture.md`（「データ生成パイプライン」節）と ADR `0012-vendor-pokeapi-data`（取得方式）/ ADR `0027-structural-data-catalog-sot`（構造データ SoT を catalog へ・generate raw 非依存）。

## data/champions の運用方針（skill 著述・人間直編集 NG）

`data/champions/**`（`catalog/*.yaml` / `regulations/*.yaml` / `rules.yaml`）は **skill 著述で維持し、人間が直接エディタで編集しない**。著述主体は **取得スキル / `author-individual` を実行する AI エージェント**で、[ADR 0034](../../docs/adr/archive/0034-move-meta-per-game-sot.md)（ADR 0026 改訂・技メタ per-game SoT）の方針どおり Serebii / PokeAPI 等の出典を閲覧して YAML へ転記する。人間の直編集を禁じるのは、出典との同期・再現性（同じ skill を再実行すれば同じ結果に収束する性質）を壊さないためで、決定の「なぜ」は [ADR 0030](../../docs/adr/0030-data-champions-skill-authored.md)。

- **取得スキルは取得元で 2 分割**（取得元・更新頻度・情報源が異なるため・[[skill-authoring]]）: **`update-catalog`** = PokeAPI 由来の reg 非依存データ（構造データ = 種族値 / タイプ / 特性 id / 図鑑番号 / category、日本語名 ja）を `catalog/*.yaml` へ取り込む（`fetch:data` → `materialize` + 特性 id 集約）。**`survey-regulation`** = Champions 解禁データ（roster / per-species `moves` / per-game 技メタ / メガ）を Serebii 第一優先で `regulations/champions/*` へ取り込む。`survey-regulation` は **catalog 更新チェックポイント**（`check:regulation` の参照整合エラーが未登録 id を列挙）で不足を検出したら `update-catalog` を先に回すよう誘導する。

- **訂正経路**: 誤りの訂正は **skill 再実行または AI への直接指示**を経由する。`catalog` / `regulations` の訂正は対応 skill（`survey-regulation` 等）の再実行で行う。**`rules.yaml` は対応 skill が無いため改定経路を「AI への直接指示」と定義する**（人間が直接書き換えるのではなく AI に指示して書かせる）。
- **強制レベル**: 人間直編集 NG は **規約・方針レベルで担保**する。「誰が編集したか」は機械判定しづらく CI 強制が困難なため、本方針は機械ゲートでは強制しない（直編集を warn する check の要否は将来判断・ADR `0030`）。

## 取得 → 転記 → 合成の三段（raw=キャッシュ / catalog=SoT / generated=合成）

- **取得元 = PokeAPI**（継続・`fetch:data`）。取得した構造データ（種族値 / タイプ / 特性 id / 図鑑番号 / 持ち物 category）の **SoT は `data/champions/catalog/*.yaml`**（skill-authored・コミット）。raw は転記元の取得キャッシュに過ぎず、`generate.ts` は raw を読まない（ADR `0027`）。
- **`scripts/serebii-to-catalog.ts`**（Serebii 著述転記段・[ADR 0033](../../docs/adr/0033-deterministic-mega-auto-authoring.md)・スクレイパー基盤は [ADR 0031](../../docs/adr/archive/0031-deterministic-serebii-scraper-hybrid-layers.md)）= `scrape-serebii` の中間 JSON → catalog / regulations YAML。Serebii 由来の権威データ（技名 en は `catalog/moves.yaml`・**技メタ `type`/`damageClass`/`power` 等は per-game の `regulations/<game>/moves.yaml`**（ADR 0034）/ メガストーンのメガ先 / per-reg 解禁 / エンティティ key + en）を append/既存尊重で書き、構造データ・日本語名 ja は**空で残して** `materialize` に委ねる。per-reg `moves` は既存種族エントリを保護（部分集合で上書き縮小しない）。**メガ linking は決定論で自動著述**（base slug 既知 + メガ名の枝サフィックスから `<baseslug>-mega[-x|-y]` を導出し、`megaLinks` / メガ先種族エントリ / per-reg `mega[]` / メガストーンの `megaSpecies` を append/既存尊重で書く・ADR 0033）。`Mega ` 接頭の無い特殊形（Primal 等）・未知 id だけ escalation（diagnostic）。実行: `pnpm serebii:catalog`。
- **`scripts/materialize.ts`**（転記段）= raw → catalog の構造データ + 日本語名 ja 転記専任。**raw 必須・fail-fast**（不在なら ENOENT で即エラー・自前の存在チェックや `fetch:data` 誘導は持たない）。**append/既存尊重**: 未設定フィールドのみ raw 由来値で埋め、既存値は raw と異なっても上書きせず conflict を提示する（Champions 実態に合わせた skill 著述値を保護）。**raw 存在の担保は呼び出し側 `update-catalog` skill の責務**（PokeAPI 構造データ + 名前の catalog 取り込みを担い、手順で `fetch:data` → `materialize` の順を保証する。`survey-regulation` は catalog 更新チェックポイントで未登録 id を検出したら `update-catalog` を回すよう誘導する。スクリプトは前提が揃っている前提で動き、欠けたら fail-fast＝責務の二重化を避ける・ADR `0027`）。
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
  - `regulations/<game>/<reg>.yaml`（**1 レギュ = 1 ファイル**・**ゲームでグルーピング**＝`champions/m-a.yaml` 等。安定 id は `<game>-<reg>`（`champions-m-a`）を `generate.ts` がディレクトリ名から導出し、`RegulationId` リテラル・`team/individuals/*.yaml` の `regulations:` 値・生成 `regulations/<id>/` を不変に保つ（Phase 10・ソースのレイアウトだけ変え型・生成の同一性は壊さない）。**block 記法**。`name` / `period`（`start` 必須・`end` は開催中なら空＝`null`）/ `items` は**予約キー**。それ以外の**トップレベルキー = 解禁種族**（キーの存在 = allow）で、各種族キー下に **per-reg 習得技 `moves`** と、メガ運用種族は **`mega`（配列・1 種族複数メガ可）** をコロケーションする。`allow.{...}` ラッパーは廃止（ADR `0022`）。**解禁判定の正本**＝per-regulation 一本化（A案・ADR `0021`）。種族 / 持ち物 / メガの id は catalog を参照する。参照整合（種族 / 持ち物 / メガ / 技が catalog に存在）・schema は **authoring 時ゲート `check:regulation`** が検証する（`generate.ts` は変換専任・ADR `0023`）。**覚えない技（learnset legality）の照合は撤去した**（PokeAPI は Champions 非対応で learnset が実態と一致しないため・ADR `0026`）。技が実ゲームで覚えるかは authoring 段（`survey-regulation` skill・Serebii 第一優先）で担保し、`check:regulation` は `data/raw` 非依存）
  - `catalog/{species,moves,items,abilities,types}.yaml`（vendor スコープのマニフェスト = エンティティ種別ごとの **append-only マスター**で、**全データの SoT**。**Phase 10 以降、各エントリは `id → { ja, en }` 形式で名前の SoT を持つ**（skill 著述・コミット）。`species.yaml` は `pokemon`（id→名前 + **構造データ `dex` / `types` / `stats`(H/A/B/C/D/S) / `abilities`**・ADR 0027）+ `megaLinks`、`items.yaml` は `items`（id→名前 + `megaStoneFor?` + **`category`**・旧 `itemMeta` は各エントリへ統合）、`abilities.yaml` は特性 id→名前、`types.yaml` は 18 タイプの id→名前 + **相性倍率 `damageTo`**（非 1.0 のみ・generate が 1.0 補完）。`moves.yaml` は **id→名前（ja/en）のみ**（名前はゲーム非依存なので catalog が名前 SoT・Phase 11）。**技メタ `type` / `damageClass` / `power` / `accuracy` / `pp` / `priority` は per-game の `regulations/<game>/moves.yaml`（例 `regulations/champions/moves.yaml`）が SoT**（Champions 固有値・skill-authored・PokeAPI は Champions 非対応で技威力等の信頼源にしない・ADR 0034 = ADR 0026 改訂）。`generate.ts` は名前 / タイプ相性 / 技メタ / **構造データとも raw を読まず** YAML を変換する（名前 + types 相性は ADR 0025・技メタは ADR 0034・構造データ（種族値 / タイプ / 特性 id / 図鑑番号 / 持ち物 `category`）は ADR 0027 で catalog SoT 化）。構造データの転記は `materialize.ts`（raw → catalog・append/既存尊重）が担う。**append-only 方針**: 一度解禁されたものは後のレギュレーションで没収されても消さない（レギュレーションごとの解禁/非解禁の正本は別管理）。種族の `abilities` はカタログ id を参照し、カタログに無い id を参照すると `generate.ts` が**生成段でエラー**にして整合を担保する。カタログの ja/en 欠落は `generate.ts` が**生成段で非0終了**にする（authoring ゲート）。
- **`data/generated/`** = **コミット**。`scripts/generate.ts` が champions catalog を変換して（raw 非依存・ADR 0027）Dex 単位の `.ts` を出力する:
  - `types`（name + `damageTo`）/ `moves`（**id + name のみ**・catalog YAML 由来・名前はゲーム非依存・Phase 11）/ `abilities`（**id のみ**）/ `items`（**`id` + `category?` + `megaStoneFor?`**・name 無し）/ `names`（ja→id 逆引き）。abilities / items が name を持たないのは名前の SoT が catalog YAML だから（Phase 10・効果フィールドは後続で足す前提で生成ファイル自体は残す）。
  - **`regulations/champions/moves.ts`**（`moveStatsDex`・**per-game 技メタ** `type`/`damageClass`/`power`/`accuracy`/`pp`/`priority`）= per-game 共有の `regulations/champions/moves.yaml` 由来（Champions 固有値・ADR 0034）。攻撃範囲分析（coverage）・ダメージ / 火力指数はこの per-game dex を引く（名前ルックアップは `moves.ts` を引く）。
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

> **情報源の役割・関係性のポインタ**: 本表は**パイプライン機構**（どの項目がどこから来て・どこが SoT か・誰が転記するか）の SoT。一方、解禁データの**情報源の役割・関係性**（① Serebii = 第一優先の正 / ② Game8 等 = 補助・件数裏取り / ③ PokeAPI = 構造データ取得元・突き合わせ原則）の SoT は [`survey-regulation` の `references/serebii-sourcing.md`](../skills/survey-regulation/references/serebii-sourcing.md) の「情報源の役割・関係性」節にある（ここでは二重記述しない）。

| 要求項目 | 取得元 | SoT（generate の入力） | 転記 |
|---|---|---|---|
| 全国図鑑番号 | `pokemon-species.id` | `catalog/species.yaml` の `dex` | `materialize` |
| 種族値 | `pokemon.stats[].base_stat` | `catalog/species.yaml` の `stats`(H/A/B/C/D/S) | `materialize` |
| タイプ / 特性 | `pokemon.types[]` / `pokemon.abilities[]` | `catalog/species.yaml` の `types` / `abilities` | `materialize` |
| 持ち物 category | `item.category` | `catalog/items.yaml` の `category` | `materialize` |
| **使用できる技（learnset legality）** | **PokeAPI に無し（Champions 非対応・ADR 0034）** | `regulations/<game>/<reg>.yaml` の per-species `moves`（Serebii 第一優先） | skill-authored |
| **技名（ja / en）** | **Serebii 表示名 / ja は PokeAPI names（ADR 0032）** | `catalog/moves.yaml`（名前 SoT・ゲーム非依存） | skill-authored / `materialize`（ja） |
| **技メタ（type / damageClass / power / accuracy / pp / priority）** | **PokeAPI を信頼源にしない（ADR 0034）** | `regulations/champions/moves.yaml`（per-game・Champions 固有値） | skill-authored |
| **日本語名 ja** | **PokeAPI `names`（ja-Hrkt 優先・ADR 0032）** | `catalog/*.yaml`（名前 SoT・上書き可） | `materialize` |
| **英語名 en** | **Serebii 表示名 / 特性は id 由来（PokeAPI names で突き合わせ）** | `catalog/*.yaml`（名前 SoT） | skill-authored |
| **タイプ相性** | **PokeAPI に無し（Phase 10）** | `catalog/types.yaml` の `damageTo` | skill-authored |
| **レギュレーション解禁** | **PokeAPI に無し** | `regulations/<game>/<reg>.yaml` | skill-authored |

構造データ（種族値 / タイプ / 特性 / 図鑑番号 / category）は Champions 非依存で PokeAPI の値が信頼できるため**取得元は PokeAPI 継続**。SoT を catalog へ移したのは値を入力 YAML から直読でき、Champions 実態との差分を YAML 著述で吸収でき、`generate` の決定論性が上がるため（ADR 0027）。`materialize` は **append/既存尊重**で skill 著述値を上書きしない。

日英名は **`data/champions/catalog/*.yaml`（`id → { ja, en }`）が SoT**（Phase 10・コミット）。**`generate.ts` は PokeAPI を一切読まず** catalog YAML を変換する。ただし**日本語名 ja の取得元は PokeAPI `names`（ja-Hrkt 優先・[ADR 0032](../../docs/adr/archive/0032-japanese-name-source-pokeapi-names.md)）**で、`materialize` が raw `names` から ja を catalog へ転記する（append/既存尊重・初期値補完で catalog SoT は不変・既存値は上書きせず conflict 提示）。`fetch-pokeapi.ts` は種族 / 持ち物の `names`（上記取得 raw に同梱）に加え、**技 / 特性は日英名が欠けるエントリのみ** `move` / `ability` を best-effort 取得（404 等は skip）して ja（特性は en も）の補完源にする。**技メタ（type/power 等）には PokeAPI を使わない**（名前と技メタは分離）。構造データ（種族値 / タイプ / 特性 id / 図鑑番号 / category）の SoT を catalog へ移したのは ADR 0027、技メタの SoT は **per-game `regulations/champions/moves.yaml`**（Champions 固有値・ADR 0034 = ADR 0026 改訂。PokeAPI を技メタ信頼源にしない核は不変で所在を catalog → per-game へ精緻化）。raw → catalog の転記は `materialize.ts`（fail-fast・append/既存尊重）が担い、**raw 存在の担保は `update-catalog` skill の責務**（PokeAPI 構造データ + 名前の取り込み・`survey-regulation` は catalog 更新チェックポイントで誘導）。MVP 時点で**全国図鑑の全種族分**を生成しておく。生成される型の形は [[type-conventions]]、検証は [[tsc-verification]] を参照。
