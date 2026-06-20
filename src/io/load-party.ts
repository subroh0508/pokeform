import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import matter from "gray-matter";
import { parse as parseYaml } from "yaml";
import { itemSpecsDex } from "../../data/generated/champions/item-specs.ts";
import { moveSpecsDex } from "../../data/generated/champions/move-specs.ts";
import { itemNames, moveNames, speciesNamesAll } from "../../data/generated/languages/index.ts";
import type { ResolvedMember, ResolvedParty } from "../domain/party-analysis.ts";
import { type NameMaps, resolveName } from "../domain/resolve-names.ts";
import type { IndividualFile, Lang, PartyFrontmatter } from "../types/party.ts";

/**
 * パーティ Markdown と個体 YAML を読み、パス解決 + 名称 ID 正規化済みの ResolvedParty へ変換する
 * 薄い I/O 層（カバレッジ対象外）。名称解決の純ロジックは domain/resolve-names、検証 / 分析は
 * domain/party-analysis が担う（[[cli-and-io]]）。ja→id 逆引きは languages の forward マップから実行時導出する
 * （名前 SoT は languages・ADR 0035）。id 集合（legality 解決用）は specs dex から取る。
 */

/** languages forward マップ（id→{ id, name:{ ja } }）から ja→id 逆引きを作る。 */
const reverseJa = (m: Record<string, { name: { ja: string } }>): Record<string, string> =>
  Object.fromEntries(Object.entries(m).map(([id, e]) => [e.name.ja, id]));

const speciesMaps: NameMaps = {
  idByJa: reverseJa(speciesNamesAll),
  ids: new Set(Object.keys(speciesNamesAll)),
};
const moveMaps: NameMaps = {
  idByJa: reverseJa(moveNames),
  ids: new Set(Object.keys(moveSpecsDex)),
};
const itemMaps: NameMaps = {
  idByJa: reverseJa(itemNames),
  ids: new Set(Object.keys(itemSpecsDex)),
};

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
