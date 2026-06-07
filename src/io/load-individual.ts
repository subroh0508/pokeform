import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { speciesDex } from "../../data/generated/species.ts";
import { toSpeciesId, toStatKey } from "../codegen/normalize.ts";
import type { NatureSpec } from "../types/nature.ts";
import type { IndividualFile, Lang } from "../types/party.ts";
import type { BaseStats, PointAllocation, StatKey } from "../types/stats.ts";

/**
 * 1 体の個体 YAML を読み、種族値・性格・ポイント配分を ID 正規化済みで返す薄い I/O 層
 * （カバレッジ対象外）。名称解決は codegen/normalize（resolveName 越し・テスト済み）に委譲し、
 * 種族値は生成済み `speciesDex` から引く。`stat` コマンドが実数値・指数表示に使う（[[cli-and-io]]）。
 */

/** 読み込んだ個体（表示名 + 種族値 + 性格 + ポイント配分）。 */
export interface LoadedIndividual {
  readonly name: string;
  readonly speciesId: string;
  readonly baseStats: BaseStats;
  readonly nature: NatureSpec;
  readonly points: PointAllocation;
}

const zeroPoints = (): Record<StatKey, number> => ({
  hp: 0,
  attack: 0,
  defense: 0,
  spAttack: 0,
  spDefense: 0,
  speed: 0,
});

/** 個体 YAML を読み込み、解決済み LoadedIndividual を返す。種族未解決なら例外。 */
export const loadIndividual = async (path: string): Promise<LoadedIndividual> => {
  const abs = resolve(path);
  const ind = parseYaml(await readFile(abs, "utf8")) as IndividualFile;
  const lang: Lang = ind.lang ?? "ja";
  const speciesId = toSpeciesId(ind.species, lang);
  const entry = speciesId === null ? undefined : (speciesDex as Record<string, unknown>)[speciesId];
  if (speciesId === null || entry === undefined) {
    throw new Error(`unknown species '${ind.species}' in ${path}`);
  }
  const { baseStats } = entry as { baseStats: BaseStats };

  const points = zeroPoints();
  for (const [rawKey, value] of Object.entries(ind.points ?? {})) {
    const key = toStatKey(rawKey, lang);
    if (key !== null) points[key] = value;
  }

  const up = toStatKey(ind.nature.up, lang) ?? "attack";
  const down = toStatKey(ind.nature.down, lang) ?? "spAttack";

  return {
    name: (entry as { name: { ja: string; en: string } }).name[lang],
    speciesId,
    baseStats,
    nature: { up, down } as NatureSpec,
    points: points as PointAllocation,
  } satisfies LoadedIndividual;
};
