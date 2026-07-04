# Phase 6 — 全件名辞書 author-static-data（update-catalog リネーム）+ PokeAPI カタログ workflow

> `languages/*.yaml`（reg 非依存の名前）を **PokeAPI 由来の全件**（未解禁含む全ポケモン・持ち物・技・特性・タイプ名）で満たす仕組みを整える phase。`update-catalog` skill を **`author-static-data` へリネーム**し、`author-regulation-data`（reg 依存の解禁データ）と対になる「reg 非依存の静的な名前辞書」担当にする。取得 + 整形 + 書き込み + PR 作成は **GitHub Actions**（新 workflow・`showdown-sync.yml` と同型）で実行し、PokeAPI 等で取れない分（メガ ja 等）は **PR への手作業追加 commit** で補う。

## 目的 / スコープ

`data/languages/{species,items,moves,abilities,mega,types}.yaml`（名前 SoT）を、specs 連動ではなく **reg 非依存の全件名辞書**として整備する。成果物は **担当 YAML の作成 / データ更新 PR**。以降は差分（未記録 id）だけを突き合わせて増分追加する。これにより per-reg 取得（Phase 7）から ja gap ループが原則消える。

- スコープ内:
  - **新 GitHub Actions workflow**（仮称 `pokeapi-catalog.yml`・`workflow_dispatch`）: 外部情報源（PokeAPI）から**取得 → 整形 → `languages/*.yaml` 書き込み → `check:yaml-style` / `generate:data` / `pnpm verify` → PR 作成**まで実行する（`showdown-sync.yml` / `serebii-bulletin.yml` と同型・data ラベル付き PR）。
  - **`update-catalog` → `author-static-data` リネーム**（canonical + `.agents/skills` symlink + inbound 参照 + description trigger を同一 PR で追従・[[cross-agent]] / [[skill-authoring]]）。skill 責務 = workflow を dispatch → 生成 PR をドライブ → **PokeAPI 非存在分（メガ ja 等）を PR へ手作業追加 commit** → verify → merge。`languages/*.yaml` の空骨格 scaffold もここが担う。
  - `fetch-pokeapi.ts` を **全件列挙**（PokeAPI list endpoint で全 species/items/moves/abilities/types を取得）+ species/items も **en 取得**（`requireNames` が en も要求）へ拡張。既存の「languages 既存エントリ走査」は**差分突き合わせ**（未記録 id のみ追加）として残す。
  - `generate.ts` の `requireNames` を **bijection → specs ⊆ languages（各 spec に ja/en 完備・余剰 languages エントリは許容）** へ緩和（orphan チェック撤去・「spec に名前必須 / ja・en 完備」の保護は維持）。
  - **ADR 起票**（`adr-new`・次番 0041 目安）: ADR 0035 の「name SoT = specs と id 集合一致」不変条件を **refine**（languages 全件辞書化・generate superset 判定・PokeAPI カタログ workflow）。
  - `data/languages/*.yaml` を全件で更新（大量データ・block スタイル）。メガ ja・タイプ名 ja 等 PokeAPI 非存在分は手作業 commit で補完。
- スコープ外:
  - **`rules.yaml` / `type-specs.yaml`**（能力ポイント定数・タイプ相性表）: 変更頻度が極小の静的コミットファイルとし、**いずれの skill/workflow も自動更新しない**（必要時のみ手編集）。`generate` の前提としてコミット済みで存在する。
  - per-reg 解禁データ取得（Phase 7 `author-regulation-data`）。`languages/regulations.yaml`（per-reg 名・Phase 7）。メガ en（showdown 由来・per-reg 取得）。本投入（Phase 8）。`showdown:types` 抽出の新設（OVERVIEW スコープ外の維持）。

## 前提（依存）

- **Phase 1-5 完了**: showdown 経路 / PokeAPI ja 専任（`fetch-pokeapi.ts` / `materialize.ts`）/ Serebii 速報 / `verify-showdown-pr`。既存 `update-catalog` skill が実在。
- `rules.yaml` / `type-specs.yaml` がコミット済みで存在（`generate:data` の前提・本 phase では触らない）。
- 確定済み rule: [[data-pipeline]]（名前 SoT = languages・append/既存尊重）/ [[type-conventions]] / [[testing]]。ADR 0035（name SoT・本 phase で refine）/ ADR 0039（取得は GitHub Actions）。

## タスク

