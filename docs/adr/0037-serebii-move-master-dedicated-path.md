---
id: 0037
status: Accepted
date: 2026-06-21
---

# 0037. 技マスターを Serebii 技専用ページ（attackdex-champions）から専用取得する経路を追加する

## Context

技メタ（`type` / `damageClass` / `power` / `accuracy` / `pp` / `priority`）の **SoT は per-game の
`move-specs.yaml`**（Champions 固有値・skill-authored・PokeAPI を技威力等の信頼源にしない）であり、技の
**出自は Serebii 第一優先**である。この決定の核は [ADR 0026](./archive/0026-pokeapi-not-champions-legality-source.md)
で確立し、[ADR 0034](./archive/0034-move-meta-per-game-sot.md)（所在 = per-game）を経て、現行は
[ADR 0035](./0035-specs-languages-layout-redesign.md) が **`move-specs`（specs 軸・per-game）を SoT とする所在**で
継承保持している（0026 / 0034 は archive・本質は不変）。本 ADR はこの SoT・出自を**変えない**。

問題は技メタの**取得方式**にある。現状は各種族の Serebii 種族ページ（`pokedex-champions/<species>/`）の
"Standard Moves" 表から技メタを**副産物として抽出**している（`src/codegen/serebii/parse.ts::movesIn()`）。
この副産物方式には次の構造的欠陥がある:

- **技マスター取得が独立した役割になっていない**。「種族が覚える技を見たついで」に技メタが入るため、技そのものの
  値を Champions 準拠で正す**専用の入口が無い**。結果、前作値（PP 5/10/15/25/30/40 等）の誤りが残りやすい。
- **種族ページの表は `priority` を持たない**。`ParsedMove` は `type` / `damageClass` / `power` / `accuracy` /
  `pp` のみで、`move-specs` が必須とする `priority` を種族ページから取れない（副産物方式の構造的限界）。
- 技メタ値を**人手で Champions 準拠へ是正する旧アプローチ**（別計画群で計画されていた手動是正フェーズ）は、
  根本解決ではなく対症療法であった。手動是正は出典との同期・再現性（skill 再実行で同じ結果に収束する性質・
  [ADR 0030](./0030-data-champions-skill-authored.md)）を担保できない。

Serebii には技そのものの専用ページ（`attackdex-champions/<move>.shtml`）が存在し、種族ページの技リンク
（`a[href*='/attackdex-champions/']`）が指す先がこれである。実ページ確認の結果、専用ページは技メタを**全項目
（priority を含む）**明示しており、Champions 準拠値（例 Earthquake PP=12・前作 10 ではない）を持つ。よって
「種族が覚える技の名前一覧」取得と同様に「技マスター取得」を**独立した決定論スクレイパー経路**にすべきである。
スクレイパー基盤（決定論層1 + 自己検証 exit code + Workflow 自己修復層2-3）は
[ADR 0031](./archive/0031-deterministic-serebii-scraper-hybrid-layers.md)（[ADR 0033](./0033-deterministic-mega-auto-authoring.md)
へ supersede・基盤は現行）で確立済みで、新経路もこの枠組みを再利用する。

## Decision

**技マスター（技そのものの威力・命中・タイプ・分類・PP・優先度）を、Serebii の技専用ページ
`attackdex-champions/<move>.shtml` から独立取得する決定論スクレイパー経路を新設する。** 種族ページからの
技メタ副産物抽出をやめ、技メタの取得を技専用ページに一本化する。SoT（`move-specs`・per-game）・出自
（Serebii 第一優先）は [ADR 0035] のまま不変で、本 ADR が変えるのは**取得方式（副産物抽出 → 専用取得）**のみ
である。よって本 ADR は [ADR 0035] を **supersede せず補完**する（SoT 所在・出自・「PokeAPI を技メタ信頼源に
しない」核はいずれも不変のため）。あわせて**旧来の技メタ手動是正アプローチを廃止**し、その役割を本専用取得
経路へ吸収する（手動是正の経緯は mutable な OVERVIEW / README に記録する）。

