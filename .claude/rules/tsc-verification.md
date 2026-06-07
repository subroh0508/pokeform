---
paths:
  - "src/codegen/**"
  - "src/types/**"
description: 「検証は tsc のみ」方針（Zod 不採用）・YAML→codegen→`tsc --noEmit`・ブランドエラー型の命名・合計66 は codegen 算出。src/codegen/ や src/types/ を扱うとき適用する。
---

# tsc のみ検証の規約

不正入力を**型エラーとして弾く**検証方針の要点。正本は `docs/plan/01-mvp/architecture.md`（「検証の単一ゲート」節）と ADR `0010-tsc-only-verification`。診断可読化（ブランドエラー型 + `@source` 逆引き）の「なぜ」は ADR `0019-branded-error-types-and-source-mapping`。

## 単一ゲート: YAML/MD → codegen → tsc

- 実行時バリデーション（**Zod 等）は採用しない**。検証ゲートは `tsc --noEmit`（生成物は `tsconfig.generated.json`）唯一。
- **codegen は常に成功してファイルを吐く**。不正は tsc が型エラーとして検出する。codegen 内で値の妥当性を例外で弾かない（弾くのは tsc の役目）。
- 生成 TS に `// @source pikachu.yaml:12` コメントを埋め、CLI が tsc の診断位置を**元の YAML/MD 行へ逆引き**して整形する（Zod 不採用でも可読な診断を担保）。診断整形は [[cli-and-io]]。

## ブランドエラー型の命名

不正は**意味の分かるブランド型名**で可読化する。命名は能動的に「何が違うか」を表す。基盤は
`src/types/brand.ts` の `Invalid<Message>`（`unique symbol` プロパティを必須に持つ**どの素の値も代入
できない名目型**）で、これを各エラーの別名に被せると tsc 診断に「`'meteor-mash'` is not assignable to
type `MoveNotLearnedBy<...>`」のように**ブランド名入りの代入エラー**が現れる。生成 TS は各フィールドを
制約マップ（`ValidMove` / `ValidMoves` / `ValidAbility` / `ValidItem` / `ConstrainParty`）に通し、違反位置
だけをブランド型へ写像する。

- 個体（`src/types/individual.ts`）: `MoveNotLearnedBy<S,M>` / `AbilityNotAvailable<S,A>` /
  `ItemNotHoldableBy<S,I>` / `PointTotalMustBe66<N>`。
- パーティ（`src/types/party.ts`）: `DuplicateSpeciesInParty<S>` / `NotLegalInRegulation<S,R>` /
  `SpeciesNotFound<S>` / `PartyTooLarge<N>`。

`PointTotalMustBe66<N>` は条件型（`N extends 66 ? unknown : Invalid<...>`）なので、合計が合えば `unknown`
として透過し、外れると `Invalid<"point total must be 66 but is N">` が tsc メッセージに現れる。

## `@source` 逆引きの仕組み

生成 TS の各フィールド文の**直前**に `// @source <relpath>:<line>` を 1 行置く。`run-tsc` は tsc を
`--pretty false` で実行し、`file(line,col): error TS....` を parse して、診断の生成行を覆う直近の `@source`
（それ以前で最大行）を引き、**元 YAML/MD の相対パス + 行**へ写像する。生成物は `.pokeform-build/`
（gitignore）に吐き、`tsconfig.generated.json`（`include: .pokeform-build/**/*.generated.ts`・strict）で
型チェックする。診断整形は [[cli-and-io]]。

## 合計66 は codegen が算出

per-stat ≤32 は生成 union `PointValue = 0|1|…|32` で表現できる（生成 points を `as const satisfies
PointAllocation` に通すと各値が範囲外で弾かれる）。**合計66 は型レベル算術が重い**ため、codegen が各個体の
合計を算出して生成 TS に `satisfies PointTotalMustBe66<computedSum>` を埋め、型レベルでは `computedSum
extends 66` を検証する（重い算術を codegen 側へ逃がす）。型パターンの詳細は [[type-conventions]]、
ゲーム数値は [[game-spec]]。
