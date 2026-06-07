import type { DamageClass } from "../types/move.ts";
import type { PokemonType } from "../types/type-chart.ts";
import type { CoverageMember } from "./coverage.ts";

/**
 * パーティ整合性検証（check:party）と、カバレッジ分析用メンバーの構築（analyze:coverage の前段）を
 * 行う純関数群。I/O 非依存: 解決済み（パス解決・名称 ID 正規化済み）のパーティと各 Dex の最小情報を
 * 受け取る。ファイル読込・名称解決は io 層（薄い glue）が担う（[[cli-and-io]]）。
 */

/** 検証 / 分析に必要な種族の最小情報。 */
export interface SpeciesInfo {
  readonly types: readonly PokemonType[];
  readonly megaEvolvesTo?: string;
}
/** レギュレーションの最小情報（解禁判定に必要な解禁種族集合・per-reg 一本化・ADR 0021）。 */
export interface RegulationInfo {
  readonly species: readonly string[];
}
/** 技の最小情報（攻撃範囲抽出に必要）。 */
export interface MoveInfo {
  readonly type: PokemonType;
  readonly damageClass: DamageClass;
}
/** 持ち物の最小情報（メガ展開判定に必要）。`id` は weak type 回避のための識別子。 */
export interface ItemInfo {
  readonly id: string;
  readonly megaStoneFor?: string;
}

/** パス解決 + 名称解決済みの 1 メンバー。 */
export interface ResolvedMember {
  /** メンバーファイルのパス（診断メッセージ用）。 */
  readonly path: string;
  /** ファイルが存在しパースできたか（false = 参照切れ）。 */
  readonly found: boolean;
  /** 解決前の種族名（診断メッセージ用）。 */
  readonly speciesName: string;
  /** 解決済み種族 ID（未知 / 未解決なら null）。 */
  readonly speciesId: string | null;
  /** 解決済み持ち物 ID（無し / 未解決なら null）。 */
  readonly itemId: string | null;
  /** 解決済み技 ID（既知のもののみ）。 */
  readonly moveIds: readonly string[];
}

/** パス解決 + 名称解決済みのパーティ。 */
export interface ResolvedParty {
  readonly regulation: string;
  readonly members: readonly ResolvedMember[];
}

/** check:party が検出する不整合。 */
export type PartyIssue =
  | { readonly kind: "broken-ref"; readonly path: string }
  | { readonly kind: "unknown-species"; readonly path: string; readonly name: string }
  | {
      readonly kind: "duplicate-species";
      readonly speciesId: string;
      readonly paths: readonly string[];
    }
  | {
      readonly kind: "not-legal";
      readonly path: string;
      readonly speciesId: string;
      readonly regulation: string;
    }
  | { readonly kind: "over-size"; readonly count: number };

/** パーティの最大体数（[[game-spec]] / phase doc）。 */
export const MAX_PARTY_SIZE = 6;

/**
 * パーティの整合性を検証し、検出した不整合を列挙する（参照切れ / 未知種族 / 同種族重複 /
 * 未解禁混入 / 体数超過）。空配列なら整合 OK（CLI は非空で非0終了）。
 */
export const validateParty = (
  party: ResolvedParty,
  speciesDex: Readonly<Record<string, SpeciesInfo>>,
  regulationDex: Readonly<Record<string, RegulationInfo>>,
): PartyIssue[] => {
  const issues: PartyIssue[] = [];
  if (party.members.length > MAX_PARTY_SIZE) {
    issues.push({ kind: "over-size", count: party.members.length });
  }
  const seen = new Map<string, string[]>();
  for (const m of party.members) {
    if (!m.found) {
      issues.push({ kind: "broken-ref", path: m.path });
      continue;
    }
    const species = m.speciesId === null ? undefined : speciesDex[m.speciesId];
    if (m.speciesId === null || species === undefined) {
      issues.push({ kind: "unknown-species", path: m.path, name: m.speciesName });
      continue;
    }
    const regulation = regulationDex[party.regulation];
    if (regulation === undefined || !regulation.species.includes(m.speciesId)) {
      issues.push({
        kind: "not-legal",
        path: m.path,
        speciesId: m.speciesId,
        regulation: party.regulation,
      });
    }
    const paths = seen.get(m.speciesId) ?? [];
    paths.push(m.path);
    seen.set(m.speciesId, paths);
  }
  for (const [speciesId, paths] of seen) {
    if (paths.length > 1) {
      issues.push({ kind: "duplicate-species", speciesId, paths });
    }
  }
  return issues;
};

/**
 * 解決済みパーティをカバレッジ分析用メンバー（防御タイプ + 攻撃技タイプ）へ変換する。
 * メガストーン保持かつ種族が megaEvolvesTo を持つ場合はメガ先タイプで防御分析する
 * （[[game-spec]] のメガ追加分析）。攻撃タイプは status 技を除外して抽出する。
 */
export const toCoverageMembers = (
  party: ResolvedParty,
  speciesDex: Readonly<Record<string, SpeciesInfo>>,
  moveDex: Readonly<Record<string, MoveInfo>>,
  itemDex: Readonly<Record<string, ItemInfo>>,
): CoverageMember[] => {
  const members: CoverageMember[] = [];
  for (const m of party.members) {
    const species = m.speciesId === null ? undefined : speciesDex[m.speciesId];
    if (m.speciesId === null || species === undefined) continue;
    let defenseTypes = species.types;
    if (m.itemId !== null && species.megaEvolvesTo !== undefined) {
      const item = itemDex[m.itemId];
      const mega = speciesDex[species.megaEvolvesTo];
      if (item?.megaStoneFor === m.speciesId && mega !== undefined) {
        defenseTypes = mega.types;
      }
    }
    const attackTypes = new Set<PokemonType>();
    for (const mv of m.moveIds) {
      const move = moveDex[mv];
      if (move !== undefined && move.damageClass !== "status") {
        attackTypes.add(move.type);
      }
    }
    members.push({
      id: m.speciesId,
      name: m.speciesId,
      defenseTypes,
      attackTypes: [...attackTypes],
    });
  }
  return members;
};
