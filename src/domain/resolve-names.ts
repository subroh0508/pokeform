import type { Lang } from "../types/party.ts";

/**
 * 入力名称（日本語名 or 英名 ID）を安定 ID へ正規化する純関数。ファイル単位の `lang` 宣言に
 * 厳格化する: `lang: ja` なら日本語名のみ、`lang: en` なら ID（kebab 英名）のみを受理し、
 * 宣言と食い違う表記は `wrong-lang` として弾く（[[cli-and-io]] / ADR 0014）。未知名は `unknown`。
 */

/** ID 逆引きに必要なマップ（ja 表示名→ID と、有効 ID 集合）。 */
export interface NameMaps {
  /** 日本語表示名 → 安定 ID。 */
  readonly idByJa: Readonly<Record<string, string>>;
  /** 有効な ID の集合（en/直接指定の検証用）。 */
  readonly ids: ReadonlySet<string>;
}

/** 名称解決の結果。 */
export type ResolveResult =
  | { readonly ok: true; readonly id: string }
  | { readonly ok: false; readonly reason: "unknown" | "wrong-lang"; readonly raw: string };

/** `raw` を宣言言語 `lang` に従って ID へ解決する。 */
export const resolveName = (raw: string, lang: Lang, maps: NameMaps): ResolveResult => {
  const ja = maps.idByJa[raw];
  const isId = maps.ids.has(raw);
  if (lang === "en") {
    if (isId) return { ok: true, id: raw };
    // 英語ファイルに日本語名 → 言語違反
    if (ja !== undefined) return { ok: false, reason: "wrong-lang", raw };
    return { ok: false, reason: "unknown", raw };
  }
  if (ja !== undefined) return { ok: true, id: ja };
  // 日本語ファイルに英名 ID → 言語違反
  if (isId) return { ok: false, reason: "wrong-lang", raw };
  return { ok: false, reason: "unknown", raw };
};
