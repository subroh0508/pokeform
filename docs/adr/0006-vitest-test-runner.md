---
id: 0006
status: Accepted
date: 2026-06-07
---

# 0006. テストランナーに Vitest を採用する

## Context

検証ゲート（[ADR 0013](./0013-git-hooks-over-claude-hooks.md)）はテストとカバレッジ 100% を含む（`pnpm test:cov`）。TypeScript（[ADR 0003](./0003-typescript-language.md)）/ ESM で書くコードを、設定の手間少なく実行・計測できるテストランナーが要る。具体バージョンには言及しない（版の SoT は [ADR 0008](./0008-toolchain-version-source-of-truth.md)）。

## Decision

テストランナーに **Vitest** を採用する。TypeScript / ESM をネイティブに扱え、トランスパイル設定がほぼ不要で、`@vitest/coverage-v8` によりカバレッジ計測まで一体で揃うのが理由。検証ゲートの「テスト 100% カバレッジ」を最小設定で満たせる。

## Consequences

- **良い点**: TS/ESM をそのまま実行でき設定が軽い。カバレッジ(v8)込みで verify ゲートに直結。高速。
- **悪い点 / コスト**: Jest ほどのプラグイン資産の蓄積は無い。
- **トレードオフ / 留意点**: 機械ゲート（カバレッジ閾値）は Git hooks / CI 側で強制し、テストランナーの選択に依存させない（[ADR 0013]）。

## Alternatives Considered

| 候補 | 却下理由 |
|---|---|
| **Vitest** | ✅ 採用。TS/ESM ネイティブ・カバレッジ一体・高速 |
| Jest | 実績豊富だが ESM/TS で追加設定（トランスフォーム）が要り、設定コストが高い |
| node:test（標準） | 追加依存ゼロだが、カバレッジ・watch・アサーション周りの体験が薄く、verify ゲートを軽く組むには不足 |
