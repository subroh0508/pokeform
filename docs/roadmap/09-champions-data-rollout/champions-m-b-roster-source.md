# champions-m-b 限定セット roster-source（Phase 2）

> 09-champions-data-rollout **Phase 2**（M-B 限定投入）で `survey-regulation` skill を実地検証するため、
> M-B を**「M-A の 10 体 + M-B 追加解禁全種」+ 全持ち物**に絞って投入した際の出典付き記録。情報源方針の正本は
> [`serebii-sourcing.md`](../../../.claude/skills/survey-regulation/references/serebii-sourcing.md)
> （① Serebii 第一優先 / ② 補助件数裏取り / ③ PokeAPI 構造データ）。Phase 1 の記録は
> [`champions-m-a-roster-source.md`](./champions-m-a-roster-source.md)。

- **対象レギュレーション**: `champions-m-b`（期間 2026-06-17〜2026-09-02・`data/champions/m-b/index.yaml`）。
- **検証日**: 2026-06-26。
- **第一優先ソース**: Serebii Champions Ranked Battle Regulation M-B
  （`https://www.serebii.net/pokemonchampions/rankedbattle/regulationm-b.shtml`）= **M-B で追加解禁される種族 /
  メガ / 持ち物の正**。各種族の使用可能技は Serebii Champions 図鑑
  （`https://www.serebii.net/pokedex-champions/<species>/`）・技専用ページ（`attackdex-champions`）。
- **構造データ / 日本語名**: PokeAPI（`fetch:data` → `materialize`・ADR 0027 / 0032）。

## なぜ「M-A の 10 体 + M-B 追加解禁全種」か

限定セット検証サイクルの 2 段目。M-A（Phase 1）との重複種を二重投入せず、catalog は共有・per-reg `m-b/*` のみ
差分追記する経路（append-only・レギュ間差分）を skill が正しく扱えるかを検証する。種族を絞っても skill の
駆動経路（取得 → 転記 → 補完 → 検証 → 生成 → レビュー）は本投入と同一にしている。

## M-B 追加解禁種の確定（Serebii M-B レギュページ）

Serebii の Regulation M-B ページが列挙する**新規解禁 base 種族 22 体**（dex 昇順）:

| dex | 種族 | メガ | PokeAPI 解決 |
|---|---|---|---|
| 0045 | vileplume | — | ✓ |
| 0211 | qwilfish | — | ✓ |
| 0254 | sceptile | Mega Sceptile | ✓（mainline） |
| 0257 | blaziken | Mega Blaziken | ✓（mainline） |
| 0260 | swampert | Mega Swampert | ✓（mainline） |
| 0303 | mawile | Mega Mawile | ✓（mainline） |
| 0376 | metagross | Mega Metagross | ✓（mainline） |
| 0398 | staraptor | Mega Staraptor | **✗ Champions 固有** |
| 0518 | musharna | — | ✓ |
| 0545 | scolipede | Mega Scolipede | **✗ Champions 固有** |
| 0560 | scrafty | Mega Scrafty | **✗ Champions 固有** |
| 0604 | eelektross | Mega Eelektross | **✗ Champions 固有** |
| 0668 | pyroar | Mega Pyroar | **✗ Champions 固有** |
| 0687 | malamar | Mega Malamar | **✗ Champions 固有** |
| 0689 | barbaracle | Mega Barbaracle | **✗ Champions 固有** |
| 0691 | dragalge | Mega Dragalge | **✗ Champions 固有** |
| 0861 | grimmsnarl | — | ✓ |
| 0870 | falinks | Mega Falinks | **✗ Champions 固有** |
| 0904 | overqwil | — | ✓ |
| 0972 | houndstone | — | ✓ |
| 0979 | annihilape | — | ✓ |
| 1000 | gholdengo | — | ✓ |

- **M-A の 10 体**（charizard / starmie / gengar / garchomp / dragapult / dragonite / hydreigon / tyranitar /
  lucario / rotom-wash）は Phase 1 投入済み。M-B でも引き続き解禁のため per-reg `m-b/*` に再掲する（種族ページは
  reg 非依存ゆえ movepool は M-A と同一・Phase 1 の per-reg データを species-level fact として再利用し、
  rotom-wash の form-slug fallback を再実行しない）。**catalog は二重投入しない**（既存尊重）。
- **最終 per-reg `m-b/species.yaml` = 32 体**（M-A 10 + 新規 22）。

### 補助件数裏取り（②）

