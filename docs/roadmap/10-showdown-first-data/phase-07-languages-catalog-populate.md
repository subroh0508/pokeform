# Phase 7 — languages 全件名辞書の初回投入（author-static-data 実行）

> Phase 6 で用意した基盤（`pokeapi-catalog.yml` workflow + `author-static-data` skill + `generate.ts` superset 緩和）を使い、`languages/*.yaml` を **PokeAPI 由来の全件**（未解禁含む全ポケモン・持ち物・技・特性・タイプ名）で**初回投入**する phase。基盤（Phase 6・code-review/harness-review 対象）とデータ投入（本 phase・pokemon-data-reviewer 対象）を分離する。

## 目的 / スコープ

`author-static-data` skill を実行して `pokeapi-catalog.yml` を dispatch し、全件名辞書データを投入する。PokeAPI で取れない分（メガ ja 等）は生成 PR への**手作業追加 commit** で補い、`generate:data` / `pnpm verify` 緑まで仕上げてマージする。以降のレギュ追加時は差分（未記録 id）だけを本 skill が突き合わせて追加する運用にする。

- スコープ内: `author-static-data` skill 実行（`pokeapi-catalog.yml` dispatch → 全件 languages PR）、PokeAPI 非存在分の手作業 gap commit、`pokemon-data-reviewer` レビュー、マージ。以降の差分追加運用の確立。
- スコープ外: 基盤（workflow / fetch / generate / skill）の新設（Phase 6 で確定）。`languages/mega.yaml` の名前投入（en=showdown・Phase 8 / ja=手作業）。per-reg 解禁データ・`regulations.yaml`（Phase 8）。`rules.yaml`・`type-specs.yaml`（静的コミット）。

## 前提（依存）

- **Phase 6 完了**: `pokeapi-catalog.yml` workflow / `fetch-pokeapi` 全件化 / `generate.ts` superset 緩和 / `update-catalog`→`author-static-data` リネーム / ADR が揃っている（[phase-06](./phase-06-author-static-data.md)）。
- `rules.yaml` / `type-specs.yaml` がコミット済みで存在（`generate:data` の前提）。

## タスク

- [ ] **全件投入 PR 作成**: `author-static-data` skill 実行 → `pokeapi-catalog.yml` を dispatch → `languages/{species,items,moves,abilities,types}.yaml` を PokeAPI 全件で満たす data PR を生成。
- [ ] **手作業 gap 補完**: PokeAPI 非存在（メガ ja 等・必要なら一部）を PR への追加 commit で手入力（block スタイル・`check:yaml-style` 通過）。mega.yaml は本 phase では en が未投入（Phase 8 で showdown 由来）ゆえ、mega の名前完備は Phase 8 完了時点で担保する。
- [ ] **検証 + レビュー**: `generate:data` が languages ⊋ specs（orphan 許容）で 0 終了 → `pnpm verify` 緑 → `pokemon-data-reviewer` レビュー（名前の妥当性・欠落）→ マージ。
- [ ] [[champions-regulation-data-placeholder]] 等、名前辞書が全件化された旨を関連メモリ/doc に反映（必要時）。

## この Phase で育てるハーネス（rule・skill）

- なし（Phase 6 で確定した基盤・skill を**実行**するデータ投入 phase）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome / yaml-style）が緑。
- `data/languages/{species,items,moves,abilities,types}.yaml` が PokeAPI 由来の全件（未解禁含む）で満たされ、各エントリに ja/en が揃う（PokeAPI 非存在分は手作業 commit 済み）。
- `generate.ts` が languages ⊋ specs でも 0 終了し、`src/generated/languages/*.ts` に全件が反映される。
- `pokemon-data-reviewer` のレビューで名前（ja/en）の重大な誤り・欠落が無い。
- `mega.yaml` は本 phase では名前未完備でも可（en=Phase 8・ja=手作業）だが、generate を落とさない（specs 側にメガ spec が無ければ mega 名も不要 = orphan 許容 / メガ spec があれば名前必須）。

## 検証手順

1. 投入後 `data/languages/species.yaml` のエントリ数が specs roster より十分大きい（全国図鑑相当）ことを確認。任意の未解禁種族に ja/en が入っていることをスポット確認。
2. `generate:data` 0 終了 + `src/generated/languages/species.ts` に全件が出ることを確認。
3. `pnpm verify` 緑。
4. `pokemon-data-reviewer` の指摘を解消。

## リスク・備考

- **生成物の肥大**: 全件投入で `src/generated/languages/*.ts` が全国図鑑規模になる（未解禁名も emit）。X 方針の帰結として許容。差分レビューは名前の妥当性に集中し、件数の大きさ自体は仕様通りとして扱う。
- **PokeAPI 非存在**: メガ ja 等は PR への手作業 commit で一度だけ補完（以降は差分のみ）。mega en は Phase 8（showdown）で埋まる。
- **大量データ PR**: 名前データは意味ある粒度分割が難しく 1 PR 許容（[[planning]] 6 基準⑤ の例外）。基盤（Phase 6）と分離済みゆえ本 phase の PR はデータのみ。
- 独立レビューは `pokemon-data-reviewer`（生成/手動データの妥当性）。
