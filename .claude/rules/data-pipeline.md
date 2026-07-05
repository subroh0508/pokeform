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
  - "ADR 0041"
---

# データ生成パイプラインの規約

取得元から構造・解禁・名前データを取り込み、構造の **SoT は specs YAML**（`data/champions/*-specs.yaml`）・名前の **SoT は languages YAML**（`data/languages/*.yaml`）・解禁の **SoT は per-reg YAML**（`<reg>/*.yaml`）に置いて `src/generated/` を出力する流れの規約。本 rule が規約 SoT で、設計俯瞰は [data-pipeline](../../docs/design/data-pipeline.md)、決定の「なぜ」は ADR `0039-showdown-authoritative-pokeapi-ja-only`（pokemon-showdown を第一の正に・PokeAPI を ja 専任へ・構造取得廃止 / 0012・0027 を supersede）/ ADR `0040-serebii-provisional-scraper-rebuild`（Serebii を速報経路へ降格・既存スクレイパー全廃 / 0033・0037 を supersede）/ ADR `0035-specs-languages-layout-redesign`（specs / languages / per-reg の 3 軸直交・名前 SoT を languages へ）/ ADR `0036-mega-independent-spec-entity`（メガ独立 spec エンティティ）。

## 取得元の権威序列（showdown=正 > Serebii=速報 > PokeAPI=ja 補完）

取得元は **3 経路**で、それぞれ役割と信頼度が違う（ADR 0039 / 0040）:

1. **pokemon-showdown = 第一の正（authoritative）**。`smogon/pokemon-showdown` の mod（`champions` / `championsregma`）が解禁・構造・技メタ・メガ・持ち物を一括かつ機械可読に保持し、`calculatePP` 等の Champions 固有仕様まで内包する。構造データ + 解禁データの取得元。GitHub Actions `showdown-sync.yml`（`workflow_dispatch` 手動）で clone → build → 抽出し YAML 更新 PR を自動作成する。
2. **Serebii = 速報（provisional）**。公式更新の反映が早く、各ページに日本語名を持つ。GitHub Actions `serebii-bulletin.yml`（`workflow_dispatch` 手動）で指定ページ群をスクレイプし `data:provisional` ラベルの速報 PR を立てる。showdown-sync（正）が追いついたら上書きされる暫定値。
3. **PokeAPI = 名前（全件辞書）**。showdown は ja を持たないため PokeAPI を名前取得に残し、reg 非依存の **全件名辞書**（未解禁含む全 species / moves / abilities / types の ja/en）を満たす（ja は `names` ja-Hrkt 優先・en も取得）。list endpoint で全 id を列挙し、GitHub Actions `pokeapi-names.yml`（`workflow_dispatch`・regulation 入力なし＝名前は reg 非依存）で `fetch:ja-names` → `sync:ja-names` → 検証 → `data:names` ラベル PR を自動作成する。**items だけは list 全件でなく item-category whitelist の union で列挙し対戦持ち物 ~270 件に絞る**（下記「全件名辞書」節・ADR 0042）。構造データ取得は廃止（ADR 0039）。全件辞書化と generate 緩和は ADR 0041。

**食い違いの収束**: 速報（Serebii）と正（showdown）が食い違ったら、showdown-sync が追いついた時点で上書きする。showdown PR の正確性は **`verify-showdown-pr` skill が Serebii スクレイパーで機械照合**して裏取りする（公式そのものではない showdown を独立ソースで検証・ADR 0039）。

## 全件名辞書（languages）と generate superset 判定（ADR 0041）

**`data/languages/*.yaml` は reg 非依存の全件名辞書**である。名前は reg / 構造から独立して存在するため（未解禁の
ポケモン・技・持ち物・特性・タイプにも名前はある）、per-reg 解禁のたびに追記するのでなく **PokeAPI 由来の全件
（ja/en）で先に満たす**。これにより per-reg 解禁取得（showdown / Serebii）の ja gap が原則消え、解禁取得は構造・
legality に専念できる（決定の「なぜ」は ADR 0041）。

- **generate は superset 判定（bijection → specs ⊆ languages）**。`generate.ts` の `requireNames` は **各 spec が
  languages に名前を持つ / ja・en 完備**だけを保護し、**spec を持たない余剰 languages 名（orphan）は 0 終了で
  許容**する。緩和は orphan チェックのみで、spec の名前欠落・ja・en 欠けは従来どおり**非0終了**で弾く（過剰緩和
  しない・ADR 0039 の「検証機構は不変」安全弁に対する限定的な例外・ADR 0041）。実装 SoT は `scripts/generate.ts`。
