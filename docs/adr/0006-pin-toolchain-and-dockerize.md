---
id: 0006
status: Accepted
date: 2026-06-07
---

# 0006. ツールチェーンのバージョンをピン留めし、dev/CI 用に Docker 化する

## Context

コーディングエージェント・ローカル・CI が**同一環境**で `pnpm verify` を回せないと、「自分の環境では緑」問題が起き、検証ゲート（[ADR 0005](./0005-git-hooks-over-claude-hooks.md)）の信頼性が損なわれる。Node / pnpm / TypeScript のバージョン差で結果が変わるのを防ぎ、再現性を確保する必要がある。

## Decision

ツールチェーンのメジャーバージョンを固定する: **Node.js 24（LTS）** / **pnpm 11.5.x**（`packageManager` + corepack）/ **TypeScript 6**（7.0 はネイティブ移植 β のため不採用）/ Vitest 4 / Biome 2。マイナー・パッチは最新を採用し、以後は Dependabot + `dep-update` skill で追従する。加えて **dev/CI 用に Docker 化**（`node:24-slim` ベース、`corepack prepare pnpm@<pinned>`、`pnpm install --frozen-lockfile`、`CMD ["pnpm","verify"]`）し、Node バージョンを `Dockerfile` / `engines.node` / `.node-version` / `packageManager` の 4 箇所で一致させる。配布用ではなく dev/CI 用。詳細は `docs/plan/00-harness-setup/phase-05-toolchain-and-versions.md` / `phase-06-dockerize.md`。

## Consequences

- **良い点**: ローカル・CI・エージェント・コンテナで同一バージョンが保証され、検証結果が再現可能になる。
- **悪い点 / コスト**: バージョン更新時に複数箇所の同期が要る（Dependabot で軽減）。Docker ビルド・イメージ管理のコストが増える。
- **トレードオフ / 留意点**: TS 7.0（ネイティブ移植）や Node 26 等の最新は安定性を優先して見送り、LTS / 安定版を採る。`node:24-slim`（Debian slim）は alpine よりネイティブ依存互換性が高い。

## Alternatives Considered

- **TypeScript 7.0 を採用**: ネイティブ移植で高速だが β のため安定性に欠ける → 不採用、TS 6 を採る。
- **Node.js 26 を採用**: 新しいが LTS 化前（2026-10）で安定性優先に反する → 不採用、LTS の Node 24。
- **Docker ベースを alpine に**: 軽量だが musl 由来の互換性問題が出やすい → `node:24-slim`（Debian slim）を採用。
