// 生成物（scripts/generate.ts 出力）。手書き編集しない。data/champions・data/languages を直し再生成する。
import type { NameEntry } from "../../types/name.ts";

export const speciesNames = {
  garchomp: {
    id: "garchomp",
    name: {
      en: "Garchomp",
      ja: "ガブリアス",
    },
  },
  dragonite: {
    id: "dragonite",
    name: {
      en: "Dragonite",
      ja: "カイリュー",
    },
  },
  salamence: {
    id: "salamence",
    name: {
      en: "Salamence",
      ja: "ボーマンダ",
    },
  },
  metagross: {
    id: "metagross",
    name: {
      en: "Metagross",
      ja: "メタグロス",
    },
  },
  "rotom-wash": {
    id: "rotom-wash",
    name: {
      en: "Wash Rotom",
      ja: "ウォッシュロトム",
    },
  },
  charizard: {
    id: "charizard",
    name: {
      en: "Charizard",
      ja: "リザードン",
    },
  },
  mewtwo: {
    id: "mewtwo",
    name: {
      en: "Mewtwo",
      ja: "ミュウツー",
    },
  },
  dragapult: {
    id: "dragapult",
    name: {
      en: "Dragapult",
      ja: "ドラパルト",
    },
  },
  hydreigon: {
    id: "hydreigon",
    name: {
      en: "Hydreigon",
      ja: "サザンドラ",
    },
  },
  aggron: {
    id: "aggron",
    name: {
      en: "Aggron",
      ja: "ボスゴドラ",
    },
  },
  alakazam: {
    id: "alakazam",
    name: {
      en: "Alakazam",
      ja: "フーディン",
    },
  },
  arcanine: {
    id: "arcanine",
    name: {
      en: "Arcanine",
      ja: "ウインディ",
    },
  },
  blastoise: {
    id: "blastoise",
    name: {
      en: "Blastoise",
      ja: "カメックス",
    },
  },
  chandelure: {
    id: "chandelure",
    name: {
      en: "Chandelure",
      ja: "シャンデラ",
    },
  },
  corviknight: {
    id: "corviknight",
    name: {
      en: "Corviknight",
      ja: "アーマーガア",
    },
  },
  decidueye: {
    id: "decidueye",
    name: {
      en: "Decidueye",
      ja: "ジュナイパー",
    },
  },
  excadrill: {
    id: "excadrill",
    name: {
      en: "Excadrill",
      ja: "ドリュウズ",
    },
  },
  garganacl: {
    id: "garganacl",
    name: {
      en: "Garganacl",
      ja: "キョジオーン",
    },
  },
  gengar: {
    id: "gengar",
    name: {
      en: "Gengar",
      ja: "ゲンガー",
    },
  },
  greninja: {
    id: "greninja",
    name: {
      en: "Greninja",
      ja: "ゲッコウガ",
    },
  },
  heracross: {
    id: "heracross",
    name: {
      en: "Heracross",
      ja: "ヘラクロス",
    },
  },
  krookodile: {
    id: "krookodile",
    name: {
      en: "Krookodile",
      ja: "ワルビアル",
    },
  },
  lucario: {
    id: "lucario",
    name: {
      en: "Lucario",
      ja: "ルカリオ",
    },
  },
  meowscarada: {
    id: "meowscarada",
    name: {
      en: "Meowscarada",
      ja: "マスカーニャ",
    },
  },
  milotic: {
    id: "milotic",
    name: {
      en: "Milotic",
      ja: "ミロカロス",
    },
  },
  quaquaval: {
    id: "quaquaval",
    name: {
      en: "Quaquaval",
      ja: "ウェーニバル",
    },
  },
  skeledirge: {
    id: "skeledirge",
    name: {
      en: "Skeledirge",
      ja: "ラウドボーン",
    },
  },
  talonflame: {
    id: "talonflame",
    name: {
      en: "Talonflame",
      ja: "ファイアロー",
    },
  },
  tyranitar: {
    id: "tyranitar",
    name: {
      en: "Tyranitar",
      ja: "バンギラス",
    },
  },
} as const satisfies Record<string, NameEntry>;

export type SpeciesNames = typeof speciesNames;
