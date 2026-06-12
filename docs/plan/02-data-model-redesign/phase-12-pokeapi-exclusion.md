# Phase 12 — PokeAPI を Champions レギュレーション情報・技威力の信頼源から外す（決定 + harness 追従）

## 目的 / スコープ

PokeAPI は**ポケモンチャンピオンズに対応していない**。にもかかわらず、現状のパイプラインは Champions の
レギュレーション情報（解禁種族・使用できる技 = learnset legality・使用できる持ち物）の検証と、技の威力等の
**技メタ情報**を PokeAPI（`data/raw`）に依存している。これらは Champions の実態と一致する保証がなく、
誤った「使える/使えない」判定や誤った技数値を生む温床になる。本 Phase で**「Champions のレギュレーション情報と
技威力の信頼源として PokeAPI を使わない」決定を確定（ADR 起票）**し、その決定をベースに各種 Markdown・skill・
ソースを追従させる。全186種の全量投入（Phase 14）の**手前**に置き、誤った前提の上で全量を入れてからやり直す
事故を防ぐ。

- スコープ内:
  - **意思決定の確定（ADR 起票・`adr-new`）**: PokeAPI を Champions の (a) 解禁種族 / (b) 使用できる技
    （learnset legality）/ (c) 使用できる持ち物 / (d) 技威力等の技メタ の信頼源として使わない。代替は
    **信頼できる情報源（Serebii 第一優先・複数ソース突き合わせ）**で補完する。種族値・タイプ・特性・持ち物
    category 等の**レギュ非依存の構造データ**は引き続き PokeAPI vendor（ADR 0012）由来とすることを明記。
    **PokeAPI が Champions に正式対応したら本決定を見直せる**（reversible）ことを ADR に残す。
  - **`check:regulation` の learnset 照合ゲートを撤去**（`src/domain/regulation-validation.ts` /
    `src/cli/commands/check-regulation.ts`）。「覚えない技（`moves` ⊄ raw PokeAPI learnset）」検出は
    Champions の learnset を反映しないため**撤去**する（参照整合 / schema / 重複の検証は残す）。
  - **`survey-regulation` skill の「投入前 learnset 照合」手順（手順 7）を撤去/改訂**し、技の出自を Serebii 等
    第一優先に一本化（`skill-creator` で改修・canonical + symlink パリティ）。
  - **技メタ（威力等）の SoT を PokeAPI raw から移す**。`generate.ts` / `fetch-pokeapi.ts` / `moves.yaml`
    catalog のスキーマを、技威力等を PokeAPI raw から導出しない形へ改める（具体的な代替源・スキーマは ADR で確定）。
  - **Markdown / rule の追従**: `.claude/rules/data-pipeline.md`（「覚える技 = `pokemon.moves[]`」項目対応・
    learnset 関連記述・技メタ source）/ `type-conventions.md` / `cli-and-io.md` /
    `docs/plan/01-mvp/architecture.md` / `.claude/skills/code-review/references/code-review-checklist.md` /
    `.claude/rules/redaction.md` / `.claude/rules/implementation-workflow.md` の PokeAPI learnset / 技メタ
    依存記述を本決定に追従させる。
  - **修正前後の検証フェーズ**（必須）: 想定した修正が漏れなく適用されたかを機械的に検証する（後述「検証手順」）。
- スコープ外:
  - M-A の全量データ投入そのもの（**Phase 14**）。本 Phase は**前提（決定 + harness 追従）の確定**に徹する。
  - 種族値・タイプ・特性・持ち物 category 等の構造データの PokeAPI vendor 方式（ADR 0012・**維持**）。
  - data ディレクトリの説明 Markdown 追加（**Phase 13**）。
  - 新機能・01-mvp の機能拡張。

## 前提（依存）

- **Phase 5（技記録スキーマ再設計）/ Phase 6（generate 変換専任 + `check:regulation`）完了**。learnset 照合は
  Phase 6 で `check:regulation` の authoring ゲートに集約済みで、本 Phase はそのゲートから learnset 検証を
  **撤去**する位置づけ（撤去対象が一箇所に集約済み）。
