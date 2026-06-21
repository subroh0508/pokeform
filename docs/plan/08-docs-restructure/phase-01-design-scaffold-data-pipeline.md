# Phase 1 — docs/design/ 骨組み + README + data-pipeline.md

## 目的 / スコープ

`docs/design/` を新設し、**README（全体像 index）** と **data-pipeline.md（データ取得・管理の俯瞰）** を **TypeScript コードなし**で執筆する。現 `architecture.md` の Context / 設計方針 / データ生成パイプライン節から「図と設計意図」だけを抽出し、具体（型・YAML キー・コマンドフラグ）は落とす。

スコープ外: type-validation.md / individuals-and-parties.md（Phase 2）・inbound 参照張り替え・旧 architecture.md 撤去（Phase 3）。この Phase では旧 architecture.md を**残したまま** design を新設する（参照確定は Phase 3）。

## 前提（依存）

- Phase 0（配置 ADR）確定。design に「何を書く / 書かない」の責務境界が ADR に定まっていること。

## タスク

- [ ] `docs/design/README.md` を執筆: 目的・スコープ / 設計方針 5 点の意図 / 全体データフロー図（mermaid・ノードは "specs"/"languages"/"per-reg" 等の陳腐化しにくい抽象語）/ 3 本へのナビ / 主要トレードオフ / 参考ソース / `roadmap` との一行棲み分け。
- [ ] `docs/design/data-pipeline.md` を執筆: 情報源 3 系統（Serebii / 補助 / PokeAPI）の関係、skill 著述 ↔ 機械転記の 2 辺、specs / languages / per-reg が「何の SoT か」、generate の決定論性、データの流れ（mermaid）。
- [ ] 各ファイル末尾に **「実装 SoT ポインタ」節**を必須化（`[[data-pipeline]]` rule + `scripts/` + `src/` パスへ誘導）。
- [ ] 各ファイル冒頭に **front matter**（`last_modified`: ISO8601 / `adr`: 関連 ADR 配列）を付与する（Phase 0 ADR で確定した規約）。
- [ ] **TypeScript の具体コード・YAML キー網羅・転記コードを書かない**（→ [[data-pipeline]] rule + `scripts/`）。

## この Phase で育てるハーネス（rule・skill）

- なし（新規 doc の執筆。rule / skill は変更しない）。ただし design ↔ rule の参照方向（design → rule の一方向）を確立する。

## 受け入れ基準

1. `docs/design/README.md` と `docs/design/data-pipeline.md` が存在し、**TS コード（型シグネチャ・interface・Dex・関数定義）を含まない**（`grep -nE 'interface |: [A-Z][a-zA-Z]+Dex|export const' docs/design/` がデータフロー以外で空）。
2. 各ファイルが front matter（`last_modified` + `adr`）を持ち、末尾に「実装 SoT ポインタ」節があり、`[[...]]` / 相対リンク / `src` パスがすべて実在へ解決。
3. mermaid のノードラベルが具体ファイル名・キーを埋め込まず抽象語に留まる。
4. `pnpm verify` 緑。

## 検証手順

1. `git grep -nE 'interface |Dex =|function ' docs/design/data-pipeline.md docs/design/README.md` でコード混入ゼロを確認。
2. `harness-review` でセルフレビュー（design = 俯瞰のみ・決定根拠は ADR 索引・参照実在）。
3. 末尾「実装 SoT ポインタ」のリンク実在を `git grep` / `ls` で確認。

## リスク・備考

- 旧 architecture.md がまだ残るため、内容の二重化が一時的に生じる。これは Phase 3 で旧 architecture.md 撤去 + 参照張り替えにより解消する（順序依存）。
- 「コードを書かない」を破ると乖離債務が再発する。設計意図の自然言語化に徹し、具体は rule / src へ委譲する。
