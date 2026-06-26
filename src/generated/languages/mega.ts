// 生成物（scripts/generate.ts 出力）。手書き編集しない。data/champions・data/languages を直し再生成する。
import type { NameEntry } from "../../types/name.ts";

export const megaNames = {
  "charizard-mega-x": {
    id: "charizard-mega-x",
    name: {
      en: "Mega Charizard X",
      ja: "メガリザードンＸ",
    },
  },
  "charizard-mega-y": {
    id: "charizard-mega-y",
    name: {
      en: "Mega Charizard Y",
      ja: "メガリザードンＹ",
    },
  },
  "garchomp-mega": {
    id: "garchomp-mega",
    name: {
      en: "Mega Garchomp",
      ja: "メガガブリアス",
    },
  },
  "gengar-mega": {
    id: "gengar-mega",
    name: {
      en: "Mega Gengar",
      ja: "メガゲンガー",
    },
  },
  "tyranitar-mega": {
    id: "tyranitar-mega",
    name: {
      en: "Mega Tyranitar",
      ja: "メガバンギラス",
    },
  },
  "lucario-mega": {
    id: "lucario-mega",
    name: {
      en: "Mega Lucario",
      ja: "メガルカリオ",
    },
  },
} as const satisfies Record<string, NameEntry>;

export type MegaNames = typeof megaNames;