- **Phase 8（`survey-regulation` skill 全量 materialize 定型化）完了**。Serebii 第一優先の materialize 手順が
  skill 化済みで、本 Phase は「投入前 learnset 照合」を取り除き Serebii 一本化へ寄せる。
- **Phase 10（catalog 日英名 authoring）完了**。名前 SoT が catalog YAML へ移行済みで、技メタ（威力等）の
  SoT 移設もこの hand-authored catalog 路線の延長で検討できる。
- 確定済み rule: [[data-pipeline]] / [[cli-and-io]] / [[type-conventions]] / [[cross-agent]] / [[adr]] /
  [[skill-authoring]] / [[testing]] / [[tsc-verification]]。
- 関連 ADR: ADR 0012（vendor PokeAPI・本 Phase で Champions legality + 技メタ部分を改訂）/ ADR 0021（解禁判定の
  per-reg 一本化）/ ADR 0022（種族キー = 解禁・per-species moves）/ ADR 0023（generate 変換専任 +
  `check:regulation`・learnset 検証の置き場所）。

## タスク

- [ ] **ADR 起票（`adr-new`）**: 「PokeAPI を Champions レギュレーション情報・技威力の信頼源にしない」決定を
      採番して残す。Context に「PokeAPI は Champions 非対応」「learnset / 技威力が実態と一致しない」を、Decision に
      上記 (a)〜(d) と代替源（Serebii 第一優先）・**構造データの vendor 維持**・**正式対応時に見直せる**ことを記す。
      ADR 0012 の status を `Superseded by ...` ではなく**部分改訂**として扱うか新規追補かは `adr.md` の supersede
      規約に従って判断（名前/相性を改訂した ADR 0025 の前例に倣う）。
- [ ] **`check:regulation` の learnset 照合撤去**: `src/domain/regulation-validation.ts` から覚えない技検出
      （raw learnset 交差）を除去し、参照整合 / schema / 重複検証は残す。テストをコロケーションで更新し
      **カバレッジ 100% を維持**（撤去で到達不能になった分岐・テストを除去）。
- [ ] **`fetch-pokeapi.ts` の learnset / 技メタ取得見直し**: 技威力等を raw から導出しない方針に合わせて取得対象を
      整理（種族値・タイプ・特性・持ち物 category は維持）。
- [ ] **技メタ SoT 移設**: `generate.ts` が技威力等を PokeAPI raw から読まないようにし、技メタの SoT を
      catalog/`moves.yaml`（hand-authored）等へ移す（具体スキーマは ADR で確定）。生成物 `moves.ts` の構造を追従。
- [ ] **`survey-regulation` skill 改修（`skill-creator`）**: 手順 7「投入前 learnset 照合」を撤去/改訂し、技の出自を
      Serebii 第一優先へ一本化。`references/serebii-sourcing.md` も追従。canonical + `.agents/skills` symlink パリティ。
- [ ] **Markdown / rule 追従**: `data-pipeline.md`（項目対応表「覚える技」「技メタ source」/ learnset 記述）/
      `type-conventions.md` / `cli-and-io.md` / `architecture.md` / `code-review-checklist.md` / `redaction.md` /
      `implementation-workflow.md` の PokeAPI learnset・技メタ依存記述を本決定へ追従。`rules-index.md` は生成物の
      ため手編集しない（`paths` 変更時のみ `prepare` で再生成）。
- [ ] **検証フェーズ実施**（下記「検証手順」を実行し、修正漏れ・取り残しが無いことを確認）。

## この Phase で育てるハーネス（rule・skill）

- **rule 追従**: [[data-pipeline]]（PokeAPI 項目対応から Champions legality / 技メタを除外し代替源を明記）・
  必要に応じ [[cli-and-io]] / [[type-conventions]]。
