# Phase 2 — items スクレイパー + fetch-serebii キャッシュ

## 目的 / スコープ

解禁持ち物ページ（`items.shtml`）の決定論パースを追加し、取得を `data/raw/serebii/` への**キャッシュ層**に
分離する。Phase 1 の種族パーサと合わせ、層1 の取得・パースを完成させる。

- スコープ内:
  - `scripts/fetch-serebii.ts`: 種族 / items ページを fetch（latin-1 デコード・礼儀 sleep・既存キャッシュ skip）して
    `data/raw/serebii/<slug>.html` / `data/raw/serebii/items.html` に保存。`fetch-pokeapi.ts` と同じ vendor 思想。
  - `src/codegen/serebii/parse.ts` に `parseItemsPage`（Hold Items / Berries / Mega Stones の 3 セクション →
    item slug + category + megaStone 先）を追加。`a[href^="/itemdex/<slug>.shtml"]` から正確な slug を取得。
  - `scripts/scrape-serebii.ts items`（items.html → 中間 JSON + 自己検証）。
  - `.gitignore` に `data/raw/serebii/` 追加（PokeAPI raw と同様キャッシュ・gitignore）。
- スコープ外: catalog 書き込み（Phase 3）・SubAgent / Workflow（Phase 4-5）。

## 前提（依存）

- **Phase 1 完了**（パーサ純関数・schema・normalize・scrape-serebii の species サブコマンド）。
- 確定済み rule: [[data-pipeline]]（raw キャッシュ = gitignore・vendor 方式）/ [[testing]]。

## タスク

- [ ] `scripts/fetch-serebii.ts`: 種族ページ / items ページを fetch → latin-1 デコード → `data/raw/serebii/` へ保存。
      既存キャッシュは skip（決定論・オフライン再生）。リクエスト間 sleep（Serebii への礼儀・`fetch-pokeapi.ts` 準拠）。
- [ ] `parse.ts` に `parseItemsPage` を追加（Hold/Berries/Mega Stones セクション区切り・item slug は href 由来・
      Mega Stone はメガ先 base 種族へのリンクから引く）。`normalize.ts` に item slug 正規化を追加（`choicescarf` →
      `choice-scarf` 等・未知 slug ガード）。
- [ ] `scripts/scrape-serebii.ts items`: items.html → 中間 JSON（全 item slug + category）+ 自己検証 exit code。
- [ ] `scrape-serebii.ts species <slug>` を、`fetch-serebii.ts` のキャッシュを読む形に整理（取得とパースの分離）。
- [ ] fixture（`__fixtures__/serebii-items.html` 切片）+ test で items パース/正規化を網羅（カバレッジ100%）。
- [ ] `.gitignore` に `data/raw/serebii/` 追加。`package.json` に `fetch:serebii` script 追加。

## この Phase で育てるハーネス（rule・skill）

- なし（実装が中心）。`data-pipeline.md` の取得元表更新は Phase 3 でまとめて行う。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。items パースが fixture テストで完全網羅。
- `node scripts/fetch-serebii.ts items` で `data/raw/serebii/items.html` がキャッシュされ、再実行で skip される。
- `node scripts/scrape-serebii.ts items` が全 item slug + category の中間 JSON を出力し exit 0。

## 検証手順

1. `node scripts/fetch-serebii.ts items` → キャッシュ生成 → 再実行で skip を確認。
2. `node scripts/scrape-serebii.ts items` の中間 JSON を実ページ（人手確認）と突き合わせ、件数・category・
   Mega Stone のメガ先を確認。
3. item slug 正規化（`choicescarf`→`choice-scarf` 等）と未知 slug ガードを確認。
4. `pnpm verify` 緑を確認。

## リスク・備考

- **item slug 差異**: Serebii item slug（圧縮形）と catalog/PokeAPI slug（kebab-case）のずれは機械で完全自動化
  できず、静的マップ + 例外で対処。保守コストが残る（Phase 5 の自己修復対象でもある）。
- キャッシュ層を分離することで、Phase 4-5 の SubAgent fan-out が冪等キャッシュを再利用でき、取得失敗時の
  再試行が安価になる。
