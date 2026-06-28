# Serebii 第一優先の調査・決定論スクレイパー・全量 materialize 手順（詳細）

`survey-regulation` skill 本体（[SKILL.md](../SKILL.md)）が参照する詳細手順。**チャンピオンズ解禁データの
情報源の役割・関係性（第一優先 / 補助裏取り / 構造データ取得元）・決定論スクレイパー（層1-3）の機構の SoT**
であり、Serebii を第一優先の正とする理由・主ソース URL パターン・**決定論スクレイパーの DOM / slug 正規化 /
latin-1 / 自己検証 exit code・層2-3 の Workflow 自己修復の機構**・全 learnable 技の全量 materialize の機構を
定める。取得は **HTML を LLM コンテキストに載せず決定論スクレイパーの exit code で判定**し（トークン最小化）、
取りこぼし種は層2-3 / 最終 WebFetch fallback で吸収する。技の出自は Serebii 第一優先に一本化し、PokeAPI
learnset への照合はしない（PokeAPI は Champions 非対応・ADR 0026）。3 層ハイブリッドの「なぜ」は
[ADR 0031](../../../../docs/adr/archive/0031-deterministic-serebii-scraper-hybrid-layers.md)、データ仕様（取得元 / SoT /
転記の対応表）の正本は [[data-pipeline]]。

## 情報源の役割・関係性（SoT）

チャンピオンズの解禁データは複数の情報源から集めて突き合わせる。各情報源の**役割と関係性**をここに 1 か所へ
集約する（`SKILL.md` / [[data-pipeline]] / `data/README.md` の情報源記述は本節へのポインタ）。情報源は次の
**3 系統**で、ソース YAML へは **skill 著述の辺（① + ② → `survey-regulation` → specs / per-reg）** と
**機械転記の辺（③ → `fetch:data` → raw → `materialize` → specs / languages）** の **2 系統が合流**する:

| 系統 | 情報源 | 役割 | ソース YAML への流入経路 | 担当データ |
|---|---|---|---|---|
| **①** | **Serebii Champions 図鑑 / items.shtml** | **第一優先 = 正** | skill 著述（`survey-regulation` → specs / per-reg） | 解禁種族 / 各種族の全 learnable 技 / 技メタ / 解禁持ち物 |
| **②** | **Game8 / Victory Road / Bulbapedia 等** | **補助 = 件数裏取り** | skill 著述（① の件数突き合わせ） | ① の総数・帰属を 2 ソース以上で検証（矛盾は出典 doc に記録） |
| **③** | **PokeAPI** | **構造データ取得元** | 機械転記（`fetch:data` → `materialize` → specs / languages） | 種族値 / タイプ / 特性 / 図鑑番号 / 持ち物 category |

**突き合わせ原則**: ① Serebii を正とし、② 補助ソースで総数・帰属を**必ず 2 ソース以上で突き合わせ**、矛盾と
採用根拠を `<id>-roster-source.md` に記録する（再現可能性）。③ PokeAPI は Champions legality・技メタの信頼源に
**しない**（Champions 非対応・ADR 0026）。構造データ（種族値 / タイプ等）は Champions 非依存で PokeAPI の値が
信頼できるため取得元に使う（ADR 0027）。

> **memory との役割分担**: 情報源の役割・関係性の SoT は**本節**（`serebii-sourcing.md`）。memory
> `serebii-first-priority-champions-data` は「Serebii を第一優先の正にする」という**方針の要約ポインタ**に
> 留め、詳細・3 系統の関係性は本節を正とする（両者が食い違わないよう役割分担する）。

## なぜ Serebii を第一優先にするか

