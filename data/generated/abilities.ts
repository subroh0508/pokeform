// 生成物（scripts/generate.ts 出力）。手書き編集しない。raw/champions を直し再生成する。
import type { AbilityBase } from "../../src/types/ability.ts";

export const abilityDex = {
  "anger-point": {
    id: "anger-point",
    name: {
      en: "Anger Point",
      ja: "いかりのつぼ",
    },
  },
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
  competitive: {
    id: "competitive",
    name: {
      en: "Competitive",
      ja: "かちき",
    },
  },
  "cursed-body": {
    id: "cursed-body",
    name: {
      en: "Cursed Body",
      ja: "のろわれボディ",
    },
  },
  "cute-charm": {
    id: "cute-charm",
    name: {
      en: "Cute Charm",
      ja: "メロメロボディ",
    },
  },
  "flame-body": {
    id: "flame-body",
    name: {
      en: "Flame Body",
      ja: "ほのおのからだ",
    },
  },
  "flash-fire": {
    id: "flash-fire",
    name: {
      en: "Flash Fire",
      ja: "もらいび",
    },
  },
  "gale-wings": {
    id: "gale-wings",
    name: {
      en: "Gale Wings",
      ja: "はやてのつばさ",
    },
  },
  guts: {
    id: "guts",
    name: {
      en: "Guts",
      ja: "こんじょう",
    },
  },
  "heavy-metal": {
    id: "heavy-metal",
    name: {
      en: "Heavy Metal",
      ja: "ヘヴィメタル",
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
  justified: {
    id: "justified",
    name: {
      en: "Justified",
      ja: "せいぎのこころ",
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
  "long-reach": {
    id: "long-reach",
    name: {
      en: "Long Reach",
      ja: "えんかく",
    },
  },
  "magic-guard": {
    id: "magic-guard",
    name: {
      en: "Magic Guard",
      ja: "マジックガード",
    },
  },
  "marvel-scale": {
    id: "marvel-scale",
    name: {
      en: "Marvel Scale",
      ja: "ふしぎなうろこ",
    },
  },
  "mirror-armor": {
    id: "mirror-armor",
    name: {
      en: "Mirror Armor",
      ja: "ミラーアーマー",
    },
  },
  "mold-breaker": {
    id: "mold-breaker",
    name: {
      en: "Mold Breaker",
      ja: "かたやぶり",
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
  overgrow: {
    id: "overgrow",
    name: {
      en: "Overgrow",
      ja: "しんりょく",
    },
  },
  pressure: {
    id: "pressure",
    name: {
      en: "Pressure",
      ja: "プレッシャー",
    },
  },
  protean: {
    id: "protean",
    name: {
      en: "Protean",
      ja: "へんげんじざい",
    },
  },
  "purifying-salt": {
    id: "purifying-salt",
    name: {
      en: "Purifying Salt",
      ja: "きよめのしお",
    },
  },
  "rain-dish": {
    id: "rain-dish",
    name: {
      en: "Rain Dish",
      ja: "あめうけざら",
    },
  },
  "rock-head": {
    id: "rock-head",
    name: {
      en: "Rock Head",
      ja: "いしあたま",
    },
  },
  "rough-skin": {
    id: "rough-skin",
    name: {
      en: "Rough Skin",
      ja: "さめはだ",
    },
  },
  "sand-force": {
    id: "sand-force",
    name: {
      en: "Sand Force",
      ja: "すなのちから",
    },
  },
  "sand-rush": {
    id: "sand-rush",
    name: {
      en: "Sand Rush",
      ja: "すなかき",
    },
  },
  "sand-stream": {
    id: "sand-stream",
    name: {
      en: "Sand Stream",
      ja: "すなおこし",
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
  steadfast: {
    id: "steadfast",
    name: {
      en: "Steadfast",
      ja: "ふくつのこころ",
    },
  },
  sturdy: {
    id: "sturdy",
    name: {
      en: "Sturdy",
      ja: "がんじょう",
    },
  },
  swarm: {
    id: "swarm",
    name: {
      en: "Swarm",
      ja: "むしのしらせ",
    },
  },
  synchronize: {
    id: "synchronize",
    name: {
      en: "Synchronize",
      ja: "シンクロ",
    },
  },
  torrent: {
    id: "torrent",
    name: {
      en: "Torrent",
      ja: "げきりゅう",
    },
  },
  "tough-claws": {
    id: "tough-claws",
    name: {
      en: "Tough Claws",
      ja: "かたいツメ",
    },
  },
  unaware: {
    id: "unaware",
    name: {
      en: "Unaware",
      ja: "てんねん",
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
