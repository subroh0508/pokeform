# data/ — データディレクトリ索引

`data/` 配下に何が置かれ、各ファイル / ディレクトリが**何を表すか・取得元・SoT・どの skill / コマンドで取得・更新するか**の入口（索引）。

これは**ポインタ式の索引**であり、スキーマ定義・「なぜそうか」の詳細は持たない。実体（SoT）は
[`.claude/rules/data-pipeline.md`](../.claude/rules/data-pipeline.md) ほかの rule・[`architecture.md`](../docs/plan/01-mvp/architecture.md)・
[`docs/adr/`](../docs/adr/) にあり、本 README はそこへ誘導する。詳細はリンク先を参照（このファイルには重複させない）。

## データの流れ

3 系統の情報源（① Serebii 第一優先 / ② 補助裏取り / ③ PokeAPI 構造データ）が、**skill 著述の辺**（① + ② →
`survey-regulation`）と**機械転記の辺**（③ → `fetch:data` → raw → `materialize`）の **2 系統で specs / languages (SoT) に合流**し、
`generate:data` が specs / languages / per-reg を変換・合成して `generated/` を出力する（3 軸直交・ADR 0035 / 0036）。

```mermaid
flowchart LR
    SB["① Serebii Champions 図鑑 / items.shtml<br/>第一優先=正（解禁種族 / 全技 / 技メタ / 解禁持ち物）"]
    AUX["② Game8 / Victory Road / Bulbapedia<br/>補助=件数裏取り"]
    API["③ PokeAPI<br/>構造データ取得元（種族値 / タイプ / 特性 / dex / category）"]

    SB -->|skill 著述| SR["survey-regulation skill"]
    AUX -.->|件数突き合わせ| SR
    API -->|機械転記| RAW["raw/<br/>(.gitignore・取得キャッシュ)"]
    RAW -->|materialize| SPECS
    SR -->|skill 著述の辺| SPECS["champions/*-specs + &lt;reg&gt;/ (構造 SoT)<br/>+ languages/ (名前 SoT)"]
    SPECS -->|generate:data| GEN["generated/ (コミット)"]
```

- `raw/` は `materialize` の**転記元キャッシュ**（`.gitignore`・`generate` は読まない）。
- 構造データ（種族値 / タイプ / 特性 / 図鑑番号 / 持ち物 category）の **SoT は specs YAML**、名前（ja/en）の **SoT は languages YAML**。技 / 名前 / 解禁は PokeAPI 非依存で skill-authored（技威力 / legality = **① Serebii 第一優先**）。
- **情報源の役割・関係性（① 第一優先 / ② 補助裏取り / ③ 構造データ取得元・突き合わせ原則）の SoT** は [`survey-regulation` の `serebii-sourcing.md`](../.claude/skills/survey-regulation/references/serebii-sourcing.md) の「情報源の役割・関係性」節。本 README はそこへ誘導する索引（重複させない）。
- **責務分離**: `raw/` の存在担保は `survey-regulation` **skill の責務**（手順で `fetch:data` → `materialize` の順を保証）。`materialize` / `generate` などスクリプトは前提が揃っている前提で動き、欠けたら **fail-fast**（責務の二重化を避ける）。
- 詳細は [`data-pipeline.md`](../.claude/rules/data-pipeline.md) / [ADR 0012](../docs/adr/0012-vendor-pokeapi-data.md)（vendor 方式）/ [ADR 0034](../docs/adr/archive/0034-move-meta-per-game-sot.md)（Serebii 第一優先・技メタ per-game SoT・ADR 0026 改訂）/ [ADR 0027](../docs/adr/0027-structural-data-catalog-sot.md)（構造 SoT・generate raw 非依存）/ [ADR 0035](../docs/adr/0035-specs-languages-layout-redesign.md)（specs / languages / per-reg の 3 軸直交・名前 SoT を languages へ）/ [ADR 0036](../docs/adr/0036-mega-independent-spec-entity.md)（メガ独立 spec）。

## 索引

凡例: **取得元** = 値の一次情報源 / **SoT** = `generate` の入力（正本）/ **責務** = 取得・更新に使う skill・コマンド。
生成物（`generated/**`）は**手書き編集しない**——specs / languages / per-reg（skill 著述）を skill/AI 経由で直して再生成する。

### `raw/` — PokeAPI 取得キャッシュ（`.gitignore`）

| パス | 何を表すか | 取得元 | SoT | 取得・更新（責務） | スキーマ詳細 |
|---|---|---|---|---|---|
| `raw/{pokemon,pokemon-species,move,item}/*.json` | PokeAPI レスポンスの取得キャッシュ。`materialize` の構造データ転記元。`generate` は読まない | PokeAPI | —（キャッシュ・非コミット） | `fetch:data`（生成）。存在担保は [`survey-regulation`](../.claude/skills/survey-regulation/SKILL.md) skill の責務 | [data-pipeline.md（vendor）](../.claude/rules/data-pipeline.md) |

### `champions/` — 構造 specs + per-reg・skill 著述（人間直編集 NG・コミット）

