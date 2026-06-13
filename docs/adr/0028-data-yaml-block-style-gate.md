---
id: 0028
status: Accepted
date: 2026-06-13
---

# 0028. data YAML はブロックスタイルを CI ゲートで強制する

## Context

`data/` 配下の手編集 YAML（`catalog/*` / `regulations/*` / `rules.yaml`）は手編集 SoT であり、flow スタイル（`[ a, b ]` / `{ k: v }` のインライン記法）と block スタイルが混在すると、1 行に複数値が入って行単位 diff で値の変化を追えなくなり、レビューで変化を見落としやすくなる。実際、構造データを catalog へ移した転記段（`materialize`）は `stats` / `types` / `abilities` を flow で書き出しており、catalog が flow と block の混在状態にあった。

検証方針は「tsc のみ」（[ADR 0010](./0010-tsc-only-verification.md)）で、不正は YAML → codegen → `tsc --noEmit` の型エラーとして弾く。しかし YAML が flow か block かは**データの正当性ではなくスタイルの問題**で、生成される値は同一のため tsc では表現・検出できない。一方、Champions M-A 全量（全186種）のような大量データを後から一括で block へ再整形すると巨大な diff とやり直しが発生する。全量投入の手前で「flow を許さない」仕組みを確定させ、最初から block で投入させたい。

## Decision

`data/` 配下の全 YAML を**ブロックスタイルに統一**し、flow 混入を**専用 CI ゲート `check:yaml-style` で強制**する。

- 検出は **AST ベースの純関数** `src/domain/yaml-block-style.ts`（`findFlowCollections`）が担う。`yaml` の `parseDocument` で AST を作り `flow === true` なコレクション（seq / map）を再帰検出して `path:line` を返す。正規表現で `[` / `{` を弾くと文字列値中の括弧で誤検出するため採らない。検出純関数はカバレッジ 100%。
- CLI 配線 `check:yaml-style`（`src/cli/commands/`）は `data/**/*.yaml`（`data/raw` は取得キャッシュなので対象外）を走査し、flow 検出時に**非0終了**して該当 `path:line` を報告する薄い層に徹する。
- 配線は local（`.githooks/pre-commit`）と CI（`pnpm verify`）の双方が同一スクリプトを呼ぶ。ゲートの置き場所は `.githooks` / `verify` に集約し二重実装しない（[ADR 0013](./0013-git-hooks-over-claude-hooks.md)）。
- 本ゲートは**「検証は tsc のみ」（[ADR 0010](./0010-tsc-only-verification.md)）の例外＝スタイル lint**として位置づける。型で表現できないスタイル規約は tsc-only の対象外カテゴリとして `verify` / `.githooks` に置く。
- 転記段 `materialize` は block スタイルで書き出す（flow ヘルパ廃止）。スコープは `data/` 配下限定（`team/` 配下の利用者 YAML は対象外）。block/flow 以外のスタイル（インデント幅・キー順・引用符）は対象にしない。

スタイル規約・配線の詳細は [data-pipeline.md](../../.claude/rules/data-pipeline.md) を正本とし、本 ADR からは参照する。

## Consequences

- **良い点**:
  - data YAML の diff が行単位で値変化を表し、レビュー追跡性が上がる。
  - 全量投入前に仕組みが確定し、後から全量を再整形し直す事故を防げる。
  - AST ベースのため文字列値中の括弧で誤検出しない。検出純関数はテスト済みで再利用可能。
- **悪い点 / コスト**:
  - tsc-only 検証に「スタイル lint」という別カテゴリのゲートが 1 つ増え、検証ゲートの種類が分散する。
  - block 化により行数は増える（flow より縦長になる）。
- **トレードオフ / 留意点**:
  - 既存 catalog（`species.yaml`）の block 再整形は機械的に行い、生成物（`data/generated/*.ts`）が等価（diff ゼロ）であることを確認して値不変を担保する。
  - 将来 `team/` 配下へ拡張する余地はあるが、glob と方針は別途検討する。

## Alternatives Considered

| 代替案 | 却下理由 |
|---|---|
| 正規表現で `[` / `{` を弾く | 文字列値中の括弧（例 `note: "see [a]"`）で誤検出する。AST の `flow` フラグを見るのが堅牢。 |
| Biome / 既存 formatter に委ねる | Biome は TS/JS 用で YAML の flow/block スタイルを矯正しない。専用ゲートが要る。 |
| tsc で表現する | flow/block は生成値が同一でデータの正当性問題ではないため、型では検出できない。 |
| スタイル統一せず混在を許容 | diff 追跡性の劣化と全量投入後の一括再整形コストが大きい。手前で仕組みを確定する方針を採る。 |
