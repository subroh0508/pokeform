# Serebii 第一優先の調査・全量 materialize 手順（詳細）

`survey-regulation` skill 本体（[SKILL.md](../SKILL.md)）が参照する詳細手順。**チャンピオンズ解禁データの
情報源の役割・関係性（第一優先 / 補助裏取り / 構造データ取得元）の SoT**であり、Serebii を第一優先の正とする
理由・主ソース URL パターン・全 learnable 技の全量 materialize の機構を定める。技の出自は Serebii 第一優先に
一本化し、PokeAPI learnset への照合はしない（PokeAPI は Champions 非対応・ADR 0026）。データ仕様（取得元 / SoT /
転記の対応表）の正本は [[data-pipeline]]。

## 情報源の役割・関係性（SoT）

チャンピオンズの解禁データは複数の情報源から集めて突き合わせる。各情報源の**役割と関係性**をここに 1 か所へ
集約する（`SKILL.md` / [[data-pipeline]] / `data/README.md` の情報源記述は本節へのポインタ）。情報源は次の
**3 系統**で、catalog へは **skill 著述の辺（① + ② → `survey-regulation` → catalog / regulations）** と
**機械転記の辺（③ → `fetch:data` → raw → `materialize` → catalog）** の **2 系統が合流**する:

| 系統 | 情報源 | 役割 | catalog への流入経路 | 担当データ |
|---|---|---|---|---|
| **①** | **Serebii Champions 図鑑 / items.shtml** | **第一優先 = 正** | skill 著述（`survey-regulation`） | 解禁種族 / 各種族の全 learnable 技 / 技メタ / 解禁持ち物 |
| **②** | **Game8 / Victory Road / Bulbapedia 等** | **補助 = 件数裏取り** | skill 著述（① の件数突き合わせ） | ① の総数・帰属を 2 ソース以上で検証（矛盾は出典 doc に記録） |
| **③** | **PokeAPI** | **構造データ取得元** | 機械転記（`fetch:data` → `materialize`） | 種族値 / タイプ / 特性 / 図鑑番号 / 持ち物 category |

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
過去の人手調査（Phase 7）でも Serebii を正として Game8 等で件数検証する運用が安定した。よって本 skill は
**Serebii を第一優先の正**とし、Game8 / Victory Road / Bulbapedia 等は**補助・件数検証**に回す
（メモリ `serebii-first-priority-champions-data`）。単一ソース誤記のリスクは「Serebii を正・他で件数突き合わせ」で
抑える（2 ソース以上で突き合わせる原則は維持）。

## 主ソースの URL パターン

- **Champions 図鑑（種族ごとの使用可能技・種族値・タイプ・特性）**:
  `https://www.serebii.net/pokedex-champions/<species>/`
  - `<species>` は英名小文字（例: `garchomp` / `charizard` / `gengar`）。地域フォルム・メガは Serebii の表記に従う。
  - このページの **Standard / TM / Egg / Tutor などの技表を全て合算したものが「使用可能技 全件」**。Serebii の
    Champions ページが Champions の使用可能技の正で、PokeAPI learnset への照合はしない（ADR 0026）。
    技メタ（type / power / accuracy / pp / priority / damageClass）もこのページ等 Serebii で確定し catalog へ記す。
- **解禁持ち物一覧**:
  `https://www.serebii.net/pokemonchampions/items.shtml`
  - 一般持ち物・きのみ・メガストーンの解禁一覧。**ここに無い持ち物は非解禁**（例: life-orb / assault-vest /
    rocky-helmet / choice-band / choice-specs は M-A 非解禁）。catalog からは append-only で消さないが、per-reg
    `items` には入れない。
- **補助（件数検証）**: Game8 / Victory Road 等。Serebii の総数・帰属を裏取りし、差異は doc に残す。

## 全 learnable 技を全量 materialize する（curate しない）

各種族の `moves` は **手選びの少数サブセットにせず、Serebii Champions ページの全 learnable 技を全量**投入する。
理由は、競技 movepool は型・相手依存で変わり、少数サブセットだと利用者（個体 author）の選択肢を塞ぐため。
Phase 7 で確立したこの方針を恒久化する。各種族数十技（M-A 規模で 50〜70 技）になるのが正常で、共有プールの
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

## 技メタ（type / power 等）は catalog/moves.yaml が SoT

技の type / damageClass / power / accuracy / pp / priority も **PokeAPI raw から導出しない**（ADR 0026）。
catalog `moves.yaml` の各エントリへ Serebii 等で確定した技メタを hand-author する（名前と同じ catalog SoT・
Phase 10 / ADR 0025 の延長）。技メタの構造欠落は `generate.ts` の `satisfies MoveBase` が生成段の tsc で弾く。
数値の正しさはゲートで担保できないため Serebii 照合で確認する。`power` / `accuracy` は変化技なら `null`。

## 解禁持ち物 全件の取得

`items.shtml` から解禁持ち物を**全件**取得し、`catalog/items.yaml`（append-only・各エントリは
`id: { ja, en }`・メガストーンは各エントリに `megaStoneFor`（メガ先 base SpeciesId）を付与・Phase 10）と
per-reg `items` 予約キーへ反映する:

- 一般持ち物・きのみ・該当メガストーンを漏れなく列挙する（M-A は一般30 + きのみ27 + メガストーン）。
- **PokeAPI item slug の正確な綴り**を `fetch:data` 前に確認する（例: `oran-berry` / `charizardite-x` /
  `garchompite`）。Serebii 表記と PokeAPI slug がずれる持ち物に注意。
- 非解禁持ち物（`items.shtml` に無いもの）は per-reg `items` に入れない。catalog からは append-only で消さない。

## レギュ更新時の routine（M-B 以降）

新レギュレーション公開・既存レギュ更新時は同じ順序で再実行する:

1. Serebii Champions 図鑑 + items.shtml を主ソースに解禁種族 / 各種族全技 / 持ち物を取得（Game8 等で件数検証）。
2. `<id>-roster-source.md` に出典付きで記録。
3. catalog へ append-only 追記（種族 / 技 / 持ち物 / 特性・特性漏れ = 生成エラーに注意）。
4. per-reg YAML を新スキーマ（種族キー = 解禁・per-species `moves` 全量・`items` 予約キー・block 記法）で記述。
5. `fetch:data`（PokeAPI から構造データ取得・learnset 照合はしない）→ `materialize`（raw → catalog へ構造データ
   `dex` / `types` / `stats` / `abilities` / `category` を転記・append/既存尊重・ADR 0027）→ `check:regulation`
   0 終了（参照整合 / schema）→ `generate:data`（raw 非依存・catalog のみ変換）→ `verify` 緑。**fetch:data →
   materialize の順序保証は本 skill の責務**（スクリプトは raw 不在で fail-fast するだけ・ADR 0027）。
