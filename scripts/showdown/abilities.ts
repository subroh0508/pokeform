/**
 * scripts/showdown/abilities.ts — 解禁 roster が持つ特性を抽出する。
 *
 * 出力は使用可能な全種族の abilities の和集合。転記層
 * `src/codegen/showdown/abilities-fields.ts` が ability-specs.yaml（id 列挙）/ languages へ写す。
 */

import { type ModdedDex, usableSpecies } from "./dex";

/** showdown から抽出した特性 1 件の中間レコード。 */
export interface AbilityRecord {
  /** showdown の squashed id（参考・id 正規化は codegen が name から行う） */
  id: string;
  name: string;
}

/** 使用可能な全種族の特性和集合を抽出する（name 昇順）。 */
export function extractAbilities(dex: ModdedDex): AbilityRecord[] {
  const abilityNames = new Set<string>();
  for (const species of usableSpecies(dex)) {
    for (const name of Object.values(species.abilities)) abilityNames.add(name);
  }
  return [...abilityNames]
    .map((name) => dex.abilities.get(name))
    .filter((ability) => ability.exists)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((ability) => ({ id: ability.id, name: ability.name }));
}
