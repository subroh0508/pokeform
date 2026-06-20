# Phase 6 — メガ可能種の `items` を対応メガストーンのみに型制約

## 目的 / スコープ

per-reg `m-*/index.ts` の **メガ進化可能種（`megaEvolvesTo` を持つ種）の `items`** を、現在の `"any"`（全持ち物
許可）から **対応メガストーンのタプル `[<stone id>...]`** へ変更する。これにより、個体型機構
（`ItemNotHeldBy<R,S,I>`）が**対応メガストーン以外の持ち物を tsc ブランドエラー**で弾く。メガ種は対応ストーン
**のみ**指定可能（ユーザ確定の legality モデル）。

- スコープ内:
  - `scripts/generate.ts` の **per-reg `species` emit**: `megaEvolvesTo` を持つ種の `items` を、対応メガストーンの
    id 配列（`readonly ItemId[]` リテラル）で emit する。**非メガ種は従来どおり**（`"any"` または reg 持ち物プール）。
  - メガストーン id の導出: `item-specs`（`megaStoneFor` / `megaSpecies` リンク）または `mega-specs` /
    `megaLinks` から、その種に対応するストーン群を決定論的に引く（charizard → `charizardite-x`/`-y` のように
    **複数ストーンはタプル全要素**）。
  - 型レイヤは既存資産を活用: `PerRegSpecies.items: "any" | readonly ItemId[]` と
    `ItemNotHeldBy` / `SpeciesEntryOf<R,S>["items"]` 機構（`src/types/individual.ts`）は**そのまま**。型定義の
    変更は最小（emit 値が `"any"`→タプルに変わるだけで既存ブランド機構が効く）。
  - テスト fixture / 既存個体での回帰確認（メガ種が対応ストーンを持てる / 他を持つとブランドエラー）。
- スコープ外: 生成物の配置（Phase 4）。レギュ名の languages 移動（Phase 5）。非メガ種の items legality 変更。
  メガ**形態**（`mega-specs` 側）の持ち物規則（plan 03 Phase 7 で整備済み）の再定義。

## 前提（依存）

- **Phase 4・5 完了**（生成物配置・名前 SoT が安定）。
- plan 03 Phase 7（per-reg 持ち物 legality・メガストーン↔種リンク）で `item-specs` の `megaStoneFor`/
  `megaSpecies` リンクが整備済み。ADR 0021/0024（per-reg・reg-aware 機構）。[[type-conventions]]。

## タスク

- [ ] `scripts/generate.ts` の per-reg species emit に「`megaEvolvesTo` 種は対応メガストーン id 配列を `items` に
      emit」を実装。メガストーン群は `item-specs`/`mega-specs` リンクから決定論導出。
- [ ] 複数ストーン種（例 charizard = X/Y）はタプル全要素を emit することを確認。
- [ ] 対応ストーンが引けないメガ種が無いことを generate 側で検証（無ければ fail-fast）。
- [ ] テスト fixture / 個体で回帰確認（メガ種 × 対応ストーン OK / メガ種 × 他持ち物 → ブランドエラー）。
- [ ] `pnpm generate:data` → `pnpm verify` 緑。

## この Phase で育てるハーネス（rule・skill）

- [[type-conventions]] / [[data-pipeline]] の「per-reg メガ種 items = 対応ストーンのみ」legality 記述追従。
- 新規 rule/skill は作らない（既存 reg-aware 機構の emit 値変更）。

## 受け入れ基準

- `m-*/index.ts` のメガ可能種（`megaEvolvesTo` 持ち）の `items` が対応メガストーンのタプル（例
  `charizard.items: ["charizardite-x", "charizardite-y"]`）になり、非メガ種は従来どおり。
- **個体型機構の回帰**: メガ種に対応メガストーンを持たせた個体 YAML は `check:individual` / `typecheck` が通り、
  対応ストーン以外（例 `life-orb`）を持たせると tsc が `ItemNotHeldBy<R,S,I>` ブランドエラーを出す（1 ケース確認）。
- `pnpm generate:data` が決定論的に出力（再実行で `git diff --quiet`）。
- `pnpm verify`（型 / カバレッジ100% / Biome / `check:yaml-style`）が緑。

## 検証手順

1. `pnpm generate:data` 後、`m-*/index.ts` で `megaEvolvesTo` を持つ種の `items` が対応ストーンタプルになることを確認。
2. メガ種（例 charizard）に `charizardite-x` を持たせた個体で `pnpm typecheck` 緑。`life-orb` に変えると
   `ItemNotHeldBy` ブランドエラー → 元へ戻す。
3. 非メガ種の items が従来どおり（`"any"` / reg プール）で、持ち物検証が回帰していないこと。
4. `pnpm verify` 緑。

## リスク・備考

- **メガストーン↔種リンクの欠落で fail-fast**。対応ストーンが `item-specs`/`mega-specs` から引けないメガ種が
  あると items が空タプルになり「どの持ち物も不可」の不正状態になる。generate 側で「メガ種は必ず 1 つ以上の
  対応ストーンを持つ」を検証し、欠落は ENOENT 相当で落とす。
- charizard / mewtwo 等 **複数メガ（X/Y）** を持つ種はタプル複数要素。リンク導出が複数ストーンを取りこぼさない
  ことを確認する。
- 本変更は **legality モデルの確定**（メガ種は対応ストーンのみ・ユーザ確定）。「メガ種も通常持ち物を持てる」
  解釈は採らない。`PerRegSpecies.items` 型と `ItemNotHeldBy` 機構は既存のまま流用するため型定義の破壊的変更は無い。
