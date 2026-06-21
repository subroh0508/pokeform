/**
 * catalog-fields.ts（serebii codegen 純関数）— Serebii 中間表現 → **reg 非依存の catalog/specs/languages 転記
 * 材料**へ変換する純関数。種族 / 技 / 持ち物 / 特性の **名前欄（en）とエンティティ key**、メガストーンの
 * メガ先リンクを組む。技メタ（per-game）は [`per-game-fields`](./per-game-fields.ts)、per-reg 解禁は
 * [`regulation-fields`](./regulation-fields.ts) が担う（役割分割・ADR 0037）。
 *
 * 役割分担（層分離）:
 * - **Serebii 由来（本関数が組む）**: エンティティ key の存在・名前 en・メガストーンのメガ先（`megaStoneFor` /
 *   `megaSpecies`）。
 * - **PokeAPI 由来（`materialize` が後段で埋める）**: 日英名 ja（全種別）・構造データ（dex/types/stats/
 *   abilities/category）・特性の en。本関数は名前欄を**空で残す**欄もあり、materialize が PokeAPI names /
 *   raw から append/既存尊重で補完する。
 */
import { isCatalogIdShape } from "./normalize.ts";
import type { ParsedItem, ParsedMove, ParsedMoveMaster, ParsedSpecies } from "./parse.ts";

/**
 * languages/moves.yaml の Serebii 由来名前欄。`en` は Serebii 表示名（`ja` は持たない＝materialize が PokeAPI move
 * names で補完）。技メタは per-game の `move-specs.yaml` へ分離した（ADR 0034/0035）。
 */
export interface MoveNameFields {
  en: string;
}

/** `ParsedMove` → languages/moves.yaml 名前欄（Serebii 表示名 en のみ・ja は materialize が補完）。 */
export function moveNameFields(m: ParsedMove): MoveNameFields {
  return { en: m.name };
}

/** `ParsedMoveMaster` → languages/moves.yaml 名前欄（Serebii 表示名 en・ja は materialize が補完）。 */
export function moveMasterNameFields(m: ParsedMoveMaster): MoveNameFields {
  return { en: m.name };
}

/** species.yaml の Serebii 由来欄（en のみ。ja / dex / types / stats / abilities は materialize が埋める）。 */
export interface SpeciesCatalogFields {
  en: string;
}

/** `ParsedSpecies` → languages/species.yaml 転記欄（Serebii 表示名のみ）。 */
export function speciesCatalogFields(p: ParsedSpecies): SpeciesCatalogFields {
  return { en: p.en };
}

/**
 * items.yaml の Serebii 由来欄（en + メガストーンのメガ先 `megaStoneFor`（base 種族）+ メガ形態
 * `megaSpecies`（ストーン→形態リンク）。ja / category は materialize が埋める）。
 */
export interface ItemCatalogFields {
  en: string;
  megaStoneFor?: string;
  megaSpecies?: string;
}

/** `ParsedItem` → items.yaml 転記欄（メガストーンのみ `megaStoneFor` / `megaSpecies` を持つ）。 */
export function itemCatalogFields(it: ParsedItem): ItemCatalogFields {
  if (it.megaStoneFor === null) return { en: it.name };
  const fields: ItemCatalogFields = { en: it.name, megaStoneFor: it.megaStoneFor };
  const megaSpecies = megaStoneSpeciesId(it.id, it.megaStoneFor);
  if (megaSpecies !== null) fields.megaSpecies = megaSpecies;
  return fields;
}

/**
 * メガストーン id + メガ先 base 種族 id → メガ形態種族 id（`ItemBase.megaSpecies`・ストーン→形態リンク）。
 * ストーン id の枝サフィックス（`-x` / `-y`）で X/Y を区別する（`charizardite-x` → `charizard-mega-x`
 * / `garchompite` → `garchomp-mega`）。catalog id 形にならないものは `null`（誤 id 注入防止）。
 */
export function megaStoneSpeciesId(stoneId: string, megaStoneFor: string): string | null {
  const m = stoneId.match(/-([xy])$/);
  const suffix = m ? `-${m[1]}` : "";
  const id = `${megaStoneFor}-mega${suffix}`;
  return isCatalogIdShape(id) ? id : null;
}

/** 種族の特性 id（abilities.yaml に key を確保する対象。ja は materialize が補完）。 */
export function abilityIds(p: ParsedSpecies): string[] {
  return [...new Set(p.abilities)];
}

/**
 * ability id（kebab）→ 表示英名（`rough-skin` → `Rough Skin`）。Serebii 種族ページは特性を id でしか渡さ
 * ない（表示名を parse が捨てる）ため、新規 abilities エントリの en を id から決定論導出する。空の block map
 * （`{}` = flow・check:yaml-style 抵触）を作らないための非空欄でもある。ja は materialize が PokeAPI names で
 * 補完し、en の表記揺れは materialize の conflict 提示で突き合わせる（既存 catalog 46 件は本変換と完全一致）。
 */
export function abilityEnFromId(id: string): string {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