チャンピオンズの解禁データ（解禁種族 / 各種族の使用可能技 / 解禁持ち物 / メガ）は PokeAPI に無く、対戦情報
サイトにしか無い。複数ソースの中で **Serebii の Champions 専用図鑑が最も網羅的・更新が早く・帰属が正確**で、
過去の人手調査（M-A ロスターの正確化）でも Serebii を正として Game8 等で件数検証する運用が安定した。よって本 skill は
**Serebii を第一優先の正**とし、Game8 / Victory Road / Bulbapedia 等は**補助・件数検証**に回す
（メモリ `serebii-first-priority-champions-data`）。単一ソース誤記のリスクは「Serebii を正・他で件数突き合わせ」で
抑える（2 ソース以上で突き合わせる原則は維持）。

## 主ソースの URL パターン

- **Champions 図鑑（種族ごとの使用可能技・種族値・タイプ・特性）**:
  `https://www.serebii.net/pokedex-champions/<species>/`
  - `<species>` は英名小文字（例: `garchomp` / `charizard` / `gengar`）。地域フォルム・メガは Serebii の表記に従う。
  - このページの **Standard / TM / Egg / Tutor などの技表を全て合算したものが「使用可能技 全件」**。Serebii の
    Champions ページが Champions の使用可能技の正で、PokeAPI learnset への照合はしない（ADR 0026）。
    **このページから取るのは「覚える技の名前一覧」のみ**（`parseMoves` = id 抽出に縮小）。技メタ（type /
    power 等）は技専用ページ＝下記 attackdex 経路が SoT（ADR 0037・副産物抽出を廃止）。
- **技専用ページ（技マスター = 技メタ全項目・ADR 0037）**:
  `https://www.serebii.net/attackdex-champions/<slug>.shtml`
  - `<slug>` は種族ページの技リンク `a[href*='/attackdex-champions/']` と同一の**圧縮 slug**（`earthquake` /
    `quickattack` / `swordsdance`）。圧縮 slug からハイフン位置を復元できないため catalog id は**表示名**
    （`Quick Attack`）を `toCatalogId` で kebab 化して得る（種族ページ技リンクと同規約）。
  - **技そのものの威力・命中・タイプ・分類・PP・優先度を Champions 準拠値で取得する専用の入口**。種族ページ表
    （前作 PP 残存・priority 非保持）の構造的限界を解消する（[ADR 0037](../../../../docs/adr/0037-serebii-move-master-dedicated-path.md)）。
    DOM 契約・exit code は下記「技専用ページ DOM / 技マスター exit code」節。
- **解禁持ち物一覧**:
  `https://www.serebii.net/pokemonchampions/items.shtml`
  - 一般持ち物・きのみ・メガストーンの解禁一覧。**ここに無い持ち物は非解禁**（例: life-orb / assault-vest /
    rocky-helmet / choice-band / choice-specs は M-A 非解禁）。`item-specs.yaml` からは append-only で消さないが、
    per-reg `<reg>/items.yaml` には入れない。
- **補助（件数検証）**: Game8 / Victory Road 等。Serebii の総数・帰属を裏取りし、差異は doc に残す。

## 決定論スクレイパー（層1）の DOM / 正規化 / 自己検証の SoT

[ADR 0031](../../../../docs/adr/archive/0031-deterministic-serebii-scraper-hybrid-layers.md) の決定論スクレイパー
（`src/codegen/serebii/*.ts` 純関数 + `scripts/{fetch-serebii,scrape-serebii,serebii-to-catalog}.ts` 配線）が
依拠する **Serebii ページの DOM 構造・slug 正規化・文字コード・自己検証 exit code の前提**をここに集約する
（パーサ実装の前提の SoT・実ページ確認由来）。

- **文字コード = latin-1（ISO-8859-1）+ CRLF + 超長行**: バイト列を latin-1 デコードしてから cheerio に渡す
  （HTML エンティティ展開は cheerio が担う）。UTF-8 として読むと文字化けする。
