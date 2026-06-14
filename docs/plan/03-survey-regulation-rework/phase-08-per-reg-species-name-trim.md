# Phase 8 — per-reg species から不要な種族名 ja/en を削除

> survey-regulation の動作確認で判明した冗長。生成 `data/generated/regulations/<id>/species.ts` の各種族 `name`
> （ja/en）は**どのコードからも読まれていない**（CLI/domain は全て `speciesBaseDex` を参照）。per-reg species から
> 削除して重複を解消する。

## 目的 / スコープ

per-reg species dex の各種族エントリから `name`（ja/en）を取り除く。種族名の SoT・実利用は reg 不変の
`speciesBaseDex`（`data/generated/species-base.ts`）に集約されており、per-reg 側は重複保持しているだけで
読み手がいない。

- スコープ内:
  - `scripts/generate.ts`: per-reg species エントリ生成から `name: info.name,` を削除。
  - per-reg satisfies 型を **name を持たない per-reg 専用型**へ変更（`SpeciesBase` は name 必須のため、削除すると
    satisfies が通らない。`Omit<SpeciesBase, "name">` または新設 `PerRegSpecies` 型）。
  - `src/types/individual.ts` の `SpeciesEntryOf` を name レスの per-reg 型へ寄せる（現状 abilities/items/moves
    しか参照しないので機能影響なし）。
  - 生成物 `data/generated/regulations/<id>/species.ts` 再生成（name 消滅）。
- スコープ外:
  - `SpeciesBase` / `SpeciesBaseInfo` 本体の `name` は**残す**（`speciesBaseDex` = CLI 表示・実数値計算が読む SoT）。
  - per-reg species が dex/types/baseStats も base と重複保持している点のさらなる dedup（base 参照へ寄せる）は将来。

## 前提（依存）

- **Phase 7 完了**推奨（生成物 `species.ts` の差分衝突を避けるため A → C の順）。独立だが順序固定で衝突回避。
- 確定済み: 種族名 SoT = `data/champions/catalog/species.yaml` → 生成 `speciesBaseDex` / `names.ts`
  （[[type-conventions]]・ADR 0032）。per-reg species の `name` を読むコードが無いことは調査済み。
- 確定済み rule: [[type-conventions]] / [[data-pipeline]] / [[testing]]。

## タスク

- [ ] `src/types/species.ts`（または regulation 型）: name を持たない per-reg 専用型（`PerRegSpecies` =
      `Omit<SpeciesBase, "name">` 等）を定義。
- [ ] `scripts/generate.ts`: per-reg species 生成から `name: info.name,` を削除し、`satisfies Record<string,
      SpeciesBase>` を `satisfies Record<string, PerRegSpecies>` へ変更。
- [ ] `src/types/individual.ts`: `SpeciesEntryOf` の `& SpeciesBase` を name レス型へ寄せる（abilities/items/moves
      のキー存在保証は維持）。
- [ ] `pnpm generate:data` 再生成（per-reg `species.ts` から name が消える）→ `pnpm verify` 緑。

## この Phase で育てるハーネス（rule・skill）

- なし（生成形の整理が中心）。種族名 SoT・base/per-reg の役割分担は既存 [[type-conventions]] のままで、
  per-reg は per-reg 可変フィールド（moves/abilities/items/mega）に集中するという原則を実体に寄せるのみ。

## 受け入れ基準

- 生成 `data/generated/regulations/<id>/species.ts` の各種族から `name` が消える。`speciesBaseDex` 側の name は維持。
- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。per-reg name を読むコードが無いので CLI/domain/型に影響なし。
- `stat` / `check:party` の種族名表示が `speciesBaseDex` 経由で従来通り。

## 検証手順

1. `pnpm generate:data` 後、`data/generated/regulations/champions-m-a/species.ts` の種族エントリに `name` が
   無いことを確認。`data/generated/species-base.ts` には `name` が残ることを確認。
2. `node src/cli/index.ts stat <個体>` / `check:party` で種族名表示が従来通り（`speciesBaseDex` 由来）。
3. `pnpm verify` 緑を確認。

## リスク・備考

- per-reg species の `name` を読むコードは調査で皆無（`src/cli/format.ts` の `speciesName` も `speciesBaseDex` を
  参照）。削除しても CLI/domain/型に支障なし。
- satisfies 型を name レスへ変えないと、name 削除で `satisfies Record<string, SpeciesBase>` が通らなくなる点に注意
  （型と生成形をセットで変更する）。
