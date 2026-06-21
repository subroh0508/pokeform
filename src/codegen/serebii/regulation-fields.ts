/**
 * regulation-fields.ts（serebii codegen 純関数）— Serebii 中間表現 → **per-reg 解禁の転記材料**へ変換する
 * 純関数。種族の per-reg 習得技 id 一覧（`species-moves`）・メガ自動著述プラン（`mega`・base の
 * `megaEvolvesTo`）・append-only union のマージを組む。reg 非依存の名前 / key は
 * [`catalog-fields`](./catalog-fields.ts)、技メタ（per-game）は [`per-game-fields`](./per-game-fields.ts)
 * が担う（役割分割・ADR 0037）。
 */
import { isCatalogIdShape } from "./normalize.ts";
import type { ParsedSpecies } from "./parse.ts";

/** per-reg 習得技 id（重複なし・昇順）。Serebii Standard Moves 全件を per-species `moves` の正とする。 */
export function regMoveIds(p: ParsedSpecies): string[] {
  return [...new Set(p.moves.map((m) => m.id))].sort();
}

/** 2 つの id 配列を重複なし・昇順に併合する（per-reg `items` 予約キー / base `megaEvolvesTo` の append 用）。 */
export function sortedUnion(existing: readonly string[], fresh: readonly string[]): string[] {
  return [...new Set([...existing, ...fresh])].sort();
}

/**
 * メガ表示名 → メガ形態 catalog 種族 id（決定論変換）。base slug は既知（呼び出し側が処理中の種族 slug を
 * 渡す）ため、メガ名の**枝サフィックス**（`""` / `"X"` / `"Y"`）だけ拾えば `<baseSlug>-mega[-x|-y]` を組める
 * （base 表示名をパースしないので en≠slug の地域フォルムでも破綻しない）。`Mega ` 接頭の無い形（Primal 等）や
 * catalog id 形にならないものは **`null`**（自動著述せず authoring へ escalation）。これは shape チェックの
 * ガードで、catalog 集合への membership 照合（`normalize.ts` の `normalizeAgainstCatalog`）より弱いが、誤 id を
 * 著述しない安全側に倒す点で同じ狙い（membership は下流の `check:regulation` / tsc に委ねる）。
 */
export function megaSpeciesId(baseSlug: string, megaName: string): string | null {
  const m = megaName.trim().match(/^Mega\s+.*?(?:\s+([XY]))?$/);
  if (m === null) return null; // `Mega ` 接頭が無い（Primal 等）→ escalation
  const suffix = m[1] ? `-${m[1].toLowerCase()}` : "";
  const id = `${baseSlug}-mega${suffix}`;
  return isCatalogIdShape(id) ? id : null;
}

/** 種族のメガ自動著述プラン（megaLinks / メガ先種族エントリ / per-reg `mega[]` の材料）。 */
export interface MegaAuthoring {
  /** メガ形態 id（昇順・重複なし）。megaLinks の値・per-reg `mega[]` に使う。 */
  ids: string[];
  /** catalog `pokemon` へ追加するメガ先種族エントリ（en のみ・構造は materialize が後埋め）。 */
  speciesEntries: { id: string; en: string }[];
  /** 決定論変換できなかったメガ名（Primal 等）。呼び出し側が diagnostic に残す（自動著述しない）。 */
  escalations: string[];
}

/**
 * 種族の全メガへ `megaSpeciesId` を適用し、自動著述プランへまとめる。`null`（Primal 等の決定論変換不能）は
 * `escalations` に分け、確実なものだけ `ids` / `speciesEntries` に積む（決定論で確実なものだけ自動化）。
 */
export function megaAuthoring(baseSlug: string, p: ParsedSpecies): MegaAuthoring {
  const speciesEntries: { id: string; en: string }[] = [];
  const escalations: string[] = [];
  for (const mega of p.megas) {
    const id = megaSpeciesId(baseSlug, mega.name);
    if (id === null) escalations.push(mega.name);
    else speciesEntries.push({ id, en: mega.name });
  }
  const ids = [...new Set(speciesEntries.map((e) => e.id))].sort();
  return { ids, speciesEntries, escalations };
}
