/**
 * abilities-fields.ts（showdown codegen 純関数）— 特性中間レコードを ability-specs.yaml（id 列挙）/
 * languages/abilities.yaml（en）の転記材料へ写す。特性は構造データを持たず id と名前のみ。
 */

import { kebabId } from "./ids.ts";

/** 特性中間レコード（`scripts/showdown/abilities.ts` の AbilityRecord 相当・抽出層非依存に再定義）。 */
export interface AbilityInput {
  name: string;
}

/** 特性の安定 id（name 由来 kebab）。 */
export function abilityId(a: AbilityInput): string {
  return kebabId(a.name);
}

/** languages/abilities.yaml の en 名材料。 */
export function abilityEnName(a: AbilityInput): { en: string } {
  return { en: a.name };
}
