# Phase 7 — languages を全件名辞書化（未解禁含む全ポケモン・持ち物・技・特性）

> `languages/*.yaml`（名前 SoT）を **specs 連動（reg スコープ）から全件名辞書（reg 非依存・全国図鑑相当）へ**転換する phase。PokeAPI で全ポケモン・持ち物・技・特性の ja/en を**一度に**取り込み、以降は差分突き合わせで増分追加する。これにより per-reg 取得（Phase 8）から **ja gap ループが原則不要**になる。全件化は現行の bijection ゲートと衝突するため `generate.ts` の検証を緩和する（ADR 起票）。

## 目的 / スコープ

`data/languages/{species,items,moves,abilities,mega}.yaml` を、specs に載る分だけでなく **PokeAPI が持つ全件**（未解禁含む全ポケモン・持ち物・技・特性）で満たす。名前は reg 非依存の「名前辞書」として先行整備し、per-reg 取得や本投入のたびに ja/en を都度埋める必要をなくす。取得は **PokeAPI を第一に、無い分（メガ ja・タイプ名等）は Serebii 速報 / 手作業**で補い、**一度整えたら以降は差分（記録されていない新規 id）だけを突き合わせて追加**する運用にする。

- スコープ内:
  - `generate.ts` の `requireNames` を **双方向一致（bijection）→ specs ⊆ languages（各 spec に ja/en 完備・余剰 languages エントリは許容）** へ緩和。orphan（specs に無い languages エントリ）を許す。
  - `fetch-pokeapi.ts` を **全件列挙**（全国図鑑 / 全 item / 全 move / 全 ability を PokeAPI list から取得）+ species/items も **en を取得**（`requireNames` が en も要求するため）へ拡張。差分突き合わせ（未記録 id のみ追加）を含める。
  - `update-catalog` skill を「ja backfill 専任」から **「全件名辞書の初回整備 + 差分追加 + languages/*.yaml scaffold」** へ改訂（skill 責務拡張・`skill-creator` 利用）。languages ファイル骨格（空 map）の作成もここが担う（[[data-pipeline]] のスキャフォールド穴を解消）。
  - `data/languages/*.yaml` を全件で更新（大量データ・block スタイル）。メガ ja・タイプ名 ja 等 PokeAPI 非存在分は Serebii 速報 / 手入力で補完。
  - **ADR 起票**（`adr-new`・次番 0041 目安）: ADR 0035 の「name SoT = specs と id 集合一致」不変条件を **refine**（languages を全件辞書へ・generate ゲートを superset 判定へ）。
- スコープ外: per-reg 構造 / 解禁データの取得（Phase 8 `author-regulation-data` の責務）。静的データ（`rules.yaml` / `type-specs.yaml` = Phase 6）。ただし `languages/types.yaml`（タイプ名）は 18 件固定ゆえ本 phase の全件整備に含めるか Phase 6 に残すかは実装時に確定（重複著述を避ける）。`showdown:types` 抽出の新設（OVERVIEW スコープ外の維持）。

## 前提（依存）

- **Phase 1-5 完了**: showdown 経路 / PokeAPI ja 専任（`fetch:ja-names` / `sync:ja-names` = `fetch-pokeapi.ts` / `materialize.ts`）/ Serebii 速報 / `verify-showdown-pr`。
- 確定済み rule: [[data-pipeline]]（名前 SoT = languages・append/既存尊重）/ [[type-conventions]]（`XxxId = keyof XxxDex`）/ [[testing]]（純関数カバレッジ100%）。ADR 0035（name SoT・本 phase で refine）。

## タスク

- [ ] **generate ゲート緩和**: `scripts/generate.ts` の `requireNames` を「各 spec id に ja/en 完備」だけ課し、`orphan name ids without spec` の throw を撤去（specs ⊆ languages を許容）。既存テスト（あれば codegen 側純関数）を追従し、緩和後も「spec に名前が無い / ja・en 欠け」は従来どおり非0終了することを担保。
- [ ] **fetch-pokeapi 全件化**: PokeAPI の list endpoint（`pokemon-species` / `item` / `move` / `ability`）を列挙して全 id を raw 取得。species/items も en を抽出（`jaOnly` → ja+en）。既存の「languages 既存エントリ走査」は差分突き合わせ（未記録 id の追加）として残す。
- [ ] **update-catalog 改訂**: skill 責務を全件名辞書の初回整備 + 差分追加 + languages scaffold へ拡張（`skill-creator`・description trigger も追従・canonical + symlink パリティ・[[cross-agent]] / [[skill-authoring]]）。メガ ja / タイプ名 ja の Serebii / 手入力補完手順を含める。
- [ ] **全件投入**: `fetch:ja-names`（全件）→ `sync:ja-names` → 残余（メガ ja 等）を Serebii / 手入力で補完 → `check:yaml-style` / `generate:data` / `pnpm verify` 緑。
- [ ] **ADR 起票**: `adr-new` で ADR 0035 を refine する新 ADR（languages 全件辞書化・generate superset 判定）。
- [ ] [[data-pipeline]] に languages = 全件名辞書（reg 非依存）である旨と scaffold 責務（update-catalog）を追記。

## この Phase で育てるハーネス（rule・skill）

- **skill 改訂**: `update-catalog`（全件名辞書化・scaffold・差分追加）。
- **rule 追記**: [[data-pipeline]]（languages = 全件辞書・generate superset 判定・scaffold 責務）。
- **ADR**: ADR 0035 refine（新 ADR）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome / yaml-style）が緑。
- `data/languages/{species,items,moves,abilities,mega}.yaml` が PokeAPI 由来の全件（未解禁含む）で満たされ、各エントリに ja/en が揃う（メガ ja 等は Serebii / 手入力補完済み）。
- `generate.ts` が **languages ⊋ specs（余剰 languages エントリあり）でも 0 終了**し、`orphan name ids without spec` を出さない。一方で spec に名前が無い / ja・en 欠けは従来どおり非0終了する。
- `fetch:ja-names` を再実行しても、記録済み id はスキップし未記録 id のみ追加される（差分突き合わせ・冪等）。
- `update-catalog` の canonical / symlink パリティ（[[cross-agent]]）。`description` は文字数 ≤1024。

## 検証手順

1. `data/languages/species.yaml` のエントリ数が specs roster 数より十分大きい（全国図鑑相当）ことを確認。任意の未解禁種族（例: どの reg roster にも無い id）に ja/en が入っていることをスポット確認。
2. 一時的に specs に無い languages エントリを足して `generate:data` が 0 終了することを確認（orphan 許容）。逆に spec に名前を欠く状態が非0終了することも確認（保護は維持）。
3. `fetch:ja-names` 再実行で未記録 id のみ取得される（既存はスキップ）ことをログで確認。
4. 新 ADR が `docs/adr/` に採番され、ADR 0035 の status / 参照が追従されている（[[adr]]）。
5. `pnpm verify` 緑。

## リスク・備考

- **generate 不変条件の緩和**: plan 10 の「検証機構は不変」という安全弁の**限定的な例外**。orphan 許容は「languages を全件辞書にする」意図的な設計変更で、ADR で根拠を残す。緩和は orphan チェックのみで、「spec に名前必須 / ja・en 完備」の保護は維持する（過剰緩和しない）。
- **大量データ PR**: 全国図鑑相当の languages 全件は >1000 行になりうる。名前データは意味ある粒度分割が難しいため 1 PR 許容（[[planning]] 6 基準⑤ の例外）。ただし generate/fetch の src 変更（レビュー対象）とは PR を分けるか、src を先行 phase 化するかは着手時に判断（skill/src とデータの混在を避ける）。
- **PokeAPI 非存在**: メガ形態名 ja・タイプ名 ja は PokeAPI に無く、Serebii 速報 / 手入力で一度だけ補完する（以降は差分のみ）。en はメガ = showdown、その他 = PokeAPI。
- 独立レビューは src 変更 = `code-review`、skill / rule / ADR = `harness-review`。
