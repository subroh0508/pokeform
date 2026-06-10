# Serebii 第一優先の調査・全量 materialize 手順（詳細）

`survey-regulation` skill 本体（[SKILL.md](../SKILL.md)）が参照する詳細手順。Serebii を第一優先の正とする
理由・主ソース URL パターン・全 learnable 技の全量 materialize・PokeAPI learnset への投入前プログラム照合の
機構を定める。方針 SoT はメモリ `serebii-first-priority-champions-data`、データ仕様 SoT は [[data-pipeline]]。

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
  - このページの **Standard / TM / Egg / Tutor などの技表を全て合算したものが「使用可能技 全件」**。世代限定で
    覚えない技を後段の learnset 照合で落とす（下記）。
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

## PokeAPI learnset ∩ Serebii の差異の扱い

Serebii 全量を**起点（上限）**にし、投入前に PokeAPI learnset へ照合して**実際に覚える技だけ**へ絞る:

- **両方にある技** → 採用。
- **Serebii にあり PokeAPI learnset に無い技** → version_group 差異・過去世代限定・PokeAPI 側の欠落を疑う。
  - **`check:regulation` は raw PokeAPI learnset を正とし `overrides.yaml` を適用しない**（[[data-pipeline]]）。
    よって learnset に無い技は **per-reg YAML から除去で解消する**のが原則（override は generate 段の補正で
    authoring ゲートには効かないため、override では `check:regulation` を通せない）。判断根拠を出典 doc に残す。
  - 現行作で確実に覚えるのに PokeAPI が欠落している稀なケースは、`overrides.yaml`（generate 段補正）に加えるだけでは
    `check:regulation` が落ちるため、**catalog/learnset 取得方法の見直し**が必要（個別 override での回避はしない）。
- **PokeAPI learnset にあり Serebii に無い技** → Serebii を正とし、解禁外なら入れない（Serebii の網羅性を優先）。

差異と採否は必ず `<id>-roster-source.md` に記録する（再現可能性・[[data-pipeline]]）。

## 投入前 learnset プログラム照合（`check:regulation` 前段）

per-reg YAML へ全量を書いた後、`check:regulation` を通す**前**に、`data/raw` の PokeAPI learnset へ
**プログラム照合**して覚えない技を機械的に洗い出す。これは検出の本体ではなく（本体は `check:regulation` =
ADR 0023 に委譲）、**全量 materialize で混入しやすい覚えない技を投入前に一覧化して潰す所作**。

手順:

1. `pnpm fetch:data` で対象種族の `data/raw/pokemon/<slug>.json`（`moves[].move.name` = learnset）を取得する
   （`data/raw` は gitignore・worktree 非共有のため未取得だと `check:regulation` が参照整合のみに degrade する）。
2. per-reg YAML の各種族 `moves` を、その種族の **raw PokeAPI learnset** と突き合わせ、**learnset に無い技を列挙**
   する（`check:regulation` は overrides 非適用・raw learnset 正）。`node src/cli/index.ts check:regulation <file>`
   （`fetch:data` 後は learnset full 検証）で覚えない技が非0終了として出るので、それを一覧化の代わりに使ってよい。
3. 列挙された覚えない技を、上記「差異の扱い」に従って **per-reg YAML から除去**で解消する（override では
   `check:regulation` を通せない）。
4. 解消後に `check:regulation` が **0 終了**することを確認してから `generate:data` へ進む。

**機械ゲートを再実装しない**: 照合の検出本体は `check:regulation`（覚えない技 ⊄ learnset・参照整合・schema を
非0終了で検出）に委譲する。本手順は「投入前に潰す」運用順序の明示であり、検証ロジックを skill に書かない
（[[skill-authoring]]）。

## 解禁持ち物 全件の取得

`items.shtml` から解禁持ち物を**全件**取得し、`catalog/items.yaml`（append-only・メガストーンは `itemMeta` の
`megaStone` 付与）と per-reg `items` 予約キーへ反映する:

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
5. `fetch:data` → 投入前 learnset 照合 → `check:regulation` 0 終了 → `generate:data` → `verify` 緑。
