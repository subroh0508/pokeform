# Phase 1 — ADR + 設計確定（技マスター専用取得の SoT・新取得経路の DOM 仕様・役割分割方針・skill 再編方針）

## 目的 / スコープ

本計画群の不可逆な設計判断を ADR + 設計メモとして確定する（コードは書かない）。技マスターを Serebii 技専用ページから
独立取得する経路の SoT・DOM 契約・役割分割の境界・skill オーケストレーター化の粒度を決め、後続 Phase 2-4 の実装が
ぶれないようにする。あわせて**旧 03 Phase 13（技メタ値の手動是正）を廃止し本計画群へ吸収する判断を記録**する。

- スコープ内:
  - **技マスター専用取得経路の確定**: Serebii pokedex-champions の技専用ページ（attackdex 相当）の URL / DOM 構造を
    実ページで確認し、抽出対象（`type` / `damageClass` / `power` / `accuracy` / `pp` / `priority`）と exit code 自己検証の
    契約を確定する。技メタの SoT が `move-specs`（04 で独立エンティティ化）であることを明記。
  - **役割分割方針の確定**: `parse.ts` / `to-catalog.ts` / `serebii-to-catalog.ts` の責務別分解の境界を設計メモで確定。
  - **skill 再編方針の確定**: `survey-regulation` をオーケストレーター化する粒度（roster / 覚える技の一覧 / 技マスター /
    持ち物 を独立単位・mega/move-meta は機械化済みで非分割）を確定。
  - **ADR 起票**: 技マスター取得経路の追加（Serebii 第一優先の技メタ SoT を「種族ページ副産物」から「技専用ページ専用
    取得」へ具体化）と、03 Phase 13 廃止の経緯を ADR に残す。技メタ per-game 移設の現行 carrier ADR 0035（旧 ADR 0034
    を継承）を supersede するか補完するかを判断（所在は `move-specs`・出自は Serebii で不変のため**補完**が基本）。
- スコープ外: 実装（Phase 2-4）。レイアウト再編（04 で完了済み）。

## 前提（依存）

- **04-generated-layout-redesign の Phase 1-3 完了**。`move-specs` が独立エンティティ化（`champions/move-specs.ts` /
  `data/champions/move-specs.yaml`）された新ツリーが確定していること。
- 技の出自・技メタは **Serebii 第一優先・PokeAPI を信頼源にしない**（ADR 0026 の核を継承する ADR 0035）。技メタ SoT は
  `move-specs`（ADR 0035・旧 ADR 0034 は archive）。
- 既存 rule: [[data-pipeline]] / [[type-conventions]] / [[skill-authoring]] / [[cross-agent]]。情報源方針:
  [`serebii-sourcing.md`](../../../../.claude/skills/survey-regulation/references/serebii-sourcing.md)。

## タスク

- [ ] Serebii の技専用ページ（attackdex 相当）の実 URL / DOM 構造を確認し、抽出フィールドと latin-1 / CRLF・必中
      accuracy（`101`）・変化技（`--`→`null`）等の罠を洗い出す。新取得経路の exit code 自己検証契約（0/2/3/4）を設計。
- [ ] 役割分割の境界（`parseSpeciesBase` / `parseMoves` = 覚える技の名前一覧のみ / `parseMegas` / 新 `parseMoveMaster`、
      `to-catalog.ts` の catalog/per-game/per-reg field 分離、`serebii-to-catalog.ts` の責務別関数 + `transcribe-move-master`）
      を設計メモに確定する。
- [ ] skill オーケストレーター化の粒度（独立単位 = roster / 覚える技の一覧 / 技マスター / 持ち物・非分割 = mega/move-meta）
      と、サブスキル化 or Workflow 呼び分けのどちらを採るかを確定する。
- [ ] `adr-new` で ADR を起票（技マスター専用取得経路の追加・03 Phase 13 廃止の経緯・ADR 0035（旧 ADR 0034 継承）補完/supersede の判断）。
- [ ] OVERVIEW / 後続 phase doc に確定事項を反映（必要なら追補）。

## この Phase で育てるハーネス（rule・skill）

