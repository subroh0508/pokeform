# Phase 6 — Docker 化（再現可能な dev/CI 環境）

## 目的 / スコープ

ツールチェーンをコンテナで揃え、ローカル・CI・コーディングエージェント（Codex 含む）が**同一環境**で `verify` を回せるようにする。ライブラリ用途のため**配布用ではなく dev/CI 用**。Docker 化の決定は ADR `0018-dockerize-dev-ci`（旧 `0006` を分割・archive）。

## 前提（依存）

- Phase 5（`package.json` の scripts / lockfile が存在）。

## タスク

- [ ] `Dockerfile`:
  - [ ] ベース `node:<slim>`（タグの Node メジャーは `.node-version` に整合。版は SoT に従い固定方針は持たない＝ADR 0017）
  - [ ] pnpm は corepack を使わず直接インストール（`npm install -g pnpm`＝ADR 0014。版は固定しない）
  - [ ] `pnpm-lock.yaml` を先にコピー → `pnpm install --frozen-lockfile`（レイヤキャッシュ）→ ソースをコピー
  - [ ] デフォルト `CMD ["pnpm", "verify"]`
  - [ ] 将来の build/publish 用にマルチステージ化できる構造をコメントで明示
- [ ] `.dockerignore`: `node_modules` / `dist` / `coverage` / `data/raw` / `.git` / `*.log`
- [ ] `compose.yaml`: 開発用サービス（カレントをマウント、`pnpm-store` をボリュームキャッシュ、`command: pnpm verify` または対話シェル）
- [ ] **Node 版整合**: `Dockerfile` のタグ / `engines.node` / `.node-version` を整合させる（pnpm は版を固定しない）

## 受け入れ基準

- `docker build -t pokeform .` が成功する。
- `docker compose run --rm app pnpm verify` がコンテナ内で緑。
- コンテナ内 `node -v` が `.node-version` に整合し、`pnpm -v` が取得できる。
- Node 版が `Dockerfile` タグ / `engines.node` / `.node-version` で一致している。

## 検証手順

1. `docker build -t pokeform .` → 成功。
2. `docker compose run --rm app pnpm verify` → 緑。
3. `docker compose run --rm app sh -c "node -v && pnpm -v"` で版を確認。

## リスク・備考

- `node:24-slim`（Debian slim）はネイティブ依存の互換性が alpine より高め。alpine 採用時は musl 由来の差異に注意。
- CI（GitHub Actions）で同 `Dockerfile` を使い `verify` する想定はコメントで残す（ワークフロー実装は後続でも可）。
- ベースイメージ更新は Phase 10 の Dependabot（docker エコシステム）で追従。
