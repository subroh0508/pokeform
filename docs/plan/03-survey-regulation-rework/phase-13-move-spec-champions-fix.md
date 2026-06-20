# Phase 13 — 技仕様の Champions 対応（PP 8/12/16/20・power・type の誤り是正）

## 目的 / スコープ

ポケモンチャンピオンズは前作（SV 等）から**技の仕様が変更**されており、現在の move-specs（技メタ・per-game `regulations/champions/moves.yaml`）に前作値の誤りが残っている。これを **Serebii 第一優先**で Champions 実値へ是正し、技メタ SoT を Champions の正しい値に揃える。本 phase は **03-survey-regulation-rework の最終 phase**で、**続く [`04-generated-layout-redesign`](../04-generated-layout-redesign/README.md) の着手前（＝現行レイアウト上）**で実施する。04 の最終 phase（全種族投入）の前に技メタを正しくしておくことで、誤った技メタが全186種・全 movepool へ広がるのを防ぐ。是正済みの値は 04 のレイアウト再編で新ツリー（`move-specs`）へそのまま移行される。

- スコープ内:
  - **PP の是正**: Champions では技 PP が **8 / 12 / 16 / 20 のいずれか**に統一されている。現データに残る前作 PP（5/10/15/25/30/40 等）を Champions の正しい PP へ是正する。
  - **power（威力）の是正**: 前作から威力が変更された技を Serebii Champions 図鑑の値へ是正する。
  - **type（タイプ）の是正**: 前作からタイプが変更された技を Serebii Champions 図鑑の値へ是正する。
  - 対象は move-specs（技メタ = `type` / `damageClass` / `power` / `accuracy` / `pp` / `priority`）。**名前（languages）は対象外**（名前はゲーム非依存・本 phase は技メタ値のみ）。
  - 是正は **Serebii 第一優先・補助ソースで件数/値の裏取り**（`survey-regulation` の [`references/serebii-sourcing.md`](../../../.claude/skills/survey-regulation/references/serebii-sourcing.md) の情報源方針）。再現可能性のため出典・是正根拠を記録する。
- スコープ外: 全種族投入そのもの（[`04-generated-layout-redesign`](../04-generated-layout-redesign/README.md) の Phase 4）。名前データ（languages）の変更。新技の追加（解禁データは `survey-regulation` の責務）。generated/YAML レイアウトの再編（04 の責務）。

## 前提（依存）

- **03 Phase 1-12 完了**（本計画群）。特に Phase 11（技メタ per-game 化）/ ADR 0034 で、技メタの SoT が per-game `regulations/champions/moves.yaml` に確定していること。是正は**現行レイアウト上**で行う（04 着手前のため）。
- 技の出自・技メタは **Serebii 第一優先・PokeAPI を信頼源にしない**（ADR 0026）。
- 既存 rule: [[data-pipeline]] / [[type-conventions]]。情報源方針: `survey-regulation` の [`references/serebii-sourcing.md`](../../../.claude/skills/survey-regulation/references/serebii-sourcing.md)。

## タスク

- [ ] 現 move-specs（`data/champions/regulations/champions/moves.yaml`）の全技について、Serebii Champions 図鑑の技仕様（type / power / accuracy / pp / priority / damageClass）と突き合わせ、**前作値との差分（特に PP の 8/12/16/20 化・power・type 変更）を洗い出す**。差分と出典・採用根拠を記録する（再現可能性）。
- [ ] PP を Champions 値（8/12/16/20）へ是正。前作 PP の残存をゼロにする。
- [ ] power / type / accuracy / priority / damageClass の誤りを Serebii Champions 値へ是正。
- [ ] `pnpm generate:data` で再生成し、`data/generated/regulations/champions/moves.ts` に是正が反映されることを確認。
- [ ] `pnpm check:regulation data/champions` 0 終了（参照整合・schema）。`pnpm verify` 緑。
- [ ] `pokemon-data-reviewer` agent で技メタの妥当性をレビュー（PP が 8/12/16/20 に収まる・power/type が Champions 実態と整合）。

## この Phase で育てるハーネス（rule・skill）

- なし（データ値の是正が中心）。是正過程で `survey-regulation` の技メタ取得手順に不足が判明したら `skill-creator` で追補し、技メタの Champions 値確定を手順に明記する（取りこぼし防止）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome / `check:yaml-style`）が緑。
- move-specs の **全技の PP が 8 / 12 / 16 / 20 のいずれか**（前作 PP の残存ゼロ）。
- power / type が Serebii Champions 図鑑と整合（前作からの変更点が反映済み）。
- `check:regulation` 0 終了。`pokemon-data-reviewer` レビューで技メタの重大な誤りが無い。

## 検証手順

1. `data/champions/regulations/champions/moves.yaml` の `pp` 値の集合が `{8,12,16,20}` に収まることを機械確認（例: grep / スクリプトで逸脱 PP を検出し 0 件）。
2. 是正記録（差分・出典）と Serebii Champions 図鑑を代表技でスポット照合（power/type の変更が正しく反映）。
3. `pnpm generate:data` 後、`data/generated/regulations/champions/moves.ts` に是正が載ることを確認。
4. `pnpm check:regulation data/champions` 0 終了・`pnpm verify` 緑。
5. `pokemon-data-reviewer` agent で技メタをレビューし指摘を解消。

## リスク・備考

- **Serebii 単一ソースの誤記リスク**: PP/power/type は補助ソース（Game8 等）で裏取りし、矛盾と採用根拠を記録する（WebFetch / スクレイパー抽出の数値誤りに注意・`survey-regulation` の突き合わせ原則）。数値の正しさは機械ゲートで担保できないため Serebii 照合と `pokemon-data-reviewer` で担保する。
- **全種族投入（04 Phase 4）の前段**: 本 phase で技メタを正しくしておくことで、全186種・全 movepool 投入時に誤った技メタが広がらない。投入後の一括是正は差分が膨大になるため、投入前の是正が de-risk。是正は現行レイアウトで行い、04 のレイアウト再編が値を保ったまま `move-specs` へ移行する。
- 名前（languages）はゲーム非依存で本 phase の対象外（技メタ値のみ是正）。
