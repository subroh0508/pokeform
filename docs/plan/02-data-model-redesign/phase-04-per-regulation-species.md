# Phase 4 — per-regulation 種族型 + 個体の複数レギュレーション宣言

## 目的 / スコープ

種族の**習得技はレギュレーションごとに異なる**。現状の `data/generated/species.ts` は全レギュ共通の単一
`speciesDex` で、`SpeciesDex[S]["moves"]`（個体の技合法判定の根拠）が reg 不変になっており、この実態を
表現できない。本 Phase で **種族定義を per-regulation 化**し、個体の技/特性/持ち物の合法判定を**宣言した
各レギュレーションの種族プールに対して**型で効かせる。

個体は **1 YAML に対象レギュレーションを複数宣言可能**にし、codegen が宣言レギュごとに型検証を fan-out する
（1 YAML → 複数型定義生成）。宣言した**全レギュで合法**な個体だけが通る（交差セマンティクス）。

- スコープ内:
  - global `data/generated/species.ts` を**廃止**し、`data/generated/regulations/<id>/species.ts`
    （per-reg `speciesDex` / `SpeciesId`）を**正本**として生成。各レギュの roster（`allow.species` + `mega` 先）に
    絞り、**そのレギュの習得技 `moves`**（および差分があれば `abilities` / `items`）を持つ。
  - `regulations/<id>.ts`（レギュメタ）が自分の `species.ts` を参照し、`RegulationDex[R]` から
    `speciesDex` を引けるようにする。
  - 型機構を **reg-aware** にする: `SpeciesDexOf<R>` / `SpeciesIdIn<R>` / `ValidMove<R,S,M>` /
    `ValidMoves<R,S,Ms>` / `ValidAbility<R,S,A>` / `ValidItem<R,S,I>` / `IndividualSpec<R,S>`。
  - 個体 YAML に `regulations: [<id>...]`（1〜N）を導入し、`emit-individual-ts.ts` が宣言レギュごとに
    `satisfies`（`@source` 付き）を fan-out 生成。`check:individual` が宣言レギュ全てで合法性を見る。
  - `ConstrainParty` の roster 参照を per-reg dex キー由来に付け替え、パーティ宣言レギュとメンバー個体の
    宣言レギュ整合（メンバーは少なくともパーティの reg を宣言している）を担保。
  - 実数値計算など **reg 不変の処理**（種族値・タイプ）は、reg 間で同一の base データを引く（実装方式は
    下記「設計判断」5）。
  - ADR を起票（per-reg 種族型 + 技の per-reg 型生成 → ADR 0021 の該当決定を supersede）。
- スコープ外:
  - M-A 解禁データの**全量投入**（Phase 5）。本 Phase は構造 + 型機構で、データ量は現状（20 匹サンプル）等価。
  - レギュ間の `items` / `abilities` 差分の**データ投入**（型機構は受けられる形にするが、実データ差分は
    必要が出た時点で投入）。技の per-reg 差分も、まずは現行データを各レギュへ materialize する（差分の
    正確な投入は M-A 全量 / M-B 公開時）。

## 前提（依存）

- **Phase 3（情報源確定 + 20匹サンプル検証）完了**。新構造が 20 匹で end-to-end に動くこと。
- ADR `0021`（解禁の per-regulation 一本化）を踏まえる。本 Phase はその「生成 species を global 単一 dex と
  し、技は per-reg 型生成しない」決定を**改訂**する後続決定。
- 確定済み rule: [[data-pipeline]] / [[type-conventions]] / [[tsc-verification]] / [[testing]] / [[cli-and-io]]。

## 設計判断（着手前に確定済み・実装中に覆さない）

1. **種族定義を per-regulation 化し、習得技を per-reg 属性にする**: `data/generated/regulations/<id>/species.ts`
   を生成 species の正本にする。同じ種族でも `moves` がレギュ間で異なりうる（global 単一 dex / 統合 view への
   フラット化は採らない＝マージで技プールが潰れ過剰許容になるため）。