- **種族ページ DOM**（`pokedex-champions/<species>/`）:
  - タイプは base 種族の `img.typeimg`（alt=`Dragon-type`）で一意。技テーブルの type 画像は `typeimg` を持たない。
  - 技テーブルは `a[name="attacks"]` 直後の `table.dextable`（"Standard Moves" **1 表 = 使用可能技 全件**。
    mainline と違い TM/Egg/Tutor 分割なし）。各技は 2 行（データ行 + 効果説明行）。
  - メガは `a[name="mega"]` 直後のセクション（base スコープと分離して抽出）。
  - 種族値は最初の "Base Stats - Total: N" 行（先頭 Total セルを落とし H/A/B/C/D/S）。
  - **accuracy の特例**: 必中技は `101` → `null`、変化技は `--` → `null`（power/pp も `--` は `null`）。
    変化技の cat 画像 `other.png` → damageClass `status`。
- **持ち物ページ DOM**（`pokemonchampions/items.shtml`）: セクション見出し `<font><u>Hold Items / Mega Stone /
  Berries</u></font>` の直後から次の見出し手前までの `table.dextable` を全て読む（Berries は複数表にまたがる）。
  メガストーンのメガ先は説明文（`A Charizard holding this stone…`）からのみ得る（リンクが無いため）。
