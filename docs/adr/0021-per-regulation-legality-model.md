---
id: 0021
status: Accepted
date: 2026-06-08
---

# 0021. レギュレーション解禁を per-regulation データに一本化する

## Context

ポケモンチャンピオンズはレギュレーションごとに解禁される種族・技・持ち物・メガシンカが変化する。
MVP（[ADR 0012](./0012-vendor-pokeapi-data.md)）では暫定的に、各種族が「解禁レギュレーション」を
逆引き配列で持ち（生成 `species.ts` の `regulations: RegulationId[]`）、型レベルのパーティ検証
（`src/types/party.ts` の `ConstrainParty`）と CLI ランタイム検証（`validateParty`）がその配列を
参照していた。この形では「レギュレーションごとに技・持ち物・メガまで変わる」実態を表現できず、
レギュレーションの開催期間も保持できなかった。

データ保持モデル再設計（`docs/plan/02-data-model-redesign`）で、入力を vendor カタログ分離
（Phase 1）と per-regulation 化（Phase 2）に作り直すにあたり、**解禁判定の正本をどこに置くか**を
決める必要がある。種族側に逆引き配列を残す案（B案）と、レギュレーション側に一本化する案（A案）が
あり、SoT の二重化を避けるため A案を採る。

## Decision

**レギュレーション解禁情報の正本を per-regulation データに一本化する（A案）。**

- 入力は **1 レギュ = 1 YAML**（`data/champions/regulations/<id>.yaml`）。`name` / `period`
  （`start` 必須・`end` は開催中なら空＝`null` を許容）/ `allow`（`species` / `items` / `mega` / `moves`）を持つ。
- 生成物は **レギュレーションごとに別ファイル・別型**（`data/generated/regulations/<id>.ts` が
  `as const satisfies RegulationBase`）+ `index.ts` が `regulationDex` に集約し `RegulationId` を派生する。
  解禁集合の id（species/items/mega）がカタログに無ければ生成段でエラーにする（参照整合）。
- **per-regulation 型は species / items / mega のみ生成する**。技は YAML に記録するが per-reg 型は
  生成しない（種族の習得技で legality を見るため per-reg 技型は不要）。
- **`SpeciesBase.regulations[]` を廃止**する。型レベル判定 `ConstrainParty` は
  `RegulationDex[R]["species"]` を、ランタイム判定 `validateParty` は `regulationDex[R].species` を参照する。
- レギュレーションは期間付き（`period`）で管理し、`RegulationBase` の親型を `src/types/regulation.ts` に置く。

仕様の詳細は `docs/plan/02-data-model-redesign/OVERVIEW.md` と `.claude/rules/data-pipeline.md` /
`.claude/rules/type-conventions.md` を正本とし、本 ADR は「なぜ」を記録する。catalog 分離は
[ADR 0012](./0012-vendor-pokeapi-data.md) の vendor 方式を踏襲した拡張であり、本 ADR は 0012 / 0014 を
**supersede しない**（vendor 方式・入力言語のファイル単位宣言は不変）。

## Consequences

- **良い点**:
  - 解禁情報の SoT が per-regulation に一本化され、種族側との二重管理が消える。
  - レギュレーションごとに技・持ち物・メガの差分を表現でき、期間（開催中＝`end: null`）も持てる。
  - 解禁集合の id がカタログ参照で検証され、未登録 id を生成段で弾ける。
- **悪い点 / コスト**:
  - 型機構（`ConstrainParty`）とランタイム（`validateParty`）の両方を付け替える不可逆な変更で、
    一度に多くのファイルに波及する（types / domain / cli / 生成 / テスト）。
  - レギュレーション追加時に per-reg YAML を 1 ファイル起こす必要がある（catalog だけでは増えない）。
- **トレードオフ / 留意点**:
  - パーティの legality は「メンバー（base 種族）∈ `species` 集合」で判定し、`mega` は別メタとして持つ
    （メンバーはメガ前の base 種族を指すため）。
  - 技を per-reg YAML に記録するが型生成しない方針は、後続の誤解を避けるため rule / 本 ADR に明記する。

## Alternatives Considered

- **B案: `SpeciesBase.regulations[]` を生成時に維持**（per-reg YAML を入力に逆引き materialize し、
  既存 `ConstrainParty` をそのまま使う）。型機構の変更は最小で済むが、解禁情報が種族と
  レギュレーションの 2 箇所に現れ SoT が二重化する。技・持ち物・メガの per-reg 差分も種族側配列では
  表現しづらい。SoT 一貫性を優先して却下。
- **per-regulation を単一ファイルに集約**（旧 `regulation.yaml` を踏襲しつつ allow を拡張）。
  ファイル数は減るが、レギュレーションが増えるほど 1 ファイルが肥大し差分レビューが難しくなる。
  1 レギュ = 1 ファイルの方が追加・改訂の粒度が明快なため却下。
