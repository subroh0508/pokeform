# Phase 2 — 個体 tsc 検証層

## 目的 / スコープ

**「tsc のみ検証」**を実装し、育成済み個体・パーティの不正（覚えない技・使えない特性・存在しないフォルム・性格 up=down・能力ポイント 66/32 違反・同種族重複・未解禁混入）を **`tsc --noEmit` で弾く**。アーキ詳細は [`architecture.md`](./architecture.md)。

## 前提（依存）

- Phase 1（`SpeciesDex`/`MoveDex` 等の生成物・CLI 基盤）。
- 規約 `tsc-verification`（本フェーズで確定）。

## タスク

- [ ] `src/types/individual.ts`: `IndividualSpec<S extends SpeciesId>`（`ability: SpeciesDex[S]["abilities"][number]` / `moves: ReadonlyArray<SpeciesDex[S]["moves"][number]>` / `points` / `nature`）、`defineIndividual<S>`、**ブランドエラー型**（`MoveNotLearnedBy<S, M>` / `AbilityNotAvailable<...>` / `DuplicateSpeciesInParty<...>` / `NotLegalInRegulation<...>` / `PointTotalMustBe66<N>`）。
- [ ] `src/types/party.ts`: `PartySpec`、`UniqueSpecies<T>`（同種族重複）、タプル長 ≤6、レギュ整合。
- [ ] `src/codegen/emit-individual-ts.ts`: 個体 YAML → `*.individual.generated.ts`（`satisfies IndividualSpec<S>`、合計66 は codegen が算出し型注釈に埋める、`// @source <yaml>:<line>` コメント付与）。
- [ ] `src/codegen/emit-party-ts.ts`: パーティ MD → `*.party.generated.ts`。
- [ ] `src/codegen/run-tsc.ts`: `tsc -p tsconfig.generated.json --noEmit` を実行し、診断を `@source` から **YAML/MD 行へ逆引き**して整形。
- [ ] `tsconfig.generated.json` を本格運用（`include: **/*.generated.ts`、strict）。
- [ ] CLI: `pokeform compile <path>`（生成）/ `pokeform check:individual <path>`（compile→tsc→診断整形）/ `pokeform typecheck <path>`。
- [ ] `defineIndividual` で実数値を自動計算し `Individual.realStats` に格納（Phase 0 の `calc-stats` 利用）。

## この Phase で育てるハーネス

- rule: `tsc-verification` を確定（ブランドエラー型命名・`@source` マッピング・合計66 の codegen 算出）。
- skill: `author-individual`（個体 YAML 雛形 + 検証）を canonical + symlink で作成。
- ゲート: Git `pre-commit`/`pre-push` に `pokeform typecheck` を追加。

## 受け入れ基準

- 覚えない技を含む YAML で `check:individual` が `MoveNotLearnedBy<...>` を **YAML 行番号付き**で報告し非0終了。正常個体は 0 終了。
- 性格 up=down / ポイント合計≠66 / 同種族重複 / 未解禁が tsc で検出される。
- `pnpm verify` 緑。

## 検証手順

1. 不正個体 fixture（覚えない技 `surf` を `pikachu` に）で `pokeform check:individual` の出力（型名 + 行）と非0終了を確認。
2. 正常個体・正常パーティで 0 終了。
3. 巨大 `SpeciesId` union での tsc 性能を確認（`SpeciesDex[S]` プロパティアクセス主体で分配を回避）。

## リスク・備考

- 合計66 を純型レベル算術で表現すると重いため、codegen が合計を算出し型注釈に埋める方式（アーキテクチャのトレードオフ1）。
- tsc 診断は難読なため、ブランドエラー型名 + `@source` 逆引きで可読化する。
