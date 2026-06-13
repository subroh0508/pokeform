# Phase 1 — 決定論パーサ純関数 + fixture テスト

## 目的 / スコープ

Serebii Champions 種族ページの HTML を、LLM 目視ではなく **決定論パーサ（cheerio）**で抽出する層1 の中核を作る。
パース・検証・正規化のロジックを `src/codegen/serebii/*.ts` の**純関数**に切り出し、fixture ベースのテストで
カバレッジ100%を満たす。`scripts/scrape-serebii.ts species <slug>` で取得→パース→自己検証 exit code までを通す。

- スコープ内:
  - `src/codegen/serebii/parse.ts`（純関数: 種族ページ HTML → 中間表現）。cheerio 導入（devDependencies）。
  - `src/codegen/serebii/schema.ts`（純関数: 必須欄/件数検証 → stage 判定 = exit code 源）。
  - `src/codegen/serebii/normalize.ts`（純関数: Serebii slug/英名 → catalog id 正規化 + 未知 slug ガード）。
  - 各 `*.test.ts` + `__fixtures__/`（実 HTML の最小切片・**単純種 / 複数フォルム種 / メガ種**を含む）。
  - `scripts/scrape-serebii.ts species <slug>`（取得→parse→自己検証→中間 JSON を stdout・exit code）。
- スコープ外: items ページ（Phase 2）・catalog 書き込み（Phase 3）・SubAgent / Workflow（Phase 4-5）。

## 前提（依存）

- 02-data-model-redesign 完了（catalog スキーマ・per-regulation YAML・技メタ catalog SoT が確定済み）。
- 確定済み rule: [[data-pipeline]] / [[type-conventions]] / [[testing]]。
- 実ページ確認で判明した罠（OVERVIEW「実装指針」）: latin-1 デコード・slug 正規化・accuracy `101`/`--`。

## タスク

- [ ] cheerio を devDependencies に追加（`pnpm add -D cheerio`・lockfile 更新）。
- [ ] `src/codegen/serebii/parse.ts`: 種族ページ HTML → 中間表現（dex / en / types / abilities / stats(H/A/B/C/D/S) /
      moves[]（name slug・type・damageClass・power・accuracy・pp）/ mega セクション）。`<a name="attacks">` 直後の
      `table.dextable` を全行抽出（"Standard Moves" 1 表 = 使用可能技 全件）。
- [ ] latin-1 デコード + HTML エンティティ展開を実装（UTF-8 前提だと壊れる）。
- [ ] `src/codegen/serebii/normalize.ts`: Serebii 圧縮 slug / 英名 → catalog id（kebab-case）正規化。
      `^[a-z0-9]+(-[a-z0-9]+)*$` 適合を保証し、**未知 slug を新規 catalog id として作らないガード**。
- [ ] `src/codegen/serebii/schema.ts`: 必須欄/件数検証で stage（exit 3 = schema 欠落 / exit 4 = 件数・健全性）を判定。
      accuracy `101`（必中）/ `--`（変化技）を `null`/特別扱いで決定論判定。
- [ ] `scripts/scrape-serebii.ts species <slug>`: fetch → parse → schema 検証 → 中間 JSON を stdout、
      stderr に `{slug, stage, missingFields, rawHtmlPath}` を JSON 出力、exit code（2/3/4/0）で表現。
- [ ] fixture（`__fixtures__/serebii-*.html`）と `*.test.ts` でパーサ/検証/正規化を網羅（カバレッジ100%）。
- [ ] `package.json` に `scrape:serebii` script 追加。

## この Phase で育てるハーネス（rule・skill）

- なし（実装が中心）。SKILL.md 改訂は Phase 3（最小）/ Phase 6（全面）で行う。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。`src/codegen/serebii/*` が fixture テストで完全網羅。
- 代表種（garchomp 等）で `node scripts/scrape-serebii.ts species garchomp` が中間 JSON を出力し exit 0。
- 意図的に壊した fixture で exit 3/4 と stderr JSON が出る。
- 複数フォルム種・メガ種の fixture でも種族値・タイプ・特性・技が正しく抽出される。

## 検証手順

1. `node scripts/scrape-serebii.ts species garchomp` の中間 JSON を実ページ（人手確認）と突き合わせ、
   技数・種族値・タイプ・特性が一致することをスポット確認。
2. accuracy `101`/`--` を含む技で null/特別扱いが効くことを確認。
3. 壊した fixture で exit 3/4・stderr JSON を確認。
4. `pnpm verify` 緑を確認。

## リスク・備考

- **Serebii DOM 揺れ**: garchomp は単一技セクションだが全種が同型とは限らない。fixture を複数種族型で固定し、
  自己修復ループ（Phase 5）で吸収する。本 phase では fixture に無い構造は Phase 5 の対象。
- **slug 正規化の網羅性**: 英名→catalog id 変換 + 例外テーブル。未知 slug ガードで誤 id 混入を防ぐ。
- パーサは純関数に隔離し `scripts/scrape-serebii.ts` は薄い配線に保つ（テスト容易性・修正 SubAgent の作業対象を
  純関数に限定するため）。
