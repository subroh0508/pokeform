# pokeform — dev/CI 用 Docker イメージ（配布用ではない）
#
# 目的: ローカル / CI / コーディングエージェント（Claude Code・Codex）が同一環境で
#       `pnpm verify`（型 / テスト100% / lint）を回せるようにする。
# 決定: ADR 0009-dockerize-dev-ci（Docker 化） / 0005-pnpm-package-manager（pnpm・corepack 非依存）。
#
# バージョンの SoT は package.json / pnpm-lock.yaml / .node-version（ADR 0008）。
# Node 版は .node-version に整合させ、pnpm は版を固定せず直接インストールする。
#
# 将来のマルチステージ化（build/publish 用）の指針:
#   - 下記 `base` を共有ステージとして使い、
#   - `FROM base AS build` で `pnpm build`（dist 生成）→
#   - `FROM node:24-slim AS runtime` に dist と本番依存のみコピー、
#     のように deps/build/runtime を分離できる構造にしている。
#   ライブラリ用途のため現時点では dev/CI 用の単一ステージのみ実装。

# ベースは Node の Debian slim イメージ。slim はネイティブ依存の互換性が alpine（musl）より高い。
# タグの Node メジャーは .node-version（Node の SoT）に整合させ、更新は Dependabot（docker エコシステム）で追従する。
FROM node:24-slim AS base

# pnpm は corepack を使わず直接インストールする（ADR 0005）。版は固定せず最新を取り、
# 依存の再現性は pnpm-lock.yaml で担保する（ADR 0008）。
RUN npm install -g pnpm
WORKDIR /app

# 依存解決のメタデータのみ先にコピーし、レイヤキャッシュを効かせる。
COPY package.json pnpm-lock.yaml ./
# --ignore-scripts: `prepare`（git hooks 設定）はホスト dev 環境専用でコンテナでは不要かつ
#   git 不在で失敗するため、ライフサイクルスクリプトを無効化して依存のみ取得する。
RUN pnpm install --frozen-lockfile --ignore-scripts

# ソースをコピー（依存に変化が無ければ上のレイヤはキャッシュされる）。
COPY . .

# CI（GitHub Actions）でも同 Dockerfile を build して `pnpm verify` する想定。
# （ワークフロー実装は後続フェーズでも可。）
CMD ["pnpm", "verify"]
