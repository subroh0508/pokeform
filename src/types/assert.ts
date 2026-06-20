/**
 * 型レベルの適合検証ヘルパ。`as const` で値から導出した Dex（`typeof xxxDex`）が
 * 親型 `XxxBase` に適合するかを、**型の自己参照（megaEvolvesTo/megaStoneFor が派生 Id を
 * 指す）を起こさずに**検証するために使う。生成側で `type _Check = Assignable<Constraint, Dex>`
 * と書くと、Dex が Constraint に代入不能なとき制約違反として tsc エラーになる。
 * 背景は .claude/rules/type-conventions.md / tsc-verification.md。
 */
export type Assignable<Constraint, T extends Constraint> = T;
