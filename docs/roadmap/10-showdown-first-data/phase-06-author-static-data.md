# Phase 6 — 全件名辞書の基盤（author-static-data リネーム + PokeAPI 名前取得 workflow + generate 緩和）

> `languages/*.yaml`（reg 非依存の名前）を **PokeAPI 由来の全件**で満たすための**基盤**（workflow + src + skill リネーム + generate 緩和 + ADR）を整える phase。実データの全件投入は Phase 7 が本 workflow を実行して行う（基盤とデータ投入を分離し、`code-review`/`harness-review` 対象と `pokemon-data-reviewer` 対象の PR を分ける）。`update-catalog` skill を **`author-static-data` へリネーム**し、`author-regulation-data`（reg 依存の解禁データ）と対になる「reg 非依存の名前辞書」担当にする。

## 目的 / スコープ

PokeAPI から**全件名**（未解禁含む全ポケモン・持ち物・技・特性・タイプ名）を取得 → 整形 → `languages/*.yaml` 書き込み → PR 作成する仕組みを **GitHub Actions**（新 workflow・`showdown-sync.yml` と同型）として用意し、`generate.ts` を全件辞書（languages ⊋ specs）に耐える検証へ緩める。本 phase は**仕組みの新設まで**で、全件データの投入は Phase 7。

- スコープ内:
  - **新 GitHub Actions workflow**（仮称 `pokeapi-names.yml`・`workflow_dispatch`）: PokeAPI から**取得 → 整形 → `languages/*.yaml` 書き込み → `check:yaml-style` / `generate:data` / `pnpm verify` → PR 作成**まで実行（`showdown-sync.yml` / `serebii-bulletin.yml` と同型・data ラベル付き PR）。
  - `fetch-pokeapi.ts` を **全件列挙**（PokeAPI list endpoint で全 species/items/moves/abilities/types を取得）+ species/items も **en 取得**（`requireNames` が en も要求）へ拡張。既存の「languages 既存エントリ走査」は**差分突き合わせ**（未記録 id のみ追加）として残す。
  - `generate.ts` の `requireNames` を **bijection → specs ⊆ languages（各 spec に ja/en 完備・余剰 languages エントリは許容）** へ緩和（orphan チェック撤去・「spec に名前必須 / ja・en 完備」の保護は維持）。
  - **`update-catalog` → `author-static-data` リネーム**（canonical + `.agents/skills` symlink + inbound 参照 + description trigger を同一 PR で追従・[[cross-agent]] / [[skill-authoring]]）。skill 責務 = workflow を dispatch → 生成 PR をドライブ → **PokeAPI 非存在分（メガ ja 等）を PR へ手作業追加 commit** → verify → merge。`languages/*.yaml` の空骨格 scaffold（**mega.yaml 含む**）もここが担う。
  - **ADR 起票**（`adr-new`・次番 0041 目安）: ADR 0035 の「name SoT = specs と id 集合一致」不変条件を **refine**（languages 全件辞書化・generate superset 判定・PokeAPI 名前取得 workflow）。
  - [[data-pipeline]] 追記: languages = 全件名辞書（reg 非依存）/ generate superset 判定 / PokeAPI 名前取得 workflow / scaffold 責務 / 名前の取得元分担（下記）/ `rules.yaml`・`type-specs.yaml` は自動化対象外の静的コミット。
- スコープ外:
  - **全件データの実投入**（Phase 7 が本 workflow を実行）。
  - **`languages/mega.yaml` の名前投入**: （当時）mega は PokeAPI のカテゴリに無く全件取得の対象外とし、mega en は showdown（per-reg 取得 = Phase 8）・mega ja は手作業とした。本 phase は mega.yaml の空骨格 scaffold のみ担い、名前は埋めない。
    - **> supersede 追補（issue #215 / ADR 0043）**: mega 名は PokeAPI `pokemon-form` の `form_names`（ja/en）から取得する経路へ一本化され、showdown の mega 名取得ルート（`sync-showdown` の en 書き込み）は削除された。現行 SoT は [[data-pipeline]] の名前取得元分担表（mega = PokeAPI）と [author-static-data](../../../.claude/skills/author-static-data/SKILL.md)（mega 名も担当）。
  - **`rules.yaml` / `type-specs.yaml`**（能力ポイント定数・タイプ相性表）: 変更頻度が極小の静的コミットファイルとし、いずれの skill/workflow も自動更新しない（必要時のみ手編集）。`generate` の前提としてコミット済みで存在する。
  - per-reg 解禁データ取得（Phase 8）。`languages/regulations.yaml`（per-reg 名・Phase 8）。`showdown:types` 抽出の新設（OVERVIEW スコープ外の維持）。

## 名前の取得元分担（本 phase で [[data-pipeline]] に明記する）

| languages ファイル | 取得元 | 担当 |
|---|---|---|
| `species` / `items` / `moves` / `abilities` / `types`.yaml | **PokeAPI 全件**（ja/en） | 本 phase の workflow / author-static-data（Phase 7 で投入） |
| `mega.yaml` | ~~en = showdown / ja = 手作業~~ → **PokeAPI（pokemon-form form_names・ja/en）**（issue #215 / ADR 0043 で変更） | ~~per-reg 取得 + 手入力~~ → author-static-data（PokeAPI 6 種目） |
| `regulations.yaml` | skill 著述（命名規約） | author-regulation-data（Phase 8・per-reg） |

## 前提（依存）