- **名前取得 workflow `pokeapi-names.yml`**（`workflow_dispatch`・reg 非依存）= PokeAPI list endpoint で全 id を
  列挙（**総数 `count` と受信 id 数の一致を fail-fast** し全件受信を保証する = 差分・冪等判定の前提。200 応答でも
  `limit` cap で `results` が不足しうるため件数照合を初版から入れる）→ `fetch:ja-names`（未記録 / 欠落 id のみ
  best-effort 取得・差分・冪等）→ `sync:ja-names`（raw → languages へ ja/en を append/既存尊重転記）→
  `check:yaml-style` / `generate:data` / `verify` → `data:names` ラベルの languages 更新 PR。`showdown-sync.yml`（正）/
  `serebii-bulletin.yml`（速報）と同型。手順は `author-static-data` skill が担う。
- **PokeAPI が ja を持たない id は捏造せず skip する**: list に含まれても ja 未収録の id（GO 専用特性
  `is_main_series:false` / Legends Arceus 未ローカライズ球 `la*-ball` / 未ローカライズ新特性 等）は、`NameEntry` の
  ja/en 必須と衝突するため **append せず skip**（推測 ja を発明しない = data 信頼性を守る）。spec が参照する id で
  ja が要るなら手作業 ja で補う。「全件辞書」の**基準は PokeAPI list 列挙**で、live count と languages 件数が僅差に
  なりうる（仕様どおり）。
- **distinct-forms（`pokemon-species` の非デフォルト variety・タイプ / 種族値が base と異なる form）は含有判定合成で
  機械生成する**（`fetch-pokeapi.ts` の `fetchDistinctForms`・plan 11 P4 が `SPECIES_FORMS` whitelist を置換）:
  `rotom-wash` / `raichu-alola` / `basculegion-female` 等は `pokemon-species` list に個別 id が無く species 名が空に
  なり `generate` が `no name entry` で fail する。これらは各 species の **varieties を辿り**、base（default variety）と
  **タイプ or 種族値が異なる** variety を採用（純関数 `isDistinctForm`）、**短い canonical id** でキーイングし、
  `pokemon-form` の `form_names` を **含有判定合成**（純関数 `composeFormName`: form 名が base 名を含めばそのまま採用・
  含まねば `base名（form名）` 合成・ja 全角 / en 半角括弧）した ja/en を **`{ names }` として species raw へ合成**して
  `materialize` の species 経路（`extractNames`）が透過的に拾う。**canonical id は PokeAPI variety slug 完全準拠でなく、
  冗長接尾辞（`-strike` / `-breed` / `-mask` / `-plumage` / `-segment` / `-striped` / `-power-construct` / `family-of-`）を
  落とした pokeform 独自の短い形**（`urshifu-single` / `tauros-paldea-combat` / `minior-meteor` 等）。純関数 `canonicalFormId`
  （`canonical-species-id.ts`）が PokeAPI slug → canonical へ写し、**構造側（`canonicalSpeciesId`: showdown 名 → canonical）と
  名前側（PokeAPI slug → canonical）の両経路が同じ `canonicalFormId` を通す**ことで canonical を単一 SoT へ収束させる
  （bare default の明示分割は `CANONICAL_ID_OVERRIDE`＝gimmighoul-chest / hoopa-confined / castform-normal）。純装飾フォルム
  （**base と同型・同種族値**の vivillon 模様 / alcremie 等）と `-mega`/`-gmax`/`-primal`/`-starter`（末尾）/ `-totem`（セグメント・
  `raticate-totem-alola` 等リージョン接尾辞手前も除く）は除外。加えて **base とは type/stat が違うが兄弟間で同型・同種族値な
  variety 群（minior の 7 色メテオ等）は先着 1 代表に畳み**、**別種族にしない個別 form（メテノの 7 色コア）は `FORM_EXCLUDE` で
  明示除外**する（cosmetic-color 膨張の機械抑制）。同ステータスでも別種族にしたい form（`greninja-battle-bond` / squawkabilly 各色 /
  morpeko はらぺこ / mimikyu ばれた / maushold ３ひき / meowstic メス / keldeo かくご / dudunsparce みつふし / basculin
  あおすじ・しろすじ）は `FORM_INCLUDE`、PokeAPI に ja 無し / 名前衝突する / 独自呼称を与える form（`greninja-battle-bond` /
  `tauros-paldea-*` の breed 別 ja+en / `pumpkaboo-*`・`gourgeist-*` のサイズ ja / `darmanitan-galar-*` のモード ja+en）は
  `MANUAL_NAME_OVERRIDE`（**短い canonical id をキーに**）で補う（合成結果より優先）。加えて **PokeAPI に variety が無い
  「地方フォルムの base」は `SYNTHETIC_BASE_FORMS` で合成注入**する（`darmanitan-galar` = ヒヒダルマ（ガラルのすがた）。standard /
  zen サブフォルムを持つ地方フォルムは base が変種として現れないため、Unovan `darmanitan` と対称に bare base + standard + zen を
  列挙する）。5 リスト（`FORM_INCLUDE` / `FORM_EXCLUDE` / `MANUAL_NAME_OVERRIDE` / `SYNTHETIC_BASE_FORMS` / `CANONICAL_ID_OVERRIDE`）と
  除外パターン・`canonicalFormId` の SoT は `fetch-pokeapi.ts` + `canonical-species-id.ts`。決定記録（id / en / ja / decision /
  distinct 根拠）を manifest（`data/raw/distinct-forms.json`）へ残し `pokeapi-names.yml` が PR レビュー表へ整形する（手順 SoT は
  `author-static-data` skill）。