- ADR を 1 本以上起票（`adr-new`）。技メタ取得元方針の更新があれば [[data-pipeline]] /
  [`serebii-sourcing.md`](../../../../.claude/skills/survey-regulation/references/serebii-sourcing.md) の追補方針を Phase 2-4
  で反映する旨をメモする（本 phase では方針確定のみ・実装追補は各 phase）。

## 受け入れ基準

- 技マスター専用取得経路の DOM 契約・抽出フィールド・exit code が設計メモ / ADR に明文化されている。
- 役割分割の境界・skill 再編の粒度が後続 phase が着手できる粒度で確定している。
- 03 Phase 13 廃止の経緯と、その役割が Phase 2 の専用取得経路に吸収されることが ADR / OVERVIEW に記録されている。
- 起票した ADR が `docs/adr/` に実在し（`adr-new` 採番）、README 一覧に追記されている。

## 検証手順

1. 起票 ADR を読み、技マスター取得経路の SoT・DOM 契約・03 Phase 13 廃止の経緯が自己完結して読めることを確認。
2. 設計メモの役割分割境界・skill 粒度が、Phase 2-4 のタスクと 1:1 対応することを確認（着手可能性）。
3. ADR 参照が実ファイルに解決することを機械確認: 起票した ADR 0037 が `docs/adr/0037-*.md` に実在し、その補完先
   ADR 0035 が `docs/adr/` アクティブに、継承元 ADR 0026/0034 が `docs/adr/archive/` に解決する（`ls docs/adr/ docs/adr/archive/`）。

## リスク・備考

- **Serebii 技専用ページの DOM が種族ページと異なる**可能性。Phase 1 で実ページを確認し、種族ページパーサの再利用
  範囲（latin-1 デコード・normalize）と新規実装範囲（技専用ページの表構造）を切り分ける。
- ADR 0034（技メタ per-game 移設）との関係は、SoT 所在（`move-specs`）も出自（Serebii）も不変のため**補完が基本**。
  ただし「副産物抽出」→「専用取得」への取得方式変更が決定の本質に触れるなら supersede を検討する（Phase 1 で判断）。
- 設計のみで verify への影響は無い（コードなし phase）。`pnpm verify` は緑のまま。

## Phase 1 確定事項（追補）

本 phase で確定し、[ADR 0037](../../../adr/archive/0037-serebii-move-master-dedicated-path.md)（設計メモ 1-4）に記録した:

- **ADR 0034 補完/supersede の判断 = 補完**: SoT 所在（`move-specs`）も出自（Serebii 第一優先）も「PokeAPI を技メタ
  信頼源にしない」核も不変で、変わるのは取得方式（副産物抽出 → 専用取得）のみのため supersede しない。補完先は
  **現行 carrier の ADR 0035**（ADR 0026 → 0034 → 0035 と所在が精緻化され、0026/0034 は archive・核は不変）。
- **DOM 契約（設計メモ 1）**: `https://www.serebii.net/attackdex-champions/<圧縮slug>.shtml`。抽出 = type /
  damageClass(physical/special/status) / power / accuracy / pp / **priority（"Speed Priority"・種族ページに無い新フィールド・
  符号付き整数 `-6`/`0`/`+1`）**。罠 = 変化技 power `--`→null・accuracy `101`→null・latin-1/CRLF。実ページ
  （Earthquake / Quick Attack / Swords Dance / Roar）で確認済み（Earthquake PP=12 等 Champions 準拠値）。
- **exit code 契約（設計メモ 2）**: 0 健全 / 2 取得失敗 / 3 schema 欠落（type/damageClass/pp/priority 欠落）/
  4 件数・健全性（PP ∉ {8,12,16,20} / type・damageClass 不正 / power・accuracy 負値 / priority レンジ外）。
- **役割分割の境界（設計メモ 3）・skill オーケストレーター化の粒度（設計メモ 4）**: ADR 0037 を正とする。
- **03 Phase 13 廃止**: 技メタ手動是正アプローチを廃止し本専用取得経路へ吸収（README / OVERVIEW にも記録済み）。