Serebii M-B ページ要約は「**33 newly useable Pokémon**」（base 種 + メガ別記載の合算カウント）。本投入は base 種
**22 体**を正とし、メガ別記載（Raichu/Sceptile/… の Mega 形）はメガ membership として別扱いした。raichu は
**M-A 既出**（base は M-A 解禁済み）で M-B では Mega Raichu X/Y のみ新規追加のため、「追加解禁**種**」には含めない
（メガのみ追加・かつ Champions 固有メガで PokeAPI 非解決ゆえ下記ギャップ 1 で対象外）。

## メガの扱い（Phase 1 ギャップ 1 の再来・Champions 固有メガは投入対象外）

Serebii の M-B 新規メガ 14 形のうち、**mainline（PokeAPI 解決可）5 形のみ投入**し、**Champions 固有メガ 9 形は
投入対象外**とした（Phase 1 で Mega Starmie / Mega Dragonite を外したのと同一判断）:

- **投入（mainline）**: `sceptile-mega`（lightning-rod）/ `blaziken-mega`（speed-boost）/ `swampert-mega`
  （swift-swim）/ `mawile-mega`（huge-power）/ `metagross-mega`（tough-claws）。
- **投入対象外（Champions 固有）**: Mega Staraptor / Scolipede / Scrafty / Eelektross / Pyroar / Malamar /
  Barbaracle / Dragalge / Falinks（および Mega Raichu X/Y）。これらは固有特性（eelevate / fire-mane 等）も持つ。
- per-reg `m-b/mega.yaml` = **10 種**（M-A 由来 5: charizard X/Y・gengar・garchomp・tyranitar・lucario + 新規 5）。

> **訂正（plan 09 Phase 3 skill 改修・本 PR で検証）**: 当初「PokeAPI に mega slug が無く materialize 不可」と
> 記したが**誤り**。**メガ pokemon 本体（`pokemon/staraptor-mega` 等）は PokeAPI に存在（HTTP 200・例:
> staraptor-mega = fighting/flying・contrary）**し materialize 可能。404 するのは **メガ"ストーン"
> （`item/staraptite` / `item/raichunite-x` 等 Champions 固有）のみ**。Phase 3 で **メガストーンの構造（category）
> 取得元を Serebii に変更 + item の 404 graceful skip** を skill / codegen に入れ、メガはストーンの PokeAPI 有無に
> 関わらず記録できるようにした（ストーン ja のみ人間が手入力で補完）。除外した 9 形 + Mega Raichu X/Y +
> Phase 1 の Mega Starmie / Dragonite は改修後に再投入可能。

## 技マスター（ADR 0037）

新規 22 種の覚える技の union（339 技）のうち、**move-specs 未登録の 86 技**を技専用ページ（`attackdex-champions`）
から専用取得し `move-specs.yaml` へ追記した（既存 290 技は M-A 由来で不変・後勝ち上書きなし）。priority・PP 等は
Champions 準拠値（例: `first-impression` priority +2 / `spit-up` power null）。

## 取得 counts（層1 決定論スクレイパー逐次）

| データ | 取得手段 | 結果 |
|---|---|---|
| 種族ページ（覚える技一覧 / 種族値 / タイプ / 特性 / メガ） | `scrape:serebii species` → `serebii:catalog species` | 新規 22 体すべて exit 0（escalation なし）。Champions 固有メガ 9 形は転記前に JSON から除去（投入対象外） |
| 技マスター（技メタ 6 項目） | `scrape:serebii move-master` → `serebii:catalog move-master` | 新規 union 339 技中、未登録 86 技を取得（全 exit 0） |
| 持ち物 | `scrape:serebii items` → filter → `serebii:catalog items` | items.shtml 全 148 件から M-B 解禁の新規 20 件を選択転記 |

## 持ち物（全持ち物の限定セット解釈）

M-B 解禁持ち物 = **M-A の 64 件 + M-B 新規 20 件 = 84 件**:

- **M-B 新規一般持ち物 15 件**（Serebii M-B ページ列挙）: wide-lens / muscle-band / wise-glasses / expert-belt /
  light-clay / **life-orb** / zoom-lens / metronome / iron-ball / icy-rock / smooth-rock / heat-rock / damp-rock /
  shed-shell / big-root。**`life-orb` は M-A 非解禁 → M-B 解禁**（reg 差分の代表例・item-specs には旧 m-b 由来で
  append-only 残存していたものを per-reg へ追加）。
- **新規メガストーン 5 件**（mainline メガ用）: sceptilite / blazikenite / swampertite / mawilite / metagrossite。
  Champions 固有メガ用ストーン（staraptite 等）は PokeAPI 非存在ゆえ本フェーズでは投入対象外（メガ本体は
  PokeAPI 200・後述ギャップ 1 の訂正どおり Phase 3 改修後は Serebii 由来で記録可能）。
