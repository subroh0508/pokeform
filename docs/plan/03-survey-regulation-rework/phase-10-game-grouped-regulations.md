# Phase 10 — regulations をゲームでグルーピング（`regulations/champions/m-(a|b).yaml`）

> 全種族投入（Phase 13）の前に、データレイアウトを将来のマルチゲーム対応へ整える 3 phase の 1 本目。
> 現状フラットな `data/champions/regulations/<id>.yaml` を **ゲーム（champions）でグルーピング**し、
> per-game 共有データ（Phase 11 の技メタ `moves.yaml`）の置き場を用意する。

## 目的 / スコープ

`data/champions/regulations/champions-m-a.yaml` / `champions-m-b.yaml` のフラット構成を、
`data/champions/regulations/champions/m-a.yaml` / `m-b.yaml` へ**ゲーム名サブディレクトリ**で再配置する。
これにより (a) 将来 champions 以外のゲームを足すときの名前空間衝突を避け、(b) Phase 11 で per-game 共有する
技メタ `regulations/champions/moves.yaml` の置き場が決まる。

- スコープ内:
  - `git mv` で `regulations/champions-m-a.yaml` → `regulations/champions/m-a.yaml`（m-b も同様）。
  - `scripts/generate.ts`: レギュ列挙を**ゲームサブディレクトリ込みで再帰列挙**へ変更
    （`regulations/<game>/<reg>.yaml`）。**regId は安定 id `champions-m-a` を維持**（`<game>-<reg>` で導出。
    `RegulationId` リテラル・`team/individuals/*.yaml` の `regulations:` 値・生成 `regulations/<id>/` を不変に保ち
    churn を避ける）。
  - `scripts/serebii-to-catalog.ts`: `regPath(regId)` の解決を新レイアウト（`<game>/<reg>.yaml`）へ追従。
    `champions-m-a` / `m-a` 入力の双方を解決する既存挙動を保つ。
  - `scripts/materialize.ts` / `src/cli`（`check:regulation`）が regulations を**パスで参照する箇所**を追従
    （ディレクトリ走査・glob のみ。schema/参照整合ロジックは不変）。
  - `survey-regulation` skill / `data-pipeline.md` rule の **regulations パス表記**を新レイアウトへ最小追従
    （スキルの責務分割そのものは Phase 12）。
- スコープ外:
  - 技メタの per-game 移転（Phase 11）。取得スキルの分割（Phase 12）。
  - 生成出力ディレクトリ構成の変更（**`data/generated/regulations/<id>/` の id ベースを維持**＝import パス不変。
    ソース側のみゲームグルーピングする。生成側もゲーム階層化するかは将来判断）。
  - catalog 配下（`catalog/*.yaml`）のレイアウト変更（reg 非依存なので対象外）。

## 前提（依存）

- **03 Phase 1-9 完了**（取得パイプライン + legality + メガ決定論取り込み）。
- 確定済み: `generate.ts` は `readdirSync(REG_DIR)` で 1 レギュ = 1 ファイルを列挙し `<id>` を生成
  （現状フラット）。`serebii-to-catalog` は `regPath` で `champions-<reg>.yaml` を解決する。
- 確定済み rule: [[data-pipeline]] / [[cli-and-io]] / [[type-conventions]] / [[cross-agent]]。

## タスク

- [ ] `git mv data/champions/regulations/champions-m-a.yaml data/champions/regulations/champions/m-a.yaml`（m-b も）。
- [ ] `scripts/generate.ts`: `REG_DIR` 配下を**ゲームサブディレクトリ込みで再帰列挙**し、`<game>/<reg>.yaml` →
      安定 id `<game>-<reg>`（`champions-m-a`）を導出。生成出力 `regulations/<id>/` は id ベース維持。
- [ ] `scripts/serebii-to-catalog.ts`: `regPath` を `regulations/<game>/<reg>.yaml` 解決へ追従
      （`champions-m-a` / `m-a` 双方を受ける）。
- [ ] `scripts/materialize.ts` / `src/cli`（`check:regulation`）の regulations パス走査を追従。
- [ ] `survey-regulation` SKILL / `references/serebii-sourcing.md` / `.claude/rules/data-pipeline.md` の
      regulations パス表記を新レイアウトへ最小追従（cross-agent パリティ確認）。
- [ ] `pnpm generate:data` 再生成 → `pnpm verify` 緑。生成 `regulations/<id>/` の中身が移動前と等価（id 不変）。

## この Phase で育てるハーネス（rule・skill）

- **ADR は新規不要**: ソースディレクトリのグルーピングは可逆なレイアウト変更で、解禁判定モデル（ADR 0021）・
  generate 責務（ADR 0023）の決定を変えない。`data-pipeline.md` の regulations パス記述を更新するに留める。
  Phase 11（技メタ per-game 化）で per-game レイアウトの「なぜ」を ADR 化するので、その前段として本 phase は
  パス追従のみ。

## 受け入れ基準

- `data/champions/regulations/champions/m-(a|b).yaml` へ移動済み。`generate.ts` が新レイアウトを再帰列挙し、
  `RegulationId` = `champions-m-a` / `champions-m-b` が**不変**（生成 `regulations/<id>/` が等価）。
- `pnpm verify`（型 / カバレッジ100% / Biome / yaml-style）が緑。
- `pnpm check:regulation` が 0 終了。`serebii:catalog` / `materialize` が新レイアウトで動作する。

## 検証手順

1. `pnpm generate:data` 後、`data/generated/regulations/champions-m-a/` の diff が空（id ベース不変）を確認。
2. `pnpm check:regulation data/champions/regulations` が 0 終了。
3. 5 種スモーク（前回 動作確認の slug 等）で `scrape:serebii | serebii:catalog species <slug> champions-m-a` →
   `materialize` が新パス（`regulations/champions/m-a.yaml`）へ書けることを確認。
4. `pnpm verify` 緑。

## リスク・備考

- **regId 安定が要点**: `<game>/<reg>.yaml` → `<game>-<reg>` 導出で `RegulationId` を不変に保つことで、
  `src/types/*` の reg id リテラル・`team/individuals/*.yaml` の `regulations:` 値・生成 import パスの churn を
  避ける。ソースのレイアウトだけ変え、型・生成の同一性は壊さない。
- 生成側を id ベース維持（`regulations/champions-m-a/`）にするのは import パス churn 回避のため。ソースの
  ゲームグルーピングと生成の id フラットは整合する（generate が `<id>` で writeFileSync するため）。
- 本 phase は Phase 11（技メタ per-game 化）の前段。`regulations/champions/` ディレクトリが Phase 11 の
  `moves.yaml` 置き場になる。