2. **個体は対象レギュレーションを複数宣言できる**: 個体 YAML に `regulations: [<id>...]`（1〜N）。codegen は
   宣言レギュごとに `ValidMoves<R,S,...>` 等の `satisfies` を fan-out 生成し、**宣言した全レギュで合法**な
   個体だけを通す（交差）。違反は該当レギュの行で `MoveNotLearnedBy<R,S,M>` 等として `@source` 逆引きで弾く。
3. **型機構を reg-aware に変更**: `SpeciesDexOf<R> = RegulationDex[R]["speciesDex"]` / `SpeciesIdIn<R>` を起点に、
   `ValidMove` / `ValidMoves` / `ValidAbility` / `ValidItem` / `IndividualSpec` / `HoldableItems` を `R` 付きへ。
   ブランドエラー型（`MoveNotLearnedBy` 等）も `R` を表示に含める。
4. **解禁判定（roster）は per-reg dex を正本に**: `ConstrainParty` / `validateParty` は当該レギュの種族集合
   （`keyof SpeciesDexOf<R>` 由来）でメンバーの解禁を見る。`RegulationBase.species` は per-reg dex から派生。
5. **reg 不変の base データ参照**: 種族値・タイプ・日英名はレギュ不変。実数値計算（`defineIndividual` /
   `calcRealStats`）・名前表示・coverage はこれらだけを使うため、**reg 不変フィールドの参照経路**を用意する
   （例: 宣言レギュの 1 つの dex から base を引く / reg 不変フィールドのみの派生 base view）。実装方式は
   `start-phase` で確定（型の正本は per-reg のまま）。
6. **ディレクトリは dir-per-reg**: `data/generated/regulations/champions-m-a/species.ts`。レギュメタ
   `champions-m-a.ts` は維持（or `champions-m-a/index.ts` へ寄せる。import/Biome 整合で実装時確定）。

## タスク

- [ ] `scripts/generate.ts`: global `species.ts` 出力を廃し、roster に絞った per-reg
      `regulations/<id>/species.ts`（`speciesDex` + per-reg `moves`/`abilities`/`items` + `@source` + `satisfies`）を出力。
- [ ] `regulations/<id>.ts` / `index.ts`: `RegulationDex[R]` から `speciesDex` を引ける形に集約。
      `RegulationBase` に `speciesDex` を持たせ（or per-reg 型側）、`species`/`mega` を派生。
- [ ] `src/types/individual.ts`: `SpeciesDexOf<R>` / `SpeciesIdIn<R>` 起点に `Valid*` / `IndividualSpec<R,S>` /
      `defineIndividual` を reg-aware 化。ブランドエラー型へ `R` を追加。
- [ ] `src/codegen/emit-individual-ts.ts`: 個体 YAML の `regulations: []` を読み、宣言レギュごとに
      `ValidMoves<R,S,...>` / `ValidAbility<R,S,...>` / `ValidItem<R,S,...>` の `satisfies` を fan-out 生成。
- [ ] `src/types/party.ts`: `ConstrainParty` の roster 参照を per-reg dex 由来へ。メンバー個体の宣言レギュと
      パーティ宣言レギュの整合チェックを追加。
- [ ] `src/io/load-individual.ts` / `load-party.ts` / `cli/*` / `domain/party-analysis.ts` / 公開 `index.ts`:
      `speciesDex` 参照を reg 不変 base 参照経路へ付け替え。
- [ ] 個体 YAML サンプル（`team/individuals`）に `regulations: []` を付与し新構造で緑にする。
- [ ] `pnpm generate:data` 再生成・型テスト/ユニットテスト追従（カバレッジ 100% 維持）。
- [ ] `adr-new` で ADR 起票（per-reg 種族型 + 技 per-reg 型生成）。ADR 0021 の該当決定を `Superseded by` で
      整理し archive 退避要否を判断。
