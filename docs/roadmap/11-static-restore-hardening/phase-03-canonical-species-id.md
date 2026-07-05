# Phase 3 — canonical species id の明示 slug 化（構造側 showdown 正規化）+ ADR

## 目的 / スコープ

フォルム・リージョン・性別等で**タイプ / 種族値が変わる variety を明示 slug の canonical id で一意に扱う**ため、
pokeform の species id 正本を **明示 slug 方式（PokeAPI variety slug に整合）**に定め、showdown 抽出 id を
canonical へ正規化する層を構造パイプライン（showdown codegen）へ入れる。名前生成（distinct-forms 辞書）は
Phase 4、全件本投入は Phase 5 でスコープ外。

- スコープ内: `src/codegen/showdown/` の id 導出に canonical 正規化を追加、正規化マップ（3 種）を純関数で持つ、
  specs 再生成、決定を ADR 化。
- スコープ外: 名前（ja/en）生成・distinct-forms 辞書投入（Phase 4）、per-reg 全件投入（Phase 5）、mega 名
  （mega.yaml・ADR 0043 経路・不変）。

## 背景 / なぜ明示 slug へ

PokeAPI と showdown で id スキームが体系的に食い違う（本セッション調査で全件確認）:

- **showdown**: デフォルトフォルムは **bare**（`deoxys` / `basculegion` / `urshifu`）、非デフォルトのみ接尾辞。
- **PokeAPI**: デフォルトにも明示 slug（`deoxys-normal` / `basculegion-male` / `urshifu-single-strike`）。原種が
  無い対等フォルム（urshifu 一撃/連撃）を bare にすると曖昧になるが、PokeAPI はこれらに明示 slug を振る。

`ids.ts` の「PokeAPI と同じ kebab」前提は上記デフォルト・語彙差で成立していない。**canonical を PokeAPI 準拠の
明示 slug に定める**と、名前側（Phase 4）が PokeAPI slug と恒等になり突合マップ不要、reconciliation は構造側の
1 箇所に集約する。原種/基本フォルムしか無い種（`raichu`=カントー・`rotom`=基本）だけ bare を維持する
（PokeAPI・showdown 共通慣習）。

## 前提（依存）

- **本計画群 Phase 1-2 完了**（復元機構堅牢化 + 非 third-party PR 作成・main 緑）。
- 確定規約: [[data-pipeline]] / [[type-conventions]]（`kebabId` / XxxId パターン）/ [[testing]] / [[tsc-verification]]。

## タスク

- [ ] `src/codegen/showdown/` に **`canonicalSpeciesId`** 純関数を追加（showdown 種族の `name` / `baseSpecies` /
  `forme` から canonical id へ写す）。既存 `kebabId` は共用のため species 専用の正規化層を分離し moves/abilities/
  items の id 導出は不変に保つ。
- [ ] **正規化マップ（3 種・curated / 有界）**を純関数側に持つ:
  - **default→明示**（showdown bare → PokeAPI 明示 default slug・例 `urshifu`→`urshifu-single-strike` /
    `deoxys`→`deoxys-normal` / `basculegion`→`basculegion-male`）。この集合は PokeAPI `is_default` variety slug から
    機械導出できる（生成 + コミットした対応表を正本にするか live 導出かは実装判断）。
  - **Class C 語彙差**（`necrozma-dusk-mane`→`necrozma-dusk` / `tauros-paldea-combat`→`tauros-paldea-combat-breed`
    / `ogerpon-wellspring`→`ogerpon-wellspring-mask` / `greninja-bond`→`greninja-battle-bond` /
    `maushold-four`→`maushold-family-of-four` 等）。
  - **`CANONICAL_ID_OVERRIDE`**（PokeAPI が bare にする default を明示分割・例 `gimmighoul`→`gimmighoul-chest`。
    roaming は既に明示）。
- [ ] 上記を `species-fields` の id 導出へ配線し、`sync-showdown.ts` が canonical id で specs / per-reg を書く。
- [ ] 純関数のコロケーション test（default→明示 / Class C / override / 素の base 素通り / moves 等非干渉の
  4-5 系統・カバレッジ100%）。
- [ ] specs 再生成（現行 specs は `rotom-wash`（既に明示）/ `greninja`（base 維持）のみで **改名移行はゼロ** =
  無変化で緑を確認）。
- [ ] 決定を **ADR 化**（`adr-new`）: 「species id 正本 = 明示 slug（PokeAPI 準拠）/ showdown を canonical へ
  正規化 / distinct-forms 辞書（Phase 4）で ADR 0041 を refine」。

## この Phase で育てるハーネス（rule・skill）

- **ADR 起票**（`adr-new`）: canonical=明示 slug・showdown 正規化・（Phase 4 の）distinct-forms 辞書・含有合成を
  1 本の ADR で決定記録（ADR 0041 の form 扱いを refine・ADR 0035/0039 の id 正本を明確化）。
- **[[data-pipeline]] / [[type-conventions]] 追記**: species id 正本 = 明示 slug canonical、showdown id →
  canonical 正規化層の存在と責務境界（1 行ポインタ）。
- **[[cli-and-io]]**: 個体 / パーティ YAML が canonical 明示 slug（`deoxys-normal` 等）を書けることを追記。

## 受け入れ基準

1. `pnpm verify`（型 / カバレッジ100% / Biome / yaml-style）緑。
2. `canonicalSpeciesId` + 3 マップの純関数がコロケーション test でカバレッジ100%（default→明示 / Class C /
   override / base 素通り / moves 等非干渉を網羅）。
3. specs 再生成が canonical id で emit され、現行 specs（`rotom-wash` / `greninja`）は無変化で緑。
4. moves / abilities / items の id 導出が不変（species 専用正規化のスコープ確認）。
5. 決定の ADR が採番・作成済み（`adr-new`）。

## 検証手順

1. 代表ケースで `canonicalSpeciesId` の出力を確認（`urshifu`→`urshifu-single-strike` /
   `necrozma-dusk-mane`→`necrozma-dusk` / `gimmighoul`→`gimmighoul-chest` / `raichu`→`raichu`（bare 維持）/
   `charizard`→`charizard`）。
2. specs 再生成 diff が現行 id と一致（改名移行ゼロ）を確認。
3. `git grep` で moves/abilities/items の id 導出に影響が無いことを確認。
4. `pnpm verify` 緑。

## リスク・備考

- **canonical 正本を PokeAPI 準拠にする trade-off**: 一部 id が Smogon/showdown 綴りから離れる
  （`necrozma-dusk` / `tauros-paldea-combat-breed` / `urshifu-single-strike`）。名前側の突合を恒等にできる利得と
  引き換え。決定根拠は ADR に残す。
- **default→明示マップは PokeAPI `is_default` から機械導出可能**（対等フォルム ~27 種）。Class C 語彙差 +
  `CANONICAL_ID_OVERRIDE`（gimmighoul 等）のみ手当て。いずれも spec 駆動で有界。
- 本 phase は id 正規化のみで名前を生成しない。名前欠落は Phase 4 まで languages 側に現れないが、現行 specs は
  `rotom-wash` / `greninja` のみで既に名前があるため generate は緑を維持する。
- 構造データ（baseStats / types / legality）の正は showdown のまま不変。正規化は **id の綴りのみ**を写す。
