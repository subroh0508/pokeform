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
  blaze: {
    id: "blaze",
  },
  "clear-body": {
    id: "clear-body",
  },
  competitive: {
    id: "competitive",
  },
  "cursed-body": {
    id: "cursed-body",
  },
  "cute-charm": {
    id: "cute-charm",
  },
  drought: {
    id: "drought",
  },
  "flame-body": {
    id: "flame-body",
  },
  "flash-fire": {
    id: "flash-fire",
  },
  "gale-wings": {
    id: "gale-wings",
  },
  guts: {
    id: "guts",
  },
  "heavy-metal": {
    id: "heavy-metal",
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
  "solar-power": {
    id: "solar-power",
  },
  steadfast: {
    id: "steadfast",
  },
  sturdy: {
    id: "sturdy",
  },
  swarm: {
    id: "swarm",
  },
  synchronize: {
    id: "synchronize",
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
  unnerve: {
    id: "unnerve",
  },
} as const satisfies Record<string, AbilityBase>;

export type AbilitySpecsDex = typeof abilitySpecsDex;
export type AbilityId = keyof AbilitySpecsDex;
