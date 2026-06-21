# 03-survey-regulation-rework — survey-regulation 刷新（決定論スクレイパー + 自己修復）OVERVIEW

## ゴール

`survey-regulation` skill による Champions レギュレーション解禁データの取得を、**LLM の WebFetch 目視抽出**から
**決定論スクレイパー（cheerio）+ Haiku 取得 SubAgent + 修正 SubAgent 自己修復（ハイブリッド3層）**へ刷新する。
これにより、解禁データ取得の **トークン消費を大幅に削減**（HTML を LLM コンテキストに載せない）し、**正確性を向上**
（小型モデルの目視抽出をやめ、テスト済み純関数で抽出）させる。本計画群は **Phase 12 で完結**する（取得パイプライン
刷新 + データレイアウト整備）。**技仕様の Champions 対応（技マスターの値是正）とスクレイパー役割分割・skill オーケスト
レーター化は後続 [`05-move-master-scraper-refactor`](../05-move-master-scraper-refactor/README.md)**、**M-A 全186種の全量
投入は [`09-ma-full-data`](../09-ma-full-data/README.md)** が担い、依存を一方通行（03 → 04 → 05 → 09）に保つ。

## 背景 / 動機

現行 `survey-regulation` skill は、Serebii の Champions 解禁ページを LLM が WebFetch で 186 種族ぶん目視抽出して
おり、skill 自身が「件数を誤カウントしうる」と注記している。これがトークン消費を重くし、小型モデル抽出ゆえ
正確性にも劣る。

実ページを取得して構造を確認した結果、**Serebii Champions ページは技テーブルが "Standard Moves" 1 つに統合**
されており（mainline と違い TM/Egg/Tutor 分割なし）、種族値・タイプ・特性・技（名/type/damageClass/power/
accuracy/pp）は**全て決定論的に抽出可能**と判明した。つまり LLM 目視は不要で、決定論パーサに置き換えれば
トークンと正確性を同時に改善できる。

この計画群は、02-data-model-redesign で確定したデータ保持モデル（catalog 分離 / per-regulation YAML / 技メタ
catalog SoT / 構造データ catalog 化）の上で、**取得手段**を刷新する。動作確認で判明した是正を Phase 7-9、
**データレイアウト整備**（Phase 10 regulations ゲームグルーピング・Phase 11 per-game 技メタ・Phase 12 取得スキル
2 分割）を Phase 10-12 として追加し、**Phase 12 で完結**する。技仕様の Champions 対応（技マスターの値是正）は当初
本計画群の Phase 13 として置いていたが、後続 [`05-move-master-scraper-refactor`](../05-move-master-scraper-refactor/README.md)
の技マスター専用取得経路へ吸収して廃止した。02 の最終 phase だった「M-A 全データ投入」は、新パイプラインで**かつ新しい
generated/YAML レイアウトの上で**実行すべきため、後続計画群 [`09-ma-full-data`](../09-ma-full-data/README.md) へ移した。
**依存は一方通行**: 順序は **03（取得刷新・Phase 1-12）→ 04（レイアウト再編）→ 05（技マスター取得 + 役割分割）→
09（全種族投入）**で、前計画へ戻る依存は持たせない。

## 設計方針

採用方針は **3 層ハイブリッド**: 抽出の正しさを cross-agent 共有の決定論コード（層1）に集約し、その上に
Claude 固有の Haiku 取得 SubAgent（層2）と修正 SubAgent（層3）を「加速・自動修復」として乗せる。正しさが
層1（通常 npm script）に宿るため Codex / 素の CLI でも同じ成果が出て **cross-agent パリティ**が壊れない。

- **層1（決定論・cross-agent 共有）**: `src/codegen/serebii/*.ts` の純関数パーサ（cheerio・テスト100%）+
  `scripts/{fetch-serebii,scrape-serebii,serebii-to-catalog}.ts`。LLM は HTML を一切読まない。
- **層2（Claude 固有・Workflow）**: Haiku 取得 SubAgent が層1スクリプトを多種に fan-out + exit code 判定。
- **層3（Claude 固有・Workflow）**: 修正 SubAgent（Sonnet+）が exit 3/4 で `parse.ts` を直し fixture テストを
  追加 → 取得 SubAgent へ再依頼。K 回上限で収束しない種は人手エスカレーション。

守る制約（既存 rule / ADR）:
- 技の出自は **Serebii 第一優先・PokeAPI を Champions legality / 技メタの信頼源にしない**（ADR 0026・不変）。
  本計画は「Serebii から**どう**取るか」を変える決定で 0026 を supersede せず補完する。
- 構造データ（種族値 / タイプ / 特性 / dex / category）は **catalog SoT・PokeAPI vendor 経由**（ADR 0027）。
  既存 `materialize.ts`（raw → catalog・append/既存尊重）を無改造で再利用し、Serebii vs PokeAPI の差異が
  conflict 提示として自動クロスチェックされる。
