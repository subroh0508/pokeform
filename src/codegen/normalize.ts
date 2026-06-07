import { abilityDex } from "../../data/generated/abilities.ts";
import { itemDex } from "../../data/generated/items.ts";
import { moveDex } from "../../data/generated/moves.ts";
import {
  abilityIdByJa,
  itemIdByJa,
  moveIdByJa,
  speciesIdByJa,
} from "../../data/generated/names.ts";
import { speciesBaseDex } from "../../data/generated/species-base.ts";
import { type NameMaps, resolveName } from "../domain/resolve-names.ts";
import type { Lang } from "../types/party.ts";
import type { StatKey } from "../types/stats.ts";

/**
 * codegen が個体 YAML / パーティ MD の生の名称（日本語名 or 英名 ID）を**安定 ID へ正規化**する
 * ヘルパ（薄い変換層・カバレッジ対象外）。種族 / 特性 / 持ち物 / 技は生成済み逆引きマップ越しに
 * `resolveName`（domain・テスト済み）へ委譲し、能力値キーは本モジュールの静的マップで解決する
 * （6 能力は PokeAPI 由来でなくゲーム固定のため）。解決不能は `null` を返し、呼び出し側が生成 TS に
 * 不正値を埋めて tsc に弾かせる（[[tsc-verification]] の「codegen は常に成功し tsc が検出」）。
 */

const speciesMaps: NameMaps = { idByJa: speciesIdByJa, ids: new Set(Object.keys(speciesBaseDex)) };
const abilityMaps: NameMaps = { idByJa: abilityIdByJa, ids: new Set(Object.keys(abilityDex)) };
const itemMaps: NameMaps = { idByJa: itemIdByJa, ids: new Set(Object.keys(itemDex)) };
const moveMaps: NameMaps = { idByJa: moveIdByJa, ids: new Set(Object.keys(moveDex)) };

const idOrNull = (raw: string, lang: Lang, maps: NameMaps): string | null => {
  const r = resolveName(raw, lang, maps);
  return r.ok ? r.id : null;
};

/** 種族名（日本語 or 英名）を SpeciesId へ。 */
export const toSpeciesId = (raw: string, lang: Lang): string | null =>
  idOrNull(raw, lang, speciesMaps);
/** 特性名を AbilityId へ。 */
export const toAbilityId = (raw: string, lang: Lang): string | null =>
  idOrNull(raw, lang, abilityMaps);
/** 持ち物名を ItemId へ。 */
export const toItemId = (raw: string, lang: Lang): string | null => idOrNull(raw, lang, itemMaps);
/** 技名を MoveId へ。 */
export const toMoveId = (raw: string, lang: Lang): string | null => idOrNull(raw, lang, moveMaps);

/** 英名 StatKey 集合。`lang: en` のファイルはこのキーを直接受理する。 */
const STAT_KEYS: ReadonlySet<string> = new Set<StatKey>([
  "hp",
  "attack",
  "defense",
  "spAttack",
  "spDefense",
  "speed",
]);

/** 日本語の能力名 → StatKey（`lang: ja` のファイル向け）。ゲーム固定の 6 能力。 */
const STAT_BY_JA: Readonly<Record<string, StatKey>> = {
  HP: "hp",
  こうげき: "attack",
  ぼうぎょ: "defense",
  とくこう: "spAttack",
  とくぼう: "spDefense",
  すばやさ: "speed",
};

/** 能力名（日本語 or 英名 StatKey）を StatKey へ。解決不能は `null`。 */
export const toStatKey = (raw: string, lang: Lang): StatKey | null => {
  if (lang === "en") return STAT_KEYS.has(raw) ? (raw as StatKey) : null;
  return STAT_BY_JA[raw] ?? null;
};
