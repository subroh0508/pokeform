---
name: review-party
description: >-
  パーティ（個体 YAML + パーティ MD）の整合性と技範囲・防御弱点を CLI で一括チェックして要約する。
  「パーティを見て」「この構築をチェック」「パーティの弱点を分析して」「review-party <path>」
  「team/ のパーティをレビュー」「弱点集中や技範囲の穴を確認して」と言われたとき、または個体 /
  パーティファイルを編集してブラッシュアップしたいときに使う。`check:party`（参照切れ / 同種族重複 /
  未解禁 / 体数）と `analyze:coverage`（弱点集中 / 技範囲の穴）を実行し、終了コードと指摘を要約する。
  生成データ自体の妥当性レビューは `pokemon-data-reviewer` agent を使う（こちらは利用者向けパーティ点検）。
allowed-tools: Bash(pnpm *), Bash(node src/cli/*)
---

# review-party — パーティの整合性 + 技範囲/弱点を一括点検する

pokeform の利用者（コーディングエージェント / 人間）が、育成済みパーティをブラッシュアップする際の
**一括点検エントリ**。MVP の 2 コマンド（`check:party` / `analyze:coverage`）を順に実行し、
**機械判定可能な終了コード**と指摘を 1 つの要約にまとめる。検証ロジックは CLI / domain に委譲し、
本 skill は実行と要約に徹する（機械ゲートを再実装しない・[[skill-authoring]]）。

## 役割

- パーティ整合性（`check:party`）と技範囲・防御弱点（`analyze:coverage`）を**続けて実行**する。
- それぞれの**終了コード**（0 = 健全 / 非0 = 問題あり）を確認し、問題があれば指摘を要約する。
- 入力言語はファイル単位の `lang` 宣言に従う。表示は `--lang ja|en`（既定 ja・[[cli-and-io]]）。

## 入力 / 出力

- **入力**: パーティ Markdown のパス、またはパーティを含むディレクトリ（再帰）。例 `team/parties/` /
  `team/parties/standard.md`。任意で表示言語 `--lang`。
- **出力**: 2 コマンドの実行結果サマリ（整合性の指摘・弱点集中・技範囲の穴）と、総合判定
  （いずれかが非0なら「要修正」）。次の一手（例: 弱点集中タイプへの受けを足す / 技範囲の穴を埋める）を簡潔に添える。

## 手順

1. `pnpm check:party <path> --lang <lang>` を実行し、終了コードと指摘を読む。
2. `pnpm analyze:coverage <path> --lang <lang>` を実行し、終了コードと弱点/穴を読む。
3. 2 つの結果を 1 つの要約にまとめ、`✅ 健全` または `❌ 要修正（N 件）` を冒頭に置く。

## Gotchas

- **機械ゲートを再実装しない**: 整合 / 弱点判定は CLI（domain 純関数）に委譲する。skill 内で再計算しない。
- **終了コードが正**: 出力テキストでなく**終了コード**で機械判定する（CI / エージェントが分岐できる）。
- **対象を取り違えない**: 利用者パーティの点検が本 skill。生成データ（`src/generated`）の妥当性レビューは
  `pokemon-data-reviewer` agent の責務。

## 関連

- コマンド仕様: `docs/plan/01-mvp/architecture.md`（CLI コマンド体系）/ [[cli-and-io]]。
- 分析アルゴリズム: `src/domain/coverage.ts` / `src/domain/type-effectiveness.ts`。
- skill 作成方針: [[skill-authoring]] / cross-agent 配置: [[cross-agent]]。
