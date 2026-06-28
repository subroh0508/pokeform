/**
 * ids.ts（showdown codegen 純関数）— showdown の表示名（`name`）から pokeform の安定 kebab id へ
 * 正規化する共通ヘルパと、種族値テーブルの能力ポイント表記（H/A/B/C/D/S）への写像。
 *
 * 抽出層（`scripts/showdown/`）は showdown の squashed id（`rotomwash`）も JSON に載せるが、SoT YAML の
 * id は PokeAPI と同じ kebab（`rotom-wash`）なので **name から導出**する（squashed id では復元できない）。
 * 判断分岐を持つ純関数ゆえカバレッジ 100% ゲート対象（[[testing]]）。
 */

/** 能力ポイント表記の種族値テーブル（H/A/B/C/D/S）。 */
export interface StatsTable {
  H: number;
  A: number;
  B: number;
  C: number;
  D: number;
  S: number;
}

/** showdown の baseStats（hp/atk/def/spa/spd/spe）。 */
export interface ShowdownBaseStats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

/**
 * showdown 表示名 → 安定 kebab id。lowercase 化し、アポストロフィ（'・’）を除去してから
 * 非英数字の連なりを単一ハイフンに畳み、両端のハイフンを落とす。
 * 例: `Rotom-Wash`→`rotom-wash` / `King's Rock`→`kings-rock` / `Charizardite X`→`charizardite-x`。
 */
export function kebabId(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** showdown のタイプ名（`Grass`）→ 小文字 id（`grass`）。 */
export function toTypeId(type: string): string {
  return type.toLowerCase();
}

/** showdown baseStats → 能力ポイント表記の種族値テーブル（H/A/B/C/D/S）。 */
export function toStatsTable(baseStats: ShowdownBaseStats): StatsTable {
  return {
    H: baseStats.hp,
    A: baseStats.atk,
    B: baseStats.def,
    C: baseStats.spa,
    D: baseStats.spd,
    S: baseStats.spe,
  };
}
