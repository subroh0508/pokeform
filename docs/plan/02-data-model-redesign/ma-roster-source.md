# レギュレーション M-A 解禁種族 — 情報源と全リスト

`02-data-model-redesign` Phase 3 の成果物。レギュレーション M-A（ポケモンチャンピオンズ）の解禁種族を
**信頼できる複数情報源で突き合わせ**て記録する。Phase 4（全量投入）と将来のレギュレーション更新は本 doc と
`survey-regulation` skill を起点にする。

## 権威ある事実（複数ソース一致）

| 項目 | 値 | 出典 |
|---|---|---|
| 解禁種族数 | **186 種** | Game8 / 検索コンセンサス |
| メガシンカ可能 | **59 種** | Game8 |
| 開催期間 | **2026-04-08 02:00 UTC 〜 2026-06-17 05:59 UTC** | Game8 / Serebii |
| 形式 | 基本最終進化・メガ可 / テラス・ダイマ不可・Restricted なし | Serebii / Bulbapedia |

検証日: 2026-06-08。

## 情報源（突き合わせ）

- **Game8** — "Regulation M-A: Complete Roster and Schedule"（https://game8.co/games/Pokemon-Champions/archives/601460）。
  総数 186 / メガ 59 / 期間を明示。**総数の権威ソース**。
- **Serebii** — "Ranked Battle Regulation M-A"（https://www.serebii.net/pokemonchampions/rankedbattle/regulationm-a.shtml）。
  解禁種族の全リストとメガ可能種を掲載。**全リストの主ソース**。
- **Bulbapedia** — "Regulation Set M-A" / "List of Pokémon in Pokémon Champions"
  （https://bulbapedia.bulbagarden.net/wiki/Regulation_Set_M-A）。形式・条件の確認。
- **MetaVGC / Victory Road** — legal Pokémon/items/moves の一覧（補助）。

### ソース間の差異と解消

- Serebii ページの自動抽出で一度「391 種」という総数が出たが、これは抽出時の**誤カウント**（メガ別記載・
  関連リンクの混入）と判断する。Game8 と検索コンセンサスの **186 種**を正とする。
- Game8 のサンプル種（Venusaur / Charizard / Dragapult / Quaquaval / Skeledirge / Meowscarada / Corviknight /
  Garchomp / Hydreigon 等）は**すべて Serebii の全リストに含まれる**（membership 一致）。2 ソースは解禁種の
  帰属で矛盾しない。
- 既存データ（`data/champions/regulations/champions-m-a.yaml`）の未解禁デモ種 **salamence / metagross /
  mewtwo は Serebii の M-A リストに非在**で、現行の「未解禁」設定と整合する。

## M-A 解禁種族 全リスト（Serebii 由来・Game8 で membership 検証）

> 注: 完全な 186 種の確定列挙（特に複数フォルム・メガ先 59 種の網羅）は **Phase 4** で `survey-regulation`
> skill により多ソース再突き合わせして確定する。本リストは Serebii 抽出を主とし Game8 で帰属検証した作業用一覧。

