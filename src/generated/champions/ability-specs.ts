// 生成物（scripts/generate.ts 出力）。手書き編集しない。data/champions・data/languages を直し再生成する。
import type { AbilityBase } from "../../types/ability.ts";

export const abilitySpecsDex = {
  adaptability: {
    id: "adaptability",
  },
  aerilate: {
    id: "aerilate",
  },
  aftermath: {
    id: "aftermath",
  },
  analytic: {
    id: "analytic",
  },
  "anger-point": {
    id: "anger-point",
  },
  anticipation: {
    id: "anticipation",
  },
  "armor-tail": {
    id: "armor-tail",
  },
  "aroma-veil": {
    id: "aroma-veil",
  },
  "battle-armor": {
    id: "battle-armor",
  },
  "battle-bond": {
    id: "battle-bond",
  },
  berserk: {
    id: "berserk",
  },
  "big-pecks": {
    id: "big-pecks",
  },
  blaze: {
    id: "blaze",
  },
  bulletproof: {
    id: "bulletproof",
  },
  "cheek-pouch": {
    id: "cheek-pouch",
  },
  chlorophyll: {
    id: "chlorophyll",
  },
  "clear-body": {
    id: "clear-body",
  },
  "cloud-nine": {
    id: "cloud-nine",
  },
  competitive: {
    id: "competitive",
  },
  "compound-eyes": {
    id: "compound-eyes",
  },
  contrary: {
    id: "contrary",
  },
  corrosion: {
    id: "corrosion",
  },
  "cud-chew": {
    id: "cud-chew",
  },
  "curious-medicine": {
    id: "curious-medicine",
  },
  "cursed-body": {
    id: "cursed-body",
  },
  "cute-charm": {
    id: "cute-charm",
  },
  damp: {
    id: "damp",
  },
  defiant: {
    id: "defiant",
  },
  disguise: {
    id: "disguise",
  },
  dragonize: {
    id: "dragonize",
  },
  drizzle: {
    id: "drizzle",
  },
  drought: {
    id: "drought",
  },
  "dry-skin": {
    id: "dry-skin",
  },
  "early-bird": {
    id: "early-bird",
  },
  "earth-eater": {
    id: "earth-eater",
  },
  "effect-spore": {
    id: "effect-spore",
  },
  electromorphosis: {
    id: "electromorphosis",
  },
  "fairy-aura": {
    id: "fairy-aura",
  },
  filter: {
    id: "filter",
  },
  "flame-body": {
    id: "flame-body",
  },
  "flash-fire": {
    id: "flash-fire",
  },
  "flower-veil": {
    id: "flower-veil",
  },
  fluffy: {
    id: "fluffy",
  },
  forecast: {
    id: "forecast",
  },
  forewarn: {
    id: "forewarn",
  },
  "friend-guard": {
    id: "friend-guard",
  },
  frisk: {
    id: "frisk",
  },
  "fur-coat": {
    id: "fur-coat",
  },
  "gale-wings": {
    id: "gale-wings",
  },
  gluttony: {
    id: "gluttony",
  },
  "good-as-gold": {
    id: "good-as-gold",
  },
  gooey: {
    id: "gooey",
  },
  guts: {
    id: "guts",
  },
  harvest: {
    id: "harvest",
  },
  healer: {
    id: "healer",
  },
  heatproof: {
    id: "heatproof",
  },
  "heavy-metal": {
    id: "heavy-metal",
  },
  hospitality: {
    id: "hospitality",
  },
  "huge-power": {
    id: "huge-power",
  },
  "hunger-switch": {
    id: "hunger-switch",
  },
  hustle: {
    id: "hustle",
  },
  hydration: {
    id: "hydration",
  },
  "hyper-cutter": {
    id: "hyper-cutter",
  },
  "ice-body": {
    id: "ice-body",
  },
  illuminate: {
    id: "illuminate",
  },
  illusion: {
    id: "illusion",
  },
  immunity: {
    id: "immunity",
  },
  imposter: {
    id: "imposter",
  },
  infiltrator: {
    id: "infiltrator",
  },
  "innards-out": {
    id: "innards-out",
  },
  "inner-focus": {
    id: "inner-focus",
  },
  insomnia: {
    id: "insomnia",
  },
  intimidate: {
    id: "intimidate",
  },
  "iron-fist": {
    id: "iron-fist",
  },
  justified: {
    id: "justified",
  },
  "keen-eye": {
    id: "keen-eye",
  },
  klutz: {
    id: "klutz",
  },
  "leaf-guard": {
    id: "leaf-guard",
  },
  levitate: {
    id: "levitate",
  },
  "light-metal": {
    id: "light-metal",
  },
  "lightning-rod": {
    id: "lightning-rod",
  },
  limber: {
    id: "limber",
  },
  "liquid-voice": {
    id: "liquid-voice",
  },
  "long-reach": {
    id: "long-reach",
  },
  "magic-bounce": {
    id: "magic-bounce",
  },
  "magic-guard": {
    id: "magic-guard",
  },
  magician: {
    id: "magician",
  },
  "magma-armor": {
    id: "magma-armor",
  },
  "marvel-scale": {
    id: "marvel-scale",
  },
  "mega-launcher": {
    id: "mega-launcher",
  },
  "mega-sol": {
    id: "mega-sol",
  },
  merciless: {
    id: "merciless",
  },
  mimicry: {
    id: "mimicry",
  },
  minus: {
    id: "minus",
  },
  "mirror-armor": {
    id: "mirror-armor",
  },
  "mold-breaker": {
    id: "mold-breaker",
  },
  moody: {
    id: "moody",
  },
  "motor-drive": {
    id: "motor-drive",
  },
  moxie: {
    id: "moxie",
  },
  multiscale: {
    id: "multiscale",
  },
  mummy: {
    id: "mummy",
  },
  "natural-cure": {
    id: "natural-cure",
  },
  "no-guard": {
    id: "no-guard",
  },
  oblivious: {
    id: "oblivious",
  },
  opportunist: {
    id: "opportunist",
  },
  overcoat: {
    id: "overcoat",
  },
  overgrow: {
    id: "overgrow",
  },
  "own-tempo": {
    id: "own-tempo",
  },
  "parental-bond": {
    id: "parental-bond",
  },
  pickpocket: {
    id: "pickpocket",
  },
  pickup: {
    id: "pickup",
  },
  "piercing-drill": {
    id: "piercing-drill",
  },
  pixilate: {
    id: "pixilate",
  },
  plus: {
    id: "plus",
  },
  "poison-heal": {
    id: "poison-heal",
  },
  "poison-point": {
    id: "poison-point",
  },
  "poison-touch": {
    id: "poison-touch",
  },
  prankster: {
    id: "prankster",
  },
  pressure: {
    id: "pressure",
  },
  protean: {
    id: "protean",
  },
  "pure-power": {
    id: "pure-power",
  },
  "purifying-salt": {
    id: "purifying-salt",
  },
  "queenly-majesty": {
    id: "queenly-majesty",
  },
  "quick-draw": {
    id: "quick-draw",
  },
  "quick-feet": {
    id: "quick-feet",
  },
  "rain-dish": {
    id: "rain-dish",
  },
  receiver: {
    id: "receiver",
  },
  reckless: {
    id: "reckless",
  },
  refrigerate: {
    id: "refrigerate",
  },
  regenerator: {
    id: "regenerator",
  },
  ripen: {
    id: "ripen",
  },
  rivalry: {
    id: "rivalry",
  },
  "rock-head": {
    id: "rock-head",
  },
  "rough-skin": {
    id: "rough-skin",
  },
  "sand-force": {
    id: "sand-force",
  },
  "sand-rush": {
    id: "sand-rush",
  },
  "sand-spit": {
    id: "sand-spit",
  },
  "sand-stream": {
    id: "sand-stream",
  },
  "sand-veil": {
    id: "sand-veil",
  },
  "sap-sipper": {
    id: "sap-sipper",
  },
  scrappy: {
    id: "scrappy",
  },
  "screen-cleaner": {
    id: "screen-cleaner",
  },
  "shadow-tag": {
    id: "shadow-tag",
  },
  sharpness: {
    id: "sharpness",
  },
  "shed-skin": {
    id: "shed-skin",
  },
  "sheer-force": {
    id: "sheer-force",
  },
  "shell-armor": {
    id: "shell-armor",
  },
  "shield-dust": {
    id: "shield-dust",
  },
  "skill-link": {
    id: "skill-link",
  },
  "slush-rush": {
    id: "slush-rush",
  },
  sniper: {
    id: "sniper",
  },
  "snow-cloak": {
    id: "snow-cloak",
  },
  "snow-warning": {
    id: "snow-warning",
  },
  "solar-power": {
    id: "solar-power",
  },
  "solid-rock": {
    id: "solid-rock",
  },
  soundproof: {
    id: "soundproof",
  },
  "speed-boost": {
    id: "speed-boost",
  },
  "spicy-spray": {
    id: "spicy-spray",
  },
  stall: {
    id: "stall",
  },
  stalwart: {
    id: "stalwart",
  },
  stamina: {
    id: "stamina",
  },
  "stance-change": {
    id: "stance-change",
  },
  static: {
    id: "static",
  },
  steadfast: {
    id: "steadfast",
  },
  stench: {
    id: "stench",
  },
  "sticky-hold": {
    id: "sticky-hold",
  },
  "strong-jaw": {
    id: "strong-jaw",
  },
  sturdy: {
    id: "sturdy",
  },
  "suction-cups": {
    id: "suction-cups",
  },
  "super-luck": {
    id: "super-luck",
  },
  "supersweet-syrup": {
    id: "supersweet-syrup",
  },
  "supreme-overlord": {
    id: "supreme-overlord",
  },
  "surge-surfer": {
    id: "surge-surfer",
  },
  swarm: {
    id: "swarm",
  },
  "sweet-veil": {
    id: "sweet-veil",
  },
  "swift-swim": {
    id: "swift-swim",
  },
  symbiosis: {
    id: "symbiosis",
  },
  synchronize: {
    id: "synchronize",
  },
  "tangled-feet": {
    id: "tangled-feet",
  },
  technician: {
    id: "technician",
  },
  telepathy: {
    id: "telepathy",
  },
  "thick-fat": {
    id: "thick-fat",
  },
  torrent: {
    id: "torrent",
  },
  "tough-claws": {
    id: "tough-claws",
  },
  "toxic-debris": {
    id: "toxic-debris",
  },
  trace: {
    id: "trace",
  },
  unaware: {
    id: "unaware",
  },
  unburden: {
    id: "unburden",
  },
  unnerve: {
    id: "unnerve",
  },
  "unseen-fist": {
    id: "unseen-fist",
  },
  "vital-spirit": {
    id: "vital-spirit",
  },
  "volt-absorb": {
    id: "volt-absorb",
  },
  "wandering-spirit": {
    id: "wandering-spirit",
  },
  "water-absorb": {
    id: "water-absorb",
  },
  "water-bubble": {
    id: "water-bubble",
  },
  "weak-armor": {
    id: "weak-armor",
  },
  "white-smoke": {
    id: "white-smoke",
  },
  "zero-to-hero": {
    id: "zero-to-hero",
  },
} as const satisfies Record<string, AbilityBase>;

export type AbilitySpecsDex = typeof abilitySpecsDex;
export type AbilityId = keyof AbilitySpecsDex;
