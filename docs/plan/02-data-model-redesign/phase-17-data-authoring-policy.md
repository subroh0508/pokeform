# Phase 17 — data/champions データ運用方針 + 統一用語の確定

## 目的 / スコープ

現行の rule / skill / ADR は `data/champions/**` を「**手動管理**」「**手書き編集**」「**hand-authored**」と
表現し、`materialize` の append/既存尊重も「**hand-authored 修正を保護**」と書く。これらは「人間が手作業で
書く」と読めるが、実際の著述主体は **`survey-regulation` / `author-individual` を実行する AI エージェント**で、
Serebii 等を閲覧して YAML に転記している。語と実態が乖離し、「人間が直接エディタで編集してよい」とも
誤読される。

本 Phase は **データ運用方針と統一用語の SoT を確定**する:

1. **方針**: `data/champions/**`（`catalog/*.yaml` / `regulations/*.yaml` / `rules.yaml`）は **skill 著述で
   維持し、人間が直接エディタ編集しない**。誤りの訂正は **skill 再実行（`survey-regulation` 等）または AI への
   直接指示**を経由する。
2. **統一用語**: ソースとして著述される SoT を **`skill-authored`**（英語ラベルのまま）と呼ぶ。意味は
   「`generate` / `materialize` の派生出力ではないソース著述。著述主体は skill を実行する AI（人間は直接編集せず
   skill/AI 経由）」。`materialize`（機械転記）と対比される。

確定は本 Phase（方針 ADR + `data-pipeline.md` への定義記載）で行い、**全資産への用語展開と人間直編集前提
文言の改訂は phase-18** が担う（本 Phase は定義の SoT 確定に徹する）。

- スコープ内:
  - **新規 ADR 起票**（`adr-new`・0029 の次 = 0030 想定）: 「`data/champions/**` は skill 著述・人間直編集 NG・
    誤りは skill/AI 経由で訂正」というデータ運用方針の決定。`rules.yaml` は対応 skill が無いため**改定経路を
    「AI への直接指示」**と定義する点も含める。
  - `.claude/rules/data-pipeline.md` に**方針節**と**統一用語「skill-authored」の定義**を SoT として追記。
    `materialize` の「保護対象 = skill 著述値（旧: hand-authored 修正）」への意味整合を定義レベルで明記
    （append/既存尊重の設計自体は不変・保護の主体が人間→skill/AI に変わるだけ）。
- スコープ外:
  - `hand-authored → skill-authored` の全資産機械置換・人間直編集前提文言の全面改訂（**phase-18**）。本 Phase は
    `data-pipeline.md` の中心定義のみ確定。
  - 人間直編集 NG の**機械強制**（CI check 等）。本 Phase は**規約・方針レベルの明記**で担保する。強制 check の
    要否は将来判断（リスク・備考に送り）。
  - 情報源の役割・関係性の整理とフロー図改訂（**phase-19**）。

## 前提（依存）

- なし（phase-16 と**並行着手可**）。
- 関連 ADR: [ADR 0026]（PokeAPI を Champions legality / 技威力の信頼源にしない・Serebii 第一優先）/
  [ADR 0027]（構造データ catalog SoT・`materialize` 新設・append/既存尊重で著述修正を保護）。本 Phase は
  これらの「著述」主体を skill/AI と明確化する延長。
- 確定済み rule: [[data-pipeline]] / [[cross-agent]] / [[adr]]。

[ADR 0026]: ../../adr/0026-pokeapi-not-champions-legality-source.md
[ADR 0027]: ../../adr/0027-structural-data-catalog-sot.md

## タスク

- [ ] `adr-new` でデータ運用方針 ADR を起票（採番は skill 委譲）。Decision に「`data/champions/**` は skill 著述・
      人間直編集 NG・誤りは skill/AI 経由で訂正」「統一用語 = `skill-authored`」「`rules.yaml` の改定経路 = AI
      直接指示」を断定形で記す。Consequences に「再現性・出典同期の維持」「強制は規約レベル（機械ゲートは別途
      判断）」を記す。
- [ ] `.claude/rules/data-pipeline.md` に**方針節**を追加（data/champions は skill 著述・人間直編集 NG・訂正経路）。
- [ ] `data-pipeline.md` に**統一用語「skill-authored」の定義**を 1 か所追記（派生でないソース著述・著述主体 =
      skill 実行の AI・`materialize` との対比）。`materialize` の保護対象を「skill 著述値」として意味整合させる
      定義を記す。
- [ ] 検証フェーズ実施（下記「検証手順」）。

## この Phase で育てるハーネス（rule・skill）

- **rule 追従**: [[data-pipeline]]（方針節 + 統一用語定義の SoT 化）。
- **ADR**: `adr-new` で 1 本起票（データ運用方針）。本文に可変 plan 参照を書かない（[[adr]]）。
- skill 改修なし（用語の全資産展開は phase-18）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- データ運用方針 ADR が連番（0029 の次）で作成され、Decision に「skill 著述・人間直編集 NG・skill/AI 経由訂正・
  統一用語 skill-authored・rules.yaml は AI 直接指示」が断定形で入る。
- `data-pipeline.md` に方針節と「skill-authored」の定義が SoT として存在し、`materialize` の保護対象が
  「skill 著述値」として意味整合している。
- `harness-review` 観点（SoT 一貫性・クロスエージェント整合）で blocking なし。

## 検証手順

1. ADR の Decision / Consequences に方針 4 点（著述主体 / 人間直編集 NG / 訂正経路 / 統一用語）が揃うことを確認。
2. `data-pipeline.md` に方針節 + 用語定義があり、`materialize` の保護対象の意味整合が取れていることを確認。
3. 採番が active + archive 走査の最大 + 1（[[adr]]）。
4. `pnpm verify` 緑を確認。`harness-review` で点検。

## リスク・備考

- **機械強制はしない（本 Phase）**: 人間直編集 NG を CI で強制するのは「誰が編集したか」を機械判定しづらく
  困難。本 Phase は規約・方針レベルの明記で担保する。将来、`data/champions` の直編集を warn する check を
  入れる価値があれば別 Phase（phase-20 以降 / 別計画）で検討する。
- **`skill-authored` は英語ラベルのまま**（コード / データの識別子的な統一名）。日本語化はしない（決定）。
- **定義の SoT は `data-pipeline.md` に一本化**し、SKILL / README 等は phase-18 でポインタ化する（二重管理回避）。
- ADR 本文は可変 plan ファイル（phase doc / phase 番号 / OVERVIEW リンク）を参照しない（[[adr]]）。
