# Phase 0 — 足場 + 実数値計算（calc-stats）

## 目的 / スコープ

ライブラリの**型の土台**と**実数値計算（純関数）**を用意する。MVP コア（Phase 1）が依存する `StatKey`/相性型/計算ロジックを先に固める。アーキ詳細は [`architecture.md`](./architecture.md)。

## 前提（依存）

- ハーネス整備（`docs/plan/00-harness-setup/`）完了＝ `pnpm verify`（型 / Vitest カバレッジ100% / Biome）が実在。
- 規約 `testing.md`（カバレッジ100%・境界重点・テストはコロケーション `<name>.test.ts`・fixture は近傍 `__fixtures__/`）。

## タスク

- [ ] `src/types/stats.ts`: `StatKey`（hp/attack/defense/spAttack/spDefense/speed）、`BaseStats`、`RealStats`、`PointAllocation`、`PointValue = 0|1|…|32`（生成 or 定義）。
- [ ] `src/types/nature.ts`: `NatureSpec`（up: StatKey / down: Exclude<StatKey, up>、同一不可）。
- [ ] `src/types/type-chart.ts`: `PokemonType`（18 union）、`TypeBase`/相性表型の骨格（実データ生成は Phase 1）。
- [ ] `src/domain/calc-stats.ts`（純関数・I/O 非依存）:
  - `calcHp(base, point) = floor((base*2 + 31 + point*2) * 50/100 + 60)`
  - `calcStat(base, point, natureMod: 0.9|1.0|1.1) = floor(floor((base*2 + 31 + point*2) * 50/100 + 5) * natureMod)`（**二重 floor** に注意）
  - `calcRealStats(entry, spec)`: 6 能力を一括算出。
- [ ] `src/domain/calc-stats.test.ts`（コロケーション）: 既知個体（攻撃31振り等）の実数値を fixture 照合。**二重 floor の端数境界**・ポイント 0/32 境界を重点。fixture は `src/domain/__fixtures__/`。
- [ ] ポイント合計 66 / 各 ≤32 の検証ヘルパ（実行時 or 型）も calc 層に用意。

## この Phase で育てるハーネス

- rule: `testing.md` を確定（境界テスト方針・fixture 規約）。
- skill: `new-domain-fn`（TDD: 失敗テスト→実装→100% カバレッジ）を canonical + symlink で作成。

## 受け入れ基準

- `pnpm verify` 緑（`calc-stats` テスト緑・カバレッジ100%・Biome OK）。
- HP/非 HP 計算が既知個体で一致（二重 floor 含む）。

## 検証手順

1. `pnpm test:cov` で `calc-stats` が 100% カバレッジ。
2. 端数が出る種族値×ポイント×性格補正の組合せで二重 floor の期待値一致を確認。

## リスク・備考

- 計算式は架構の確定値（Lv50/IV31 固定）を展開済み。式の floor 位置を誤ると全実数値がズレるため、テストを最優先で固める。
