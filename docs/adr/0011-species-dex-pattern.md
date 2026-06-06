---
id: 0011
status: Accepted
date: 2026-06-07
---

# 0011. 種族・技・タイプ・特性・持ち物を `XxxBase` + `XxxDex` パターンで統一し、種族粒度で表現する

## Context

全国図鑑 1000+ 種スケールのポケモンデータを TypeScript の型で表現する必要がある。巨大 union（`VoltTackle | … 1000+`）は tsc の分配コストが重く、[ADR 0010](./0010-tsc-only-verification.md)（tsc のみ検証）の性能前提を壊しかねない。また、種族値が変わるフォルム/リージョン/メガ（`charizard` と `charizard-mega-x` 等）をどう同一視・区別するかの粒度も定める必要がある。英名（安定 ID）と日本語名の双方で記述できる入力も要件。

## Decision

エンティティ（種族 / 技 / タイプ / 特性 / 持ち物）を**親型 `XxxBase` + エントリごとの子型 + `XxxDex` インターフェースに ID キーで集約 + `XxxId = keyof XxxDex`** の統一パターンで定義する。制約は巨大 union ではなく `XxxDex[Id]` のプロパティアクセス主体で行い、union 分配コストを回避する。粒度は「**種族値が一意に定まる単位 = 1 種族**」を `SpeciesId`（kebab-case の安定キー）とし、種族値が変わるフォルム/メガは別 `SpeciesId`。英名 ID を型キー、日本語名を `name` プロパティ + 双方向マップ（`JaName<Id>` / `IdByJaName<...>`）で持つ。詳細は `docs/plan/01-mvp/architecture.md`（種族の型表現節）。

## Consequences

- **良い点**: 4 エンティティが構造的に共通になり、汎用ヘルパ（名前解決・逆引き）を共通化できる。`XxxDex[Id]` アクセスで tsc 性能を保つ。日英どちらの入力も型で解決できる。
- **悪い点 / コスト**: 各エントリを子型として specialize した巨大な `Dex` を codegen が生成するため、生成物が大きい。
- **トレードオフ / 留意点**: メガは素種族で個体定義し `megaEvolvesTo` リンクでメガ後を分析参照する二重表現になる（直感性と正確さの両立）。性能が問題化したらモジュール分割で対応する。

## Alternatives Considered

- **全エントリを巨大 union で表現**（`"volt-tackle" | … | 1000+`）: 直感的だが union 分配が tsc のコンパイルコストを爆発させる。`XxxDex[Id]` のプロパティアクセス主体に切り替え、分配コストを回避する方を採用。
