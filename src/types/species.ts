import type { AbilityId } from "../../data/generated/abilities.ts";
import type { ItemId } from "../../data/generated/items.ts";
import type { MoveId } from "../../data/generated/moves.ts";
import type { SpeciesDex, SpeciesId } from "../../data/generated/species.ts";
import type { PokemonType } from "./type-chart.ts";

/**
 * 種族エントリの親型（統一パターンの XxxBase）。各 ID 参照（abilities/moves/items/types）は
 * 対応する Dex のキーに統一し、詳細は `Dex[Id]` ルックアップで取る（ID 単一ソース・
 * [[type-conventions]]）。種族粒度は「種族値が一意 = 1 種族」。解禁レギュレーションは種族側に
 * 持たず per-regulation（`regulationDex[R].species`）を正本とする（A案・ADR 0021）。
 */
export interface SpeciesBase {
  readonly dex: number;
  readonly id: string;
  readonly name: { readonly en: string; readonly ja: string };
  readonly types: readonly PokemonType[];
  readonly baseStats: {
    readonly hp: number;
    readonly attack: number;
    readonly defense: number;
    readonly spAttack: number;
    readonly spDefense: number;
    readonly speed: number;
  };
  readonly abilities: readonly AbilityId[];
  readonly moves: readonly MoveId[];
  readonly items: "any" | readonly ItemId[];
  /** メガシンカ先の SpeciesId（[[game-spec]] のメガ二重表現）。 */
  readonly megaEvolvesTo?: SpeciesId;
}

/** 生成済みの SpeciesDex（型）/ speciesDex（値）/ SpeciesId を re-export する。 */
export { speciesDex } from "../../data/generated/species.ts";
export type { SpeciesDex, SpeciesId };
