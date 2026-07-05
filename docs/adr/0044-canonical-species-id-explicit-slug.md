---
id: 0044
status: Accepted
date: 2026-07-05
---

# 0044. species id 正本を明示 slug（PokeAPI 準拠 canonical）に定め showdown を正規化する

## Context

pokeform の species id 正本は「PokeAPI と同じ kebab」を暗黙の前提にしてきた（[ADR 0035](./0035-specs-languages-layout-redesign.md) の名前 SoT = languages / [ADR 0039](./0039-showdown-authoritative-pokeapi-ja-only.md) の構造取得元 = showdown）。しかし PokeAPI と pokemon-showdown の id スキームは体系的に食い違う:

- **showdown**: デフォルトフォルムは **bare id**（`urshifu` / `deoxys` / `basculegion`）、非デフォルトのみ接尾辞を持つ。
- **PokeAPI**: デフォルトにも**明示 slug**（`urshifu-single-strike` / `deoxys-normal` / `basculegion-male`）を振る。原種が無い対等フォルム（一撃/連撃の urshifu 等）を bare にすると曖昧になるため。

さらに語彙差（`necrozma-dusk-mane` ↔ PokeAPI `necrozma-dusk`）や、PokeAPI が逆に bare にするデフォルト（`gimmighoul` を明示分割したい `gimmighoul-chest`）もある。フォルム・リージョン・性別でタイプ / 種族値が変わる variety を **一意な明示 slug** で扱うには、id 正本をどちらの流儀に寄せるかを決める必要がある。名前側（languages）が variety 名（ja/en）を持つには、id と PokeAPI slug が突合できることが望ましい。

## Decision

**pokeform の species id 正本を「明示 slug 方式（PokeAPI variety slug に整合する canonical）」に定める。** showdown 抽出 id は構造パイプライン（showdown codegen）の 1 箇所で canonical へ正規化する。

- 正規化は純関数 `canonicalSpeciesId`（`src/codegen/showdown/canonical-species-id.ts`）が担い、汎用 kebab 正規化 `kebabId`（`src/codegen/showdown/ids.ts`）とは**別層**にする。moves / abilities / items の id 導出は `kebabId` のまま**不変**に保つ（species 専用の正規化）。
- 正規化マップは **3 種・curated / 有界**: **default→明示**（showdown bare → PokeAPI 明示 default slug）/ **Class C 語彙差**（showdown forme 綴り → PokeAPI slug）/ **`CANONICAL_ID_OVERRIDE`**（PokeAPI が bare にするデフォルトを明示分割）。マップ実体と代表例の SoT は `src/codegen/showdown/canonical-species-id.ts`（コロケーション test でカバレッジ 100%）。
- 正規化は **id の綴りのみ**を写す。構造データ（baseStats / types / legality）の正は showdown のまま不変（[ADR 0039](./0039-showdown-authoritative-pokeapi-ja-only.md)）。

これにより名前側の突合は PokeAPI slug と**恒等**になり（variety 名の突合マップ不要）、reconciliation は構造側の 1 箇所へ集約される。[ADR 0041](./0041-languages-full-name-dictionary.md) が導入した全件名辞書に、後続で variety を区別する distinct-forms 名対応を載せる前提を、id 正本を明示 slug に固定することで **refine** する（form 扱いの id 綴りを PokeAPI 準拠へ寄せる）。

## Consequences

- **良い点**:
  - フォルム・リージョン・性別で分岐する variety を一意な明示 slug で扱え、名前側（languages）が PokeAPI slug と恒等突合できる（突合マップ不要）。
  - id ↔ PokeAPI slug の reconciliation が構造パイプラインの純関数 1 箇所に集約され、spec 駆動で有界（`is_default` variety から機械導出可能 + Class C / override の少数手当て）。
  - `kebabId` を species 専用層から分離したため moves / abilities / items の id 導出は不変で、影響範囲が species に限定される。
- **悪い点 / コスト**:
  - 一部 id が Smogon/showdown 綴りから離れる（`necrozma-dusk` / `tauros-paldea-combat-breed` / `urshifu-single-strike`）。showdown 流儀に慣れた利用者には非直感的。
  - 正規化マップの Class C / override はソースを見ないと網羅が分からない curated 集合で、新規 variety 解禁時に追補が要る（有界だが手当てが継続的に発生）。
- **トレードオフ / 留意点**:
  - 現行 specs（`rotom-wash` = 既に明示 / `greninja` = base 維持）は改名移行ゼロで、正規化層の導入時点では id の実 diff は出ない（正規化は将来の variety 投入で効く）。
  - default→明示マップは PokeAPI `is_default` variety slug から機械導出できる。全件の投入は後続に委ね、本決定では正規化層と代表マップの確立に留める。

## Alternatives Considered

- **id 正本を showdown 流儀（bare デフォルト）に寄せる**: 取得元（showdown = 構造の正）と綴りが一致し正規化が不要になる。しかし対等フォルム（urshifu 一撃/連撃）を bare にすると曖昧で、名前側が variety を区別できず、PokeAPI slug との突合に逆方向マップが必要になる。名前側の恒等突合の利得を捨てるため不採用。
- **id ↔ PokeAPI slug の突合マップを名前側（languages・後続の名前対応）に持つ**: 構造側 id は showdown のまま、名前解決時に変換する案。しかし reconciliation が名前生成のたびに走り、構造側と名前側で id が二重管理になる。正規化を構造側 1 箇所へ集約する本決定の方が単純で、id 正本が一意に定まる。
