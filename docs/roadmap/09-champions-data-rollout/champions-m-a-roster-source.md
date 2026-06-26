# champions-m-a 限定セット roster-source（Phase 1）

> 09-champions-data-rollout **Phase 1**（レコード全削除 + M-A 限定投入）で `survey-regulation` skill を
> 実地検証するため、M-A を**代表 10 体 + 全持ち物**に絞って投入した際の出典付き記録。情報源方針の正本は
> [`serebii-sourcing.md`](../../../.claude/skills/survey-regulation/references/serebii-sourcing.md)
> （① Serebii 第一優先 / ② 補助件数裏取り / ③ PokeAPI 構造データ）。

- **対象レギュレーション**: `champions-m-a`（期間 2026-04-08〜2026-06-17・`data/champions/m-a/index.yaml`）。
- **検証日**: 2026-06-26。
- **第一優先ソース**: Serebii Champions 図鑑（`https://www.serebii.net/pokedex-champions/<species>/`）・
  技専用ページ（`https://www.serebii.net/attackdex-champions/<slug>.shtml`）・持ち物
  （`https://www.serebii.net/pokemonchampions/items.shtml`）。
- **構造データ / 日本語名**: PokeAPI（`fetch:data` → `materialize`・ADR 0027 / 0032）。

## なぜ限定 10 体か

全 186 種の本投入（Phase 4）の手前で、`survey-regulation` の駆動経路（取得 → 転記 → 補完 → 検証 → 生成 →
レビュー）を**小さくレビュー可能な単位**で実地検証する（OVERVIEW の de-risk 方針）。種族を絞っても skill の
駆動経路は本投入と同一にしている。

## 代表 10 体の選定根拠

| # | 種族 | タイプ | メガ | 選定理由 |
|---|---|---|---|---|
| 1 | charizard | ほのお/ひこう | ◯（X/Y 二重） | **必須**。二重メガ linking 経路を踏む |
| 2 | starmie | みず/エスパー | △（後述） | **必須** |
| 3 | gengar | ゴースト/どく | ◯ | **必須**。メガ運用 |
| 4 | garchomp | ドラゴン/じめん | ◯ | ドメインテスト（`individual.test.ts`）が要求する seed・メガ運用 |
| 5 | dragapult | ドラゴン/ゴースト | — | team サンプル参照・非メガ |
| 6 | dragonite | ドラゴン/ひこう | △（後述） | team サンプル参照 |
| 7 | hydreigon | あく/ドラゴン | — | team サンプル参照・非メガ |
| 8 | rotom-wash | でんき/みず | — | team サンプル参照・**フォルム slug 取得 fallback 検証** |
| 9 | tyranitar | いわ/あく | ◯ | メガ自動著述（mega-specs 未登録だった種）検証 |
| 10 | lucario | かくとう/はがね | ◯ | メガ自動著述（同上）検証 |

- **必須 3 体**（charizard / starmie / gengar）は phase doc 指定。
- **garchomp** は `src/types/individual.test.ts` が `defineIndividual("champions-m-a", "garchomp")` で要求するため
  ロスターに必須（外すと `pnpm verify` の typecheck が落ちる）。
- **team サンプル連動**: `team/individuals/*` と `team/parties/standard.md` が参照する M-A 解禁種
  （garchomp / charizard / dragapult / dragonite / rotom-wash / hydreigon）は、`.githooks/pre-commit`
  （`check:individual team/individuals`）/ `pre-push`（`typecheck team/parties/standard.md`）がゲートするため
  ロスターに含めた（限定セットでも committed サンプルを壊さない）。

## 取得 counts（層1 決定論スクレイパー）

| データ | 取得手段 | 結果 |
|---|---|---|
| 種族ページ（覚える技一覧 / 種族値 / タイプ / 特性 / メガ） | `scrape:serebii species` → `serebii:catalog species` | 9 体 ok（exit 0）。rotom-wash は exit 2（フォルム slug 404）→ 手順9 WebFetch fallback |
| 技マスター（技メタ 6 項目） | `scrape:serebii move-master` → `serebii:catalog move-master` | union 252 技中、move-specs 未登録 71 技を取得（全 ok・exit 0） |
| 持ち物 | `scrape:serebii items` → `serebii:catalog items` | 解禁 120 件取得（うち一般 + きのみ 61 + メガストーン 59） |

## escalated / 手動 fallback（手順9）

