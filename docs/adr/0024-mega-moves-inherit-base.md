---
id: 0024
status: Accepted
date: 2026-06-10
---

# 0024. メガ先種族の per-reg moves は base 種族の per-reg moves を継承する

## Context

[ADR 0021](./0021-per-regulation-species-and-legality.md)〜[0023](./0023-generate-transformer-and-check-regulation.md)
で、per-regulation の習得技は **base 種族キー下の `moves`（YAML 由来）を正本**とし、`generate.ts` は変換専任
（覚えない技の検証は authoring 時ゲート `check:regulation`）と定めた。一方、メガ進化先（`mega` 配列で列挙される
mega-only 種族）の `moves` は per-reg YAML に持たず、`generate.ts` が **`catalog/moves.yaml` 全体 ∩ そのメガ form の
PokeAPI learnset** から導出していた（`scripts/generate.ts` 旧 line 340）。

この導出には問題がある。メガ先の movepool が **base 種族の per-reg `moves`（Serebii M-A subset）より広くなる**。
例: `charizard-mega-x/y` に `defog` / `hone-claws` / `tailwind` / `toxic`、`garchomp-mega` に `aqua-tail` / `roar` 等が
base に無いのに現れる。ゲーム仕様上、技は **base 形態に登録**し、メガは戦闘中の変身に過ぎず movepool を共有するため、
メガ先固有の技プールは**実質使用不可能な過大表現**になる。02-data-model-redesign の小データセット投入（3 種）の
`pokemon-data-reviewer` がこれを検出した（learning `docs/harness/learnings/2026-06-10-pr-59.md`）。全量投入（約59メガ）
で広く波及するため、全量投入の前に定義方針を確定する。

## Decision

**メガ先（mega-only）種族の per-reg `moves` は、その base 種族（`mega` 配列にそのメガを列挙する種族キー）の
per-reg `moves` を継承する（同一 movepool）。** `catalog ∩ learnset` 由来の導出は廃止する。`generate.ts` は per-reg
species dex 構築時に「メガ先 → base 種族キー」の逆引きマップを作り、mega-only 種族の `moves` に base の
`speciesAllowOf(reg, baseId).moves` を充てる（[ADR 0023](./0023-generate-transformer-and-check-regulation.md) の
変換専任は不変・新たな検証は加えない）。base 種族キーの `moves` が引き続き per-reg 習得技の唯一の正本
（[ADR 0022](./0022-per-regulation-species-keyed-moves.md)）であり、メガ先はその派生になる。

## Consequences

- **良い点**:
  - メガ先の movepool が base と一致し、ゲーム仕様（技は base 形態に登録・メガは movepool 共有）に整合する。過大表現が解消。
  - per-reg `moves` の正本が base 種族キーに一本化され、メガ先は派生（二重管理にならない・PokeAPI learnset への依存も解消）。
  - `generate.ts` から learnset 構築（`learnSets`）が不要になり、変換ロジックが単純化する。
- **悪い点 / コスト**:
  - メガ進化で movepool が変わる種（base と異なる技を覚えるメガ）には対応しない。チャンピオンズに該当は無いが、将来そうしたケースが出たら再検討が要る。
  - 既存生成物（`data/generated/regulations/*/species.ts`）のメガ先 `moves` が変わる（出力差分）。生成物は手編集せず再生成で追従する。
- **トレードオフ / 留意点**:
  - メガ先固有調整が必要になった場合は、per-reg にメガ先 `moves` を明示する拡張（base 継承を上書き）を別途設計する。本 ADR は「既定は base 継承」を定める。

## Alternatives Considered

| 代替案 | 却下理由 |
|---|---|
| `catalog ∩ learnset` を維持（現状） | base より広い過大表現になり、実ゲームで使えない技がメガ先に並ぶ。全量投入で59メガに波及。 |
| メガ先にも per-reg `moves` を明示記録（YAML に書く） | base とメガで同一 movepool を二重記述になり、ADR 0022 の「moves 正本は base」と不整合。乖離・追従漏れの温床。 |
| メガ先の `moves` を空にする | メガ先個体の技合法判定ができなくなる（per-reg dex は legality 正本）。利用者が困る。 |
