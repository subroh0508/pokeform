import { speciesNamesAll } from "../generated/languages/index.ts";
import { typeNames } from "../generated/languages/types.ts";
import type { Lang } from "../types/party.ts";
import type { StatKey } from "../types/stats.ts";
import type { PokemonType } from "../types/type-chart.ts";

/**
 * CLI 表示ヘルパ（薄い層・カバレッジ対象外）。表示言語 `--lang` に従って生成済み名前マップ
 * （`src/generated/languages/*`・名前 SoT は languages・ADR 0035）の日英 `name` を引く。入力ファイルの
 * `lang` とは独立（[[cli-and-io]]）。
 */

/** タイプの表示名（`--lang` に応じて ja/en）。 */
export const typeName = (type: PokemonType, lang: Lang): string => typeNames[type].name[lang];

/** 種族の表示名（base + メガ統合の名前マップから引く・未知 ID はそのまま返す）。 */
export const speciesName = (id: string, lang: Lang): string => {
  const entry = (speciesNamesAll as Record<string, { name: { ja: string; en: string } }>)[id];
  return entry ? entry.name[lang] : id;
};

/** 6 能力の表示ラベル（`--lang` に応じて ja/en）。 */
const STAT_LABELS: Readonly<Record<Lang, Readonly<Record<StatKey, string>>>> = {
  ja: {
    hp: "HP",
    attack: "こうげき",
    defense: "ぼうぎょ",
    spAttack: "とくこう",
    spDefense: "とくぼう",
    speed: "すばやさ",
  },
  en: {
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    spAttack: "Sp.Atk",
    spDefense: "Sp.Def",
    speed: "Speed",
  },
};

/** 能力名の表示ラベル。 */
export const statName = (key: StatKey, lang: Lang): string => STAT_LABELS[lang][key];
