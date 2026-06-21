# 05-move-master-scraper-refactor — 技マスター専用取得 + スクレイパー役割分割 + survey-regulation オーケストレーター化 OVERVIEW

## ゴール

Champions の解禁データ取得パイプラインを、**情報種別ごとに役割分割**して保守性を上げる。具体的には:

1. **技そのものの情報（威力・命中・タイプ・分類・PP）を Serebii の技専用ページから独立スクレイピング取得する経路**
   を新設し、「ある種族が覚える技の名前一覧」取得と同様に「技マスター取得」を独立した役割にする。これにより技メタを
   **Champions 準拠の正しい値**へ揃える（現状は前作値の誤りが残る）。
2. **スクレイピングコードを役割ごとに分解**する（種族ベース / 覚える技の名前一覧 / メガ / 技マスター / 持ち物 / 転記先
   ごと）。1 関数が複数の責務・複数の出力ファイルを抱える現状の混在を解消する。
3. **`survey-regulation` skill をオーケストレーターに徹させる**。肥大した手順を情報種別ごとに分割し、本体は「どの取得を
   どの順で実行するか」の調整に専念する。

利用者から見た価値は、技そのもののデータが Champions 実態と一致し（威力・PP・タイプが正しい）、かつ新レギュ・新データ
種別の追加時に変更範囲が局所化されて取得パイプラインが壊れにくくなること。

## 背景 / 動機

現状の技メタ（`type` / `damageClass` / `power` / `accuracy` / `pp` / `priority`）は、各種族の Serebii 種族ページ
「Standard Moves」表から**副産物として**抽出され、per-game `move-specs.yaml`（ADR 0035・技メタ SoT の所在）へ転記されて
いる（PokeAPI 由来ではない・ADR 0026 の核を継承する ADR 0035）。この方式には2つの問題がある:

- **技マスター取得が独立した役割になっていない**。「種族が覚える技を見たついで」に技メタが入るため、技そのものの値を
  Champions 準拠で正す入口（専用取得経路）が無く、前作値（PP 5/10/15/25/30/40 等）の誤りが残りやすい。
- **スクレイピングコードに役割混在がある**（調査で3箇所確認）:
  - `scripts/serebii-to-catalog.ts::transcribeSpecies()` が**1 関数で5ファイル**を書く（catalog species/moves/abilities
    + per-game 技メタ + per-reg 解禁）。
  - `src/codegen/serebii/parse.ts::parseSpeciesPage()` が**1 関数で3データ種別**を抽出（種族ベース / 技 / メガ）。
  - `src/codegen/serebii/to-catalog.ts` が catalog 用 / per-game 用 / per-reg 用の field 関数を混在。

さらに `survey-regulation` SKILL.md は roster / 種族の全技 / 持ち物 / メガ / 技メタの手順を1スキルに統合して肥大して
いる（層1-3 の分離・`update-catalog` との責務分離は適正だが、SKILL.md レベルで複数データ種別が混在）。

データ種別が増えた今、**取得経路・抽出コード・skill の3層すべてで役割を分解**するのが本計画群の動機。先行する
[`04-generated-layout-redesign`](../04-generated-layout-redesign/README.md)（generated/YAML レイアウト再編）で
`move-specs` が独立エンティティ化された**安定ツリーの上で**役割分割を行うことで、`04` のコア改修との二度手間・衝突を
避ける。全種族投入（[`06-ma-full-data`](../06-ma-full-data/README.md)）は本計画群で整えた取得パイプライン + 正しい
技マスター値の上で行う。

## 設計方針

採用方針は、03-survey-regulation-rework で確立した **3 層ハイブリッド**（決定論スクレイパー層1 + Workflow 自己修復
層2-3）を**新しい技マスター取得経路にも適用**しつつ、抽出・転記コードと skill を役割分割すること。

- **技マスター専用取得経路は決定論スクレイパー（層1）として実装**。Serebii の技専用ページ（`attackdex-champions/<move>.shtml`）から
  威力・タイプ・PP・**優先度**等を抽出する純関数を `src/codegen/serebii/*` に置き、`*.test.ts` で fixture 網羅（カバレッジ100%）。
  exit code 自己検証（0/2/3/4 の契約）・stderr 構造化診断・冪等キャッシュ・回帰 fixture の枠組みを再利用する。
  この取得経路の追加・DOM 契約・exit code 契約・役割分割境界・skill 粒度は Phase 1 で
  [ADR 0037](../../adr/0037-serebii-move-master-dedicated-path.md) として確定した（取得方式を副産物抽出 → 専用取得へ・
  SoT / 出自は ADR 0035 のまま不変の補完）。