- **bare base 名を抑制する種**（`SUPPRESS_BASE_SPECIES`）: bare base id が冗長 / 曖昧になる種は
  `languages/species.yaml` に bare base を出さず**明示 form だけ**を列挙する（転記段 `scripts/materialize.ts` が bare base を
  skip・構造側は `DEFAULT_TO_EXPLICIT` / `CANONICAL_ID_OVERRIDE` で bare default を明示 id へ写して name/structure の form 集合を
  一致させる）。対象は **性別二形**（basculegion / indeedee / meowstic / oinkologne = genderless base を持たずオス／メスのみ →
  `-male` / `-female`）と、**開始フォルムが一意に定まらない種**（複数フォルムのいずれも開始フォルムになりうるため bare が曖昧 =
  zygarde / deoxys / keldeo / hoopa / basculin / urshifu / pumpkaboo / gourgeist / squawkabilly / maushold / dudunsparce /
  lycanroc / oricorio / wormadam / giratina / shaymin / thundurus / tornadus / landorus / enamorus / gimmighoul /
  **ogerpon**（面のいずれも開始フォルムになりうるため bare は曖昧・default = teal を `CANONICAL_ID_OVERRIDE` で `ogerpon-teal`
  （オーガポン（みどりのめん））へ写し、他 3 面 wellspring / hearthflame / cornerstone と対称化する））。開始フォルムが一意な種
  （rotom / tauros / 各リージョンフォルム / aegislash / mimikyu / darmanitan 等）は bare base を残す（ウッウ cramorant は
  「のみこみ／まるのみ」で技仕様が変わるため base + うのみ / まるのみを `FORM_INCLUDE` で列挙）。集合の SoT は
  `canonical-species-id.ts` の `SUPPRESS_BASE_SPECIES`。
- **名前の取得元分担**（languages 各ファイルの ja/en をどこから埋めるか）:

  | languages ファイル | 取得元 | 担当 |
  |---|---|---|
  | `species` / `moves` / `abilities` / `types`.yaml | **PokeAPI 全件**（list endpoint・ja/en） | `pokeapi-names.yml` / `author-static-data` |
  | `items.yaml` | **PokeAPI item-category whitelist の union**（ja/en・全件でなく対戦持ち物のみ・ADR 0042） | `pokeapi-names.yml` / `author-static-data` |
  | `mega.yaml` | **en/ja = PokeAPI（`pokemon-form` の `form_names`・`is_mega` で判別）** | `pokeapi-names.yml` / `author-static-data`（6 種目・ADR 0043） |
  | `regulations.yaml` | **skill 著述**（命名規約・PokeAPI に無い） | `author-regulation-data`（per-reg・ja/en とも著述） |

