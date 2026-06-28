# Phase 19 — 情報源の役割・関係性の SoT 整理 + フロー図の Mermaid 化・改訂

## 目的 / スコープ

チャンピオンズの解禁データは複数の情報源から集めて突き合わせるが、各情報源の**役割と関係性**
（第一優先 / 補助 / 構造データ取得元）が `serebii-sourcing.md`・`SKILL.md`・`data-pipeline.md`・memory・
[ADR 0026] に**散在**している。またデータ取得フロー図（`architecture.md` の Mermaid / `data/README.md` の
ASCII）は **PokeAPI の機械パイプラインしか描いておらず**、Serebii からの skill 著述の流入も補助ソースの
裏取りも図に出てこない。「データがどこから来て・誰が著述するか」が図から読めない。

本 Phase は (1) **情報源の役割・関係性を 1 か所に集約して SoT 化**し、(2) **両フロー図を Mermaid で描き直して
情報源を明記**する（図は Mermaid 優先・ASCII は確固たる理由がある場合のみ）。

情報源の 3 系統:
- **① Serebii（第一優先 = 正）**: 解禁種族 / 各種族の全 learnable 技 / 技メタ / 解禁持ち物の正。
- **② Game8 / Victory Road / Bulbapedia 等（補助 = 件数裏取り）**: Serebii の総数・帰属を 2 ソース以上で
  突き合わせ、矛盾は出典 doc に記録。
- **③ PokeAPI（構造データ取得元）**: 種族値 / タイプ / 特性 / dex / category の取得元。Champions legality・
  技メタの信頼源にはしない（[ADR 0026]）。

フロー図は **skill 著述の辺（① + ② → `survey-regulation` → catalog / regulations）と機械転記の辺
（③ → `fetch` → raw → `materialize` → catalog）の 2 系統が catalog に合流**する形へ描き直す。

- スコープ内:
  - **情報源 SoT の集約**: `.claude/skills/survey-regulation/references/serebii-sourcing.md` に 3 系統の役割・
    関係性（第一優先 / 補助裏取り / 構造データ取得元・突き合わせ原則）を集約・SoT 化。`SKILL.md` /
    `data-pipeline.md` / `data/README.md` の該当記述は**ポインタ化**して二重管理を解消（memory
    `serebii-first-priority-champions-data` との役割分担も整理）。
  - **`architecture.md` の Mermaid フロー図改訂**: 既存の PokeAPI 一本道図を、3 流入（① / ② / ③）が 2 系統
    （skill 著述 / 機械転記）で catalog へ合流する図へ描き直す。
  - **`data/README.md` の ASCII フロー図を Mermaid 化**し、同様に情報源を明記（Mermaid 優先方針）。
- スコープ外:
  - 用語・方針・人間直編集文言（**phase-17 / phase-18** で確定・展開済み）。本 Phase は情報源と図に集中。
  - 情報源の運用手順そのものの変更（取得順序 `fetch:data → materialize` 等は不変・[ADR 0027]）。図と SoT の
    整理であって手順の再設計ではない。
  - 不変ログ（learnings / archive）の図・記述の書き換え。

## 前提（依存）

- **phase-17（運用方針 + 統一用語の確定）完了**。図中の「skill 著述」表現と統一用語が確定していること。
- **phase-18（用語 rename + 文言展開）完了が望ましい**（必須ではない）。用語が全資産で揃ってから図・SoT を
  整理すると churn が最小になる。
- 関連 ADR: [ADR 0026]（Serebii 第一優先・PokeAPI を legality / 技メタの信頼源にしない）/ [ADR 0027]
  （構造データ取得元 = PokeAPI・`materialize` 転記）/ [ADR 0012]（vendor 方式）。
- 確定済み rule: [[data-pipeline]] / [[cross-agent]] / [[skill-authoring]]。
- 参照 memory: `serebii-first-priority-champions-data`（情報源優先方針）。

