/**
 * ブランドエラー型の基盤。`Invalid<Message>` は **どの素の値も代入できない名目型**で、
 * codegen が生成した TS に埋め込んだ制約（覚えない技・未解禁・合計66 違反など）が破れたとき、
 * tsc 診断に **意味の分かる型名**（`MoveNotLearnedBy<...>` 等）を表面化させるために使う。
 *
 * 仕組み: `unique symbol` プロパティを必須に持つため、文字列・配列・オブジェクトリテラル等は
 * 構造的に代入不能になり、「`'surf'` is not assignable to type `MoveNotLearnedBy<...>`」という
 * **ブランド名入りの代入エラー**になる。型のみ（実行時コード無し）。正本は [[tsc-verification]]。
 */

declare const __invalid: unique symbol;

/** どの素の値も代入できない名目（ブランド）型。`Message` は診断の意図を表す説明。 */
export type Invalid<Message extends string> = { readonly [__invalid]: Message };