Venusaur, Charizard, Blastoise, Beedrill, Pidgeot, Arbok, Pikachu, Raichu, Clefable, Ninetales, Arcanine,
Alakazam, Machamp, Victreebel, Slowbro, Gengar, Kangaskhan, Starmie, Pinsir, Tauros, Gyarados, Ditto,
Vaporeon, Jolteon, Flareon, Aerodactyl, Snorlax, Dragonite, Meganium, Typhlosion, Feraligatr, Ariados,
Ampharos, Azumarill, Politoed, Espeon, Umbreon, Slowking, Forretress, Steelix, Scizor, Heracross, Skarmory,
Houndoom, Tyranitar, Pelipper, Gardevoir, Sableye, Aggron, Medicham, Manectric, Sharpedo, Camerupt, Torkoal,
Altaria, Milotic, Castform, Banette, Chimecho, Absol, Glalie, Torterra, Infernape, Empoleon, Luxray,
Roserade, Rampardos, Bastiodon, Lopunny, Spiritomb, Garchomp, Lucario, Hippowdon, Toxicroak, Abomasnow,
Weavile, Rhyperior, Leafeon, Glaceon, Gliscor, Mamoswine, Gallade, Froslass, Rotom, Serperior, Emboar,
Samurott, Patrat, Liepard, Simisage, Simisear, Simipour, Excadrill, Audino, Conkeldurr, Whimsicott,
Krookodile, Cofagrigus, Garbodor, Zoroark, Reuniclus, Vanilluxe, Emolga, Chandelure, Beartic, Stunfisk,
Golurk, Hydreigon, Volcarona, Chesnaught, Delphox, Greninja, Diggersby, Talonflame, Vivillon, Floette,
Florges, Pangoro, Furfrou, Meowstic, Aegislash, Aromatisse, Slurpuff, Clawitzer, Heliolisk, Tyrantrum,
Aurorus, Sylveon, Hawlucha, Dedenne, Goodra, Klefki, Trevenant, Gourgeist, Avalugg, Noivern, Decidueye,
Incineroar, Primarina, Toucannon, Crabominable, Lycanroc, Toxapex, Mudsdale, Araquanid, Salazzle, Tsareena,
Oranguru, Passimian, Mimikyu, Drampa, Kommo-o, Corviknight, Flapple, Appletun, Sandaconda, Polteageist,
Hatterene, Mr. Rime, Runerigus, Alcremie, Morpeko, Dragapult, Wyrdeer, Kleavor, Basculegion, Sneasler,
Meowscarada, Skeledirge, Quaquaval, Maushold, Garganacl, Armarouge, Ceruledge, Bellibolt, Scovillain,
Espathra, Tinkaton, Palafin, Orthworm, Glimmora, Farigiraf, Kingambit, Sinistcha, Archaludon, Hydrapple

## 無作為 20 匹サンプル（Phase 3 の構造検証用）

新データ構造（catalog 分離 + per-reg YAML + per-reg 型 + A案判定）が想定通り動くことを 20 匹で end-to-end
検証する。**再現可能性を優先**した決定論的選定:

### 選定手順（再現可能）

1. 上記全リストから、**単一フォルムの最終進化**で **PokeAPI default slug が名前そのまま**の種に限定する
   （複数フォルム・地域フォルム・メガ先は Phase 4 へ送り、20 匹サンプルを clean に保つ）。
2. 既に catalog 在籍の種（garchomp / dragonite / charizard / dragapult / hydreigon / rotom-wash 等）は除外し、
   **新規追加で構造を実際に動かす**。
3. 候補を**英字 slug の昇順**に並べ、ジェネレーションと頭文字が偏らないよう全体から 20 を抜き出す。

### 選定結果（20 匹・slug）

```
aggron, alakazam, arcanine, blastoise, chandelure, corviknight, decidueye, excadrill,
garganacl, gengar, greninja, heracross, krookodile, lucario, meowscarada, milotic,
quaquaval, skeledirge, talonflame, tyranitar
```

いずれも上記全リスト（Serebii）に在籍し、過半は Game8 サンプルにも在籍（帰属二重確認）。全 20 種は
PokeAPI default slug が単一フォルム最終進化で、`data/champions/catalog/species.yaml` と
`data/champions/regulations/champions-m-a.yaml` の `allow.species` に投入する。

### サンプルのスコープ外（Phase 4 で投入）

- **メガ先**（59 種）: 本 20 匹中 aggron / alakazam / blastoise / gengar / heracross / lucario / tyranitar 等が
  メガ可能だが、メガ path は既存 `charizard-mega-x` で実証済みのため、20 匹サンプルでは base 種族のみ投入。
- **技の網羅**: species.moves は既存 catalog 技との積集合（sparse）で可。M-A 解禁技の全量は Phase 4。
- **残り ~166 種・複数フォルム種**: Phase 4 で `survey-regulation` skill により全量投入。

