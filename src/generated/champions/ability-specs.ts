// 生成物（scripts/generate.ts 出力）。手書き編集しない。data/champions・data/languages を直し再生成する。
import type { AbilityBase } from "../../types/ability.ts";

export const abilitySpecsDex = {
  adaptability: {
    id: "adaptability",
  },
  analytic: {
    id: "analytic",
  },
  "anger-point": {
    id: "anger-point",
  },
  "battle-armor": {
    id: "battle-armor",
  },
  blaze: {
    id: "blaze",
  },
  chlorophyll: {
    id: "chlorophyll",
  },
  "clear-body": {
    id: "clear-body",
  },
  competitive: {
    id: "competitive",
  },
  contrary: {
    id: "contrary",
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
  drought: {
    id: "drought",
  },
  "effect-spore": {
    id: "effect-spore",
  },
  "flame-body": {
    id: "flame-body",
  },
  "flash-fire": {
    id: "flash-fire",
  },
  fluffy: {
    id: "fluffy",
  },
  forewarn: {
    id: "forewarn",
  },
  frisk: {
    id: "frisk",
  },
  "gale-wings": {
    id: "gale-wings",
  },
  "good-as-gold": {
    id: "good-as-gold",
  },
  guts: {
    id: "guts",
  },
  "heavy-metal": {
    id: "heavy-metal",
  },
  "huge-power": {
    id: "huge-power",
  },
  "hyper-cutter": {
    id: "hyper-cutter",
  },
  illuminate: {
    id: "illuminate",
  },
  infiltrator: {
    id: "infiltrator",
  },
  "inner-focus": {
    id: "inner-focus",
  },
  intimidate: {
    id: "intimidate",
  },
  justified: {
    id: "justified",
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
  "long-reach": {
    id: "long-reach",
  },
  "magic-guard": {
    id: "magic-guard",
  },
  "marvel-scale": {
    id: "marvel-scale",
  },
  "mirror-armor": {
    id: "mirror-armor",
  },
  "mold-breaker": {
    id: "mold-breaker",
  },
  moxie: {
    id: "moxie",
  },
  multiscale: {
    id: "multiscale",
  },
  "natural-cure": {
    id: "natural-cure",
  },
  overgrow: {
    id: "overgrow",
  },
  pickpocket: {
    id: "pickpocket",
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
  "purifying-salt": {
    id: "purifying-salt",
  },
  "rain-dish": {
    id: "rain-dish",
  },
  reckless: {
    id: "reckless",
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
  "sand-stream": {
    id: "sand-stream",
  },
  "sand-veil": {
    id: "sand-veil",
  },
  "shadow-tag": {
    id: "shadow-tag",
  },
  "shed-skin": {
    id: "shed-skin",
  },
  "sheer-force": {
    id: "sheer-force",
  },
  sniper: {
    id: "sniper",
  },
  "solar-power": {
    id: "solar-power",
  },
  "speed-boost": {
    id: "speed-boost",
  },
  steadfast: {
    id: "steadfast",
  },
  sturdy: {
    id: "sturdy",
  },
  "suction-cups": {
    id: "suction-cups",
  },
  swarm: {
    id: "swarm",
  },
  "swift-swim": {
    id: "swift-swim",
  },
  synchronize: {
    id: "synchronize",
  },
  telepathy: {
    id: "telepathy",
  },
  torrent: {
    id: "torrent",
  },
  "tough-claws": {
    id: "tough-claws",
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
  "vital-spirit": {
    id: "vital-spirit",
  },
} as const satisfies Record<string, AbilityBase>;

export type AbilitySpecsDex = typeof abilitySpecsDex;
export type AbilityId = keyof AbilitySpecsDex;
