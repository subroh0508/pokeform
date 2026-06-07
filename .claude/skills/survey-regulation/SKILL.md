---
name: survey-regulation
description: >-
  ポケモンチャンピオンズの**レギュレーション解禁情報を WebSearch で調査・複数ソース突き合わせ**し、
  全リストを出典付きで doc 化して、解禁エンティティ（種族 / 技 / 持ち物 / メガ）を
  `data/champions/catalog/*.yaml`（append-only）と `data/champions/regulations/<id>.yaml`（allow）へ
  反映する手順 skill。「M-A の解禁データを集めて」「レギュレーション <id> の解禁種族を調べて投入して」
  「新レギュの解禁情報を取得して」「survey-regulation <id>」「M-B が公開されたので反映して」と言われたとき、
  または per-regulation データ（`02-data-model-redesign`）を新規投入 / 更新したいときに使う。情報源の
  信頼性評価と矛盾解消・再現可能な記録を重視する。生成 / 検証は `generate:data` / `verify` に委譲し、
  機械ゲート（型 / カバレッジ / Biome）は再実装しない。利用者パーティの点検は `review-party`、生成データの
  妥当性レビューは `pokemon-data-reviewer` agent を使う（こちらは解禁データの取得・投入が責務）。
allowed-tools: WebSearch, WebFetch, Read, Write, Edit, Bash(pnpm *), Bash(node src/cli/*)
---

# survey-regulation — レギュレーション解禁情報の調査と投入

ポケモンチャンピオンズはレギュレーションごとに解禁される**種族・技・持ち物・メガシンカ**が変化する。
この情報は PokeAPI に無く（[[data-pipeline]]）、外部の対戦情報サイトにしか無い。本 skill は、その解禁情報を
**WebSearch で複数ソースから集めて突き合わせ**、再現可能な形で doc 化し、`02-data-model-redesign` で定めた
per-regulation データ構造（[ADR 0021](../../../docs/adr/0021-per-regulation-species-and-legality.md)）へ反映する
手順を定型化する。M-A だけでなく **M-B 以降や将来のレギュレーション更新で繰り返し使う**。

> データ構造の正本は [[data-pipeline]]（catalog / per-reg の扱い）と
> [`docs/plan/02-data-model-redesign/OVERVIEW.md`](../../../docs/plan/02-data-model-redesign/OVERVIEW.md)、
> 解禁判定モデルの「なぜ」は [ADR 0021](../../../docs/adr/0021-per-regulation-species-and-legality.md)。
> 本 SKILL.md は調査・投入手順に専念し、データ仕様を二重記述しない。

## なぜこの skill があるか

解禁情報は一次ソースが対戦コミュニティのサイト（Serebii / Bulbapedia / Game8 / Victory Road / MetaVGC 等）で、
**単一ソースは誤記・抽出ミス・更新遅れを含む**。レギュレーションごとに毎回その場でやり方を考えると、
突き合わせの粒度や記録の仕方がぶれ、暫定でっち上げ（過去の不正確データ）に逆戻りしやすい。本 skill は
「複数ソース突き合わせ → 矛盾解消 → 出典付き全リスト doc → catalog / per-reg 反映 → 再生成 → 検証」を
定型化し、**結果の再現性より判断過程の追跡可能性**を担保する（WebSearch 出力は非決定的なため）。

## 入力 / 出力

- **入力**: レギュレーション id（例 `champions-m-a`）と解禁条件（基本最終進化・メガ可否・Restricted 除外・期間 等）。
- **出力**:
  - `docs/plan/<plan>/<id>-roster-source.md`（情報源・検証日・矛盾解消・全リストの出典付き記録）。
  - `data/champions/catalog/{species,moves,items,abilities}.yaml` への **append-only 追記**。
  - `data/champions/regulations/<id>.yaml`（`name` / `period` / `allow{species,items,mega,moves}`）。
  - 再生成された `data/generated/**` と `pnpm verify` 緑。

## 手順

### 1. 情報源を WebSearch で集め信頼性を評価する

`<id>` と条件で WebSearch し、**複数の独立ソース**（公式 / Serebii / Bulbapedia / Game8 / Victory Road /
MetaVGC 等）を集める。各ソースの「総数・期間・メガ可能数」など**検証しやすい要約値**を先に押さえ、
権威ソース（総数を明示するもの）を 1 つ決める。

### 2. 全リストを取得し突き合わせる（WebFetch）

主ソースから解禁種族の全リストを WebFetch で取得し、別ソースのサンプル / 総数と**帰属（membership）と
件数を突き合わせる**。**矛盾は必ず doc に残し、採用根拠を明記**する（例: 自動抽出の件数ずれは抽出ミスと
判断し、権威ソースの総数を正とする）。1 ソースだけに依存しない。

### 3. 全リストを出典付きで doc 化する

`docs/plan/<plan>/<id>-roster-source.md` に次を記録する（再現可能性のため）:

- 権威ある事実（総数 / メガ数 / 期間 / 形式条件）と各出典 URL・**検証日**。
- ソース間の差異と解消（何を正とし、なぜそう判断したか）。
- 解禁種族の全リスト（主ソース由来・別ソースで帰属検証）。確定列挙が難所なら未確定部分を明記する。

### 4. 解禁条件と既存データの整合を確認する

条件（基本最終進化・メガ可・Restricted 除外 等）に反する種が混ざっていないか、既存
`data/champions/regulations/<id>.yaml` の未解禁デモ種が新リストと矛盾しないかを確認する。

### 5. catalog へ append-only 追記する

解禁エンティティの id を `data/champions/catalog/*.yaml` に追記する（**append-only**: 既存を消さない・
[[data-pipeline]]）:

- `species.yaml`: 種族 slug（+ メガ運用するなら `megaLinks`）。**PokeAPI default slug**を使う（複数フォルムは
  フォルム slug に注意）。
- `abilities.yaml`: **追加種族が持つ特性を必ず全て追記**する（catalog に無い特性を種族が参照すると
  `generate.ts` が生成段でエラーになる）。`pnpm fetch:data` 後に `data/raw/pokemon/<slug>.json` の
  `abilities[].ability.name` を集めると漏れない。
- `moves.yaml` / `items.yaml`: 解禁技・持ち物の id（必要分）。

### 6. per-regulation YAML を書く / 更新する

`data/champions/regulations/<id>.yaml` の `allow.{species,items,mega,moves}` に解禁集合を反映する
（id は catalog 参照）。`mega` は解禁メガ先 slug、`moves` は記録のみ（per-reg 型は生成しない・ADR 0021）。
`period.end` は開催中なら空（`null`）。

### 7. 再生成して検証する（委譲）

`pnpm fetch:data`（新規 slug 取得・ネットワーク）→ `pnpm generate:data`（per-reg 型・catalog 整合を生成段で
検証）→ [`verify`](../verify/SKILL.md)（`pnpm verify`）。CLI で解禁判定を end-to-end 確認したいときは
`node src/cli/index.ts check:party <party.md>`（解禁種 = exit0 / 未解禁混入 = exit1）。**機械ゲートは
再実装せず委譲**する（[[skill-authoring]]）。

## Gotchas

- **単一ソース依存を避ける**: 1 サイトの自動抽出は件数・帰属を誤りやすい。必ず 2 ソース以上で突き合わせ、
  矛盾と採用根拠を doc に残す（WebFetch は小型モデル抽出のため件数を誤カウントしうる）。
- **abilities の追記漏れ = 生成エラー**: 種族追加時は特性カタログへの追記を忘れない。`data/raw` から機械的に
  集めると確実。catalog に無い id を種族が参照すると `generate.ts` が throw する（整合担保・[[data-pipeline]]）。
- **append-only を守る**: 没収された種・技も catalog から消さない。解禁/非解禁の現況は per-reg `allow` が表す。
- **複数フォルム種の slug**: 地域フォルム・バトルフォルム・メガ先は PokeAPI slug が `<name>-<form>`。default
  slug が意図と違う種に注意（[[data-pipeline]] の vendor 方式）。
- **生成物を手編集しない**: `data/generated/**` は触らず catalog / per-reg を直して再生成する（[[data-pipeline]]）。
- **機械ゲート / レビュー観点を再実装しない**: 検証は `verify`、生成データの妥当性は `pokemon-data-reviewer`
  agent、利用者パーティ点検は `review-party`（[[skill-authoring]]）。
- **redaction**: doc へ外部リンク・引用を書き出す前に [[redaction]] を点検する（Secrets / PII 非混入）。

## 関連

- データ構造正本: [[data-pipeline]] / [`02-data-model-redesign/OVERVIEW.md`](../../../docs/plan/02-data-model-redesign/OVERVIEW.md)。
- 決定の「なぜ」: [ADR 0021](../../../docs/adr/0021-per-regulation-species-and-legality.md)。
- 検証 / 生成: [`verify`](../verify/SKILL.md) / `pnpm generate:data`。
- 利用者パーティ点検: [`review-party`](../review-party/SKILL.md) / 生成データ妥当性: `pokemon-data-reviewer` agent。
- skill 作成方針・cross-agent: [[skill-authoring]] / [[cross-agent]] / [[redaction]]。
