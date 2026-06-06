---
id: 0007
status: Accepted
date: 2026-06-07
---

# 0007. Linter / Formatter に Biome を採用する

## Context

検証ゲート（[ADR 0013](./0013-git-hooks-over-claude-hooks.md)）は lint を含む（`biome check .`）。スタイル・規約は機械に委譲し、エージェントの指示には書かない方針（cross-agent / skill-authoring）。Lint と format を担うツールが要る。具体バージョンには言及しない（版の SoT は [ADR 0008](./0008-toolchain-version-source-of-truth.md)）。

## Decision

Linter / Formatter に **Biome** を採用する。lint と format を**単一ツール・単一設定**で高速に実行でき、ESLint + Prettier の二本立て構成より設定とドリフトが少ないのが理由。`biome check .` を検証ゲートの lint ステップにする。

## Consequences

- **良い点**: lint+format が 1 ツールで完結し設定が単純・高速。スタイルを機械強制でき、指示資産から版・規約を排除できる。
- **悪い点 / コスト**: ESLint の膨大なプラグイン資産は使えない（特殊ルールは自前 or 断念）。
- **トレードオフ / 留意点**: スタイルは Biome に一任し、`AGENTS.md` / rules に再記述しない（機械が強制できるものを指示に書かない）。

## Alternatives Considered

| 候補 | 却下理由 |
|---|---|
| **Biome** | ✅ 採用。lint+format 単一ツール・高速・設定単純 |
| ESLint + Prettier | 実績・プラグインは豊富だが、2 ツール 2 設定で構成が重く、両者の責務境界やルール競合の管理コストがかかる |
| ESLint 単体 | format を別途用意する必要があり、結局二本立てに戻る |
| Oxlint | Rust 製で非常に高速だが、現状は lint 専用で format を持たず（別途 formatter が要る）、ルールセットの成熟度・エコシステムが Biome より発展途上。lint+format 一体・単一設定の利点で Biome を採る |
