---
id: 0040
status: Accepted
date: 2026-06-29
---

# 0040. Serebii を速報経路へ降格し第一優先を撤回・既存スクレイパーを全廃して新スクレイパーへ刷新する

## Context

[ADR 0039](./0039-showdown-authoritative-pokeapi-ja-only.md) で pokemon-showdown を構造データ + 解禁データの
第一の正（authoritative）に据え、権威序列を **showdown(正) > Serebii(速報) > PokeAPI(ja 補完)** と定めた。
これにより Serebii を「第一優先の正」とする前提は崩れる。

旧 Serebii コードはその第一優先前提のもとで作られていた。`scripts/fetch-serebii.ts`（取得）/
`scripts/scrape-serebii.ts`（旧・配線）/ `scripts/serebii-to-catalog.ts`（specs / per-reg / languages への
著述転記・メガ自動著述）と `src/codegen/serebii/*`（parse / normalize / catalog-fields / per-game-fields /
regulation-fields / schema）は、種族ページの覚える技一覧抽出・技専用ページからの技メタ取得・メガ linking の
決定論自動著述・構造データを空で残し materialize に委ねる等、**Serebii が SoT を主導する**設計だった。
showdown が正になった今、これらの著述責務は showdown 経路（authoritative）と照合スキル（`verify-showdown-pr`）へ
移管され、旧コードは前提ごと不要になる。

一方 Serebii は公式更新の反映が早く**速報**に向き、各ページに日本語名（種族・メガ=カタカナ / 特性・持ち物・技=
ひらがな）を持つ。これを速報経路として残し、指定ページ群（`pokemonchampions/pokemon.shtml` /
`pokedex-champions/<id>` / `attackdex-champions/<id>.shtml` / `items.shtml` + `itemdex/<id>.shtml` /
`abilitydex/<id>.shtml`）向けの新スクレイパーへ作り直すのが妥当になる。

## Decision

**Serebii を速報（provisional）経路へ降格し、第一優先（authoritative）の地位を撤回する。** 解禁データの
第一の正は showdown（ADR 0039）とし、Serebii は GitHub Actions（`serebii-bulletin.yml`・`workflow_dispatch`
手動）で指定ページ群をスクレイプして `data:provisional` ラベルの**速報 PR** を立てる経路に限定する。速報は
暫定値で、showdown-sync（authoritative）が追いついたら上書きされる。

**旧 Serebii コードを全廃し、新スクレイパーへ刷新する。** `scripts/fetch-serebii.ts` /
`scripts/scrape-serebii.ts`(旧) / `scripts/serebii-to-catalog.ts` と `src/codegen/serebii/*`（旧 parse /
normalize / catalog-fields / per-game-fields / regulation-fields / schema）を削除し、`package.json` の
`fetch:serebii` / `scrape:serebii` / `serebii:catalog` を撤去する。新スクレイパーは showdown 側と対称の
**5 データセット軸（species / moves / items / abilities / mega）** で `src/codegen/serebii/parse-*`（純関数 +
コロケーション test・カバレッジ 100%）+ `scripts/scrape-serebii.ts`(新・取得 + 配線) / `scripts/sync-serebii.ts`
（中間 JSON → SoT YAML・**ja / en を速報として埋める**）として実装し、`serebii:<dataset>` で起動する。

**メガ id は showdown と同じ語順の kebab へ正規化する。** Serebii 表示名（`Mega Charizard X`）を `charizard-mega-x`
へ写し、両経路を同一 SoT id へ収束させる。速報経路の新責務は **ja 抽出**（数値文字参照デコード後テキストからの
日本語名抽出）で、技メタ・構造・解禁の SoT レイアウトと検証機構（3 軸直交・tsc-only・カバレッジ 100%・YAML block
style ゲート）は不変（取得元非依存ゆえ・ADR 0039 と同じ安全弁）。仕様の詳細は [[data-pipeline]] を正本とする。

これは Serebii を SoT 著述に使う 2 つの決定 — [ADR 0033](./archive/0033-deterministic-mega-auto-authoring.md)
（Serebii メガ関連データの決定論自動著述）/ [ADR 0037](./archive/0037-serebii-move-master-dedicated-path.md)
（Serebii 技専用ページからの技マスター専用取得）— の前提（Serebii=第一優先）を覆すため、両者を supersede する。
メガ linking を決定論で導出する考え方・技メタを技専用ページから取る考え方自体は新スクレイパー（`parse-mega` /
`parse-moves`）に引き継ぐが、著述主体が「Serebii=正」から「Serebii=速報・showdown=正」へ移る点が決定の核である。

## Consequences

- **良い点**:
  - 権威序列（ADR 0039）と Serebii コードの役割が一致し、第一優先前提の旧コードが残る矛盾が解消する。
  - 新スクレイパーが showdown と同じ 5 データセット軸で対称になり、両経路を同一 SoT id・同一転記規律
    （append/既存尊重・block スタイル）で扱える。ja を速報で埋められる。
  - 公式更新を速報 PR で早く取り込め、showdown が追いつくまでの空白を埋められる。
- **悪い点 / コスト**:
  - Serebii 速報値は暫定で、showdown PR が上書きするまで一時的に authoritative と食い違いうる（ラベル
    `data:provisional` と PR 本文で明示して運用で収束させる）。
  - 旧コード削除に伴い、旧コードを参照していた手順 SoT（survey-regulation skill・data-pipeline rule）の改訂が
    必要になる（rule / skill 改訂は後続フェーズで実施）。
- **トレードオフ / 留意点**:
  - 取得が外向きの自動 PR 作成（`peter-evans/create-pull-request`）を伴うため、トークン権限を最小化し PR 本文に
    [[redaction]] を適用する。Serebii public ページの出典 URL は公開メタで redaction 不要。
  - Serebii は latin-1 + CRLF + 超長行・日本語は数値文字参照。新スクレイパーも文字コードと健全性 exit code
    （0/2/3/4）を設計に含める。

## Alternatives Considered

| 代替案 | 却下理由 |
|---|---|
| 旧 Serebii コードを温存し speed 経路として再利用 | 旧コードは Serebii=第一優先・構造を空で残し materialize 委譲・メガ自動著述を SoT 主導する設計で、showdown=正の新序列と噛み合わない。対象ページ群も新規（roster / abilitydex / itemdex）で、流用より作り直しが安全。 |
| Serebii 経路自体を全廃し showdown + PokeAPI のみにする | showdown が追いつくまでの公式更新の空白を埋められず、ja（種族・メガ=カタカナ等）の速報源も失う。速報 + 照合の裏取りに Serebii は価値が残るため経路は残す。 |
| メガ id を Serebii 表示名（`mega-charizard-x`）のまま採用 | showdown 経路の id（`charizard-mega-x`）と食い違い、同一 SoT で 2 義化する。両経路を同一 id へ収束させるため showdown 語順へ正規化する。 |
