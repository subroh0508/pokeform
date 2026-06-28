/**
 * scripts/showdown/dex.ts — pokemon-showdown ツリーで動く抽出層の共通基盤。
 *
 * `champions-data.ts`（プロトタイプ）の共通部分（mod 解決 / calculatePP / isUsable* フィルタ /
 * メガ判定 / 持ち物 category）を切り出したもの。`../../sim/dex` を import するため pokeform の
 * `tsconfig.json` の `exclude` に `scripts/showdown/**` を追加し typecheck/coverage 対象外とする
 * （配置は `pokemon-showdown/tools/showdown/` ＝ root から 2 階層）。
 *
 * CI では `scripts/showdown/` を `pokemon-showdown/tools/showdown/` へ copy → `node build` → 実行する。
 */

import { Dex, toID } from "../../sim/dex";

/** 解決されたレギュレーションのメタ情報。 */
export interface RegulationMeta {
  /** 呼び出し時に渡された文字列 */
  input: string;
  /** 解決されたフォーマット名（フォーマットとして解決できた場合） */
  format: string | null;
  /** 実際に使われた mod 名（例: champions / championsregma） */
  mod: string;
  /** singles / doubles など（フォーマットとして解決できた場合） */
  gameType: string | null;
}

export type ModdedDex = ReturnType<typeof Dex.mod>;

/**
 * レギュレーション文字列（フォーマット名 / 別名 / mod 名）から ModdedDex とメタを解決する。
 */
export function resolveRegulation(regulation: string): { dex: ModdedDex; meta: RegulationMeta } {
  const format = Dex.formats.get(regulation);
  if (format.exists) {
    const dex = Dex.mod(format.mod).includeData();
    return {
      dex,
      meta: {
        input: regulation,
        format: format.name,
        mod: format.mod,
        gameType: format.gameType || null,
      },
    };
  }

  // フォーマットとして見つからなければ mod 名として扱う
  const modId = toID(regulation);
  const dex = Dex.mod(modId).includeData();
  if (dex.currentMod !== modId) {
    throw new Error(`Regulation "${regulation}" was not found as a format or a mod.`);
  }
  return { dex, meta: { input: regulation, format: null, mod: dex.currentMod, gameType: null } };
}

/**
 * チャンピオンズの実 PP を算出する。mod が calculatePP を上書きしている場合
 * （champions / championsregma）はそれを使う（(pp/5+1)*4 = 8/12/16/20、noPPBoosts は据置）。
 */
export function realPP(dex: ModdedDex, move: Move): number {
  const calc = (dex.data as AnyObject).Scripts?.calculatePP;
  if (typeof calc === "function") return calc(move, 3);
  return (move as AnyObject).noPPBoosts ? move.pp : (move.pp / 5 + 1) * 4;
}

/** メガシンカ・ゲンシカイキ（原始）のフォルムか。 */
export function isMegaForme(species: Species): boolean {
  return !!(
    species.isMega ||
    species.isPrimal ||
    ["Mega", "Mega-X", "Mega-Y", "Primal"].includes(species.forme)
  );
}

/** レギュレーションで「使用可能」とみなす種族か（CHAMPIONS-DATA.md §4）。 */
export function isUsableSpecies(species: Species): boolean {
  return (
    species.exists &&
    species.num > 0 &&
    species.isNonstandard !== "Past" &&
    species.isNonstandard !== "Future" &&
    species.tier !== "Illegal" &&
    species.tier !== "Unreleased"
  );
}

/** レギュレーションで「使用可能」とみなす持ち物か。 */
export function isUsableItem(item: Item): boolean {
  return item.exists && item.num >= 0 && item.isNonstandard == null;
}

/** 持ち物の分類（megastone / berry / other）。 */
export function itemCategory(item: Item): "megastone" | "berry" | "other" {
  if (item.megaStone) return "megastone";
  if (item.isBerry) return "berry";
  return "other";
}

/** 使用可能な種族（メガ含む全フォルム）を num 昇順で返す。 */
export function usableSpecies(dex: ModdedDex): Species[] {
  return dex.species
    .all()
    .filter(isUsableSpecies)
    .sort((a, b) => a.num - b.num || a.name.localeCompare(b.name));
}

/** 種族が覚えられる技の **showdown 表示名**（アルファベット順）。 */
export function learnsetNames(dex: ModdedDex, species: Species): string[] {
  const learnsetData = dex.species.getLearnsetData(species.id).learnset || {};
  return Object.keys(learnsetData)
    .map((id) => dex.moves.get(id).name)
    .sort((a, b) => a.localeCompare(b));
}
