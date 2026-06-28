---
name: survey-regulation
description: >-
  ポケモンチャンピオンズのレギュレーション解禁情報（解禁種族 / 各種族の使用可能技を全件 / 解禁持ち物 / メガ）を
  Serebii 第一優先で取得し、出典付き doc + 構造 specs（`data/champions/*-specs.yaml`）+ 名前 languages +
  per-reg ディレクトリへ反映する手順 skill。「M-A の解禁データを集めて」「レギュレーション <id> の解禁種族・全技・
  持ち物を調べて投入して」「新レギュの解禁情報を取得して」「survey-regulation <id>」「M-B が公開されたので反映して」
  「レギュ情報を更新して」と言われたとき、または per-regulation データ（`02-data-model-redesign`）を新規投入 /
  更新したいときに使う。生成 / 検証は `generate:data` / `check:regulation` / `verify` に委譲。PokeAPI 構造データ /
  日本語名の取り込みは `update-catalog`、利用者パーティ点検は `review-party`、生成データ妥当性は
  `pokemon-data-reviewer` agent へ委譲する。
allowed-tools: Bash(pnpm *), Bash(node scripts/*), Bash(node src/cli/*), Workflow, Agent, Read, Write, Edit, WebFetch, WebSearch
---

# survey-regulation — レギュレーション解禁情報の調査と投入

ポケモンチャンピオンズはレギュレーションごとに解禁される**種族・技・持ち物・メガシンカ**が変化する。この情報は
PokeAPI に無く（[[data-pipeline]]）外部の対戦情報サイト（Serebii）にしか無いため、本 skill は **決定論スクレイパー
（層1）+ Workflow 自己修復（層2-3）で Serebii 第一優先に取得**し、各種族の**使用可能技を全件**・解禁持ち物を全件、
再現可能な形で doc 化して per-regulation データ構造へ反映する手順を定型化する。M-A だけでなく **M-B 以降や将来の
レギュレーション更新で routine として繰り返し使う**。

> **情報源の役割（① Serebii 第一優先 / ② 補助件数裏取り / ③ PokeAPI 構造データ）・決定論スクレイパーの機構（DOM /
> 正規化 / exit code / 全量 materialize）の SoT は [`references/serebii-sourcing.md`](./references/serebii-sourcing.md)**。
> データ構造の正本は [[data-pipeline]] / [`02-data-model-redesign/OVERVIEW.md`](../../../docs/roadmap/completed/02-data-model-redesign/OVERVIEW.md)、
> memory `serebii-first-priority-champions-data` は方針の要約ポインタ。本 SKILL.md は調査・投入手順に専念し、情報源の
> 役割・パーサ仕様を二重記述しない。

## なぜこの skill があるか

解禁情報の一次ソースは対戦サイトで、**単一ソースの目視抽出は誤記・件数取りこぼしを含み**、HTML を LLM に丸ごと読ませる
旧方式はトークン大量消費・技数誤カウント・非決定性を招いた。本 skill は **決定論スクレイパー（テスト済み純関数 + npm
script）を正しさの核**に据え、(1) HTML を LLM に載せず **exit code だけで成否判定**、(2) 取りこぼし種は **Workflow 自己
修復**で吸収、(3) 収束しない種だけ**最終 WebFetch fallback で目視**する多層で「Serebii 第一優先・全量・再現可能」を担保する
（経緯の「なぜ」は [ADR 0031](../../../docs/adr/archive/0031-deterministic-serebii-scraper-hybrid-layers.md)・機構の SoT は
[`references/serebii-sourcing.md`](./references/serebii-sourcing.md)）。

## 3 層ハイブリッド（決定論スクレイパー + 自己修復）

正しさの核は**層1**（cross-agent 共有の npm script + テスト済み純関数）にあり、層2-3 は **Claude 固有の取得加速・
自動修復層**である。詳細な DOM / 正規化 / exit code は [`references/serebii-sourcing.md`](./references/serebii-sourcing.md)、
決定の「なぜ」は [ADR 0031](../../../docs/adr/archive/0031-deterministic-serebii-scraper-hybrid-layers.md)。

| 層 | 何をするか | 実体 | エージェント |
|---|---|---|---|
| **層1** | 決定論取得 + パース + 自己検証 exit code（種族 / 技マスター / 持ち物の各経路） | `pnpm fetch:serebii` / `scrape:serebii` / `serebii:catalog`（`src/codegen/serebii/*.ts` 純関数） | 全ツール共通（Codex は逐次実行） |
| **層2** | 種族 / 技マスターを礼儀バッチで取得 fan-out（read-only Haiku・HTML を読まず exit code 判定・`kind` で呼び分け） | [`workflows/fetch-fanout.workflow`](./workflows/fetch-fanout.workflow) | Claude のみ（Workflow） |
| **層3** | 失敗種のパーサを一般化修正 + 回帰 fixture を足し失敗種のみ再取得（自己修復ループ・種族経路） | [`workflows/self-heal.workflow`](./workflows/self-heal.workflow) | Claude のみ（Workflow） |

**exit code 契約**（`scrape:serebii species` / `move-master` / `items` が決定論判定・層2-3 のトリガ）: `0` 健全 /
`2` 取得失敗 / `3` schema 欠落 / `4` 件数・健全性違反。stderr に `{slug, stage, missingFields, rawHtmlPath}` の 1 行 JSON
診断。**HTML 本文は読まない**（LLM コンテキストに載せない＝トークン最小化）。メガ linking の決定論自動著述（ADR 0033）は
手順 7 / Gotchas を参照。

### cross-agent フォールバック（正しさは層1 に宿る）

層2-3 は Claude 固有（Workflow / SubAgent）の**最適化**であり、**正しさは層1（テスト済み純関数 + npm script）に宿る**。
Codex / 素の CLI など Workflow 非対応ツールは、**層1 を逐次実行 + 人手修正で完結**し同じ成果へ収束する（[[cross-agent]]）。
Claude の Workflow 呼び出しと Codex の逐次コマンドは手順 2-5 に併記する。exit 3/4（schema 欠落 / 件数違反）は層3 が自動、
Codex では **人が `src/codegen/serebii/parse.ts` / `normalize.ts` を直して fixture テストを足す**（自動修復と同じ手当てを手で行う）。

## 入力 / 出力

- **入力**: レギュレーション id（例 `champions-m-a`）と解禁条件（基本最終進化・メガ可否・Restricted 除外・期間 等）。
- **出力**（構造の正本は [[data-pipeline]] / [`02-data-model-redesign/OVERVIEW.md`](../../../docs/roadmap/completed/02-data-model-redesign/OVERVIEW.md)）:
  - `docs/roadmap/<plan>/<id>-roster-source.md`（情報源・検証日・矛盾解消・取得 counts / escalated 種・各種族の覚える技
    全件 / 持ち物全件 / 技マスター取得の出典付き記録）。
  - 構造 specs（`{species,move,item,ability,mega}-specs.yaml`）への Serebii 由来データの追記（種族 / `mega-specs` の
    `baseSpecies` / `item-specs` は **append-only**。**per-game 技メタ `move-specs` は技マスター専用経路が後勝ちで上書き
    是正**・[ADR 0037](../../../docs/adr/archive/0037-serebii-move-master-dedicated-path.md)）。
  - per-reg ディレクトリ `data/champions/<reg>/{index,species,items,mega,species-moves}.yaml`（block 記法・`species-moves`
    は種族キーごとの **`moves` 全量**）。構造データ（`dex` / `types` / `baseStats` / `abilities` / `category`）と日本語名 ja の
    取り込みは [`update-catalog`](../update-catalog/SKILL.md) へ委譲。
  - `check:regulation` が参照整合 / schema で 0 終了（覚えない技照合はしない・ADR 0026）・再生成された `src/generated/**` と
    `pnpm verify` 緑。

## 手順（オーケストレーション）

本 skill 本体は**実行調整に徹するオーケストレーター**で、各データ種別の取得詳細・情報源・DOM 仕様は
[`references/serebii-sourcing.md`](./references/serebii-sourcing.md) が SoT。情報種別を **4 つの独立単位**に分け、それぞれを
層1 コマンド + Claude 層2-3 Workflow / Codex 層1 逐次で**呼び分ける**。**メガ**（決定論自動著述・ADR 0033）と技メタの
per-game 所在（ADR 0035）は機械化済みのため**非分割**（過分割を避ける・[[skill-authoring]]）:

| 独立単位 | 取得対象（Serebii） | 層1 コマンド | Claude（層2-3） | Codex / 素の CLI | 転記 |
|---|---|---|---|---|---|
| **roster 確定** | Champions 索引（解禁判断） | — | WebFetch（主経路） | WebFetch | 手動（roster 配列） |
| **覚える技の一覧** | 種族ページ（覚える技の名前一覧） | `scrape:serebii species` | `Workflow(self-heal, roster)` | `fetch`→`scrape` 逐次 + 人手 | `serebii:catalog species` |
| **技マスター（ADR 0037）** | 技専用ページ（技メタ全項目） | `scrape:serebii move-master` | `Workflow(fetch-fanout, {kind:"move"})` | `fetch move`→`scrape move-master` 逐次 | `serebii:catalog move-master` |
| **持ち物** | `items.shtml`（解禁持ち物） | `scrape:serebii items` | 層1（1 ページ・fan-out 不要） | `fetch items`→`scrape items` | `serebii:catalog items` |

### 1. roster を確定する（WebFetch・Serebii Champions 索引 + 件数裏取り）

`<id>` と解禁条件で、**Serebii Champions 索引から解禁種族の slug 配列（roster）・解禁持ち物・メガ membership を確定**する。
ここは「どの種族がこのレギュで解禁か」という**判断**で決定論スクレイパーでは決まらないため、**WebFetch を使う唯一の
主経路**（索引 1 枚で済み軽い）:

- 解禁種族索引・解禁持ち物: `https://www.serebii.net/pokemonchampions/` 配下の索引 / `items.shtml`。
- **件数裏取りは機械的件数比較に縮退**: Game8 / Victory Road 等の補助ソースは roster 総数・持ち物総数など**要約値の件数
  突き合わせ**にのみ使う（技の帰属は層1 exit code が機械担保・詳細は Gotchas）。矛盾は `<id>-roster-source.md` に残す。

### 2. roster を決定論取得する（層1-3・HTML を LLM に載せない）

確定した roster slug 配列を 3 層ハイブリッドで決定論取得する（cross-agent フォールバックは上記の通り）:

- **Claude**: `Workflow({ scriptPath: ".claude/skills/survey-regulation/workflows/self-heal.workflow", args: <roster> })`
  で 層2 fan-out → 層3 自己修復。失敗が少数で済むなら 層2 のみ（[`fetch-fanout.workflow`](./workflows/fetch-fanout.workflow)）でもよい。
- **Codex / 素の CLI**: 各 slug を `fetch-serebii.ts species` → `scrape-serebii.ts species` で逐次実行し exit 3/4 は人手修正。

返り値 `counts`（total / ok / escalated / rounds）と `escalated`（収束しない種）を手順 8 の roster-source doc へ転記する。
**冪等キャッシュ**（`data/raw/serebii/`）により再実行は成功種を skip し、`escalated` 種は手順 9 の**最終 WebFetch fallback**で吸収する。

### 3. 種族を転記する（覚える技の一覧・serebii:catalog species）

**`node scripts/serebii-to-catalog.ts species <slug> <regId>`**（pipe で `scrape:serebii species <slug>` の中間 JSON を渡す）で、
種族ページ由来データ（種族 / **各種族の覚える技の名前一覧** / メガ先 / per-reg 解禁 / 英名 en）を `species-specs` /
`mega-specs` の `baseSpecies` / per-reg `<reg>/{species,mega,species-moves}.yaml` / `languages/moves`（en）へ **append /
既存尊重**で転記する。**技メタ（type/power 等）は書かない**（手順 4 の技マスターが SoT・ADR 0037）。**構造データ（`dex` /
`types` / `baseStats` / `abilities` / `category`）と日本語名 ja も書かない**（手順 6 の `materialize` が埋める）。

### 4. 技マスターを取得する（技メタ・技専用ページ・ADR 0037）

技メタ（type / damageClass / power / accuracy / pp / priority）を技専用ページ（`attackdex-champions`）から専用取得し
`move-specs.yaml` を Champions 準拠値で**上書き是正**する（前作 PP 残存を根絶・[ADR 0037](../../../docs/adr/archive/0037-serebii-move-master-dedicated-path.md)）。
対象 id は手順 3 で得た覚える技の名前一覧の **union（catalog id）**:

- **Claude**: `Workflow({ scriptPath: ".claude/skills/survey-regulation/workflows/fetch-fanout.workflow", args: { roster: <move id 配列>, kind: "move" } })`。
- **Codex / 素の CLI**: 各 id を `fetch-serebii.ts move` → `scrape-serebii.ts move-master` 逐次。
- **転記**: 成功 id を `scrape-serebii.ts move-master <id> | serebii-to-catalog.ts move-master` で `move-specs`（後勝ち
  上書き・冪等）+ `languages/moves` の en（append/既存尊重）へ。exit 3/4 は人手 / WebFetch fallback（手順 9）。

### 5. 持ち物を取得・転記する（items）

`fetch-serebii.ts items` → `scrape-serebii.ts items`（exit code 判定）→
`scrape-serebii.ts items | serebii-to-catalog.ts items <regId>` で `item-specs`（`megaStoneFor` / `megaSpecies` /
**メガストーンの `category` も Serebii 由来**）+ `languages/items`（en）+ per-reg `<reg>/items.yaml` へ転記する
（`items.shtml` 1 ページゆえ fan-out 不要・非解禁は per-reg に入れない・append-only）。**Champions 固有メガストーン
（`starminite` 等）は PokeAPI 非存在ゆえ `category` を Serebii で確定し ja は人間が手入力で補完する**（メガ本体は
PokeAPI に存在し materialize 可・メガはストーンの PokeAPI 有無に関わらず記録する）。詳細は
[`references/serebii-sourcing.md`](./references/serebii-sourcing.md) の「Champions 固有メガストーンは PokeAPI に無い」節。

### 6. specs 構造データ・日本語名を揃える（specs 更新チェックポイント → update-catalog へ委譲）

本 skill は **Champions 解禁データ（Serebii 由来）の取得**が責務で、**PokeAPI 由来の構造データ（種族値 / タイプ / 特性 id /
図鑑番号 / 持ち物 category）と日本語名 ja の取り込みは [`update-catalog`](../update-catalog/SKILL.md) へ委譲する**。**learnset
照合はしない**（PokeAPI は Champions 非対応・ADR 0026）。技の出自は手順 1-2 の Serebii 取得で担保済み。

**specs 更新チェックポイント**（per-reg が参照する id が specs に揃っているかの関門）:

- **`pnpm check:regulation data/champions`** を回す。参照整合エラー（「未登録の種族 / 持ち物 / 技」）が出たら、その id 群は
  **specs 未登録**＝ PokeAPI 構造データ・名前が未取得。
- 不足 id があれば **先に [`update-catalog`](../update-catalog/SKILL.md) を回して specs / languages を揃え**（`fetch:data` →
  `materialize` + 特性 id 集約）、不足 id を列挙して渡してから本 skill の手順 7-8 へ戻る。大量投入で specs の取りこぼし
  （特性追記漏れ等）を防ぐ関門がここ。
- 参照整合が 0 終了（不足なし）なら手順 7 へ進む。

> **なぜ委譲するか**: 構造データ + 名前は **reg / ゲーム非依存**（種族そのものの事実）で取得元・更新頻度が Champions 解禁
> データと異なる。`update-catalog` が PokeAPI 系統を、本 skill が Serebii 系統を担い境界を明快にする（[[data-pipeline]]）。

### 7. per-reg `mega` 確認 + per-reg メタを仕上げる

メガ linking は手順 3（`serebii:catalog species`）が決定論で自動著述するので、ここは確認と残りの仕上げに絞る:

- **メガ linking 確認**: `species-specs.yaml` の `megaEvolvesTo` / `mega-specs.yaml` の `baseSpecies` 逆参照、per-reg
  `<reg>/mega.yaml` の解禁メガ、メガストーンの `megaSpecies` は `serebii:catalog` が自動著述済み（ADR 0033 / 独立
  mega-specs は [ADR 0036](../../../docs/adr/0036-mega-independent-spec-entity.md)）。**escalation diagnostic**（`Mega `
  接頭の無い特殊形 = Primal 等・未知 id）が出た種だけ手動著述する（通常の `Mega <Base>[ X|Y]` は手動不要）。
- **per-reg メタ**: `<reg>/index.yaml` の `name` / `period`（開催中は `period.end` を `null`）と `<reg>/items.yaml`（解禁
  持ち物 全件）を確認・補う。`<reg>/species.yaml` の id 存在 = 解禁（`allow.{...}` ラッパーは使わない）。

### 8. roster-source doc を書き、検証して再生成する（委譲）

- **`docs/roadmap/<plan>/<id>-roster-source.md`** に記録する（再現可能性のため）: 権威ある事実（総数 / メガ数 / 期間 / 形式
  条件）と各出典 URL・**検証日**、ソース間差異と解消、手順 2 / 4 の取得 `counts` / `escalated` 種、各種族の使用可能技 全件・
  解禁持ち物 全件・技マスター取得の出典。未確定部分は明記する。
- **`pnpm check:regulation data/champions`**（authoring 時ゲート・参照整合 / schema を非0終了で検出・ADR 0023。覚えない技
  照合はしない・ADR 0026）→ **`pnpm generate:data`**（specs / languages / per-reg YAML → TS 変換・合成・**raw 非依存**・
  参照切れ / 構造データ欠落 / id 集合不一致は生成段エラー）→ [`verify`](../verify/SKILL.md)（`pnpm verify`）。CLI で解禁判定を
  end-to-end 確認したいときは `node src/cli/index.ts check:party <party.md>`（解禁種 = exit0 / 未解禁混入 = exit1）。**機械
  ゲートは再実装せず委譲**する（[[skill-authoring]]）。

### 9. 最終 fallback: escalated 種を目視で吸収する（WebFetch）

層3 / 逐次実行でも収束しない `escalated` 種（DOM 揺れ・フォルム slug の取得失敗 = exit 2 等）だけを、
`https://www.serebii.net/pokedex-champions/<species>/` を **WebFetch して目視**し specs / per-reg を手で著述する。あわせて
当該ページの最小化 fixture（`__fixtures__/serebii-<slug>.html`）+ 回帰テストを足して層1 パーサを一般化し（層3 と同じ手当て）、
次回から決定論経路に乗せる。WebFetch はこの**最終 fallback と手順 1 の roster 確定に縮小**する。

## Gotchas

- **正しさは層1（決定論スクレイパー）に宿る**: 各種族の技・種族値・タイプの抽出と件数・健全性検証は層1 のテスト済み純関数 +
  exit code が担保する。層2-3（Workflow）は Claude 固有の取得加速・自動修復で、Codex / 素の CLI は層1 逐次 + 人手で同じ成果へ
  収束する（[[cross-agent]] / ADR 0031）。
- **HTML を LLM コンテキストに載せない**: 取得 SubAgent / 逐次実行は `scrape:serebii` の **exit code と stderr の 1 行 JSON
  診断だけ**を見て判定する。100KB 超の HTML 本文を Read / cat しない（トークン最小化）。
- **件数裏取りは機械的件数比較に縮退**: Game8 等補助ソースは roster 総数・持ち物総数の要約値突き合わせに使う（Serebii 第一
  優先は不変）。各種族の技の帰属は層1 の自己検証 exit code が機械担保するため逐一目視しない。
- **curate せず全量**: 各種族 `moves` は手選びの少数サブセットにせず Serebii の全 learnable 技を全量入れる（各種族数十技が
  正常・[`references/serebii-sourcing.md`](./references/serebii-sourcing.md)）。
- **覚えない技の機械照合ゲートは無い → Serebii 第一優先で出自を担保**: PokeAPI は Champions 非対応のため learnset 照合は撤去
  した（ADR 0026）。`check:regulation` は参照整合 / schema のみ。技メタは手順 4 の技マスター専用経路で確定し、構造欠落のみ
  生成段 tsc が弾く。
- **技マスターは「覚える技の一覧」と別単位（ADR 0037）**: 種族ページ（手順 3）は覚える技の名前一覧のみ・技メタは技専用ページ
  （手順 4）から後勝ちで上書き是正。種族ページから技メタを書き戻そうとしない（前作 PP 残存の根絶 + `priority` 取得が目的）。
- **append-only を守る**: 没収された種・技・**非解禁持ち物**（M-A の life-orb / assault-vest / rocky-helmet 等）も specs から
  消さない。解禁/非解禁の現況は per-reg の `<reg>/species.yaml` id 存在 / `<reg>/items.yaml` が表す。
- **メガ linking は決定論で自動著述**: `serebii:catalog` が逆参照を append/既存尊重で書く（ADR 0033 / 0036）。`Mega ` 接頭の
  無い特殊形（Primal 等）・未知 id の escalation だけ手順 7 で手当する。通常メガを手で著述しようとしない。
- **複数フォルム種の slug**: 地域フォルム・バトルフォルム・メガ先は slug が `<name>-<form>`。default slug が意図と違う種・
  Serebii で別 URL になるフォルム（例: rotom 系）は手順 9 の fallback で吸収する。
- **生成物を手編集しない**: `src/generated/**` は触らず specs / languages / per-reg を直して再生成する（[[data-pipeline]]）。
- **機械ゲート / レビュー観点を再実装しない**: 検証は `verify` / `check:regulation`、生成データの妥当性は
  `pokemon-data-reviewer` agent、利用者パーティ点検は `review-party`（[[skill-authoring]]）。
- **redaction**: doc へ外部リンク・引用を書き出す前に [[redaction]] を点検する（Secrets / PII 非混入）。

## 関連

- 情報源の役割・決定論スクレイパー（DOM / 正規化 / exit code）・全量 materialize の詳細:
  [`references/serebii-sourcing.md`](./references/serebii-sourcing.md)。
- Workflow（層2-3・Claude 固有）: [`workflows/fetch-fanout.workflow`](./workflows/fetch-fanout.workflow) /
  [`workflows/self-heal.workflow`](./workflows/self-heal.workflow)。
- データ構造正本: [[data-pipeline]] / [`02-data-model-redesign/OVERVIEW.md`](../../../docs/roadmap/completed/02-data-model-redesign/OVERVIEW.md)。
- 決定の「なぜ」（解禁判定 / 記録 / 検証 / 取得経路）: [ADR 0021](../../../docs/adr/0021-per-regulation-species-and-legality.md) /
  [ADR 0022](../../../docs/adr/0022-per-regulation-species-keyed-moves.md) /
  [ADR 0023](../../../docs/adr/0023-generate-transformer-and-check-regulation.md) /
  [ADR 0037](../../../docs/adr/archive/0037-serebii-move-master-dedicated-path.md)（技マスター専用取得）/
  [ADR 0031](../../../docs/adr/archive/0031-deterministic-serebii-scraper-hybrid-layers.md)（3 層ハイブリッド）。
- specs / languages の SoT 設計: [ADR 0027](../../../docs/adr/archive/0027-structural-data-catalog-sot.md)（構造データ SoT）/
  [ADR 0035](../../../docs/adr/0035-specs-languages-layout-redesign.md)（specs / languages / per-reg の 3 軸直交）/
  [ADR 0033](../../../docs/adr/archive/0033-deterministic-mega-auto-authoring.md)（メガ決定論自動著述）/
  [ADR 0036](../../../docs/adr/0036-mega-independent-spec-entity.md)（メガ独立 spec）/
  [ADR 0034](../../../docs/adr/archive/0034-move-meta-per-game-sot.md)（技メタ per-game SoT）/
  [ADR 0032](../../../docs/adr/archive/0032-japanese-name-source-pokeapi-names.md)（日本語名 ja は PokeAPI names）。
- specs / languages 取得（PokeAPI 構造データ + 名前・委譲先）: [`update-catalog`](../update-catalog/SKILL.md)。
- 検証 / 生成: [`verify`](../verify/SKILL.md) / `pnpm check:regulation` / `pnpm generate:data`。
- 利用者パーティ点検: [`review-party`](../review-party/SKILL.md) / 生成データ妥当性: `pokemon-data-reviewer` agent。
- skill 作成方針・cross-agent: [[skill-authoring]] / [[cross-agent]] / [[redaction]]。
