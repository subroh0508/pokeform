/**
 * canonical-species-id.ts（showdown codegen 純関数）— showdown の種族表示名を
 * **canonical な明示 slug**（PokeAPI variety slug 準拠）へ正規化する species 専用層。
 *
 * pokeform の species id 正本は **明示 slug 方式**（`urshifu-single-strike` / `deoxys-normal` 等）で、
 * これは PokeAPI の variety slug と恒等になる（名前側 Phase 4 の突合マップを不要にする）。showdown は
 * デフォルトフォルムを bare id（`urshifu` / `deoxys`）で持つため、この層で canonical へ写す。
 *
 * showdown の表示名（`name`）は baseSpecies + forme を既に内包する（`Rotom-Wash` / `Necrozma-Dusk-Mane`）
 * ため、`name` のみで canonical を導出できる。汎用正規化 `kebabId`（[`ids`](./ids.ts)）で lowercase kebab へ
 * 畳んでから、下記 3 種の curated / 有界マップで綴りだけを写す（構造データ = baseStats / types / legality は不変）。
 * 判断分岐を持つ純関数ゆえカバレッジ 100% ゲート対象（[[testing]]）。
 */

import { kebabId } from "./ids.ts";

/**
 * default→明示: showdown が bare id で持つデフォルトフォルムを PokeAPI の明示 default slug へ。
 * 原種が無い対等フォルム（urshifu 一撃/連撃・deoxys ノーマル等）は bare だと曖昧になるが、PokeAPI は
 * これらに明示 slug を振る。集合は PokeAPI `is_default` variety slug から機械導出できる（Phase 5 で全件）。
 */
const DEFAULT_TO_EXPLICIT: Record<string, string> = {
  urshifu: "urshifu-single-strike",
  deoxys: "deoxys-normal",
  basculegion: "basculegion-male",
};

/**
 * Class C 語彙差: showdown forme 綴りと PokeAPI slug が体系的に食い違うもの。
 * どちらも同一 variety を指すが表記が異なるため、canonical（PokeAPI 準拠）へ写す。
 */
const CLASS_C_VOCAB: Record<string, string> = {
  "necrozma-dusk-mane": "necrozma-dusk",
  "necrozma-dawn-wings": "necrozma-dawn",
  "tauros-paldea-combat": "tauros-paldea-combat-breed",
  "ogerpon-wellspring": "ogerpon-wellspring-mask",
  "greninja-bond": "greninja-battle-bond",
  "maushold-four": "maushold-family-of-four",
};

/**
 * CANONICAL_ID_OVERRIDE: PokeAPI が bare にするデフォルトを、pokeform では明示分割したいもの。
 * 例 gimmighoul（PokeAPI default = bare `gimmighoul`（はこ））を `gimmighoul-chest` と明示する
 * （roaming フォルムは PokeAPI が既に明示 slug を持つ）。
 */
const CANONICAL_ID_OVERRIDE: Record<string, string> = {
  gimmighoul: "gimmighoul-chest",
};

/**
 * showdown 表示名 → canonical species id（明示 slug・PokeAPI 準拠）。
 * `kebabId` で lowercase kebab へ畳んでから 3 種マップで綴りを写し、いずれにも無ければ素の kebab を返す
 * （原種/基本フォルムしか無い種 = `raichu` / `charizard` / `rotom-wash` は bare / 既に明示のまま素通り）。
 */
export function canonicalSpeciesId(name: string): string {
  const id = kebabId(name);
  return DEFAULT_TO_EXPLICIT[id] ?? CLASS_C_VOCAB[id] ?? CANONICAL_ID_OVERRIDE[id] ?? id;
}
