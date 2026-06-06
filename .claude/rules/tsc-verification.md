---
paths:
  - "src/codegen/**"
  - "src/types/**"
description: 「検証は tsc のみ」方針（Zod 不採用）・YAML→codegen→`tsc --noEmit`・ブランドエラー型の命名・合計66 は codegen 算出。src/codegen/ や src/types/ を扱うとき適用する。
---

# tsc のみ検証の規約

不正入力を**型エラーとして弾く**検証方針の要点。正本は `docs/plan/01-mvp/architecture.md`（「検証の単一ゲート」節）と ADR `0002-tsc-only-verification`。

## 単一ゲート: YAML/MD → codegen → tsc

- 実行時バリデーション（**Zod 等）は採用しない**。検証ゲートは `tsc --noEmit`（生成物は `tsconfig.generated.json`）唯一。
- **codegen は常に成功してファイルを吐く**。不正は tsc が型エラーとして検出する。codegen 内で値の妥当性を例外で弾かない（弾くのは tsc の役目）。
- 生成 TS に `// @source pikachu.yaml:12` コメントを埋め、CLI が tsc の診断位置を**元の YAML/MD 行へ逆引き**して整形する（Zod 不採用でも可読な診断を担保）。診断整形は [[cli-and-io]]。

## ブランドエラー型の命名

不正は**意味の分かるブランド型名**で可読化する。命名は能動的に「何が違うか」を表す:

- `MoveNotLearnedBy<"pikachu","surf">` / `AbilityNotAvailable<...>`
- `DuplicateSpeciesInParty<...>` / `NotLegalInRegulation<S,R>`
- `PointTotalMustBe66<70>`

## 合計66 は codegen が算出

per-stat ≤32 は生成 union `PointValue = 0|1|…|32` で表現できる。**合計66 は型レベル算術が重い**ため、codegen が各個体の合計を算出して生成 TS に `satisfies PointTotalMustBe66<computedSum>` を埋め、型レベルでは `computedSum extends 66` を検証する（重い算術を codegen 側へ逃がす）。型パターンの詳細は [[type-conventions]]、ゲーム数値は [[game-spec]]。