- **技専用ページ DOM**（`attackdex-champions/<slug>.shtml`・`parseMoveMaster`・ADR 0037）: 抽出フィールド =
  `type`（18 タイプ id）/ `damageClass`（Physical/Special/Other → physical/special/**status**）/ `power` /
  `accuracy` / `pp` / **`priority`**（種族ページに無い新フィールド・"Speed Priority" として明示・符号付き整数
  `-6`/`0`/`+1`）。罠は既存パーサ helper で吸収可: 変化技 `power` `--`→`null` / `accuracy` `101`（必中）→`null`
  （`cellNumber` / `accuracyNumber`）、Category Other→`status`（`DAMAGE_CLASS`）。priority は `/^[+-]?\d+$/` で
  符号付き parse（全技が整数値・`--`/ 必中特例なし）。文字コードは種族ページと同じ latin-1 + CRLF（`decodeSerebiiHtml`）。
- **slug 正規化**: Serebii の技 / 特性 / 持ち物リンクは圧縮 slug（`aerialace` / `sandveil` / `choicescarf`）で
  catalog id（`aerial-ace` / `sand-veil` / `choice-scarf`）とずれ、**圧縮 slug からハイフン位置を復元できない**。
  よって正規化は**表示名**（`Aerial Ace`）を入力に決定論 kebab 化する（`toCatalogId` / `normalizeItemName`・
  復元不能な綴りは `EXCEPTIONS` / `ITEM_EXCEPTIONS` で上書き）。
  - **フォルム種の URL / slug 差異（既知ケース）**: Serebii はフォルムを別 URL で持ち、PokeAPI slug とずれる種が
    ある（例 `rotom-wash` 等の rotom フォルム）。`fetch-serebii` の取得段（slug マッピング）の守備範囲外で
    exit 2（取得失敗）になりうる。これは層1 では吸収できず、**最終 WebFetch fallback / 手動 slug 解決**に
    頼る（learning #102）。新ケースを見つけたらこの箇所へ追記し、全量投入前に層1 フォルム解決の要否を判断する。
- **自己検証 exit code**（`scrape-serebii` が決定論判定・層2-3 自己修復のトリガ）: 2 取得失敗 / 3 schema 欠落
  （dex/en/types≥1/abilities≥1/stats/moves≥1 のいずれか欠落）/ 4 件数・健全性（stats 合計 ≠ Total / id 形不適合 /
  メガ先欠落）/ 0 健全。種族ページの技は**名前一覧のみ**で技メタ（type/damageClass/power/pp/priority）の検証は
  技専用ページ＝`move-master` 経路（`validateMoveMaster`）が担う（ADR 0037）。stderr に
  `{slug, stage, missingFields, rawHtmlPath}` を JSON 出力。
- **技マスター exit code**（`scrape-serebii move-master <id>`・`validateMoveMaster`・ADR 0037）: 種族 / 持ち物と
  同型の 0/2/3/4。2 = `data/raw/serebii/attackdex/<id>.html` 未取得（先に `fetch-serebii move`）/ 3 = schema 欠落
  （`type` / `damageClass` / `pp` / `priority` のいずれか欠落＝DOM 変化の疑い・欠落を健全性より優先）/ 4 = 件数・
  健全性（`pp` ∉ `{8,12,16,20}` / `type` 18 タイプ外 / `damageClass` ∉ `{physical,special,status}` / `power`・
  `accuracy` の非 null 負値 / `priority` ∉ `[-7,+5]`）/ 0 健全。診断 JSON は種族と同型。
- **転記の役割分離**: `serebii-to-catalog` は責務別サブコマンドに分かれる（ADR 0037）。`species <slug> <regId>` =
  種族 / **覚える技の名前一覧** / メガ先 / per-reg 解禁 / 技名 en（`languages/moves.yaml`）を書く（**技メタは書かない**）。
  `move-master` = 技専用ページ中間 JSON → **技メタを `move-specs.yaml` へ後勝ち上書き是正** + 技名 en を append/既存尊重。
  `items <regId>` = `item-specs` / `languages/items` / per-reg `<reg>/items.yaml`。構造データ・日本語名 ja は
  `materialize`（PokeAPI vendor）に委ねる。**メガ linking は決定論で自動著述する**（base slug 既知 +
  メガ名の枝サフィックスから `<baseslug>-mega[-x|-y]` を導出し、`species-specs` の `megaEvolvesTo` / `mega-specs` の
  `baseSpecies` 逆参照 / per-reg `<reg>/mega.yaml` / メガストーンの `megaSpecies` を append/既存尊重で書く・
  [ADR 0033](../../../../docs/adr/0033-deterministic-mega-auto-authoring.md) / 独立 mega-specs は [ADR 0036](../../../../docs/adr/0036-mega-independent-spec-entity.md)）。
  `Mega ` 接頭の無い特殊形（Primal 等）・未知 id だけ自動著述せず authoring 層へエスカレーション（diagnostic）。

## 実ページ調査と fixture 運用（スクレイパー実装・改修の前提）

層1 パーサを新規実装・改修するときは、**DOM 構造を実ページで実証してから**書く（phase doc の構造仮定は
推測でありうる・learning #94）。実証 → fixture 固定 → 回帰テストの順で機械ネットへ落とす:

- **調査ツール**: Serebii は **latin-1（ISO-8859-1）+ CRLF + 超長行**のため、BSD `grep`（macOS 既定）は
  行が長すぎ / マルチバイトで誤動作しやすい。**python / node でデコードして解析**する（learning #94）。
  ライブ取得が要る（serebii キャッシュは gitignore + worktree 非共有）ため調査はネットワーク前提で、
  **GNU `timeout` を前提にしない**（macOS に無く exit 127・Bash ツールの timeout を使う・learning #102）。
- **実ページ取得 → 最小切片を fixture 固定**: 実 HTML を取得し、**パーサが依拠する最小切片**を
  `__fixtures__/serebii-<slug>.html` として vendored 固定し、回帰テストを足して `pnpm verify` で被覆する
  （learning #92）。
- **fixture の用途分類（混同しない）**（learning #96）:
  - **synthetic（パーサ単体用）**: 架空値で DOM 形だけ再現した切片。パーサのロジック単体テスト用。
    **end-to-end / パイプライン検証に使わない**（架空 id は ja 欠落で generate が破綻する）。
  - **real-subset（パイプライン検証用）**: 実データの subset。`serebii-to-catalog → materialize →
    check:regulation → generate` の idempotency / 結合検証に使う。
  合成 fixture を end-to-end に誤用しない（PR #96 で `floettite` 架空エントリの混入 → revert を要した）。

## 層2-3 の機構（Workflow 自己修復・Claude 固有）

層1（決定論スクレイパー）を多種へ適用する取得加速・自動修復を **Claude 固有の Workflow** で行う
（[ADR 0031](../../../../docs/adr/archive/0031-deterministic-serebii-scraper-hybrid-layers.md)）。正しさは層1 に宿るため、
これらは最適化に過ぎず、Codex / 素の CLI は層1 逐次 + 人手修正で同じ成果へ収束する（cross-agent フォールバック）。

### 層2 — 取得 fan-out（[`workflows/fetch-fanout.workflow`](../workflows/fetch-fanout.workflow)）

roster（解禁種族 slug 配列）を **礼儀バッチ（既定 6 件・`parallel()`）で fan-out** し、各 slug を **read-only な
Haiku 取得 SubAgent**（`agentType: "Explore"`）が担う。方針は「**判断するな・スクリプトを呼べ**」=
`scrape-serebii.ts species <slug>` を Bash 実行し **exit code だけで判定**する（HTML を LLM コンテキストに載せない）。
exit 2（キャッシュ未取得）は `fetch-serebii.ts species <slug>` → 再 scrape、exit 0 は成功（冪等キャッシュ
`data/raw/serebii/` で再実行 skip）、exit 3/4 は `{slug, stage, status, missingFields, rawHtmlPath}` の構造化失敗
レポートへ集約する。返り値 `{ ok, failed, counts }`（counts = total / ok / failed / dropped）。

- 呼び出し（Claude のみ）: `Workflow({ scriptPath: ".claude/skills/survey-regulation/workflows/fetch-fanout.workflow", args: <slug配列 or {roster, batchSize}> })`。
- `counts` と失敗種は roster-source doc の進捗・成功/失敗記録へ転記する。失敗種は層3 / 人手へエスカレーション。

### 層3 — 修正 SubAgent + 自己修復ループ（[`workflows/self-heal.workflow`](../workflows/self-heal.workflow)）

層2 の構造化失敗レポート（exit 3/4）を、**修正 SubAgent（Sonnet+・write 権限・既定 agentType）**が自動修復する
ループ。ループは「**取得 → 失敗集約 → 修正 → 失敗種のみ再 fan-out**」で、修正 SubAgent は層1 の純関数パーサ
（`src/codegen/serebii/parse.ts` / `normalize.ts` / `schema.ts`）の**セレクタ / 正規化を一般化して直し**、当該失敗
ページの最小化 fixture（`__fixtures__/serebii-<slug>.html`）+ 回帰テストを足して `pnpm verify`（型 / カバレッジ
100% / Biome）を緑化する。方針 = 「**セレクタを一般化せよ・その種専用ハックを避けよ・既存テストを壊すな・失敗
ケースをテスト化せよ**」。同一パーサ欠陥は複数種で出るため、**欠陥シグネチャ（stage + status + missingFields）で
バッチ**して 1 修正 SubAgent に集約する。

- **権限分離**: 取得 SubAgent = read-only（層2 が `Explore` で起動）/ 修正 SubAgent = write（層3 が既定 agentType
  で起動 = Edit/Write/Bash 可）。パーサ修正とテスト追加はこの層だけが行う。
- **無限ループ防止**: 同一 slug の修復試行を **K 回上限（`maxRepair`・既定 3・1〜5 クランプ）** で打ち切り、dedup
  （同一 slug は 1 ラウンド 1 回計上 / 1 グループも verify 緑にできなければ停止）で収束させる。収束しない種は
  `escalated` として返り、roster-source doc に「未確定（人手エスカレーション）」として記録 → 最終 WebFetch fallback。
- 呼び出し（Claude のみ）: `Workflow({ scriptPath: ".claude/skills/survey-regulation/workflows/self-heal.workflow", args: <slug配列 or {roster, maxRepair, batchSize}> })`。
  返り値 `{ ok, escalated, counts }`（counts = total / ok / escalated / rounds）。

### cross-agent フォールバック（層2-3 非対称の吸収）

層2-3 は Claude 固有（Workflow）。Codex / 素の CLI では **人が `parse.ts` を直して fixture テストを足す**に縮退する
だけで成果は同一（正しさは層1 = テスト済み純関数に宿る・[[cross-agent]]）。Workflow / Agent を allowed-tools に
持たないツールでも層1（共有 npm script）で完結することが、本パイプラインが cross-agent で破綻しない必須条件。

## 日本語名は PokeAPI `names` から補完する（ja 取得元）

Serebii Champions ページに**日本語名は無い**。日本語名 ja の取得元は **PokeAPI `names`（ja-Hrkt 優先・
[ADR 0032](../../../../docs/adr/archive/0032-japanese-name-source-pokeapi-names.md)）**とし、`materialize` が raw `names`
から `languages/*.yaml` へ転記する（append/既存尊重・初期値補完で名前 SoT は不変・既存値は上書きせず conflict 提示で
表記揺れを可視化）。種族 / 持ち物の names は既存取得 raw に同梱、技 / 特性は日英名が欠けるエントリのみ `move` /
`ability` を best-effort 取得して補完源にする。**技メタ（type/power 等）には PokeAPI を使わない**（ADR 0026 不変）。
仕様（取得元 / SoT 表）の正本は [[data-pipeline]]。

## 全 learnable 技を全量 materialize する（curate しない）

各種族の `moves` は **手選びの少数サブセットにせず、Serebii Champions ページの全 learnable 技を全量**投入する。
理由は、競技 movepool は型・相手依存で変わり、少数サブセットだと利用者（個体 author）の選択肢を塞ぐため。
過去の M-A 解禁データ調査で確立したこの方針を恒久化する。各種族数十技（M-A 規模で 50〜70 技）になるのが正常で、共有プールの
使い回しは不可。

## 技の出自は Serebii 第一優先（PokeAPI learnset 照合はしない）

**PokeAPI はポケモンチャンピオンズに対応していない**ため、PokeAPI learnset を Champions の「使える技」の
信頼源にしない（ADR 0026）。Serebii Champions ページの全 learnable 技をそのまま per-reg `moves` の正とする:

- **Serebii にある技** → 採用（Serebii の網羅性を正とする）。
- 単一ソース誤記のリスクは Game8 / Victory Road 等の**補助ソースで件数・帰属を裏取り**して抑える（2 ソース以上で
  突き合わせ、矛盾と採用根拠を必ず `<id>-roster-source.md` に記録する・再現可能性）。
- 過去にあった「Serebii にあり PokeAPI learnset に無い技を除去で解消する」運用は廃止した（learnset 照合撤去・
  ADR 0026）。Champions で使えるかの最終判断は Serebii 突き合わせに委ね、PokeAPI で機械照合しない。

`check:regulation` は **参照整合（種族 / 持ち物 / メガ / 技が catalog に存在）/ schema のみ**を検証し、覚えない技は
検出しない（ADR 0026）。覚えない技の混入防止は本 Serebii 突き合わせ（authoring 段）に依存する。

## 技メタ（type / power 等）は per-game `move-specs.yaml` が SoT

技の type / damageClass / power / accuracy / pp / priority も **PokeAPI raw から導出しない**（ADR 0034 = ADR 0026
改訂）。**技の数値は Champions 固有値なので per-game の `move-specs.yaml`（m-a/m-b 横断で共有・ゲーム = champions の
specs）**が SoT。技メタは**技専用ページ（attackdex）からの専用取得経路**で確定する（[ADR 0037](../../../../docs/adr/0037-serebii-move-master-dedicated-path.md)・
種族ページからの副産物抽出・手動是正は廃止）: `fetch-serebii move <id>` → `scrape-serebii move-master <id>`
（exit code 自己検証）→ `serebii-to-catalog move-master`（中間 JSON → `move-specs.yaml`）。**転記は append/既存尊重
ではなく後勝ちの上書き是正**で、前作 PP（5/10/15 等）残存を技マスター値で正す（冪等＝既存と一致なら書き戻さない）。
技名 ja/en はゲーム非依存なので `languages/moves.yaml` が名前 SoT（ADR 0035・転記の move-master 経路は languages en を
append/既存尊重で補完）。技メタの構造欠落は `generate.ts` の `satisfies MoveStats` が生成段の tsc で弾く。`power` /
`accuracy` は変化技なら `null`。

## 解禁持ち物 全件の取得

`items.shtml` から解禁持ち物を**全件**取得し、`item-specs.yaml`（append-only・`megaStoneFor`（メガ先 base
SpeciesId）/ `megaSpecies`（ストーン→形態）/ メガストーンは `category` も Serebii 由来）+
`languages/items.yaml`（`id: { ja, en }`）と per-reg `<reg>/items.yaml` へ反映する:

- 一般持ち物・きのみ・該当メガストーンを漏れなく列挙する（M-A は一般30 + きのみ27 + メガストーン）。
- **メガストーンの `category` は Serebii 由来で確定する**（PokeAPI 非依存）。`serebii:catalog items` が
  `item-specs.yaml` に `category: mega-stones` を書く（Serebii section enum 単数 `mega-stone` を PokeAPI-canonical な
  複数形へ正規化）。**非メガストーン（一般 / きのみ）の `category` は従来通り `materialize`（PokeAPI）が埋める**
  （PokeAPI の方が粒度が細かい）。
- **PokeAPI item slug の正確な綴り**を `fetch:data` 前に確認する（例: `oran-berry` / `charizardite-x` /
  `garchompite`）。Serebii 表記と PokeAPI slug がずれる持ち物に注意。
- 非解禁持ち物（`items.shtml` に無いもの）は per-reg `<reg>/items.yaml` に入れない。`item-specs.yaml` からは
  append-only で消さない。

### Champions 固有メガストーンは PokeAPI に無い（Serebii 由来で記録・ja は手動補完）

本作で新規追加されたメガ（Mega Starmie / Mega Staraptor 等）の**メガストーン**（`starminite` / `staraptite` 等）は
**PokeAPI に存在しない**（`fetch:data` が `item/<slug>` で 404）。一方**メガ pokemon 本体**（`starmie-mega` /
`staraptor-mega` 等）は PokeAPI に存在し（HTTP 200）`materialize` で dex/types/stats を埋められる。よって:

- **メガ形態はメガストーンの PokeAPI 有無に関わらず記録する**。メガ pokemon は PokeAPI materialize、ストーンの
  identity / `category` / メガ先は Serebii 由来。これまで「Champions 固有メガは PokeAPI 非存在ゆえ投入不可」と
  判断していたのは誤りで、404 するのはメガ"ストーン"のみ。
- `fetch:data` は PokeAPI 非存在の **item を 404 で graceful skip**する（pokemon / pokemon-species の 404 は slug 誤り
  = 実エラーとして throw・厳格を維持）。`materialize` は raw 不在の item を skip し、Serebii 由来 `category` を上書き
  しない。
- メガストーンの **ja は Serebii に無いため空のまま残し、人間が手入力で補完する**（決定論転写はしない）。
  `generate` の ja/en 必須ゲート（`languages/<kind>: '<id>' missing ja/en`）が未補完を検出して補完を促す。
  mainline メガストーン（`charizardite-x` 等）の ja は従来通り `materialize`（PokeAPI names）が埋める。

## レギュ更新時の routine（M-B 以降）

新レギュレーション公開・既存レギュ更新時は決定論パイプラインで再実行する:

1. **roster 確定**（WebFetch・Serebii Champions 索引 + items.shtml）: 解禁種族 slug 配列・解禁持ち物・メガ
   membership を確定。総数は Game8 等で**機械的件数比較**に縮退して裏取りする。
2. **層1-3 取得**: Claude は `Workflow(self-heal.workflow, args: roster)`（層2 fan-out → 層3 自己修復）。Codex /
   素の CLI は各 slug を `fetch:serebii` → `scrape:serebii` 逐次 + 人手で `parse.ts` 修正。**HTML を LLM に
   載せず exit code で判定**。`counts` / `escalated` を `<id>-roster-source.md` に記録。
3. **覚える技の一覧 + 種族転記（`serebii:catalog species`）**: 層1 種族ページ中間 JSON から Serebii 由来（種族 /
   **覚える技の名前一覧** / メガ先 / per-reg 解禁 / en）を specs / per-reg / languages へ append / 既存尊重で転記。
   **技メタ（type/power 等）は書かない**（手順 4 の技マスターが SoT・ADR 0037）。**メガ linking（`species-specs` の
   `megaEvolvesTo` / `mega-specs` の `baseSpecies` / per-reg `<reg>/mega.yaml` / メガストーンの `megaSpecies`）も決定論で
   自動著述**する（ADR 0033 / 0036）。`Mega ` 接頭の無い特殊形・未知 id は escalation（diagnostic）に出る。
4. **技マスター（技メタ・ADR 0037）**: 手順 3 で得た覚える技の名前一覧の union（catalog id）を技専用ページから
   取得して `move-specs.yaml` を Champions 準拠値で**上書き是正**する。Claude は
   `Workflow(fetch-fanout.workflow, args: { roster: <move id 配列>, kind: "move" })` で fan-out。Codex / 素の CLI は各 id を
   `fetch:serebii move <id>` → `scrape:serebii move-master <id>` 逐次。各成功 id を
   `scrape:serebii move-master <id> | serebii:catalog move-master` で `move-specs`（後勝ち上書き）+ `languages/moves` の
   en（append/既存尊重）へ転記する。exit 3/4 は人手 / WebFetch fallback。
5. **持ち物（items）**: `fetch:serebii items` → `scrape:serebii items`（exit code 判定）→ `serebii:catalog items <regId>`
   で `item-specs`（`megaStoneFor` / `megaSpecies`）+ `languages/items` の en + per-reg `<reg>/items.yaml` へ転記
   （非解禁は per-reg に入れない・append-only）。
6. **specs 更新チェックポイント → `update-catalog` へ委譲**: 構造データ（`dex` / `types` / `baseStats` /
   `abilities` / `category`）と日本語名 ja の specs / languages 取り込み（`fetch:data` → `materialize` + 特性 id 集約）は
   [`update-catalog`](../../update-catalog/SKILL.md) の責務（取得元 = Serebii / PokeAPI で取得スキルを分離）。
   `check:regulation` の参照整合エラーが未登録 id（種族 / 持ち物 / 技）を列挙したら、その id を `update-catalog` に渡して
   先に specs / languages を揃えてから手順 7 へ戻る。不足なし（0 終了）なら手順 7 へ。
7. **per-reg `mega` 確認 + per-reg 仕上げ + 検証 / 再生成**: メガ linking は手順 3 が自動著述済み（ADR 0033 / 0036）。
   `serebii:catalog` の **escalation diagnostic**（`Mega ` 接頭の無い特殊形・未知 id）が出た種だけ手当し、
   `<reg>/index.yaml` の `name` / `period` を確認・補う。`escalated` 種は最終 WebFetch fallback で目視 + fixture 追加。
   `check:regulation` 0 終了（参照整合 / schema・learnset 照合はしない・ADR 0026）→ `generate:data`（raw 非依存・specs /
   languages / per-reg を変換・合成）→ `verify` 緑。
