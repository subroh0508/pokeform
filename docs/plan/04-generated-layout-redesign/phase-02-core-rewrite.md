# Phase 2 — コア実装（YAML 新ツリー移行 + generate.ts 全面改修 + 型レイヤ + 14 consumer・verify 緑）

## 目的 / スコープ

Phase 1 で確定した設計に沿って、ソース YAML・codegen・型・consumer を**新レイアウトへ一括移行**し、`pnpm verify` が緑になる状態へ到達する。型と生成物が相互依存（生成 TS を型が consume）し、verify 緑を満たすには中途半端な赤コミットを残せないため**コアは 1 PR**とする（[[planning]] の例外・密結合）。

- スコープ内（[OVERVIEW の「実装指針」](./OVERVIEW.md#実装指針) の目標ツリーを正とする）:
  - **ソース YAML 移行**: `data/champions/` を `*-specs.yaml`（species/mega/item/ability/move/type）＋ `m-a/{index,species,items,mega,species-moves}.yaml`（`git mv` ベース）へ、名前を `data/languages/{species,mega,items,moves,abilities,types}.yaml` へ分離。全 block スタイル。
  - **codegen 全面改修**（`scripts/generate.ts`）: 入力を新ツリーへ・`requireNames` を languages 突き合わせへ・整合チェック移設・emit を新レイアウト（`champions/*-specs.ts` / `champions/m-*/` / `languages/*` + index）へ。**メガ分離**（base→species-specs / mega→mega-specs・baseSpecies 付与）。**`m-a/index.ts` で `speciesDex` を合成**（reg-aware 型機構の保全）。
  - **パイプライン追従**: `materialize`（構造→specs / ja→languages）・`fetch-pokeapi`（列挙元）・`serebii-to-catalog`（書き出し先）・`check:regulation`/`check:yaml-style`（走査パス）。
  - **型レイヤ**（`src/types/**`）: specs/languages 型（`NameEntry`・新 `MegaSpec`・`SpeciesBaseInfo` から name 除去）。**individual.ts/party.ts の reg-aware 制約・ブランドエラーを保全**（`RegulationDex[R]["speciesDex"]` 形を維持）。
  - **14 consumer + 公開 API**: 名前参照を languages へ（`cli/format.ts`・`io/load-individual.ts`）・逆引きを languages forward から導出（`io/load-party.ts`・`codegen/normalize.ts`）・import パス・`src/index.ts` の export・テスト fixture（`__fixtures__/chart.ts`・`type-effectiveness.test.ts`）。
- スコープ外: ADR 起票（Phase 1）。rule/skill/architecture/docs 追従（Phase 3）。技仕様の値是正（後続計画群 05）・全種族投入（後続計画群 06）。

## 前提（依存）

- **Phase 1 完了**（ADR 2 本確定）。
- 既存 [[type-conventions]] / [[tsc-verification]] / [[data-pipeline]]、ADR 0021/0024（per-reg・メガ技継承）を保全対象として踏まえる。

## タスク

- [ ] ソース YAML を新ツリーへ移行（`git mv` 中心・名前を `data/languages/` へ分離・block 維持）。`rules.yaml` は据え置き。
- [ ] `scripts/generate.ts` を全面改修（入力読み込み・整合検証・emit を新レイアウトへ）。`m-a/index.ts` の `speciesDex` 合成を実装。
- [ ] `materialize.ts`（+ `src/codegen/materialize.ts`）の転記先を specs / languages へ。`fetch-pokeapi.ts` の列挙元を specs へ。`src/codegen/serebii/to-catalog.ts` の書き出し先を新ツリーへ。
- [ ] `src/types/**` を specs/languages 型へ改修し、**reg-aware 型機構（`ValidMove<R,S,M>` 等・ブランドエラー）を無回帰で維持**。
- [ ] 14 consumer ＋ `src/index.ts` ＋ テスト fixture を新シンボル名・新パス・languages 名前参照へ更新。
- [ ] `check:regulation` / `check:yaml-style` の走査対象パスを新ツリーへ拡張。
- [ ] `pnpm fetch:data && pnpm materialize && pnpm generate:data` → `pnpm check:regulation data/champions` → `pnpm verify` 緑。

## この Phase で育てるハーネス（rule・skill）

- なし（コード実装中心）。rule/skill/architecture の追従は Phase 3。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome / `check:yaml-style`）が緑。
- `pnpm generate:data` が新 YAML ツリーから新 generated ツリーを決定論的に出力（raw 非依存）。
- **reg-aware 型機構の回帰なし**: 既存 `team/individuals/*.yaml` が解禁判定で正しく弾く/通る。意図的に覚えない技を混ぜると tsc がブランドエラー（`MoveNotLearnedBy<R,S,M>` 等）を出す（1 ケース確認）。
- `check:regulation data/champions` が 0 終了。`node src/cli/index.ts check:party <party.md>` が end-to-end で解禁判定（exit0/1）。

## 検証手順

1. `pnpm generate:data` 後、新 generated ツリー（`champions/*-specs.ts` / `champions/m-*/` / `languages/*`）が出力されることを確認。
2. 既存個体 YAML で `pnpm typecheck` 緑＝解禁判定が通る。覚えない技を 1 つ混ぜたダミーで tsc がブランドエラーを出すことを確認後、元へ戻す。
3. `pnpm check:regulation data/champions` 0 終了・`check:party` end-to-end。
4. `pnpm verify` 緑。
5. 生成データ妥当性を `pokemon-data-reviewer` agent でスポット確認（再編で値が変わっていないこと）。

## リスク・備考

- **最大リスク = reg-aware 型機構の破壊**。`m-a/index.ts` の `speciesDex` 合成が `PerRegSpecies` 形（moves/abilities/items/megaEvolvesTo）を維持できないと individual/party の制約・ブランドエラーが崩れる。型の回帰確認（覚えない技でブランドエラー）を必須チェックに置く。
- **大 diff（>1000 行）を 1 PR 許容**: YAML 移行 + codegen + 型 + consumer が密結合で意味ある分割が困難なため（[[planning]] の例外）。レビュー容易性のため、ソース/生成物差分（`git mv` 中心）と型/consumer 差分を分けて説明する。
- 名前 SoT 所在移動は **値を変えない**（移行のみ）。技仕様の値是正（PP/power/type）は後続計画群 05（技マスター専用取得経路）。本 phase で値を直さない。
