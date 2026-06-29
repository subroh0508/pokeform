---
name: verify-showdown-pr
description: >-
  pokemon-showdown 経路（authoritative）が自動作成した `data:authoritative` ラベルの data 更新 PR の正確性を、
  Serebii 速報スクレイパーを流用して照合し PR コメント + exit code（0=一致 / 1=差異）で返す手順 skill。
  「showdown の PR を Serebii で照合して」「`data:authoritative` の data 更新 PR を確認して」「この showdown-sync
  の PR は正しい?」「verify-showdown-pr <PR>」「showdown 経路の YAML 差分を Serebii で裏取りして」と言われたとき、
  または showdown-sync.yml が立てた解禁データ PR をマージ前に検証したいときに使う。WebFetch は使わず Serebii
  スクレイパー（`node scripts/scrape-serebii.ts`）の中間 JSON で照合する。レビュー観点・出力は code-review /
  redaction に準拠し、機械ゲート（型 / カバレッジ / Biome）は再実装しない。構造データ取得は showdown 経路、
  日本語名 ja の取り込みは update-catalog の責務で、本 skill は照合専任。
allowed-tools: Bash(gh pr *), Bash(gh api *), Bash(node scripts/*), Bash(pnpm *), Bash(git diff*), Read, Write
---

# verify-showdown-pr — showdown 経路の data PR を Serebii で照合する

pokemon-showdown を第一の正（authoritative）にした取得経路（[[data-pipeline]] / [ADR 0039](../../../docs/adr/0039-showdown-authoritative-pokeapi-ja-only.md)）は、
GitHub Actions（`showdown-sync.yml`）で解禁データ YAML を機械抽出し `data:authoritative` ラベルの **PR を自動作成**する。
showdown は Smogon コミュニティの再現データで公式そのものではないため、その PR が公式実態と合うかを**マージ前に裏取り**する関門が要る。
本 skill は **Serebii 速報スクレイパー（[ADR 0040](../../../docs/adr/0040-serebii-provisional-scraper-rebuild.md)）を読み取り専用で流用**して PR の差分を照合し、
一致なら承認可・差異なら blocking を PR コメントへ残す手順を定型化する。

> 取得元の権威序列（showdown=正 > Serebii=速報 > PokeAPI=ja 補完）・データ項目 × 取得元 × SoT の正本は [[data-pipeline]]。
> 本 SKILL.md は照合手順に専念し、SoT レイアウト・パーサ DOM 契約値・型パターンを二重記述しない（パーサ仕様は
> `src/codegen/serebii/*` のテスト済み純関数が SoT で、本 skill は契約値を持たない）。

## なぜこの skill があるか

showdown 経路は構造・解禁・技メタ・メガを単一の機械可読ソースから一括抽出でき網羅性・自動化適性が高い一方、
**公式そのものではない**（ADR 0039）。誤抽出・mod の取りこぼし・PP 計算ずれ等が混入しうるため、第二の独立ソース
（Serebii・公式更新の反映が早く速報経路へ降格・ADR 0040）で
**機械照合**して裏取りする。HTML を LLM に丸ごと読ませず **Serebii スクレイパーの中間 JSON と exit code** で
判定することで、トークン最小・決定論・再現可能に照合する（[[code-review]] の「機械ゲートで捕れない層に専念」と同じ思想で、
ここでの「機械」は Serebii スクレイパー）。

## 入力 / 出力

- **入力**: 照合対象の PR 番号（`data:authoritative` ラベルの showdown-sync PR）。対象レギュ id（例 `m-a` / `m-b`）は
  PR の変更パス（`data/champions/<reg>/`）から判別する。
- **出力**:
  - 照合結果の **PR コメント**（`gh pr comment <N> --body-file`）。総括（`✅ 一致` / `❌ 差異 N 件`）+ 差異を
    `path:line` + 重大度（[[code-review]] フォーマット）で列挙。投稿前に [[redaction]] を適用する。
  - **exit code 相当の判定**: 一致 = 承認可（`0`）/ 差異 = blocking（`1`）。auto-merge ゲート（[[code-review]] の
    「CI 緑 + blocking 0」）の blocking 0 条件に接続する。本 skill は判定とコメントまでで、merge は実行しない。

## 手順

### 1. PR の変更 YAML を抽出する

`gh pr diff <N>` で変更ファイルを取り、照合対象のデータセット YAML を抽出する（[[data-pipeline]] の 5 データセット軸に対応）:

- `data/champions/<reg>/species.yaml`（roster）/ `species-moves.yaml`（per-species 技）/ `items.yaml`（解禁持ち物）/ `mega.yaml`（解禁メガ）
- `data/champions/{species,move,item,ability,mega}-specs.yaml`（構造・技メタ）
- `data/languages/*.yaml`（ja / en）

変更パスから対象レギュ id（`<reg>`）を確定する。data 以外（src / scripts）の変更が主なら本 skill の対象外で、`code-review` を案内する。

### 2. Serebii 中間 JSON を取得する（スクレイパー流用・WebFetch 不使用）

**`node scripts/scrape-serebii.ts <dataset> <reg>`**（dataset = `species` / `moves` / `items` / `abilities` / `mega`）を
PR の変更データセットぶん実行し、Serebii 中間 JSON を stdout で得る。このスクリプトは取得 → `src/codegen/serebii/parse-*`
純関数でパース → schema 自己検証までを行い、**SoT YAML を書き換えない読み取り専用**（書き込みは `sync-serebii.ts` =
`pnpm serebii:*` の責務で、照合では使わない）。HTML 本文は読まず **stdout の JSON と exit code / stderr の診断**だけを見る:

- exit `0` = 健全 / `2` = 取得失敗 / `3` = schema 欠落 / `4` = 件数・健全性違反（[ADR 0040](../../../docs/adr/0040-serebii-provisional-scraper-rebuild.md)）。
- 取得は `data/raw/serebii/`（gitignore）へキャッシュされ冪等。`moves` / `abilities` は `species` ステップが書いた
  per-reg / specs を対象 id 源にするため、PR ブランチを checkout した作業ツリーで実行する。

`scrape-serebii.ts` が exit 2/3/4 を返したら Serebii 側の取得失敗で**照合不能**＝ blocking とせず「照合保留（Serebii 取得失敗）」を
コメントに明記する（showdown PR の否定材料にしない・DOM 揺れは Serebii スクレイパー側で吸収する責務）。

### 3. 照合する（roster / 技 / 持ち物 / メガ / 技メタ / 名前）

PR の YAML 値と Serebii 中間 JSON を**機械的に突き合わせ**、差異を列挙する。照合軸:

- **roster 総数 / id 集合**: `<reg>/species.yaml` の解禁種族数・id 集合が Serebii roster と一致するか。
- **per-species 技件数**: `<reg>/species-moves.yaml` の各種族 `moves` 件数・id 集合が Serebii 種族ページの learnable 技と一致するか。
- **解禁持ち物・メガ membership**: `<reg>/items.yaml` / `<reg>/mega.yaml` の id 集合が Serebii items.shtml / 種族ページのメガと一致するか。
- **技メタ**: `move-specs.yaml` の `type` / `damageClass` / `power` / `accuracy` / `pp` / `priority`。**PP は showdown 側が
  `calculatePP`（8/12/16/20）適用済み**なので、Serebii の基礎値と直接比較せず換算を踏まえて差異判定する（[[data-pipeline]] の PP 注記）。
- **メガ id 正規化**: 両経路とも `charizard-mega-x` 語順へ収束しているか（Serebii 表示名 `Mega Charizard X` → kebab・ADR 0040）。
- **ja / en**: `languages/*.yaml` の名前が Serebii 表示名（種族・メガ=カタカナ / 特性・持ち物・技=ひらがな）と整合するか。

各差異に **重大度**（[[code-review]]）を付ける: roster/解禁集合の欠落・余剰や技件数の大きな乖離は `blocking`、軽微な
名前揺れ・1 件差は `non-blocking` / `nit`。差異が 0 なら一致（承認可）。

### 4. PR コメントへ残す（redaction 適用）

総括（`✅ Serebii 照合一致` / `❌ 差異 N 件（blocking M）`）+ 差異一覧（`path:line` + 重大度 + 根拠）を `/tmp/<prefix>-verify.md` に
Write し、**投稿前に [[redaction]] を適用**してから `gh pr comment <N> --body-file <file>` で投稿する（[[code-review]] の出力先規約）。
一致でも「✅ 一致」コメントを残す（照合実施の記録）。

## Gotchas

- **読み取り専用で照合する**: 照合には `node scripts/scrape-serebii.ts`（JSON を stdout）を使い、YAML を書き換える
  `pnpm serebii:*`（= `sync-serebii.ts`）は使わない。作業ツリーを汚さない（汚すと PR diff と混ざる）。
- **WebFetch を使わない**: 照合は決定論スクレイパー（テスト済み純関数 + 中間 JSON）に宿る。HTML を LLM コンテキストに
  載せない（トークン最小・[ADR 0040](../../../docs/adr/0040-serebii-provisional-scraper-rebuild.md)）。DOM 揺れは
  `src/codegen/serebii/*` のパーサ側で吸収し、本 skill は契約値を持たない。
- **PP は換算を踏まえて比較**: showdown 側は `calculatePP` 適用済み（8/12/16/20）。Serebii 基礎値とそのまま比較して
  差異と誤判定しない（[[data-pipeline]] の「PP の落とし穴」）。
- **Serebii 取得失敗は showdown PR の否定材料にしない**: `scrape-serebii.ts` の exit 2/3/4 は Serebii 側の問題で
  照合保留。showdown PR を blocking にせず保留を明記する（速報経路ゆえ取りこぼしうる・ADR 0040）。
- **判定までが責務・merge しない**: auto-merge は [[code-review]] の「CI 緑 + blocking 0」ゲートと
  [[implementation-workflow]] の予約で発火する。本 skill はコメント + 判定までで止める。
- **機械ゲート / レビュー観点を再実装しない**: 型 / カバレッジ / Biome は `verify` / CI、生成データの妥当性は
  `pokemon-data-reviewer` agent、ソース設計レビューは `code-review`（[[skill-authoring]] / [[code-review]]）。
- **cross-agent**: 本 skill は npm script + `gh` の逐次実行のみで Claude 固有機構（Workflow）を持たない。Codex / 素の CLI
  でも `gh pr diff` → `node scripts/scrape-serebii.ts` → 照合 → `gh pr comment` を逐次実行で完結する（[[cross-agent]]）。

## 関連

- データ取得元・SoT・権威序列の正本: [[data-pipeline]]。
- 決定の「なぜ」: [ADR 0039](../../../docs/adr/0039-showdown-authoritative-pokeapi-ja-only.md)（showdown 第一の正・PokeAPI ja 専任）/
  [ADR 0040](../../../docs/adr/0040-serebii-provisional-scraper-rebuild.md)（Serebii 速報降格・スクレイパー刷新）。
- Serebii スクレイパー（照合に流用）: `scripts/scrape-serebii.ts` / 純関数 `src/codegen/serebii/parse-*`。
- showdown 経路（authoritative・照合対象の生成元）: `.github/workflows/showdown-sync.yml` / `scripts/showdown/*` / `src/codegen/showdown/*-fields.ts`。
- 日本語名 ja の取り込み: [`update-catalog`](../update-catalog/SKILL.md)。
- レビュー基準・出力 / redaction: [[code-review]] / [[redaction]]。
- 生成データ妥当性: `pokemon-data-reviewer` agent / 利用者パーティ点検: [`review-party`](../review-party/SKILL.md)。
- skill 作成方針・cross-agent: [[skill-authoring]] / [[cross-agent]]。
