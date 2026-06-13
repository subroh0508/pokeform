# Phase 3 — serebii-to-catalog 転記 + ja 補完 + パイプライン結合 + ADR

## 目的 / スコープ

層1 の中間 JSON を catalog / regulation YAML へ転記する `serebii-to-catalog.ts` を作り、既存パイプライン
（`materialize` → `generate:data`）と結合する。日本語名を PokeAPI names から補完する経路を追加し、刷新の核心
決定を ADR に残す。

- スコープ内:
  - `scripts/serebii-to-catalog.ts`: 中間 JSON → `catalog/{species,moves,items,abilities}.yaml` /
    `regulations/<id>.yaml` へ append/既存尊重・block 記法で著述。構造データ欄（dex/types/stats/category）は
    **空のまま残し**、既存 `materialize.ts`（PokeAPI raw → catalog）が埋める設計（無改造再利用・差異は conflict 提示）。
  - `scripts/fetch-pokeapi.ts` に **PokeAPI `names`（ja-Hrkt）取得を追加** → species/move/item/ability の ja 名を
    補完源にする。
  - ADR 起票（`adr-new`）: ①「Champions データ取得を決定論スクレイパー + ハイブリッド3層へ」、②「日本語名の
    取得元を PokeAPI names に定める」。
  - `data-pipeline.md`（取得元/SoT 表・ja 取得元更新）/ `serebii-sourcing.md`（DOM 構造・slug 正規化・latin-1・
    accuracy の SoT 追記）。**SKILL.md は層1 手順へ最小改訂**（全面改訂は Phase 6）。
- スコープ外: SubAgent / Workflow（Phase 4-5）・SKILL 全面改訂（Phase 6）・全186種投入（Phase 7）。

## 前提（依存）

- **Phase 1・2 完了**（パーサ純関数・fetch/scrape スクリプト・中間 JSON 契約）。
- 確定済み rule / ADR: [[data-pipeline]] / ADR 0026（Serebii 第一優先・PokeAPI を legality/技メタ源にしない）/
  ADR 0027（構造データ catalog SoT・materialize append/既存尊重）/ ADR 0030（skill-authored）。
- 参照実装: [`scripts/materialize.ts`](../../../scripts/materialize.ts)（append/既存尊重・`parseDocument` でコメント保持・
  conflict 提示）。

## タスク

- [ ] `scripts/serebii-to-catalog.ts`: 中間 JSON → catalog/regulation YAML 著述（append/既存尊重・block・
      既存 skill-authored 値を上書きしない・conflict 提示）。技メタ（type/power 等）は Serebii 由来を moves.yaml へ、
      per-species moves / 解禁 items を regulation YAML へ。構造データ欄は空で残す。
- [ ] `scripts/fetch-pokeapi.ts`: PokeAPI `names`（ja-Hrkt）取得を追加し、ja 名補完源にする。
- [ ] `materialize` 経路で ja 名を catalog へ転記できることを確認（既存 catalog の ja と突き合わせ・表記揺れ検証）。
- [ ] ADR 起票（`adr-new`）: ①刷新の決定（0026/0027 を supersede せず補完・cheerio 依存・層分離の原則・層2-3 は
      Workflow 実装）、②ja 取得元 = PokeAPI names（「日英名 = PokeAPI に無し」記述の整合取り直し）。
- [ ] `data-pipeline.md`（取得元/SoT 表・ja 取得元）/ `serebii-sourcing.md`（DOM 構造・slug・latin-1・accuracy）を更新。
- [ ] `SKILL.md` を層1 手順へ最小改訂（`fetch-serebii`→`scrape-serebii`→`serebii-to-catalog` の実行順）。
- [ ] `package.json` に `serebii:catalog` script 追加。

## この Phase で育てるハーネス（rule・skill）

- ADR 2 本（`adr-new` 採番）。`data-pipeline.md` / `serebii-sourcing.md` 更新。`SKILL.md` 最小改訂。
  ハーネス資産変更のため cross-agent パリティ（canonical + symlink）と機械ゲート非再実装を点検（[[cross-agent]]）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- **idempotent 検証**: 既存 M-A の数種を `serebii-to-catalog` → `materialize` → `check:regulation` →
  `generate:data` まで通し、`git diff` が最小（既存 skill-authored 値を上書きしない）。
- `fetch:data → materialize → check:regulation → generate:data → verify` が緑。
- ADR が採番され、`data-pipeline.md` の ja 取得元記述が PokeAPI names と整合。harness-review 通過。

## 検証手順

1. 既存 catalog にある数種を中間 JSON 化 → `serebii-to-catalog` → `materialize` → `generate:data`、`git diff` が
   最小であることを確認（既存値非上書き・conflict 提示の挙動確認）。
2. PokeAPI names 由来の ja が既存 catalog の ja と一致するか（move/item/berry の表記揺れ）をスポット確認。
3. `check:regulation` 0 終了を確認。
4. ADR の参照（rule / 既存 ADR）が実在することを確認。`pnpm verify` 緑。

## リスク・備考

- **ja 名の表記揺れ**: PokeAPI ja-Hrkt が move/item/berry で揺れうる。既存 catalog の ja と突き合わせて検証し、
  揺れは catalog SoT 側で吸収（PokeAPI names は初期値・catalog で上書き可能）。
- **conflict が Serebii vs PokeAPI クロスチェックになる**: materialize の append/既存尊重により、Serebii 著述値と
  PokeAPI 構造データの差異が conflict 提示される（ADR 0027 の設計がそのまま効く・新規 ADR 不要）。
- 技メタを Serebii から入れる場合、既存 hand-authored 値との conflict 提示を確認する。
