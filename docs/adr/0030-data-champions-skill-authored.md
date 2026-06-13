---
id: 0030
status: Accepted
date: 2026-06-13
---

# 0030. data/champions は skill 著述で維持し人間が直接編集しない（統一用語 skill-authored）

## Context

現行の rule / skill / ADR は `data/champions/**`（`catalog/*.yaml` / `regulations/*.yaml` / `rules.yaml`）を
「**手動管理**」「**手書き編集**」「**hand-authored**」と表現し、[ADR 0027](./0027-structural-data-catalog-sot.md)
の `materialize`（append/既存尊重）も「**hand-authored 修正を保護**」と書いてきた。

これらの語は「人間が手作業でエディタに書く」と読めるが、実際の著述主体は **`survey-regulation` /
`author-individual` を実行する AI エージェント**である。AI が [ADR 0026](./0026-pokeapi-not-champions-legality-source.md)
の方針どおり Serebii 等を閲覧し、出典付きで YAML へ転記している。語と実態が乖離しており、「人間が直接
エディタで編集してよい」とも誤読される。誤った直編集は出典との同期・再現性（同じ skill を再実行すれば
同じ結果に収束する性質）を壊す。

`data/champions/**` の維持方針と、それを指す統一用語の SoT がどこにも明文化されていない。後から
「誰がどう編集してよいデータか」を背景なしに判断すると運用がぶれるため、ここで決定として残す。

## Decision

**`data/champions/**`（`catalog/*.yaml` / `regulations/*.yaml` / `rules.yaml`）は skill 著述で維持し、
人間が直接エディタで編集しない。** 著述主体は `survey-regulation` / `author-individual` を実行する AI
エージェントであり、Serebii 等の出典を閲覧して YAML に転記する。

**誤りの訂正は skill 再実行または AI への直接指示を経由する。** `catalog` / `regulations` の訂正は対応
skill（`survey-regulation` 等）の再実行で行う。**`rules.yaml` は対応 skill が無いため、改定経路を「AI への
直接指示」と定義する**（人間が直接書き換えるのではなく、AI に指示して書かせる）。

**ソースとして著述される SoT を統一用語 `skill-authored`（英語ラベルのまま）と呼ぶ。** 意味は「`generate` /
`materialize` の派生出力ではないソース著述。著述主体は skill を実行する AI（人間は直接編集せず skill/AI を
経由する）」。機械転記の `materialize` と対比する。`materialize` の append/既存尊重が**保護する対象 =
skill-authored 値**である（保護の設計自体は ADR 0027 のまま不変・保護される値の主体が「人間の手修正」から
「skill/AI の著述値」に整理されるだけ）。

仕様・定義の詳細は [[data-pipeline]] を SoT とし、本 ADR は「なぜ」を記録する。

## Consequences

- **良い点**:
  - `data/champions/**` の編集主体と訂正経路が明文化され、「人間が直接書いてよいか」の判断ぶれが消える。
  - 出典（Serebii 等）との同期・再現性が保たれる（skill 再実行で同じ結果に収束する経路を正規化）。
  - `skill-authored` という統一用語ができ、`materialize`（機械転記）との対比が言語化される。
- **悪い点 / コスト**:
  - 訂正に skill 再実行 / AI 指示という 1 段階を挟むため、軽微な修正でも直編集より手数が増える。
  - 統一用語の全資産展開・人間直編集前提文言の全面改訂は別途必要（本 ADR は定義 SoT の確定のみ）。
- **トレードオフ / 留意点**:
  - **強制は規約レベルに留める。** 人間直編集 NG を CI で機械強制するのは「誰が編集したか」を機械判定
    しづらく困難なため、本決定は方針・規約での明記で担保する。直編集を warn する check の要否は将来判断とする。
  - `rules.yaml` は対応 skill が無いまま「AI 直接指示」を改定経路とするため、将来専用 skill を設けるなら
    経路を再整理する余地がある。

## Alternatives Considered

| 代替案 | 却下理由 |
|---|---|
| 「手動管理 / hand-authored」表現を維持する | 著述主体が AI である実態と乖離し、人間直編集を誘発する誤読が残る。SoT を skill 著述として言語化できない。 |
| `skill-authored` を日本語ラベルにする | コード / データの識別子的な統一名として一貫させたい。英語ラベルのまま統一する方が `materialize` 等の語と並びやすい。 |
| 人間直編集 NG を CI check で機械強制する | 「誰が編集したか」を機械判定しづらく、本 ADR の段階では過剰。規約レベルで担保し、強制 check は将来の別判断に送る。 |
| `rules.yaml` も人間直編集を許す | `catalog` / `regulations` と運用が割れ、SoT の一貫性が崩れる。対応 skill が無い分は「AI 直接指示」を経路と定義して統一する。 |
