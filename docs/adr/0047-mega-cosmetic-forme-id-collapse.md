---
id: 0047
status: Accepted
date: 2026-07-15
---

# 0047. メガの装飾フォルム slug を canonical `<base>-mega` id へ畳む

## Context

[ADR 0043](./0043-mega-names-from-pokeapi-form-names.md) はメガ名（`languages/mega.yaml` の ja/en）を PokeAPI
`pokemon-form` の `form_names`（`is_mega` で判別）へ一本化し、その際「PokeAPI の mega slug は pokeform の mega id
規約（`<base>-mega[-x|-y]`）と一致するため **id 正規化は不要**（`extractMegaNames` は slug をそのまま id に使う）」を
前提とした。この前提は charizard-mega-x など大多数の mega では正しい。

しかし PokeAPI は `is_mega: true` の form を**装飾フォルム（姿差・色差のみで別種族にしない form）ごと**にも持つ:

- `magearna-original-mega`（オリジナルカラー）— base `magearna-mega` と別 slug
- `tatsugiri-{curly,droopy,stretchy}-mega`（3 姿）— いずれも同一の実体

これらは構造 `mega-specs.yaml` に存在しない未実装・データマインド由来の orphan 名（ADR 0043 の Consequences が
「orphan として辞書に入る」と認めたもの）だが、slug 恒等のまま転記すると**同一実体が姿別 id に分裂**する。species
側は同種の装飾フォルムを `FORM_EXCLUDE`（`tatsugiri-curly` / `pyroar-male` 等）や `canonicalFormId` で単一種族へ畳んで
いるのに対し、mega 経路には対応する畳み込み機構が無く、名前辞書だけ姿別に膨らんでいた。[ADR 0044](./0044-canonical-species-id-explicit-slug.md)
が species id で「PokeAPI slug 恒等」consequence を canonical 正規化で refine したのと同じ穴が mega 経路に残っていた。

## Decision

mega 名転記経路に **装飾フォルム × メガ → 単一 canonical `<base>-mega` の畳み込み**を追加し、ADR 0043 の「mega slug =
id 恒等」前提を装飾 forme に限って refine する。実装 SoT は `src/codegen/materialize.ts`（純関数・カバレッジ 100%）:

- `MEGA_ID_COLLAPSE`（curated マップ）: `magearna-original-mega` → `magearna-mega`、`tatsugiri-{curly,droopy,stretchy}-mega`
  → `tatsugiri-mega`。species 側 `FORM_EXCLUDE` と同型の**明示列挙**（誤爆回避のため正規表現でなく curated）。
- `canonicalMegaId` / `resolveMegaEntry`: 転記前に id を畳み、`MEGA_NAME_OVERRIDE` で canonical の名前を与える
  （PokeAPI `form_names` の en が姿別 "Mega Curly Tatsugiri" 等で canonical に合わないため `tatsugiri-mega` = "Mega Tatsugiri"）。
- `megaIdsToPrune`: 既存 `mega.yaml` に残る姿別 source id を、**canonical target が存在する分だけ**剪定する
  （名前消失を防ぐ）。IO（YAML ノード操作）は `scripts/materialize.ts`。

gender メガ（`meowstic-*-mega`）は**畳まない**。構造メガが `mega-specs.yaml` に実在し
[ADR 0046](./0046-gender-mega-conditional-collapse.md) が learnset 差により per-gender 保持を決定済みで、本畳み込みは
装飾 forme 専用ゆえ gender には触れない。判断基準・対象の正本は `.claude/rules/data-pipeline.md`。

## Consequences

- **良い点**:
  - 同一実体のメガが単一 id（`${species}-mega`）に収束し、名前辞書の姿別膨張が解消する。species 側の装飾フォルム
    畳み込み方針と mega 経路の扱いが揃う。
  - 畳み込み + 剪定が冪等: `pokeapi-names.yml`（`fetch:ja-names` → `sync:ja-names`）を再実行しても姿別 id が復活しない
    （ADR 0043 前提のままだと復活していた非冪等を解消）。
- **悪い点 / コスト**:
  - curated マップゆえ、将来 PokeAPI が新たな装飾フォルム × メガ slug を返したら `MEGA_ID_COLLAPSE` への追記が要る
    （自動判定でなく明示保守）。
- **トレードオフ / 留意点**:
  - `tatsugiri-mega` / `magearna-mega` は構造 `mega-specs.yaml` を持たない orphan 名のまま。generate は superset 判定
    （[ADR 0041](./0041-languages-full-name-dictionary.md)）ゆえ 0 終了で許容される。Champions で当該メガが解禁されれば
    showdown 経路が同一 canonical id で構造を与える想定。
  - 畳み込み後の canonical id 名は curated override に依存する（PokeAPI 姿別名を捨てる）。対象が増えたら override も要保守。

## Alternatives Considered

- **装飾フォルム × メガの orphan 名を除外（削除）する**: `mega.yaml` から姿別 id ごと落とす案。単一 id 統合より diff は
  小さいが、将来解禁時に名前辞書へ再投入が要る。単一 canonical id を残す方が showdown 経路が構造を後付けする際に
  id が一致して滑らか。利用者の意図（`${species}-mega` の単一 id を残す）にも沿うため不採用。
- **`mega.yaml` を手編集して姿別 id を消す**: 名前辞書は PokeAPI スカフォールドの生成物で、手編集しても次の
  `pokeapi-names.yml` 実行で姿別 id が再 append され復活する（非冪等）。生成側にルールを置く本決定を採る。
- **`canonicalFormId` に mega 畳み込みを相乗り**: species canonical 正規化（`REDUNDANT_FORM_SUFFIX` 等）と mega の
  装飾 forme 畳み込みは対象と語彙が異なり、混ぜると誤爆リスク・可読性低下を招く。mega 専用の curated マップを
  `materialize.ts`（mega 名純ロジックの所在）へ置く方が凝集する。
