---
id: 0043
status: Accepted
date: 2026-07-05
---

# 0043. メガ名の取得元を showdown/手作業から PokeAPI(pokemon-form form_names) へ一本化する

## Context

メガ形態の名前辞書 `data/languages/mega.yaml`（`id → { ja, en }`）は、これまで **en = showdown（`.name`）/
ja = 手作業**で埋める分担だった（[ADR 0041](./0041-languages-full-name-dictionary.md) の全件辞書取得方針で
「`mega` は PokeAPI 非対象」と明記・取得元分担表は [[data-pipeline]]）。この分担は「PokeAPI のカテゴリ
（`pokemon-species` / `item` / `move` / `ability` / `type`）に mega が無い」という前提に立っていた。

しかし実測で、PokeAPI は **`/api/v2/pokemon-form/{slug}` の `form_names`** に mega の ja/en を持つことが確定した
（`is_mega: true` で判別・`charizard-mega-x`=メガリザードンＸ / `staraptor-mega`=メガムクホーク /
`falinks-mega`=メガタイレーツ 等）。Champions 新規メガも ja 込みで揃い、`/pokemon-form?limit=…` の `is_mega`
形態は計 97 件。前提（mega は PokeAPI 非対象）が誤りだったため、ja を手作業で発明・保守し続ける負債と、mega 名だけ
名前 SoT の外（showdown 経路）に置く非対称を解消できる。

一方で mega の**構造**（`mega-specs.yaml` = 種族値 / タイプ / 特性 / baseSpecies）と **linking**
（`species-specs.megaEvolvesTo` / `<reg>/mega.yaml` / `item-specs.megaSpecies`）は引き続き pokemon-showdown が
第一の正で、本 ADR は**名前（languages/mega.yaml）だけ**を対象にする（構造 + linking の取得元は不変）。

## Decision

**メガ名（`data/languages/mega.yaml` の ja/en）を PokeAPI `pokemon-form` の `form_names` から取得する経路へ一本化
する。** mega を PokeAPI 全件名辞書の **6 種目**として `species` / `items` / `moves` / `abilities` / `types` に
加える。列挙は `/pokemon-form` list の全 slug を mega 候補（`-mega` / `-mega-x` / `-mega-y` / `-mega-z`）へ絞り、
各 form 詳細の **`is_mega: true`** を最終判別に、`form_names` から ja（ja-Hrkt 優先）と en を両取りする。PokeAPI
slug は pokeform の mega id 規約（`<base>-mega[-x|-y]`・[ADR 0040](./0040-serebii-provisional-scraper-rebuild.md)）
と一致するため id 正規化は不要。取得 + 転記の純ロジックは `src/codegen/materialize.ts`（`extractMegaNames` /
`megaFormCandidates`・カバレッジ 100%）、配線は `scripts/fetch-pokeapi.ts` / `scripts/materialize.ts`。

同時に **showdown の mega 名取得ルートを削除する**: `scripts/sync-showdown.ts` の `syncMega` から
`languages/mega.yaml` 書き込みを、`src/codegen/showdown/mega-fields.ts` から `megaEnName` を除去する（`megaId` /
`megaStructuralFields` / `megaBaseSpeciesId` / `groupMegaByBase` は構造 + linking 用に残す）。

これは [ADR 0041](./0041-languages-full-name-dictionary.md) の「`mega` は PokeAPI 非対象・en=showdown / ja=手作業」
という**取得元分担の派生不変条件を refine** する（全件名辞書化・generate superset 判定・PokeAPI 名前取得 workflow
という 0041 の中核決定は不変）。あわせて [ADR 0040](./0040-serebii-provisional-scraper-rebuild.md) の権威序列は
mega **名前**に関して「PokeAPI を第一の正」に更新する（mega 構造 + linking は showdown=正で不変）。
[ADR 0035](./0035-specs-languages-layout-redesign.md) の「名前 SoT = languages」も不変で、mega 名の充填元が
showdown/手作業から PokeAPI へ移るだけ。詳細な取得元分担は [[data-pipeline]] が SoT。

## Consequences

- **良い点**:
  - ja を手作業で発明・保守する負債が消える（全 97 mega 名が PokeAPI 由来で決定論的に埋まる・Champions 新規メガ
    も自動化）。名前 SoT が 6 種すべて PokeAPI 全件辞書で統一され、mega だけの非対称が解消。
  - generate は superset 判定（ADR 0041）ゆえ mega-specs 未参照の mega 名（orphan）も 0 終了で許容し、辞書が全件
    （97 件）を持てる。解禁取得（showdown / Serebii）は構造 + legality に専念でき ja gap が消える。
- **悪い点 / コスト**:
  - PokeAPI が持つ `is_mega: true` 形態には未実装・データマインド由来の form（`*-mega-z` 等）も含まれ、辞書に
    orphan 名として入る。superset で無害だが、生成データレビュー（`pokemon-data-reviewer`）で内容を確認する。
  - PokeAPI にメガストーン等（Champions 固有）は無く、手作業カバー箇所の照合導線が別途必要（下記留意点）。
- **トレードオフ / 留意点**:
  - **メガストーン item 名など PokeAPI 非存在の手作業カバー箇所**は本 ADR の対象外。差分チェックの導線として
    `pokeapi-names.yml` の PR body に Serebii Champions ページ 5 本のリンクを提示する（items / moves / pokemon /
    megaabilities / newabilities）。メガストーンの自動取得は別途。
  - mega の**構造 + linking の取得元は showdown で不変**（本 ADR は名前のみ）。`git diff` で mega-specs /
    megaEvolvesTo / per-reg mega が変わらないことを確認する。

## Alternatives Considered

- **ja だけ手作業を続け en=showdown を維持する**: PokeAPI が mega の ja/en を両方持つ実測に反し、手作業負債を残す。
  mega だけ名前 SoT の外に置く非対称も温存する。却下。
- **mega 名も Serebii 速報経路から取る**: Serebii は速報（provisional）で latin-1 + 数値文字参照のパース負債があり、
  reg 非依存の全件名辞書には向かない。PokeAPI は reg 非依存の全件名を安定に持つ（ADR 0041 の名前経路と同型）。却下。
- **PokeAPI 非存在の form を name-pattern だけで除外する**: `-mega` 名だけでは `*-mega-z` 等の判別が曖昧。
  `is_mega` を最終判別に使えば PokeAPI の定義に従え、name-pattern は fetch 対象の事前絞り込みに留められる。採用。
