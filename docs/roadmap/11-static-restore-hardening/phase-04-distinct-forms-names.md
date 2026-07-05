# Phase 4 — distinct-forms 名前生成（含有判定合成 + reg 非依存の全 form 名辞書）

## 目的 / スコープ

canonical 明示 slug（Phase 3）を主キーに、**タイプ / 種族値が異なる（または別種族扱いすべき）全 form** の
ja/en 名を PokeAPI から生成し、`data/languages/species.yaml` に **reg 非依存の distinct-forms 辞書**として投入する。
手動 `SPECIES_FORMS` whitelist（rotom-wash 1 件）を廃し、含有判定ルールで機械生成する。

- スコープ内: 名前合成の純関数、`fetch-pokeapi.ts` の distinct 列挙、3 リスト（`FORM_INCLUDE` /
  `MANUAL_NAME_OVERRIDE` / Phase 3 の `CANONICAL_ID_OVERRIDE` を利用）、`pokeapi-names.yml` の PR レビュー表、
  distinct-forms 名の投入。
- スコープ外: canonical id 正規化（Phase 3）、per-reg 全件本投入（Phase 5）、mega 名（mega.yaml・ADR 0043）、
  純装飾フォルム（同型・同種族値）。

## 背景 / 設計（本セッション調査で全件確認）

- **含有判定ルール**: `form_names.ja` が base 種族名を**含む**→ そのまま採用（改名フォルム・`ヒートロトム` /
  `ブラックキュレム` / `サトシゲッコウガ`）、**含まない**→ `base名（form_names.ja）` で合成（`ザシアン（けんのおう）`
  / `ライチュウ（アローラのすがた）` / `イダイトウ（メスのすがた）`）。en も base 英名で対称適用。合成側は必ず
  base 種族名を先頭に置くため**アイデンティティを誤らない**。
- **distinct フィルタ**: PokeAPI 全 variety のうち base と**タイプ or 種族値が異なる**ものを採用。純装飾
  （同型・同種族値の vivillon 模様 / alcremie / minior 色 等）は除外。`-mega`/`-gmax`/`-primal`/`-totem`/`-starter`
  も除外（mega は mega.yaml 経路）。→ 対象 **約87 form**。
- **`FORM_INCLUDE`**: 同ステータスでも別種族にしたい form を明示追加（`greninja-battle-bond`）。
- **`MANUAL_NAME_OVERRIDE`**: PokeAPI に ja が無い / 名前衝突する form を著述（`greninja-battle-bond` の ja /
  `tauros-paldea-combat|blaze|aqua-breed` の breed 識別・form_names.ja が3種とも「パルデアのすがた」で衝突）。
- 実測内訳: passthrough 10 / compose 75 / canonical-override 1（gimmighoul-chest）/ 手動 4
  （tauros×3 + greninja-battle-bond）。**85/89 が全自動**。

## 前提（依存）

- **Phase 3 完了**（canonical 明示 slug・showdown 正規化）。specs id が canonical で emit される。
- 確定規約: [[data-pipeline]]（全件名辞書 / ADR 0041）/ [[testing]] / [[tsc-verification]]。

## タスク

- [ ] `src/codegen/materialize.ts` に純関数を追加: **`composeFormName`**（含有判定・ja/en）/
  **`deriveBaseId`**（form id → base 種族 id・最長 base-slug 前置一致）/ **distinct 判定述語**（type/stat 差）。
- [ ] `scripts/fetch-pokeapi.ts`: `SPECIES_FORMS` を廃し、**pokemon-species → varieties → types/stats を列挙して
  distinct フィルタ** + `FORM_INCLUDE` + `-mega`/`-gmax`/`-primal`/`-totem`/`-starter` 除外。canonical id
  （Phase 3 の正規化）でキーイングし、含有合成した ja/en を raw 化（現行 rotom-wash disguise と同型）。
- [ ] **`MANUAL_NAME_OVERRIDE`** を著述（`tauros-paldea-*-breed` 3 種の breed 識別 ja + `greninja-battle-bond`
  の ja）。合成結果より優先適用。
