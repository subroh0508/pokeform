---
id: 0041
status: Accepted
date: 2026-07-05
---

# 0041. languages を reg 非依存の全件名辞書化し generate の名前突き合わせを superset へ緩める（ADR 0035 の id 集合一致不変条件を refine）

## Context

[ADR 0035](./0035-specs-languages-layout-redesign.md) は名前 SoT を `data/languages/*.yaml` に一本化し、
`generate.ts` が **languages の id 集合 = specs の id 集合（bijection）** を生成段で強制する不変条件を敷いた
（spec に名前が無い / ja・en 欠けだけでなく、**spec を持たない余剰 languages 名（orphan）も非0終了**で弾く）。
これは「名前と構造が 1:1 で対応する」ことを担保し、投入初期の記入漏れ・書き過ぎを検出する安全弁だった。

plan 10 で取得元を pokemon-showdown（構造・解禁の正）+ Serebii（速報）+ PokeAPI（名前）に整理した結果、
**名前だけは reg / 構造から独立した「全件辞書」として持ちたい**要件が明確になった。理由は 3 つ:

- **名前は reg 非依存**。未解禁のポケモン・技・持ち物・特性・タイプにも名前は存在し、per-reg 解禁のたびに
  名前を追記するのは取得元（PokeAPI 全件）の性質と噛み合わない（PokeAPI は全国規模を一括で持つ）。
- **per-reg 取得の ja gap を原則消す**。解禁データ（showdown / Serebii）は ja を持たず、解禁のたびに名前欠落が
  発生していた。名前を先に全件で満たしておけば、解禁取得は構造・legality に専念でき名前欠落が起きない。
- **bijection は全件辞書と両立しない**。全件名を languages に置くと、まだ spec 化されていない未解禁エンティティの
  名前が必ず orphan として現れる。bijection のままだと全件辞書が生成段で弾かれてしまう。

ADR 0035 の**中核決定（構造 / 名前 / 解禁の 3 軸直交・名前 SoT = languages・skill-authored が SoT で generate は
raw 非依存の変換専任）は正しく、本 ADR でも不変**である。本 ADR が見直すのは、その中核から派生した
**「id 集合一致（bijection）」という生成段の強制条件だけ**である。plan 10 の「検証機構は取得元非依存で不変」
安全弁（ADR 0039）に対する**限定的な例外**として、緩和を orphan チェックのみに絞ることをここで確定する。

## Decision

**languages を reg 非依存の全件名辞書とし、`generate.ts` の名前突き合わせを bijection から
superset（specs ⊆ languages）へ緩める。あわせて PokeAPI から全件名（ja/en）を取得する GitHub Actions
workflow を新設する。**

- **languages = 全件名辞書**: `data/languages/{species,items,moves,abilities,types}.yaml` は未解禁を含む
  **全件の名前（ja/en）**を持つ。`mega` は PokeAPI のカテゴリに無いため全件取得の対象外で、en=showdown /
  ja=手作業で補う（取得元分担の詳細は [[data-pipeline]] の「名前の取得元分担」表）。
- **generate superset 判定**: `requireNames` は **各 spec が languages に名前を持つ / ja・en 完備**だけを保護し、
  **spec を持たない余剰 languages 名（orphan）は 0 終了で許容**する。緩めるのは orphan チェックのみで、spec の
  名前欠落・ja・en 欠けは従来どおり非0終了で弾く（過剰緩和しない）。実装 SoT は `scripts/generate.ts`。
- **PokeAPI 名前取得 workflow**: `.github/workflows/pokeapi-names.yml`（`workflow_dispatch`・reg 非依存ゆえ
  regulation 入力なし）が PokeAPI list endpoint で全 id を列挙し、`fetch:ja-names`（未記録 / 欠落 id のみ
  best-effort 取得・差分・冪等）→ `sync:ja-names`（raw → languages へ ja/en を append/既存尊重転記）→
  `check:yaml-style` / `generate:data` / `verify` → `data:names` ラベルの languages 更新 PR、までを回す。
  `showdown-sync.yml`（正）/ `serebii-bulletin.yml`（速報）と同型。手順は `author-static-data` skill が担う。

これにより ADR 0035 の**「name SoT = specs と id 集合一致（bijection）」不変条件を superset へ refine**する
（中核の 3 軸直交・名前 SoT = languages・raw 非依存は不変）。仕様の詳細（取得元分担・generate 判定・workflow）は
[[data-pipeline]] を正本とし、本 ADR は「なぜ」を記録する。ADR 0035 は中核決定が生きているため **Accepted の
まま**（supersede しない・archive しない）で、本 ADR がその派生不変条件のみを上書きする。

## Consequences

- **良い点**:
  - 名前が reg / 構造から独立した全件辞書になり、per-reg 解禁取得の ja gap が原則消える（解禁取得は構造・
    legality に専念できる）。名前の取得元（PokeAPI 全件）の性質と layout が噛み合う。
  - 全件名の取得 + 転記 + PR が `pokeapi-names.yml` で機械化され、再実行は差分（未記録 id）だけを追加する
    （冪等・決定論）。人手の記入漏れ・非決定が排除される。
- **悪い点 / コスト**:
  - orphan チェックを失うことで「languages に書いたが spec に無い名前」の記入ミスを生成段で検出できなくなる
    （superset は許容が広い）。ただし全件辞書という設計上 orphan は正常状態で、検出対象にする方が誤り。
  - 全件名を投入すると `src/generated/languages/*.ts` が全国図鑑規模に膨らむ（未解禁名も emit）。生成バンドルの
    サイズ増・差分ノイズは X 方針（全件を languages 本体に持つ）の帰結として許容する（実投入は別 phase）。
- **トレードオフ / 留意点**:
  - 緩和は **orphan チェックのみ**に厳格に限定する（spec の名前欠落・ja・en 欠けの保護は維持）。ADR 0039 の
    「検証機構は取得元非依存で不変」安全弁に対する**意図的で限定的な例外**であり、過剰緩和は本 ADR の射程外。
  - `mega` は全件取得の対象外（PokeAPI 非対象）。en=showdown / ja=手作業の分担を [[data-pipeline]] に明記する。

## Alternatives Considered

| 代替案 | 却下理由 |
|---|---|
| bijection を維持し per-reg 解禁のたびに名前を追記する | 解禁取得（showdown / Serebii）は ja を持たず、解禁のたびに名前欠落が再発する。名前の取得元（PokeAPI 全件）の性質と噛み合わず、全件辞書化で ja gap を原則消す方が構造的に正しい。 |
| languages を bijection のまま別ファイルに全件名を持つ | 名前 SoT が 2 系統（bijection な languages + 全件辞書）に割れ、ADR 0035 が一本化した「名前 SoT = languages」を再び分散させる。superset 緩和で 1 系統のまま全件辞書化できる。 |
| generate の名前突き合わせを全廃する | spec の名前欠落・ja・en 欠けの検出まで失い、生成物の名前欠落を許してしまう。緩めるべきは orphan だけで、spec 側の保護は安全弁として残す。 |
