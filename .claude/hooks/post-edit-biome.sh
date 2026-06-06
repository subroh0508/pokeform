#!/bin/sh
#
# post-edit-biome.sh — Claude 固有の即時フィードバック（補助・任意）
#
# Claude の PostToolUse(Edit) から呼ばれ、たった今編集された 1 ファイルにだけ
# `biome check` を走らせる。これは強制ゲートではない（強制ゲートは .githooks/ に
# 集約。ADR 0005-git-hooks-over-claude-hooks）。あくまで編集直後の素早い気づきが目的。
#
# 入力: stdin に PostToolUse の JSON。`tool_input.file_path` から対象ファイルを抽出する。
# 出力: Biome の結果のみ。フックは常に exit 0 で返し、編集フローをブロックしない。

# stdin の JSON を読む
input=$(cat)

# file_path を抽出（jq があれば優先、無ければ sed フォールバック）
if command -v jq >/dev/null 2>&1; then
  FILE=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
else
  FILE=$(printf '%s' "$input" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
fi

# 対象が無い / TS ソースでない / 実在しない場合は何もしない
[ -n "$FILE" ] || exit 0
case "$FILE" in
  *.ts | *.tsx) ;;
  *) exit 0 ;;
esac
[ -f "$FILE" ] || exit 0

echo "[post-edit-biome] biome check $FILE"
npx biome check "$FILE" || true

exit 0