[ADR 0012]: ../../adr/archive/0012-vendor-pokeapi-data.md
[ADR 0026]: ../../adr/archive/0026-pokeapi-not-champions-legality-source.md
[ADR 0027]: ../../adr/archive/0027-structural-data-catalog-sot.md

## タスク

- [ ] `serebii-sourcing.md` に 3 系統（① 第一優先 / ② 補助裏取り / ③ 構造データ取得元）の役割・関係性と
      突き合わせ原則を集約し、**情報源役割の SoT** として 1 か所に確定。
- [ ] `SKILL.md` / `data-pipeline.md` / `data/README.md` の情報源記述を `serebii-sourcing.md` への**ポインタ化**
      （二重管理解消）。memory との役割分担も明確化。
- [ ] `architecture.md` の Mermaid フロー図を **2 系統合流図**（skill 著述の辺 + 機械転記の辺）へ改訂し、
      ① / ② / ③ の流入を明記。
- [ ] `data/README.md` の **ASCII フロー図を Mermaid 化**し、同様に情報源を明記。
- [ ] 検証フェーズ実施（下記「検証手順」）。

## この Phase で育てるハーネス（rule・skill）

- **rule 追従**: [[data-pipeline]]（情報源記述をポインタ化）。
- **skill 追従**: `survey-regulation` の `references/serebii-sourcing.md`（情報源 SoT 集約）・`SKILL.md`
  （ポインタ化）を `skill-creator` で改修（canonical 編集 → symlink 反映）。
- 新規 ADR・新 skill は無し（整理 + 図改訂 Phase）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- 情報源の役割・関係性（第一優先 / 補助裏取り / 構造データ取得元・突き合わせ原則）が **1 か所
  （`serebii-sourcing.md`）に集約**され、他は重複記述でなくポインタになっている。
- `architecture.md` / `data/README.md` の両フロー図が **Mermaid** で、① Serebii（第一優先）/ ② 補助（裏取り）/
  ③ PokeAPI（構造データ）の **3 流入**と、skill 著述 / 機械転記の **2 系統合流**を明示している。
- ASCII 図は残らない（確固たる理由がある場合のみ ASCII を採用し、その理由を doc 化）。
- `harness-review` 観点（SoT 一貫性・クロスエージェント整合・dangling ゼロ）で blocking なし。

## 検証手順

1. `serebii-sourcing.md` に 3 系統の役割・関係性 + 突き合わせ原則が集約され、`SKILL.md` /
   `data-pipeline.md` / `data/README.md` が重複記述でなくポインタになっていることを確認。
2. `architecture.md` / `data/README.md` の図が Mermaid で、3 流入 + 2 系統合流を表現していることを目視確認。
3. `grep -n` で ASCII フロー図（` ``` ` 囲みの矢印テキスト等）が残っていないことを確認。
4. リンク・参照の dangling がゼロであることを確認（[[cross-agent]] / [[skill-authoring]]）。
5. `pnpm verify` 緑を確認。`harness-review` で点検。

## リスク・備考

- **図は Mermaid 優先**: GitHub は Mermaid を md 上でレンダリングするため、フロー図は Mermaid に統一する。
  ASCII を採る場合は「Mermaid で表現しづらい」等の確固たる理由を doc に残す（既定は Mermaid）。
- **SoT の一本化に注意**: 情報源の役割は `serebii-sourcing.md` に集約し、memory `serebii-first-priority-
  champions-data` は方針の要約ポインタに留める。両者が食い違わないよう役割分担を明記する。
- **手順は変えない**: 取得順序（`fetch:data → materialize`・[ADR 0027]）や Serebii 第一優先（[ADR 0026]）の
  決定は不変。本 Phase は「図と SoT の可視化・整理」であって運用の再設計ではない。
- ADR 本文は可変 plan ファイル（phase doc / phase 番号 / OVERVIEW リンク）を参照しない（[[adr]]）。
