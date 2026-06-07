/**
 * pokeform 公開 API。ドメイン純関数と主要型を re-export する（薄い集約層・カバレッジ対象外）。
 * 実体・テストは各モジュールに置く。CLI は `src/cli/index.ts`（bin: pokeform）。
 */
export {
  type CalcStatsEntry,
  type CalcStatsSpec,
  calcHp,
  calcRealStats,
  calcStat,
  isValidPointAllocation,
  type NatureMod,
  natureModFor,
  POINT_MAX_PER_STAT,
  POINT_TOTAL,
} from "./domain/calc-stats.ts";
export {
  analyzeCoverage,
  analyzeWeaknesses,
  type CoverageHole,
  type CoverageMember,
  type CoverageReport,
  findCoverageHoles,
  VULNERABLE_WEAK_COUNT,
  type WeaknessRow,
} from "./domain/coverage.ts";
export { baseDamage, type DamageInput, LEVEL, maxDamage, minDamage } from "./domain/damage.ts";
export {
  type ItemInfo,
  MAX_PARTY_SIZE,
  type MoveInfo,
  type PartyIssue,
  type ResolvedMember,
  type ResolvedParty,
  type SpeciesInfo,
  toCoverageMembers,
  validateParty,
} from "./domain/party-analysis.ts";
export { type NameMaps, type ResolveResult, resolveName } from "./domain/resolve-names.ts";
export {
  bulkIndex,
  offenseIndex,
  physicalBulk,
  physicalOffense,
  specialBulk,
  specialOffense,
} from "./domain/stat-indices.ts";
export {
  buildTuningReport,
  minPointForTarget,
  type OutspeedResult,
  type SurvivalInput,
  type SurvivalSolution,
  solveOutspeed,
  solveSurvival,
  type TuningReport,
} from "./domain/stat-tuning.ts";
export { buildChart, type EffectivenessChart, effectiveness } from "./domain/type-effectiveness.ts";
export {
  type AbilityNotAvailable,
  defineIndividual,
  type HoldableItems,
  type Individual,
  type IndividualSpec,
  type ItemNotHoldableBy,
  type MoveNotLearnedBy,
  type PointTotalMustBe66,
  type SpeciesDexOf,
  type SpeciesIdIn,
  type ValidAbility,
  type ValidItem,
  type ValidMove,
  type ValidMoves,
} from "./types/individual.ts";
export type {
  AnySpeciesId,
  ConstrainParty,
  DuplicateSpeciesInParty,
  MemberDeclaresRegulation,
  NotLegalInRegulation,
  PartySpec,
  PartyTooLarge,
  RegulationNotDeclaredByMember,
  SpeciesNotFound,
  UniqueSpecies,
} from "./types/party.ts";
export type { RegulationBase, RegulationDex, RegulationId } from "./types/regulation.ts";
export { regulationDex } from "./types/regulation.ts";
export type {
  SpeciesBase,
  SpeciesBaseDex,
  SpeciesBaseId,
  SpeciesBaseInfo,
} from "./types/species.ts";
export { speciesBaseDex } from "./types/species.ts";
export type { PokemonType, TypeMultiplier } from "./types/type-chart.ts";
