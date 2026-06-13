# Phase 15 — data/ 全 YAML にブロックスタイルを強制する CI ゲート新設（+ materialize block 出力・既存再整形）

## 目的 / スコープ

`data/` 配下の YAML は手編集 SoT（catalog / regulations / rules）であり、**flow スタイル**（`[ a, b ]` /
`{ k: v }` のインライン記法）と**ブロックスタイル**が混在すると、diff の可読性が落ち、レビューで値の変化を
追いにくくなる。実際 Phase 13 の `materialize.ts` は `stats` / `types` / `abilities` を flow で書き出しており、
`catalog/species.yaml` は flow と block が混在している。本 Phase で **`data/` 配下の全 YAML に flow 混入を
許さない CI ゲート**を新設し、(1) `materialize.ts` を block 出力へ変更、(2) 既存 data YAML を block へ再整形する。
**M-A 全量投入（Phase 16）の手前**に置き、全186種という大量データが最初から block スタイルで入るようにして、
後から全量を再整形するやり直しを防ぐ（Phase 10 / 13 と同じ「全量の手前で仕組みを確定」論理）。

- スコープ内:
  - **flow 検出ロジック（新設・src/）**: `yaml` ライブラリ（既存依存）の `parseDocument` で各 YAML を AST に
    し、`isCollection(node) && node.flow === true` なコレクション（seq / map）を再帰的に検出して位置
    （path・行番号）を返す純関数。**コロケーション test でカバレッジ 100%**（ドメインロジック）。
  - **専用 check コマンド（新設）**: `data/**/*.yaml` を走査し flow 検出で**非0終了**、該当 `path:line` を
    報告する CLI コマンド（例 `check:yaml-style`・コマンド名は実装で確定）。`src/cli/commands/` に薄く追加し
    検出は上記純関数へ委譲。glob 対象・除外（`data/raw` は .gitignore のキャッシュなので対象外）を明示。
  - **検証ゲートへの配線**: `pnpm verify`（型 / テスト / Biome）に本 check を組み込む。`.githooks/`
    （pre-commit / pre-push）と CI（`.github/workflows/ci.yml`）の両方で自動強制される導線を確認する。
    配線先（verify に足すか .githooks 直か）は [ADR 0013] のゲート方針に沿って実装で確定。
  - **`materialize.ts` を block 出力へ変更**: `flow` ヘルパ（`node.flow = true`）を撤去し、`stats` / `types` /
    `abilities` / `category` 等を block スタイルで書き出す。`src/codegen/materialize.ts` 側の影響を確認。
  - **既存 data YAML の block 再整形**: `catalog/{species,items,moves,abilities,types}.yaml` /
    `regulations/{champions-m-a,champions-m-b}.yaml` / `rules.yaml` の flow ノードを block へ整形する。
    **`generate:data` の生成物 `data/generated/*.ts` はパース結果が同一のため等価**（diff ゼロをスポット確認）。
  - **Markdown / rule 追従**: `.claude/rules/data-pipeline.md`（data YAML は block スタイル規約・新ゲートの明記）/
    `data/README.md`（取得・更新導線に check コマンドを追記）/ 必要に応じ `cli-and-io.md`。
  - **ADR 起票（`adr-new`・要否を判断）**: 「data YAML は block スタイルを CI ゲートで強制する」決定。
    検証は tsc のみ方針（[ADR 0010]）の**例外＝スタイル lint は型で表現できない**ため別カテゴリのゲートを
    置く、という線引きを残す価値があれば起票する。
- スコープ外:
  - **`team/` 配下の利用者 YAML**（個体・パーティ）。本 Phase は「data 配下」に限定する。将来 team/ へ広げる
    余地は備考に残す（拡張は別 Phase）。
  - インデント幅・キー順・引用符など **block/flow 以外の YAML スタイル**（Biome / 既存慣習に委ね、本 Phase では
    flow 排除のみ）。
  - M-A 全量データの投入そのもの（**Phase 16**）。本 Phase は**仕組み（ゲート）+ 既存分の整形**に徹する。
  - 新機能・01-mvp の機能拡張・generate / スキーマの再設計（確定済み）。

## 前提（依存）

- **Phase 13（構造データの catalog 化）完了**。`materialize.ts` が `stats` / `types` / `abilities` を flow で
  書き出しており、本 Phase はその出力を block へ変え、既存 catalog の flow を整形する（発生源を断つ）。
- **Phase 14（data/ ディレクトリ説明 README）完了**。`data/README.md` の取得・更新導線へ新 check コマンドを
  追記できる最終形が整っている。
- 確定済み rule: [[data-pipeline]] / [[cli-and-io]] / [[testing]] / [[tsc-verification]] / [[cross-agent]] /
  [[adr]]。
- 関連 ADR: [ADR 0010]（検証は tsc のみ・本 Phase はスタイル lint としてその例外を線引き）/ [ADR 0013]
  （ゲートは `.githooks`・本 Phase の配線先方針）/ [ADR 0023]（`check:regulation` の check コマンド前例）。

[ADR 0010]: ../../adr/0010-tsc-only-verification.md
[ADR 0013]: ../../adr/0013-git-hooks-over-claude-hooks.md
[ADR 0023]: ../../adr/0023-generate-transformer-and-check-regulation.md

## タスク

- [ ] **flow 検出純関数の実装（src/）**: `parseDocument` の AST を再帰的に歩き flow コレクションの位置
      （path・行番号）を列挙する純関数を新設。コロケーション test でカバレッジ 100%（flow seq / flow map /
      ネスト / block のみ＝検出ゼロ、の各分岐）。
