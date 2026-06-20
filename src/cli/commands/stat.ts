import { calcRealStats, natureModFor } from "../../domain/calc-stats.ts";
import { physicalBulk, specialBulk } from "../../domain/stat-indices.ts";
import { loadIndividual } from "../../io/load-individual.ts";
import { resolveInputFiles } from "../../io/resolve-paths.ts";
import type { Lang } from "../../types/party.ts";
import type { RealStats, StatKey } from "../../types/stats.ts";
import { speciesName, statName } from "../format.ts";

/**
 * stat コマンド本体（薄い CLI 配線・カバレッジ対象外）。実数値計算・指数算出は domain
 * （calc-stats / stat-indices・純関数・テスト済み）に委譲し、ここは入出力のみ。
 * 個体の 6 実数値・性格補正記号・能力ポイント配分・耐久指数を `--lang` に従って表示する。
 */

const STAT_KEYS: readonly StatKey[] = ["hp", "attack", "defense", "spAttack", "spDefense", "speed"];

/** 性格補正の表示記号（+ = ×1.1 / − = ×0.9 / 空 = 等倍）。 */
const natureSign = (mod: number): string => (mod > 1 ? " (+)" : mod < 1 ? " (−)" : "");

const printIndividual = (
  name: string,
  real: RealStats,
  individual: { nature: Parameters<typeof natureModFor>[1]; points: Record<StatKey, number> },
  lang: Lang,
): void => {
  console.log(`${name}`);
  console.log(lang === "ja" ? "  実数値 (補正 / ポイント):" : "  Real stats (mod / points):");
  for (const key of STAT_KEYS) {
    const mod = key === "hp" ? 1 : natureModFor(key, individual.nature);
    const sign = key === "hp" ? "" : natureSign(mod);
    console.log(`    ${statName(key, lang)}: ${real[key]}${sign} / ${individual.points[key]}`);
  }
  console.log(
    lang === "ja"
      ? `  耐久指数: 物理 ${physicalBulk(real)} / 特殊 ${specialBulk(real)}`
      : `  Bulk index: phys ${physicalBulk(real)} / spec ${specialBulk(real)}`,
  );
};

/** stat を実行し、終了コード（0 = 正常 / 1 = 1 件以上読込失敗）を返す。 */
export const runStat = async (path: string, lang: Lang): Promise<number> => {
  const files = await resolveInputFiles(path, "**/*.yaml");
  let failed = false;
  for (const file of files) {
    try {
      const ind = await loadIndividual(file);
      const real = calcRealStats(ind, ind);
      const label = `${ind.name} (${speciesName(ind.speciesId, lang)})`;
      printIndividual(label, real, ind, lang);
    } catch (err) {
      failed = true;
      console.error(`❌ ${file}: ${(err as Error).message}`);
    }
  }
  return failed ? 1 : 0;
};
