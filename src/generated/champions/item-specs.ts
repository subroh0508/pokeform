// 生成物（scripts/generate.ts 出力）。手書き編集しない。data/champions・data/languages を直し再生成する。
import type { Assignable } from "../../types/assert.ts";
import type { ItemBase } from "../../types/item.ts";

export const itemSpecsDex = {
  "charizardite-x": {
    id: "charizardite-x",
    category: "mega-stones",
    megaStoneFor: "charizard",
    megaSpecies: ["charizard-mega-x"],
  },
  "rocky-helmet": {
    id: "rocky-helmet",
    category: "held-items",
  },
  "life-orb": {
    id: "life-orb",
    category: "held-items",
  },
  leftovers: {
    id: "leftovers",
    category: "held-items",
  },
  "assault-vest": {
    id: "assault-vest",
    category: "held-items",
  },
  "choice-scarf": {
    id: "choice-scarf",
    category: "choice",
  },
  "black-belt": {
    id: "black-belt",
    category: "type-enhancement",
  },
  "black-glasses": {
    id: "black-glasses",
    category: "type-enhancement",
  },
  "bright-powder": {
    id: "bright-powder",
    category: "held-items",
  },
  charcoal: {
    id: "charcoal",
    category: "type-enhancement",
  },
  "dragon-fang": {
    id: "dragon-fang",
    category: "type-enhancement",
  },
  "fairy-feather": {
    id: "fairy-feather",
    category: "held-items",
  },
  "focus-band": {
    id: "focus-band",
    category: "held-items",
  },
  "focus-sash": {
    id: "focus-sash",
    category: "held-items",
  },
  "hard-stone": {
    id: "hard-stone",
    category: "type-enhancement",
  },
  "kings-rock": {
    id: "kings-rock",
    category: "held-items",
  },
  "light-ball": {
    id: "light-ball",
    category: "species-specific",
  },
  magnet: {
    id: "magnet",
    category: "type-enhancement",
  },
  "mental-herb": {
    id: "mental-herb",
    category: "held-items",
  },
  "metal-coat": {
    id: "metal-coat",
    category: "type-enhancement",
  },
  "miracle-seed": {
    id: "miracle-seed",
    category: "type-enhancement",
  },
  "mystic-water": {
    id: "mystic-water",
    category: "type-enhancement",
  },
  "never-melt-ice": {
    id: "never-melt-ice",
    category: "type-enhancement",
  },
  "poison-barb": {
    id: "poison-barb",
    category: "type-enhancement",
  },
  "quick-claw": {
    id: "quick-claw",
    category: "held-items",
  },
  "scope-lens": {
    id: "scope-lens",
    category: "held-items",
  },
  "sharp-beak": {
    id: "sharp-beak",
    category: "type-enhancement",
  },
  "shell-bell": {
    id: "shell-bell",
    category: "held-items",
  },
  "silk-scarf": {
    id: "silk-scarf",
    category: "type-enhancement",
  },
  "silver-powder": {
    id: "silver-powder",
    category: "type-enhancement",
  },
  "soft-sand": {
    id: "soft-sand",
    category: "type-enhancement",
  },
  "spell-tag": {
    id: "spell-tag",
    category: "type-enhancement",
  },
  "twisted-spoon": {
    id: "twisted-spoon",
    category: "type-enhancement",
  },
  "white-herb": {
    id: "white-herb",
    category: "held-items",
  },
  "aspear-berry": {
    id: "aspear-berry",
    category: "medicine",
  },
  "babiri-berry": {
    id: "babiri-berry",
    category: "type-protection",
  },
  "charti-berry": {
    id: "charti-berry",
    category: "type-protection",
  },
  "cheri-berry": {
    id: "cheri-berry",
    category: "medicine",
  },
  "chesto-berry": {
    id: "chesto-berry",
    category: "medicine",
  },
  "chilan-berry": {
    id: "chilan-berry",
    category: "type-protection",
  },
  "chople-berry": {
    id: "chople-berry",
    category: "type-protection",
  },
  "coba-berry": {
    id: "coba-berry",
    category: "type-protection",
  },
  "colbur-berry": {
    id: "colbur-berry",
    category: "type-protection",
  },
  "haban-berry": {
    id: "haban-berry",
    category: "type-protection",
  },
  "kasib-berry": {
    id: "kasib-berry",
    category: "type-protection",
  },
  "kebia-berry": {
    id: "kebia-berry",
    category: "type-protection",
  },
  "leppa-berry": {
    id: "leppa-berry",
    category: "medicine",
  },
  "lum-berry": {
    id: "lum-berry",
    category: "medicine",
  },
  "occa-berry": {
    id: "occa-berry",
    category: "type-protection",
  },
  "oran-berry": {
    id: "oran-berry",
    category: "medicine",
  },
  "passho-berry": {
    id: "passho-berry",
    category: "type-protection",
  },
  "payapa-berry": {
    id: "payapa-berry",
    category: "type-protection",
  },
  "pecha-berry": {
    id: "pecha-berry",
    category: "medicine",
  },
  "persim-berry": {
    id: "persim-berry",
    category: "medicine",
  },
  "rawst-berry": {
    id: "rawst-berry",
    category: "medicine",
  },
  "rindo-berry": {
    id: "rindo-berry",
    category: "type-protection",
  },
  "roseli-berry": {
    id: "roseli-berry",
    category: "type-protection",
  },
  "shuca-berry": {
    id: "shuca-berry",
    category: "type-protection",
  },
  "sitrus-berry": {
    id: "sitrus-berry",
    category: "medicine",
  },
  "tanga-berry": {
    id: "tanga-berry",
    category: "type-protection",
  },
  "wacan-berry": {
    id: "wacan-berry",
    category: "type-protection",
  },
  "yache-berry": {
    id: "yache-berry",
    category: "type-protection",
  },
  "charizardite-y": {
    id: "charizardite-y",
    category: "mega-stones",
    megaStoneFor: "charizard",
    megaSpecies: ["charizard-mega-y"],
  },
  garchompite: {
    id: "garchompite",
    category: "mega-stones",
    megaStoneFor: "garchomp",
    megaSpecies: ["garchomp-mega"],
  },
  gengarite: {
    id: "gengarite",
    category: "mega-stones",
    megaStoneFor: "gengar",
    megaSpecies: ["gengar-mega"],
  },
  lucarionite: {
    id: "lucarionite",
    category: "mega-stones",
    megaStoneFor: "lucario",
    megaSpecies: ["lucario-mega"],
  },
  tyranitarite: {
    id: "tyranitarite",
    category: "mega-stones",
    megaStoneFor: "tyranitar",
    megaSpecies: ["tyranitar-mega"],
  },
  "big-root": {
    id: "big-root",
    category: "held-items",
  },
  "damp-rock": {
    id: "damp-rock",
    category: "held-items",
  },
  "expert-belt": {
    id: "expert-belt",
    category: "held-items",
  },
  "heat-rock": {
    id: "heat-rock",
    category: "held-items",
  },
  "icy-rock": {
    id: "icy-rock",
    category: "held-items",
  },
  "iron-ball": {
    id: "iron-ball",
    category: "bad-held-items",
  },
  "light-clay": {
    id: "light-clay",
    category: "held-items",
  },
  metronome: {
    id: "metronome",
    category: "held-items",
  },
  "muscle-band": {
    id: "muscle-band",
    category: "held-items",
  },
  "shed-shell": {
    id: "shed-shell",
    category: "held-items",
  },
  "smooth-rock": {
    id: "smooth-rock",
    category: "held-items",
  },
  "wide-lens": {
    id: "wide-lens",
    category: "held-items",
  },
  "wise-glasses": {
    id: "wise-glasses",
    category: "held-items",
  },
  "zoom-lens": {
    id: "zoom-lens",
    category: "held-items",
  },
  blazikenite: {
    id: "blazikenite",
    category: "mega-stones",
    megaStoneFor: "blaziken",
    megaSpecies: ["blaziken-mega"],
  },
  mawilite: {
    id: "mawilite",
    category: "mega-stones",
    megaStoneFor: "mawile",
    megaSpecies: ["mawile-mega"],
  },
  metagrossite: {
    id: "metagrossite",
    category: "mega-stones",
    megaStoneFor: "metagross",
    megaSpecies: ["metagross-mega"],
  },
  sceptilite: {
    id: "sceptilite",
    category: "mega-stones",
    megaStoneFor: "sceptile",
    megaSpecies: ["sceptile-mega"],
  },
  swampertite: {
    id: "swampertite",
    category: "mega-stones",
    megaStoneFor: "swampert",
    megaSpecies: ["swampert-mega"],
  },
  abomasite: {
    id: "abomasite",
    category: "mega-stones",
    megaStoneFor: "abomasnow",
    megaSpecies: ["abomasnow-mega"],
  },
  absolite: {
    id: "absolite",
    category: "mega-stones",
    megaStoneFor: "absol",
    megaSpecies: ["absol-mega"],
  },
  aerodactylite: {
    id: "aerodactylite",
    category: "mega-stones",
    megaStoneFor: "aerodactyl",
    megaSpecies: ["aerodactyl-mega"],
  },
  aggronite: {
    id: "aggronite",
    category: "mega-stones",
    megaStoneFor: "aggron",
    megaSpecies: ["aggron-mega"],
  },
  alakazite: {
    id: "alakazite",
    category: "mega-stones",
    megaStoneFor: "alakazam",
    megaSpecies: ["alakazam-mega"],
  },
  altarianite: {
    id: "altarianite",
    category: "mega-stones",
    megaStoneFor: "altaria",
    megaSpecies: ["altaria-mega"],
  },
  ampharosite: {
    id: "ampharosite",
    category: "mega-stones",
    megaStoneFor: "ampharos",
    megaSpecies: ["ampharos-mega"],
  },
  audinite: {
    id: "audinite",
    category: "mega-stones",
    megaStoneFor: "audino",
    megaSpecies: ["audino-mega"],
  },
  banettite: {
    id: "banettite",
    category: "mega-stones",
    megaStoneFor: "banette",
    megaSpecies: ["banette-mega"],
  },
  beedrillite: {
    id: "beedrillite",
    category: "mega-stones",
    megaStoneFor: "beedrill",
    megaSpecies: ["beedrill-mega"],
  },
  blastoisinite: {
    id: "blastoisinite",
    category: "mega-stones",
    megaStoneFor: "blastoise",
    megaSpecies: ["blastoise-mega"],
  },
  cameruptite: {
    id: "cameruptite",
    category: "mega-stones",
    megaStoneFor: "camerupt",
    megaSpecies: ["camerupt-mega"],
  },
  chandelurite: {
    id: "chandelurite",
    category: "mega-stones",
    megaStoneFor: "chandelure",
    megaSpecies: ["chandelure-mega"],
  },
  chesnaughtite: {
    id: "chesnaughtite",
    category: "mega-stones",
    megaStoneFor: "chesnaught",
    megaSpecies: ["chesnaught-mega"],
  },
  chimechite: {
    id: "chimechite",
    category: "mega-stones",
    megaStoneFor: "chimecho",
    megaSpecies: ["chimecho-mega"],
  },
  clefablite: {
    id: "clefablite",
    category: "mega-stones",
    megaStoneFor: "clefable",
    megaSpecies: ["clefable-mega"],
  },
  crabominite: {
    id: "crabominite",
    category: "mega-stones",
    megaStoneFor: "crabominable",
    megaSpecies: ["crabominable-mega"],
  },
  delphoxite: {
    id: "delphoxite",
    category: "mega-stones",
    megaStoneFor: "delphox",
    megaSpecies: ["delphox-mega"],
  },
  dragoninite: {
    id: "dragoninite",
    category: "mega-stones",
    megaStoneFor: "dragonite",
    megaSpecies: ["dragonite-mega"],
  },
  drampanite: {
    id: "drampanite",
    category: "mega-stones",
    megaStoneFor: "drampa",
    megaSpecies: ["drampa-mega"],
  },
  emboarite: {
    id: "emboarite",
    category: "mega-stones",
    megaStoneFor: "emboar",
    megaSpecies: ["emboar-mega"],
  },
  excadrite: {
    id: "excadrite",
    category: "mega-stones",
    megaStoneFor: "excadrill",
    megaSpecies: ["excadrill-mega"],
  },
  feraligite: {
    id: "feraligite",
    category: "mega-stones",
    megaStoneFor: "feraligatr",
    megaSpecies: ["feraligatr-mega"],
  },
  floettite: {
    id: "floettite",
    category: "mega-stones",
    megaStoneFor: "floette-eternal",
    megaSpecies: ["floette-mega"],
  },
  froslassite: {
    id: "froslassite",
    category: "mega-stones",
    megaStoneFor: "froslass",
    megaSpecies: ["froslass-mega"],
  },
  galladite: {
    id: "galladite",
    category: "mega-stones",
    megaStoneFor: "gallade",
    megaSpecies: ["gallade-mega"],
  },
  gardevoirite: {
    id: "gardevoirite",
    category: "mega-stones",
    megaStoneFor: "gardevoir",
    megaSpecies: ["gardevoir-mega"],
  },
  glalitite: {
    id: "glalitite",
    category: "mega-stones",
    megaStoneFor: "glalie",
    megaSpecies: ["glalie-mega"],
  },
  glimmoranite: {
    id: "glimmoranite",
    category: "mega-stones",
    megaStoneFor: "glimmora",
    megaSpecies: ["glimmora-mega"],
  },
  golurkite: {
    id: "golurkite",
    category: "mega-stones",
    megaStoneFor: "golurk",
    megaSpecies: ["golurk-mega"],
  },
  greninjite: {
    id: "greninjite",
    category: "mega-stones",
    megaStoneFor: "greninja",
    megaSpecies: ["greninja-mega"],
  },
  gyaradosite: {
    id: "gyaradosite",
    category: "mega-stones",
    megaStoneFor: "gyarados",
    megaSpecies: ["gyarados-mega"],
  },
  hawluchanite: {
    id: "hawluchanite",
    category: "mega-stones",
    megaStoneFor: "hawlucha",
    megaSpecies: ["hawlucha-mega"],
  },
  heracronite: {
    id: "heracronite",
    category: "mega-stones",
    megaStoneFor: "heracross",
    megaSpecies: ["heracross-mega"],
  },
  houndoominite: {
    id: "houndoominite",
    category: "mega-stones",
    megaStoneFor: "houndoom",
    megaSpecies: ["houndoom-mega"],
  },
  kangaskhanite: {
    id: "kangaskhanite",
    category: "mega-stones",
    megaStoneFor: "kangaskhan",
    megaSpecies: ["kangaskhan-mega"],
  },
  lopunnite: {
    id: "lopunnite",
    category: "mega-stones",
    megaStoneFor: "lopunny",
    megaSpecies: ["lopunny-mega"],
  },
  manectite: {
    id: "manectite",
    category: "mega-stones",
    megaStoneFor: "manectric",
    megaSpecies: ["manectric-mega"],
  },
  medichamite: {
    id: "medichamite",
    category: "mega-stones",
    megaStoneFor: "medicham",
    megaSpecies: ["medicham-mega"],
  },
  meganiumite: {
    id: "meganiumite",
    category: "mega-stones",
    megaStoneFor: "meganium",
    megaSpecies: ["meganium-mega"],
  },
  meowsticite: {
    id: "meowsticite",
    category: "mega-stones",
    megaStoneFor: "meowstic-male",
    megaSpecies: ["meowstic-female-mega", "meowstic-male-mega"],
  },
  pidgeotite: {
    id: "pidgeotite",
    category: "mega-stones",
    megaStoneFor: "pidgeot",
    megaSpecies: ["pidgeot-mega"],
  },
  pinsirite: {
    id: "pinsirite",
    category: "mega-stones",
    megaStoneFor: "pinsir",
    megaSpecies: ["pinsir-mega"],
  },
  sablenite: {
    id: "sablenite",
    category: "mega-stones",
    megaStoneFor: "sableye",
    megaSpecies: ["sableye-mega"],
  },
  scizorite: {
    id: "scizorite",
    category: "mega-stones",
    megaStoneFor: "scizor",
    megaSpecies: ["scizor-mega"],
  },
  scovillainite: {
    id: "scovillainite",
    category: "mega-stones",
    megaStoneFor: "scovillain",
    megaSpecies: ["scovillain-mega"],
  },
  sharpedonite: {
    id: "sharpedonite",
    category: "mega-stones",
    megaStoneFor: "sharpedo",
    megaSpecies: ["sharpedo-mega"],
  },
  skarmorite: {
    id: "skarmorite",
    category: "mega-stones",
    megaStoneFor: "skarmory",
    megaSpecies: ["skarmory-mega"],
  },
  slowbronite: {
    id: "slowbronite",
    category: "mega-stones",
    megaStoneFor: "slowbro",
    megaSpecies: ["slowbro-mega"],
  },
  starminite: {
    id: "starminite",
    category: "mega-stones",
    megaStoneFor: "starmie",
    megaSpecies: ["starmie-mega"],
  },
  steelixite: {
    id: "steelixite",
    category: "mega-stones",
    megaStoneFor: "steelix",
    megaSpecies: ["steelix-mega"],
  },
  venusaurite: {
    id: "venusaurite",
    category: "mega-stones",
    megaStoneFor: "venusaur",
    megaSpecies: ["venusaur-mega"],
  },
  victreebelite: {
    id: "victreebelite",
    category: "mega-stones",
    megaStoneFor: "victreebel",
    megaSpecies: ["victreebel-mega"],
  },
  barbaracite: {
    id: "barbaracite",
    category: "mega-stones",
    megaStoneFor: "barbaracle",
    megaSpecies: ["barbaracle-mega"],
  },
  dragalgite: {
    id: "dragalgite",
    category: "mega-stones",
    megaStoneFor: "dragalge",
    megaSpecies: ["dragalge-mega"],
  },
  eelektrossite: {
    id: "eelektrossite",
    category: "mega-stones",
    megaStoneFor: "eelektross",
    megaSpecies: ["eelektross-mega"],
  },
  falinksite: {
    id: "falinksite",
    category: "mega-stones",
    megaStoneFor: "falinks",
    megaSpecies: ["falinks-mega"],
  },
  malamarite: {
    id: "malamarite",
    category: "mega-stones",
    megaStoneFor: "malamar",
    megaSpecies: ["malamar-mega"],
  },
  pyroarite: {
    id: "pyroarite",
    category: "mega-stones",
    megaStoneFor: "pyroar",
    megaSpecies: ["pyroar-mega"],
  },
  "raichunite-x": {
    id: "raichunite-x",
    category: "mega-stones",
    megaStoneFor: "raichu",
    megaSpecies: ["raichu-mega-x"],
  },
  "raichunite-y": {
    id: "raichunite-y",
    category: "mega-stones",
    megaStoneFor: "raichu",
    megaSpecies: ["raichu-mega-y"],
  },
  scolipite: {
    id: "scolipite",
    category: "mega-stones",
    megaStoneFor: "scolipede",
    megaSpecies: ["scolipede-mega"],
  },
  scraftinite: {
    id: "scraftinite",
    category: "mega-stones",
    megaStoneFor: "scrafty",
    megaSpecies: ["scrafty-mega"],
  },
  staraptite: {
    id: "staraptite",
    category: "mega-stones",
    megaStoneFor: "staraptor",
    megaSpecies: ["staraptor-mega"],
  },
} as const;

export type ItemSpecsDex = typeof itemSpecsDex;
export type ItemId = keyof ItemSpecsDex;

// 適合検証（megaSpecies が派生 SpeciesId を指すため inline satisfies を避け分離する）。
export type _ItemConforms = Assignable<Record<string, ItemBase>, ItemSpecsDex>;