## Phase 7 — 現ロスター持ち物 / 技 正確化（2026-06-10 検証）

Phase 7（`phase-07-ma-roster-accuracy.md`）で、現ロスター26種の **持ち物プール**と各種族 **moves** を、
暫定でっち上げ（[[champions-regulation-data-placeholder]]）から M-A 実情へ正確化した。検証日 2026-06-10。

### 持ち物の解禁可否（多ソース突き合わせ）

M-A の持ち物プールは VGC 既存フォーマットより**大幅に絞られている**ことがコミュニティの一致した認識
（"stripped-down item pool"）。現 `items` の混入を次のとおり判定した:

| item | M-A 解禁 | 採否 | 根拠 |
|---|---|---|---|
| `charizardite-x`（メガストーン） | ✅ 解禁 | 維持 | メガ進化が M-A の主ギミック（テラス代替）。複数ソース一致。 |
| `leftovers` | ✅ 解禁 | 維持 | pokemondb pokebase / pokemon-zone の legal item 一覧に在籍。 |
| `choice-scarf` | ✅ 解禁 | 維持 | 同上。なお choice-band / choice-specs は**非解禁**（scarf のみ）。 |
| `life-orb` | ❌ 非解禁 | **除去** | pokemondb pokebase / games.gg / pokemon-zone / 検索コンセンサスで未在籍。 |
| `assault-vest` | ❌ 非解禁 | **除去** | 同上（M-A プールに無し）。 |
| `rocky-helmet` | ❌ 非解禁 | **除去** | 同上（M-A プールに無し）。 |

> **ソース間の差異と解消**: 初回の WebSearch 要約は life-orb を "regulation item" として挙げたが、これは
> 小型モデルの誤抽出と判断する。一次に近い複数ソース（pokemondb pokebase の解禁一覧 / games.gg の
> "Item List: What's Missing" 記事 / pokemon-zone）が life-orb / assault-vest / rocky-helmet の**非在籍**で
> 一致するため、これを正とした。M-A の legal item 総数は 117（MetaVGC / RotomPicks。berry・タイプ強化等を含む）と
> されるが、本 phase は現ロスター正確化が責務のため**未解禁の除去**に絞り、全117プールの反映は Phase 8 へ送る。
> append-only 方針により catalog/items.yaml からは除去せず、per-reg `items` プールからのみ外す。

出典:
- pokemondb pokebase「What are all the items allowed in champions?」 https://pokemondb.net/pokebase/439258/
- GAMES.GG「Pokémon Champions Item List: What's Missing and Why It Matters」 https://games.gg/news/pokemon-champions-items-list-meta/
- Pokémon Zone「Champions Items」 https://www.pokemon-zone.com/champions/items/
- MetaVGC「Champions format legal Pokemon/items/moves」 https://metavgc.com/guides/pokemon-champions-format-legal-pokemon-items-moves（legal moves **467** / items **117** / Pokémon **186**）
  - 注: legal 総数 467/117 は現状 MetaVGC 単一ソース由来（186 は Game8 と一致・Phase 3 節）。全量投入の Phase 8 では RotomPicks / Victory Road 等で再突き合わせして確定する。

### 各種族 moves の正確化方針（learnset ∩ M-A legal）

- **learnset の正本 = PokeAPI**（`pnpm fetch:data` で取得した `data/raw/pokemon/<slug>.json` の `moves[]`）。
  全26種について curate した競技用 movepool を**プログラムで learnset 照合**し、覚えない技をゼロにした
  （`check:regulation` の learnable 検証で二重担保）。curate 段で 2 件の覚えない技（corviknight:snarl /
  meowscarada:sucker-punch）を検出・差し替えた。