- **Phase 1-5 完了**: showdown 経路 / PokeAPI ja 専任（`fetch-pokeapi.ts` / `materialize.ts`）/ Serebii 速報 / `verify-showdown-pr`。既存 `update-catalog` skill が実在。
- `rules.yaml` / `type-specs.yaml` がコミット済みで存在（`generate:data` の前提・本 phase では触らない）。
- 確定済み rule: [[data-pipeline]]（名前 SoT = languages・append/既存尊重）/ [[type-conventions]] / [[testing]]。ADR 0035（name SoT・本 phase で refine）/ ADR 0039（取得は GitHub Actions）。

## タスク

- [ ] **PokeAPI 名前取得 workflow 新設**: `.github/workflows/pokeapi-names.yml`（`workflow_dispatch`）を追加。PokeAPI 全件取得 → `sync:ja-names` 整形 → `languages/*.yaml` 書き込み → `check:yaml-style` / `generate:data` / `pnpm verify` → `create-pull-request`（data ラベル）。権限・redaction は既存 workflow に準拠（[[cross-agent]] / redaction）。
- [ ] **`fetch-pokeapi.ts` 全件化**: list endpoint 列挙で全 id を raw 取得。species/items も en を抽出（`jaOnly` → ja+en）。types を DATASETS に追加（**mega は対象外**）。既存エントリ走査は差分突き合わせ（未記録 id 追加）として残す。
- [ ] **`generate.ts` ゲート緩和**: `requireNames` から `orphan name ids without spec` の throw を撤去（specs ⊆ languages 許容）。「spec に名前が無い / ja・en 欠け」は従来どおり非0終了することを担保（純関数化してあればテスト追従・カバレッジ100%）。
- [ ] **`update-catalog` → `author-static-data` リネーム**: skill dir / symlink / description trigger / inbound 参照（rule / 他 skill / AGENTS / docs）を同一 PR で追従（`skill-creator`・[[skill-authoring]] / [[cross-agent]]）。責務を「全件名辞書の整備 + 差分追加 + scaffold + workflow dispatch + 手作業 gap commit + PR ドライブ」へ拡張。
- [ ] **手作業 gap 手順**: PokeAPI 非存在（メガ ja 等）を **PR への追加 commit** で手入力する手順を skill 本文に明記（block スタイル・`check:yaml-style` 通過）。
- [ ] **ADR 起票**: `adr-new` で ADR 0035 を refine（languages 全件辞書・generate superset・PokeAPI 名前取得 workflow）。旧 ADR の status / 参照追従（[[adr]]）。
- [ ] [[data-pipeline]] 追記（上記「名前の取得元分担」表を含む）。

## この Phase で育てるハーネス（rule・skill・workflow）

- **新設 workflow**: `pokeapi-names.yml`（PokeAPI 全件 → 整形 → languages 書き込み → PR）。
- **skill リネーム + 責務拡張**: `update-catalog` → `author-static-data`（canonical + symlink・`skill-creator`）。
- **rule 追記**: [[data-pipeline]]。**ADR**: ADR 0035 refine（新 ADR）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome / yaml-style）が緑。
- `pokeapi-names.yml` を `workflow_dispatch` で実行すると `languages/*.yaml`（mega 除く）を更新する PR が立ち、CI（`pnpm verify`）が緑（**本 phase は仕組み検証まで・全件投入は Phase 7**）。
- `generate.ts` が **languages ⊋ specs（orphan あり）でも 0 終了**し、`orphan name ids without spec` を出さない。一方で spec に名前が無い / ja・en 欠けは従来どおり非0終了する。
- `fetch:ja-names` 再実行で記録済み id をスキップし未記録 id のみ追加する（差分・冪等）。
- skill が `update-catalog` → `author-static-data` にリネームされ、canonical / symlink パリティ + inbound 参照追従（dangling ゼロ）。`description` は文字数 ≤1024。
- `rules.yaml` / `type-specs.yaml` に変更が無い（本 phase の非対象）。

## 検証手順

1. `pokeapi-names.yml` を dispatch → 少数の未解禁エントリで languages 更新 PR が立ち `pnpm verify` 緑になることを確認（全件投入は Phase 7 で行う）。
2. specs に無い languages エントリがある状態で `generate:data` が 0 終了（orphan 許容）、逆に spec の名前欠落は非0終了することを確認。
3. `fetch:ja-names` 再実行で未記録 id のみ取得される（差分）ことをログで確認。
4. `git grep update-catalog` が 0（リネーム inbound 追従）、`.agents/skills/author-static-data` が相対 symlink で canonical を指すことを確認。
5. 新 ADR が採番され ADR 0035 の status / 参照が追従されていることを確認（[[adr]]）。
6. `pnpm verify` 緑。

## リスク・備考

- **generate 不変条件の緩和**: plan 10 の「検証機構は不変」安全弁の**限定的な例外**。orphan 許容は「languages を全件辞書にする」意図的設計変更で ADR に根拠を残す。緩和は orphan チェックのみ（過剰緩和しない）。
- **生成物の肥大**: 全件 languages を Phase 7 で投入すると `src/generated/languages/*.ts` が**全国図鑑規模**（未解禁名も emit）に膨らむ。X 方針（全件を languages 本体に持つ）の帰結として許容するが、生成バンドルのサイズ増・差分ノイズを Phase 7 の受け入れで意識する。
- **mega の分担**: `languages/mega.yaml` は PokeAPI 全件の対象外（en=showdown / ja=手作業）。本 phase は scaffold のみで名前は埋めない（上記「取得元分担」表）。
- **`rules.yaml` / `type-specs.yaml` は自動復元されない**: 本 phase で自動化しないため、`data/` を完全削除した場合この 2 ファイルは手作業で復元する（変更頻度極小ゆえ許容・[[data-pipeline]] に明記・Phase 8 前提ゲートで存在チェック）。
- 独立レビュー: src（fetch/generate）+ workflow + skill リネーム = `code-review` / `harness-review`（本 phase）。
