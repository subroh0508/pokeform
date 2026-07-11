/**
 * gender-mega-collapse.ts — gender メガ（`<base>-female-mega` / `<base>-male-mega`）を単一 `<base>-mega` へ
 * 畳むべきか判定する純関数（ADR 0046）。抽出は per-gender で忠実に写し、**stats・types・ability・覚える技
 * （learnset）がすべて一致する場合のみ**単一へ畳む（1 つでも違えば別メガとして残す）。generate 段が本判定で
 * gender ペアの畳み込みを決める。判定材料は mega-specs（types/stats/ability）+ per-reg species-moves（learnset）。
 */

/** 畳み込み判定に使うメガ形態の構造（mega-specs 由来・H/A/B/C/D/S）。 */
export interface MegaShape {
  types: readonly string[];
  stats: { H: number; A: number; B: number; C: number; D: number; S: number };
  ability: string;
}

/** 2 つの文字列配列が集合として等しいか（順不同・重複無視）。 */
function sameSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const sb = new Set(b);
  return a.every((x) => sb.has(x));
}

/**
 * gender メガ ♀♂ 2 形態が**完全一致**か（types 集合・6 stats・ability・learnset 集合がすべて一致）。
 * true のときだけ単一 `<base>-mega` へ畳んでよい（ADR 0046）。meowstic は learnset が ♀♂で異なるため false。
 */
export function genderMegaFormsIdentical(
  a: MegaShape,
  b: MegaShape,
  movesA: readonly string[],
  movesB: readonly string[],
): boolean {
  if (a.ability !== b.ability) return false;
  if (!sameSet(a.types, b.types)) return false;
  const sa = a.stats;
  const sb = b.stats;
  if (
    sa.H !== sb.H ||
    sa.A !== sb.A ||
    sa.B !== sb.B ||
    sa.C !== sb.C ||
    sa.D !== sb.D ||
    sa.S !== sb.S
  )
    return false;
  return sameSet(movesA, movesB);
}