- `data/champions/**` は **skill-authored**（ADR 0030）。本計画はその著述主体を「決定論スクレイパー + SubAgent」へ
  具体化する。
- **日本語名は PokeAPI の `names`（ja-Hrkt）から機械補完**（Serebii に ja 名が無いため）。`data-pipeline.md` の
  「日英名 = PokeAPI に無し」記述を更新する。
- 実行は既存どおり **ネイティブ Node**（`node scripts/...` / pnpm scripts）。Docker は採用しない。

詳細な設計の正本は承認済みプラン由来の本 OVERVIEW + 各 phase doc。データパイプライン規約は
[`.claude/rules/data-pipeline.md`](../../../.claude/rules/data-pipeline.md) / 情報源方針は
[`.claude/skills/survey-regulation/references/serebii-sourcing.md`](../../../.claude/skills/survey-regulation/references/serebii-sourcing.md)。

## 実装指針

実行順序（skill の責務・既存方針踏襲）:
`fetch-serebii` → `scrape-serebii` → （自己修復ループ）→ `serebii-to-catalog` → `fetch:data` → `materialize` →
`check:regulation` → `generate:data` → `verify`。

**自己検証 exit code**（層1スクリプトが決定論で判定・層2-3 の自己修復トリガ）:
- exit 2: HTTP 非200 / "Page Not Found" / 本文サイズ閾値下回り（取得失敗・再試行）。
- exit 3: schema 欠落（dex/en/types≥1/abilities≥1/stats 6値/moves≥1 のいずれか欠落）。
- exit 4: 件数/健全性（stats 合計が Total 行と不一致 / slug 正規化が `^[a-z0-9]+(-[a-z0-9]+)*$` 不適合 /
  技に type・damageClass 欠落）。
- stderr に `{slug, stage, missingFields, rawHtmlPath}` を JSON 出力（修正 SubAgent の入力契約）。

**実ページ確認で判明した罠（パーサ実装の前提）**:
- ページは latin-1 + CRLF + 超長行 → **latin-1 デコード → HTML エンティティ展開**が必須。
- Serebii slug は圧縮形（`aerialace`/`choicescarf`）で catalog id（`aerial-ace`/`choice-scarf`）とずれる →
  **正規化が必要**。未知 slug を新規 catalog id として勝手に作らないガードを置く。
- 必中技 accuracy は `101`、変化技は `--` → `null`/特別扱いを決定論判定。

純関数化: パース・検証・正規化のロジックは `src/codegen/serebii/*.ts` の純関数に切り出し、`*.test.ts` で
fixture（実 HTML の最小切片を `__fixtures__/` にコミット）ベースで網羅（カバレッジ100%）。`scripts/*.ts` は
fetch + 配線のみの薄い層に保つ。fixture は**単純種・複数フォルム種・メガ種**を含める。

## スコープ外

- M-B 以降の正確データ（未公開・暫定維持）。M-B 投入は別 phase / 別計画で検討。
- 新機能・01-mvp の機能拡張。データ保持モデル / generate の再設計（02 で確定済み）。
- 技の効果テキスト（effect %）の catalog スキーマ化（将来の効果定義の素材として raw に残すのみ）。

## 受け入れ基準