- [ ] **check コマンド新設**: `data/**/*.yaml`（`data/raw` 除く）を走査し flow 検出で非0終了・`path:line` を
      報告する CLI コマンドを `src/cli/commands/` に追加（検出は純関数へ委譲・薄い層）。`package.json` に
      `check:yaml-style` 等の script を追加。
- [ ] **検証ゲート配線**: `pnpm verify` もしくは `.githooks` に本 check を組み込み、local hook + CI 双方で
      強制されることを確認（ゲート二重化を避け [ADR 0013] の置き場所方針に従う）。
- [ ] **`materialize.ts` を block 出力化**: `flow` ヘルパ（`node.flow = true`）を撤去し block 出力へ。
      `src/codegen/materialize.ts` の関連も追従。
- [ ] **既存 data YAML を block 再整形**: 8 ファイルの flow ノードを block へ整形。`generate:data` 後の
      `data/generated/*.ts` が**等価（diff ゼロ）**であることをスポット確認。
- [ ] **Markdown / rule 追従**: `data-pipeline.md`（block スタイル規約 + 新ゲート）/ `data/README.md`
      （check コマンド導線）追記。`rules-index.md` は生成物のため手編集しない。
- [ ] **ADR 起票（要否判断・`adr-new`）**: 新ゲート（スタイル lint）の決定を残す価値があれば起票。
- [ ] 検証フェーズ実施（下記「検証手順」）。

## この Phase で育てるハーネス（rule・skill）

- **rule 追従**: [[data-pipeline]]（data YAML = block スタイル・flow 禁止ゲートの明記）・必要に応じ [[cli-and-io]]
  （新 check コマンド）。
- **ADR**: 要否を判断し、新ゲート種別（型で表現できないスタイル lint を verify/githooks に置く）を残すなら
  `adr-new` で起票（[[adr]]・可変 plan 参照を本文に書かない）。
- skill 改修は原則なし（`survey-regulation` の materialize 手順は block 出力化で自然に追従）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome / **新 YAML スタイルゲート**）が緑。
- `data/` 配下の YAML に flow スタイル（`[ ]` / `{ }` のインライン）が**1 箇所も無い**（全 block）。
- 新 check コマンドが `data/**/*.yaml` に flow を**1 つでも入れると非0終了**し、該当 `path:line` を報告する
  （AST ベース・正規表現でない）。検出ロジックはカバレッジ 100%。
- 本ゲートが **local（.githooks）と CI の双方**で強制される。
- `materialize.ts` が block スタイルで書き出す（再実行しても flow を生まない）。
- 既存 data YAML の block 再整形後、`data/generated/*.ts` が再整形前と**等価**（生成物 diff ゼロ）。
- 関連 Markdown / rule（`data-pipeline.md` / `data/README.md`）が block スタイル規約・新ゲートに追従。

## 検証手順

1. **検出の真陽性**: `data/champions/catalog/species.yaml` 等に一時的に flow ノード（例 `types: [ a, b ]`）を
   差し込み、新 check コマンドが**非0終了**して該当 `path:line` を報告することを確認 → 元に戻す。
2. **検出の真陰性**: 整形後の全 data YAML に対して check コマンドが**0 終了**（flow ゼロ）することを確認。
3. **生成物等価**: `pnpm generate:data` 後 `git diff --stat data/generated/` が空（再整形が値に影響しない）。
4. **materialize 冪等**: `pnpm fetch:data`（or 既存 raw）→ `pnpm materialize` を実行し、catalog が block の
   まま・新たな flow を生まないことを確認。
5. **ゲート二重化なし / 双方強制**: `.githooks/pre-commit`（or pre-push）と `.github/workflows/ci.yml` の
   どちらでも本 check が走ることを確認（同一ロジックを別実装で二重化していない）。
6. `pnpm verify` 緑を確認。`code-review`（src/scripts）/ `harness-review`（rule/ADR/docs）観点で点検。

## リスク・備考

- **再整形の大 diff**: 8 ファイルの flow→block 整形は機械的だが diff 行数が大きくなり得る。値は不変・生成物
  等価のためレビューは「flow が消え block になっただけ」を確認すればよい。意味的には atomic な 1 PR
  （ゲート + materialize + 整形を分けると途中で CI が red になる）。
- **「検証は tsc のみ」との線引き**: 本ゲートはデータの正当性検証ではなく**スタイル lint**で、型で表現できない。
  [ADR 0010]（tsc 検証）の対象外カテゴリとして verify/githooks に置く。この線引きを ADR に残すか判断する。
- **検出は AST ベース**: 正規表現で `[`/`{` を弾くと文字列値中の括弧で誤検出する。`yaml` の `parseDocument` で
  パースし `node.flow` を見るのが堅牢（[[testing]] の純関数として網羅）。
- **team/ への将来拡張**: 利用者 YAML（個体・パーティ）にも同様の整形を広げる余地はあるが、本 Phase は
  data 配下に限定。広げる場合は別 Phase で glob と方針を再検討する。
- **Phase 16 への前提**: 本ゲート確定後、Phase 16（M-A 全量投入）は全186種を最初から block スタイルで投入し、
  ゲートが flow 混入を継続的に弾く（全量を後で整形し直す事故を防ぐ）。
- ADR 本文は可変 plan ファイル（phase doc / phase 番号 / OVERVIEW リンク）を参照しない（[[adr]]）。