- **技の出自は Serebii 第一優先・PokeAPI を Champions の技メタ信頼源にしない**（ADR 0026 の核を継承する ADR 0035・不変）。技マスターも
  Serebii から取り、補助ソースで件数 / 値を裏取りする（[`serebii-sourcing.md`](../../../.claude/skills/survey-regulation/references/serebii-sourcing.md) の情報源方針）。
- **役割分割は意味保存のリファクタ**。`generate:data` の出力が変化しない（決定論・差分ゼロ）ことを保ちながら、
  `parse.ts` / `to-catalog.ts` / `serebii-to-catalog.ts` を責務別の関数・ファイルへ分解する。
- **skill 再編は過分割を避ける**。メガは決定論自動著述（ADR 0033）・技メタは per-game 移設（ADR 0035・旧 ADR 0034）で既に機械化
  済みのため分割効果が限定的。roster / 覚える技の一覧 / 技マスター（新）/ 持ち物 を独立単位にし、SKILL.md の
  references 分離 + サブスキル / Workflow 呼び分けでオーケストレーター化する。
- **cross-agent パリティを守る**（[[cross-agent]]）。Workflow は Claude 固有のため、Codex / 素の CLI では層1
  （テスト済み純関数 + npm script）の逐次実行へ縮退して同一成果を出す。

守る制約（既存 rule / ADR の本質は不変）:
- 検証は **tsc のみ**（ADR 0010）・カバレッジ100%（[[testing]]）・Linter = Biome。
- ソースは **skill-authored・catalog/raw 非依存の generate**（ADR 0027 / 0030・[[data-pipeline]]）。append/既存尊重も不変。
- **per-reg 種族 dex による reg-aware 型機構**（ADR 0021/0024）を壊さない。

## 実装指針

実行順序（既存パイプライン踏襲・技マスター取得を独立ステップとして挿入）:
`fetch-serebii`（種族 + 技専用ページ）→ `scrape-serebii`（種族 / 技マスター）→（自己修復ループ）→
`serebii-to-catalog`（責務別転記 + 技マスター転記）→ `fetch:data` → `materialize` → `check:regulation` →
`generate:data` → `verify`。

### 役割分割の境界（調査結論を踏襲）

- `src/codegen/serebii/parse.ts`: `parseSpeciesBase`（種族値・タイプ・特性）/ `parseMoves`（**その種族が覚える技の
  名前一覧のみ**）/ `parseMegas`（メガ形態）+ 新 `parseMoveMaster`（技専用ページから技そのものの威力・タイプ・PP 等）。
- `src/codegen/serebii/to-catalog.ts`: `catalog-fields` / `per-game-fields`（技メタ）/ `regulation-fields` へファイル分離。
- `scripts/serebii-to-catalog.ts`: `transcribeSpecies` を catalog / per-reg 書き込みへ分解 + 新 `transcribe-move-master`。
- 種族ページからの技メタ副産物抽出を除去し、種族ページは「覚える技の名前一覧」だけを抜く。技そのものの値は技マスター
  専用取得経路に一本化する。

### skill オーケストレーター化の粒度

roster 確定 / 種族が覚える技の一覧 / **技マスター（新）** / 持ち物 を独立単位に。`survey-regulation` 本体は実行調整に
専念し、各取得を `update-catalog` と同様にサブスキル / Workflow 呼び分けで駆動する。

## スコープ外

- **generated/YAML レイアウト再編そのもの**（[`04-generated-layout-redesign`](../04-generated-layout-redesign/README.md) で
  完了済み）。`05` は再編後の新ツリー（`move-specs` 独立）の上で動く。
- **M-A 全186種の全量投入**（[`06-ma-full-data`](../06-ma-full-data/README.md) で実施）。`05` で整えた取得パイプライン +
  正しい技マスター値の上で投入する。
- 技の効果テキスト（effect %）の catalog スキーマ化（将来計画・raw に残すのみ）。
- 新機能・01-mvp の機能拡張。M-B 以降の正確データ（未公開）。