- **skill 改修**: `survey-regulation`（learnset 照合手順の撤去/改訂・`skill-creator` 利用・[[skill-authoring]]）。
- **ADR**: 本 Phase の決定を `adr-new` で起票（[[adr]]）。可変 plan 参照を本文に書かない（[[adr]] の参照規約）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- PokeAPI を Champions の解禁種族 / 使用できる技（learnset legality）/ 使用できる持ち物 / 技威力の信頼源にしない
  決定が **ADR として残る**（代替源 = Serebii 第一優先・構造データ vendor 維持・正式対応時の見直し可を明記）。
- `check:regulation` から learnset 照合（覚えない技検出）が**撤去**され、ゲートは参照整合 / schema / 重複のみを
  検証する（learnset 由来の非0終了が起きない）。
- 技威力等の技メタが **PokeAPI raw から導出されない**（`generate.ts` / 生成物 `moves.ts` がそれを反映）。
- `survey-regulation` skill に「投入前 learnset 照合」手順が残っていない（Serebii 第一優先へ一本化）。
- 関連 Markdown / rule の PokeAPI learnset・技メタ依存記述が本決定に追従している（取り残しなし）。

## 検証手順

> **修正前後で想定通り適用できたかの検証フェーズ**（本 Phase の必須要件）。修正対象を機械的に洗い出し、
> 修正後に依存記述が残っていないことを確認する。

1. **修正前のベースライン取得**: `git grep -n -i 'learnset\|pokeapi.*\(技\|move\|威力\)'` 等で、撤去/追従対象の
   現行参照箇所を一覧化し、修正対象リストを作る（rule / skill / src / docs）。
2. **修正後の取り残し検査**: 1 と同じ検索を再実行し、Champions legality / 技威力を PokeAPI に依存する記述・コードが
   残っていないことを確認（構造データ = 種族値・タイプ等の正当な PokeAPI 参照は除外して判定）。
3. `node src/cli/index.ts check:regulation data/champions/regulations` を実行し、learnset 由来の検出ロジックが
   呼ばれない（覚えない技起因の非0終了が発生しない）ことを確認。参照整合 / schema 検証は引き続き機能すること。
4. `pnpm fetch:data && pnpm generate:data` を実行し、生成物 `moves.ts` 等が技威力を PokeAPI raw から導出しない
   形に変わっていることをスポット確認。
5. `survey-regulation` skill を読み、learnset 照合手順が無く Serebii 第一優先へ一本化されていることを確認。
   canonical と `.agents/skills` symlink のパリティを確認。
6. `pnpm verify` 緑を確認（型 / カバレッジ100% / Biome）。`harness-review` 観点で rule / skill / ADR の整合を点検。

## リスク・備考

- **技メタ SoT 移設の波及**: 技威力等を PokeAPI raw から外すと `moves.yaml` catalog が name に加えて威力/命中/PP/
  分類/タイプを持つ必要が生じ、`generate.ts` / 生成 `moves.ts` の構造・既存データ移行に波及する。具体スキーマは
  ADR で確定し、diff が過大なら「learnset ゲート撤去 + skill/rule 追従」と「技メタ SoT 移設」を 2 PR に分割する
  ことを許容する（[[planning]] の分割・OVERVIEW へ根拠記載）。
- **構造データとの線引き**: 「PokeAPI を使わない」のは Champions legality と技威力に限る。種族値・タイプ・特性・
  持ち物 category 等のレギュ非依存構造データは ADR 0012 の vendor 方式を維持する。grep 検証時にこの線引きで
  誤検出しないよう、構造データの正当な参照を除外する。
- **reversible な決定**: PokeAPI が Champions に正式対応したら本決定を見直せる。ADR の Consequences にこの
  見直し条件を明記し、将来 supersede しやすくする。
- **Phase 14 への前提**: 本 Phase 完了後、Phase 14（M-A 全量投入）は「learnset ∩ legal」ではなく **Serebii 第一
  優先の movepool 全量**を正として投入する（learnset 照合ゲートは存在しない）。Phase 14 doc はこの前提に追従済み。
- ADR 本文は可変 plan ファイル（phase doc / phase 番号 / OVERVIEW リンク）を参照しない（[[adr]]）。