- **items だけ item-category whitelist で絞る**（ADR [0042](../../docs/adr/0042-items-battle-holdable-whitelist.md)）:
  items.yaml は他 4 種と違い list endpoint 全件（2176 件）でなく、**対戦で持たせて意味のある持ち物のカテゴリ union**
  （~270 件規模）で列挙する。持てないアイテム（ボール / 回復薬 / TM / 料理素材 / 進化石 / イベント品等）は名前辞書の
  ノイズゆえ除外する。**属性（`holdable`）ベースは不採用**（PokeAPI の attribute は古いアイテムにしか付与されず
  assault-vest / booster-energy / mega-stones を取りこぼす）。**category は全 item に付与され堅牢**。判断基準は
  「持って対戦効果があるか」で reg 解禁 legality（per-reg・別軸）では切らない（reg 非依存は維持）。
  - **whitelist カテゴリの SoT は `scripts/fetch-pokeapi.ts` の `ITEM_CATEGORIES` 定数**（コード 1 箇所に一本化・
    機械ゲート対象）。本 rule はカテゴリ名を網羅列挙せず、判断基準（上記）と**額面と実体が乖離する非自明カテゴリ**の
    注意だけを持つ（列挙を二重管理せず drift を避ける）。中核カテゴリは held-items / choice / type-enhancement /
    plates / type-protection / in-a-pinch / mega-stones 等で、除外は healing / balls / machines / evolution / curry 等。
  - **`medicine` の注意**: PokeAPI の `medicine` カテゴリは概念上の「薬（ポーション類）」ではなく**持ち物として
    持たせる木の実**（オボンのみ=sitrus-berry / ラムのみ=lum-berry / オレンのみ=oran-berry / 状態異常回復の木の実）。
    ポーション類は `healing` カテゴリに別在し除外される。カテゴリ名の額面と実体が乖離する（ADR 0042）。
  - **`other` の注意**: catch-all 名だが実体は対戦で持たせる木の実（enigma / jaboca / rowap / kee / maranga-berry =
    効果反射・被弾時能力上昇・こうかばつぐん回復）ゆえ含める。将来 PokeAPI が別種を混ぜると silently 入りうるため、
    生成 PR のデータレビュー（`pokemon-data-reviewer`）で内容を確認する（ADR 0042 のカテゴリ改廃留意点）。
  - **取得 → 剪定フロー**: `fetch:ja-names` が各 `/item-category/{cat}` を fetch して union を作り
    （**各 cat 404 でない + union 空でないを fail-fast**・category endpoint は count/limit ページング無しゆえ件数照合は
    list 用 `listAllIds` のまま維持）、union manifest（`data/raw/item-union.json`）を残す。offline の `sync:ja-names`
    が manifest を読み **items.yaml を union のみへ剪定**する（純関数 `sortedUnion` / `pruneToKeep` は
    `src/codegen/materialize.ts`・カバレッジ 100%・剪定の YAML ノード削除は `scripts/materialize.ts`）。generate は
    superset 判定（ADR 0041）ゆえ剪定後でも orphan 許容で 0 終了する。
  - **mega-stones**: ストーン名（`garchompite` 等・`-ite` 語源）が items.yaml に入り、メガ種名（`garchomp-mega` 等・
    `-mega` 語源）を持つ `mega.yaml` とは id が衝突しない（別レイヤ・ストーン=持ち物 / mega.yaml=メガ種）。

- **scaffold 不要（materialize 耐性化・plan 11 P2）**: `data/languages/*.yaml` が完全削除されていても
  `sync:ja-names`（`materialize.ts`）が **欠損ファイル / null map を block `YAMLMap` 新規作成**して埋める
  （純関数 `getOrCreateBlockMap`・`src/codegen/materialize.ts`・カバレッジ100%）。空 block map は YAML 構文上
  表現できないため以前は seed / 空マップ scaffold が必要だったが、耐性化で `author-static-data` の scaffold 手順は
  不要になった。`fetch-pokeapi.ts` の `readLangMap` も欠損ファイルを空マップ扱いで吸収する。**workflow は
  `generate:data` を `check:yaml-style` の前に走らせる**（`check:yaml-style` が CLI 経由で `src/generated/languages/*.ts`
  を import するため、生成 ts 撤去状態では generate を先にしないと CLI 起動不可・plan 11 P1）。
