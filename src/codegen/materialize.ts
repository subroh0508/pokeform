/**
 * materialize.ts（codegen 純関数）— PokeAPI raw JSON から catalog の構造データ
 * （図鑑番号 / タイプ / 種族値 / 特性 id / 持ち物 category）を抽出・転記計画する純変換。
 * fs / YAML I/O は `scripts/materialize.ts`（薄い orchestrator・coverage 除外）が担う。
 *
 * 種族値・タイプ・特性・category の SoT を `data/raw` 直読から catalog YAML へ移すための転記材料
 * （raw=取得キャッシュ / catalog=SoT・[[data-pipeline]] / ADR 0027）。skill 著述値は
 * `planFields` で「既存尊重・上書きしない」（未設定のみ fill・差分は conflict 報告）。
 */

/** catalog/species.yaml の構造フィールド（H/A/B/C/D/S は能力ポイント表記に合わせた種族値）。 */
export interface SpeciesStructural {
  dex: number;
  types: string[];
  stats: { H: number; A: number; B: number; C: number; D: number; S: number };
  abilities: string[];
}

/** PokeAPI stat 名 → catalog stats キー（H/A/B/C/D/S）。 */
const STAT_KEY: Record<string, keyof SpeciesStructural["stats"]> = {
  hp: "H",
  attack: "A",
  defense: "B",
  "special-attack": "C",
  "special-defense": "D",
  speed: "S",
};

interface RawPokemon {
  stats: { base_stat: number; stat: { name: string } }[];
  types: { type: { name: string } }[];
  abilities: { ability: { name: string } }[];
}
interface RawSpecies {
  id: number;
}
interface RawItem {
  category: { name: string };
}

/**
 * raw pokemon + pokemon-species から構造データを抽出する。`dex` は national 図鑑番号
 * （メガ等のフォルムは base 種族の番号を共有するため pokemon-species 側から引く）。
 */
export function extractSpeciesStructural(
  pokemon: RawPokemon,
  species: RawSpecies,
): SpeciesStructural {
  const stats: SpeciesStructural["stats"] = { H: 0, A: 0, B: 0, C: 0, D: 0, S: 0 };
  for (const s of pokemon.stats) {
    const key = STAT_KEY[s.stat.name];
    if (key) stats[key] = s.base_stat;
  }
  return {
    dex: species.id,
    types: pokemon.types.map((t) => t.type.name),
    stats,
    abilities: pokemon.abilities.map((a) => a.ability.name),
  };
}

/** raw item から持ち物 category を抽出する。 */
export function extractItemCategory(item: RawItem): string {
  return item.category.name;
}

/** 転記計画: 未設定フィールドは fill・既存と raw が食い違うフィールドは conflict（上書きしない）。 */
export interface FieldPlan<T> {
  /** 未設定のため raw 由来値で埋めるフィールド。 */
  fill: Partial<T>;
  /** 既存値が raw と異なるフィールド（skill 著述値尊重で上書きしない・要目視）。 */
  conflicts: { key: keyof T; existing: unknown; fresh: unknown }[];
}

/**
 * 既存 catalog 値（`existing`）と raw 由来値（`fresh`）を比較し、転記計画を作る。
 * **append/既存尊重**: 未設定（`undefined`）のみ `fill` し、既に値があるフィールドは raw と異なっても
 * 上書きせず `conflicts` に積む（Champions 実態に合わせた skill 著述値を保護する）。
 */
export function planFields<T extends object>(existing: Partial<T>, fresh: T): FieldPlan<T> {
  const fill: Partial<T> = {};
  const conflicts: FieldPlan<T>["conflicts"] = [];
  for (const key of Object.keys(fresh) as (keyof T)[]) {
    if (existing[key] === undefined) {
      fill[key] = fresh[key];
    } else if (JSON.stringify(existing[key]) !== JSON.stringify(fresh[key])) {
      conflicts.push({ key, existing: existing[key], fresh: fresh[key] });
    }
  }
  return { fill, conflicts };
}
