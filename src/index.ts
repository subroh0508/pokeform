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
export { buildChart, type EffectivenessChart, effectiveness } from "./domain/type-effectiveness.ts";
export type { SpeciesBase, SpeciesDex, SpeciesId } from "./types/species.ts";
export { speciesDex } from "./types/species.ts";
export type { PokemonType, TypeMultiplier } from "./types/type-chart.ts";
