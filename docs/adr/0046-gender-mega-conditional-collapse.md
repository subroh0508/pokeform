---
id: 0046
status: Accepted
date: 2026-07-11
---

# 0046. gender メガの畳み込みを条件付きにし非畳み込み時は per-gender で保つ

## Context

ADR [0045](./archive/0045-gender-mega-unified-form.md) は Champions の gender メガ（`Meowstic-F/M-Mega`）を
**無条件で**単一 `<base>-mega` へ畳んだ（♀♂は種族値/タイプ/特性が一致するため）。しかし **meowstic は ♀♂で
覚える技（learnset）が異なる**（♀ 固有: extrasensory / future-sight、♂ 固有: imprison / mean-look /
misty-terrain / quick-guard / wish。種族値/タイプ/特性は一致）。技が違うものを単一メガに畳むと、統合メガの
movepool を ♀♂ どちらに揃えても legality が不正確になる（無条件畳み込みは union で回避したが、本来 ♀♂ は別物）。

あわせて PR #248 の `pokemon-data-reviewer` が、gender メガストーンの `megaStoneFor` が canonical 化されず
bare `meowstic`（`SUPPRESS_BASE_SPECIES` 抑制種で roster 不在）を指す不整合を指摘した。

## Decision

**gender メガの ♀♂ を単一へ畳むのは「種族値・タイプ・特性・learnset がすべて一致」する場合のみ**とし、1 つでも
違えば **per-gender**（`<base>-female-mega` / `<base>-male-mega`）として残す。畳み込み条件の判定は純関数
`genderMegaFormsIdentical`（`src/codegen/gender-mega-collapse.ts`・テスト済み）に一本化する。meowstic は learnset
が ♀♂で異なるため畳まれず、`meowstic-female-mega` ← `meowstic-female` / `meowstic-male-mega` ← `meowstic-male`
に分かれ、各々自分の gender base の movepool を持つ。実装 SoT は `src/codegen/showdown/mega-fields.ts`
（抽出は per-gender で忠実）/ `src/codegen/showdown/items-fields.ts` / `scripts/generate.ts`：

- **抽出は per-gender で忠実に写す**（`megaFormId` は `canonicalFormId` 経由・`meowstic-f-mega`→`meowstic-female-mega`）。
  gender メガの base は mega 名の gender から導出（`megaEvolveBaseId`・F→`-female` / M→`-male`）。
- **1 ストーンが ♀♂両形態に対応**（meowsticite）するため `item-specs.megaSpecies` を**単数 → 配列**化し、gender
  メガストーンは兄弟形態も含めた配列（`[<base>-female-mega, <base>-male-mega]`）にする（`genderMegaSiblingId`）。
  generate の `stonesByMegaSpecies` が配列を展開して各形態へ逆引きを張る。
- **`megaStoneFor` を canonical 化**（`canonicalSpeciesId(link.baseSpecies)`・bare `Meowstic`→`meowstic-male` /
  `Floette-Eternal`→`floette-eternal`）。

## Consequences

- **良い点**:
  - ♀♂で異なる movepool（meowstic）を正しく別メガとして扱い、各 gender base が自分の movepool を持つメガへ進化する。
  - 畳み込み条件を純関数に形式化し、種族値/タイプ/特性/learnset の一致を機械判定・テストできる。
  - `megaStoneFor` が有効な roster id を指し、item-specs のメタデータ整合が回復する。
- **悪い点 / コスト**:
  - `item-specs.megaSpecies` の schema を単数 → 配列へ変更し、既存 item-specs の string 値を配列へ一度マイグレーションした。
  - 「一致するなら畳む」の**ランタイム畳み込み（複数 base → 単一メガの合成）**は、learnset が per-reg・mega-specs が
    global で整合が非自明かつ**現状の Champions gender メガに一致例が無い**（meowstic は技差）ため、generate 側の
    畳み込みマージは未実装（判定純関数のみ実装・per-gender の union 経路は将来の畳み込みに備えて残置）。一致する
    gender メガが将来現れたら本 ADR の条件に沿って畳み込みマージを実装する。
- **トレードオフ / 留意点**:
  - per-reg reset（空スタブ）でも generate が動くよう空集合耐性化（`?? []` / `?? {}`）を併せて入れた（従来 null で
    `ids is not iterable` になっていた）。

## Alternatives Considered

- **ADR 0045 の無条件畳み込みを維持**: ♀♂で movepool が違う meowstic を単一メガに畳み、legality を union で近似する。
  異なる実体を 1 エンティティに潰し movepool が不正確になるため却下（本 ADR が supersede）。
- **抽出段で learnset を持たせて畳み込み判定**: `MegaInput` に base learnset を足し pure 層で畳む案。items 経路
  （別抽出ストリーム）が畳み込み状態を知り得ず megaSpecies が mega 経路と食い違うため却下。判定は generate（全データ
  が揃う）に寄せた。
