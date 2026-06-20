// 生成物（scripts/generate.ts 出力）。手書き編集しない。data/champions・data/languages を直し再生成する。
import type { NameEntry } from "../../../src/types/name.ts";

export const moveNames = {
  earthquake: {
    id: "earthquake",
    name: {
      en: "Earthquake",
      ja: "じしん",
    },
  },
  "dragon-claw": {
    id: "dragon-claw",
    name: {
      en: "Dragon Claw",
      ja: "ドラゴンクロー",
    },
  },
  "stone-edge": {
    id: "stone-edge",
    name: {
      en: "Stone Edge",
      ja: "ストーンエッジ",
    },
  },
  "swords-dance": {
    id: "swords-dance",
    name: {
      en: "Swords Dance",
      ja: "つるぎのまい",
    },
  },
  outrage: {
    id: "outrage",
    name: {
      en: "Outrage",
      ja: "げきりん",
    },
  },
  "fire-punch": {
    id: "fire-punch",
    name: {
      en: "Fire Punch",
      ja: "ほのおのパンチ",
    },
  },
  "extreme-speed": {
    id: "extreme-speed",
    name: {
      en: "Extreme Speed",
      ja: "しんそく",
    },
  },
  "draco-meteor": {
    id: "draco-meteor",
    name: {
      en: "Draco Meteor",
      ja: "りゅうせいぐん",
    },
  },
  "fire-blast": {
    id: "fire-blast",
    name: {
      en: "Fire Blast",
      ja: "だいもんじ",
    },
  },
  roost: {
    id: "roost",
    name: {
      en: "Roost",
      ja: "はねやすめ",
    },
  },
  "meteor-mash": {
    id: "meteor-mash",
    name: {
      en: "Meteor Mash",
      ja: "コメットパンチ",
    },
  },
  "zen-headbutt": {
    id: "zen-headbutt",
    name: {
      en: "Zen Headbutt",
      ja: "しねんのずつき",
    },
  },
  "bullet-punch": {
    id: "bullet-punch",
    name: {
      en: "Bullet Punch",
      ja: "バレットパンチ",
    },
  },
  "hydro-pump": {
    id: "hydro-pump",
    name: {
      en: "Hydro Pump",
      ja: "ハイドロポンプ",
    },
  },
  thunderbolt: {
    id: "thunderbolt",
    name: {
      en: "Thunderbolt",
      ja: "１０まんボルト",
    },
  },
  "volt-switch": {
    id: "volt-switch",
    name: {
      en: "Volt Switch",
      ja: "ボルトチェンジ",
    },
  },
  "will-o-wisp": {
    id: "will-o-wisp",
    name: {
      en: "Will-O-Wisp",
      ja: "おにび",
    },
  },
  "flare-blitz": {
    id: "flare-blitz",
    name: {
      en: "Flare Blitz",
      ja: "フレアドライブ",
    },
  },
  psystrike: {
    id: "psystrike",
    name: {
      en: "Psystrike",
      ja: "サイコブレイク",
    },
  },
  "ice-beam": {
    id: "ice-beam",
    name: {
      en: "Ice Beam",
      ja: "れいとうビーム",
    },
  },
  "shadow-ball": {
    id: "shadow-ball",
    name: {
      en: "Shadow Ball",
      ja: "シャドーボール",
    },
  },
  "dark-pulse": {
    id: "dark-pulse",
    name: {
      en: "Dark Pulse",
      ja: "あくのはどう",
    },
  },
  "nasty-plot": {
    id: "nasty-plot",
    name: {
      en: "Nasty Plot",
      ja: "わるだくみ",
    },
  },
  acrobatics: {
    id: "acrobatics",
    name: {
      en: "Acrobatics",
      ja: "アクロバット",
    },
  },
  "aerial-ace": {
    id: "aerial-ace",
    name: {
      en: "Aerial Ace",
      ja: "つばめがえし",
    },
  },
  "air-slash": {
    id: "air-slash",
    name: {
      en: "Air Slash",
      ja: "エアスラッシュ",
    },
  },
  "aqua-jet": {
    id: "aqua-jet",
    name: {
      en: "Aqua Jet",
      ja: "アクアジェット",
    },
  },
  "aqua-step": {
    id: "aqua-step",
    name: {
      en: "Aqua Step",
      ja: "アクアステップ",
    },
  },
  "aqua-tail": {
    id: "aqua-tail",
    name: {
      en: "Aqua Tail",
      ja: "アクアテール",
    },
  },
  "aura-sphere": {
    id: "aura-sphere",
    name: {
      en: "Aura Sphere",
      ja: "はどうだん",
    },
  },
  "body-press": {
    id: "body-press",
    name: {
      en: "Body Press",
      ja: "ボディプレス",
    },
  },
  "brave-bird": {
    id: "brave-bird",
    name: {
      en: "Brave Bird",
      ja: "ブレイブバード",
    },
  },
  "bug-bite": {
    id: "bug-bite",
    name: {
      en: "Bug Bite",
      ja: "むしくい",
    },
  },
  "bulk-up": {
    id: "bulk-up",
    name: {
      en: "Bulk Up",
      ja: "ビルドアップ",
    },
  },
  "bullet-seed": {
    id: "bullet-seed",
    name: {
      en: "Bullet Seed",
      ja: "タネマシンガン",
    },
  },
  "calm-mind": {
    id: "calm-mind",
    name: {
      en: "Calm Mind",
      ja: "めいそう",
    },
  },
  "close-combat": {
    id: "close-combat",
    name: {
      en: "Close Combat",
      ja: "インファイト",
    },
  },
  crunch: {
    id: "crunch",
    name: {
      en: "Crunch",
      ja: "かみくだく",
    },
  },
  curse: {
    id: "curse",
    name: {
      en: "Curse",
      ja: "のろい",
    },
  },
  "darkest-lariat": {
    id: "darkest-lariat",
    name: {
      en: "Darkest Lariat",
      ja: "ＤＤラリアット",
    },
  },
  "dazzling-gleam": {
    id: "dazzling-gleam",
    name: {
      en: "Dazzling Gleam",
      ja: "マジカルシャイン",
    },
  },
  defog: {
    id: "defog",
    name: {
      en: "Defog",
      ja: "きりばらい",
    },
  },
  "destiny-bond": {
    id: "destiny-bond",
    name: {
      en: "Destiny Bond",
      ja: "みちづれ",
    },
  },
  "disarming-voice": {
    id: "disarming-voice",
    name: {
      en: "Disarming Voice",
      ja: "チャームボイス",
    },
  },
  "dragon-dance": {
    id: "dragon-dance",
    name: {
      en: "Dragon Dance",
      ja: "りゅうのまい",
    },
  },
  "dragon-darts": {
    id: "dragon-darts",
    name: {
      en: "Dragon Darts",
      ja: "ドラゴンアロー",
    },
  },
  "dragon-pulse": {
    id: "dragon-pulse",
    name: {
      en: "Dragon Pulse",
      ja: "りゅうのはどう",
    },
  },
  "dragon-tail": {
    id: "dragon-tail",
    name: {
      en: "Dragon Tail",
      ja: "ドラゴンテール",
    },
  },
  "drain-punch": {
    id: "drain-punch",
    name: {
      en: "Drain Punch",
      ja: "ドレインパンチ",
    },
  },
  "drill-peck": {
    id: "drill-peck",
    name: {
      en: "Drill Peck",
      ja: "ドリルくちばし",
    },
  },
  "drill-run": {
    id: "drill-run",
    name: {
      en: "Drill Run",
      ja: "ドリルライナー",
    },
  },
  "dual-wingbeat": {
    id: "dual-wingbeat",
    name: {
      en: "Dual Wingbeat",
      ja: "ダブルウイング",
    },
  },
  "earth-power": {
    id: "earth-power",
    name: {
      en: "Earth Power",
      ja: "だいちのちから",
    },
  },
  electroweb: {
    id: "electroweb",
    name: {
      en: "Electroweb",
      ja: "エレキネット",
    },
  },
  encore: {
    id: "encore",
    name: {
      en: "Encore",
      ja: "アンコール",
    },
  },
  "energy-ball": {
    id: "energy-ball",
    name: {
      en: "Energy Ball",
      ja: "エナジーボール",
    },
  },
  "expanding-force": {
    id: "expanding-force",
    name: {
      en: "Expanding Force",
      ja: "ワイドフォース",
    },
  },
  extrasensory: {
    id: "extrasensory",
    name: {
      en: "Extrasensory",
      ja: "じんつうりき",
    },
  },
  "fake-out": {
    id: "fake-out",
    name: {
      en: "Fake Out",
      ja: "ねこだまし",
    },
  },
  "fire-fang": {
    id: "fire-fang",
    name: {
      en: "Fire Fang",
      ja: "ほのおのキバ",
    },
  },
  "flame-charge": {
    id: "flame-charge",
    name: {
      en: "Flame Charge",
      ja: "ニトロチャージ",
    },
  },
  flamethrower: {
    id: "flamethrower",
    name: {
      en: "Flamethrower",
      ja: "かえんほうしゃ",
    },
  },
  "flash-cannon": {
    id: "flash-cannon",
    name: {
      en: "Flash Cannon",
      ja: "ラスターカノン",
    },
  },
  "flip-turn": {
    id: "flip-turn",
    name: {
      en: "Flip Turn",
      ja: "クイックターン",
    },
  },
  "flower-trick": {
    id: "flower-trick",
    name: {
      en: "Flower Trick",
      ja: "トリックフラワー",
    },
  },
  "focus-blast": {
    id: "focus-blast",
    name: {
      en: "Focus Blast",
      ja: "きあいだま",
    },
  },
  "grass-knot": {
    id: "grass-knot",
    name: {
      en: "Grass Knot",
      ja: "くさむすび",
    },
  },
  "grassy-glide": {
    id: "grassy-glide",
    name: {
      en: "Grassy Glide",
      ja: "グラススライダー",
    },
  },
  "gunk-shot": {
    id: "gunk-shot",
    name: {
      en: "Gunk Shot",
      ja: "ダストシュート",
    },
  },
  haze: {
    id: "haze",
    name: {
      en: "Haze",
      ja: "くろいきり",
    },
  },
  "heat-wave": {
    id: "heat-wave",
    name: {
      en: "Heat Wave",
      ja: "ねっぷう",
    },
  },
  "heavy-slam": {
    id: "heavy-slam",
    name: {
      en: "Heavy Slam",
      ja: "ヘビーボンバー",
    },
  },
  hex: {
    id: "hex",
    name: {
      en: "Hex",
      ja: "たたりめ",
    },
  },
  "high-horsepower": {
    id: "high-horsepower",
    name: {
      en: "High Horsepower",
      ja: "１０まんばりき",
    },
  },
  "hone-claws": {
    id: "hone-claws",
    name: {
      en: "Hone Claws",
      ja: "つめとぎ",
    },
  },
  hurricane: {
    id: "hurricane",
    name: {
      en: "Hurricane",
      ja: "ぼうふう",
    },
  },
  "hyper-voice": {
    id: "hyper-voice",
    name: {
      en: "Hyper Voice",
      ja: "ハイパーボイス",
    },
  },
  hypnosis: {
    id: "hypnosis",
    name: {
      en: "Hypnosis",
      ja: "さいみんじゅつ",
    },
  },
  "ice-punch": {
    id: "ice-punch",
    name: {
      en: "Ice Punch",
      ja: "れいとうパンチ",
    },
  },
  "ice-spinner": {
    id: "ice-spinner",
    name: {
      en: "Ice Spinner",
      ja: "アイススピナー",
    },
  },
  "icy-wind": {
    id: "icy-wind",
    name: {
      en: "Icy Wind",
      ja: "こごえるかぜ",
    },
  },
  imprison: {
    id: "imprison",
    name: {
      en: "Imprison",
      ja: "ふういん",
    },
  },
  "iron-defense": {
    id: "iron-defense",
    name: {
      en: "Iron Defense",
      ja: "てっぺき",
    },
  },
  "iron-head": {
    id: "iron-head",
    name: {
      en: "Iron Head",
      ja: "アイアンヘッド",
    },
  },
  "knock-off": {
    id: "knock-off",
    name: {
      en: "Knock Off",
      ja: "はたきおとす",
    },
  },
  "leaf-blade": {
    id: "leaf-blade",
    name: {
      en: "Leaf Blade",
      ja: "リーフブレード",
    },
  },
  "leaf-storm": {
    id: "leaf-storm",
    name: {
      en: "Leaf Storm",
      ja: "リーフストーム",
    },
  },
  "life-dew": {
    id: "life-dew",
    name: {
      en: "Life Dew",
      ja: "いのちのしずく",
    },
  },
  liquidation: {
    id: "liquidation",
    name: {
      en: "Liquidation",
      ja: "アクアブレイク",
    },
  },
  "low-kick": {
    id: "low-kick",
    name: {
      en: "Low Kick",
      ja: "けたぐり",
    },
  },
  lunge: {
    id: "lunge",
    name: {
      en: "Lunge",
      ja: "とびかかる",
    },
  },
  megahorn: {
    id: "megahorn",
    name: {
      en: "Megahorn",
      ja: "メガホーン",
    },
  },
  "mirror-coat": {
    id: "mirror-coat",
    name: {
      en: "Mirror Coat",
      ja: "ミラーコート",
    },
  },
  "muddy-water": {
    id: "muddy-water",
    name: {
      en: "Muddy Water",
      ja: "だくりゅう",
    },
  },
  "mystical-fire": {
    id: "mystical-fire",
    name: {
      en: "Mystical Fire",
      ja: "マジカルフレイム",
    },
  },
  "night-slash": {
    id: "night-slash",
    name: {
      en: "Night Slash",
      ja: "つじぎり",
    },
  },
  overheat: {
    id: "overheat",
    name: {
      en: "Overheat",
      ja: "オーバーヒート",
    },
  },
  "pain-split": {
    id: "pain-split",
    name: {
      en: "Pain Split",
      ja: "いたみわけ",
    },
  },
  "phantom-force": {
    id: "phantom-force",
    name: {
      en: "Phantom Force",
      ja: "ゴーストダイブ",
    },
  },
  "pin-missile": {
    id: "pin-missile",
    name: {
      en: "Pin Missile",
      ja: "ミサイルばり",
    },
  },
  "play-rough": {
    id: "play-rough",
    name: {
      en: "Play Rough",
      ja: "じゃれつく",
    },
  },
  "poison-jab": {
    id: "poison-jab",
    name: {
      en: "Poison Jab",
      ja: "どくづき",
    },
  },
  poltergeist: {
    id: "poltergeist",
    name: {
      en: "Poltergeist",
      ja: "ポルターガイスト",
    },
  },
  "power-trip": {
    id: "power-trip",
    name: {
      en: "Power Trip",
      ja: "つけあがる",
    },
  },
  protect: {
    id: "protect",
    name: {
      en: "Protect",
      ja: "まもる",
    },
  },
  psychic: {
    id: "psychic",
    name: {
      en: "Psychic",
      ja: "サイコキネシス",
    },
  },
  "psychic-fangs": {
    id: "psychic-fangs",
    name: {
      en: "Psychic Fangs",
      ja: "サイコファング",
    },
  },
  psyshock: {
    id: "psyshock",
    name: {
      en: "Psyshock",
      ja: "サイコショック",
    },
  },
  "rapid-spin": {
    id: "rapid-spin",
    name: {
      en: "Rapid Spin",
      ja: "こうそくスピン",
    },
  },
  recover: {
    id: "recover",
    name: {
      en: "Recover",
      ja: "じこさいせい",
    },
  },
  roar: {
    id: "roar",
    name: {
      en: "Roar",
      ja: "ほえる",
    },
  },
  "rock-blast": {
    id: "rock-blast",
    name: {
      en: "Rock Blast",
      ja: "ロックブラスト",
    },
  },
  "rock-slide": {
    id: "rock-slide",
    name: {
      en: "Rock Slide",
      ja: "いわなだれ",
    },
  },
  "salt-cure": {
    id: "salt-cure",
    name: {
      en: "Salt Cure",
      ja: "しおづけ",
    },
  },
  scald: {
    id: "scald",
    name: {
      en: "Scald",
      ja: "ねっとう",
    },
  },
  "scale-shot": {
    id: "scale-shot",
    name: {
      en: "Scale Shot",
      ja: "スケイルショット",
    },
  },
  "scorching-sands": {
    id: "scorching-sands",
    name: {
      en: "Scorching Sands",
      ja: "ねっさのだいち",
    },
  },
  "shadow-claw": {
    id: "shadow-claw",
    name: {
      en: "Shadow Claw",
      ja: "シャドークロー",
    },
  },
  "shadow-sneak": {
    id: "shadow-sneak",
    name: {
      en: "Shadow Sneak",
      ja: "かげうち",
    },
  },
  "shell-smash": {
    id: "shell-smash",
    name: {
      en: "Shell Smash",
      ja: "からをやぶる",
    },
  },
  "sludge-bomb": {
    id: "sludge-bomb",
    name: {
      en: "Sludge Bomb",
      ja: "ヘドロばくだん",
    },
  },
  "smart-strike": {
    id: "smart-strike",
    name: {
      en: "Smart Strike",
      ja: "スマートホーン",
    },
  },
  snarl: {
    id: "snarl",
    name: {
      en: "Snarl",
      ja: "バークアウト",
    },
  },
  spikes: {
    id: "spikes",
    name: {
      en: "Spikes",
      ja: "まきびし",
    },
  },
  "spirit-shackle": {
    id: "spirit-shackle",
    name: {
      en: "Spirit Shackle",
      ja: "かげぬい",
    },
  },
  "stealth-rock": {
    id: "stealth-rock",
    name: {
      en: "Stealth Rock",
      ja: "ステルスロック",
    },
  },
  "stomping-tantrum": {
    id: "stomping-tantrum",
    name: {
      en: "Stomping Tantrum",
      ja: "じだんだ",
    },
  },
  substitute: {
    id: "substitute",
    name: {
      en: "Substitute",
      ja: "みがわり",
    },
  },
  "sucker-punch": {
    id: "sucker-punch",
    name: {
      en: "Sucker Punch",
      ja: "ふいうち",
    },
  },
  superpower: {
    id: "superpower",
    name: {
      en: "Superpower",
      ja: "ばかぢから",
    },
  },
  surf: {
    id: "surf",
    name: {
      en: "Surf",
      ja: "なみのり",
    },
  },
  tailwind: {
    id: "tailwind",
    name: {
      en: "Tailwind",
      ja: "おいかぜ",
    },
  },
  taunt: {
    id: "taunt",
    name: {
      en: "Taunt",
      ja: "ちょうはつ",
    },
  },
  "throat-chop": {
    id: "throat-chop",
    name: {
      en: "Throat Chop",
      ja: "じごくづき",
    },
  },
  "thunder-punch": {
    id: "thunder-punch",
    name: {
      en: "Thunder Punch",
      ja: "かみなりパンチ",
    },
  },
  "thunder-wave": {
    id: "thunder-wave",
    name: {
      en: "Thunder Wave",
      ja: "でんじは",
    },
  },
  "torch-song": {
    id: "torch-song",
    name: {
      en: "Torch Song",
      ja: "フレアソング",
    },
  },
  "toxic-spikes": {
    id: "toxic-spikes",
    name: {
      en: "Toxic Spikes",
      ja: "どくびし",
    },
  },
  trailblaze: {
    id: "trailblaze",
    name: {
      en: "Trailblaze",
      ja: "くさわけ",
    },
  },
  trick: {
    id: "trick",
    name: {
      en: "Trick",
      ja: "トリック",
    },
  },
  "trick-room": {
    id: "trick-room",
    name: {
      en: "Trick Room",
      ja: "トリックルーム",
    },
  },
  "triple-axel": {
    id: "triple-axel",
    name: {
      en: "Triple Axel",
      ja: "トリプルアクセル",
    },
  },
  "u-turn": {
    id: "u-turn",
    name: {
      en: "U-turn",
      ja: "とんぼがえり",
    },
  },
  "vacuum-wave": {
    id: "vacuum-wave",
    name: {
      en: "Vacuum Wave",
      ja: "しんくうは",
    },
  },
  "water-shuriken": {
    id: "water-shuriken",
    name: {
      en: "Water Shuriken",
      ja: "みずしゅりけん",
    },
  },
  "wave-crash": {
    id: "wave-crash",
    name: {
      en: "Wave Crash",
      ja: "ウェーブタックル",
    },
  },
  "wide-guard": {
    id: "wide-guard",
    name: {
      en: "Wide Guard",
      ja: "ワイドガード",
    },
  },
  "wild-charge": {
    id: "wild-charge",
    name: {
      en: "Wild Charge",
      ja: "ワイルドボルト",
    },
  },
  "x-scissor": {
    id: "x-scissor",
    name: {
      en: "X-Scissor",
      ja: "シザークロス",
    },
  },
  "acid-spray": {
    id: "acid-spray",
    name: {
      en: "Acid Spray",
      ja: "アシッドボム",
    },
  },
  "air-cutter": {
    id: "air-cutter",
    name: {
      en: "Air Cutter",
      ja: "エアカッター",
    },
  },
  "ancient-power": {
    id: "ancient-power",
    name: {
      en: "Ancient Power",
      ja: "げんしのちから",
    },
  },
  "beat-up": {
    id: "beat-up",
    name: {
      en: "Beat Up",
      ja: "ふくろだたき",
    },
  },
  "belly-drum": {
    id: "belly-drum",
    name: {
      en: "Belly Drum",
      ja: "はらだいこ",
    },
  },
  bite: {
    id: "bite",
    name: {
      en: "Bite",
      ja: "かみつく",
    },
  },
  "blast-burn": {
    id: "blast-burn",
    name: {
      en: "Blast Burn",
      ja: "ブラストバーン",
    },
  },
  "body-slam": {
    id: "body-slam",
    name: {
      en: "Body Slam",
      ja: "のしかかり",
    },
  },
  "breaking-swipe": {
    id: "breaking-swipe",
    name: {
      en: "Breaking Swipe",
      ja: "ワイドブレイカー",
    },
  },
  "brick-break": {
    id: "brick-break",
    name: {
      en: "Brick Break",
      ja: "かわらわり",
    },
  },
  "brutal-swing": {
    id: "brutal-swing",
    name: {
      en: "Brutal Swing",
      ja: "ぶんまわす",
    },
  },
  bulldoze: {
    id: "bulldoze",
    name: {
      en: "Bulldoze",
      ja: "じならし",
    },
  },
  "confuse-ray": {
    id: "confuse-ray",
    name: {
      en: "Confuse Ray",
      ja: "あやしいひかり",
    },
  },
  "corrosive-gas": {
    id: "corrosive-gas",
    name: {
      en: "Corrosive Gas",
      ja: "ふしょくガス",
    },
  },
  counter: {
    id: "counter",
    name: {
      en: "Counter",
      ja: "カウンター",
    },
  },
  dig: {
    id: "dig",
    name: {
      en: "Dig",
      ja: "あなをほる",
    },
  },
  disable: {
    id: "disable",
    name: {
      en: "Disable",
      ja: "かなしばり",
    },
  },
  "double-edge": {
    id: "double-edge",
    name: {
      en: "Double-Edge",
      ja: "すてみタックル",
    },
  },
  "dragon-cheer": {
    id: "dragon-cheer",
    name: {
      en: "Dragon Cheer",
      ja: "ドラゴンエール",
    },
  },
  "dragon-rush": {
    id: "dragon-rush",
    name: {
      en: "Dragon Rush",
      ja: "ドラゴンダイブ",
    },
  },
  endure: {
    id: "endure",
    name: {
      en: "Endure",
      ja: "こらえる",
    },
  },
  facade: {
    id: "facade",
    name: {
      en: "Facade",
      ja: "からげんき",
    },
  },
  "fire-spin": {
    id: "fire-spin",
    name: {
      en: "Fire Spin",
      ja: "ほのおのうず",
    },
  },
  fling: {
    id: "fling",
    name: {
      en: "Fling",
      ja: "なげつける",
    },
  },
  fly: {
    id: "fly",
    name: {
      en: "Fly",
      ja: "そらをとぶ",
    },
  },
  "focus-punch": {
    id: "focus-punch",
    name: {
      en: "Focus Punch",
      ja: "きあいパンチ",
    },
  },
  "foul-play": {
    id: "foul-play",
    name: {
      en: "Foul Play",
      ja: "イカサマ",
    },
  },
  "giga-drain": {
    id: "giga-drain",
    name: {
      en: "Giga Drain",
      ja: "ギガドレイン",
    },
  },
  "giga-impact": {
    id: "giga-impact",
    name: {
      en: "Giga Impact",
      ja: "ギガインパクト",
    },
  },
  "heat-crash": {
    id: "heat-crash",
    name: {
      en: "Heat Crash",
      ja: "ヒートスタンプ",
    },
  },
  "helping-hand": {
    id: "helping-hand",
    name: {
      en: "Helping Hand",
      ja: "てだすけ",
    },
  },
  "hyper-beam": {
    id: "hyper-beam",
    name: {
      en: "Hyper Beam",
      ja: "はかいこうせん",
    },
  },
  inferno: {
    id: "inferno",
    name: {
      en: "Inferno",
      ja: "れんごく",
    },
  },
  "iron-tail": {
    id: "iron-tail",
    name: {
      en: "Iron Tail",
      ja: "アイアンテール",
    },
  },
  "mean-look": {
    id: "mean-look",
    name: {
      en: "Mean Look",
      ja: "くろいまなざし",
    },
  },
  "mega-kick": {
    id: "mega-kick",
    name: {
      en: "Mega Kick",
      ja: "メガトンキック",
    },
  },
  "mud-shot": {
    id: "mud-shot",
    name: {
      en: "Mud Shot",
      ja: "マッドショット",
    },
  },
  "night-shade": {
    id: "night-shade",
    name: {
      en: "Night Shade",
      ja: "ナイトヘッド",
    },
  },
  payback: {
    id: "payback",
    name: {
      en: "Payback",
      ja: "しっぺがえし",
    },
  },
  "perish-song": {
    id: "perish-song",
    name: {
      en: "Perish Song",
      ja: "ほろびのうた",
    },
  },
  "power-gem": {
    id: "power-gem",
    name: {
      en: "Power Gem",
      ja: "パワージェム",
    },
  },
  "psych-up": {
    id: "psych-up",
    name: {
      en: "Psych Up",
      ja: "じこあんじ",
    },
  },
  "psychic-noise": {
    id: "psychic-noise",
    name: {
      en: "Psychic Noise",
      ja: "サイコノイズ",
    },
  },
  "rain-dance": {
    id: "rain-dance",
    name: {
      en: "Rain Dance",
      ja: "あまごい",
    },
  },
  "reflect-type": {
    id: "reflect-type",
    name: {
      en: "Reflect Type",
      ja: "ミラータイプ",
    },
  },
  rest: {
    id: "rest",
    name: {
      en: "Rest",
      ja: "ねむる",
    },
  },
  "rock-tomb": {
    id: "rock-tomb",
    name: {
      en: "Rock Tomb",
      ja: "がんせきふうじ",
    },
  },
  round: {
    id: "round",
    name: {
      en: "Round",
      ja: "りんしょう",
    },
  },
  "sand-tomb": {
    id: "sand-tomb",
    name: {
      en: "Sand Tomb",
      ja: "すなじごく",
    },
  },
  sandstorm: {
    id: "sandstorm",
    name: {
      en: "Sandstorm",
      ja: "すなあらし",
    },
  },
  "scary-face": {
    id: "scary-face",
    name: {
      en: "Scary Face",
      ja: "こわいかお",
    },
  },
  "self-destruct": {
    id: "self-destruct",
    name: {
      en: "Self-Destruct",
      ja: "じばく",
    },
  },
  "shadow-punch": {
    id: "shadow-punch",
    name: {
      en: "Shadow Punch",
      ja: "シャドーパンチ",
    },
  },
  "skill-swap": {
    id: "skill-swap",
    name: {
      en: "Skill Swap",
      ja: "スキルスワップ",
    },
  },
  "skitter-smack": {
    id: "skitter-smack",
    name: {
      en: "Skitter Smack",
      ja: "はいよるいちげき",
    },
  },
  "sleep-talk": {
    id: "sleep-talk",
    name: {
      en: "Sleep Talk",
      ja: "ねごと",
    },
  },
  "sludge-wave": {
    id: "sludge-wave",
    name: {
      en: "Sludge Wave",
      ja: "ヘドロウェーブ",
    },
  },
  snore: {
    id: "snore",
    name: {
      en: "Snore",
      ja: "いびき",
    },
  },
  "solar-beam": {
    id: "solar-beam",
    name: {
      en: "Solar Beam",
      ja: "ソーラービーム",
    },
  },
  spite: {
    id: "spite",
    name: {
      en: "Spite",
      ja: "うらみ",
    },
  },
  "steel-wing": {
    id: "steel-wing",
    name: {
      en: "Steel Wing",
      ja: "はがねのつばさ",
    },
  },
  "sunny-day": {
    id: "sunny-day",
    name: {
      en: "Sunny Day",
      ja: "にほんばれ",
    },
  },
  "temper-flare": {
    id: "temper-flare",
    name: {
      en: "Temper Flare",
      ja: "やけっぱち",
    },
  },
  thief: {
    id: "thief",
    name: {
      en: "Thief",
      ja: "どろぼう",
    },
  },
  thunder: {
    id: "thunder",
    name: {
      en: "Thunder",
      ja: "かみなり",
    },
  },
  "thunder-fang": {
    id: "thunder-fang",
    name: {
      en: "Thunder Fang",
      ja: "かみなりのキバ",
    },
  },
  toxic: {
    id: "toxic",
    name: {
      en: "Toxic",
      ja: "どくどく",
    },
  },
  venoshock: {
    id: "venoshock",
    name: {
      en: "Venoshock",
      ja: "ベノムショック",
    },
  },
  "weather-ball": {
    id: "weather-ball",
    name: {
      en: "Weather Ball",
      ja: "ウェザーボール",
    },
  },
  "wonder-room": {
    id: "wonder-room",
    name: {
      en: "Wonder Room",
      ja: "ワンダールーム",
    },
  },
} as const satisfies Record<string, NameEntry>;

export type MoveNames = typeof moveNames;
