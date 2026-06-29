---
paths:
  - "src/cli/**"
  - "src/io/**"
description: CLI と I/O の規約（lang のファイル単位宣言・--lang 表示言語・終了コード 0/非0・ディレクトリ再帰 glob・診断の YAML 行マッピング）。src/cli/ や src/io/ を扱うとき適用する。
last_modified: "2026-06-26T00:00:00+09:00"
adr:
  - "ADR 0014"
  - "ADR 0035"
---

# CLI / I/O の規約

入力ファイルの読み込みと CLI の振る舞いの規約。本 rule が規約 SoT で、設計俯瞰は [individuals-and-parties](../../docs/design/individuals-and-parties.md)、決定の「なぜ」は ADR `0014-yaml-lang-per-file`。CLI ルータは `cac`。

## 入力言語はファイル単位で宣言

- YAML / パーティ MD は**先頭の `lang: ja|en` 宣言で記述言語を 1 ファイル単位に固定**する（既定 `ja`）。
- loader/codegen は宣言言語に従い、**languages の forward マップ（`speciesNamesAll` / `moveNames` / `itemNames` 等・`id → { id, name }`）から実行時導出した照合テーブル**で**正規 ID へ正規化**してから型生成・検証する（ja は `reverseJa(forward)` で日本語名 → id 逆引き・en/id は forward のキー集合 `ids` で直接照合）。専用の生成逆引き `names.ts` は廃止・名前 SoT は languages（[[type-conventions]] / ADR 0035）。名前（en/ja）の取得元と権威序列（en = showdown 正 / Serebii 速報・ja = PokeAPI 正 / Serebii 速報）は [[data-pipeline]]（ADR 0039 / 0040）が SoT で、本 rule は languages dex を引く側に専念する。
- 名称正規化は**個体・パーティ・`regulation` を含む全フィールド**で `lang` 宣言に従う。一部フィールド（例 `emit-party` の `regulation`）が生値を素通りすると per-file lang 厳格化が崩れるため例外を作らない。
- **厳格化**: 宣言言語に一致しない名称（例 `lang: ja` なのに `species: pikachu`）はエラー。未知の名称は「不明な技『○○』」と**行番号付き**で報告する。

## 個体の対象レギュレーション宣言と fan-out（per-reg・ADR `0021`）

- 個体 YAML は対象レギュレーションを `regulations: [<id>...]`（**0〜N**）で宣言する。id は名称正規化しない（`champions-m-a` 等の安定 id をそのまま）。
- `emit-individual-ts` は**宣言レギュごとに** `ValidAbility<R,S,A>` / `ValidItem<R,S,I>` / `ValidMoves<R,S,Ms>` の `satisfies`（各 `// @source` 付き）を **fan-out** する。**宣言した全レギュで合法**な個体だけが通る（交差セマンティクス）。ある技が宣言レギュのいずれかで覚えないと**その行**が各レギュ分の `MoveNotLearnedBy<R,S,M>` になり `@source` で YAML 行へ逆引く。
- **空宣言 `regulations: []`** はどのレギュでも未解禁の無制約デモ個体（fan-out なし）。party 側の `validateParty` が未解禁混入として別途検出する。
- パーティ生成（`emit-party-ts`）は各メンバーが party の宣言レギュ `R` を `regulations` に含むかを `MemberDeclaresRegulation<R,Regs,S>` で検証し、含まないと `RegulationNotDeclaredByMember<S,R>` で弾く（メンバーが `R` で型検証されていない不整合の防止）。

## 表示言語は入力言語と独立

CLI 出力（エラー・`analyze:coverage` の表）の表示言語は `--lang ja|en`（既定 `ja`）で指定し、入力ファイルの `lang` とは**独立**。

## 終了コードとパス受理

- 整合 NG・脆弱警告（例 `weakCount ≥ 3`）など**問題検出時は非0終了**、正常時は 0（CI / エージェントが機械判定できる）。
- io 層の単体ロード（`load-individual` 等）でも**ポイント範囲・合計（`isValidPointAllocation`）と性格 up≠down を検証**し問題検出時は非0終了する。`stat` のような表示専用コマンドでも不正入力を黙認しない（誤った実数値の黙示表示を防ぐ）。
- 全コマンドは**ファイルパス or ディレクトリ（再帰 glob・`tinyglobby`）**を受け、ディレクトリ指定時は配下を再帰処理する。

## 診断の整形

tsc の型エラーは生成 TS の `// @source` コメントを使って**元の YAML/MD 行へ逆引き**し、人間 / エージェント向けに整形する（[[tsc-verification]]）。