| パス | 何を表すか | 取得元 | SoT | 取得・更新（責務） | スキーマ詳細 |
|---|---|---|---|---|---|
| `champions/rules.yaml` | 能力ポイント（合計66 / 各≤32）・実数値計算式の定数 | skill-authored | このファイル | AI 直接指示（対応 skill 無し・ADR 0030） | [game-spec.md](../.claude/rules/game-spec.md) |
| `champions/species-specs.yaml` | 種族 `id` + 構造データ（`dex` / `types` / `baseStats`(hp/attack/defense/spAttack/spDefense/speed) / `abilities` + `megaEvolvesTo?`・**name 無し**） | 構造=PokeAPI | specs | `fetch:data`→`materialize`（[`update-catalog`](../.claude/skills/update-catalog/SKILL.md)） | [data-pipeline.md](../.claude/rules/data-pipeline.md) / [type-conventions.md](../.claude/rules/type-conventions.md) |
| `champions/mega-specs.yaml` | メガ `id` + `dex` / `types` / `baseStats` / `ability` + **`baseSpecies` 逆参照**（独立 spec・name 無し） | 構造=PokeAPI / baseSpecies=Serebii | specs | `materialize` + [`survey-regulation`](../.claude/skills/survey-regulation/SKILL.md) | [data-pipeline.md](../.claude/rules/data-pipeline.md) / [ADR 0036](../docs/adr/0036-mega-independent-spec-entity.md) |
| `champions/move-specs.yaml` | per-game 技メタ `id → { type / damageClass / power / accuracy / pp / priority }`（m-a/m-b 横断・Champions 固有値・name 無し） | skill 著述（Serebii 第一優先） | specs（per-game） | [`survey-regulation`](../.claude/skills/survey-regulation/SKILL.md) | [data-pipeline.md](../.claude/rules/data-pipeline.md) / [ADR 0034](../docs/adr/archive/0034-move-meta-per-game-sot.md) |
| `champions/item-specs.yaml` | 持ち物 `id` + `category` + `megaStoneFor?`（name 無し） | category=PokeAPI | specs | category: `materialize` / megaStoneFor: [`survey-regulation`](../.claude/skills/survey-regulation/SKILL.md) | [data-pipeline.md](../.claude/rules/data-pipeline.md) |
| `champions/ability-specs.yaml` | 特性 `id`（id のみ・name 無し） | skill 著述 | specs | [`update-catalog`](../.claude/skills/update-catalog/SKILL.md) | [data-pipeline.md](../.claude/rules/data-pipeline.md) |
| `champions/type-specs.yaml` | 18 タイプ `id` + 相性倍率 `damageTo`（非 1.0 のみ・name 無し） | skill 著述 | specs | skill/AI 経由 | [data-pipeline.md](../.claude/rules/data-pipeline.md) / [ADR 0025](../docs/adr/archive/0025-catalog-name-and-type-chart-sot.md) |
| `champions/<reg>/{index,species,items,mega,species-moves}.yaml` | 1 レギュ = 1 ディレクトリ（`m-a/` 等）。`index`（`name`/`period`）・`species`（解禁種族 id 配列）・`items`（解禁持ち物 id 配列）・`species-moves`（種族ごと `moves` 全量）・`mega`（種族ごと解禁メガ id 配列）・block 記法 | skill 著述（Serebii 第一優先） | per-reg（解禁の正本・per-reg 一本化） | [`survey-regulation`](../.claude/skills/survey-regulation/SKILL.md) で投入 → `check:regulation` で参照整合・schema 検証 | [data-pipeline.md](../.claude/rules/data-pipeline.md) / [ADR 0021](../docs/adr/0021-per-regulation-species-and-legality.md) / [ADR 0022](../docs/adr/0022-per-regulation-species-keyed-moves.md) |

### `languages/` — 名前 SoT・ゲーム非依存・skill 著述（人間直編集 NG・コミット）

| パス | 何を表すか | 取得元 | SoT | 取得・更新（責務） | スキーマ詳細 |
|---|---|---|---|---|---|
| `languages/{species,mega,items,moves,abilities,types}.yaml` | 各エンティティの名前 `id → { ja, en }`（ゲーム非依存・名前の SoT・ADR 0035） | ja=PokeAPI `names` / en=Serebii 表示名等 | languages | ja: `materialize`（[`update-catalog`](../.claude/skills/update-catalog/SKILL.md)）/ en: [`survey-regulation`](../.claude/skills/survey-regulation/SKILL.md) | [data-pipeline.md](../.claude/rules/data-pipeline.md) / [ADR 0035](../docs/adr/0035-specs-languages-layout-redesign.md) |

### `generated/` — 生成物（コミット・手書き編集禁止）

`generate:data` が specs / languages / per-reg YAML を変換・合成して出力（**raw 非依存・決定論的**・[ADR 0027](../docs/adr/0027-structural-data-catalog-sot.md) / [ADR 0035](../docs/adr/0035-specs-languages-layout-redesign.md)）。値から型を派生（`type XxxDex = typeof xxxDex` / `XxxId = keyof XxxDex`）。