- M-A 由来 64 件（一般 + きのみ 58 + M-A ロスターメガストーン 6）は M-B でも解禁のため per-reg `m-b/items.yaml` に
  再掲（append-only・union）。

## 既知ギャップ（Phase 3 検証ゲートへの申し送り）

Phase 1 で炙り出した skill / pipeline の不備が M-B 限定投入でも再現した。本投入（Phase 4）の前に Phase 3 で是正すべき:

1. **【plan 09 Phase 3 で是正済】Champions 固有メガのストーンが PokeAPI に無い**（当初「メガ本体も非存在」と
   誤記・訂正）: 上記「メガの扱い」節の訂正と同じく、**メガ pokemon 本体は PokeAPI に存在（200）し materialize
   可能**で、404 するのはメガ"ストーン"のみ。Phase 3 skill 改修（issue #185）でメガストーンの category 取得元を
   Serebii 化 + item 404 graceful skip を入れ、メガはストーンの PokeAPI 有無に関わらず記録可能にした。除外した
   M-B の固有メガ 9 形 + Mega Raichu X/Y は改修後に再投入可能（ストーン ja のみ人間手入力補完）。
2. **新規種族の null placeholder で materialize がクラッシュ + メガ linking 取りこぼし**（Phase 1 ギャップ 2 の拡張）:
   `serebii:catalog species` が新規種族を `null` placeholder で登録し、`materialize` が null を受けてクラッシュするため、
   本フェーズでも 21 種 + 14 持ち物を空 map（`{}`）へ手動変換して回避した。**さらに同 placeholder 起因で、メガ運用の
   新規 base 種（sceptile / blaziken / swampert / mawile）の `species-specs.megaEvolvesTo` 自動著述がスキップされた**
   （`writeSpeciesCatalog` の `"set" in node` 判定が null Scalar で false になるため・既存 entry の metagross のみ著述
   された）。本フェーズでは 4 種の `megaEvolvesTo` を手動補完した。materialize / placeholder 形と、placeholder への
   メガ linking 著述の両方を Phase 3 で是正する。
3. **mega ability / mega ja 名が手動著述依存**（Phase 1 ギャップ 3 と同一）: 新規 5 メガの ability
   （lightning-rod / speed-boost / swift-swim / huge-power / tough-claws）と ja 名（メガジュカイン 等）、
   メガ特性 lightning-rod / huge-power の ability-specs / languages 追記を手動補完した。
4. **gendered 種の PokeAPI form-slug 不一致**（新規ギャップ・rotom-wash 系の form-slug 問題と同類）: `pyroar` は
   PokeAPI の default `pokemon` フォームが `pyroar-male`（`pokemon/pyroar` は 404）。`fetch:data` に slug override が
   無いため、`pokemon/pyroar-male` + `pokemon-species/pyroar` を取得し raw キャッシュに `pyroar` 名で保存する手動
   fallback で回避した。本投入では gendered 種（meowstic / indeedee / basculegion 等）の slug 解決を pipeline に
   補う要否を判断する。

## pokemon-data-reviewer 検証結果（blocking 0）

`pokemon-data-reviewer` agent でレビューし **blocking 0**。M-B 新規 22 種の種族値・タイプ・特性・図鑑番号、
新規 5 メガの spec とメガ相互参照（4 点セット）、日英名、M-A との差分整合（1550 行純追加・削除 0・M-A per-reg 無変更）
は全て妥当（第9世代準拠）。指摘 2 件は対応済み:

- **non-blocking（megaEvolvesTo 欠落）**: sceptile / blaziken / swampert / mawile が `species-specs.megaEvolvesTo`
  を欠く（上記ギャップ 2 のメガ linking 取りこぼし）→ **4 種に手動補完して再生成**（解消）。
- **nit（staraptor の blaze-kick）**: Serebii Champions staraptor ページの scrape に **blaze-kick / heat-wave が
  掲載**されている。技の出自は Serebii 第一優先・PokeAPI learnset 非依存（ADR 0026）のため、mainline で覚えなくても
  Serebii が Champions の使用可能技として挙げる技は採用する（Phase 1 の starmie bulk-up と同じ判断）。変更なし。

## append-only catalog（ADR 0027）との整合

structural catalog（`species-specs` 等）は append-only マスター。M-B 投入は **1550 行の純追加（削除 0）**で、
M-A 既存エントリ（種族 / 技 / 持ち物 / メガ）を破壊・重複しない。M-A の per-reg（`data/champions/m-a/*`）は
Phase 1 から不変。生成 per-reg（`src/generated/champions/m-b/*`）が M-B = 32 体の解禁集合を表す。
