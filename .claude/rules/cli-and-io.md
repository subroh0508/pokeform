---
paths:
  - "src/cli/**"
  - "src/io/**"
description: CLI と I/O の規約（lang のファイル単位宣言・--lang 表示言語・終了コード 0/非0・ディレクトリ再帰 glob・診断の YAML 行マッピング）。src/cli/ や src/io/ を扱うとき適用する。
---

# CLI / I/O の規約

入力ファイルの読み込みと CLI の振る舞いの要点。正本は `docs/plan/01-mvp/architecture.md`（「入力フォーマット例」/「CLI コマンド体系」節）と ADR `0007-yaml-lang-per-file`。CLI ルータは `cac`。

## 入力言語はファイル単位で宣言

- YAML / パーティ MD は**先頭の `lang: ja|en` 宣言で記述言語を 1 ファイル単位に固定**する（未指定時の既定は `ja`）。
- loader/codegen は宣言言語に従って全名称フィールドを解決し、双方向名称マップ（`IdByJaName` / `IdByEnName`、[[type-conventions]]）で**正規 ID へ正規化**してから型生成・検証する。
- **厳格化**: 宣言言語に一致しない名称（例 `lang: ja` なのに `species: pikachu`）はエラー。フィールド混在を許さず曖昧さを排除する。未知の名称は「不明な技『○○』」と**行番号付き**で報告。

## 表示言語は入力言語と独立

- CLI 出力（エラー・`analyze:coverage` の表）の表示言語は `--lang ja|en`（既定 `ja`）で指定。入力ファイルの `lang` とは**独立**。

## 終了コードとパス受理

- 整合 NG・脆弱警告（例 `weakCount ≥ 3`）など**問題検出時は非0終了**、正常時は 0。CI / エージェントが機械判定できるようにする。
- 全コマンドは**ファイルパス or ディレクトリ（再帰 glob）**を受ける（`tinyglobby`）。ディレクトリ指定時は配下を再帰的に処理する。

## 診断の整形

tsc の型エラーは生成 TS の `// @source` コメントを使って**元の YAML/MD 行へ逆引き**し、人間 / エージェント向けに整形する（[[tsc-verification]]）。
