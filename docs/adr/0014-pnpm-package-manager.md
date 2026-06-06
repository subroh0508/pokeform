---
id: 0014
status: Accepted
date: 2026-06-07
---

# 0014. パッケージ管理に pnpm を採用する（corepack に依存しない）

## Context

Node.js（[ADR 0013](./0013-nodejs-runtime.md)）上で依存を管理するパッケージマネージャを選ぶ。ローカル・CI・コンテナ（[ADR 0018](./0018-dockerize-dev-ci.md)）で再現性のある install が要る。具体バージョンには言及しない（版の SoT は [ADR 0017](./0017-toolchain-version-source-of-truth.md)、lockfile = `pnpm-lock.yaml`）。

## Decision

パッケージ管理に **pnpm** を採用する。content-addressable store による省ディスク・高速 install と、厳密な依存解決（phantom dependency を防ぐ）が理由。**pnpm 自体の導入は corepack / `package.json` の `packageManager` フィールドに依存しない**（環境ごとに pnpm を直接インストールする。例: CI/コンテナは `npm install -g pnpm`）。pnpm の版を固定する仕組み（corepack）は持たず、版は [ADR 0017] の方針（最新追従）に委ねる。

## Consequences

- **良い点**: install が速く省容量。厳密な依存で「動くはずが動かない」を減らす。版固定の多重管理（corepack/packageManager）が無くなり、更新が軽い。
- **悪い点 / コスト**: pnpm の導入を各環境で別途用意する必要がある（corepack の自動 activate に頼らない）。
- **トレードオフ / 留意点**: 再現性は `pnpm-lock.yaml` のコミットで担保する（pnpm 本体の版固定ではなく lockfile で再現する）。

## Alternatives Considered

| 候補 | 却下理由 |
|---|---|
| **pnpm** | ✅ 採用。高速・省容量・厳密 deps |
| npm | 標準で追加導入不要だが、install が遅く node_modules が重い。厳密 deps の保証も弱い |
| Yarn | 高速だが pnpm ほどの省容量・厳密性は無く、設定の複雑さが増える |
| corepack + `packageManager` で版固定 | pnpm 版を宣言的に固定できるが、版を複数箇所で多重管理することになり（[ADR 0017] の SoT 一本化・最新追従方針と相反）、更新の妨げになるため**不採用**（本 ADR で明示的に外す） |
