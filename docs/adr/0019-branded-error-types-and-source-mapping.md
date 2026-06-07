---
id: 0019
status: Accepted
date: 2026-06-07
---

# 0019. ブランドエラー型 + @source 逆引きで tsc 診断を可読化する

## Context

[ADR 0010](./0010-tsc-only-verification.md) で「検証は tsc のみ（Zod 等の実行時バリデーション不採用）」を
決めた。これを 01-mvp Phase 2 で実装するにあたり、**素の union 制約だけでは tsc 診断が難読**という問題が
表面化した。例えば `moves: ReadonlyArray<SpeciesDex[S]["moves"][number]>` に覚えない技を渡すと、tsc は
「`'meteor-mash'` is not assignable to type `'earthquake' | 'dragon-claw' | …`」という**長い union を列挙する
メッセージ**を出し、何が問題かが人間にもエージェントにも伝わりにくい。さらに診断は**生成 TS の行**を指す
ため、利用者が編集した**元の YAML/MD の行**に辿り着けない。

Zod を不採用にした以上、可読性を別の手段で担保する必要がある。「不正を意味の分かる名前で示す」ことと
「診断を元ファイルの行に戻す」ことを、tsc の型システムと codegen の範囲で実現する設計を確定する。

## Decision

不正を **ブランドエラー型**で可読化し、tsc 診断を **`@source` コメント逆引き**で元 YAML/MD 行へ戻す。

- **ブランド基盤**: `src/types/brand.ts` の `Invalid<Message>`（`unique symbol` プロパティを必須に持つ、
  どの素の値も代入できない名目型）を用意する。これを `MoveNotLearnedBy<S,M>` /
  `AbilityNotAvailable<S,A>` / `ItemNotHoldableBy<S,I>` / `PointTotalMustBe66<N>`（個体）・
  `DuplicateSpeciesInParty<S>` / `NotLegalInRegulation<S,R>` / `SpeciesNotFound<S>` / `PartyTooLarge<N>`
  （パーティ）の別名に被せる。
- **制約マップ**: 生成 TS は素の union ではなく制約マップ（`ValidMove(s)` / `ValidAbility` / `ValidItem` /
  `ConstrainParty`）を介し、**違反した要素・位置だけをブランド型へ写像**する。これにより tsc メッセージに
  `… is not assignable to type 'MoveNotLearnedBy<"garchomp","meteor-mash">'` のように**ブランド名が表面化**
  する。
- **合計66**: 型レベル算術を避け、codegen が各個体の合計 `N` を算出して `satisfies PointTotalMustBe66<N>`
  を生成 TS に埋める（`N extends 66 ? unknown : Invalid<…>` で透過 / 検出を切り替える）。
- **@source 逆引き**: 生成 TS の各フィールド文の直前に `// @source <relpath>:<line>` を 1 行置き、
  `run-tsc` が tsc を `--pretty false` で実行して診断の生成行を覆う直近の `@source` から**元 YAML/MD の
  パス + 行**へ写像する。

仕様の細部は [`.claude/rules/tsc-verification.md`](../../.claude/rules/tsc-verification.md) を正本とし、本 ADR
は決定の「なぜ」に専念する。

## Consequences

- **良い点**:
  - Zod 不採用でも診断が可読（ブランド名で「何が違うか」が一目で分かる）。
  - 診断が利用者の編集対象（YAML/MD）の行を指すため、修正箇所が即座に分かる。
  - 合計66 検証の重い型レベル算術を codegen 側へ逃がし、tsc の負荷・速度を抑える。
  - ブランドは型のみ（実行時コード無し）でゲートに追加コストを持ち込まない。
- **悪い点 / コスト**:
  - ブランド型・制約マップの**型レベル実装の複雑さ**が増す（保守者が条件型・mapped 型を理解する必要）。
  - 生成 TS に `@source` コメントを正しく付与する codegen 責務が増える（コメントずれは診断ずれに直結）。
  - 合計を codegen が算出するため、点数の集計ロジックが codegen と型の二箇所に意味として跨る。
- **トレードオフ / 留意点**:
  - 一部の不正（`points` のキー不足など）は `PointAllocation` の「プロパティ不足」エラーになり、ブランド名は
    出ないが `Invalid<…>` のメッセージ文字列で意図は伝わる。完全なブランド化より**実装単純性**を優先した。
  - `@source` 行マッピングはフラットな YAML/MD を前提とする（複雑なネスト構造には CST ベースの行解決が必要に
    なりうる）。MVP の入力形では十分。

## Alternatives Considered

| 代替案 | 却下理由 |
|---|---|
| 素の union 制約のみ（ブランド型なし） | 診断が長い union 列挙で難読。「何が違うか」が伝わらない。 |
| Zod 等の実行時バリデーションで可読メッセージを出す | [ADR 0010](./0010-tsc-only-verification.md) で不採用決定済み（検証ゲートを tsc 一本に集約）。 |
| TS の sourcemap / declaration map で元ファイルへ戻す | YAML/MD は TS ではなく codegen の中間生成物のため標準 sourcemap が使えない。`@source` コメントの方が単純で確実。 |
| 合計66 を純型レベル算術（タプル長加算）で検証 | union が大きいと型評価が重く tsc が遅くなる。codegen 算出で回避（[ADR 0010] の方針とも整合）。 |
