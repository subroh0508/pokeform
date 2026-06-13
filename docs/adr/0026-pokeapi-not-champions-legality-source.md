---
id: 0026
status: Accepted
date: 2026-06-13
---

# 0026. PokeAPI を Champions レギュレーション情報・技威力の信頼源にしない

## Context

[ADR 0012](./0012-vendor-pokeapi-data.md) の vendor 方式では、PokeAPI を構造データ（種族値・タイプ・
特性・持ち物 category）だけでなく、**Champions の「使える技」(learnset legality)** の照合源
（`check:regulation` の覚えない技検出が `data/raw` の PokeAPI learnset を正とする）と、**技威力等の技メタ**
（`generate.ts` が `data/raw/move/*.json` から `power` / `accuracy` / `type` / `damageClass` / `pp` /
`priority` を導出）にも使っていた。

しかし **PokeAPI はポケモンチャンピオンズに対応していない**。Champions は独自のレギュレーションで
解禁種族・使用できる技・使用できる持ち物・技の数値を定めており、PokeAPI の learnset / 技メタが
Champions の実態と一致する保証がない。これに依存すると、(a) 実際には使える技を「覚えない技」と誤検出して
authoring を不当に弾く、(b) 誤った技威力で火力指数・ダメージ計算が狂う、という温床になる。実際に
過去のデータ投入で「Serebii にあり PokeAPI learnset に無い技」を per-reg YAML から除去で解消する運用に
追い込まれ、skill 記述と check の実挙動が乖離していた（[[data-pipeline]] の overrides 注記）。

Champions 解禁データの第一の信頼源は **Serebii（複数ソース突き合わせ）** であり、技の出自・解禁範囲は
そちらに一本化すべきである。[ADR 0025](./0025-catalog-name-and-type-chart-sot.md) で名前 / タイプ相性の
SoT を catalog YAML（skill-authored）へ移した路線の延長で、技メタの SoT も catalog へ寄せられる。

## Decision

**PokeAPI を Champions の (a) 解禁種族 / (b) 使用できる技（learnset legality）/ (c) 使用できる持ち物 /
(d) 技威力等の技メタ の信頼源として使わない。** 代替は **信頼できる情報源（Serebii 第一優先・複数ソース
突き合わせ）** で補完する。具体的には:

- **`check:regulation` の learnset 照合（覚えない技検出）を撤去する。** `validateRegulation` は参照整合
  （種族 / 持ち物 / メガ / 技が catalog に存在するか）と schema（種族ブロックの形）のみを検証し、
  「`moves` ⊄ PokeAPI learnset」の照合は行わない。`data/raw` learnset の読込（`loadLearnsets`）も廃する。
  技が実ゲームで覚えるかの担保は **authoring 段（`survey-regulation` skill・Serebii 第一優先）** に置く。
- **技メタ（type / damageClass / power / accuracy / pp / priority）の SoT を `data/champions/catalog/moves.yaml`
  （skill-authored・コミット）へ移す。** `generate.ts` は技メタについて `data/raw` を読まず catalog YAML を
  変換する。`fetch-pokeapi.ts` は `move` リソースを取得しない。catalog の技メタ欠落は `satisfies MoveBase`
  により生成段の tsc で弾く（[[tsc-verification]]）。
- **レギュ非依存の構造データ（種族値・タイプ・特性・持ち物 category）は引き続き PokeAPI vendor 由来とする
  （[ADR 0012](./0012-vendor-pokeapi-data.md) を維持）。** 「PokeAPI を使わない」のは Champions legality と
  技メタに限る。これは vendor 方式の **legality + 技メタ部分のみの改訂**であり、ADR 0012 を supersede しない
  （名前 / 相性部分のみ改訂した ADR 0025 と同型）。

仕様の詳細は [[data-pipeline]] / [[cli-and-io]] / [[type-conventions]] を正本とし、本 ADR は「なぜ」を記録する。

## Consequences

- **良い点**:
  - 誤った「使える / 使えない」判定や誤った技数値の温床（PokeAPI と Champions の乖離）が消える。
  - 技の出自・技メタが Serebii 第一優先の skill-authored 入力から直読・直編集でき、Champions 独自の
    調整を正本で表現できる（PokeAPI 再取得や override 迂回に依存しない）。
  - `check:regulation` が `data/raw` 非依存になり、ローカル / CI で挙動が一定（learnset 由来の degrade が消える）。
  - `fetch-pokeapi.ts` が `move` を取得しなくなり、取得対象が縮小する。
- **悪い点 / コスト**:
  - 技メタが skill-authored になり、新規技の追加時に type / power 等を人手で正しく記入する責任が生じる
    （誤記は tsc が構造の欠落のみ検出・数値の正しさは Serebii 照合で担保）。
  - 覚えない技の機械照合という安全網が無くなる。混入防止は authoring 手順（Serebii 第一優先）に依存する。
- **トレードオフ / 留意点**:
  - **reversible**: PokeAPI が将来 Champions に正式対応したら本決定を見直せる。その際は本 ADR を supersede し、
    learnset 照合の復活・技メタ source の再検討を行う（skill-authored catalog は SoT として残しつつ機械照合を
    補助に戻す等）。
  - 技メタ catalog の初期値は移設時点の既存生成値（旧 raw 由来）を seed とし、以後は Serebii 第一優先で
    hand-maintain する（移設は値の出自を catalog へ移す変更で、生成物の値自体は等価）。

## Alternatives Considered

| 代替案 | 却下理由 |
|---|---|
| PokeAPI learnset 照合を維持（現状） | Champions 非対応で実態と乖離。覚えない技の誤検出・除去運用の温床が残る。 |
| 技メタ SoT を PokeAPI raw のまま残す | 技威力等が Champions と一致する保証がなく、火力 / ダメージ計算が狂う。決定の趣旨（PokeAPI を技メタ信頼源にしない）と矛盾。 |
| ADR 0012 を supersede する | 構造データ（種族値・タイプ等）の vendor 方式は維持するため全面置換は過剰。legality + 技メタ部分のみの改訂（ADR 0025 と同型）が実態に合う。 |
| learnset 照合を `overrides.yaml` で吸収 | check は overrides 非適用で通せず、skill 記述と実挙動の乖離が残る（learning #59）。根本解決にならない。 |