1. 各フェーズ末で `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
2. 層1（決定論パーサ + 転記 + ja 補完）が完成し、`node scripts/scrape-serebii.ts species <slug>` が中間 JSON を
   出力し exit code で自己検証する。パーサは fixture テストでカバレッジ100%。
3. 層2（Haiku 取得 fan-out）・層3（修正 SubAgent 自己修復ループ）が Workflow で機能し、壊したパーサで
   「取得失敗 → 修正 → 再取得で緑化」が回り、K 回上限・エスカレーションが働く。
4. `survey-regulation` skill が新パイプライン（決定論スクレイパー + 自己修復）へ全面改訂され、cross-agent
   フォールバック（Codex は層1 を逐次 + 人手修正で完結）が明記される。
5. 取得スキルが 2 分割（catalog 取得 / regulations 取得）され、catalog 更新チェックポイントが機能する（Phase 12）。
   **技仕様の Champions 対応（技マスターの値是正）は後続 [`05-move-master-scraper-refactor`](../05-move-master-scraper-refactor/README.md)**、
   **M-A 全186種の全量投入は [`09-ma-full-data`](../09-ma-full-data/README.md)** で実施する（いずれも本計画群のスコープ外・
   依存は一方通行 03 → 04 → 05 → 09）。

## phase 分割（6 基準の評価サマリ）

承認済みプラン（ハイブリッド3層・フル実装）を層の境界と依存で分割し、さらに動作確認で判明した是正
（per-reg 持ち物 legality・per-reg species name 削除・メガ決定論取り込み）を Phase 7-9 として、データレイアウト
整備（ゲームグルーピング・per-game 技メタ・取得スキル 2 分割）を Phase 10-12 として追加して **12 phase = 12 PR** と
した（技仕様の Champions 対応は 05 へ吸収・全種族投入は 06 へ移動）。
6 基準の評価:
- **意思決定の数 / 不可逆性**: cheerio 導入・ja 取得元変更・スクレイパー化は ADR 級の独立判断 → Phase 3 で
  ADR 起票。層2/層3 の SubAgent 構成も独立判断。per-reg item legality（Phase 7）は ADR 0021 補注、メガ決定論化
  （Phase 9）は ADR 0031 supersede の独立判断。技メタ per-game 移転（Phase 11）は ADR 0026 の SoT 所在改訂の
  独立判断。レイアウトのゲームグルーピング（Phase 10）・取得スキル 2 分割（Phase 12）も独立判断。
- **スコープの広さ**: `src/codegen` / `src/types` / `scripts` / `.claude/skills` / `.claude/rules` / `data/` を
  横断 → phase で分離。
- **技術的難易度**: 決定論パーサ（Phase 1）・自己修復ループ（Phase 5）・型 legality（Phase 7）・メガ決定論変換
  （Phase 9）・技メタ per-game 分離 + 消費 repoint（Phase 11）が難所 → 独立 phase。
- **想定 diff**: Phase 11（技メタ移設）は約261技で大きめだがスキーマ変更として 1 PR。他 phase は ~500 行内。
  （技仕様是正は 05 / 全種族投入 >1000 行は 06・[[planning]] の例外。）
- **並行実装のしやすさ**: 層1→層2→層3→skill→legality/メガ→レイアウト整備 と直列依存が強い
  （Phase 1-2 は一部並行可・Phase 10→11→12 は直列）。本計画群（03）完了後に 04（レイアウト再編）→ 05（技マスター取得 +
  役割分割）→ 09（全種族投入）へ一方通行で繋ぐ。

| phase | 狙い | 主な diff |
|---|---|---|
| Phase 1 | 決定論パーサ純関数 + fixture テスト | `src/codegen/serebii/*` + test |
| Phase 2 | items スクレイパー + fetch-serebii キャッシュ | `scripts/fetch-serebii.ts` 等 |
| Phase 3 | serebii-to-catalog 転記 + ja 補完 + パイプライン結合 + ADR | `scripts/serebii-to-catalog.ts`・ADR・rule |
| Phase 4 | Haiku 取得 SubAgent + Workflow fan-out（層2） | Workflow スクリプト・SKILL 追記 |
| Phase 5 | 修正 SubAgent + 自己修復ループ（層3） | Workflow スクリプト・SKILL 追記 |
| Phase 6 | SKILL.md 全面改訂 + cross-agent パリティ + ツール整備 | SKILL・serebii-sourcing・rule |
| Phase 7 | per-reg 持ち物 legality + メガストーン保持ルール | `src/types/*`・`scripts/generate.ts`・fixture |
| Phase 8 | per-reg species name 削除（speciesBaseDex に集約） | `scripts/generate.ts`・`src/types/*` |
| Phase 9 | メガ決定論自動取り込み（ADR 0031 supersede） | `src/codegen/serebii/*`・`scripts/serebii-to-catalog.ts`・SKILL・ADR |
| Phase 10 | regulations をゲームグルーピング（`regulations/champions/m-(a|b).yaml`） | `git mv`・`scripts/generate.ts`・`scripts/serebii-to-catalog.ts`・rule |
| Phase 11 | 技メタを per-game へ移転（catalog = 名前 / `regulations/champions/moves.yaml` = 技メタ・ADR 0026 改訂） | `src/types/move.ts`・`scripts/generate.ts`・消費側 repoint・ADR・rule |
| Phase 12 | 取得スキルを 2 分割（catalog 取得 / regulations 取得）+ catalog 更新チェックポイント | 新 skill・`survey-regulation` refocus・rule |

直列チェーン: Phase 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12（Phase 3 は 1・2 に依存・
Phase 9 は 7 の `megaSpecies` に依存・Phase 10→11→12 は直列）。本計画群（03）完了後に
[`04-generated-layout-redesign`](../04-generated-layout-redesign/README.md)（レイアウト再編）→
[`05-move-master-scraper-refactor`](../05-move-master-scraper-refactor/README.md)（技マスター取得 + 役割分割 + skill 再編）→
[`09-ma-full-data`](../09-ma-full-data/README.md)（全種族投入）へ**一方通行（03 → 04 → 05 → 09）**で繋ぐ。
