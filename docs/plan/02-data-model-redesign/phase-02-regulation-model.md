# Phase 2 — レギュレーションモデル再設計（per-reg YAML + period + per-reg 型 + A案型機構）

## 目的 / スコープ

レギュレーションの解禁情報を **1 レギュ = 1 YAML** に再構成し、**期間（開始必須・終了 nullable）**を持たせ、
**per-regulation の TS 型**（解禁 species / items / mega の集合 + メタdata）を**レギュレーションごとに別ファイル・
別型**で生成する。型レベル解禁判定の正本を per-regulation に一本化（**A案**）し、`SpeciesBase.regulations[]` を
廃止する。これが本計画群の核。

- スコープ内: `data/champions/regulations/*.yaml`（per-reg）への再構成、`RegulationBase` への `period` 追加、
  per-reg 型生成（`data/generated/regulations/*.ts` + `index.ts`）、`src/types/party.ts` の `ConstrainParty` /
  `NotLegalInRegulation` を per-reg 解禁集合参照へ付け替え、`SpeciesBase.regulations[]` 削除と参照箇所追従
  （CLI check-party / 型テスト）、ADR 起票。
- スコープ外: M-A の実データ拡充（Phase 3/4。ここでは既存少数種＋暫定値の構造移行のみ）。技の per-reg **型**生成
  （技は YAML に記録するが型生成しない方針）。

## 前提（依存）

- **Phase 1（カタログ分離）完了**。catalog が解禁エンティティの id を定義していること。
- 確定済み rule: [[type-conventions]]（XxxBase + Dex + Id・派生型）/ [[tsc-verification]]（検証は tsc のみ）/
  [[cli-and-io]] / [[data-pipeline]] / [[testing]]（カバレッジ100%）。ADR 0010 / 0012 / 0014。
- 設計判断（OVERVIEW 確定事項）: A案（per-reg 正本一本化）/ per-reg はレギュごと別ファイル別型 / period は
  `{ start; end: string | null }`。

## タスク

- [ ] `data/champions/regulation.yaml`（単一集約）を `data/champions/regulations/champions-m-a.yaml` /
      `champions-m-b.yaml`（1 レギュ = 1 ファイル）へ分割。各ファイルは:
  - [ ] `name: { en, ja }`
  - [ ] `period: { start: <ISO日付>, end: <ISO日付 | 空> }`（終了空＝開催中）
  - [ ] `allow: { species: [...], items: [...], mega: [...], moves: [...] }`（id はカタログ参照）
- [ ] `src/types/*` のレギュレーション型を更新:
  - [ ] `RegulationBase` に `period: { readonly start: string; readonly end: string | null }` を追加。
  - [ ] per-reg 解禁集合の親型（`species` / `items` / `mega` の readonly 配列）を定義。
- [ ] `scripts/generate.ts` を per-reg 生成へ改修:
  - [ ] `data/generated/regulations/<reg>.ts` をレギュごとに出力（name / period / 解禁集合 + 派生型）。
  - [ ] `data/generated/regulations/index.ts` で `RegulationId` 集約・re-export。
  - [ ] 解禁集合の id がカタログ（Phase 1）に存在することを生成段で検証（参照切れをエラー化）。
  - [ ] 旧 `data/generated/regulations.ts`（単一）を新構造へ置換。
- [ ] **A案の型機構付け替え**:
  - [ ] `data/generated/species.ts` から `regulations` フィールドを廃止（`SpeciesBase.regulations[]` 削除）。
  - [ ] `src/types/party.ts` の `ConstrainParty` / `NotLegalInRegulation` を per-reg 解禁集合（species）参照へ。
  - [ ] `src/cli/commands/check-party.ts` など `species.regulations` / `regulations.ts` 参照箇所を追従。
- [ ] テスト追従（コロケーション・カバレッジ100%維持）: party 型テスト・CLI テスト・生成検証。
- [ ] `adr-new` で ADR を起票（データ保持モデル再設計：解禁判定正本の per-reg 一本化 / カタログ分離 / period）。
      ADR 0012（vendor）/ 0014（lang）を踏まえ、必要なら supersede 関係を明記。
- [ ] `.claude/rules/data-pipeline.md` / 関連 rule を per-reg 構造へ追従更新。

## この Phase で育てるハーネス（rule・skill）

- `.claude/rules/data-pipeline.md`（per-reg 構造・period・解禁判定正本の更新）と、必要なら
  [[type-conventions]] の per-reg 型パターン追記。
- ADR 1 本（`adr-new`）。新規 skill なし。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- レギュレーションが per-reg YAML で管理され、`period`（開始必須・終了 nullable）を持ち TS 型として参照できる。
- per-reg 型（species / items / mega の解禁集合）がレギュごと別ファイルで生成される。
- `SpeciesBase.regulations[]` が廃止され、型レベル解禁判定（`ConstrainParty`）が per-reg 解禁集合を参照する。
- 解禁集合の id がカタログに存在しないとき生成段（または tsc）でエラーになる。
- 未解禁種族を含むパーティが型エラーになる回帰テストが緑（A案の判定が機能する証跡）。
- ADR が `docs/adr/` に起票されている。

## 検証手順

1. per-reg YAML を編集し `pnpm generate:data` で `data/generated/regulations/*.ts` が再生成されることを確認。
2. M-A に解禁されていない種族をパーティに入れた fixture で `tsc --noEmit`（または該当型テスト）が
   `NotLegalInRegulation` を出すことを確認（A案の解禁判定）。
3. `period.end` を空にしたレギュが TS 型上で `end: null` として参照できることを確認。
4. `pnpm verify` 緑を確認。

## リスク・備考

- **不可逆性が高い phase**: 型機構（party.ts）と生成構造を同時に変える。中途半端な状態で緑を割らないよう、
  per-reg 生成 → 型機構付け替え → テスト追従を 1 PR 内で完結させる。
- `SpeciesBase.regulations[]` 廃止は外部参照（index.ts の re-export 等）にも波及しうる。grep で洗う。
- per-reg 型の命名・export 形（例: `championsMA` / `RegulationMASpeciesId`）は実装時に確定し ADR/rule に記録する。
- 技を per-reg YAML に記録するが型生成しない方針の理由（種族の習得技で legality を見るため per-reg 技型は不要）を
  ADR / rule に明記し、後続の誤解を防ぐ。
- M-B は未公開のため、構造移行時の値は暫定プレースホルダを維持（正確なデータ投入はスコープ外・[[champions-regulation-data-placeholder]] の通り）。
