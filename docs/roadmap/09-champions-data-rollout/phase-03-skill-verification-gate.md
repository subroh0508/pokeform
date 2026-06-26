# Phase 3 — 人間による `survey-regulation` skill 動作検証ゲート

> **本 phase は PR を伴わない検証マイルストーン**（1 phase = 1 PR の例外）。Phase 1-2 で限定セットを投入した結果を
> 人間が点検し、`survey-regulation` skill が解禁データ投入を正しく駆動できるかを判定するゲート。OK なら Phase 4
> （本投入）へ、NG なら skill を改修して Phase 1-2 サイクルを再実行する。

## 目的 / スコープ

全量投入（Phase 4）に進む前に、限定セット（M-A 10 体・M-B 追加解禁種）での投入結果をもとに **`survey-regulation` skill の健全性を人間が確認する**。skill が次レギュ（M-C 以降）でも再現性高く使える状態であることを、全種族へ波及する前に担保するのが狙い。

- スコープ内:
  - Phase 1-2 の投入結果（roster-source doc / catalog / per-reg / 生成 TS / `pokemon-data-reviewer` レビュー）を人間が点検。
  - skill の駆動経路（取得 fan-out → 自己修復 → 転記 → materialize 補完 → check → generate → レビュー）が各段で期待通り動いたかを確認。
  - 取りこぼし・転記ミス・名称ゆれ・フォルム扱い・レギュ間差分・使い勝手の問題を洗い出す。
  - **判定**: 健全 → Phase 4 へ。不備あり → 改修方針を確定し Phase 1 へ戻す。
- スコープ外:
  - 全種族の投入（Phase 4）。skill の実装そのもの（改修が必要なら別 PR で `skill-creator` 経由）。

## 前提（依存）

- **Phase 1・Phase 2 完了**（限定セットが投入済みで `verify` 緑・`pokemon-data-reviewer` レビュー済み）。

## タスク

- [ ] Phase 1-2 の投入結果を人間が点検する（チェック観点は下記「検証手順」）。
- [ ] 不備があれば、`survey-regulation`（オーケストレーター）/ 層2-3 Workflow / `serebii-to-catalog` 等のどこに原因があるかを切り分け、改修方針を確定する。
- [ ] **判定を記録する**:
  - **健全（OK）**: Phase 4（本投入）へ進む。判定根拠を本 phase doc / PR コメント等に残す。
  - **不備あり（NG）**: skill 改修を別 PR（`skill-creator` 経由・[[skill-authoring]]・cross-agent パリティ）で実施し、マージ後に **Phase 1 から「全削除 → M-A 限定 → M-B 限定」サイクルを再実行**して本ゲートに戻る。

## この Phase で育てるハーネス（rule・skill）

- 検証で判明した不備に応じて `survey-regulation` skill（+ 層2-3 Workflow / `serebii-to-catalog` 純関数）を `skill-creator` で改修する。アーキ判断を伴う場合は `adr-new` で ADR を残す（[[adr]]）。**改修はサイクル再実行の前提**で、本ゲート自体は判定に徹する。

## 受け入れ基準

- `survey-regulation` skill が解禁データ投入を正しく駆動できることを人間が確認し、**健全と判定**された。
- NG だった場合は、改修 → Phase 1-2 サイクル再実行 → 本ゲート再判定を経て、最終的に健全と判定されている。

## 検証手順

1. **取得の網羅性**: roster-source doc が対象種の解禁技 / 持ち物 / メガを取りこぼしなく拾えているか（Serebii と突き合わせ）。
2. **転記の正しさ**: `serebii-to-catalog` の append-only 転記が ja/en 併記・technical メタ・特性参照で破綻していないか。重複・既存破壊がないか。
3. **補完の正しさ**: `materialize` 後の構造データ（種族値 / タイプ / 特性 / dex / category）と ja 名が正しいか。
4. **レギュ間差分**: M-A と M-B の catalog 共有・per-reg 差分（追加解禁・period）が期待通りか。
5. **検証ゲートの妥当性**: `check:regulation` の 0 終了が実態の整合を担保できているか（見逃しがないか）。
6. **使い勝手**: skill 手順が人手エスカレーション含め再現性高く回せたか（次レギュで再利用できるか）。
7. 上記から **健全 / 不備あり**を判定し記録する。

## リスク・備考

- **本 phase は PR を伴わない**（限定セット投入の点検と判定のみ）。1 phase = 1 PR の例外として、全種族波及前の人間ゲートをユーザー要望で明示的に挟む（OVERVIEW の phase 分割サマリに根拠記載）。
- **サイクルは収束させる**: 改修 → 再実行が反復しうるため、判定ごとに「何が直り何が残るか」を記録し、無限ループを避ける。skill 健全と判定できて初めて Phase 4 へ進む。
- skill 改修 PR はハーネス資産変更なので `harness-review` でレビューし cross-agent パリティを点検する。
