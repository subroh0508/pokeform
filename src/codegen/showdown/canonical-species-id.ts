/**
 * canonical-species-id.ts（showdown codegen 純関数）— showdown の種族表示名を **pokeform 独自の短い
 * canonical species id** へ正規化する species 専用層。canonical id の単一 SoT。
 *
 * pokeform の species id 正本は **短い canonical**（`urshifu-single` / `tauros-paldea-combat` /
 * `minior-meteor` 等）で、PokeAPI variety slug（`urshifu-single-strike` / `tauros-paldea-combat-breed` /
 * `minior-red-meteor`）の冗長な接尾辞（`-strike` / `-breed` / `-mask` / `-plumage` / `-segment` /
 * `-striped` / `-power-construct` / `family-of-`）を落とした形。**構造側（showdown 名 → canonical）と
 * 名前側（PokeAPI slug → canonical・`fetch-pokeapi.ts`）の両経路がこの `canonicalFormId` を最終段に
 * 通す**ことで、どちらの入力からも同じ canonical へ収束する（canonical を単一 SoT にする）。
 *
 * showdown の表示名（`name`）は baseSpecies + forme を既に内包する（`Rotom-Wash` / `Necrozma-Dusk-Mane`）
 * ため、`name` のみで canonical を導出できる。汎用正規化 `kebabId`（[`ids`](./ids.ts)）で lowercase kebab へ
 * 畳んでから、下記 3 種の curated / 有界マップで綴りを写し、いずれにも無ければ `canonicalFormId` で
 * 冗長接尾辞を落として返す（構造データ = baseStats / types / legality は不変）。
 * 判断分岐を持つ純関数ゆえカバレッジ 100% ゲート対象（[[testing]]）。
 */

import { kebabId } from "./ids.ts";

/**
 * default→明示: showdown が bare id で持つデフォルトフォルムを **短い canonical** の明示 id へ。
 * 原種が無い対等フォルム（urshifu 一撃・deoxys ノーマル等）は bare だと曖昧になるため明示 id を振る。
 * **`SUPPRESS_BASE_SPECIES`（bare base を名前辞書から抑制する種）は bare default を明示 id へ写す**（性別二形は
 * `-male`、zygarde は `-50`）— 構造側 roster と名前側 form 集合を一致させる。値は最終 canonical（既に短い形ゆえ
 * `canonicalFormId` を再適用しない）。
 */
const DEFAULT_TO_EXPLICIT: Record<string, string> = {
  urshifu: "urshifu-single",
  deoxys: "deoxys-normal",
  basculegion: "basculegion-male",
  indeedee: "indeedee-male",
  meowstic: "meowstic-male",
  oinkologne: "oinkologne-male",
  zygarde: "zygarde-50",
  // 開始フォルムが一意に定まらない種（`SUPPRESS_BASE_SPECIES`）の bare default を、showdown が bare で emit する
  // 既定 variety の明示 id へ写す（hoopa / gimmighoul は `CANONICAL_ID_OVERRIDE`、deoxys / urshifu は上に既出）。
  keldeo: "keldeo-ordinary",
  basculin: "basculin-red",
  pumpkaboo: "pumpkaboo-average",
  gourgeist: "gourgeist-average",
  squawkabilly: "squawkabilly-green",
  maushold: "maushold-four",
  dudunsparce: "dudunsparce-two",
  lycanroc: "lycanroc-midday",
  oricorio: "oricorio-baile",
  wormadam: "wormadam-plant",
  giratina: "giratina-altered",
  shaymin: "shaymin-land",
  thundurus: "thundurus-incarnate",
  tornadus: "tornadus-incarnate",
  landorus: "landorus-incarnate",
  enamorus: "enamorus-incarnate",
};

/**
 * **bare base id を名前辞書（`languages/species.yaml`）から抑制する種**。bare base は PokeAPI `pokemon-species` list に
 * 載るが、実体（対戦で登録する形態）は明示 form であり base 名が冗長 / 曖昧になるため出さず、明示 form だけを列挙する
 * （転記段 `scripts/materialize.ts` が bare base を skip）。構造側は `DEFAULT_TO_EXPLICIT` / `CANONICAL_ID_OVERRIDE` で
 * bare default を明示 id へ写し、name/structure の form 集合を一致させる。対象:
 * - **性別二形**（genderless な base を持たずオス／メスのみ）: basculegion / indeedee / meowstic / oinkologne（→ `-male` / `-female`）。
 * - **開始フォルムが一意に定まらない種**（複数フォルムのいずれも開始フォルムになりうるため bare base が曖昧）:
 *   zygarde / deoxys / keldeo / hoopa / basculin / urshifu / pumpkaboo / gourgeist / squawkabilly / maushold /
 *   dudunsparce / lycanroc / oricorio / wormadam / giratina / shaymin / thundurus / tornadus / landorus / enamorus /
 *   gimmighoul / ogerpon（面を選んで持ち込むため bare は曖昧・default = teal を `ogerpon-teal` へ）。
 *   開始フォルムが一意な種（rotom / tauros / 各リージョンフォルム / aegislash / mimikyu / darmanitan 等）は bare base を残す。
 */
export const SUPPRESS_BASE_SPECIES: ReadonlySet<string> = new Set([
  "basculegion",
  "indeedee",
  "meowstic",
  "oinkologne",
  "zygarde",
  "deoxys",
  "keldeo",
  "hoopa",
  "basculin",
  "urshifu",
  "pumpkaboo",
  "gourgeist",
  "squawkabilly",
  "maushold",
  "dudunsparce",
  "lycanroc",
  "oricorio",
  "wormadam",
  "giratina",
  "shaymin",
  "thundurus",
  "tornadus",
  "landorus",
  "enamorus",
  "gimmighoul",
  "ogerpon",
]);

