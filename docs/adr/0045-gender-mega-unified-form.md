---
id: 0045
status: Accepted
date: 2026-07-11
---

# 0045. Champions の gender メガを単一メガ形態へ統合する

## Context

Champions（Legends Z-A）は性別二形の種にメガを与える。pokemon-showdown はこれを **♀♂で別々の forme**
（`Meowstic-F-Mega` / `Meowstic-M-Mega`）として持つが、両者は**種族値・タイプ・特性が完全一致**する（gender ラベル
だけが違う）。ADR [0044](./0044-canonical-species-id-explicit-slug.md) の canonical 化で forme id を
`meowstic-female-mega` / `meowstic-male-mega` に正規化したが、これを 2 つのメガ形態として扱うと 2 つの問題が出る:

1. **1 ストーン → 2 形態のリンクを表現できない**。メガストーンは 1 種（`meowsticite`）で、これが両 gender メガを
   生む。しかし `item-specs.megaSpecies`（メガストーン → メガ形態の逆リンク・[data-pipeline](../../.claude/rules/data-pipeline.md)）
   は**単数値**で、`meowstic-female-mega` にストーンが紐付かず `generate` の `megaFormStones` 検証が
   `mega form 'meowstic-female-mega' has no mega stone` で落ちる。
2. **showdown の baseSpecies が bare**（両 gender forme とも `Meowstic`=♂）で、♀メガの base 種族を導けない。

M-A フル rollout でこの gap が顕在化した（gender メガは M-A で meowstic のみ）。

## Decision

**gender メガの ♀♂ 2 形態を単一メガ形態 `<base>-mega`（`meowstic-mega`）へ統合する**。base 種族の gender 分割
（`meowstic-female` / `meowstic-male` が別種）は維持し、**♀♂両 base が単一メガへ `megaEvolvesTo`** する。統合の
機構は showdown 抽出層の純関数に閉じる（実装 SoT は `src/codegen/showdown/mega-fields.ts` / `items-fields.ts`）:

- `megaFormId`（`megaId` / `megaSpecies` 共通）が gender メガ forme id（`-f-mega` / `-m-mega`）を単一
  `<base>-mega` へ畳む（非 gender メガは `canonicalFormId` 素通り）。ADR 0044 の `canonicalFormId` は base 種族
  form 専任に戻し、gender メガ畳みは `mega-fields.ts` が担う。
- `megaEvolveBaseId` が mega 名の gender から gender 別 base（F→`-female` / M→`-male`）を導出し、`groupMegaByBase`
  が ♀♂両 base に単一メガを紐付ける。`mega-specs.baseSpecies`（単一逆参照）は canonical（♂）に揃える。
- メガ名（`languages/mega.yaml`）は統合 id `meowstic-mega` を skill 著述で持つ（PokeAPI `pokemon-form` は
  gender 別しか持たず統合 id を backfill できないため・ADR [0043](./0043-mega-names-from-pokeapi-form-names.md) の
  例外）。

## Consequences

- **良い点**:
  - `item-specs.megaSpecies` を単数値のまま保て、1 ストーン → 単一メガの逆リンクが自然に成立する（`megaFormStones` 通過）。
  - 同一実体（同種族値の ♀♂メガ）を 1 エンティティに畳み、mega-specs / languages/mega の重複を避ける。
  - ♀♂両 base の `megaEvolvesTo` が単一メガを指し、gender を跨ぐメガ進化を型で表現できる。
- **悪い点 / コスト**:
  - 統合メガ名（`meowstic-mega`）は PokeAPI に無く skill 著述に依存する（backfill 対象外・手当て漏れると `requireNames` で落ちる）。
  - gender メガ判定を forme id サフィックス（`-f-mega` / `-m-mega`）の形状に依存する（新種で別サフィックスが来たら要拡張）。
- **トレードオフ / 留意点**:
  - `mega-specs.baseSpecies` は単一逆参照ゆえ canonical（♂）1 つを保持し、♀ base は `megaEvolvesTo`（species-specs / per-reg）側でのみ表現する（逆参照の非対称を許容）。
  - ♀♂メガの種族値が将来 divergすれば統合は不成立になる（その時は本 ADR を supersede して per-gender へ戻す）。

## Alternatives Considered

- **`item-specs.megaSpecies` を配列化して 1 ストーン → 2 形態を表現**: メガ形態は依然 2 つ残り、同種族値の重複
  エンティティを保持し続ける。型・generate・逆引きの複雑化に見合わず却下。
- **generate 側で gender-pair を特別扱い**（♀メガのストーンを♂メガのストーンで代替）: メガ形態の重複を残したまま
  検証だけ緩める hack で、データモデルの不整合（♀メガに実ストーンが無い）が残る。却下。
- **per-gender メガを維持**（ADR 0044 の正規化のまま）: 上記 Context の 2 問題が未解決で M-A rollout を通せない。却下。
