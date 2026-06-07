// 生成物（scripts/generate.ts 出力）。手書き編集しない。raw/champions を直し再生成する。
import type { AbilityBase } from "../../src/types/ability.ts";

export const abilityDex = {
  blaze: {
    id: "blaze",
    name: {
      en: "Blaze",
      ja: "もうか",
    },
  },
  "clear-body": {
    id: "clear-body",
    name: {
      en: "Clear Body",
      ja: "クリアボディ",
    },
  },
  "cursed-body": {
    id: "cursed-body",
    name: {
      en: "Cursed Body",
      ja: "のろわれボディ",
    },
  },
  infiltrator: {
    id: "infiltrator",
    name: {
      en: "Infiltrator",
      ja: "すりぬけ",
    },
  },
  "inner-focus": {
    id: "inner-focus",
    name: {
      en: "Inner Focus",
      ja: "せいしんりょく",
    },
  },
  intimidate: {
    id: "intimidate",
    name: {
      en: "Intimidate",
      ja: "いかく",
    },
  },
  levitate: {
    id: "levitate",
    name: {
      en: "Levitate",
      ja: "ふゆう",
    },
  },
  "light-metal": {
    id: "light-metal",
    name: {
      en: "Light Metal",
      ja: "ライトメタル",
    },
  },
  moxie: {
    id: "moxie",
    name: {
      en: "Moxie",
      ja: "じしんかじょう",
    },
  },
  multiscale: {
    id: "multiscale",
    name: {
      en: "Multiscale",
      ja: "マルチスケイル",
    },
  },
  pressure: {
    id: "pressure",
    name: {
      en: "Pressure",
      ja: "プレッシャー",
    },
  },
  "rough-skin": {
    id: "rough-skin",
    name: {
      en: "Rough Skin",
      ja: "さめはだ",
    },
  },
  "sand-veil": {
    id: "sand-veil",
    name: {
      en: "Sand Veil",
      ja: "すながくれ",
    },
  },
  "solar-power": {
    id: "solar-power",
    name: {
      en: "Solar Power",
      ja: "サンパワー",
    },
  },
  "tough-claws": {
    id: "tough-claws",
    name: {
      en: "Tough Claws",
      ja: "かたいツメ",
    },
  },
  unnerve: {
    id: "unnerve",
    name: {
      en: "Unnerve",
      ja: "きんちょうかん",
    },
  },
} as const satisfies Record<string, AbilityBase>;

export type AbilityDex = typeof abilityDex;
export type AbilityId = keyof AbilityDex;