- **M-A legal（467技）** との交差: M-A は Restricted 種・テラス・ダイマを除外する一方、個別技の ban は限定的で、
  各種族の現行世代 learnset の競技採用技はほぼ legal。本 phase は "全 learnable 技の全量" ではなく
  **実情準拠の競技 movepool（各種族10+・13〜16技）** へ正確化し（暫定の共有プール ~22技を解消）、
  full 全量化（learnset ∩ 467 の materialize）は Phase 8 に残す。
- **テラス不可**のため `tera-blast` は競技無効として除外。Hidden Power 等の旧世代撤去技も不採用。
- メガ運用は現状維持（`charizard` の `charizard-mega-x` のみ）。他メガ運用種（aggron / lucario 等）の
  メガ先・メガストーン全量は Phase 8（種族追加を伴うため本 phase スコープ外）。

## Phase 9 — 3 種小データセット 全量 movepool 投入（2026-06-10 検証）

Phase 9（`phase-09-smoke-three-species.md`）で、`garchomp` / `charizard` / `gengar` の **全 Serebii movepool** と
M-A 解禁持ち物プール全件を投入し、データ更新パイプラインが本格スケール（各種族57〜75技・持ち物プール62件）で
通ることを検証した。Phase 8 で定型化した `survey-regulation` skill の手順（Serebii 第一優先・全量 materialize・
投入前 learnset 照合）を最初に適用した実投入。

### 情報源（Serebii 第一優先）

- Serebii Champions 図鑑（各種族の使用可能技 全件・**主ソース**・検証日 2026-06-10）:
  - https://www.serebii.net/pokedex-champions/garchomp/
  - https://www.serebii.net/pokedex-champions/charizard/
  - https://www.serebii.net/pokedex-champions/gengar/
- Serebii アイテムページ（解禁持ち物 全件）: https://www.serebii.net/pokemonchampions/items.shtml
- learnset 照合の正本 = PokeAPI（`data/raw/pokemon/<slug>.json` の `moves[]`・全世代 union）。

### 各種族 全 movepool（Serebii 由来・投入後 moves 数）

- `garchomp`: 57 技（Serebii 58 技 − 投入前 learnset 照合で除外 1）。
- `charizard`: 72 技（メガ X/Y 同 movepool）。
- `gengar`: 75 技（Serebii 76 技 − 除外 1）。

### Serebii ∩ PokeAPI learnset 差異の解消（投入前 learnset 照合で検出）

`check:regulation`（PokeAPI learnset 照合）で **覚えない技 2 件**を検出し、Serebii ∩ PokeAPI の差異として
**除去**した（過去世代 / 抽出アーティファクトと判断・PokeAPI 全世代 union に不在）:

- `garchomp` の `thrash` — PokeAPI learnset に不在（現行 Garchomp は習得不可）。除去。
- `gengar` の `clear-smog` — PokeAPI learnset に不在（Clear Smog は Koffing 系等の技・Gengar 習得不可）。除去。

> 注: `check:regulation` は `overrides.yaml` を適用せず raw PokeAPI learnset を正とするため、Serebii にあり
> PokeAPI に無い技は override では通せず**除去で解消**する（learnset 照合ゲートが Serebii 抽出の誤りを捕捉した好例）。

### M-A 解禁持ち物プール（per-reg `items`・全件）

一般持ち物（Serebii items.shtml）+ きのみ + 3 種のメガストーン（`charizardite-x/y` / `garchompite` /
`gengarite`）= **62 件**を `items` 予約キーへ反映。非解禁（`life-orb` / `assault-vest` / `rocky-helmet` /
`choice-band` / `choice-specs`）は per-reg に入れず、catalog からは append-only で残置。

### メガ

`charizard` → `charizard-mega-x` / `charizard-mega-y`、`garchomp` → `garchomp-mega`、`gengar` → `gengar-mega`
を `catalog/species.yaml`（`megaLinks` 配列）/ per-reg `mega[]` / `items.yaml`（`megaStoneFor`）で整合。

> 全186種・各種族の全 legal 技 / メガストーン全量（約60）の全量投入は Phase 10（M-A 全データ投入）に残す（本 phase スコープ外）。