仕様の詳細（取得元 / SoT / 転記の対応表）の正本は [[data-pipeline]]、情報源の役割・スクレイパー DOM 契約の
正本は [`serebii-sourcing.md`](../../.claude/skills/survey-regulation/references/serebii-sourcing.md) とし、本 ADR は
「なぜ」と確定した設計契約（次の設計メモ）を記録する。実装は後続フェーズが担い、実装着手時に DOM 契約を
`serebii-sourcing.md` へ反映する。

### 設計メモ 1 — 技専用ページの DOM 契約（実ページ確認済み）

実ページ（Earthquake / Quick Attack / Swords Dance / Roar）で確認した抽出契約:

- **URL**: `https://www.serebii.net/attackdex-champions/<slug>.shtml`。`<slug>` は **圧縮 slug**（`earthquake` /
  `quickattack` / `swordsdance`）で、種族ページの技リンク `a[href*='/attackdex-champions/']` と同一規約。圧縮 slug
  からハイフン位置を復元できないため、catalog id は**表示名**（`Quick Attack`）を `toCatalogId` で kebab 化して得る
  （既存 slug 正規化方針を踏襲・[`serebii-sourcing.md`](../../.claude/skills/survey-regulation/references/serebii-sourcing.md)）。
- **抽出フィールド**: `type`（18 タイプ id）/ `damageClass`（Physical/Special/Other → physical/special/**status**）/
  `power` / `accuracy` / `pp` / **`priority`**（種族ページに無い新フィールド・"Speed Priority" として明示）。
- **罠（既存パーサ helper で吸収可）**:
  - **変化技**: `power` = `--` → `null`、`accuracy` = `101`（必中表記）→ `null`。Category = Status。
    既存 `cellNumber()`（`--`→null）/ `accuracyNumber()`（101→null）/ `DAMAGE_CLASS`（other→status）がそのまま流用可。
  - **priority は符号付き整数**: `-6`（Roar）/ `0`（Earthquake）/ `+1`（Quick Attack 系）。符号付き整数として
    parse する（`/^[+-]?\d+$/`）。priority のみ `--` / 必中特例は無く、全技が整数値を持つ。
  - **文字コード = latin-1 + CRLF + 超長行**（サイト共通）。`decodeSerebiiHtml` でデコードしてから cheerio に渡す。
- **fetch / scrape は I/O とロジックを分離**: 抽出は `src/codegen/serebii/*` の純関数（fixture テストでカバレッジ
  100%）、fetch / fs 配線は `scripts/*`（coverage 除外）に置く既存分離を踏襲する。

### 設計メモ 2 — 技マスター経路の exit code 自己検証契約（0/2/3/4）

既存 `scrape-serebii`（種族 / 持ち物）の stage 写像と同型の契約を技マスターにも定める:

- **0 健全**: 全必須フィールドが揃い健全性違反なし。
- **2 取得失敗**: `data/raw/serebii/attackdex/<slug>.html` キャッシュ未取得（先に fetch を実行）。
- **3 schema 欠落**: `type` / `damageClass` / `pp` / `priority` のいずれか欠落（必須欄が取れない = DOM 変化の疑い）。
  欠落（3）を健全性（4）より優先する（既存 `validateSpecies` / `validateItems` と同じ順序原則）。
- **4 件数・健全性**: `pp` が Champions PP スケール `{8, 12, 16, 20}` 外 / `type` が 18 タイプ外 / `damageClass` が
  `{physical, special, status}` 外 / `power` ・ `accuracy` が（非 null 時）負値 / `priority` が想定レンジ
  `[-7, +5]` 外。stderr に `{slug, stage, missingFields, rawHtmlPath}` を JSON 出力（既存 `fail()` 契約と同型）。

### 設計メモ 3 — 役割分割の境界（後続リファクタの確定方針）

- `src/codegen/serebii/parse.ts`: `parseSpeciesBase`（種族値・タイプ・特性）/ `parseMoves`（**その種族が覚える技の
  名前一覧のみ** = id 抽出に縮小）/ `parseMegas`（メガ形態）+ 新 `parseMoveMaster`（技専用ページから技メタ全項目）。
  種族ページからの技メタ副産物抽出（現 `movesIn` の type/power 等）を除去し、`parseMoves` は名前一覧に純化する。
- `src/codegen/serebii/to-catalog.ts`: catalog-fields / per-game-fields（技メタ）/ regulation-fields へファイル分離。
- `scripts/serebii-to-catalog.ts`: `transcribeSpecies` を catalog / per-reg 書き込みへ分解 + 新 `transcribe-move-master`
  （技マスター中間 JSON → `move-specs.yaml` 転記）。
- **意味保存リファクタ**: 役割分割後も `generate:data` の出力は決定論的に不変（差分ゼロ）を保つ。

### 設計メモ 4 — skill オーケストレーター化の粒度

`survey-regulation` を実行調整に徹するオーケストレーターへ再編する。**独立単位 = roster 確定 / 覚える技の一覧 /
技マスター（新）/ 持ち物**。**非分割 = メガ**（決定論自動著述で機械化済み・[ADR 0033](./0033-deterministic-mega-auto-authoring.md)）
**と技メタの per-game 移設**（[ADR 0035] で機械化済み）。各取得は `update-catalog` と同様に references 分離 +
サブスキル / Workflow 呼び分けで駆動する。Workflow は Claude 固有のため、Codex / 素の CLI は層1（テスト済み
純関数 + npm script）の逐次実行へ縮退して同一成果を出す（cross-agent フォールバック・[[cross-agent]]）。

## Consequences

- **良い点**:
  - 技マスター取得が**独立した役割**になり、技そのものの値を Champions 準拠で正す専用の入口ができる。前作 PP
    残存（5/10/15 等）を根絶し、`priority` を含む技メタ全項目を一次ソースから取得できる。
  - 技メタ手動是正という対症療法が消え、**skill 再実行で同じ結果に収束する再現性**（[ADR 0030]）が技メタにも及ぶ。
  - 取得経路・抽出コード・skill の 3 層で役割が分解され、新データ種別・新レギュ追加時の変更が局所化する。
- **悪い点 / コスト**:
  - 取得対象ページが増える（種族ページに加え技ごとの専用ページ）。取得件数は M-A 規模で数百技になりうるため、
    冪等キャッシュ（`data/raw/serebii/` で再実行 skip）と礼儀バッチ fan-out（層2）で取得コストを抑える。
  - 技メタ取得元が種族ページ表から技専用ページへ移るため、新パーサ（`parseMoveMaster`）とその fixture・回帰
    テストを新規に書く実装コストが生じる（後続フェーズ）。
- **トレードオフ / 留意点**:
  - **reversible**: 取得方式は可逆。専用ページの DOM が将来変わったら exit code 3（schema 欠落）で検知し、層3 で
    セレクタを一般化して吸収する（同パーサ欠陥は複数技で出るため欠陥シグネチャでバッチ修正）。
  - SoT・出自を変えないため、本 ADR は [ADR 0035] を **supersede しない**。誤って「move-specs SoT を変える」
    「PokeAPI を技メタ信頼源にする」等と読まれてはならない。

## Alternatives Considered

| 代替案 | 却下理由 |
|---|---|
| 種族ページからの技メタ副産物抽出を維持する（現状） | 専用の是正入口が無く前作値が残りやすい。種族ページ表は `priority` を持たず move-specs の必須項目を満たせない（構造的限界）。 |
| 技メタを人手で手動是正する（旧アプローチ） | 対症療法で再現性（skill 再実行収束・[ADR 0030]）を担保できない。専用取得で Champions 準拠値を根本取得するのが正しい。 |
| 本 ADR で [ADR 0035] を supersede する | SoT 所在（move-specs）も出自（Serebii）も「PokeAPI を技メタ信頼源にしない」核も不変。変わるのは取得方式のみで、決定の本質に触れないため supersede は過剰。補完が実態に合う。 |
| PokeAPI raw から技メタを取る | PokeAPI は Champions 非対応で技威力等が実態と乖離する（[ADR 0026] の核・不変）。技マスターも Serebii 第一優先に一本化する。 |