- **自動化対象外の静的コミット**: `data/champions/rules.yaml`（能力ポイント定数）/ `type-specs.yaml`（タイプ相性表）は
  変更頻度が極小で、いずれの skill / workflow も自動更新しない（必要時のみ AI への直接指示で手編集）。`generate` の
  前提としてコミット済みで存在し、`data/` を完全削除した場合はこの 2 ファイルのみ手作業で復元する。

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
  - **PokeAPI 名前経路**: `languages/*.yaml` の **全件名（ja/en）** を backfill（`fetch:ja-names` → `sync:ja-names`・全件列挙 + 差分）。[`author-static-data`](../skills/author-static-data/SKILL.md) skill が担う。
- **著述経路の 2 skill（reg 非依存 / reg 依存の対）**: 名前と解禁の著述オーケストレーションは対の skill が担う。**reg 非依存の全件名辞書**（languages 全件・上記 PokeAPI 名前経路）は [`author-static-data`](../skills/author-static-data/SKILL.md)、**reg 依存の per-reg 解禁データ取得**（`<reg>/*` の reset → `showdown-sync.yml` dispatch → `verify-showdown-pr` 照合 → `check:regulation` → `generate:data` → per-reg 静的著述（`index.yaml` period / `languages/regulations.yaml`）→ `pokemon-data-reviewer` 依頼）は [`author-regulation-data`](../skills/author-regulation-data/SKILL.md) が既存経路をオーケストレーションする（取得実体は再実装しない）。
- **照合**: showdown 経路の PR は [`verify-showdown-pr`](../skills/verify-showdown-pr/SKILL.md) skill が Serebii スクレイパー流用で機械照合し、roster 数 / 技件数 / 持ち物・メガ membership / 技メタ / 名前を裏取りする。
- **訂正経路**: 誤りの訂正は **取得経路の再実行または AI への直接指示**を経由する。`*-specs` / per-reg / `languages` の訂正は対応経路（`showdown:*` / `serebii:*` / `author-static-data` 等）の再実行で行う。**`rules.yaml` は対応経路が無いため改定経路を「AI への直接指示」と定義する**（人間が直接書き換えるのではなく AI に指示して書かせる）。
- **強制レベル**: 人間直編集 NG は **規約・方針レベルで担保**する。「誰が編集したか」は機械判定しづらく CI 強制が困難なため、本方針は機械ゲートでは強制しない（直編集を warn する check の要否は将来判断・ADR `0030`）。

## 取得 → 転記 → 合成の三段（raw=キャッシュ / specs+languages=SoT / generated=合成）

取得元は経路ごとに異なるが、**SoT レイアウトと検証機構は取得元非依存で不変**（ADR 0039 の安全弁）。入力 SoT を埋める取得元のみが showdown / Serebii / PokeAPI に分かれる。

