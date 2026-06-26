// 生成物（scripts/generate.ts 出力）。手書き編集しない。data/champions・data/languages を直し再生成する。
import type { NameEntry } from "../../types/name.ts";

export const abilityNames = {
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
  drought: {
    id: "drought",
    name: {
      en: "Drought",
      ja: "ひでり",
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
  "shadow-tag": {
    id: "shadow-tag",
    name: {
      en: "Shadow Tag",
      ja: "かげふみ",
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
  illuminate: {
    id: "illuminate",
    name: {
      en: "Illuminate",
      ja: "はっこう",
    },
  },
  "natural-cure": {
    id: "natural-cure",
    name: {
      en: "Natural Cure",
      ja: "しぜんかいふく",
    },
  },
  analytic: {
    id: "analytic",
    name: {
      en: "Analytic",
      ja: "アナライズ",
    },
  },
  adaptability: {
    id: "adaptability",
    name: {
      en: "Adaptability",
      ja: "てきおうりょく",
    },
  },
  chlorophyll: {
    id: "chlorophyll",
    name: {
      en: "Chlorophyll",
      ja: "ようりょくそ",
    },
  },
  "effect-spore": {
    id: "effect-spore",
    name: {
      en: "Effect Spore",
      ja: "ほうし",
    },
  },
  "poison-point": {
    id: "poison-point",
    name: {
      en: "Poison Point",
      ja: "どくのトゲ",
    },
  },
  "swift-swim": {
    id: "swift-swim",
    name: {
      en: "Swift Swim",
      ja: "すいすい",
    },
  },
  unburden: {
    id: "unburden",
    name: {
      en: "Unburden",
      ja: "かるわざ",
    },
  },
  "speed-boost": {
    id: "speed-boost",
    name: {
      en: "Speed Boost",
      ja: "かそく",
    },
  },
  damp: {
    id: "damp",
    name: {
      en: "Damp",
      ja: "しめりけ",
    },
  },
  "hyper-cutter": {
    id: "hyper-cutter",
    name: {
      en: "Hyper Cutter",
      ja: "かいりきバサミ",
    },
  },
  "sheer-force": {
    id: "sheer-force",
    name: {
      en: "Sheer Force",
      ja: "ちからずく",
    },
  },
  reckless: {
    id: "reckless",
    name: {
      en: "Reckless",
      ja: "すてみ",
    },
  },
  forewarn: {
    id: "forewarn",
    name: {
      en: "Forewarn",
      ja: "よちむ",
    },
  },
  telepathy: {
    id: "telepathy",
    name: {
      en: "Telepathy",
      ja: "テレパシー",
    },
  },
  "shed-skin": {
    id: "shed-skin",
    name: {
      en: "Shed Skin",
      ja: "だっぴ",
    },
  },
  rivalry: {
    id: "rivalry",
    name: {
      en: "Rivalry",
      ja: "とうそうしん",
    },
  },
  contrary: {
    id: "contrary",
    name: {
      en: "Contrary",
      ja: "あまのじゃく",
    },
  },
  "suction-cups": {
    id: "suction-cups",
    name: {
      en: "Suction Cups",
      ja: "きゅうばん",
    },
  },
  sniper: {
    id: "sniper",
    name: {
      en: "Sniper",
      ja: "スナイパー",
    },
  },
  pickpocket: {
    id: "pickpocket",
    name: {
      en: "Pickpocket",
      ja: "わるいてぐせ",
    },
  },
  "poison-touch": {
    id: "poison-touch",
    name: {
      en: "Poison Touch",
      ja: "どくしゅ",
    },
  },
  prankster: {
    id: "prankster",
    name: {
      en: "Prankster",
      ja: "いたずらごころ",
    },
  },
  frisk: {
    id: "frisk",
    name: {
      en: "Frisk",
      ja: "おみとおし",
    },
  },
  "battle-armor": {
    id: "battle-armor",
    name: {
      en: "Battle Armor",
      ja: "カブトアーマー",
    },
  },
  defiant: {
    id: "defiant",
    name: {
      en: "Defiant",
      ja: "まけんき",
    },
  },
  fluffy: {
    id: "fluffy",
    name: {
      en: "Fluffy",
      ja: "もふもふ",
    },
  },
  "vital-spirit": {
    id: "vital-spirit",
    name: {
      en: "Vital Spirit",
      ja: "やるき",
    },
  },
  "good-as-gold": {
    id: "good-as-gold",
    name: {
      en: "Good As Gold",
      ja: "おうごんのからだ",
    },
  },
  "lightning-rod": {
    id: "lightning-rod",
    name: {
      en: "Lightning Rod",
      ja: "ひらいしん",
    },
  },
  "huge-power": {
    id: "huge-power",
    name: {
      en: "Huge Power",
      ja: "ちからもち",
    },
  },
} as const satisfies Record<string, NameEntry>;

export type AbilityNames = typeof abilityNames;