- **rotom-wash**: Serebii の rotom フォルムは `pokedex-champions/rotom/`（フォルム共通 URL・内部 slug `479-w`）で、
  決定論スクレイパーの default slug（`rotom-wash`）は **http 404**（[learning #102] の既知フォルム slug 問題）。
  最終 fallback として `pokedex-champions/rotom/` を **WebFetch して Wash フォルムの使用可能技 43 件**
  （標準 42 + フォルム専用技 Hydro Pump）を目視取得し per-reg `species-moves` を手動著述した。構造データ
  （種族値 でんき/みず・H50/A65/B107/C105/D107/S86・特性 levitate）は既に catalog（materialize 済）にある。

## 持ち物（全持ち物の限定セット解釈）

- 一般持ち物 + きのみ（**全件 58**・メガストーン以外）はそのまま投入。
- **メガストーンは限定ロスターの 6 メガ形（charizardite-x/y・garchompite・gengarite・tyranitarite・lucarionite）
  に限定**。Serebii items ページが列挙する非ロスター種のメガストーン 51 件は per-reg / specs から除外した
  （限定 10 体では使用不能・かつ Champions 固有メガストーンは PokeAPI 非存在で `fetch:data` 404 を誘発するため）。
  さらに Champions 固有メガ（starmie / dragonite）用のストーン（starminite / dragoninite）は下記ギャップ 1 で除外。
- 最終 per-reg `m-a/items.yaml` = **64 件**（一般 + きのみ 58 + ロスターメガストーン 6）。

## 既知ギャップ（Phase 3 検証ゲートへの申し送り）

限定セット投入で `survey-regulation` skill / データパイプラインの**不備を 2 点炙り出した**。本投入（Phase 4）の前に
Phase 3 で skill / pipeline を是正すべき:

1. **Champions 固有メガが materialize できない**: Serebii Champions 図鑑は本作で新規追加されたメガ
   （**Mega Starmie**［みず/エスパー・huge-power・620］・**Mega Dragonite**［ドラゴン/ひこう・multiscale・700］）を
   掲載しており、`serebii:catalog species` のメガ自動著述（ADR 0033）は正しくこれらを per-reg / mega-specs へ
   起こす。しかし **PokeAPI（vendor・ADR 0027）にはこれらの mega slug が存在せず** `fetch:data` が
   `pokemon/starmie-mega` 等で 404 になり、`materialize` が構造データ（dex/types/stats/ability）を埋められない。
   そのストーン（starminite / dragoninite）も同様に PokeAPI 非存在。
   → **本フェーズでは starmie-mega / dragonite-mega とそのストーンを投入対象から外した**（mainline メガ
   charizard X/Y・gengar・garchomp・tyranitar・lucario は PokeAPI 解決可で投入済）。Phase 3 で「Champions 固有
   メガ / アイテムの構造データを Serebii scrape 由来で著述する経路」を skill / materialize に補う必要がある。

2. **新規種族の null 構造 placeholder で materialize が落ちる**: `serebii:catalog species` は新規種族を
   species-specs に **null placeholder** で登録するが、`materialize` の `planFields` が null を受けて
   `Cannot read properties of null` でクラッシュする（既存 26 種は materialize 済のため顕在化していなかった・
   新規 starmie 投入で発覚）。→ 本フェーズでは starmie を空 map（`{}`）に直して回避。Phase 3 で
   materialize（または serebii-catalog の placeholder 形）を null 許容にする是正が要る。

3. **mega ability / mega ja 名が手動著述依存**: `serebii:catalog species` はメガを baseSpecies のみで起こし、
   `materialize` は mega の dex/types/stats は埋めるが **ability と ja 名は埋めない**（既存メガは placeholder で
   手動著述されていた）。新規 tyranitar-mega / lucario-mega で ability（sand-stream / adaptability）・ja
   （メガバンギラス / メガルカリオ）を手動補完した。Phase 3 で mega ability を Serebii scrape 由来で
   catalog 転記する経路を補うと手動著述を減らせる。

## m-b の扱い（Phase 1 のリセット範囲）

phase doc の「m-a / m-b の per-reg 解禁データを初期状態へ戻す」に従い、**m-b は本フェーズで削除**した
（`data/champions/m-b/` ディレクトリ + `languages/regulations.yaml` の `champions-m-b`）。空の regulation は
`check:yaml-style`（flow `[]`/`{}` 検出）を通せず、かつ m-b は Phase 2 の scope のため、**Phase 2 で skill 経由で
ゼロから再構築する**（Phase 1 の m-a 構築と並行な「ゼロから組み直し」）。team サンプル 3 件（charizard /
dragonite / rotom-wash）の `regulations` から `champions-m-b` を除いた。

## pokemon-data-reviewer 検証結果（blocking 0）

`pokemon-data-reviewer` agent でレビューし blocking 0。種族値・タイプ・特性・相性表・メガ相互参照・日英名は
全て妥当（第9世代準拠）。non-blocking 2 件は**いずれも方針上正当**と Serebii scrape で再確認した:

- **life-orb / assault-vest / rocky-helmet が per-reg items に無い**: Serebii M-A items ページの scrape に
  これらは**非掲載**＝ M-A 非解禁（[`serebii-sourcing.md`](../../../.claude/skills/survey-regulation/references/serebii-sourcing.md)
  の「M-A 非解禁の life-orb / assault-vest / rocky-helmet」と一致）。per-reg からの除外は正しい。item-specs に
  残るのは append-only（旧 m-b 由来・ADR 0027）。
- **starmie の movepool に bulk-up**: Serebii Champions starmie ページの scrape に **bulk-up が掲載**されている。
  技の出自は Serebii 第一優先・PokeAPI learnset 非依存（ADR 0026）のため、mainline で覚えなくても Serebii が
  Champions の使用可能技として挙げる技は採用する（starmie は psycho-cut / zen-headbutt 等の物理技も持つ）。
- nit（新規メガ entry のキー順）は既存順（dex→types→stats→ability→baseSpecies）へ揃え済。

## append-only catalog（ADR 0027）との整合

structural catalog（`species-specs` 等）は **append-only マスター**（ADR 0027）のため、過去レコードの種族
（M-A-10 外の旧 roster 種・デモ種 metagross / mewtwo / salamence）は削除せず保持する。**リセットは per-reg 層**
（M-A roster を 10 体へ・truncated だった movepool を Serebii 全量へ・m-b 削除）で行い、catalog は append-only を
尊重した。生成 per-reg（`src/generated/champions/m-a/*`）が M-A = 10 体の解禁集合を表す。
