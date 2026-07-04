// 生成物（scripts/generate.ts 出力）。手書き編集しない。data/champions・data/languages を直し再生成する。
import type { NameEntry } from "../../types/name.ts";

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
  agility: {
    id: "agility",
    name: {
      en: "Agility",
      ja: "こうそくいどう",
    },
  },
  "ally-switch": {
    id: "ally-switch",
    name: {
      en: "Ally Switch",
      ja: "サイドチェンジ",
    },
  },
  avalanche: {
    id: "avalanche",
    name: {
      en: "Avalanche",
      ja: "ゆきなだれ",
    },
  },
  blizzard: {
    id: "blizzard",
    name: {
      en: "Blizzard",
      ja: "ふぶき",
    },
  },
  "charge-beam": {
    id: "charge-beam",
    name: {
      en: "Charge Beam",
      ja: "チャージビーム",
    },
  },
  "chilling-water": {
    id: "chilling-water",
    name: {
      en: "Chilling Water",
      ja: "ひやみず",
    },
  },
  "cosmic-power": {
    id: "cosmic-power",
    name: {
      en: "Cosmic Power",
      ja: "コスモパワー",
    },
  },
  dive: {
    id: "dive",
    name: {
      en: "Dive",
      ja: "ダイビング",
    },
  },
  gravity: {
    id: "gravity",
    name: {
      en: "Gravity",
      ja: "じゅうりょく",
    },
  },
  "gyro-ball": {
    id: "gyro-ball",
    name: {
      en: "Gyro Ball",
      ja: "ジャイロボール",
    },
  },
  "light-screen": {
    id: "light-screen",
    name: {
      en: "Light Screen",
      ja: "ひかりのかべ",
    },
  },
  "meteor-beam": {
    id: "meteor-beam",
    name: {
      en: "Meteor Beam",
      ja: "メテオビーム",
    },
  },
  minimize: {
    id: "minimize",
    name: {
      en: "Minimize",
      ja: "ちいさくなる",
    },
  },
  "psycho-cut": {
    id: "psycho-cut",
    name: {
      en: "Psycho Cut",
      ja: "サイコカッター",
    },
  },
  reflect: {
    id: "reflect",
    name: {
      en: "Reflect",
      ja: "リフレクター",
    },
  },
  safeguard: {
    id: "safeguard",
    name: {
      en: "Safeguard",
      ja: "しんぴのまもり",
    },
  },
  "tri-attack": {
    id: "tri-attack",
    name: {
      en: "Tri Attack",
      ja: "トライアタック",
    },
  },
  "water-pulse": {
    id: "water-pulse",
    name: {
      en: "Water Pulse",
      ja: "みずのはどう",
    },
  },
  waterfall: {
    id: "waterfall",
    name: {
      en: "Waterfall",
      ja: "たきのぼり",
    },
  },
  whirlpool: {
    id: "whirlpool",
    name: {
      en: "Whirlpool",
      ja: "うずしお",
    },
  },
  "clear-smog": {
    id: "clear-smog",
    name: {
      en: "Clear Smog",
      ja: "クリアスモッグ",
    },
  },
  thrash: {
    id: "thrash",
    name: {
      en: "Thrash",
      ja: "あばれる",
    },
  },
  assurance: {
    id: "assurance",
    name: {
      en: "Assurance",
      ja: "ダメおし",
    },
  },
  "baton-pass": {
    id: "baton-pass",
    name: {
      en: "Baton Pass",
      ja: "バトンタッチ",
    },
  },
  "double-hit": {
    id: "double-hit",
    name: {
      en: "Double Hit",
      ja: "ダブルアタック",
    },
  },
  "double-team": {
    id: "double-team",
    name: {
      en: "Double Team",
      ja: "かげぶんしん",
    },
  },
  infestation: {
    id: "infestation",
    name: {
      en: "Infestation",
      ja: "まとわりつく",
    },
  },
  "last-resort": {
    id: "last-resort",
    name: {
      en: "Last Resort",
      ja: "とっておき",
    },
  },
  "lock-on": {
    id: "lock-on",
    name: {
      en: "Lock-On",
      ja: "ロックオン",
    },
  },
  pounce: {
    id: "pounce",
    name: {
      en: "Pounce",
      ja: "とびつく",
    },
  },
  "quick-attack": {
    id: "quick-attack",
    name: {
      en: "Quick Attack",
      ja: "でんこうせっか",
    },
  },
  snowscape: {
    id: "snowscape",
    name: {
      en: "Snowscape",
      ja: "ゆきげしき",
    },
  },
  whirlwind: {
    id: "whirlwind",
    name: {
      en: "Whirlwind",
      ja: "ふきとばし",
    },
  },
  wrap: {
    id: "wrap",
    name: {
      en: "Wrap",
      ja: "まきつく",
    },
  },
  belch: {
    id: "belch",
    name: {
      en: "Belch",
      ja: "ゲップ",
    },
  },
  "focus-energy": {
    id: "focus-energy",
    name: {
      en: "Focus Energy",
      ja: "きあいだめ",
    },
  },
  "head-smash": {
    id: "head-smash",
    name: {
      en: "Head Smash",
      ja: "もろはのずつき",
    },
  },
  "ice-fang": {
    id: "ice-fang",
    name: {
      en: "Ice Fang",
      ja: "こおりのキバ",
    },
  },
  "lash-out": {
    id: "lash-out",
    name: {
      en: "Lash Out",
      ja: "うっぷんばらし",
    },
  },
  screech: {
    id: "screech",
    name: {
      en: "Screech",
      ja: "いやなおと",
    },
  },
  uproar: {
    id: "uproar",
    name: {
      en: "Uproar",
      ja: "さわぐ",
    },
  },
  "hard-press": {
    id: "hard-press",
    name: {
      en: "Hard Press",
      ja: "ハードプレス",
    },
  },
  "mud-slap": {
    id: "mud-slap",
    name: {
      en: "Mud-Slap",
      ja: "どろかけ",
    },
  },
  "smack-down": {
    id: "smack-down",
    name: {
      en: "Smack Down",
      ja: "うちおとす",
    },
  },
  swagger: {
    id: "swagger",
    name: {
      en: "Swagger",
      ja: "いばる",
    },
  },
  "blaze-kick": {
    id: "blaze-kick",
    name: {
      en: "Blaze Kick",
      ja: "ブレイズキック",
    },
  },
  "bone-rush": {
    id: "bone-rush",
    name: {
      en: "Bone Rush",
      ja: "ボーンラッシュ",
    },
  },
  "circle-throw": {
    id: "circle-throw",
    name: {
      en: "Circle Throw",
      ja: "ともえなげ",
    },
  },
  coaching: {
    id: "coaching",
    name: {
      en: "Coaching",
      ja: "コーチング",
    },
  },
  copycat: {
    id: "copycat",
    name: {
      en: "Copycat",
      ja: "まねっこ",
    },
  },
  "cross-chop": {
    id: "cross-chop",
    name: {
      en: "Cross Chop",
      ja: "クロスチョップ",
    },
  },
  detect: {
    id: "detect",
    name: {
      en: "Detect",
      ja: "みきり",
    },
  },
  feint: {
    id: "feint",
    name: {
      en: "Feint",
      ja: "フェイント",
    },
  },
  "final-gambit": {
    id: "final-gambit",
    name: {
      en: "Final Gambit",
      ja: "いのちがけ",
    },
  },
  "heal-pulse": {
    id: "heal-pulse",
    name: {
      en: "Heal Pulse",
      ja: "いやしのはどう",
    },
  },
  "high-jump-kick": {
    id: "high-jump-kick",
    name: {
      en: "High Jump Kick",
      ja: "とびひざげり",
    },
  },
  howl: {
    id: "howl",
    name: {
      en: "Howl",
      ja: "とおぼえ",
    },
  },
  "low-sweep": {
    id: "low-sweep",
    name: {
      en: "Low Sweep",
      ja: "ローキック",
    },
  },
  "metal-sound": {
    id: "metal-sound",
    name: {
      en: "Metal Sound",
      ja: "きんぞくおん",
    },
  },
  "quick-guard": {
    id: "quick-guard",
    name: {
      en: "Quick Guard",
      ja: "ファストガード",
    },
  },
  reversal: {
    id: "reversal",
    name: {
      en: "Reversal",
      ja: "きしかいせい",
    },
  },
  "steel-beam": {
    id: "steel-beam",
    name: {
      en: "Steel Beam",
      ja: "てっていこうせん",
    },
  },
  "terrain-pulse": {
    id: "terrain-pulse",
    name: {
      en: "Terrain Pulse",
      ja: "だいちのはどう",
    },
  },
  "upper-hand": {
    id: "upper-hand",
    name: {
      en: "Upper Hand",
      ja: "はやてがえし",
    },
  },
  charge: {
    id: "charge",
    name: {
      en: "Charge",
      ja: "じゅうでん",
    },
  },
  discharge: {
    id: "discharge",
    name: {
      en: "Discharge",
      ja: "ほうでん",
    },
  },
  "eerie-impulse": {
    id: "eerie-impulse",
    name: {
      en: "Eerie Impulse",
      ja: "かいでんぱ",
    },
  },
  "electric-terrain": {
    id: "electric-terrain",
    name: {
      en: "Electric Terrain",
      ja: "エレキフィールド",
    },
  },
  "electro-ball": {
    id: "electro-ball",
    name: {
      en: "Electro Ball",
      ja: "エレキボール",
    },
  },
  "rising-voltage": {
    id: "rising-voltage",
    name: {
      en: "Rising Voltage",
      ja: "ライジングボルト",
    },
  },
  "stored-power": {
    id: "stored-power",
    name: {
      en: "Stored Power",
      ja: "アシストパワー",
    },
  },
  "after-you": {
    id: "after-you",
    name: {
      en: "After You",
      ja: "おさきにどうぞ",
    },
  },
  attract: {
    id: "attract",
    name: {
      en: "Attract",
      ja: "メロメロ",
    },
  },
  charm: {
    id: "charm",
    name: {
      en: "Charm",
      ja: "あまえる",
    },
  },
  flail: {
    id: "flail",
    name: {
      en: "Flail",
      ja: "じたばた",
    },
  },
  "grassy-terrain": {
    id: "grassy-terrain",
    name: {
      en: "Grassy Terrain",
      ja: "グラスフィールド",
    },
  },
  growth: {
    id: "growth",
    name: {
      en: "Growth",
      ja: "せいちょう",
    },
  },
  ingrain: {
    id: "ingrain",
    name: {
      en: "Ingrain",
      ja: "ねをはる",
    },
  },
  "leech-seed": {
    id: "leech-seed",
    name: {
      en: "Leech Seed",
      ja: "やどりぎのタネ",
    },
  },
  moonblast: {
    id: "moonblast",
    name: {
      en: "Moonblast",
      ja: "ムーンフォース",
    },
  },
  moonlight: {
    id: "moonlight",
    name: {
      en: "Moonlight",
      ja: "つきのひかり",
    },
  },
  "petal-blizzard": {
    id: "petal-blizzard",
    name: {
      en: "Petal Blizzard",
      ja: "はなふぶき",
    },
  },
  "petal-dance": {
    id: "petal-dance",
    name: {
      en: "Petal Dance",
      ja: "はなびらのまい",
    },
  },
  "poison-powder": {
    id: "poison-powder",
    name: {
      en: "Poison Powder",
      ja: "どくのこな",
    },
  },
  "pollen-puff": {
    id: "pollen-puff",
    name: {
      en: "Pollen Puff",
      ja: "かふんだんご",
    },
  },
  "seed-bomb": {
    id: "seed-bomb",
    name: {
      en: "Seed Bomb",
      ja: "タネばくだん",
    },
  },
  "sleep-powder": {
    id: "sleep-powder",
    name: {
      en: "Sleep Powder",
      ja: "ねむりごな",
    },
  },
  "solar-blade": {
    id: "solar-blade",
    name: {
      en: "Solar Blade",
      ja: "ソーラーブレード",
    },
  },
  "strength-sap": {
    id: "strength-sap",
    name: {
      en: "Strength Sap",
      ja: "ちからをすいとる",
    },
  },
  "stun-spore": {
    id: "stun-spore",
    name: {
      en: "Stun Spore",
      ja: "しびれごな",
    },
  },
  "sweet-scent": {
    id: "sweet-scent",
    name: {
      en: "Sweet Scent",
      ja: "あまいかおり",
    },
  },
  synthesis: {
    id: "synthesis",
    name: {
      en: "Synthesis",
      ja: "こうごうせい",
    },
  },
  "teeter-dance": {
    id: "teeter-dance",
    name: {
      en: "Teeter Dance",
      ja: "フラフラダンス",
    },
  },
  tickle: {
    id: "tickle",
    name: {
      en: "Tickle",
      ja: "くすぐる",
    },
  },
  acupressure: {
    id: "acupressure",
    name: {
      en: "Acupressure",
      ja: "つぼをつく",
    },
  },
  "barb-barrage": {
    id: "barb-barrage",
    name: {
      en: "Barb Barrage",
      ja: "どくばりセンボン",
    },
  },
  "fell-stinger": {
    id: "fell-stinger",
    name: {
      en: "Fell Stinger",
      ja: "とどめばり",
    },
  },
  "spit-up": {
    id: "spit-up",
    name: {
      en: "Spit Up",
      ja: "はきだす",
    },
  },
  "steel-roller": {
    id: "steel-roller",
    name: {
      en: "Steel Roller",
      ja: "アイアンローラー",
    },
  },
  stockpile: {
    id: "stockpile",
    name: {
      en: "Stockpile",
      ja: "たくわえる",
    },
  },
  "cross-poison": {
    id: "cross-poison",
    name: {
      en: "Cross Poison",
      ja: "クロスポイズン",
    },
  },
  endeavor: {
    id: "endeavor",
    name: {
      en: "Endeavor",
      ja: "がむしゃら",
    },
  },
  "frenzy-plant": {
    id: "frenzy-plant",
    name: {
      en: "Frenzy Plant",
      ja: "ハードプラント",
    },
  },
  "shed-tail": {
    id: "shed-tail",
    name: {
      en: "Shed Tail",
      ja: "しっぽきり",
    },
  },
  "worry-seed": {
    id: "worry-seed",
    name: {
      en: "Worry Seed",
      ja: "なやみのタネ",
    },
  },
  bounce: {
    id: "bounce",
    name: {
      en: "Bounce",
      ja: "とびはねる",
    },
  },
  "crush-claw": {
    id: "crush-claw",
    name: {
      en: "Crush Claw",
      ja: "ブレイククロー",
    },
  },
  "feather-dance": {
    id: "feather-dance",
    name: {
      en: "Feather Dance",
      ja: "フェザーダンス",
    },
  },
  amnesia: {
    id: "amnesia",
    name: {
      en: "Amnesia",
      ja: "ドわすれ",
    },
  },
  "aqua-ring": {
    id: "aqua-ring",
    name: {
      en: "Aqua Ring",
      ja: "アクアリング",
    },
  },
  "hammer-arm": {
    id: "hammer-arm",
    name: {
      en: "Hammer Arm",
      ja: "アームハンマー",
    },
  },
  "hydro-cannon": {
    id: "hydro-cannon",
    name: {
      en: "Hydro Cannon",
      ja: "ハイドロカノン",
    },
  },
  yawn: {
    id: "yawn",
    name: {
      en: "Yawn",
      ja: "あくび",
    },
  },
  "draining-kiss": {
    id: "draining-kiss",
    name: {
      en: "Draining Kiss",
      ja: "ドレインキッス",
    },
  },
  "dynamic-punch": {
    id: "dynamic-punch",
    name: {
      en: "Dynamic Punch",
      ja: "ばくれつパンチ",
    },
  },
  "fake-tears": {
    id: "fake-tears",
    name: {
      en: "Fake Tears",
      ja: "うそなき",
    },
  },
  "guard-swap": {
    id: "guard-swap",
    name: {
      en: "Guard Swap",
      ja: "ガードスワップ",
    },
  },
  "misty-terrain": {
    id: "misty-terrain",
    name: {
      en: "Misty Terrain",
      ja: "ミストフィールド",
    },
  },
  "poison-fang": {
    id: "poison-fang",
    name: {
      en: "Poison Fang",
      ja: "どくどくのキバ",
    },
  },
  "seismic-toss": {
    id: "seismic-toss",
    name: {
      en: "Seismic Toss",
      ja: "ちきゅうなげ",
    },
  },
  swallow: {
    id: "swallow",
    name: {
      en: "Swallow",
      ja: "のみこむ",
    },
  },
  explosion: {
    id: "explosion",
    name: {
      en: "Explosion",
      ja: "だいばくはつ",
    },
  },
  "future-sight": {
    id: "future-sight",
    name: {
      en: "Future Sight",
      ja: "みらいよち",
    },
  },
  "magnet-rise": {
    id: "magnet-rise",
    name: {
      en: "Magnet Rise",
      ja: "でんじふゆう",
    },
  },
  "sky-attack": {
    id: "sky-attack",
    name: {
      en: "Sky Attack",
      ja: "ゴッドバード",
    },
  },
  "healing-wish": {
    id: "healing-wish",
    name: {
      en: "Healing Wish",
      ja: "いやしのねがい",
    },
  },
  "misty-explosion": {
    id: "misty-explosion",
    name: {
      en: "Misty Explosion",
      ja: "ミストバースト",
    },
  },
  "power-swap": {
    id: "power-swap",
    name: {
      en: "Power Swap",
      ja: "パワースワップ",
    },
  },
  "psychic-terrain": {
    id: "psychic-terrain",
    name: {
      en: "Psychic Terrain",
      ja: "サイコフィールド",
    },
  },
  "leech-life": {
    id: "leech-life",
    name: {
      en: "Leech Life",
      ja: "きゅうけつ",
    },
  },
  "super-fang": {
    id: "super-fang",
    name: {
      en: "Super Fang",
      ja: "いかりのまえば",
    },
  },
  torment: {
    id: "torment",
    name: {
      en: "Torment",
      ja: "いちゃもん",
    },
  },
  coil: {
    id: "coil",
    name: {
      en: "Coil",
      ja: "とぐろをまく",
    },
  },
  "gastro-acid": {
    id: "gastro-acid",
    name: {
      en: "Gastro Acid",
      ja: "いえき",
    },
  },
  "supercell-slam": {
    id: "supercell-slam",
    name: {
      en: "Supercell Slam",
      ja: "サンダーダイブ",
    },
  },
  "zap-cannon": {
    id: "zap-cannon",
    name: {
      en: "Zap Cannon",
      ja: "でんじほう",
    },
  },
  "burning-jealousy": {
    id: "burning-jealousy",
    name: {
      en: "Burning Jealousy",
      ja: "しっとのほのお",
    },
  },
  entrainment: {
    id: "entrainment",
    name: {
      en: "Entrainment",
      ja: "なかまづくり",
    },
  },
  "noble-roar": {
    id: "noble-roar",
    name: {
      en: "Noble Roar",
      ja: "おたけび",
    },
  },
  pluck: {
    id: "pluck",
    name: {
      en: "Pluck",
      ja: "ついばむ",
    },
  },
  switcheroo: {
    id: "switcheroo",
    name: {
      en: "Switcheroo",
      ja: "すりかえ",
    },
  },
  "topsy-turvy": {
    id: "topsy-turvy",
    name: {
      en: "Topsy-Turvy",
      ja: "ひっくりかえす",
    },
  },
  "aqua-cutter": {
    id: "aqua-cutter",
    name: {
      en: "Aqua Cutter",
      ja: "アクアカッター",
    },
  },
  "razor-shell": {
    id: "razor-shell",
    name: {
      en: "Razor Shell",
      ja: "シェルブレード",
    },
  },
  "rock-polish": {
    id: "rock-polish",
    name: {
      en: "Rock Polish",
      ja: "ロックカット",
    },
  },
  "acid-armor": {
    id: "acid-armor",
    name: {
      en: "Acid Armor",
      ja: "とける",
    },
  },
  flatter: {
    id: "flatter",
    name: {
      en: "Flatter",
      ja: "おだてる",
    },
  },
  "parting-shot": {
    id: "parting-shot",
    name: {
      en: "Parting Shot",
      ja: "すてゼリフ",
    },
  },
  "power-whip": {
    id: "power-whip",
    name: {
      en: "Power Whip",
      ja: "パワーウィップ",
    },
  },
  "spirit-break": {
    id: "spirit-break",
    name: {
      en: "Spirit Break",
      ja: "ソウルクラッシュ",
    },
  },
  "first-impression": {
    id: "first-impression",
    name: {
      en: "First Impression",
      ja: "であいがしら",
    },
  },
  "no-retreat": {
    id: "no-retreat",
    name: {
      en: "No Retreat",
      ja: "はいすいのじん",
    },
  },
  "last-respects": {
    id: "last-respects",
    name: {
      en: "Last Respects",
      ja: "おはかまいり",
    },
  },
  memento: {
    id: "memento",
    name: {
      en: "Memento",
      ja: "おきみやげ",
    },
  },
  "rage-fist": {
    id: "rage-fist",
    name: {
      en: "Rage Fist",
      ja: "ふんどのこぶし",
    },
  },
  "storm-throw": {
    id: "storm-throw",
    name: {
      en: "Storm Throw",
      ja: "やまあらし",
    },
  },
  "make-it-rain": {
    id: "make-it-rain",
    name: {
      en: "Make It Rain",
      ja: "ゴールドラッシュ",
    },
  },
  "10-000-000-volt-thunderbolt": {
    id: "10-000-000-volt-thunderbolt",
    name: {
      en: "10,000,000 Volt Thunderbolt",
      ja: "１０００まんボルト",
    },
  },
  absorb: {
    id: "absorb",
    name: {
      en: "Absorb",
      ja: "すいとる",
    },
  },
  accelerock: {
    id: "accelerock",
    name: {
      en: "Accelerock",
      ja: "アクセルロック",
    },
  },
  acid: {
    id: "acid",
    name: {
      en: "Acid",
      ja: "ようかいえき",
    },
  },
  "acid-downpour--physical": {
    id: "acid-downpour--physical",
    name: {
      en: "Acid Downpour",
      ja: "アシッドポイズンデリート",
    },
  },
  "acid-downpour--special": {
    id: "acid-downpour--special",
    name: {
      en: "Acid Downpour",
      ja: "アシッドポイズンデリート",
    },
  },
  aeroblast: {
    id: "aeroblast",
    name: {
      en: "Aeroblast",
      ja: "エアロブラスト",
    },
  },
  "all-out-pummeling--physical": {
    id: "all-out-pummeling--physical",
    name: {
      en: "All-Out Pummeling",
      ja: "ぜんりょくむそうげきれつけん",
    },
  },
  "all-out-pummeling--special": {
    id: "all-out-pummeling--special",
    name: {
      en: "All-Out Pummeling",
      ja: "ぜんりょくむそうげきれつけん",
    },
  },
  "alluring-voice": {
    id: "alluring-voice",
    name: {
      en: "Alluring Voice",
      ja: "みわくのボイス",
    },
  },
  "anchor-shot": {
    id: "anchor-shot",
    name: {
      en: "Anchor Shot",
      ja: "アンカーショット",
    },
  },
  "apple-acid": {
    id: "apple-acid",
    name: {
      en: "Apple Acid",
      ja: "りんごさん",
    },
  },
  "arm-thrust": {
    id: "arm-thrust",
    name: {
      en: "Arm Thrust",
      ja: "つっぱり",
    },
  },
  "armor-cannon": {
    id: "armor-cannon",
    name: {
      en: "Armor Cannon",
      ja: "アーマーキャノン",
    },
  },
  aromatherapy: {
    id: "aromatherapy",
    name: {
      en: "Aromatherapy",
      ja: "アロマセラピー",
    },
  },
  "aromatic-mist": {
    id: "aromatic-mist",
    name: {
      en: "Aromatic Mist",
      ja: "アロマミスト",
    },
  },
  assist: {
    id: "assist",
    name: {
      en: "Assist",
      ja: "ねこのて",
    },
  },
  astonish: {
    id: "astonish",
    name: {
      en: "Astonish",
      ja: "おどろかす",
    },
  },
  "astral-barrage": {
    id: "astral-barrage",
    name: {
      en: "Astral Barrage",
      ja: "アストラルビット",
    },
  },
  "attack-order": {
    id: "attack-order",
    name: {
      en: "Attack Order",
      ja: "こうげきしれい",
    },
  },
  "aura-wheel": {
    id: "aura-wheel",
    name: {
      en: "Aura Wheel",
      ja: "オーラぐるま",
    },
  },
  "aurora-beam": {
    id: "aurora-beam",
    name: {
      en: "Aurora Beam",
      ja: "オーロラビーム",
    },
  },
  "aurora-veil": {
    id: "aurora-veil",
    name: {
      en: "Aurora Veil",
      ja: "オーロラベール",
    },
  },
  autotomize: {
    id: "autotomize",
    name: {
      en: "Autotomize",
      ja: "ボディパージ",
    },
  },
  "axe-kick": {
    id: "axe-kick",
    name: {
      en: "Axe Kick",
      ja: "かかとおとし",
    },
  },
  "baby-doll-eyes": {
    id: "baby-doll-eyes",
    name: {
      en: "Baby-Doll Eyes",
      ja: "つぶらなひとみ",
    },
  },
  "baddy-bad": {
    id: "baddy-bad",
    name: {
      en: "Baddy Bad",
      ja: "わるわるゾーン",
    },
  },
  "baneful-bunker": {
    id: "baneful-bunker",
    name: {
      en: "Baneful Bunker",
      ja: "トーチカ",
    },
  },
  barrage: {
    id: "barrage",
    name: {
      en: "Barrage",
      ja: "たまなげ",
    },
  },
  barrier: {
    id: "barrier",
    name: {
      en: "Barrier",
      ja: "バリアー",
    },
  },
  "beak-blast": {
    id: "beak-blast",
    name: {
      en: "Beak Blast",
      ja: "くちばしキャノン",
    },
  },
  "behemoth-bash": {
    id: "behemoth-bash",
    name: {
      en: "Behemoth Bash",
      ja: "きょじゅうだん",
    },
  },
  "behemoth-blade": {
    id: "behemoth-blade",
    name: {
      en: "Behemoth Blade",
      ja: "きょじゅうざん",
    },
  },
  bestow: {
    id: "bestow",
    name: {
      en: "Bestow",
      ja: "ギフトパス",
    },
  },
  bide: {
    id: "bide",
    name: {
      en: "Bide",
      ja: "がまん",
    },
  },
  bind: {
    id: "bind",
    name: {
      en: "Bind",
      ja: "しめつける",
    },
  },
  "bitter-blade": {
    id: "bitter-blade",
    name: {
      en: "Bitter Blade",
      ja: "むねんのつるぎ",
    },
  },
  "bitter-malice": {
    id: "bitter-malice",
    name: {
      en: "Bitter Malice",
      ja: "うらみつらみ",
    },
  },
  "black-hole-eclipse--physical": {
    id: "black-hole-eclipse--physical",
    name: {
      en: "Black Hole Eclipse",
      ja: "ブラックホールイクリプス",
    },
  },
  "black-hole-eclipse--special": {
    id: "black-hole-eclipse--special",
    name: {
      en: "Black Hole Eclipse",
      ja: "ブラックホールイクリプス",
    },
  },
  "blazing-torque": {
    id: "blazing-torque",
    name: {
      en: "Blazing Torque",
      ja: "バーンアクセル",
    },
  },
  "bleakwind-storm": {
    id: "bleakwind-storm",
    name: {
      en: "Bleakwind Storm",
      ja: "こがらしあらし",
    },
  },
  block: {
    id: "block",
    name: {
      en: "Block",
      ja: "とおせんぼう",
    },
  },
  "blood-moon": {
    id: "blood-moon",
    name: {
      en: "Blood Moon",
      ja: "ブラッドムーン",
    },
  },
  "bloom-doom--physical": {
    id: "bloom-doom--physical",
    name: {
      en: "Bloom Doom",
      ja: "ブルームシャインエクストラ",
    },
  },
  "bloom-doom--special": {
    id: "bloom-doom--special",
    name: {
      en: "Bloom Doom",
      ja: "ブルームシャインエクストラ",
    },
  },
  "blue-flare": {
    id: "blue-flare",
    name: {
      en: "Blue Flare",
      ja: "あおいほのお",
    },
  },
  "bolt-beak": {
    id: "bolt-beak",
    name: {
      en: "Bolt Beak",
      ja: "でんげきくちばし",
    },
  },
  "bolt-strike": {
    id: "bolt-strike",
    name: {
      en: "Bolt Strike",
      ja: "らいげき",
    },
  },
  "bone-club": {
    id: "bone-club",
    name: {
      en: "Bone Club",
      ja: "ホネこんぼう",
    },
  },
  bonemerang: {
    id: "bonemerang",
    name: {
      en: "Bonemerang",
      ja: "ホネブーメラン",
    },
  },
  boomburst: {
    id: "boomburst",
    name: {
      en: "Boomburst",
      ja: "ばくおんぱ",
    },
  },
  "bouncy-bubble": {
    id: "bouncy-bubble",
    name: {
      en: "Bouncy Bubble",
      ja: "いきいきバブル",
    },
  },
  "branch-poke": {
    id: "branch-poke",
    name: {
      en: "Branch Poke",
      ja: "えだづき",
    },
  },
  "breakneck-blitz--physical": {
    id: "breakneck-blitz--physical",
    name: {
      en: "Breakneck Blitz",
      ja: "ウルトラダッシュアタック",
    },
  },
  "breakneck-blitz--special": {
    id: "breakneck-blitz--special",
    name: {
      en: "Breakneck Blitz",
      ja: "ウルトラダッシュアタック",
    },
  },
  brine: {
    id: "brine",
    name: {
      en: "Brine",
      ja: "しおみず",
    },
  },
  bubble: {
    id: "bubble",
    name: {
      en: "Bubble",
      ja: "あわ",
    },
  },
  "bubble-beam": {
    id: "bubble-beam",
    name: {
      en: "Bubble Beam",
      ja: "バブルこうせん",
    },
  },
  "bug-buzz": {
    id: "bug-buzz",
    name: {
      en: "Bug Buzz",
      ja: "むしのさざめき",
    },
  },
  "burn-up": {
    id: "burn-up",
    name: {
      en: "Burn Up",
      ja: "もえつきる",
    },
  },
  "burning-bulwark": {
    id: "burning-bulwark",
    name: {
      en: "Burning Bulwark",
      ja: "かえんのまもり",
    },
  },
  "buzzy-buzz": {
    id: "buzzy-buzz",
    name: {
      en: "Buzzy Buzz",
      ja: "びりびりエレキ",
    },
  },
  camouflage: {
    id: "camouflage",
    name: {
      en: "Camouflage",
      ja: "ほごしょく",
    },
  },
  captivate: {
    id: "captivate",
    name: {
      en: "Captivate",
      ja: "ゆうわく",
    },
  },
  catastropika: {
    id: "catastropika",
    name: {
      en: "Catastropika",
      ja: "ひっさつのピカチュート",
    },
  },
  "ceaseless-edge": {
    id: "ceaseless-edge",
    name: {
      en: "Ceaseless Edge",
      ja: "ひけん・ちえなみ",
    },
  },
  celebrate: {
    id: "celebrate",
    name: {
      en: "Celebrate",
      ja: "おいわい",
    },
  },
  chatter: {
    id: "chatter",
    name: {
      en: "Chatter",
      ja: "おしゃべり",
    },
  },
  "chilly-reception": {
    id: "chilly-reception",
    name: {
      en: "Chilly Reception",
      ja: "さむいギャグ",
    },
  },
  "chip-away": {
    id: "chip-away",
    name: {
      en: "Chip Away",
      ja: "なしくずし",
    },
  },
  chloroblast: {
    id: "chloroblast",
    name: {
      en: "Chloroblast",
      ja: "クロロブラスト",
    },
  },
  clamp: {
    id: "clamp",
    name: {
      en: "Clamp",
      ja: "からではさむ",
    },
  },
  "clanging-scales": {
    id: "clanging-scales",
    name: {
      en: "Clanging Scales",
      ja: "スケイルノイズ",
    },
  },
  "clangorous-soul": {
    id: "clangorous-soul",
    name: {
      en: "Clangorous Soul",
      ja: "ソウルビート",
    },
  },
  "clangorous-soulblaze": {
    id: "clangorous-soulblaze",
    name: {
      en: "Clangorous Soulblaze",
      ja: "ブレイジングソウルビート",
    },
  },
  "collision-course": {
    id: "collision-course",
    name: {
      en: "Collision Course",
      ja: "アクセルブレイク",
    },
  },
  "combat-torque": {
    id: "combat-torque",
    name: {
      en: "Combat Torque",
      ja: "ファイトアクセル",
    },
  },
  "comet-punch": {
    id: "comet-punch",
    name: {
      en: "Comet Punch",
      ja: "れんぞくパンチ",
    },
  },
  comeuppance: {
    id: "comeuppance",
    name: {
      en: "Comeuppance",
      ja: "ほうふく",
    },
  },
  confide: {
    id: "confide",
    name: {
      en: "Confide",
      ja: "ないしょばなし",
    },
  },
  confusion: {
    id: "confusion",
    name: {
      en: "Confusion",
      ja: "ねんりき",
    },
  },
  constrict: {
    id: "constrict",
    name: {
      en: "Constrict",
      ja: "からみつく",
    },
  },
  "continental-crush--physical": {
    id: "continental-crush--physical",
    name: {
      en: "Continental Crush",
      ja: "ワールズエンドフォール",
    },
  },
  "continental-crush--special": {
    id: "continental-crush--special",
    name: {
      en: "Continental Crush",
      ja: "ワールズエンドフォール",
    },
  },
  conversion: {
    id: "conversion",
    name: {
      en: "Conversion",
      ja: "テクスチャー",
    },
  },
  "conversion-2": {
    id: "conversion-2",
    name: {
      en: "Conversion 2",
      ja: "テクスチャー２",
    },
  },
  "core-enforcer": {
    id: "core-enforcer",
    name: {
      en: "Core Enforcer",
      ja: "コアパニッシャー",
    },
  },
  "corkscrew-crash--physical": {
    id: "corkscrew-crash--physical",
    name: {
      en: "Corkscrew Crash",
      ja: "ちょうぜつらせんれんげき",
    },
  },
  "corkscrew-crash--special": {
    id: "corkscrew-crash--special",
    name: {
      en: "Corkscrew Crash",
      ja: "ちょうぜつらせんれんげき",
    },
  },
  "cotton-guard": {
    id: "cotton-guard",
    name: {
      en: "Cotton Guard",
      ja: "コットンガード",
    },
  },
  "cotton-spore": {
    id: "cotton-spore",
    name: {
      en: "Cotton Spore",
      ja: "わたほうし",
    },
  },
  "court-change": {
    id: "court-change",
    name: {
      en: "Court Change",
      ja: "コートチェンジ",
    },
  },
  covet: {
    id: "covet",
    name: {
      en: "Covet",
      ja: "ほしがる",
    },
  },
  crabhammer: {
    id: "crabhammer",
    name: {
      en: "Crabhammer",
      ja: "クラブハンマー",
    },
  },
  "crafty-shield": {
    id: "crafty-shield",
    name: {
      en: "Crafty Shield",
      ja: "トリックガード",
    },
  },
  "crush-grip": {
    id: "crush-grip",
    name: {
      en: "Crush Grip",
      ja: "にぎりつぶす",
    },
  },
  cut: {
    id: "cut",
    name: {
      en: "Cut",
      ja: "いあいぎり",
    },
  },
  "dark-void": {
    id: "dark-void",
    name: {
      en: "Dark Void",
      ja: "ダークホール",
    },
  },
  decorate: {
    id: "decorate",
    name: {
      en: "Decorate",
      ja: "デコレーション",
    },
  },
  "defend-order": {
    id: "defend-order",
    name: {
      en: "Defend Order",
      ja: "ぼうぎょしれい",
    },
  },
  "defense-curl": {
    id: "defense-curl",
    name: {
      en: "Defense Curl",
      ja: "まるくなる",
    },
  },
  "devastating-drake--physical": {
    id: "devastating-drake--physical",
    name: {
      en: "Devastating Drake",
      ja: "アルティメットドラゴンバーン",
    },
  },
  "devastating-drake--special": {
    id: "devastating-drake--special",
    name: {
      en: "Devastating Drake",
      ja: "アルティメットドラゴンバーン",
    },
  },
  "diamond-storm": {
    id: "diamond-storm",
    name: {
      en: "Diamond Storm",
      ja: "ダイヤストーム",
    },
  },
  "dire-claw": {
    id: "dire-claw",
    name: {
      en: "Dire Claw",
      ja: "フェイタルクロー",
    },
  },
  "dizzy-punch": {
    id: "dizzy-punch",
    name: {
      en: "Dizzy Punch",
      ja: "ピヨピヨパンチ",
    },
  },
  doodle: {
    id: "doodle",
    name: {
      en: "Doodle",
      ja: "うつしえ",
    },
  },
  "doom-desire": {
    id: "doom-desire",
    name: {
      en: "Doom Desire",
      ja: "はめつのねがい",
    },
  },
  "double-iron-bash": {
    id: "double-iron-bash",
    name: {
      en: "Double Iron Bash",
      ja: "ダブルパンツァー",
    },
  },
  "double-kick": {
    id: "double-kick",
    name: {
      en: "Double Kick",
      ja: "にどげり",
    },
  },
  "double-shock": {
    id: "double-shock",
    name: {
      en: "Double Shock",
      ja: "でんこうそうげき",
    },
  },
  "double-slap": {
    id: "double-slap",
    name: {
      en: "Double Slap",
      ja: "おうふくビンタ",
    },
  },
  "dragon-ascent": {
    id: "dragon-ascent",
    name: {
      en: "Dragon Ascent",
      ja: "ガリョウテンセイ",
    },
  },
  "dragon-breath": {
    id: "dragon-breath",
    name: {
      en: "Dragon Breath",
      ja: "りゅうのいぶき",
    },
  },
  "dragon-energy": {
    id: "dragon-energy",
    name: {
      en: "Dragon Energy",
      ja: "ドラゴンエナジー",
    },
  },
  "dragon-hammer": {
    id: "dragon-hammer",
    name: {
      en: "Dragon Hammer",
      ja: "ドラゴンハンマー",
    },
  },
  "dragon-rage": {
    id: "dragon-rage",
    name: {
      en: "Dragon Rage",
      ja: "りゅうのいかり",
    },
  },
  "dream-eater": {
    id: "dream-eater",
    name: {
      en: "Dream Eater",
      ja: "ゆめくい",
    },
  },
  "drum-beating": {
    id: "drum-beating",
    name: {
      en: "Drum Beating",
      ja: "ドラムアタック",
    },
  },
  "dual-chop": {
    id: "dual-chop",
    name: {
      en: "Dual Chop",
      ja: "ダブルチョップ",
    },
  },
  "dynamax-cannon": {
    id: "dynamax-cannon",
    name: {
      en: "Dynamax Cannon",
      ja: "ダイマックスほう",
    },
  },
  "echoed-voice": {
    id: "echoed-voice",
    name: {
      en: "Echoed Voice",
      ja: "エコーボイス",
    },
  },
  "eerie-spell": {
    id: "eerie-spell",
    name: {
      en: "Eerie Spell",
      ja: "ぶきみなじゅもん",
    },
  },
  "egg-bomb": {
    id: "egg-bomb",
    name: {
      en: "Egg Bomb",
      ja: "タマゴばくだん",
    },
  },
  electrify: {
    id: "electrify",
    name: {
      en: "Electrify",
      ja: "そうでん",
    },
  },
  "electro-drift": {
    id: "electro-drift",
    name: {
      en: "Electro Drift",
      ja: "イナズマドライブ",
    },
  },
  "electro-shot": {
    id: "electro-shot",
    name: {
      en: "Electro Shot",
      ja: "エレクトロビーム",
    },
  },
  embargo: {
    id: "embargo",
    name: {
      en: "Embargo",
      ja: "さしおさえ",
    },
  },
  ember: {
    id: "ember",
    name: {
      en: "Ember",
      ja: "ひのこ",
    },
  },
  eruption: {
    id: "eruption",
    name: {
      en: "Eruption",
      ja: "ふんか",
    },
  },
  "esper-wing": {
    id: "esper-wing",
    name: {
      en: "Esper Wing",
      ja: "オーラウイング",
    },
  },
  eternabeam: {
    id: "eternabeam",
    name: {
      en: "Eternabeam",
      ja: "ムゲンダイビーム",
    },
  },
  "extreme-evoboost": {
    id: "extreme-evoboost",
    name: {
      en: "Extreme Evoboost",
      ja: "ナインエボルブースト",
    },
  },
  "fairy-lock": {
    id: "fairy-lock",
    name: {
      en: "Fairy Lock",
      ja: "フェアリーロック",
    },
  },
  "fairy-wind": {
    id: "fairy-wind",
    name: {
      en: "Fairy Wind",
      ja: "ようせいのかぜ",
    },
  },
  "false-surrender": {
    id: "false-surrender",
    name: {
      en: "False Surrender",
      ja: "どげざつき",
    },
  },
  "false-swipe": {
    id: "false-swipe",
    name: {
      en: "False Swipe",
      ja: "みねうち",
    },
  },
  "feint-attack": {
    id: "feint-attack",
    name: {
      en: "Feint Attack",
      ja: "だましうち",
    },
  },
  "fickle-beam": {
    id: "fickle-beam",
    name: {
      en: "Fickle Beam",
      ja: "きまぐレーザー",
    },
  },
  "fiery-dance": {
    id: "fiery-dance",
    name: {
      en: "Fiery Dance",
      ja: "ほのおのまい",
    },
  },
  "fiery-wrath": {
    id: "fiery-wrath",
    name: {
      en: "Fiery Wrath",
      ja: "もえあがるいかり",
    },
  },
  "fillet-away": {
    id: "fillet-away",
    name: {
      en: "Fillet Away",
      ja: "みをけずる",
    },
  },
  "fire-lash": {
    id: "fire-lash",
    name: {
      en: "Fire Lash",
      ja: "ほのおのムチ",
    },
  },
  "fire-pledge": {
    id: "fire-pledge",
    name: {
      en: "Fire Pledge",
      ja: "ほのおのちかい",
    },
  },
  "fishious-rend": {
    id: "fishious-rend",
    name: {
      en: "Fishious Rend",
      ja: "エラがみ",
    },
  },
  fissure: {
    id: "fissure",
    name: {
      en: "Fissure",
      ja: "じわれ",
    },
  },
  "flame-burst": {
    id: "flame-burst",
    name: {
      en: "Flame Burst",
      ja: "はじけるほのお",
    },
  },
  "flame-wheel": {
    id: "flame-wheel",
    name: {
      en: "Flame Wheel",
      ja: "かえんぐるま",
    },
  },
  flash: {
    id: "flash",
    name: {
      en: "Flash",
      ja: "フラッシュ",
    },
  },
  "fleur-cannon": {
    id: "fleur-cannon",
    name: {
      en: "Fleur Cannon",
      ja: "フルールカノン",
    },
  },
  "floaty-fall": {
    id: "floaty-fall",
    name: {
      en: "Floaty Fall",
      ja: "ふわふわフォール",
    },
  },
  "floral-healing": {
    id: "floral-healing",
    name: {
      en: "Floral Healing",
      ja: "フラワーヒール",
    },
  },
  "flower-shield": {
    id: "flower-shield",
    name: {
      en: "Flower Shield",
      ja: "フラワーガード",
    },
  },
  "flying-press": {
    id: "flying-press",
    name: {
      en: "Flying Press",
      ja: "フライングプレス",
    },
  },
  "follow-me": {
    id: "follow-me",
    name: {
      en: "Follow Me",
      ja: "このゆびとまれ",
    },
  },
  "force-palm": {
    id: "force-palm",
    name: {
      en: "Force Palm",
      ja: "はっけい",
    },
  },
  foresight: {
    id: "foresight",
    name: {
      en: "Foresight",
      ja: "みやぶる",
    },
  },
  "forests-curse": {
    id: "forests-curse",
    name: {
      en: "Forest’s Curse",
      ja: "もりののろい",
    },
  },
  "freeze-dry": {
    id: "freeze-dry",
    name: {
      en: "Freeze-Dry",
      ja: "フリーズドライ",
    },
  },
  "freeze-shock": {
    id: "freeze-shock",
    name: {
      en: "Freeze Shock",
      ja: "フリーズボルト",
    },
  },
  "freezing-glare": {
    id: "freezing-glare",
    name: {
      en: "Freezing Glare",
      ja: "いてつくしせん",
    },
  },
  "freezy-frost": {
    id: "freezy-frost",
    name: {
      en: "Freezy Frost",
      ja: "こちこちフロスト",
    },
  },
  "frost-breath": {
    id: "frost-breath",
    name: {
      en: "Frost Breath",
      ja: "こおりのいぶき",
    },
  },
  frustration: {
    id: "frustration",
    name: {
      en: "Frustration",
      ja: "やつあたり",
    },
  },
  "fury-attack": {
    id: "fury-attack",
    name: {
      en: "Fury Attack",
      ja: "みだれづき",
    },
  },
  "fury-cutter": {
    id: "fury-cutter",
    name: {
      en: "Fury Cutter",
      ja: "れんぞくぎり",
    },
  },
  "fury-swipes": {
    id: "fury-swipes",
    name: {
      en: "Fury Swipes",
      ja: "みだれひっかき",
    },
  },
  "fusion-bolt": {
    id: "fusion-bolt",
    name: {
      en: "Fusion Bolt",
      ja: "クロスサンダー",
    },
  },
  "fusion-flare": {
    id: "fusion-flare",
    name: {
      en: "Fusion Flare",
      ja: "クロスフレイム",
    },
  },
  "gear-grind": {
    id: "gear-grind",
    name: {
      en: "Gear Grind",
      ja: "ギアソーサー",
    },
  },
  "gear-up": {
    id: "gear-up",
    name: {
      en: "Gear Up",
      ja: "アシストギア",
    },
  },
  "genesis-supernova": {
    id: "genesis-supernova",
    name: {
      en: "Genesis Supernova",
      ja: "オリジンズスーパーノヴァ",
    },
  },
  geomancy: {
    id: "geomancy",
    name: {
      en: "Geomancy",
      ja: "ジオコントロール",
    },
  },
  "gigaton-hammer": {
    id: "gigaton-hammer",
    name: {
      en: "Gigaton Hammer",
      ja: "デカハンマー",
    },
  },
  "gigavolt-havoc--physical": {
    id: "gigavolt-havoc--physical",
    name: {
      en: "Gigavolt Havoc",
      ja: "スパーキングギガボルト",
    },
  },
  "gigavolt-havoc--special": {
    id: "gigavolt-havoc--special",
    name: {
      en: "Gigavolt Havoc",
      ja: "スパーキングギガボルト",
    },
  },
  "glacial-lance": {
    id: "glacial-lance",
    name: {
      en: "Glacial Lance",
      ja: "ブリザードランス",
    },
  },
  glaciate: {
    id: "glaciate",
    name: {
      en: "Glaciate",
      ja: "こごえるせかい",
    },
  },
  "glaive-rush": {
    id: "glaive-rush",
    name: {
      en: "Glaive Rush",
      ja: "きょけんとつげき",
    },
  },
  glare: {
    id: "glare",
    name: {
      en: "Glare",
      ja: "へびにらみ",
    },
  },
  "glitzy-glow": {
    id: "glitzy-glow",
    name: {
      en: "Glitzy Glow",
      ja: "どばどばオーラ",
    },
  },
  "grass-pledge": {
    id: "grass-pledge",
    name: {
      en: "Grass Pledge",
      ja: "くさのちかい",
    },
  },
  "grass-whistle": {
    id: "grass-whistle",
    name: {
      en: "Grass Whistle",
      ja: "くさぶえ",
    },
  },
  "grav-apple": {
    id: "grav-apple",
    name: {
      en: "Grav Apple",
      ja: "Ｇのちから",
    },
  },
  growl: {
    id: "growl",
    name: {
      en: "Growl",
      ja: "なきごえ",
    },
  },
  grudge: {
    id: "grudge",
    name: {
      en: "Grudge",
      ja: "おんねん",
    },
  },
  "guard-split": {
    id: "guard-split",
    name: {
      en: "Guard Split",
      ja: "ガードシェア",
    },
  },
  "guardian-of-alola": {
    id: "guardian-of-alola",
    name: {
      en: "Guardian of Alola",
      ja: "ガーディアン・デ・アローラ",
    },
  },
  guillotine: {
    id: "guillotine",
    name: {
      en: "Guillotine",
      ja: "ハサミギロチン",
    },
  },
  gust: {
    id: "gust",
    name: {
      en: "Gust",
      ja: "かぜおこし",
    },
  },
  hail: {
    id: "hail",
    name: {
      en: "Hail",
      ja: "あられ",
    },
  },
  "happy-hour": {
    id: "happy-hour",
    name: {
      en: "Happy Hour",
      ja: "ハッピータイム",
    },
  },
  harden: {
    id: "harden",
    name: {
      en: "Harden",
      ja: "かたくなる",
    },
  },
  "head-charge": {
    id: "head-charge",
    name: {
      en: "Head Charge",
      ja: "アフロブレイク",
    },
  },
  headbutt: {
    id: "headbutt",
    name: {
      en: "Headbutt",
      ja: "ずつき",
    },
  },
  "headlong-rush": {
    id: "headlong-rush",
    name: {
      en: "Headlong Rush",
      ja: "ぶちかまし",
    },
  },
  "heal-bell": {
    id: "heal-bell",
    name: {
      en: "Heal Bell",
      ja: "いやしのすず",
    },
  },
  "heal-block": {
    id: "heal-block",
    name: {
      en: "Heal Block",
      ja: "かいふくふうじ",
    },
  },
  "heal-order": {
    id: "heal-order",
    name: {
      en: "Heal Order",
      ja: "かいふくしれい",
    },
  },
  "heart-stamp": {
    id: "heart-stamp",
    name: {
      en: "Heart Stamp",
      ja: "ハートスタンプ",
    },
  },
  "heart-swap": {
    id: "heart-swap",
    name: {
      en: "Heart Swap",
      ja: "ハートスワップ",
    },
  },
  "hidden-power": {
    id: "hidden-power",
    name: {
      en: "Hidden Power",
      ja: "めざめるパワー",
    },
  },
  "hold-back": {
    id: "hold-back",
    name: {
      en: "Hold Back",
      ja: "てかげん",
    },
  },
  "hold-hands": {
    id: "hold-hands",
    name: {
      en: "Hold Hands",
      ja: "てをつなぐ",
    },
  },
  "horn-attack": {
    id: "horn-attack",
    name: {
      en: "Horn Attack",
      ja: "つのでつく",
    },
  },
  "horn-drill": {
    id: "horn-drill",
    name: {
      en: "Horn Drill",
      ja: "つのドリル",
    },
  },
  "horn-leech": {
    id: "horn-leech",
    name: {
      en: "Horn Leech",
      ja: "ウッドホーン",
    },
  },
  "hydro-steam": {
    id: "hydro-steam",
    name: {
      en: "Hydro Steam",
      ja: "ハイドロスチーム",
    },
  },
  "hydro-vortex--physical": {
    id: "hydro-vortex--physical",
    name: {
      en: "Hydro Vortex",
      ja: "スーパーアクアトルネード",
    },
  },
  "hydro-vortex--special": {
    id: "hydro-vortex--special",
    name: {
      en: "Hydro Vortex",
      ja: "スーパーアクアトルネード",
    },
  },
  "hyper-drill": {
    id: "hyper-drill",
    name: {
      en: "Hyper Drill",
      ja: "ハイパードリル",
    },
  },
  "hyper-fang": {
    id: "hyper-fang",
    name: {
      en: "Hyper Fang",
      ja: "ひっさつまえば",
    },
  },
  "hyperspace-fury": {
    id: "hyperspace-fury",
    name: {
      en: "Hyperspace Fury",
      ja: "いじげんラッシュ",
    },
  },
  "hyperspace-hole": {
    id: "hyperspace-hole",
    name: {
      en: "Hyperspace Hole",
      ja: "いじげんホール",
    },
  },
  "ice-ball": {
    id: "ice-ball",
    name: {
      en: "Ice Ball",
      ja: "アイスボール",
    },
  },
  "ice-burn": {
    id: "ice-burn",
    name: {
      en: "Ice Burn",
      ja: "コールドフレア",
    },
  },
  "ice-hammer": {
    id: "ice-hammer",
    name: {
      en: "Ice Hammer",
      ja: "アイスハンマー",
    },
  },
  "ice-shard": {
    id: "ice-shard",
    name: {
      en: "Ice Shard",
      ja: "こおりのつぶて",
    },
  },
  "icicle-crash": {
    id: "icicle-crash",
    name: {
      en: "Icicle Crash",
      ja: "つららおとし",
    },
  },
  "icicle-spear": {
    id: "icicle-spear",
    name: {
      en: "Icicle Spear",
      ja: "つららばり",
    },
  },
  incinerate: {
    id: "incinerate",
    name: {
      en: "Incinerate",
      ja: "やきつくす",
    },
  },
  "infernal-parade": {
    id: "infernal-parade",
    name: {
      en: "Infernal Parade",
      ja: "ひゃっきやこう",
    },
  },
  "inferno-overdrive--physical": {
    id: "inferno-overdrive--physical",
    name: {
      en: "Inferno Overdrive",
      ja: "ダイナミックフルフレイム",
    },
  },
  "inferno-overdrive--special": {
    id: "inferno-overdrive--special",
    name: {
      en: "Inferno Overdrive",
      ja: "ダイナミックフルフレイム",
    },
  },
  instruct: {
    id: "instruct",
    name: {
      en: "Instruct",
      ja: "さいはい",
    },
  },
  "ion-deluge": {
    id: "ion-deluge",
    name: {
      en: "Ion Deluge",
      ja: "プラズマシャワー",
    },
  },
  "ivy-cudgel": {
    id: "ivy-cudgel",
    name: {
      en: "Ivy Cudgel",
      ja: "ツタこんぼう",
    },
  },
  "jaw-lock": {
    id: "jaw-lock",
    name: {
      en: "Jaw Lock",
      ja: "くらいつく",
    },
  },
  "jet-punch": {
    id: "jet-punch",
    name: {
      en: "Jet Punch",
      ja: "ジェットパンチ",
    },
  },
  judgment: {
    id: "judgment",
    name: {
      en: "Judgment",
      ja: "さばきのつぶて",
    },
  },
  "jump-kick": {
    id: "jump-kick",
    name: {
      en: "Jump Kick",
      ja: "とびげり",
    },
  },
  "jungle-healing": {
    id: "jungle-healing",
    name: {
      en: "Jungle Healing",
      ja: "ジャングルヒール",
    },
  },
  "karate-chop": {
    id: "karate-chop",
    name: {
      en: "Karate Chop",
      ja: "からてチョップ",
    },
  },
  kinesis: {
    id: "kinesis",
    name: {
      en: "Kinesis",
      ja: "スプーンまげ",
    },
  },
  "kings-shield": {
    id: "kings-shield",
    name: {
      en: "King’s Shield",
      ja: "キングシールド",
    },
  },
  "kowtow-cleave": {
    id: "kowtow-cleave",
    name: {
      en: "Kowtow Cleave",
      ja: "ドゲザン",
    },
  },
  "lands-wrath": {
    id: "lands-wrath",
    name: {
      en: "Land’s Wrath",
      ja: "グランドフォース",
    },
  },
  "laser-focus": {
    id: "laser-focus",
    name: {
      en: "Laser Focus",
      ja: "とぎすます",
    },
  },
  "lava-plume": {
    id: "lava-plume",
    name: {
      en: "Lava Plume",
      ja: "ふんえん",
    },
  },
  "leaf-tornado": {
    id: "leaf-tornado",
    name: {
      en: "Leaf Tornado",
      ja: "グラスミキサー",
    },
  },
  leafage: {
    id: "leafage",
    name: {
      en: "Leafage",
      ja: "このは",
    },
  },
  leer: {
    id: "leer",
    name: {
      en: "Leer",
      ja: "にらみつける",
    },
  },
  "lets-snuggle-forever": {
    id: "lets-snuggle-forever",
    name: {
      en: "Let’s Snuggle Forever",
      ja: "ぽかぼかフレンドタイム",
    },
  },
  lick: {
    id: "lick",
    name: {
      en: "Lick",
      ja: "したでなめる",
    },
  },
  "light-of-ruin": {
    id: "light-of-ruin",
    name: {
      en: "Light of Ruin",
      ja: "はめつのひかり",
    },
  },
  "light-that-burns-the-sky": {
    id: "light-that-burns-the-sky",
    name: {
      en: "Light That Burns the Sky",
      ja: "てんこがすめつぼうのひかり",
    },
  },
  "lovely-kiss": {
    id: "lovely-kiss",
    name: {
      en: "Lovely Kiss",
      ja: "あくまのキッス",
    },
  },
  "lucky-chant": {
    id: "lucky-chant",
    name: {
      en: "Lucky Chant",
      ja: "おまじない",
    },
  },
  "lumina-crash": {
    id: "lumina-crash",
    name: {
      en: "Lumina Crash",
      ja: "ルミナコリジョン",
    },
  },
  "lunar-blessing": {
    id: "lunar-blessing",
    name: {
      en: "Lunar Blessing",
      ja: "みかづきのいのり",
    },
  },
  "lunar-dance": {
    id: "lunar-dance",
    name: {
      en: "Lunar Dance",
      ja: "みかづきのまい",
    },
  },
  "luster-purge": {
    id: "luster-purge",
    name: {
      en: "Luster Purge",
      ja: "ラスターパージ",
    },
  },
  "mach-punch": {
    id: "mach-punch",
    name: {
      en: "Mach Punch",
      ja: "マッハパンチ",
    },
  },
  "magic-coat": {
    id: "magic-coat",
    name: {
      en: "Magic Coat",
      ja: "マジックコート",
    },
  },
  "magic-powder": {
    id: "magic-powder",
    name: {
      en: "Magic Powder",
      ja: "まほうのこな",
    },
  },
  "magic-room": {
    id: "magic-room",
    name: {
      en: "Magic Room",
      ja: "マジックルーム",
    },
  },
  "magical-leaf": {
    id: "magical-leaf",
    name: {
      en: "Magical Leaf",
      ja: "マジカルリーフ",
    },
  },
  "magical-torque": {
    id: "magical-torque",
    name: {
      en: "Magical Torque",
      ja: "マジカルアクセル",
    },
  },
  "magma-storm": {
    id: "magma-storm",
    name: {
      en: "Magma Storm",
      ja: "マグマストーム",
    },
  },
  "magnet-bomb": {
    id: "magnet-bomb",
    name: {
      en: "Magnet Bomb",
      ja: "マグネットボム",
    },
  },
  "magnetic-flux": {
    id: "magnetic-flux",
    name: {
      en: "Magnetic Flux",
      ja: "じばそうさ",
    },
  },
  magnitude: {
    id: "magnitude",
    name: {
      en: "Magnitude",
      ja: "マグニチュード",
    },
  },
  "malicious-moonsault": {
    id: "malicious-moonsault",
    name: {
      en: "Malicious Moonsault",
      ja: "ハイパーダーククラッシャー",
    },
  },
  "malignant-chain": {
    id: "malignant-chain",
    name: {
      en: "Malignant Chain",
      ja: "じゃどくのくさり",
    },
  },
  "mat-block": {
    id: "mat-block",
    name: {
      en: "Mat Block",
      ja: "たたみがえし",
    },
  },
  "matcha-gotcha": {
    id: "matcha-gotcha",
    name: {
      en: "Matcha Gotcha",
      ja: "シャカシャカほう",
    },
  },
  "max-airstream": {
    id: "max-airstream",
    name: {
      en: "Max Airstream",
      ja: "ダイジェット",
    },
  },
  "max-darkness": {
    id: "max-darkness",
    name: {
      en: "Max Darkness",
      ja: "ダイアーク",
    },
  },
  "max-flare": {
    id: "max-flare",
    name: {
      en: "Max Flare",
      ja: "ダイバーン",
    },
  },
  "max-flutterby": {
    id: "max-flutterby",
    name: {
      en: "Max Flutterby",
      ja: "ダイワーム",
    },
  },
  "max-geyser": {
    id: "max-geyser",
    name: {
      en: "Max Geyser",
      ja: "ダイストリーム",
    },
  },
  "max-guard": {
    id: "max-guard",
    name: {
      en: "Max Guard",
      ja: "ダイウォール",
    },
  },
  "max-hailstorm": {
    id: "max-hailstorm",
    name: {
      en: "Max Hailstorm",
      ja: "ダイアイス",
    },
  },
  "max-knuckle": {
    id: "max-knuckle",
    name: {
      en: "Max Knuckle",
      ja: "ダイナックル",
    },
  },
  "max-lightning": {
    id: "max-lightning",
    name: {
      en: "Max Lightning",
      ja: "ダイサンダー",
    },
  },
  "max-mindstorm": {
    id: "max-mindstorm",
    name: {
      en: "Max Mindstorm",
      ja: "ダイサイコ",
    },
  },
  "max-ooze": {
    id: "max-ooze",
    name: {
      en: "Max Ooze",
      ja: "ダイアシッド",
    },
  },
  "max-overgrowth": {
    id: "max-overgrowth",
    name: {
      en: "Max Overgrowth",
      ja: "ダイソウゲン",
    },
  },
  "max-phantasm": {
    id: "max-phantasm",
    name: {
      en: "Max Phantasm",
      ja: "ダイホロウ",
    },
  },
  "max-quake": {
    id: "max-quake",
    name: {
      en: "Max Quake",
      ja: "ダイアース",
    },
  },
  "max-rockfall": {
    id: "max-rockfall",
    name: {
      en: "Max Rockfall",
      ja: "ダイロック",
    },
  },
  "max-starfall": {
    id: "max-starfall",
    name: {
      en: "Max Starfall",
      ja: "ダイフェアリー",
    },
  },
  "max-steelspike": {
    id: "max-steelspike",
    name: {
      en: "Max Steelspike",
      ja: "ダイスチル",
    },
  },
  "max-strike": {
    id: "max-strike",
    name: {
      en: "Max Strike",
      ja: "ダイアタック",
    },
  },
  "max-wyrmwind": {
    id: "max-wyrmwind",
    name: {
      en: "Max Wyrmwind",
      ja: "ダイドラグーン",
    },
  },
  "me-first": {
    id: "me-first",
    name: {
      en: "Me First",
      ja: "さきどり",
    },
  },
  meditate: {
    id: "meditate",
    name: {
      en: "Meditate",
      ja: "ヨガのポーズ",
    },
  },
  "mega-drain": {
    id: "mega-drain",
    name: {
      en: "Mega Drain",
      ja: "メガドレイン",
    },
  },
  "mega-punch": {
    id: "mega-punch",
    name: {
      en: "Mega Punch",
      ja: "メガトンパンチ",
    },
  },
  "menacing-moonraze-maelstrom": {
    id: "menacing-moonraze-maelstrom",
    name: {
      en: "Menacing Moonraze Maelstrom",
      ja: "ムーンライトブラスター",
    },
  },
  "metal-burst": {
    id: "metal-burst",
    name: {
      en: "Metal Burst",
      ja: "メタルバースト",
    },
  },
  "metal-claw": {
    id: "metal-claw",
    name: {
      en: "Metal Claw",
      ja: "メタルクロー",
    },
  },
  "meteor-assault": {
    id: "meteor-assault",
    name: {
      en: "Meteor Assault",
      ja: "スターアサルト",
    },
  },
  metronome: {
    id: "metronome",
    name: {
      en: "Metronome",
      ja: "ゆびをふる",
    },
  },
  "mighty-cleave": {
    id: "mighty-cleave",
    name: {
      en: "Mighty Cleave",
      ja: "パワフルエッジ",
    },
  },
  "milk-drink": {
    id: "milk-drink",
    name: {
      en: "Milk Drink",
      ja: "ミルクのみ",
    },
  },
  mimic: {
    id: "mimic",
    name: {
      en: "Mimic",
      ja: "ものまね",
    },
  },
  "mind-blown": {
    id: "mind-blown",
    name: {
      en: "Mind Blown",
      ja: "ビックリヘッド",
    },
  },
  "mind-reader": {
    id: "mind-reader",
    name: {
      en: "Mind Reader",
      ja: "こころのめ",
    },
  },
  "miracle-eye": {
    id: "miracle-eye",
    name: {
      en: "Miracle Eye",
      ja: "ミラクルアイ",
    },
  },
  "mirror-move": {
    id: "mirror-move",
    name: {
      en: "Mirror Move",
      ja: "オウムがえし",
    },
  },
  "mirror-shot": {
    id: "mirror-shot",
    name: {
      en: "Mirror Shot",
      ja: "ミラーショット",
    },
  },
  mist: {
    id: "mist",
    name: {
      en: "Mist",
      ja: "しろいきり",
    },
  },
  "mist-ball": {
    id: "mist-ball",
    name: {
      en: "Mist Ball",
      ja: "ミストボール",
    },
  },
  "moongeist-beam": {
    id: "moongeist-beam",
    name: {
      en: "Moongeist Beam",
      ja: "シャドーレイ",
    },
  },
  "morning-sun": {
    id: "morning-sun",
    name: {
      en: "Morning Sun",
      ja: "あさのひざし",
    },
  },
  "mortal-spin": {
    id: "mortal-spin",
    name: {
      en: "Mortal Spin",
      ja: "キラースピン",
    },
  },
  "mountain-gale": {
    id: "mountain-gale",
    name: {
      en: "Mountain Gale",
      ja: "ひょうざんおろし",
    },
  },
  "mud-bomb": {
    id: "mud-bomb",
    name: {
      en: "Mud Bomb",
      ja: "どろばくだん",
    },
  },
  "mud-sport": {
    id: "mud-sport",
    name: {
      en: "Mud Sport",
      ja: "どろあそび",
    },
  },
  "multi-attack": {
    id: "multi-attack",
    name: {
      en: "Multi-Attack",
      ja: "マルチアタック",
    },
  },
  "mystical-power": {
    id: "mystical-power",
    name: {
      en: "Mystical Power",
      ja: "しんぴのちから",
    },
  },
  "natural-gift": {
    id: "natural-gift",
    name: {
      en: "Natural Gift",
      ja: "しぜんのめぐみ",
    },
  },
  "nature-power": {
    id: "nature-power",
    name: {
      en: "Nature Power",
      ja: "しぜんのちから",
    },
  },
  "natures-madness": {
    id: "natures-madness",
    name: {
      en: "Nature’s Madness",
      ja: "しぜんのいかり",
    },
  },
  "needle-arm": {
    id: "needle-arm",
    name: {
      en: "Needle Arm",
      ja: "ニードルアーム",
    },
  },
  "never-ending-nightmare--physical": {
    id: "never-ending-nightmare--physical",
    name: {
      en: "Never-Ending Nightmare",
      ja: "むげんあんやへのいざない",
    },
  },
  "never-ending-nightmare--special": {
    id: "never-ending-nightmare--special",
    name: {
      en: "Never-Ending Nightmare",
      ja: "むげんあんやへのいざない",
    },
  },
  "night-daze": {
    id: "night-daze",
    name: {
      en: "Night Daze",
      ja: "ナイトバースト",
    },
  },
  nightmare: {
    id: "nightmare",
    name: {
      en: "Nightmare",
      ja: "あくむ",
    },
  },
  "noxious-torque": {
    id: "noxious-torque",
    name: {
      en: "Noxious Torque",
      ja: "ポイズンアクセル",
    },
  },
  nuzzle: {
    id: "nuzzle",
    name: {
      en: "Nuzzle",
      ja: "ほっぺすりすり",
    },
  },
  "oblivion-wing": {
    id: "oblivion-wing",
    name: {
      en: "Oblivion Wing",
      ja: "デスウイング",
    },
  },
  obstruct: {
    id: "obstruct",
    name: {
      en: "Obstruct",
      ja: "ブロッキング",
    },
  },
  "oceanic-operetta": {
    id: "oceanic-operetta",
    name: {
      en: "Oceanic Operetta",
      ja: "わだつみのシンフォニア",
    },
  },
  octazooka: {
    id: "octazooka",
    name: {
      en: "Octazooka",
      ja: "オクタンほう",
    },
  },
  octolock: {
    id: "octolock",
    name: {
      en: "Octolock",
      ja: "たこがため",
    },
  },
  "odor-sleuth": {
    id: "odor-sleuth",
    name: {
      en: "Odor Sleuth",
      ja: "かぎわける",
    },
  },
  "ominous-wind": {
    id: "ominous-wind",
    name: {
      en: "Ominous Wind",
      ja: "あやしいかぜ",
    },
  },
  "order-up": {
    id: "order-up",
    name: {
      en: "Order Up",
      ja: "いっちょうあがり",
    },
  },
  "origin-pulse": {
    id: "origin-pulse",
    name: {
      en: "Origin Pulse",
      ja: "こんげんのはどう",
    },
  },
  overdrive: {
    id: "overdrive",
    name: {
      en: "Overdrive",
      ja: "オーバードライブ",
    },
  },
  "parabolic-charge": {
    id: "parabolic-charge",
    name: {
      en: "Parabolic Charge",
      ja: "パラボラチャージ",
    },
  },
  "pay-day": {
    id: "pay-day",
    name: {
      en: "Pay Day",
      ja: "ネコにこばん",
    },
  },
  peck: {
    id: "peck",
    name: {
      en: "Peck",
      ja: "つつく",
    },
  },
  "photon-geyser": {
    id: "photon-geyser",
    name: {
      en: "Photon Geyser",
      ja: "フォトンゲイザー",
    },
  },
  "pika-papow": {
    id: "pika-papow",
    name: {
      en: "Pika Papow",
      ja: "ピカピカサンダー",
    },
  },
  "plasma-fists": {
    id: "plasma-fists",
    name: {
      en: "Plasma Fists",
      ja: "プラズマフィスト",
    },
  },
  "play-nice": {
    id: "play-nice",
    name: {
      en: "Play Nice",
      ja: "なかよくする",
    },
  },
  "poison-gas": {
    id: "poison-gas",
    name: {
      en: "Poison Gas",
      ja: "どくガス",
    },
  },
  "poison-sting": {
    id: "poison-sting",
    name: {
      en: "Poison Sting",
      ja: "どくばり",
    },
  },
  "poison-tail": {
    id: "poison-tail",
    name: {
      en: "Poison Tail",
      ja: "ポイズンテール",
    },
  },
  "population-bomb": {
    id: "population-bomb",
    name: {
      en: "Population Bomb",
      ja: "ネズミざん",
    },
  },
  pound: {
    id: "pound",
    name: {
      en: "Pound",
      ja: "はたく",
    },
  },
  powder: {
    id: "powder",
    name: {
      en: "Powder",
      ja: "ふんじん",
    },
  },
  "powder-snow": {
    id: "powder-snow",
    name: {
      en: "Powder Snow",
      ja: "こなゆき",
    },
  },
  "power-shift": {
    id: "power-shift",
    name: {
      en: "Power Shift",
      ja: "パワーシフト",
    },
  },
  "power-split": {
    id: "power-split",
    name: {
      en: "Power Split",
      ja: "パワーシェア",
    },
  },
  "power-trick": {
    id: "power-trick",
    name: {
      en: "Power Trick",
      ja: "パワートリック",
    },
  },
  "power-up-punch": {
    id: "power-up-punch",
    name: {
      en: "Power-Up Punch",
      ja: "グロウパンチ",
    },
  },
  "precipice-blades": {
    id: "precipice-blades",
    name: {
      en: "Precipice Blades",
      ja: "だんがいのつるぎ",
    },
  },
  present: {
    id: "present",
    name: {
      en: "Present",
      ja: "プレゼント",
    },
  },
  "prismatic-laser": {
    id: "prismatic-laser",
    name: {
      en: "Prismatic Laser",
      ja: "プリズムレーザー",
    },
  },
  psybeam: {
    id: "psybeam",
    name: {
      en: "Psybeam",
      ja: "サイケこうせん",
    },
  },
  psyblade: {
    id: "psyblade",
    name: {
      en: "Psyblade",
      ja: "サイコブレイド ",
    },
  },
  "psycho-boost": {
    id: "psycho-boost",
    name: {
      en: "Psycho Boost",
      ja: "サイコブースト",
    },
  },
  "psycho-shift": {
    id: "psycho-shift",
    name: {
      en: "Psycho Shift",
      ja: "サイコシフト",
    },
  },
  "psyshield-bash": {
    id: "psyshield-bash",
    name: {
      en: "Psyshield Bash",
      ja: "バリアーラッシュ",
    },
  },
  psywave: {
    id: "psywave",
    name: {
      en: "Psywave",
      ja: "サイコウェーブ",
    },
  },
  "pulverizing-pancake": {
    id: "pulverizing-pancake",
    name: {
      en: "Pulverizing Pancake",
      ja: "ほんきをだす　こうげき",
    },
  },
  punishment: {
    id: "punishment",
    name: {
      en: "Punishment",
      ja: "おしおき",
    },
  },
  purify: {
    id: "purify",
    name: {
      en: "Purify",
      ja: "じょうか",
    },
  },
  pursuit: {
    id: "pursuit",
    name: {
      en: "Pursuit",
      ja: "おいうち",
    },
  },
  "pyro-ball": {
    id: "pyro-ball",
    name: {
      en: "Pyro Ball",
      ja: "かえんボール",
    },
  },
  quash: {
    id: "quash",
    name: {
      en: "Quash",
      ja: "さきおくり",
    },
  },
  "quiver-dance": {
    id: "quiver-dance",
    name: {
      en: "Quiver Dance",
      ja: "ちょうのまい",
    },
  },
  rage: {
    id: "rage",
    name: {
      en: "Rage",
      ja: "いかり",
    },
  },
  "rage-powder": {
    id: "rage-powder",
    name: {
      en: "Rage Powder",
      ja: "いかりのこな",
    },
  },
  "raging-bull": {
    id: "raging-bull",
    name: {
      en: "Raging Bull",
      ja: "レイジングブル",
    },
  },
  "raging-fury": {
    id: "raging-fury",
    name: {
      en: "Raging Fury",
      ja: "だいふんげき",
    },
  },
  "razor-leaf": {
    id: "razor-leaf",
    name: {
      en: "Razor Leaf",
      ja: "はっぱカッター",
    },
  },
  "razor-wind": {
    id: "razor-wind",
    name: {
      en: "Razor Wind",
      ja: "かまいたち",
    },
  },
  recycle: {
    id: "recycle",
    name: {
      en: "Recycle",
      ja: "リサイクル",
    },
  },
  refresh: {
    id: "refresh",
    name: {
      en: "Refresh",
      ja: "リフレッシュ",
    },
  },
  "relic-song": {
    id: "relic-song",
    name: {
      en: "Relic Song",
      ja: "いにしえのうた",
    },
  },
  retaliate: {
    id: "retaliate",
    name: {
      en: "Retaliate",
      ja: "かたきうち",
    },
  },
  return: {
    id: "return",
    name: {
      en: "Return",
      ja: "おんがえし",
    },
  },
  "revelation-dance": {
    id: "revelation-dance",
    name: {
      en: "Revelation Dance",
      ja: "めざめるダンス",
    },
  },
  revenge: {
    id: "revenge",
    name: {
      en: "Revenge",
      ja: "リベンジ",
    },
  },
  "revival-blessing": {
    id: "revival-blessing",
    name: {
      en: "Revival Blessing",
      ja: "さいきのいのり",
    },
  },
  "roar-of-time": {
    id: "roar-of-time",
    name: {
      en: "Roar of Time",
      ja: "ときのほうこう",
    },
  },
  "rock-climb": {
    id: "rock-climb",
    name: {
      en: "Rock Climb",
      ja: "ロッククライム",
    },
  },
  "rock-smash": {
    id: "rock-smash",
    name: {
      en: "Rock Smash",
      ja: "いわくだき",
    },
  },
  "rock-throw": {
    id: "rock-throw",
    name: {
      en: "Rock Throw",
      ja: "いわおとし",
    },
  },
  "rock-wrecker": {
    id: "rock-wrecker",
    name: {
      en: "Rock Wrecker",
      ja: "がんせきほう",
    },
  },
  "role-play": {
    id: "role-play",
    name: {
      en: "Role Play",
      ja: "なりきり",
    },
  },
  "rolling-kick": {
    id: "rolling-kick",
    name: {
      en: "Rolling Kick",
      ja: "まわしげり",
    },
  },
  rollout: {
    id: "rollout",
    name: {
      en: "Rollout",
      ja: "ころがる",
    },
  },
  rototiller: {
    id: "rototiller",
    name: {
      en: "Rototiller",
      ja: "たがやす",
    },
  },
  ruination: {
    id: "ruination",
    name: {
      en: "Ruination",
      ja: "カタストロフィ",
    },
  },
  "sacred-fire": {
    id: "sacred-fire",
    name: {
      en: "Sacred Fire",
      ja: "せいなるほのお",
    },
  },
  "sacred-sword": {
    id: "sacred-sword",
    name: {
      en: "Sacred Sword",
      ja: "せいなるつるぎ",
    },
  },
  "sand-attack": {
    id: "sand-attack",
    name: {
      en: "Sand Attack",
      ja: "すなかけ",
    },
  },
  "sandsear-storm": {
    id: "sandsear-storm",
    name: {
      en: "Sandsear Storm",
      ja: "ねっさのあらし",
    },
  },
  "sappy-seed": {
    id: "sappy-seed",
    name: {
      en: "Sappy Seed",
      ja: "すくすくボンバー",
    },
  },
  "savage-spin-out--physical": {
    id: "savage-spin-out--physical",
    name: {
      en: "Savage Spin-Out",
      ja: "ぜったいほしょくかいてんざん",
    },
  },
  "savage-spin-out--special": {
    id: "savage-spin-out--special",
    name: {
      en: "Savage Spin-Out",
      ja: "ぜったいほしょくかいてんざん",
    },
  },
  scratch: {
    id: "scratch",
    name: {
      en: "Scratch",
      ja: "ひっかく",
    },
  },
  "searing-shot": {
    id: "searing-shot",
    name: {
      en: "Searing Shot",
      ja: "かえんだん",
    },
  },
  "searing-sunraze-smash": {
    id: "searing-sunraze-smash",
    name: {
      en: "Searing Sunraze Smash",
      ja: "サンシャインスマッシャー",
    },
  },
  "secret-power": {
    id: "secret-power",
    name: {
      en: "Secret Power",
      ja: "ひみつのちから",
    },
  },
  "secret-sword": {
    id: "secret-sword",
    name: {
      en: "Secret Sword",
      ja: "しんぴのつるぎ",
    },
  },
  "seed-flare": {
    id: "seed-flare",
    name: {
      en: "Seed Flare",
      ja: "シードフレア",
    },
  },
  "shadow-blast": {
    id: "shadow-blast",
    name: {
      en: "Shadow Blast",
      ja: "ダークブラスト",
    },
  },
  "shadow-blitz": {
    id: "shadow-blitz",
    name: {
      en: "Shadow Blitz",
      ja: "ダークアタック",
    },
  },
  "shadow-bolt": {
    id: "shadow-bolt",
    name: {
      en: "Shadow Bolt",
      ja: "ダークサンダー",
    },
  },
  "shadow-bone": {
    id: "shadow-bone",
    name: {
      en: "Shadow Bone",
      ja: "シャドーボーン",
    },
  },
  "shadow-break": {
    id: "shadow-break",
    name: {
      en: "Shadow Break",
      ja: "ダークブレイク",
    },
  },
  "shadow-chill": {
    id: "shadow-chill",
    name: {
      en: "Shadow Chill",
      ja: "ダークフリーズ",
    },
  },
  "shadow-down": {
    id: "shadow-down",
    name: {
      en: "Shadow Down",
      ja: "ダークダウン",
    },
  },
  "shadow-end": {
    id: "shadow-end",
    name: {
      en: "Shadow End",
      ja: "ダークエンド",
    },
  },
  "shadow-fire": {
    id: "shadow-fire",
    name: {
      en: "Shadow Fire",
      ja: "ダークファイア",
    },
  },
  "shadow-force": {
    id: "shadow-force",
    name: {
      en: "Shadow Force",
      ja: "シャドーダイブ",
    },
  },
  "shadow-half": {
    id: "shadow-half",
    name: {
      en: "Shadow Half",
      ja: "ダークハーフ",
    },
  },
  "shadow-hold": {
    id: "shadow-hold",
    name: {
      en: "Shadow Hold",
      ja: "ダークホールド",
    },
  },
  "shadow-mist": {
    id: "shadow-mist",
    name: {
      en: "Shadow Mist",
      ja: "ダークミスト",
    },
  },
  "shadow-panic": {
    id: "shadow-panic",
    name: {
      en: "Shadow Panic",
      ja: "ダークパニック",
    },
  },
  "shadow-rave": {
    id: "shadow-rave",
    name: {
      en: "Shadow Rave",
      ja: "ダークレイブ",
    },
  },
  "shadow-rush": {
    id: "shadow-rush",
    name: {
      en: "Shadow Rush",
      ja: "ダークラッシュ",
    },
  },
  "shadow-shed": {
    id: "shadow-shed",
    name: {
      en: "Shadow Shed",
      ja: "ダークリムーブ",
    },
  },
  "shadow-sky": {
    id: "shadow-sky",
    name: {
      en: "Shadow Sky",
      ja: "ダークウェザー",
    },
  },
  "shadow-storm": {
    id: "shadow-storm",
    name: {
      en: "Shadow Storm",
      ja: "ダークストーム",
    },
  },
  "shadow-wave": {
    id: "shadow-wave",
    name: {
      en: "Shadow Wave",
      ja: "ダークウェーブ",
    },
  },
  sharpen: {
    id: "sharpen",
    name: {
      en: "Sharpen",
      ja: "かくばる",
    },
  },
  "shattered-psyche--physical": {
    id: "shattered-psyche--physical",
    name: {
      en: "Shattered Psyche",
      ja: "マキシマムサイブレイカー",
    },
  },
  "shattered-psyche--special": {
    id: "shattered-psyche--special",
    name: {
      en: "Shattered Psyche",
      ja: "マキシマムサイブレイカー",
    },
  },
  "sheer-cold": {
    id: "sheer-cold",
    name: {
      en: "Sheer Cold",
      ja: "ぜったいれいど",
    },
  },
  "shell-side-arm": {
    id: "shell-side-arm",
    name: {
      en: "Shell Side Arm",
      ja: "シェルアームズ",
    },
  },
  "shell-trap": {
    id: "shell-trap",
    name: {
      en: "Shell Trap",
      ja: "トラップシェル",
    },
  },
  shelter: {
    id: "shelter",
    name: {
      en: "Shelter",
      ja: "たてこもる",
    },
  },
  "shift-gear": {
    id: "shift-gear",
    name: {
      en: "Shift Gear",
      ja: "ギアチェンジ",
    },
  },
  "shock-wave": {
    id: "shock-wave",
    name: {
      en: "Shock Wave",
      ja: "でんげきは",
    },
  },
  "shore-up": {
    id: "shore-up",
    name: {
      en: "Shore Up",
      ja: "すなあつめ",
    },
  },
  "signal-beam": {
    id: "signal-beam",
    name: {
      en: "Signal Beam",
      ja: "シグナルビーム",
    },
  },
  "silk-trap": {
    id: "silk-trap",
    name: {
      en: "Silk Trap",
      ja: "スレッドトラップ",
    },
  },
  "silver-wind": {
    id: "silver-wind",
    name: {
      en: "Silver Wind",
      ja: "ぎんいろのかぜ",
    },
  },
  "simple-beam": {
    id: "simple-beam",
    name: {
      en: "Simple Beam",
      ja: "シンプルビーム",
    },
  },
  sing: {
    id: "sing",
    name: {
      en: "Sing",
      ja: "うたう",
    },
  },
  "sinister-arrow-raid": {
    id: "sinister-arrow-raid",
    name: {
      en: "Sinister Arrow Raid",
      ja: "シャドーアローズストライク",
    },
  },
  "sizzly-slide": {
    id: "sizzly-slide",
    name: {
      en: "Sizzly Slide",
      ja: "めらめらバーン",
    },
  },
  sketch: {
    id: "sketch",
    name: {
      en: "Sketch",
      ja: "スケッチ",
    },
  },
  "skull-bash": {
    id: "skull-bash",
    name: {
      en: "Skull Bash",
      ja: "ロケットずつき",
    },
  },
  "sky-drop": {
    id: "sky-drop",
    name: {
      en: "Sky Drop",
      ja: "フリーフォール",
    },
  },
  "sky-uppercut": {
    id: "sky-uppercut",
    name: {
      en: "Sky Uppercut",
      ja: "スカイアッパー",
    },
  },
  "slack-off": {
    id: "slack-off",
    name: {
      en: "Slack Off",
      ja: "なまける",
    },
  },
  slam: {
    id: "slam",
    name: {
      en: "Slam",
      ja: "たたきつける",
    },
  },
  slash: {
    id: "slash",
    name: {
      en: "Slash",
      ja: "きりさく",
    },
  },
  sludge: {
    id: "sludge",
    name: {
      en: "Sludge",
      ja: "ヘドロこうげき",
    },
  },
  "smelling-salts": {
    id: "smelling-salts",
    name: {
      en: "Smelling Salts",
      ja: "きつけ",
    },
  },
  smog: {
    id: "smog",
    name: {
      en: "Smog",
      ja: "スモッグ",
    },
  },
  smokescreen: {
    id: "smokescreen",
    name: {
      en: "Smokescreen",
      ja: "えんまく",
    },
  },
  "snap-trap": {
    id: "snap-trap",
    name: {
      en: "Snap Trap",
      ja: "トラバサミ",
    },
  },
  snatch: {
    id: "snatch",
    name: {
      en: "Snatch",
      ja: "よこどり",
    },
  },
  "snipe-shot": {
    id: "snipe-shot",
    name: {
      en: "Snipe Shot",
      ja: "ねらいうち",
    },
  },
  soak: {
    id: "soak",
    name: {
      en: "Soak",
      ja: "みずびたし",
    },
  },
  "soft-boiled": {
    id: "soft-boiled",
    name: {
      en: "Soft-Boiled",
      ja: "タマゴうみ",
    },
  },
  "sonic-boom": {
    id: "sonic-boom",
    name: {
      en: "Sonic Boom",
      ja: "ソニックブーム",
    },
  },
  "soul-stealing-7-star-strike": {
    id: "soul-stealing-7-star-strike",
    name: {
      en: "Soul-Stealing 7-Star Strike",
      ja: "しちせいだっこんたい",
    },
  },
  "spacial-rend": {
    id: "spacial-rend",
    name: {
      en: "Spacial Rend",
      ja: "あくうせつだん",
    },
  },
  spark: {
    id: "spark",
    name: {
      en: "Spark",
      ja: "スパーク",
    },
  },
  "sparkling-aria": {
    id: "sparkling-aria",
    name: {
      en: "Sparkling Aria",
      ja: "うたかたのアリア",
    },
  },
  "sparkly-swirl": {
    id: "sparkly-swirl",
    name: {
      en: "Sparkly Swirl",
      ja: "きらきらストーム",
    },
  },
  "spectral-thief": {
    id: "spectral-thief",
    name: {
      en: "Spectral Thief",
      ja: "シャドースチール",
    },
  },
  "speed-swap": {
    id: "speed-swap",
    name: {
      en: "Speed Swap",
      ja: "スピードスワップ",
    },
  },
  "spicy-extract": {
    id: "spicy-extract",
    name: {
      en: "Spicy Extract",
      ja: "ハバネロエキス",
    },
  },
  "spider-web": {
    id: "spider-web",
    name: {
      en: "Spider Web",
      ja: "クモのす",
    },
  },
  "spike-cannon": {
    id: "spike-cannon",
    name: {
      en: "Spike Cannon",
      ja: "とげキャノン",
    },
  },
  "spiky-shield": {
    id: "spiky-shield",
    name: {
      en: "Spiky Shield",
      ja: "ニードルガード",
    },
  },
  "spin-out": {
    id: "spin-out",
    name: {
      en: "Spin Out",
      ja: "ホイールスピン",
    },
  },
  splash: {
    id: "splash",
    name: {
      en: "Splash",
      ja: "はねる",
    },
  },
  "splintered-stormshards": {
    id: "splintered-stormshards",
    name: {
      en: "Splintered Stormshards",
      ja: "ラジアルエッジストーム",
    },
  },
  "splishy-splash": {
    id: "splishy-splash",
    name: {
      en: "Splishy Splash",
      ja: "ざぶざぶサーフ",
    },
  },
  spore: {
    id: "spore",
    name: {
      en: "Spore",
      ja: "キノコのほうし",
    },
  },
  spotlight: {
    id: "spotlight",
    name: {
      en: "Spotlight",
      ja: "スポットライト",
    },
  },
  "springtide-storm": {
    id: "springtide-storm",
    name: {
      en: "Springtide Storm",
      ja: "はるのあらし",
    },
  },
  "steam-eruption": {
    id: "steam-eruption",
    name: {
      en: "Steam Eruption",
      ja: "スチームバースト",
    },
  },
  steamroller: {
    id: "steamroller",
    name: {
      en: "Steamroller",
      ja: "ハードローラー",
    },
  },
  "sticky-web": {
    id: "sticky-web",
    name: {
      en: "Sticky Web",
      ja: "ねばねばネット",
    },
  },
  "stoked-sparksurfer": {
    id: "stoked-sparksurfer",
    name: {
      en: "Stoked Sparksurfer",
      ja: "ライトニングサーフライド",
    },
  },
  stomp: {
    id: "stomp",
    name: {
      en: "Stomp",
      ja: "ふみつけ",
    },
  },
  "stone-axe": {
    id: "stone-axe",
    name: {
      en: "Stone Axe",
      ja: "がんせきアックス",
    },
  },
  "strange-steam": {
    id: "strange-steam",
    name: {
      en: "Strange Steam",
      ja: "ワンダースチーム",
    },
  },
  strength: {
    id: "strength",
    name: {
      en: "Strength",
      ja: "かいりき",
    },
  },
  "string-shot": {
    id: "string-shot",
    name: {
      en: "String Shot",
      ja: "いとをはく",
    },
  },
  struggle: {
    id: "struggle",
    name: {
      en: "Struggle",
      ja: "わるあがき",
    },
  },
  "struggle-bug": {
    id: "struggle-bug",
    name: {
      en: "Struggle Bug",
      ja: "むしのていこう",
    },
  },
  "stuff-cheeks": {
    id: "stuff-cheeks",
    name: {
      en: "Stuff Cheeks",
      ja: "ほおばる",
    },
  },
  submission: {
    id: "submission",
    name: {
      en: "Submission",
      ja: "じごくぐるま",
    },
  },
  "subzero-slammer--physical": {
    id: "subzero-slammer--physical",
    name: {
      en: "Subzero Slammer",
      ja: "レイジングジオフリーズ",
    },
  },
  "subzero-slammer--special": {
    id: "subzero-slammer--special",
    name: {
      en: "Subzero Slammer",
      ja: "レイジングジオフリーズ",
    },
  },
  "sunsteel-strike": {
    id: "sunsteel-strike",
    name: {
      en: "Sunsteel Strike",
      ja: "メテオドライブ",
    },
  },
  supersonic: {
    id: "supersonic",
    name: {
      en: "Supersonic",
      ja: "ちょうおんぱ",
    },
  },
  "supersonic-skystrike--physical": {
    id: "supersonic-skystrike--physical",
    name: {
      en: "Supersonic Skystrike",
      ja: "ファイナルダイブクラッシュ",
    },
  },
  "supersonic-skystrike--special": {
    id: "supersonic-skystrike--special",
    name: {
      en: "Supersonic Skystrike",
      ja: "ファイナルダイブクラッシュ",
    },
  },
  "surging-strikes": {
    id: "surging-strikes",
    name: {
      en: "Surging Strikes",
      ja: "すいりゅうれんだ",
    },
  },
  "sweet-kiss": {
    id: "sweet-kiss",
    name: {
      en: "Sweet Kiss",
      ja: "てんしのキッス",
    },
  },
  swift: {
    id: "swift",
    name: {
      en: "Swift",
      ja: "スピードスター",
    },
  },
  synchronoise: {
    id: "synchronoise",
    name: {
      en: "Synchronoise",
      ja: "シンクロノイズ",
    },
  },
  "syrup-bomb": {
    id: "syrup-bomb",
    name: {
      en: "Syrup Bomb",
      ja: "みずあめボム",
    },
  },
  "tachyon-cutter": {
    id: "tachyon-cutter",
    name: {
      en: "Tachyon Cutter",
      ja: "タキオンカッター",
    },
  },
  tackle: {
    id: "tackle",
    name: {
      en: "Tackle",
      ja: "たいあたり",
    },
  },
  "tail-glow": {
    id: "tail-glow",
    name: {
      en: "Tail Glow",
      ja: "ほたるび",
    },
  },
  "tail-slap": {
    id: "tail-slap",
    name: {
      en: "Tail Slap",
      ja: "スイープビンタ",
    },
  },
  "tail-whip": {
    id: "tail-whip",
    name: {
      en: "Tail Whip",
      ja: "しっぽをふる",
    },
  },
  "take-down": {
    id: "take-down",
    name: {
      en: "Take Down",
      ja: "とっしん",
    },
  },
  "take-heart": {
    id: "take-heart",
    name: {
      en: "Take Heart",
      ja: "ブレイブチャージ",
    },
  },
  "tar-shot": {
    id: "tar-shot",
    name: {
      en: "Tar Shot",
      ja: "タールショット",
    },
  },
  "tearful-look": {
    id: "tearful-look",
    name: {
      en: "Tearful Look",
      ja: "なみだめ",
    },
  },
  teatime: {
    id: "teatime",
    name: {
      en: "Teatime",
      ja: "おちゃかい",
    },
  },
  "techno-blast": {
    id: "techno-blast",
    name: {
      en: "Techno Blast",
      ja: "テクノバスター",
    },
  },
  "tectonic-rage--physical": {
    id: "tectonic-rage--physical",
    name: {
      en: "Tectonic Rage",
      ja: "ライジングランドオーバー",
    },
  },
  "tectonic-rage--special": {
    id: "tectonic-rage--special",
    name: {
      en: "Tectonic Rage",
      ja: "ライジングランドオーバー",
    },
  },
  telekinesis: {
    id: "telekinesis",
    name: {
      en: "Telekinesis",
      ja: "テレキネシス",
    },
  },
  teleport: {
    id: "teleport",
    name: {
      en: "Teleport",
      ja: "テレポート",
    },
  },
  "tera-blast": {
    id: "tera-blast",
    name: {
      en: "Tera Blast",
      ja: "テラバースト",
    },
  },
  "tera-starstorm": {
    id: "tera-starstorm",
    name: {
      en: "Tera Starstorm",
      ja: "テラクラスター",
    },
  },
  "thousand-arrows": {
    id: "thousand-arrows",
    name: {
      en: "Thousand Arrows",
      ja: "サウザンアロー",
    },
  },
  "thousand-waves": {
    id: "thousand-waves",
    name: {
      en: "Thousand Waves",
      ja: "サウザンウェーブ",
    },
  },
  "thunder-cage": {
    id: "thunder-cage",
    name: {
      en: "Thunder Cage",
      ja: "サンダープリズン",
    },
  },
  "thunder-shock": {
    id: "thunder-shock",
    name: {
      en: "Thunder Shock",
      ja: "でんきショック",
    },
  },
  thunderclap: {
    id: "thunderclap",
    name: {
      en: "Thunderclap",
      ja: "じんらい",
    },
  },
  "thunderous-kick": {
    id: "thunderous-kick",
    name: {
      en: "Thunderous Kick",
      ja: "らいめいげり",
    },
  },
  "tidy-up": {
    id: "tidy-up",
    name: {
      en: "Tidy Up",
      ja: "おかたづけ",
    },
  },
  "toxic-thread": {
    id: "toxic-thread",
    name: {
      en: "Toxic Thread",
      ja: "どくのいと",
    },
  },
  transform: {
    id: "transform",
    name: {
      en: "Transform",
      ja: "へんしん",
    },
  },
  "trick-or-treat": {
    id: "trick-or-treat",
    name: {
      en: "Trick-or-Treat",
      ja: "ハロウィン",
    },
  },
  "triple-arrows": {
    id: "triple-arrows",
    name: {
      en: "Triple Arrows",
      ja: "３ぼんのや",
    },
  },
  "triple-dive": {
    id: "triple-dive",
    name: {
      en: "Triple Dive",
      ja: "トリプルダイブ",
    },
  },
  "triple-kick": {
    id: "triple-kick",
    name: {
      en: "Triple Kick",
      ja: "トリプルキック",
    },
  },
  "trop-kick": {
    id: "trop-kick",
    name: {
      en: "Trop Kick",
      ja: "トロピカルキック",
    },
  },
  "trump-card": {
    id: "trump-card",
    name: {
      en: "Trump Card",
      ja: "きりふだ",
    },
  },
  "twin-beam": {
    id: "twin-beam",
    name: {
      en: "Twin Beam",
      ja: "ツインビーム",
    },
  },
  twineedle: {
    id: "twineedle",
    name: {
      en: "Twineedle",
      ja: "ダブルニードル",
    },
  },
  "twinkle-tackle--physical": {
    id: "twinkle-tackle--physical",
    name: {
      en: "Twinkle Tackle",
      ja: "ラブリースターインパクト",
    },
  },
  "twinkle-tackle--special": {
    id: "twinkle-tackle--special",
    name: {
      en: "Twinkle Tackle",
      ja: "ラブリースターインパクト",
    },
  },
  twister: {
    id: "twister",
    name: {
      en: "Twister",
      ja: "たつまき",
    },
  },
  "v-create": {
    id: "v-create",
    name: {
      en: "V-create",
      ja: "Ｖジェネレート",
    },
  },
  "veevee-volley": {
    id: "veevee-volley",
    name: {
      en: "Veevee Volley",
      ja: "ブイブイブレイク",
    },
  },
  "venom-drench": {
    id: "venom-drench",
    name: {
      en: "Venom Drench",
      ja: "ベノムトラップ",
    },
  },
  "vice-grip": {
    id: "vice-grip",
    name: {
      en: "Vise Grip",
      ja: "はさむ",
    },
  },
  "victory-dance": {
    id: "victory-dance",
    name: {
      en: "Victory Dance",
      ja: "しょうりのまい",
    },
  },
  "vine-whip": {
    id: "vine-whip",
    name: {
      en: "Vine Whip",
      ja: "つるのムチ",
    },
  },
  "vital-throw": {
    id: "vital-throw",
    name: {
      en: "Vital Throw",
      ja: "あてみなげ",
    },
  },
  "volt-tackle": {
    id: "volt-tackle",
    name: {
      en: "Volt Tackle",
      ja: "ボルテッカー",
    },
  },
  "wake-up-slap": {
    id: "wake-up-slap",
    name: {
      en: "Wake-Up Slap",
      ja: "めざましビンタ",
    },
  },
  "water-gun": {
    id: "water-gun",
    name: {
      en: "Water Gun",
      ja: "みずでっぽう",
    },
  },
  "water-pledge": {
    id: "water-pledge",
    name: {
      en: "Water Pledge",
      ja: "みずのちかい",
    },
  },
  "water-sport": {
    id: "water-sport",
    name: {
      en: "Water Sport",
      ja: "みずあそび",
    },
  },
  "water-spout": {
    id: "water-spout",
    name: {
      en: "Water Spout",
      ja: "しおふき",
    },
  },
  "wicked-blow": {
    id: "wicked-blow",
    name: {
      en: "Wicked Blow",
      ja: "あんこくきょうだ",
    },
  },
  "wicked-torque": {
    id: "wicked-torque",
    name: {
      en: "Wicked Torque",
      ja: "ダークアクセル",
    },
  },
  "wildbolt-storm": {
    id: "wildbolt-storm",
    name: {
      en: "Wildbolt Storm",
      ja: "かみなりあらし",
    },
  },
  "wing-attack": {
    id: "wing-attack",
    name: {
      en: "Wing Attack",
      ja: "つばさでうつ",
    },
  },
  wish: {
    id: "wish",
    name: {
      en: "Wish",
      ja: "ねがいごと",
    },
  },
  withdraw: {
    id: "withdraw",
    name: {
      en: "Withdraw",
      ja: "からにこもる",
    },
  },
  "wood-hammer": {
    id: "wood-hammer",
    name: {
      en: "Wood Hammer",
      ja: "ウッドハンマー",
    },
  },
  "work-up": {
    id: "work-up",
    name: {
      en: "Work Up",
      ja: "ふるいたてる",
    },
  },
  "wring-out": {
    id: "wring-out",
    name: {
      en: "Wring Out",
      ja: "しぼりとる",
    },
  },
  "zing-zap": {
    id: "zing-zap",
    name: {
      en: "Zing Zap",
      ja: "びりびりちくちく",
    },
  },
  "zippy-zap": {
    id: "zippy-zap",
    name: {
      en: "Zippy Zap",
      ja: "ばちばちアクセル",
    },
  },
} as const satisfies Record<string, NameEntry>;

export type MoveNames = typeof moveNames;