- [ ] 純関数のコロケーション test（passthrough / compose / 衝突 / ja 欠落 / base 導出・カバレッジ100%）。
- [ ] `.github/workflows/pokeapi-names.yml` に **PR レビュー表**（form ごとに id / en / ja / decision
  〔passthrough|compose|canonical-override|manual〕/ distinct 根拠）を PR body へ出力。
- [ ] `pokeapi-names.yml` を dispatch し、**distinct-forms 名（約87件）を languages/species.yaml へ投入**する
  data PR を生成 → `pnpm generate:data` / `verify` 緑（superset 許容）→ `pokemon-data-reviewer` レビュー。

## この Phase で育てるハーネス（rule・skill）

- **[[data-pipeline]] 追記**: 名前辞書を **distinct-forms** に拡張（ADR 0041 の form 扱いを refine・Phase 3 ADR と
  整合）。含有判定合成・3 リスト・distinct フィルタ・除外パターンの責務境界（手順 SoT は skill）。
- **`author-static-data` SKILL.md 更新**: `SPECIES_FORMS` whitelist を distinct 列挙 + 含有合成 + 3 リストへ
  置換した手順、PR レビュー表の確認、手動 override（tauros / greninja-battle-bond）の Gotchas。
- ADR は Phase 3 で 1 本起票済み（本 phase はそれを参照）。

## 受け入れ基準

1. `pnpm verify`（型 / カバレッジ100% / Biome / yaml-style）緑。
2. `composeFormName` / `deriveBaseId` / distinct 述語がコロケーション test でカバレッジ100%。
3. `data/languages/species.yaml` に distinct-forms 名（約87件）が canonical id で入り、`generate:data` が
   superset 許容で緑。代表確認: **rotom 全5フォルム / basculegion オス・メス両方 / urshifu 一撃・連撃両方 /
   gimmighoul 箱・徒歩両方 / 各リージョンフォーム / greninja-battle-bond（別種族・手動 ja）**が正しい表示名で存在。
4. `tauros-paldea-*-breed` 3 種が衝突せず区別された ja を持つ（`MANUAL_NAME_OVERRIDE`）。
5. `pokeapi-names.yml` の PR body に id / en / ja / decision / distinct 根拠の表が出力される。
6. `pokemon-data-reviewer` のデータ妥当性レビューで重大な名前不整合が無い。

## 検証手順

1. ローカルで `pnpm fetch:ja-names` → `pnpm sync:ja-names` を回し、上記代表 form の ja/en を確認
   （`ウォッシュロトム` / `イダイトウ（メスのすがた）` / `ライチュウ（アローラのすがた）` /
   `コレクレー（はこフォルム）` / `ザシアン（けんのおう）` 等）。
2. `MANUAL_NAME_OVERRIDE` の 4 件（tauros×3 + greninja-battle-bond）が意図どおり上書きされることを確認。
3. 純装飾（vivillon / alcremie / minior 色）が **入っていない**ことを確認（distinct フィルタ / 除外パターン）。
4. `pnpm generate:data`（`no name entry` 無し・orphan 許容）→ `pnpm verify` 緑。
5. PR レビュー表を目視し、各 form の decision と根拠が妥当か点検（`pokemon-data-reviewer` へ委譲）。

## リスク・備考

- **distinct フィルタは type/stat 差が基準**。同ステータスの別種族（`greninja-battle-bond`）は `FORM_INCLUDE` で
  拾う。将来同型の例外が出たら case-by-case で追加（有界・差分運用）。
- **含有ルールの false-positive リスク**は本セッション全件チェックで 0（記述子が base 名を含む例は無かった）。
  データ由来の担保ゆえ、新規 form 追加時は PR レビュー表 + `pokemon-data-reviewer` で確認する。
- 名前投入 PR は distinct-forms 約87件の languages 追加（機械データ）。コード修正部（純関数 / fetch / workflow）は
  独立レビュー可能。データ妥当性は `pokemon-data-reviewer` に委ねる。
- 本 phase 完了で per-reg 本投入（Phase 5）が正しい form 名の上で回る前提が整う。
