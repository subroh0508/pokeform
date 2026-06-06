---
id: 0017
status: Accepted
date: 2026-06-07
---

# 0017. ツールチェーンのバージョンは package.json / lockfile / .node-version を唯一の情報源とし、メジャー含め最新追従する

## Context

ツールチェーン（言語 [ADR 0012] / ランタイム [ADR 0013] / パッケージ管理 [ADR 0014] / テスト [ADR 0015] / Linter [ADR 0016]）の**具体バージョン**を、ADR・README・Dockerfile・skill など**複数箇所に再掲**すると、更新のたびに全箇所を同期する必要が生じ、ドリフトと「迅速なアップデートの妨げ」を招く。旧 [ADR 0006](./archive/0006-pin-toolchain-and-dockerize.md)（archive）はメジャー固定 + 多要素混載でこの問題を抱えていた。バージョンを「どこで宣言し、どう更新するか」を一本化する必要がある。

## Decision

ツールチェーンのバージョンの**唯一の情報源（SoT）**を次に定める。**ドキュメント・ADR・各種コメントに具体バージョンを再掲しない**（必要なときは SoT を参照する）。

- 依存パッケージ（TypeScript / Vitest / Biome 等）: **`package.json` の `devDependencies`（exact pin）+ `pnpm-lock.yaml`**。
- Node.js: **`.node-version`**（+ `engines.node` は soft floor）。

更新方針は **「メジャー含め最新追従」**。Dependabot が更新 PR を作り、`dep-update` skill が `pnpm verify` / CI 緑を確認して取り込む。メジャー更新も原則固定せず追従する（破壊的変更のリスクは verify / CI と人手レビューで吸収し、方針として事前にブロックしない）。再現性は lockfile のコミットで担保する（ツール本体の版固定や corepack には依存しない、[ADR 0014]）。

## Consequences

- **良い点**: バージョンが 1 箇所に集約され、更新が SoT + lockfile の変更だけで済む。ドキュメントのドリフトが起きない。メジャーも含め素早く追従できる。
- **悪い点 / コスト**: メジャー追従はまれに破壊的変更を引き込む。verify / CI と `dep-update` のレビューで受け止める必要がある。
- **トレードオフ / 留意点**: 「確定バージョン表」のような静的な版一覧は持たない。版を知りたいときは SoT（package.json / lockfile / .node-version）を見る。

## Alternatives Considered

| 候補 | 却下理由 |
|---|---|
| **SoT 一本化 + メジャー追従** | ✅ 採用。再掲なし・更新が軽い・追従が速い |
| 複数箇所に確定版を再掲（旧 0006 方式） | 版を ADR/README/Dockerfile/skill に直書きするため、更新時に全同期が要りドリフトする。迅速なアップデートを妨げる |
| メジャーを LTS/安定版に固定 | 安定はするが、版を「固定方針」として宣言する分だけ更新が止まりやすい。安定性は verify/CI + レビューで担保し、方針では固定しない |