/**
 * Class C 語彙差: showdown forme 綴りと canonical が体系的に食い違うもの（接尾辞除去では表せない語彙差）。
 * どちらも同一 variety を指すが表記が異なるため canonical へ写す。値は最終 canonical。
 * 接尾辞除去だけで写せる差（`Tauros-Paldea-Combat` / `Ogerpon-Wellspring` / `Urshifu-Rapid-Strike` 等）は
 * ここに置かず passthrough で `canonicalFormId` に委ねる。
 */
const CLASS_C_VOCAB: Record<string, string> = {
  "necrozma-dusk-mane": "necrozma-dusk",
  "necrozma-dawn-wings": "necrozma-dawn",
  "greninja-bond": "greninja-battle-bond",
};

/**
 * CANONICAL_ID_OVERRIDE: PokeAPI / showdown が bare にするデフォルトを、pokeform では明示分割したいもの。
 * 例 gimmighoul（default = bare `gimmighoul`（はこ））を `gimmighoul-chest`、hoopa（bare = いましめられし）を
 * `hoopa-confined`、castform（bare = ノーマル）を `castform-normal` と明示する（他フォルムは既に明示 slug を持つ）。
 * **構造側・名前側の bare default 双方がこのマップを参照**して同じ明示 canonical へ写す。
 */
export const CANONICAL_ID_OVERRIDE: Record<string, string> = {
  gimmighoul: "gimmighoul-chest",
  hoopa: "hoopa-confined",
  castform: "castform-normal",
  // オーガポンの default（bare = teal mask）を `ogerpon-teal`（みどりのめん）へ。他 3 面（wellspring / hearthflame /
  // cornerstone）と対称に明示 form 化し、bare base は `SUPPRESS_BASE_SPECIES` で抑制する。
  ogerpon: "ogerpon-teal",
};

/**
 * 接尾辞除去では表せない個別リネーム（slug → 短い canonical）。両経路（構造側 `canonicalSpeciesId` の
 * passthrough / 名前側 PokeAPI slug / mega 側 `megaId`）が通る `canonicalFormId` の curated マップ。
 * - メテノの代表 meteor フォルムを `minior-red-meteor`（色付き）から色を落とした `minior-meteor` に畳む
 *   （7 色メテオは同型・代表 1 件のみ残す）。
 * - **性別二形**（showdown の女 forme id `<種>-f`）を languages（PokeAPI 由来）の `-female` へ揃える。男は
 *   bare→`-male` を `DEFAULT_TO_EXPLICIT` が処理済みゆえ女のみ。PokeAPI 名前側は `-female` を直接 emit する
 *   ため本マップのキー（`-f`）とは衝突せず、showdown 経路だけを写す。gender **メガ**（`meowstic-f-mega` /
 *   `meowstic-m-mega`）も同じ curated 経路で `languages/mega.yaml`（`-female-mega` / `-male-mega`）へ揃える
 *   （per-gender で忠実に写す・♂♀を単一へ畳むかは generate が stats/types/ability/learnset 一致で判定・ADR 0046）。
 */
const FORM_SLUG_RENAME: Record<string, string> = {
  "minior-red-meteor": "minior-meteor",
  "basculegion-f": "basculegion-female",
  "meowstic-f": "meowstic-female",
  "indeedee-f": "indeedee-female",
  "oinkologne-f": "oinkologne-female",
  "meowstic-f-mega": "meowstic-female-mega",
  "meowstic-m-mega": "meowstic-male-mega",
};

/**
 * canonical で冗長な form 接尾辞（PokeAPI variety slug 由来）。各接尾辞は対象種で一意ゆえ誤爆しない
 * （`-strike`=urshifu / `-mask`=ogerpon / `-breed`=tauros / `-plumage`=squawkabilly / `-segment`=dudunsparce /
 * `-striped`=basculin / `-power-construct`=zygarde）。`family-of-` は infix ゆえ別途畳む（maushold）。
 */
const REDUNDANT_FORM_SUFFIX = /-(breed|power-construct|plumage|strike|mask|segment|striped)$/;

/**
 * form slug（PokeAPI variety slug / showdown kebab）→ 短い canonical id。個別リネーム（`FORM_SLUG_RENAME`）を
 * 優先し、無ければ `family-of-` infix を畳んで冗長接尾辞を落とす。既に短い canonical には冪等（no-op）。
 * 構造側・名前側の共通正規化段で、両経路を同じ canonical へ収束させる単一 SoT。
 */
export function canonicalFormId(slug: string): string {
  const renamed = FORM_SLUG_RENAME[slug];
  if (renamed !== undefined) return renamed;
  return slug.replace("-family-of-", "-").replace(REDUNDANT_FORM_SUFFIX, "");
}

/**
 * showdown 表示名 → canonical species id（短い canonical・単一 SoT）。
 * `kebabId` で lowercase kebab へ畳んでから 3 種マップで語彙差を写し、いずれにも無ければ `canonicalFormId` で
 * 冗長接尾辞を落として返す（原種/基本フォルムしか無い種 = `raichu` / `charizard` / `rotom-wash` は素通り）。
 */
export function canonicalSpeciesId(name: string): string {
  const id = kebabId(name);
  const mapped = DEFAULT_TO_EXPLICIT[id] ?? CLASS_C_VOCAB[id] ?? CANONICAL_ID_OVERRIDE[id];
  return mapped ?? canonicalFormId(id);
}
