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