- **showdown 抽出層** `scripts/showdown/*`（`dex` / `species` / `moves` / `items` / `abilities` / `mega` / `cli`）= showdown ツリーで動く抽出（`../sim/dex` import ゆえ pokeform の `tsconfig.json` `exclude`・typecheck/coverage 非対象）。CI で `pokemon-showdown/tools/` へ copy → `node build` 後に実行し、データセット別の中間 JSON を stdout に出す（`calculatePP` で実 PP=8/12/16/20 を適用済み）。
- **showdown 転記層** `src/codegen/showdown/*-fields.ts`（純関数 + コロケーション test・カバレッジ 100%）+ `scripts/sync-showdown.ts`（薄い配線・fs/YAML I/O 専任・coverage 除外）= 中間 JSON → `*-specs.yaml` / `<reg>/*` / `languages`(en) へ **append/既存尊重**で転記。`showdown:<dataset> <regId>` で起動。**ja は書かない**（PokeAPI 経路が埋める）。**mega だけは名前（en/ja とも）を書かない**（mega 構造 + linking は書くが名前は PokeAPI `pokemon-form` 経路が担う・ADR 0043）。**species id は canonical species id へ正規化**する（`canonical-species-id.ts` の `canonicalSpeciesId`・showdown bare デフォルト → 明示 canonical・species 専用層で汎用 `kebabId` と分離・moves/abilities/items の id は `kebabId` のまま不変・ADR 0044）。canonical は PokeAPI variety slug の冗長接尾辞を落とした **pokeform 独自の短い形**で、共通の `canonicalFormId` を構造側・名前側が通して単一 SoT へ収束させる（上記「全件名辞書」節・ADR 0044 の「PokeAPI slug 恒等」consequence を本方針で refine）。
- **Serebii 速報層** `src/codegen/serebii/parse-*`（純関数 + コロケーション test + `__fixtures__`・カバレッジ 100%）+ `scripts/scrape-serebii.ts`（取得 + 配線・健全性 exit code 0/2/3/4）/ `scripts/sync-serebii.ts`（中間 JSON → SoT YAML・**速報ゆえ ja / en を埋める**）。`serebii:<dataset> <regId>` で起動。Serebii は latin-1 + CRLF + 数値文字参照の日本語で、文字コードと健全性 exit code を設計に含む（ADR 0040）。
- **`scripts/fetch-pokeapi.ts`（取得・`fetch:ja-names`）/ `scripts/materialize.ts`（転記・`sync:ja-names`）** = PokeAPI `names`（ja-Hrkt + en）の **全件名 backfill 専任**（ADR 0041）。各 category の list endpoint で **全 id を列挙**し（**items だけは item-category whitelist の union で列挙 + 剪定**・ADR 0042）、`languages/*.yaml` に ja/en が揃って記録済みの id はスキップ・未記録 / 欠落 id のみ best-effort 取得（404 は skip・差分・冪等）。`materialize` は raw を決定論順（sort）で走査し、**未記録 id は新規エントリとして append**（全件名辞書化）・**既存 id は欠落欄のみ backfill**（**append/既存尊重**＝既存の著述 / 速報値は上書きせず conflict 提示）。**ただし PokeAPI が ja を持たない id（Pokémon GO 専用特性 `is_main_series:false` / LA の未ローカライズ球 / 未ローカライズの新特性 等）は「各エントリ ja/en 完備」不変条件（ADR 0041）を満たせないため append せず skip する**（必要になれば手作業で ja を補い append）。対象は `species` / `items` / `moves` / `abilities` / `types` に加え **`mega`（`pokemon-form` の `form_names` を `is_mega` で絞る 6 種目・ADR 0043）**。構造データ取得・転記は廃止（ADR 0039）。raw 必須・fail-fast（自前の存在チェックや取得誘導を持たない・raw 存在の担保は `author-static-data` skill の責務）。
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
| **日本語名 ja**（mega 除く） | **PokeAPI `names`(ja-Hrkt・全件)** | **Serebii 各ページ** | `languages/*.yaml` `ja` |
| 英語名 en（mega 除く） | showdown `.name` / **PokeAPI `names`(en・全件補完)** | Serebii 表示名 | `languages/*.yaml` `en` |
| **メガ名 ja/en** | **PokeAPI `pokemon-form` の `form_names`（`is_mega` で判別・ADR 0043）** | Serebii pokemon.shtml | `languages/mega.yaml` `ja`/`en` |
| レギュメタ name/period | skill-authored | — | `<reg>/index.yaml` + `languages/regulations.yaml` |
| タイプ相性 damageTo | skill-authored（`typechart.ts` 由来・任意） | — | `type-specs.yaml` |

表に表れない補足（安全性・取得経路の要点。「なぜ」の詳細は上記「三段」節と各 ADR を参照）:

- **構造データ + 解禁データの取得元は pokemon-showdown（正）**。mod が機械可読に一括保持し `calculatePP` 等 Champions 固有仕様を内包する。SoT を specs / per-reg YAML へ置く合成方針は不変（ADR 0027/0035）、取得元を PokeAPI から showdown へ差し替えた根拠は ADR 0039。
- **名前の取得元は PokeAPI `names`（ja-Hrkt 優先 + en・全件）/ Serebii（速報）の二経路**。`materialize`（`sync:ja-names`）が raw `names` から `languages/*.yaml` へ ja/en を転記する（append/既存尊重・初期値補完で名前 SoT は不変・既存の en（showdown 正）等は上書きせず conflict 提示）。**タイプ名も PokeAPI 全件対象**（`type` category）。**メガ名も PokeAPI 対象**で、`pokemon-form` の `form_names`（`is_mega: true` で判別）から ja/en を両取りする（従来の en=showdown / ja=手作業は撤回・上記「名前の取得元分担」表・ADR 0043）。
- **技メタ（type / power 等）に PokeAPI を使わない**（Champions 非対応）。技メタ SoT は per-game `move-specs.yaml` で、showdown の `calculatePP` 適用済み実 PP を正とする（ADR 0039）。
- **raw 存在の担保は `author-static-data` skill（名前）の責務**（`materialize.ts` は fail-fast で前提が揃っている前提に動く）。生成型は [[type-conventions]]、検証は [[tsc-verification]]。
