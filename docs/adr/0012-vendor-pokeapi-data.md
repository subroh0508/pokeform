---
id: 0012
status: Accepted
date: 2026-06-07
---

# 0012. PokeAPI データは vendor 方式で生成・コミットする

## Context

種族値・タイプ・覚える技・特性・持ち物・日本語名は PokeAPI から取得できる。これを実行時に都度フェッチすると、オフラインで動かない・CI が遅い・外部 API の変動で結果が非決定的になる、という問題が生じる。一方、レギュレーション解禁リストや能力ポイント仕様（66 / 32）は PokeAPI に存在せず、手動管理が要る。

## Decision

PokeAPI データは **vendor 方式**（ビルド時取得→整形→`data/generated/` をコミット）を採る。`scripts/fetch-pokeapi.ts` が `data/raw/`（gitignore）にキャッシュし、`scripts/generate.ts` が raw と手動管理の `data/champions/*.yaml`（rules / regulation / overrides）を合成して `data/generated/`（コミット）を出力する。**MVP 時点で全国図鑑の全種族分を生成**しておく。詳細は `docs/plan/01-mvp/architecture.md`（データ生成パイプライン節）。

## Consequences

- **良い点**: オフライン・決定論的・CI 高速。生成物が型として常に存在するため、エージェントは外部依存なしに整合検証できる。
- **悪い点 / コスト**: 生成データをコミットするためリポジトリが肥大化する。PokeAPI 更新の追従は再生成が要る。
- **トレードオフ / 留意点**: `data/raw` のみ gitignore、`data/champions`（手動）と `data/generated`（生成・コミット）は版管理する。PokeAPI に無い情報（解禁レギュ等）は `data/champions/` が唯一のソース。生成物への手編集は禁止（codegen が正）。

## Alternatives Considered

- **実行時に PokeAPI をフェッチ**: 常に最新を取れるが、オフライン不可・CI が遅い・ネットワーク依存で非決定的になる。ビルド時取得→整形→`data/generated/` をコミットする vendor 方式で決定性と CI 速度を優先。
