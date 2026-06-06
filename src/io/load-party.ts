import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import matter from "gray-matter";
import { parse as parseYaml } from "yaml";
import { itemDex } from "../../data/generated/items.ts";
import { moveDex } from "../../data/generated/moves.ts";
import { itemIdByJa, moveIdByJa, speciesIdByJa } from "../../data/generated/names.ts";
import { speciesDex } from "../../data/generated/species.ts";
import type { ResolvedMember, ResolvedParty } from "../domain/party-analysis.ts";
import { type NameMaps, resolveName } from "../domain/resolve-names.ts";
import type { IndividualFile, Lang, PartyFrontmatter } from "../types/party.ts";

/**
 * パーティ Markdown と個体 YAML を読み、パス解決 + 名称 ID 正規化済みの ResolvedParty へ変換する
 * 薄い I/O 層（カバレッジ対象外）。名称解決の純ロジックは domain/resolve-names、検証 / 分析は
 * domain/party-analysis が担う（[[cli-and-io]]）。生成済み逆引きマップで日英入力を ID へ寄せる。
 */

const speciesMaps: NameMaps = { idByJa: speciesIdByJa, ids: new Set(Object.keys(speciesDex)) };
const moveMaps: NameMaps = { idByJa: moveIdByJa, ids: new Set(Object.keys(moveDex)) };
const itemMaps: NameMaps = { idByJa: itemIdByJa, ids: new Set(Object.keys(itemDex)) };

/** 読み込んだパーティ（表示名 + 解決済みパーティ本体）。 */
export interface LoadedParty {
  readonly name: string;
  readonly party: ResolvedParty;
}

const idOrNull = (raw: string | undefined, lang: Lang, maps: NameMaps): string | null => {
  if (raw === undefined) return null;
  const r = resolveName(raw, lang, maps);
  return r.ok ? r.id : null;
};

const loadMember = async (rel: string, baseDir: string): Promise<ResolvedMember> => {
  const abs = resolve(baseDir, rel);
  if (!existsSync(abs)) {
    return {
      path: rel,
      found: false,
      speciesName: rel,
      speciesId: null,
      itemId: null,
      moveIds: [],
    };
  }
  const ind = parseYaml(await readFile(abs, "utf8")) as IndividualFile;
  const lang: Lang = ind.lang ?? "ja";
  const moveIds = (ind.moves ?? [])
    .map((m) => idOrNull(m, lang, moveMaps))
    .filter((id): id is string => id !== null);
  return {
    path: rel,
    found: true,
    speciesName: ind.species,
    speciesId: idOrNull(ind.species, lang, speciesMaps),
    itemId: idOrNull(ind.item, lang, itemMaps),
    moveIds,
  };
};

/** 1 つのパーティ Markdown を読み込み、解決済み ResolvedParty を返す。 */
export const loadParty = async (path: string): Promise<LoadedParty> => {
  const abs = resolve(path);
  const { data } = matter(await readFile(abs, "utf8"));
  const fm = data as PartyFrontmatter;
  const baseDir = dirname(abs);
  const members = await Promise.all((fm.members ?? []).map((rel) => loadMember(rel, baseDir)));
  return {
    name: fm.party ?? path,
    party: { regulation: fm.regulation ?? "", members },
  };
};
