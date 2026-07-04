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
  aerilate: {
    id: "aerilate",
    name: {
      en: "Aerilate",
      ja: "スカイスキン",
    },
  },
  aftermath: {
    id: "aftermath",
    name: {
      en: "Aftermath",
      ja: "ゆうばく",
    },
  },
  "air-lock": {
    id: "air-lock",
    name: {
      en: "Air Lock",
      ja: "エアロック",
    },
  },
  "anger-shell": {
    id: "anger-shell",
    name: {
      en: "Anger Shell",
      ja: "いかりのこうら",
    },
  },
  anticipation: {
    id: "anticipation",
    name: {
      en: "Anticipation",
      ja: "きけんよち",
    },
  },
  "arena-trap": {
    id: "arena-trap",
    name: {
      en: "Arena Trap",
      ja: "ありじごく",
    },
  },
  "armor-tail": {
    id: "armor-tail",
    name: {
      en: "Armor Tail",
      ja: "テイルアーマー",
    },
  },
  "aroma-veil": {
    id: "aroma-veil",
    name: {
      en: "Aroma Veil",
      ja: "アロマベール",
    },
  },
  "as-one-glastrier": {
    id: "as-one-glastrier",
    name: {
      en: "As One",
      ja: "じんばいったい",
    },
  },
  "as-one-spectrier": {
    id: "as-one-spectrier",
    name: {
      en: "As One",
      ja: "じんばいったい",
    },
  },
  "aura-break": {
    id: "aura-break",
    name: {
      en: "Aura Break",
      ja: "オーラブレイク",
    },
  },
  "bad-dreams": {
    id: "bad-dreams",
    name: {
      en: "Bad Dreams",
      ja: "ナイトメア",
    },
  },
  "ball-fetch": {
    id: "ball-fetch",
    name: {
      en: "Ball Fetch",
      ja: "たまひろい",
    },
  },
  battery: {
    id: "battery",
    name: {
      en: "Battery",
      ja: "バッテリー",
    },
  },
  "battle-bond": {
    id: "battle-bond",
    name: {
      en: "Battle Bond",
      ja: "きずなへんげ",
    },
  },
  "beads-of-ruin": {
    id: "beads-of-ruin",
    name: {
      en: "Beads of Ruin",
      ja: "わざわいのたま",
    },
  },
  "beast-boost": {
    id: "beast-boost",
    name: {
      en: "Beast Boost",
      ja: "ビーストブースト",
    },
  },
  berserk: {
    id: "berserk",
    name: {
      en: "Berserk",
      ja: "ぎゃくじょう",
    },
  },
  "big-pecks": {
    id: "big-pecks",
    name: {
      en: "Big Pecks",
      ja: "はとむね",
    },
  },
  bulletproof: {
    id: "bulletproof",
    name: {
      en: "Bulletproof",
      ja: "ぼうだん",
    },
  },
  "cheek-pouch": {
    id: "cheek-pouch",
    name: {
      en: "Cheek Pouch",
      ja: "ほおぶくろ",
    },
  },
  "chilling-neigh": {
    id: "chilling-neigh",
    name: {
      en: "Chilling Neigh",
      ja: "しろのいななき",
    },
  },
  "cloud-nine": {
    id: "cloud-nine",
    name: {
      en: "Cloud Nine",
      ja: "ノーてんき",
    },
  },
  "color-change": {
    id: "color-change",
    name: {
      en: "Color Change",
      ja: "へんしょく",
    },
  },
  comatose: {
    id: "comatose",
    name: {
      en: "Comatose",
      ja: "ぜったいねむり",
    },
  },
  commander: {
    id: "commander",
    name: {
      en: "Commander",
      ja: "しれいとう",
    },
  },
  "compound-eyes": {
    id: "compound-eyes",
    name: {
      en: "Compound Eyes",
      ja: "ふくがん",
    },
  },
  corrosion: {
    id: "corrosion",
    name: {
      en: "Corrosion",
      ja: "ふしょく",
    },
  },
  costar: {
    id: "costar",
    name: {
      en: "Costar",
      ja: "きょうえん",
    },
  },
  "cotton-down": {
    id: "cotton-down",
    name: {
      en: "Cotton Down",
      ja: "わたげ",
    },
  },
  "cud-chew": {
    id: "cud-chew",
    name: {
      en: "Cud Chew",
      ja: "はんすう",
    },
  },
  "curious-medicine": {
    id: "curious-medicine",
    name: {
      en: "Curious Medicine",
      ja: "きみょうなくすり",
    },
  },
  dancer: {
    id: "dancer",
    name: {
      en: "Dancer",
      ja: "おどりこ",
    },
  },
  "dark-aura": {
    id: "dark-aura",
    name: {
      en: "Dark Aura",
      ja: "ダークオーラ",
    },
  },
  "dauntless-shield": {
    id: "dauntless-shield",
    name: {
      en: "Dauntless Shield",
      ja: "ふくつのたて",
    },
  },
  dazzling: {
    id: "dazzling",
    name: {
      en: "Dazzling",
      ja: "ビビッドボディ",
    },
  },
  defeatist: {
    id: "defeatist",
    name: {
      en: "Defeatist",
      ja: "よわき",
    },
  },
  "delta-stream": {
    id: "delta-stream",
    name: {
      en: "Delta Stream",
      ja: "デルタストリーム",
    },
  },
  "desolate-land": {
    id: "desolate-land",
    name: {
      en: "Desolate Land",
      ja: "おわりのだいち",
    },
  },
  disguise: {
    id: "disguise",
    name: {
      en: "Disguise",
      ja: "ばけのかわ",
    },
  },
  download: {
    id: "download",
    name: {
      en: "Download",
      ja: "ダウンロード",
    },
  },
  dragonize: {
    id: "dragonize",
    name: {
      en: "Dragonize",
      ja: "ドラゴンスキン",
    },
  },
  "dragons-maw": {
    id: "dragons-maw",
    name: {
      en: "Dragon’s Maw",
      ja: "りゅうのあぎと",
    },
  },
  drizzle: {
    id: "drizzle",
    name: {
      en: "Drizzle",
      ja: "あめふらし",
    },
  },
  "dry-skin": {
    id: "dry-skin",
    name: {
      en: "Dry Skin",
      ja: "かんそうはだ",
    },
  },
  "early-bird": {
    id: "early-bird",
    name: {
      en: "Early Bird",
      ja: "はやおき",
    },
  },
  "earth-eater": {
    id: "earth-eater",
    name: {
      en: "Earth Eater",
      ja: "どしょく",
    },
  },
  "electric-surge": {
    id: "electric-surge",
    name: {
      en: "Electric Surge",
      ja: "エレキメイカー",
    },
  },
  electromorphosis: {
    id: "electromorphosis",
    name: {
      en: "Electromorphosis",
      ja: "でんきにかえる",
    },
  },
  "embody-aspect": {
    id: "embody-aspect",
    name: {
      en: "Embody Aspect",
      ja: "おもかげやどし",
    },
  },
  "emergency-exit": {
    id: "emergency-exit",
    name: {
      en: "Emergency Exit",
      ja: "ききかいひ",
    },
  },
  "fairy-aura": {
    id: "fairy-aura",
    name: {
      en: "Fairy Aura",
      ja: "フェアリーオーラ",
    },
  },
  filter: {
    id: "filter",
    name: {
      en: "Filter",
      ja: "フィルター",
    },
  },
  "flare-boost": {
    id: "flare-boost",
    name: {
      en: "Flare Boost",
      ja: "ねつぼうそう",
    },
  },
  "flower-gift": {
    id: "flower-gift",
    name: {
      en: "Flower Gift",
      ja: "フラワーギフト",
    },
  },
  "flower-veil": {
    id: "flower-veil",
    name: {
      en: "Flower Veil",
      ja: "フラワーベール",
    },
  },
  forecast: {
    id: "forecast",
    name: {
      en: "Forecast",
      ja: "てんきや",
    },
  },
  "friend-guard": {
    id: "friend-guard",
    name: {
      en: "Friend Guard",
      ja: "フレンドガード",
    },
  },
  "full-metal-body": {
    id: "full-metal-body",
    name: {
      en: "Full Metal Body",
      ja: "メタルプロテクト",
    },
  },
  "fur-coat": {
    id: "fur-coat",
    name: {
      en: "Fur Coat",
      ja: "ファーコート",
    },
  },
  galvanize: {
    id: "galvanize",
    name: {
      en: "Galvanize",
      ja: "エレキスキン",
    },
  },
  gluttony: {
    id: "gluttony",
    name: {
      en: "Gluttony",
      ja: "くいしんぼう",
    },
  },
  gooey: {
    id: "gooey",
    name: {
      en: "Gooey",
      ja: "ぬめぬめ",
    },
  },
  "gorilla-tactics": {
    id: "gorilla-tactics",
    name: {
      en: "Gorilla Tactics",
      ja: "ごりむちゅう",
    },
  },
  "grass-pelt": {
    id: "grass-pelt",
    name: {
      en: "Grass Pelt",
      ja: "くさのけがわ",
    },
  },
  "grassy-surge": {
    id: "grassy-surge",
    name: {
      en: "Grassy Surge",
      ja: "グラスメイカー",
    },
  },
  "grim-neigh": {
    id: "grim-neigh",
    name: {
      en: "Grim Neigh",
      ja: "くろのいななき",
    },
  },
  "guard-dog": {
    id: "guard-dog",
    name: {
      en: "Guard Dog",
      ja: "ばんけん",
    },
  },
  "gulp-missile": {
    id: "gulp-missile",
    name: {
      en: "Gulp Missile",
      ja: "うのミサイル",
    },
  },
  "hadron-engine": {
    id: "hadron-engine",
    name: {
      en: "Hadron Engine",
      ja: "ハドロンエンジン",
    },
  },
  harvest: {
    id: "harvest",
    name: {
      en: "Harvest",
      ja: "しゅうかく",
    },
  },
  healer: {
    id: "healer",
    name: {
      en: "Healer",
      ja: "いやしのこころ",
    },
  },
  heatproof: {
    id: "heatproof",
    name: {
      en: "Heatproof",
      ja: "たいねつ",
    },
  },
  "honey-gather": {
    id: "honey-gather",
    name: {
      en: "Honey Gather",
      ja: "みつあつめ",
    },
  },
  hospitality: {
    id: "hospitality",
    name: {
      en: "Hospitality",
      ja: "おもてなし",
    },
  },
  "hunger-switch": {
    id: "hunger-switch",
    name: {
      en: "Hunger Switch",
      ja: "はらぺこスイッチ",
    },
  },
  hustle: {
    id: "hustle",
    name: {
      en: "Hustle",
      ja: "はりきり",
    },
  },
  hydration: {
    id: "hydration",
    name: {
      en: "Hydration",
      ja: "うるおいボディ",
    },
  },
  "ice-body": {
    id: "ice-body",
    name: {
      en: "Ice Body",
      ja: "アイスボディ",
    },
  },
  "ice-face": {
    id: "ice-face",
    name: {
      en: "Ice Face",
      ja: "アイスフェイス",
    },
  },
  "ice-scales": {
    id: "ice-scales",
    name: {
      en: "Ice Scales",
      ja: "こおりのりんぷん",
    },
  },
  illusion: {
    id: "illusion",
    name: {
      en: "Illusion",
      ja: "イリュージョン",
    },
  },
  immunity: {
    id: "immunity",
    name: {
      en: "Immunity",
      ja: "めんえき",
    },
  },
  imposter: {
    id: "imposter",
    name: {
      en: "Imposter",
      ja: "かわりもの",
    },
  },
  "innards-out": {
    id: "innards-out",
    name: {
      en: "Innards Out",
      ja: "とびだすなかみ",
    },
  },
  insomnia: {
    id: "insomnia",
    name: {
      en: "Insomnia",
      ja: "ふみん",
    },
  },
  "intrepid-sword": {
    id: "intrepid-sword",
    name: {
      en: "Intrepid Sword",
      ja: "ふとうのけん",
    },
  },
  "iron-barbs": {
    id: "iron-barbs",
    name: {
      en: "Iron Barbs",
      ja: "てつのトゲ",
    },
  },
  "iron-fist": {
    id: "iron-fist",
    name: {
      en: "Iron Fist",
      ja: "てつのこぶし",
    },
  },
  "keen-eye": {
    id: "keen-eye",
    name: {
      en: "Keen Eye",
      ja: "するどいめ",
    },
  },
  klutz: {
    id: "klutz",
    name: {
      en: "Klutz",
      ja: "ぶきよう",
    },
  },
  "leaf-guard": {
    id: "leaf-guard",
    name: {
      en: "Leaf Guard",
      ja: "リーフガード",
    },
  },
  libero: {
    id: "libero",
    name: {
      en: "Libero",
      ja: "リベロ",
    },
  },
  limber: {
    id: "limber",
    name: {
      en: "Limber",
      ja: "じゅうなん",
    },
  },
  "lingering-aroma": {
    id: "lingering-aroma",
    name: {
      en: "Lingering Aroma",
      ja: "とれないにおい",
    },
  },
  "liquid-ooze": {
    id: "liquid-ooze",
    name: {
      en: "Liquid Ooze",
      ja: "ヘドロえき",
    },
  },
  "liquid-voice": {
    id: "liquid-voice",
    name: {
      en: "Liquid Voice",
      ja: "うるおいボイス",
    },
  },
  "magic-bounce": {
    id: "magic-bounce",
    name: {
      en: "Magic Bounce",
      ja: "マジックミラー",
    },
  },
  magician: {
    id: "magician",
    name: {
      en: "Magician",
      ja: "マジシャン",
    },
  },
  "magma-armor": {
    id: "magma-armor",
    name: {
      en: "Magma Armor",
      ja: "マグマのよろい",
    },
  },
  "magnet-pull": {
    id: "magnet-pull",
    name: {
      en: "Magnet Pull",
      ja: "じりょく",
    },
  },
  "mega-launcher": {
    id: "mega-launcher",
    name: {
      en: "Mega Launcher",
      ja: "メガランチャー",
    },
  },
  "mega-sol": {
    id: "mega-sol",
    name: {
      en: "Mega Sol",
      ja: "メガソーラー",
    },
  },
  merciless: {
    id: "merciless",
    name: {
      en: "Merciless",
      ja: "ひとでなし",
    },
  },
  mimicry: {
    id: "mimicry",
    name: {
      en: "Mimicry",
      ja: "ぎたい",
    },
  },
  "minds-eye": {
    id: "minds-eye",
    name: {
      en: "Mind’s Eye",
      ja: "しんがん",
    },
  },
  minus: {
    id: "minus",
    name: {
      en: "Minus",
      ja: "マイナス",
    },
  },
  "misty-surge": {
    id: "misty-surge",
    name: {
      en: "Misty Surge",
      ja: "ミストメイカー",
    },
  },
  moody: {
    id: "moody",
    name: {
      en: "Moody",
      ja: "ムラっけ",
    },
  },
  "motor-drive": {
    id: "motor-drive",
    name: {
      en: "Motor Drive",
      ja: "でんきエンジン",
    },
  },
  multitype: {
    id: "multitype",
    name: {
      en: "Multitype",
      ja: "マルチタイプ",
    },
  },
  mummy: {
    id: "mummy",
    name: {
      en: "Mummy",
      ja: "ミイラ",
    },
  },
  "mycelium-might": {
    id: "mycelium-might",
    name: {
      en: "Mycelium Might",
      ja: "きんしのちから",
    },
  },
  neuroforce: {
    id: "neuroforce",
    name: {
      en: "Neuroforce",
      ja: "ブレインフォース",
    },
  },
  "neutralizing-gas": {
    id: "neutralizing-gas",
    name: {
      en: "Neutralizing Gas",
      ja: "かがくへんかガス",
    },
  },
  "no-guard": {
    id: "no-guard",
    name: {
      en: "No Guard",
      ja: "ノーガード",
    },
  },
  normalize: {
    id: "normalize",
    name: {
      en: "Normalize",
      ja: "ノーマルスキン",
    },
  },
  oblivious: {
    id: "oblivious",
    name: {
      en: "Oblivious",
      ja: "どんかん",
    },
  },
  opportunist: {
    id: "opportunist",
    name: {
      en: "Opportunist",
      ja: "びんじょう",
    },
  },
  "orichalcum-pulse": {
    id: "orichalcum-pulse",
    name: {
      en: "Orichalcum Pulse",
      ja: "ひひいろのこどう",
    },
  },
  overcoat: {
    id: "overcoat",
    name: {
      en: "Overcoat",
      ja: "ぼうじん",
    },
  },
  "own-tempo": {
    id: "own-tempo",
    name: {
      en: "Own Tempo",
      ja: "マイペース",
    },
  },
  "parental-bond": {
    id: "parental-bond",
    name: {
      en: "Parental Bond",
      ja: "おやこあい",
    },
  },
  "pastel-veil": {
    id: "pastel-veil",
    name: {
      en: "Pastel Veil",
      ja: "パステルベール",
    },
  },
  "perish-body": {
    id: "perish-body",
    name: {
      en: "Perish Body",
      ja: "ほろびのボディ",
    },
  },
  pickup: {
    id: "pickup",
    name: {
      en: "Pickup",
      ja: "ものひろい",
    },
  },
  "piercing-drill": {
    id: "piercing-drill",
    name: {
      en: "Piercing Drill",
      ja: "かんつうドリル",
    },
  },
  pixilate: {
    id: "pixilate",
    name: {
      en: "Pixilate",
      ja: "フェアリースキン",
    },
  },
  plus: {
    id: "plus",
    name: {
      en: "Plus",
      ja: "プラス",
    },
  },
  "poison-heal": {
    id: "poison-heal",
    name: {
      en: "Poison Heal",
      ja: "ポイズンヒール",
    },
  },
  "poison-puppeteer": {
    id: "poison-puppeteer",
    name: {
      en: "Poison Puppeteer",
      ja: "どくくぐつ",
    },
  },
  "power-construct": {
    id: "power-construct",
    name: {
      en: "Power Construct",
      ja: "スワームチェンジ",
    },
  },
  "power-of-alchemy": {
    id: "power-of-alchemy",
    name: {
      en: "Power of Alchemy",
      ja: "かがくのちから",
    },
  },
  "power-spot": {
    id: "power-spot",
    name: {
      en: "Power Spot",
      ja: "パワースポット",
    },
  },
  "primordial-sea": {
    id: "primordial-sea",
    name: {
      en: "Primordial Sea",
      ja: "はじまりのうみ",
    },
  },
  "prism-armor": {
    id: "prism-armor",
    name: {
      en: "Prism Armor",
      ja: "プリズムアーマー",
    },
  },
  "propeller-tail": {
    id: "propeller-tail",
    name: {
      en: "Propeller Tail",
      ja: "スクリューおびれ",
    },
  },
  protosynthesis: {
    id: "protosynthesis",
    name: {
      en: "Protosynthesis",
      ja: "こだいかっせい",
    },
  },
  "psychic-surge": {
    id: "psychic-surge",
    name: {
      en: "Psychic Surge",
      ja: "サイコメイカー",
    },
  },
  "punk-rock": {
    id: "punk-rock",
    name: {
      en: "Punk Rock",
      ja: "パンクロック",
    },
  },
  "pure-power": {
    id: "pure-power",
    name: {
      en: "Pure Power",
      ja: "ヨガパワー",
    },
  },
  "quark-drive": {
    id: "quark-drive",
    name: {
      en: "Quark Drive",
      ja: "クォークチャージ",
    },
  },
  "queenly-majesty": {
    id: "queenly-majesty",
    name: {
      en: "Queenly Majesty",
      ja: "じょおうのいげん",
    },
  },
  "quick-draw": {
    id: "quick-draw",
    name: {
      en: "Quick Draw",
      ja: "クイックドロウ",
    },
  },
  "quick-feet": {
    id: "quick-feet",
    name: {
      en: "Quick Feet",
      ja: "はやあし",
    },
  },
  rattled: {
    id: "rattled",
    name: {
      en: "Rattled",
      ja: "びびり",
    },
  },
  receiver: {
    id: "receiver",
    name: {
      en: "Receiver",
      ja: "レシーバー",
    },
  },
  refrigerate: {
    id: "refrigerate",
    name: {
      en: "Refrigerate",
      ja: "フリーズスキン",
    },
  },
  regenerator: {
    id: "regenerator",
    name: {
      en: "Regenerator",
      ja: "さいせいりょく",
    },
  },
  ripen: {
    id: "ripen",
    name: {
      en: "Ripen",
      ja: "じゅくせい",
    },
  },
  "rks-system": {
    id: "rks-system",
    name: {
      en: "RKS System",
      ja: "ＡＲシステム",
    },
  },
  "rocky-payload": {
    id: "rocky-payload",
    name: {
      en: "Rocky Payload",
      ja: "いわはこび",
    },
  },
  "run-away": {
    id: "run-away",
    name: {
      en: "Run Away",
      ja: "にげあし",
    },
  },
  "sand-spit": {
    id: "sand-spit",
    name: {
      en: "Sand Spit",
      ja: "すなはき",
    },
  },
  "sap-sipper": {
    id: "sap-sipper",
    name: {
      en: "Sap Sipper",
      ja: "そうしょく",
    },
  },
  schooling: {
    id: "schooling",
    name: {
      en: "Schooling",
      ja: "ぎょぐん",
    },
  },
  scrappy: {
    id: "scrappy",
    name: {
      en: "Scrappy",
      ja: "きもったま",
    },
  },
  "screen-cleaner": {
    id: "screen-cleaner",
    name: {
      en: "Screen Cleaner",
      ja: "バリアフリー",
    },
  },
  "seed-sower": {
    id: "seed-sower",
    name: {
      en: "Seed Sower",
      ja: "こぼれダネ",
    },
  },
  "serene-grace": {
    id: "serene-grace",
    name: {
      en: "Serene Grace",
      ja: "てんのめぐみ",
    },
  },
  "shadow-shield": {
    id: "shadow-shield",
    name: {
      en: "Shadow Shield",
      ja: "ファントムガード",
    },
  },
  sharpness: {
    id: "sharpness",
    name: {
      en: "Sharpness",
      ja: "きれあじ",
    },
  },
  "shell-armor": {
    id: "shell-armor",
    name: {
      en: "Shell Armor",
      ja: "シェルアーマー",
    },
  },
  "shield-dust": {
    id: "shield-dust",
    name: {
      en: "Shield Dust",
      ja: "りんぷん",
    },
  },
  "shields-down": {
    id: "shields-down",
    name: {
      en: "Shields Down",
      ja: "リミットシールド",
    },
  },
  simple: {
    id: "simple",
    name: {
      en: "Simple",
      ja: "たんじゅん",
    },
  },
  "skill-link": {
    id: "skill-link",
    name: {
      en: "Skill Link",
      ja: "スキルリンク",
    },
  },
  "slow-start": {
    id: "slow-start",
    name: {
      en: "Slow Start",
      ja: "スロースタート",
    },
  },
  "slush-rush": {
    id: "slush-rush",
    name: {
      en: "Slush Rush",
      ja: "ゆきかき",
    },
  },
  "snow-cloak": {
    id: "snow-cloak",
    name: {
      en: "Snow Cloak",
      ja: "ゆきがくれ",
    },
  },
  "snow-warning": {
    id: "snow-warning",
    name: {
      en: "Snow Warning",
      ja: "ゆきふらし",
    },
  },
  "solid-rock": {
    id: "solid-rock",
    name: {
      en: "Solid Rock",
      ja: "ハードロック",
    },
  },
  "soul-heart": {
    id: "soul-heart",
    name: {
      en: "Soul-Heart",
      ja: "ソウルハート",
    },
  },
  soundproof: {
    id: "soundproof",
    name: {
      en: "Soundproof",
      ja: "ぼうおん",
    },
  },
  "spicy-spray": {
    id: "spicy-spray",
    name: {
      en: "Spicy Spray",
      ja: "とびだすハバネロ",
    },
  },
  stakeout: {
    id: "stakeout",
    name: {
      en: "Stakeout",
      ja: "はりこみ",
    },
  },
  stall: {
    id: "stall",
    name: {
      en: "Stall",
      ja: "あとだし",
    },
  },
  stalwart: {
    id: "stalwart",
    name: {
      en: "Stalwart",
      ja: "すじがねいり",
    },
  },
  stamina: {
    id: "stamina",
    name: {
      en: "Stamina",
      ja: "じきゅうりょく",
    },
  },
  "stance-change": {
    id: "stance-change",
    name: {
      en: "Stance Change",
      ja: "バトルスイッチ",
    },
  },
  static: {
    id: "static",
    name: {
      en: "Static",
      ja: "せいでんき",
    },
  },
  "steam-engine": {
    id: "steam-engine",
    name: {
      en: "Steam Engine",
      ja: "じょうききかん",
    },
  },
  steelworker: {
    id: "steelworker",
    name: {
      en: "Steelworker",
      ja: "はがねつかい",
    },
  },
  "steely-spirit": {
    id: "steely-spirit",
    name: {
      en: "Steely Spirit",
      ja: "はがねのせいしん",
    },
  },
  stench: {
    id: "stench",
    name: {
      en: "Stench",
      ja: "あくしゅう",
    },
  },
  "sticky-hold": {
    id: "sticky-hold",
    name: {
      en: "Sticky Hold",
      ja: "ねんちゃく",
    },
  },
  "storm-drain": {
    id: "storm-drain",
    name: {
      en: "Storm Drain",
      ja: "よびみず",
    },
  },
  "strong-jaw": {
    id: "strong-jaw",
    name: {
      en: "Strong Jaw",
      ja: "がんじょうあご",
    },
  },
  "super-luck": {
    id: "super-luck",
    name: {
      en: "Super Luck",
      ja: "きょううん",
    },
  },
  "supersweet-syrup": {
    id: "supersweet-syrup",
    name: {
      en: "Supersweet Syrup",
      ja: "かんろなミツ",
    },
  },
  "supreme-overlord": {
    id: "supreme-overlord",
    name: {
      en: "Supreme Overlord",
      ja: "そうだいしょう",
    },
  },
  "surge-surfer": {
    id: "surge-surfer",
    name: {
      en: "Surge Surfer",
      ja: "サーフテール",
    },
  },
  "sweet-veil": {
    id: "sweet-veil",
    name: {
      en: "Sweet Veil",
      ja: "スイートベール",
    },
  },
  "sword-of-ruin": {
    id: "sword-of-ruin",
    name: {
      en: "Sword of Ruin",
      ja: "わざわいのつるぎ",
    },
  },
  symbiosis: {
    id: "symbiosis",
    name: {
      en: "Symbiosis",
      ja: "きょうせい",
    },
  },
  "tablets-of-ruin": {
    id: "tablets-of-ruin",
    name: {
      en: "Tablets of Ruin",
      ja: "わざわいのおふだ",
    },
  },
  "tangled-feet": {
    id: "tangled-feet",
    name: {
      en: "Tangled Feet",
      ja: "ちどりあし",
    },
  },
  "tangling-hair": {
    id: "tangling-hair",
    name: {
      en: "Tangling Hair",
      ja: "カーリーヘアー",
    },
  },
  technician: {
    id: "technician",
    name: {
      en: "Technician",
      ja: "テクニシャン",
    },
  },
  "tera-shell": {
    id: "tera-shell",
    name: {
      en: "Tera Shell",
      ja: "テラスシェル",
    },
  },
  "tera-shift": {
    id: "tera-shift",
    name: {
      en: "Tera Shift",
      ja: "テラスチェンジ",
    },
  },
  "teraform-zero": {
    id: "teraform-zero",
    name: {
      en: "Teraform Zero",
      ja: "ゼロフォーミング",
    },
  },
  teravolt: {
    id: "teravolt",
    name: {
      en: "Teravolt",
      ja: "テラボルテージ",
    },
  },
  "thermal-exchange": {
    id: "thermal-exchange",
    name: {
      en: "Thermal Exchange",
      ja: "ねつこうかん",
    },
  },
  "thick-fat": {
    id: "thick-fat",
    name: {
      en: "Thick Fat",
      ja: "あついしぼう",
    },
  },
  "tinted-lens": {
    id: "tinted-lens",
    name: {
      en: "Tinted Lens",
      ja: "いろめがね",
    },
  },
  "toxic-boost": {
    id: "toxic-boost",
    name: {
      en: "Toxic Boost",
      ja: "どくぼうそう",
    },
  },
  "toxic-chain": {
    id: "toxic-chain",
    name: {
      en: "Toxic Chain",
      ja: "どくのくさり",
    },
  },
  "toxic-debris": {
    id: "toxic-debris",
    name: {
      en: "Toxic Debris",
      ja: "どくげしょう",
    },
  },
  trace: {
    id: "trace",
    name: {
      en: "Trace",
      ja: "トレース",
    },
  },
  transistor: {
    id: "transistor",
    name: {
      en: "Transistor",
      ja: "トランジスタ",
    },
  },
  triage: {
    id: "triage",
    name: {
      en: "Triage",
      ja: "ヒーリングシフト",
    },
  },
  truant: {
    id: "truant",
    name: {
      en: "Truant",
      ja: "なまけ",
    },
  },
  turboblaze: {
    id: "turboblaze",
    name: {
      en: "Turboblaze",
      ja: "ターボブレイズ",
    },
  },
  "unseen-fist": {
    id: "unseen-fist",
    name: {
      en: "Unseen Fist",
      ja: "ふかしのこぶし",
    },
  },
  "vessel-of-ruin": {
    id: "vessel-of-ruin",
    name: {
      en: "Vessel of Ruin",
      ja: "わざわいのうつわ",
    },
  },
  "victory-star": {
    id: "victory-star",
    name: {
      en: "Victory Star",
      ja: "しょうりのほし",
    },
  },
  "volt-absorb": {
    id: "volt-absorb",
    name: {
      en: "Volt Absorb",
      ja: "ちくでん",
    },
  },
  "wandering-spirit": {
    id: "wandering-spirit",
    name: {
      en: "Wandering Spirit",
      ja: "さまようたましい",
    },
  },
  "water-absorb": {
    id: "water-absorb",
    name: {
      en: "Water Absorb",
      ja: "ちょすい",
    },
  },
  "water-bubble": {
    id: "water-bubble",
    name: {
      en: "Water Bubble",
      ja: "すいほう",
    },
  },
  "water-compaction": {
    id: "water-compaction",
    name: {
      en: "Water Compaction",
      ja: "みずがため",
    },
  },
  "water-veil": {
    id: "water-veil",
    name: {
      en: "Water Veil",
      ja: "みずのベール",
    },
  },
  "weak-armor": {
    id: "weak-armor",
    name: {
      en: "Weak Armor",
      ja: "くだけるよろい",
    },
  },
  "well-baked-body": {
    id: "well-baked-body",
    name: {
      en: "Well-Baked Body",
      ja: "こんがりボディ",
    },
  },
  "white-smoke": {
    id: "white-smoke",
    name: {
      en: "White Smoke",
      ja: "しろいけむり",
    },
  },
  "wimp-out": {
    id: "wimp-out",
    name: {
      en: "Wimp Out",
      ja: "にげごし",
    },
  },
  "wind-power": {
    id: "wind-power",
    name: {
      en: "Wind Power",
      ja: "ふうりょくでんき",
    },
  },
  "wind-rider": {
    id: "wind-rider",
    name: {
      en: "Wind Rider",
      ja: "かぜのり",
    },
  },
  "wonder-guard": {
    id: "wonder-guard",
    name: {
      en: "Wonder Guard",
      ja: "ふしぎなまもり",
    },
  },
  "wonder-skin": {
    id: "wonder-skin",
    name: {
      en: "Wonder Skin",
      ja: "ミラクルスキン",
    },
  },
  "zen-mode": {
    id: "zen-mode",
    name: {
      en: "Zen Mode",
      ja: "ダルマモード",
    },
  },
  "zero-to-hero": {
    id: "zero-to-hero",
    name: {
      en: "Zero to Hero",
      ja: "マイティチェンジ",
    },
  },
} as const satisfies Record<string, NameEntry>;

export type AbilityNames = typeof abilityNames;
