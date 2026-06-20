# Phase 11 — 技メタを per-game へ移転（catalog = 名前のみ / regulations/champions = 技メタ）

> データレイアウト整備の 2 本目。技の数値（type/damageClass/power/accuracy/pp/priority）は **Champions 固有値**
> なので、reg 不変の名前 SoT（`catalog/moves.yaml`）から切り離し、ゲーム単位で共有する
> `regulations/champions/moves.yaml` へ移す。ADR 0026 の「技メタ SoT = `catalog/moves.yaml`」を改訂する。

## 目的 / スコープ

`catalog/moves.yaml` を **id + `ja`/`en` のみ**（reg 非依存の名前 SoT）に縮小し、技メタ
（`type` / `damageClass` / `power` / `accuracy` / `pp` / `priority`）を **`regulations/champions/moves.yaml`**
（per-game 共有・m-a/m-b 横断）へ移転する。技の数値は Champions 独自調整があり得るため、ゲーム単位で持つのが
正しい所在（名前はゲーム非依存なので catalog に残す）。

- スコープ内:
  - **型の分離**（`src/types/move.ts`）: `MoveBase`（id + name のみ）と per-game `MoveStats`（type/damageClass/
    power/accuracy/pp/priority）へ分割。生成 dex の形を 2 系統に。
  - `data/champions/catalog/moves.yaml`: 技メタフィールドを除去（id + `ja`/`en` のみ）。
  - `data/champions/regulations/champions/moves.yaml` 新設: 全技の技メタを per-game で保持（移設元は現
    `catalog/moves.yaml` の値・等価移設）。
  - `scripts/generate.ts`: `moves.ts`（catalog 由来 = id + name）と **per-game move メタ dex**（champions 由来）を
    分離生成。技メタ消費側を per-game dex 参照へ repoint:
    - `src/domain/party-analysis.ts` / `src/cli/commands/analyze-coverage.ts`（coverage = type/damageClass 参照）。
    - ダメージ・火力指数（power 参照）。
  - `scripts/serebii-to-catalog.ts`: 技メタの書き出し先を `regulations/champions/moves.yaml` へ
    （名前 id/en は引き続き `catalog/moves.yaml`・append/既存尊重）。
  - `scripts/materialize.ts`: 技の ja 補完先を `catalog/moves.yaml`（名前 SoT）に保つ（技メタは触らない）。
- スコープ外:
  - per-reg（m-a vs m-b）で技メタが**異なる**ケースの表現（現状 champions 内で技メタは共通とみなし per-game で
    1 ファイル。reg ごとに差が出たら将来 per-reg override を検討）。
  - 取得スキルの分割（Phase 12）。全種族投入（後続計画群 06）。

## 前提（依存）

- **Phase 10 完了**（`regulations/champions/` ディレクトリが存在し、per-game ファイルの置き場が確定）。
- 確定済み: 現状 `generate.ts` は `catalog/moves.yaml`（`MoveMeta extends NamePair` = name + 技メタ）から
  `moveDex`（name + 技メタ）を生成し、`satisfies MoveBase` で検証。per-reg `moves` は技 id 配列で、メタは
  global `moveDex` から引く。ADR 0026 が「技メタ SoT = catalog/moves.yaml」。
- 確定済み rule: [[data-pipeline]] / [[type-conventions]] / [[tsc-verification]] / [[testing]]。

## タスク

- [ ] `src/types/move.ts`: `MoveBase` を id + name に縮小し、per-game `MoveStats`（type/damageClass/power/
      accuracy/pp/priority）型を分離・export。`DamageClass` は維持。
- [ ] `data/champions/catalog/moves.yaml`: 技メタフィールドを除去（id + `ja`/`en` のみ）。
- [ ] `data/champions/regulations/champions/moves.yaml` 新設: 全技の技メタを移設（現 catalog 値を等価移設）。
- [ ] `scripts/generate.ts`: `moves.ts`（id + name・catalog 由来）と per-game 技メタ dex
      （`regulations/champions/moves.ts` 等）を分離生成。技メタ欠落は `satisfies` で生成段 tsc が弾く。
