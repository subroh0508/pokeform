---
id: 0018
status: Accepted
date: 2026-06-07
---

# 0018. dev / CI 用に Docker 化する

## Context

コーディングエージェント・ローカル・CI が**同一環境**で `pnpm verify` を回せないと「自分の環境では緑」問題が起き、検証ゲート（[ADR 0005](./0005-git-hooks-over-claude-hooks.md)）の信頼性が損なわれる。ランタイム（[ADR 0013](./0013-nodejs-runtime.md)）/ パッケージ管理（[ADR 0014](./0014-pnpm-package-manager.md)）の差で結果が変わるのを防ぎ、再現性を確保したい。具体バージョンには言及しない（版の SoT は [ADR 0017](./0017-toolchain-version-source-of-truth.md)）。

## Decision

**dev / CI 用に Docker 化**する（配布用ではない）。Node 公式 slim イメージをベースに、pnpm は **corepack を使わず直接インストール**（`npm install -g pnpm`、[ADR 0014]）、`pnpm install --frozen-lockfile` で lockfile に従って依存を再現し、`CMD ["pnpm","verify"]` を既定にする。ベースイメージの Node 版は **`.node-version`（Node の SoT、[ADR 0017]）に整合**させ、更新は Dependabot（docker エコシステム）で追従する。CI（GitHub Actions）も同 Dockerfile を build して `pnpm verify` する。

## Consequences

- **良い点**: ローカル・CI・エージェント・コンテナで同一環境が保証され、検証結果が再現可能。pnpm 版固定（corepack）に頼らず lockfile で再現する。
- **悪い点 / コスト**: Docker ビルド・イメージ管理のコストが増える。ベースイメージ更新の追従が要る（Dependabot で軽減）。
- **トレードオフ / 留意点**: 配布用ではなく dev/CI 用。ベース版は `.node-version` を SoT とし Dockerfile に確定版を別管理しない。

## Alternatives Considered

| 候補 | 却下理由 |
|---|---|
| **dev/CI 用 Docker 化** | ✅ 採用。同一環境で verify を再現できる |
| 非コンテナ（各自ローカル環境） | 「自分の環境では緑」問題を防げず、検証ゲートの信頼性が落ちる |
| devcontainer | エディタ統合には良いが、CI と同一の verify 実行基盤としては Dockerfile + compose の方が CI に直結して扱いやすい |
| ベースを alpine に | 軽量だが musl 由来のネイティブ依存互換性問題が出やすい → Debian slim を採る |
