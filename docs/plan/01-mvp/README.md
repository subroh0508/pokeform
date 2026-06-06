# 01-mvp — pokeform 本体 実装計画（インデックス）

ポケモンチャンピオンズ向け "Pokemon as Code" ライブラリ本体の実装計画。アーキ正本は [`architecture.md`](./architecture.md)（旧 `plan.md`）。**ハーネス（`docs/plan/00-harness-setup/`）整備済みを前提**に、その緑のゲート（型 OK / カバレッジ100% / Biome）の上で実装する。

## MVP の範囲とゴール

- **MVP コア** = パーティ構築の**一貫性チェック**（防御弱点の集中検出）と**技範囲チェック**（Phase 1）。
- MVP 完了で「個体・パーティの検証 + 一貫性/技範囲チェック + ステータス調整の壁打ち」が揃う（Phase 0〜3 すべて）。

## 確定アーキ（詳細は architecture.md）

- **Champions 仕様**: Lv50・個体値31 固定、能力ポイント 66/32、HP/非HP の二重 floor 計算式、性格 ±10%、メガ可・テラス/ダイマ不可。
- **tsc のみ検証**: YAML/MD → codegen `.generated.ts` → `tsc --noEmit` で不正個体/パーティを弾く。
- **型表現**: `XxxBase` + `XxxDex` + `XxxId = keyof XxxDex` を種族/タイプ/技/特性/持ち物で統一。種族値が一意に定まる粒度＝1 種族。日英 `name` 両対応。
- **データ**: PokeAPI を vendor（`data/generated/` コミット）。Champions 固有（能力ポイント・解禁）は `data/champions/` 手動。
- **入力**: 個体 YAML（`lang: ja|en` ファイル単位宣言）/ パーティ frontmatter 付き Markdown。

## フェーズ一覧（この順で実施）

- [ ] [Phase 0 — 足場 + 実数値計算（calc-stats）](./phase-0-scaffold.md)
- [ ] [Phase 1 — データ生成 + 一貫性/技範囲チェック（MVP コア）](./phase-1-data-and-coverage.md)
- [ ] [Phase 2 — 個体 tsc 検証層](./phase-2-individual-typecheck.md)
- [ ] [Phase 3 — ステータス調整の壁打ち](./phase-3-stat-tuning.md)

## 全体の受け入れ基準

1. 各フェーズ末で `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
2. `pnpm pokeform analyze:coverage` / `check:party` がサンプル `team/` で動作し、脆弱構築を非0終了で検出（MVP コア）。
3. 不正個体（覚えない技等）が `check:individual` の tsc で弾かれる（Phase 2）。
4. 計算式・相性・カバレッジ分析の各純関数が 100% カバレッジでテストされる。

## クロスエージェント / ハーネス連携

- 本計画で追加する利用者向けスキル（`review-party` / `author-individual` / `stat`）は、ハーネスの共有方針に従い **canonical `.claude/skills/<name>/` + `.agents/skills/<name>` symlink** で、**`skill-creator` skill を使って作成**（`skill-authoring.md`）。
- 各フェーズは対応する rule（`testing` / `data-pipeline` / `cli-and-io` / `type-conventions` / `tsc-verification` / `game-spec`）を確定させながら進める。
- 完了条件は共通して「`pnpm verify` 緑 + 該当 rule/skill の確定」。
