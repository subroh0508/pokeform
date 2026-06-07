import { speciesDex } from "../../data/generated/species.ts";
import { typeDex } from "../../data/generated/types.ts";
import type { Lang } from "../types/party.ts";
import type { PokemonType } from "../types/type-chart.ts";

/**
 * CLI 表示ヘルパ（薄い層・カバレッジ対象外）。表示言語 `--lang` に従って生成済み Dex の
 * 日英 `name` を引く。入力ファイルの `lang` とは独立（[[cli-and-io]]）。
 */

/** タイプの表示名（`--lang` に応じて ja/en）。 */
export const typeName = (type: PokemonType, lang: Lang): string => typeDex[type].name[lang];

/** 種族の表示名（未知 ID はそのまま返す）。 */
export const speciesName = (id: string, lang: Lang): string => {
  const entry = (speciesDex as Record<string, { name: { ja: string; en: string } }>)[id];
  return entry ? entry.name[lang] : id;
};