- [ ] **PokeAPI カタログ workflow 新設**: `.github/workflows/pokeapi-catalog.yml`（`workflow_dispatch`）を追加。PokeAPI 全件取得（`fetch:ja-names` 全件版）→ `sync:ja-names` 整形 → `languages/*.yaml` 書き込み → `check:yaml-style` / `generate:data` / `pnpm verify` → `create-pull-request`（data ラベル）。権限・redaction は既存 workflow に準拠（[[cross-agent]] / redaction）。
- [ ] **`fetch-pokeapi.ts` 全件化**: list endpoint 列挙で全 id を raw 取得。species/items も en を抽出（`jaOnly` → ja+en）。types を DATASETS に追加。既存エントリ走査は差分突き合わせ（未記録 id 追加）として残す。
- [ ] **`generate.ts` ゲート緩和**: `requireNames` から `orphan name ids without spec` の throw を撤去（specs ⊆ languages 許容）。「spec に名前が無い / ja・en 欠け」は従来どおり非0終了することを担保（純関数化してあればテスト追従・カバレッジ100%）。
- [ ] **`update-catalog` → `author-static-data` リネーム**: skill dir / symlink / description trigger / inbound 参照（rule / 他 skill / AGENTS / docs）を同一 PR で追従（`skill-creator`・[[skill-authoring]] / [[cross-agent]]）。責務を「全件名辞書の初回整備 + 差分追加 + scaffold + workflow dispatch + 手作業 gap commit + PR ドライブ」へ拡張。
- [ ] **手作業 gap 手順**: PokeAPI 非存在（メガ ja・必要ならタイプ ja の一部等）を **PR への追加 commit** で手入力する手順を skill 本文に明記（block スタイル・`check:yaml-style` 通過）。
- [ ] **ADR 起票**: `adr-new` で ADR 0035 を refine（languages 全件辞書・generate superset・PokeAPI カタログ workflow）。旧 ADR の status / 参照追従（[[adr]]）。
- [ ] [[data-pipeline]] 追記: languages = 全件名辞書（reg 非依存）/ generate superset 判定 / PokeAPI カタログ workflow / scaffold 責務 / `rules.yaml`・`type-specs.yaml` は自動化対象外の静的コミット、を反映。

## この Phase で育てるハーネス（rule・skill・workflow）

- **新設 workflow**: `pokeapi-catalog.yml`（PokeAPI 全件 → 整形 → languages 書き込み → PR）。
- **skill リネーム + 責務拡張**: `update-catalog` → `author-static-data`（canonical + symlink・`skill-creator`）。
- **rule 追記**: [[data-pipeline]]。**ADR**: ADR 0035 refine（新 ADR）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome / yaml-style）が緑。
- `pokeapi-catalog.yml` を `workflow_dispatch` で実行すると `languages/*.yaml` を全件更新する PR が立ち、CI（`pnpm verify`）が緑。
- `data/languages/{species,items,moves,abilities,mega,types}.yaml` が PokeAPI 由来の全件（未解禁含む）で満たされ、各エントリに ja/en が揃う（メガ ja 等は手作業 commit 済み）。
- `generate.ts` が **languages ⊋ specs（orphan あり）でも 0 終了**し、`orphan name ids without spec` を出さない。一方で spec に名前が無い / ja・en 欠けは従来どおり非0終了する。
- `fetch:ja-names` 再実行で記録済み id をスキップし未記録 id のみ追加する（差分・冪等）。
- skill が `update-catalog` → `author-static-data` にリネームされ、canonical / symlink パリティ + inbound 参照追従（dangling ゼロ）。`description` は文字数 ≤1024。
- `rules.yaml` / `type-specs.yaml` に変更が無い（本 phase の非対象）。

## 検証手順

1. `pokeapi-catalog.yml` を dispatch → languages 全件 PR が立ち、`species.yaml` のエントリ数が specs roster より十分大きい（全国図鑑相当）ことを確認。未解禁種族に ja/en が入っていることをスポット確認。
2. メガ形態など PokeAPI 非存在エントリに ja が無い状態を、PR への手作業 commit で埋められる（`check:yaml-style` 通過）ことを確認。
3. specs に無い languages エントリがある状態で `generate:data` が 0 終了（orphan 許容）、逆に spec の名前欠落は非0終了することを確認。
4. `git grep update-catalog` が 0（リネーム inbound 追従）、`.agents/skills/author-static-data` が相対 symlink で canonical を指すことを確認。
5. 新 ADR が採番され ADR 0035 の status / 参照が追従されていることを確認（[[adr]]）。
6. `pnpm verify` 緑。

## リスク・備考

- **generate 不変条件の緩和**: plan 10 の「検証機構は不変」安全弁の**限定的な例外**。orphan 許容は「languages を全件辞書にする」意図的設計変更で ADR に根拠を残す。緩和は orphan チェックのみ（過剰緩和しない）。
- **大量データ PR**: 全国図鑑相当の languages 全件は >1000 行になりうる。名前データは意味ある粒度分割が難しく 1 PR 許容（[[planning]] 6 基準⑤ の例外）。ただし **src 変更（fetch/generate）+ workflow + skill リネーム（レビュー対象）とデータ書き込み PR は分ける**（workflow が生成するデータ PR は別 PR）。
- **PokeAPI 非存在**: メガ形態名 ja・（必要なら）一部タイプ ja は PokeAPI に無く、**PR への手作業追加 commit** で一度だけ補完する（以降は差分のみ）。メガ en は showdown（Phase 7 の per-reg 取得）。
- **`rules.yaml` / `type-specs.yaml` は自動復元されない**: 本 phase で自動化しないため、`data/` を完全削除した場合この 2 ファイルは手作業で復元する必要がある（変更頻度極小ゆえ許容・[[data-pipeline]] に明記）。
- 独立レビュー: src（fetch/generate）+ workflow + skill リネーム = `code-review` / `harness-review`、生成データ PR = `pokemon-data-reviewer`。
