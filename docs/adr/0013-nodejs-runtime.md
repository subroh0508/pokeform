---
id: 0013
status: Accepted
date: 2026-06-07
---

# 0013. ランタイムに Node.js を採用する

## Context

pokeform は TypeScript（[ADR 0012](./0012-typescript-language.md)）で書く npm モジュール兼 CLI で、ローカル・CI・コーディングエージェント（Claude Code / Codex）が同一環境で `pnpm verify` を回す（[ADR 0018](./0018-dockerize-dev-ci.md)）。実行ランタイムを選ぶ必要がある。具体バージョンには言及しない（版の SoT は [ADR 0017](./0017-toolchain-version-source-of-truth.md)、Node の版は `.node-version`）。

## Decision

ランタイムに **Node.js** を採用する。理由は、npm エコシステムの事実上の標準ランタイムで、TypeScript ツールチェーン（tsc / Vitest / Biome）・パッケージ管理（[ADR 0014](./0014-pnpm-package-manager.md)）・エージェントツールが最も厚くサポートし、LTS による安定供給があるため。

## Consequences

- **良い点**: npm エコシステム・ツール・エージェントとの互換性が最大。LTS で安定。Docker 公式イメージが豊富（[ADR 0018]）。
- **悪い点 / コスト**: 起動・実行速度は新興ランタイムに劣る場面がある。
- **トレードオフ / 留意点**: ランタイム固有 API への依存は最小化し、標準的な Node API に留める（将来の選択肢を狭めないため）。

## Alternatives Considered

| ランタイム | 却下理由 |
|---|---|
| **Node.js** | ✅ 採用。npm 標準・ツール/エージェント互換最大・LTS で安定 |
| Bun | 高速で TS をネイティブ実行できるが、エコシステム/エージェントツールの互換が発展途上。検証ゲートの信頼性を最優先するため見送り |
| Deno | TS ファースト・セキュアだが npm 互換に癖があり、既存 npm ツール前提のハーネスと噛み合いにくい |
