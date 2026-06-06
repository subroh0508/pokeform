# pokeform — dev/CI 用 Docker イメージ（配布用ではない）
#
# 目的: ローカル / CI / コーディングエージェント（Claude Code・Codex）が同一環境で
#       `pnpm verify`（型 / テスト100% / lint）を回せるようにツールチェーンを固定する。
# 決定: ADR 0006-pin-toolchain-and-dockerize。
#
# バージョン整合: Node は .node-version / engines.node、pnpm は package.json の
#                 packageManager（= corepack で固定）と一致させること。
#
# 将来のマルチステージ化（build/publish 用）の指針:
#   - 下記 `base` を共有ステージとして使い、
#   - `FROM base AS build` で `pnpm build`（dist 生成）→
#   - `FROM node:24-slim AS runtime` に dist と本番依存のみコピー、
#     のように deps/build/runtime を分離できる構造にしている。
#   ライブラリ用途のため現時点では dev/CI 用の単一ステージのみ実装。

# ベースは LTS の Node 24（Debian slim）をピン留め。
# slim はネイティブ依存の互換性が alpine（musl）より高い。
# ベースイメージ更新は Phase 10 の Dependabot（docker エコシステム）で追従する。
FROM node:24-slim AS base

# corepack で pnpm を packageManager 指定（11.5.2）に固定。
# バージョンを Dockerfile に直書きせず packageManager から読ませることで多重管理を避ける。
RUN corepack enable
WORKDIR /app

# 依存解決のメタデータのみ先にコピーし、レイヤキャッシュを効かせる。
# packageManager フィールドから pnpm のバージョンを activate する。
COPY package.json pnpm-lock.yaml ./
# --ignore-scripts: `prepare`（git hooks 設定）はホスト dev 環境専用でコンテナでは不要かつ
#   git 不在で失敗するため、ライフサイクルスクリプトを無効化して依存のみ取得する。
RUN corepack prepare pnpm@11.5.2 --activate \
    && pnpm install --frozen-lockfile --ignore-scripts

# ソースをコピー（依存に変化が無ければ上のレイヤはキャッシュされる）。
COPY . .

# CI（GitHub Actions）でも同 Dockerfile を build して `pnpm verify` する想定。
# （ワークフロー実装は後続フェーズでも可。）
CMD ["pnpm", "verify"]
