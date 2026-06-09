---
id: 0021
status: Accepted
date: 2026-06-08
---

<!-- 本 ADR は番号 0021 を維持したまま「削除して作り直した」例外運用の産物（下記 Context 末尾）。 -->

# 0021. レギュレーション解禁と種族型を per-regulation に一本化する

## Context

ポケモンチャンピオンズはレギュレーションごとに解禁される種族・**習得技**・持ち物・メガシンカが変化する。
MVP（[ADR 0012](./0012-vendor-pokeapi-data.md)）では各種族が「解禁レギュレーション」を逆引き配列で持ち、
型レベル / ランタイムのパーティ検証がその配列を参照していた。データ保持モデル再設計
（`docs/plan/02-data-model-redesign`）で、解禁判定の正本を per-regulation に寄せる必要が生じた。

**この 0021 は番号を維持したまま「削除して作り直した」**。経緯は次のとおり。0021 は本計画 Phase 2 で当日
新規採番され、「**解禁の正本を per-regulation に一本化する。ただし per-reg 型は species / items / mega のみ
生成し、技は型生成しない（生成 species は global 単一 dex のまま）**」と決めた。しかしこの「種族の習得技は
レギュ不変」という前提は **実態に反する**（習得技はレギュごとに異なりうる）。Phase 4 でこの前提を覆し、
**種族定義そのものを per-regulation 化**して習得技を per-reg 属性にする確定設計へ作り直した。

- **番号再利用が [[adr]] の例外規定をどう拡張するか（明示）**: [[adr]] の番号再利用例外は本来「ブートスト
  ラップ期に *未参照のまま* 撤回した ADR」に限る。旧 0021 は `species.ts` / `regulation.ts` / `party.ts` /
  [[data-pipeline]] 等から **参照済み**で、文面どおりには当たらない。本 Phase はこれを **意図的に拡張した
  例外**として扱う。根拠は (a) 0021 は当日新規・前提を**一度も ship していない**、(b) 作り直し後も**同一
  テーマ（per-regulation 解禁の一本化）**なので既存参照が意味的に有効なまま、(c) 参照を本 Phase 内で再作成後
  の内容へ更新し dangling を残さない、の 3 点。これは **Accepted ADR の不変則（[[adr]]）に対する意図的な
  例外**であり、その旨を本 ADR と削除・再作成を行う PR の説明の両方に記録する（[[adr]] の「撤回理由は撤回
  PR に残す」に準じる）。

仕様の詳細は `docs/plan/02-data-model-redesign/OVERVIEW.md` と [[type-conventions]] / [[data-pipeline]] /
[[cli-and-io]] を正本とし、本 ADR は「なぜ」を記録する。catalog 分離は
[ADR 0012](./0012-vendor-pokeapi-data.md) の vendor 方式の拡張であり、本 ADR は
[ADR 0012](./0012-vendor-pokeapi-data.md) / [ADR 0014](./0014-yaml-lang-per-file.md) を
**supersede しない**（vendor 方式・入力言語のファイル単位宣言は不変）。

## Decision

**種族定義を per-regulation 化し、解禁判定と習得技の正本を per-reg データに一本化する。**

- **入力**は 1 レギュ = 1 YAML（`data/champions/regulations/<id>.yaml`・`name` / `period` / `allow`）+
  エンティティ別 catalog（append-only）。解禁集合の id が catalog に無ければ生成段でエラーにする。
- **生成物の正本は per-reg 種族 dex** `data/generated/regulations/<id>/species.ts`（`speciesDex` /
  `SpeciesId`）。各レギュの roster（`allow.species` ∪ `mega` 先）に絞り、**そのレギュの習得技 `moves`**
  （差分があれば `abilities` / `items`）を持つ。同じ種族でも `moves` はレギュ間で異なりうる。
  **global 単一 `data/generated/species.ts` は廃止**する（統合 view へのフラット化はマージで技プールが
  潰れ過剰許容になるため採らない）。
- **レギュメタは `regulations/<id>/index.ts`** に置き（1 レギュ = 1 ディレクトリ）、同居の `./species.ts` を
  `speciesDex` として同梱する。`RegulationDex[R]["speciesDex"]` から per-reg dex を引ける。
- **reg 不変フィールド（種族値・タイプ・日英名・メガ先）は派生 base view** `data/generated/species-base.ts`
  （`speciesBaseDex`・全種族）に切り出す。実数値計算・名前表示・coverage はレギュ非依存のためこれを引く。
  型の正本は per-reg のまま（base view は runtime ルックアップ専用）。