- [ ] rule 追従: [[type-conventions]]（per-reg SpeciesDex・reg-aware 制約）/ [[data-pipeline]]（生成構造図）/
      [[cli-and-io]]（個体 `regulations` 宣言と fan-out）/ OVERVIEW を更新。

## この Phase で育てるハーネス（rule・skill）

- [[type-conventions]] / [[data-pipeline]] / [[cli-and-io]] を per-reg 種族型 + 個体複数レギュ宣言へ更新。
- `author-individual` skill の雛形・`check:individual` 手順に `regulations: []` 宣言を反映（`skill-creator`）。
- ADR 起票（`adr-new`）。新 ADR 番号は採番時に確定（現在の最大連番 + 1）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- `data/generated/species.ts`（global 単一）が**存在せず**、`regulations/<id>/species.ts` が各レギュの種族定義
  （per-reg `moves` を含む）の正本として生成される。
- 個体 YAML が `regulations: [<id>...]` を複数宣言でき、codegen が宣言レギュごとに型検証を fan-out する。
  ある技が宣言レギュのいずれかで覚えない場合、その**レギュの行**で型エラーになり `@source` で YAML 行へ逆引く。
- `ConstrainParty` の roster 判定が per-reg dex 由来になり、メンバー個体の宣言レギュ整合が取れる。
- reg 不変の処理（実数値計算・名前・coverage）が破綻せず動く。
- ADR が起票され、ADR 0021 との関係（生成 species の per-reg 化 / 技の per-reg 型生成）が整理されている。

## 検証手順

1. `pnpm generate:data` 後、`data/generated/species.ts` が消え `regulations/<id>/species.ts` が出力され、各
   per-reg dex のキー = 当該レギュの roster + mega 先であることを確認。
2. 個体 YAML に複数 `regulations` を宣言し、一方のレギュで覚えない技を混ぜると**その行だけ** tsc エラーに
   なる（fan-out の独立性）ことを確認。`@source` 逆引きで YAML 行が示されることを確認。
3. パーティの宣言レギュとメンバー宣言レギュの不整合が検出されることを確認。
4. `pnpm test`（個体・パーティ・coverage・stat）が新構造で緑、`pnpm verify` 緑。
5. ADR が採番・起票され README 一覧に載っていることを確認。

## リスク・備考

- **波及が広く diff が大きい**: `SpeciesId` / `speciesDex` は types（individual/party/item/regulation）・codegen・
  io・cli・domain・公開 `index.ts` に参照があり、加えて reg-aware 化で型引数 `R` が広く増える。**想定 diff が
  >1000 行に膨らむ場合は** `start-phase` で 2 PR に分割する:
  - (a) **型基盤**: per-reg species 生成 + `RegulationDex.speciesDex` + reg-aware 型機構 + `ConstrainParty`
    追従 + ADR（個体は単一レギュ宣言で緑にする最小形）。
  - (b) **個体 codegen fan-out**: 個体 `regulations: []` 複数宣言 + `emit-individual-ts` fan-out +
    `check:individual` per-reg + io/cli/domain 追従。
- **ADR 0021 の改訂点**: 0021 は「per-reg 型は species/items/mega のみ・技は型生成しない／生成 species は
  global 単一 dex」とした。本 Phase は **習得技を per-reg 種族 dex に取り込み型生成**し、**生成 species を
  per-reg 化**する。新 ADR で該当決定を supersede し、roster の per-reg 一本化（0021 の主旨）は踏襲する。
- **データの初期値**: 本 Phase は構造変更。各レギュの per-reg `moves` は当面**現行カタログ値を materialize**
  （レギュ間同一でも可）。正確なレギュ別技プールの投入は M-A 全量（Phase 5）/ M-B 公開時に行う。
- **メガの二重表現**: 種族 `megaEvolvesTo` / 持ち物 `megaStoneFor` / per-reg `mega` 集合の整合に注意。per-reg
  dex にメガ先種族エントリも含める。