| パス | 何を表すか | 取得元 | SoT | 取得・更新（責務） | スキーマ詳細 |
|---|---|---|---|---|---|
| `generated/champions/species-specs.ts` | `speciesSpecsDex`（構造・dex / types / baseStats / abilities / megaEvolvesTo?・name 無し） | specs（派生） | `species-specs.yaml` | `generate:data` で再生成 | [data-pipeline.md](../.claude/rules/data-pipeline.md) / [type-conventions.md](../.claude/rules/type-conventions.md) |
| `generated/champions/mega-specs.ts` | `megaSpecsDex`（メガ構造・dex / types / baseStats / ability / baseSpecies・name 無し） | specs（派生） | `mega-specs.yaml` | `generate:data` で再生成 | [data-pipeline.md](../.claude/rules/data-pipeline.md) / [ADR 0036](../docs/adr/0036-mega-independent-spec-entity.md) |
| `generated/champions/type-specs.ts` | `typeSpecsDex`（タイプ相性・`damageTo`・1.0 補完・name 無し） | specs（派生） | `type-specs.yaml` | `generate:data` で再生成 | [data-pipeline.md](../.claude/rules/data-pipeline.md) |
| `generated/champions/move-specs.ts` | `moveSpecsDex`（per-game 技メタ・type / damageClass / power / accuracy / pp / priority・name 無し） | specs（派生） | `move-specs.yaml` | `generate:data` で再生成 | [data-pipeline.md](../.claude/rules/data-pipeline.md) / [ADR 0034](../docs/adr/archive/0034-move-meta-per-game-sot.md) |
| `generated/champions/ability-specs.ts` | `abilitySpecsDex`（**id のみ**・name 無し） | specs（派生） | `ability-specs.yaml` | `generate:data` で再生成 | [data-pipeline.md](../.claude/rules/data-pipeline.md) |
| `generated/champions/item-specs.ts` | `itemSpecsDex`（`category?` + `megaStoneFor?`・name 無し） | specs（派生） | `item-specs.yaml` | `generate:data` で再生成 | [data-pipeline.md](../.claude/rules/data-pipeline.md) |
| `generated/languages/{species,mega,items,moves,abilities,types}.ts` | 名前 dex（`speciesNames` 等・`id → { id, name: { ja, en } }`・`NameEntry`）。`index.ts` が forward マップ再 export + `speciesNamesAll`。**逆引きは consumer が実行時導出** | languages（派生） | `languages/*.yaml` | `generate:data` で再生成 | [type-conventions.md](../.claude/rules/type-conventions.md) / [cli-and-io.md](../.claude/rules/cli-and-io.md) / [ADR 0035](../docs/adr/0035-specs-languages-layout-redesign.md) |
| `generated/champions/<reg>/` | 1 レギュ = 1 ディレクトリ。`index.ts` が specs + per-reg を合成した per-reg 種族 dex `speciesDex`（per-species `moves`＝legality の型正本）+ レギュメタ。`champions/index.ts` が `regulationDex` に集約 | specs + per-reg（派生・合成） | `champions/<reg>/*.yaml` | `generate:data` で再生成 | [data-pipeline.md](../.claude/rules/data-pipeline.md) / [ADR 0021](../docs/adr/0021-per-regulation-species-and-legality.md) |

## 更新導線（どのディレクトリを直すとき何を使うか）

- **レギュレーション解禁データ（種族 / 全技 / 持ち物 / メガ）を投入・更新**: [`survey-regulation`](../.claude/skills/survey-regulation/SKILL.md)（Serebii 第一優先で調査 → specs append + per-reg `<reg>/` 反映。内部で `fetch:data` → `materialize` → `generate:data` → `check:regulation`）。
- **育成済み個体 YAML を作成・検証**: [`author-individual`](../.claude/skills/author-individual/SKILL.md)（per-reg 種族 dex の許容値に絞り `check:individual` で検証。個体は `data/champions/` ではなく利用者の team 配下）。
- **構造データのみ取得し直す**: `fetch:data`（raw 取得）→ `materialize`（raw → specs / languages 転記・**append/既存尊重**で skill 著述値を上書きしない）→ `generate:data`（再生成）。
- **生成物を作り直す**: `generate:data`（specs / languages / per-reg を変換・合成・raw 不在でも動く）。
- **検証ゲート**: `pnpm verify`（型 / カバレッジ100% / Biome / **`check:yaml-style`**）。解禁データの参照整合・schema は `check:regulation`。
- **YAML スタイル**: `data/` 配下の YAML は**全 block スタイル**（flow `[ a, b ]` / `{ k: v }` 禁止）。`check:yaml-style`（`pnpm pokeform check:yaml-style data`）が flow 混入を AST ベースで検出して非0終了する（local `.githooks/pre-commit` + CI `pnpm verify` で強制）。詳細は [data-pipeline.md](../.claude/rules/data-pipeline.md)。

> 運用ルール（`raw/` の gitignore 方針・生成物の手書き編集禁止・取得元 / SoT / 転記の対応表）の SoT は
> [`data-pipeline.md`](../.claude/rules/data-pipeline.md) にある。本 README はその索引であり、方針の実体は持たない
> （PokeAPI 方針が見直されても rule を直せば本 README のリンク先で吸収される）。