## 受け入れ基準

1. 各フェーズ末で `pnpm verify`（型 / カバレッジ100% / Biome / `check:yaml-style`）が緑。
2. 技マスター専用取得経路が決定論スクレイパー（層1）として完成し、Serebii 技専用ページから威力・タイプ・PP 等を抽出
   して `move-specs`（新ツリー）へ転記する。新パーサは fixture テストでカバレッジ100%・exit code で自己検証する。
3. `move-specs` の**全技の PP が 8/12/16/20 のいずれか**（前作 PP の残存ゼロ）で、power/type が Serebii Champions 図鑑と
   整合する（`pokemon-data-reviewer` レビューで重大な技メタ誤りが無い）。
4. スクレイパー役割分割後も `generate:data` の出力が**決定論的に変化しない**（差分ゼロ）。種族ページ抽出が「覚える技の
   名前一覧」のみになり技メタ副産物が除去されても `move-specs` が維持される。
5. `survey-regulation` skill がオーケストレーターへ再編され、情報種別ごとのサブスキル / Workflow 呼び分けが機能し、
   cross-agent パリティ（canonical + symlink 一致・層1 逐次でも同一成果）が保たれる。

## phase 分割（6 基準の評価サマリ）

承認済みプラン（`~/.claude/plans/survery-regulation-deep-patterson.md`）を、独立判断（ADR）・新取得経路の実装・既存
リファクタ・skill 再編の境界で **4 phase = 4 PR** に分割した。6 基準:

- **意思決定の数 / 不可逆性**: 技マスター取得の SoT 確定・新取得経路の DOM 契約・03 Phase 13（手動是正）廃止の判断は
  ADR 級の独立判断 → **Phase 1 で ADR 起票**（コードなし・設計確定）。
- **スコープの広さ**: Phase 2（新取得経路の追加）と Phase 3（既存コードの役割分割）は別概念で、「**新規追加 → 旧経路
  除去**」の順にすると各 PR が単独で verify 緑・レビュー可能。混ぜない。
- **技術的難易度**: 新パーサ（Serebii 技ページの DOM 解析・latin-1/CRLF・exit code 自己検証）が難所 → Phase 2 に隔離。
  リファクタはカバレッジ100%維持の意味保存分解 → Phase 3。skill 再編は cross-agent パリティが要点 → Phase 4。
- **想定 diff**: 各 phase ~300-500 行見込み。Phase 3 はテスト追従込み。
- **並行実装のしやすさ**: Phase 1 → 2 → 3 → 4 の直列（設計 → 新取得 → 旧除去 → skill 再編）。

| phase | 狙い | 主な diff |
|---|---|---|
| Phase 1 | ADR + 設計確定（技マスター専用取得の SoT・新取得経路の DOM 仕様・役割分割方針・skill 再編方針・03 Phase 13 廃止の記録） | `docs/adr/*`・rule 追補方針 |
| Phase 2 | 技マスター専用取得経路の実装（Serebii 技専用ページの新パーサ + fetch/scrape/transcribe + exit code 契約 + fixture + `move-specs` を Champions 準拠値で populate・旧 03 Phase 13 を吸収） | `src/codegen/serebii/*`・`scripts/*`・`data/champions/move-specs.yaml` |
| Phase 3 | スクレイパー役割分割リファクタ（`parse.ts` / `to-catalog.ts` / `serebii-to-catalog.ts` を責務別に分解・種族ページからの技メタ副産物抽出を除去） | `src/codegen/serebii/*`・`scripts/serebii-to-catalog.ts`・テスト |
| Phase 4 | survey-regulation オーケストレーター化（roster / species-moves / move-master / items のサブスキル / Workflow 分割 + SKILL.md を骨子へ縮減・references 分離 + cross-agent パリティ） | `.claude/skills/*`・`.agents/skills/*`・`references/*` |

直列チェーン: Phase 1 → 2 → 3 → 4。先行する [`04-generated-layout-redesign`](../04-generated-layout-redesign/README.md)
（Phase 1-3 のレイアウト再編）を完了してから本計画群に入り、本計画群完了後に
[`06-ma-full-data`](../06-ma-full-data/README.md)（全種族投入）へ**一方通行（04 → 05 → 06）**で繋ぐ。