- [ ] 技メタ消費側（`party-analysis` / `analyze-coverage` / ダメージ・火力指数）を per-game 技メタ dex 参照へ
      repoint。`src/domain/*` のテストを追従（カバレッジ100%維持）。
- [ ] `scripts/serebii-to-catalog.ts`: 技メタ書き出し先を `regulations/champions/moves.yaml` へ
      （名前は `catalog/moves.yaml`）。`materialize` の技 ja 補完は catalog のまま。
- [ ] `pnpm generate:data` 再生成 → `pnpm verify` 緑。生成 `moveDex` の技メタ値が移設前後で等価。

## この Phase で育てるハーネス（rule・skill）

- **新 ADR**（`adr-new`）で **ADR 0026 の「技メタの SoT を `catalog/moves.yaml` へ」決定を改訂**し、技メタ SoT を
  **per-game `regulations/champions/moves.yaml`** とする（PokeAPI を技メタ信頼源にしない方針＝ADR 0026 の核は不変。
  「Champions 固有値なので所在は per-game」へ精緻化する supersede）。技メタ SoT の所在変更は決定の意味変更に当たるため、
  adr.md の規約どおり**補注追記ではなく supersede で行う**（0026 を `Superseded by ...` にして archive へ退避し、
  新 ADR をアクティブにする）。
- `.claude/rules/data-pipeline.md`: 「`moves.yaml` は id→名前 + 技メタ」「生成 `moves`（name + 技メタ）」の表・
  本文を新所在（catalog = 名前 / regulations/champions = 技メタ）へ更新。`type-conventions.md` の moves 記述も追従。

## 受け入れ基準

- `catalog/moves.yaml` が id + `ja`/`en` のみ。`regulations/champions/moves.yaml` に全技メタが移設され、生成
  `moveDex`（または per-game 技メタ dex）の値が移設前と等価。
- `pnpm verify`（型 / カバレッジ100% / Biome / yaml-style）が緑。coverage/ダメージ計算が per-game 技メタ参照で
  従来どおり動作。
- ADR 0026 の技メタ SoT が per-game `regulations/champions/moves.yaml` へ改訂・archive 退避（supersede の場合）・
  新 ADR がアクティブ。`data-pipeline.md` / `type-conventions.md` 追従。

## 検証手順

1. `pnpm generate:data` 後、`catalog/moves.yaml` に技メタが無い・`regulations/champions/moves.yaml` に全技メタが
   ある・生成 `moveDex` の技メタ値が移設前と等価（git diff の値部分が一致）を確認。
2. `node src/cli/index.ts analyze-coverage <party>` / 火力指数が従来どおり（per-game 技メタ参照）。
3. `pnpm check:regulation` 0 終了・`pnpm verify` 緑。
4. ADR 採番・archive 退避（supersede 時）・`data-pipeline.md` 整合を確認。

## リスク・備考

- **ADR 0026 の核は不変**: 「PokeAPI を技メタの信頼源にしない・技メタは skill-authored」は維持。本 phase は
  その SoT の**所在**を catalog → per-game regulations へ精緻化する（Champions 固有値だから）。0026 の決定文を
  覆すのではなく所在を更新する点を ADR Context に明記する。
- **per-reg vs per-game**: 現状は champions 内で技メタ共通とみなし per-game で 1 ファイル（`regulations/champions/
  moves.yaml`）。将来 m-a と m-b で技メタが分岐したら per-reg override を別 phase で検討する（スコープ外）。
- **消費側 repoint が難所**: coverage/ダメージは技メタ（type/damageClass/power）を引く。global `moveDex` から
  per-game dex への参照切替を型安全に行い、テストのカバレッジ100%を維持する。
- 値の等価移設が原則（移設は出自を移す変更で生成値は不変）。生成 `moveDex` の値 diff が空になることを確認する。
