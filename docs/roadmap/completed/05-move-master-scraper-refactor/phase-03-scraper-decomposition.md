# Phase 3 — スクレイパー役割分割リファクタ（parse / to-catalog / serebii-to-catalog を責務別に分解）

## 目的 / スコープ

スクレイピングコードの役割混在（調査で確認した3箇所）を解消し、情報種別ごとに責務を分離する**意味保存リファクタ**。
`generate:data` の出力が決定論的に変化しない（差分ゼロ）ことを保ちながら、1 関数が複数データ種別・複数出力ファイルを
抱える構造を責務別の関数・ファイルへ分解する。あわせて、Phase 2 で技マスター専用取得経路ができたので、**種族ページから
の技メタ副産物抽出を除去**し、種族ページは「覚える技の名前一覧」だけを抜くようにする。

- スコープ内:
  - `src/codegen/serebii/parse.ts`: `parseSpeciesPage` を `parseSpeciesBase`（種族値・タイプ・特性）/ `parseMoves`
    （**その種族が覚える技の名前一覧のみ**）/ `parseMegas`（メガ形態）へ分解。技メタ副産物抽出を除去。
  - `src/codegen/serebii/to-catalog.ts`: catalog 用 / per-game 用（技メタ）/ per-reg 用の field 関数を
    `catalog-fields` / `per-game-fields` / `regulation-fields` へファイル分離。
  - `scripts/serebii-to-catalog.ts`: `transcribeSpecies`（1 関数で5ファイル書き込み）を catalog 書き込み / per-reg
    書き込みの責務別関数へ分解。Phase 2 の `transcribe-move-master` と整合させる。
  - 各 `*.test.ts` を分割後の関数に追従させ、カバレッジ100%を維持。
- スコープ外: 新規データ取得（Phase 2 で完了）。skill 再編（Phase 4）。`move-specs` の値変更（Phase 2 で是正済み）。

## 前提（依存）

- **Phase 2 完了**（技マスター専用取得経路ができ、技メタが種族ページ副産物に依存しなくなった）。種族ページから技メタ
  副産物抽出を除去しても `move-specs` が維持される状態。
- 既存 rule: [[data-pipeline]] / [[type-conventions]] / [[testing]]。役割分割の境界は Phase 1 の設計メモで確定済み。

## タスク

- [ ] `parse.ts` の `parseSpeciesPage` を `parseSpeciesBase` / `parseMoves`（覚える技の名前一覧のみ）/ `parseMegas` へ
      分解。技そのもののメタ（威力・タイプ・PP）抽出を種族ページパーサから除去する。
- [ ] `to-catalog.ts` を `catalog-fields`（species/moves 名前/items/abilities）/ `per-game-fields`（技メタ）/
      `regulation-fields`（per-reg moves/mega）へファイル分離。import を追従。
- [ ] `scripts/serebii-to-catalog.ts` の `transcribeSpecies` を catalog 書き込み / per-reg 書き込みの責務別関数へ分解。
      Phase 2 の技マスター転記と責務境界を揃える。
- [ ] `*.test.ts`（`parse.test.ts` / `to-catalog.test.ts` / `serebii-to-catalog` 系）を分割後の関数に追従し
      カバレッジ100%を維持。`__fixtures__/` は再利用。
- [ ] `pnpm generate:data` 前後で `data/generated/**` の差分がゼロ（決定論・意味保存）であることを確認。
- [ ] `pnpm verify` 緑・`pnpm check:regulation data/champions` 0 終了。

## この Phase で育てるハーネス（rule・skill）

- なし（コードの責務分解が中心）。分割後の関数構成は Phase 4 の skill 手順記述で参照する。データパイプライン構造の
  説明に変更があれば [[data-pipeline]] / `docs/plan/01-mvp/architecture.md` を Phase 4 で追従する。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome / `check:yaml-style`）が緑。分割後も全純関数のカバレッジ100%。
- `parse.ts` / `to-catalog.ts` / `serebii-to-catalog.ts` が責務別に分解され、1 関数が複数データ種別・複数出力ファイルを
  抱える混在が解消されている。
- 種族ページパーサが「覚える技の名前一覧」のみを抜き、技メタ副産物抽出が除去されている。
- **`generate:data` の出力差分がゼロ**（リファクタが意味保存であることの証明）。

## 検証手順

1. リファクタ前に `pnpm generate:data` で `data/generated/**` を生成 → リファクタ後に再生成し、`git diff` で差分ゼロを確認。
2. 分割後の各関数に単体テストが対応し、`pnpm test:cov` でカバレッジ100%を確認。
3. 種族ページパーサ（`parseMoves`）の出力に技メタ（威力・タイプ・PP）が含まれないことをテストで確認。
4. `pnpm verify` 緑・`pnpm check:regulation data/champions` 0 終了。

## リスク・備考

- **意味保存の担保**: 役割分割は出力を変えてはいけない。`generate:data` 差分ゼロを受け入れ基準にして、機能変更が紛れ
  込まないようにする。値の是正は Phase 2 で完了済みなので、本 phase は純粋な構造変更に徹する。
- **カバレッジ100%の維持**: 関数分割でテストの責務も分かれる。分割前のテストを機械的に移すだけでなく、新しい関数境界で
  branch が漏れないよう確認する（[[testing]]）。
- **二重書き込みの解消**: Phase 2 では種族ページ側と技マスター専用取得の両方が `move-specs` を書きうる。本 phase で種族
  ページ側の技メタ抽出を除去することで、技マスターの SoT が専用取得経路に一本化される。