- **型機構を reg-aware 化**する。`SpeciesDexOf<R>` / `SpeciesIdIn<R>` を起点に
  `ValidMove<R,S,M>` / `ValidMoves` / `ValidAbility<R,S,A>` / `ValidItem<R,S,I>` / `IndividualSpec<R,S>` /
  `HoldableItems<R,S>` を `R` 付きにし、ブランドエラー型（`MoveNotLearnedBy<R,S,M>` 等）に `R` を表示する。
  `defineIndividual(regulation, species, spec)` はレギュを明示し、種族値は base view から引く。
- **個体は対象レギュを 0〜N 宣言**できる（YAML `regulations: [<id>...]`）。codegen が宣言レギュごとに
  `satisfies`（`@source` 付き）を **fan-out** し、**宣言した全レギュで合法**な個体だけが通る（交差）。空宣言は
  どのレギュでも未解禁の無制約デモ個体（fan-out なし）。
- **解禁判定（roster）は per-reg dex を正本**にする。`ConstrainParty<T,R>` は `RegulationDex[R]["species"]`
  を、`validateParty` は `regulationDex[R].species` を参照し、メンバー個体の宣言レギュとパーティ宣言レギュの
  整合（`MemberDeclaresRegulation` / `RegulationNotDeclaredByMember`）も型で担保する。

## Consequences

- **良い点**:
  - 解禁情報と**習得技**の SoT が per-regulation に一本化され、種族側との二重管理が消える。
  - レギュごとに技・持ち物・メガの差分を表現でき、期間（開催中＝`end: null`）も持てる。
  - 個体が複数レギュを宣言でき、宣言レギュ全てで型レベルに legality を検証できる（交差セマンティクス）。
  - reg 不変処理（実数値・名前・coverage）は base view で簡潔に保たれる。
- **悪い点 / コスト**:
  - 型機構・codegen・io・cli・公開 API に `R` が広く波及する不可逆な変更で、一度に多くのファイルに及ぶ。
  - レギュ追加時に per-reg YAML を 1 ファイル起こし、per-reg dex が増える（生成物の行数は増える）。
  - generic `R` での深い indexed access の限界回避に `SpeciesEntryOf<R,S> = SpeciesDexOf<R>[S] & SpeciesBase`
    の交差が必要（narrow リテラルは温存される）。
- **トレードオフ / 留意点**:
  - パーティの legality は「メンバー（base 種族）∈ per-reg roster」で判定し、`mega` は別メタとして持つ。
  - 当面、各レギュの per-reg `moves` は現行カタログ値を materialize する（レギュ間同一でも可）。正確なレギュ
    別技プールの投入は M-A 全量（Phase 5）/ M-B 公開時に行う。

## Alternatives Considered

- **旧 0021（種族の習得技はレギュ不変・生成 species は global 単一 dex・技は per-reg 型生成しない）**:
  本 ADR が作り直す前の決定。習得技がレギュごとに異なる実態を表現できず、`SpeciesDex[S]["moves"]` が
  reg 不変になる。一度も ship せず本 Phase で覆したため、supersede の連番ログを残さず番号 0021 を維持して
  作り直した（上記 Context の例外運用）。
- **B案: `SpeciesBase.regulations[]` を生成時に維持**（種族側に解禁逆引き配列を残す）。型機構の変更は最小
  だが、解禁情報が種族とレギュの 2 箇所に現れ SoT が二重化する。技・持ち物の per-reg 差分も種族側配列では
  表現しづらい。SoT 一貫性を優先して却下（旧 0021 から引き継ぐ却下理由）。
- **global 単一 dex への統合 view（per-reg をフラット化）**: 参照は 1 箇所で済むが、レギュ横断で技プールを
  マージすると「あるレギュでは覚えない技」を許容してしまい legality が緩む。per-reg dex を正本にして却下。
- **per-regulation を単一ファイルに集約**（1 ファイルに全レギュ）。ファイル数は減るが、レギュ増で 1 ファイルが
  肥大し差分レビューが難しい。1 レギュ = 1 ディレクトリの方が追加・改訂の粒度が明快なため却下
  （旧 0021 から引き継ぐ却下理由）。

<!-- 追記（本文不変・末尾ポインタのみ）: 本 ADR の「`allow.moves` はレギュ記録のみ・generate が
`catalog ∩ learnset` を導出」という**記録方法**は [ADR 0022](./0022-per-regulation-species-keyed-moves.md)
で改訂された（per-reg YAML を species-keyed の明示記録にし generate を変換専任へ寄せる）。per-reg species
正本・reg-aware 型機構という本 ADR の核は不変（full supersede ではない）。 -->
