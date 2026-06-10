// 生成物（scripts/generate.ts 出力）。手書き編集しない。raw/champions を直し再生成する。
import type { Assignable } from "../../src/types/assert.ts";
import type { ItemBase } from "../../src/types/item.ts";

export const itemDex = {
  "charizardite-x": {
    id: "charizardite-x",
    name: {
      en: "Charizardite X",
      ja: "リザードナイトＸ",
    },
    category: "mega-stones",
    megaStoneFor: "charizard",
  },
  "rocky-helmet": {
    id: "rocky-helmet",
    name: {
      en: "Rocky Helmet",
      ja: "ゴツゴツメット",
    },
    category: "held-items",
  },
  "life-orb": {
    id: "life-orb",
    name: {
      en: "Life Orb",
      ja: "いのちのたま",
    },
    category: "held-items",
  },
  leftovers: {
    id: "leftovers",
    name: {
      en: "Leftovers",
      ja: "たべのこし",
    },
    category: "held-items",
  },
  "assault-vest": {
    id: "assault-vest",
    name: {
      en: "Assault Vest",
      ja: "とつげきチョッキ",
    },
    category: "held-items",
  },
  "choice-scarf": {
    id: "choice-scarf",
    name: {
      en: "Choice Scarf",
      ja: "こだわりスカーフ",
    },
    category: "choice",
  },
  "black-belt": {
    id: "black-belt",
    name: {
      en: "Black Belt",
      ja: "くろおび",
    },
    category: "type-enhancement",
  },
  "black-glasses": {
    id: "black-glasses",
    name: {
      en: "Black Glasses",
      ja: "くろいメガネ",
    },
    category: "type-enhancement",
  },
  "bright-powder": {
    id: "bright-powder",
    name: {
      en: "Bright Powder",
      ja: "ひかりのこな",
    },
    category: "held-items",
  },
  charcoal: {
    id: "charcoal",
    name: {
      en: "Charcoal",
      ja: "もくたん",
    },
    category: "type-enhancement",
  },
  "dragon-fang": {
    id: "dragon-fang",
    name: {
      en: "Dragon Fang",
      ja: "りゅうのキバ",
    },
    category: "type-enhancement",
  },
  "fairy-feather": {
    id: "fairy-feather",
    name: {
      en: "Fairy Feather",
      ja: "ようせいのハネ",
    },
    category: "held-items",
  },
  "focus-band": {
    id: "focus-band",
    name: {
      en: "Focus Band",
      ja: "きあいのハチマキ",
    },
    category: "held-items",
  },
  "focus-sash": {
    id: "focus-sash",
    name: {
      en: "Focus Sash",
      ja: "きあいのタスキ",
    },
    category: "held-items",
  },
  "hard-stone": {
    id: "hard-stone",
    name: {
      en: "Hard Stone",
      ja: "かたいいし",
    },
    category: "type-enhancement",
  },
  "kings-rock": {
    id: "kings-rock",
    name: {
      en: "King’s Rock",
      ja: "おうじゃのしるし",
    },
    category: "held-items",
  },
  "light-ball": {
    id: "light-ball",
    name: {
      en: "Light Ball",
      ja: "でんきだま",
    },
    category: "species-specific",
  },
  magnet: {
    id: "magnet",
    name: {
      en: "Magnet",
      ja: "じしゃく",
    },
    category: "type-enhancement",
  },
  "mental-herb": {
    id: "mental-herb",
    name: {
      en: "Mental Herb",
      ja: "メンタルハーブ",
    },
    category: "held-items",
  },
  "metal-coat": {
    id: "metal-coat",
    name: {
      en: "Metal Coat",
      ja: "メタルコート",
    },
    category: "type-enhancement",
  },
  "miracle-seed": {
    id: "miracle-seed",
    name: {
      en: "Miracle Seed",
      ja: "きせきのタネ",
    },
    category: "type-enhancement",
  },
  "mystic-water": {
    id: "mystic-water",
    name: {
      en: "Mystic Water",
      ja: "しんぴのしずく",
    },
    category: "type-enhancement",
  },
  "never-melt-ice": {
    id: "never-melt-ice",
    name: {
      en: "Never-Melt Ice",
      ja: "とけないこおり",
    },
    category: "type-enhancement",
  },
  "poison-barb": {
    id: "poison-barb",
    name: {
      en: "Poison Barb",
      ja: "どくバリ",
    },
    category: "type-enhancement",
  },
  "quick-claw": {
    id: "quick-claw",
    name: {
      en: "Quick Claw",
      ja: "せんせいのツメ",
    },
    category: "held-items",
  },
  "scope-lens": {
    id: "scope-lens",
    name: {
      en: "Scope Lens",
      ja: "ピントレンズ",
    },
    category: "held-items",
  },
  "sharp-beak": {
    id: "sharp-beak",
    name: {
      en: "Sharp Beak",
      ja: "するどいくちばし",
    },
    category: "type-enhancement",
  },
  "shell-bell": {
    id: "shell-bell",
    name: {
      en: "Shell Bell",
      ja: "かいがらのすず",
    },
    category: "held-items",
  },
  "silk-scarf": {
    id: "silk-scarf",
    name: {
      en: "Silk Scarf",
      ja: "シルクのスカーフ",
    },
    category: "type-enhancement",
  },
  "silver-powder": {
    id: "silver-powder",
    name: {
      en: "Silver Powder",
      ja: "ぎんのこな",
    },
    category: "type-enhancement",
  },
  "soft-sand": {
    id: "soft-sand",
    name: {
      en: "Soft Sand",
      ja: "やわらかいすな",
    },
    category: "type-enhancement",
  },
  "spell-tag": {
    id: "spell-tag",
    name: {
      en: "Spell Tag",
      ja: "のろいのおふだ",
    },
    category: "type-enhancement",
  },
  "twisted-spoon": {
    id: "twisted-spoon",
    name: {
      en: "Twisted Spoon",
      ja: "まがったスプーン",
    },
    category: "type-enhancement",
  },
  "white-herb": {
    id: "white-herb",
    name: {
      en: "White Herb",
      ja: "しろいハーブ",
    },
    category: "held-items",
  },
  "aspear-berry": {
    id: "aspear-berry",
    name: {
      en: "Aspear Berry",
      ja: "ナナシのみ",
    },
    category: "medicine",
  },
  "babiri-berry": {
    id: "babiri-berry",
    name: {
      en: "Babiri Berry",
      ja: "リリバのみ",
    },
    category: "type-protection",
  },
  "charti-berry": {
    id: "charti-berry",
    name: {
      en: "Charti Berry",
      ja: "ヨロギのみ",
    },
    category: "type-protection",
  },
  "cheri-berry": {
    id: "cheri-berry",
    name: {
      en: "Cheri Berry",
      ja: "クラボのみ",
    },
    category: "medicine",
  },
  "chesto-berry": {
    id: "chesto-berry",
    name: {
      en: "Chesto Berry",
      ja: "カゴのみ",
    },
    category: "medicine",
  },
  "chilan-berry": {
    id: "chilan-berry",
    name: {
      en: "Chilan Berry",
      ja: "ホズのみ",
    },
    category: "type-protection",
  },
  "chople-berry": {
    id: "chople-berry",
    name: {
      en: "Chople Berry",
      ja: "ヨプのみ",
    },
    category: "type-protection",
  },
  "coba-berry": {
    id: "coba-berry",
    name: {
      en: "Coba Berry",
      ja: "バコウのみ",
    },
    category: "type-protection",
  },
  "colbur-berry": {
    id: "colbur-berry",
    name: {
      en: "Colbur Berry",
      ja: "ナモのみ",
    },
    category: "type-protection",
  },
  "haban-berry": {
    id: "haban-berry",
    name: {
      en: "Haban Berry",
      ja: "ハバンのみ",
    },
    category: "type-protection",
  },
  "kasib-berry": {
    id: "kasib-berry",
    name: {
      en: "Kasib Berry",
      ja: "カシブのみ",
    },
    category: "type-protection",
  },
  "kebia-berry": {
    id: "kebia-berry",
    name: {
      en: "Kebia Berry",
      ja: "ビアーのみ",
    },
    category: "type-protection",
  },
  "leppa-berry": {
    id: "leppa-berry",
    name: {
      en: "Leppa Berry",
      ja: "ヒメリのみ",
    },
    category: "medicine",
  },
  "lum-berry": {
    id: "lum-berry",
    name: {
      en: "Lum Berry",
      ja: "ラムのみ",
    },
    category: "medicine",
  },
  "occa-berry": {
    id: "occa-berry",
    name: {
      en: "Occa Berry",
      ja: "オッカのみ",
    },
    category: "type-protection",
  },
  "oran-berry": {
    id: "oran-berry",
    name: {
      en: "Oran Berry",
      ja: "オレンのみ",
    },
    category: "medicine",
  },
  "passho-berry": {
    id: "passho-berry",
    name: {
      en: "Passho Berry",
      ja: "イトケのみ",
    },
    category: "type-protection",
  },
  "payapa-berry": {
    id: "payapa-berry",
    name: {
      en: "Payapa Berry",
      ja: "ウタンのみ",
    },
    category: "type-protection",
  },
  "pecha-berry": {
    id: "pecha-berry",
    name: {
      en: "Pecha Berry",
      ja: "モモンのみ",
    },
    category: "medicine",
  },
  "persim-berry": {
    id: "persim-berry",
    name: {
      en: "Persim Berry",
      ja: "キーのみ",
    },
    category: "medicine",
  },
  "rawst-berry": {
    id: "rawst-berry",
    name: {
      en: "Rawst Berry",
      ja: "チーゴのみ",
    },
    category: "medicine",
  },
  "rindo-berry": {
    id: "rindo-berry",
    name: {
      en: "Rindo Berry",
      ja: "リンドのみ",
    },
    category: "type-protection",
  },
  "roseli-berry": {
    id: "roseli-berry",
    name: {
      en: "Roseli Berry",
      ja: "ロゼルのみ",
    },
    category: "type-protection",
  },
  "shuca-berry": {
    id: "shuca-berry",
    name: {
      en: "Shuca Berry",
      ja: "シュカのみ",
    },
    category: "type-protection",
  },
  "sitrus-berry": {
    id: "sitrus-berry",
    name: {
      en: "Sitrus Berry",
      ja: "オボンのみ",
    },
    category: "medicine",
  },
  "tanga-berry": {
    id: "tanga-berry",
    name: {
      en: "Tanga Berry",
      ja: "タンガのみ",
    },
    category: "type-protection",
  },
  "wacan-berry": {
    id: "wacan-berry",
    name: {
      en: "Wacan Berry",
      ja: "ソクノのみ",
    },
    category: "type-protection",
  },
  "yache-berry": {
    id: "yache-berry",
    name: {
      en: "Yache Berry",
      ja: "ヤチェのみ",
    },
    category: "type-protection",
  },
  "charizardite-y": {
    id: "charizardite-y",
    name: {
      en: "Charizardite Y",
      ja: "リザードナイトＹ",
    },
    category: "mega-stones",
    megaStoneFor: "charizard",
  },
  garchompite: {
    id: "garchompite",
    name: {
      en: "Garchompite",
      ja: "ガブリアスナイト",
    },
    category: "mega-stones",
    megaStoneFor: "garchomp",
  },
  gengarite: {
    id: "gengarite",
    name: {
      en: "Gengarite",
      ja: "ゲンガナイト",
    },
    category: "mega-stones",
    megaStoneFor: "gengar",
  },
} as const;

export type ItemDex = typeof itemDex;
export type ItemId = keyof ItemDex;

// 適合検証（megaStoneFor が派生 SpeciesId を指すため inline satisfies を避け分離する）。
export type _ItemConforms = Assignable<Record<string, ItemBase>, ItemDex>;
