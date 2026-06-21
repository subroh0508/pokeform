# Phase 2 — type-validation.md + individuals-and-parties.md

## 目的 / スコープ

`docs/design/` の残り 2 本を **TypeScript コードなし**で執筆する。現 `architecture.md` の型表現節（種族 / 技 / タイプ / 特性 / 持ち物の型）・個体型・検証ゲート・CLI・分析アルゴリズム節からは**設計判断と保証する不変条件だけ**を抽出し、型例・YAML 例・数式は破棄する。

- **type-validation.md**: 「YAML→codegen→tsc を唯一ゲートにする」考え方と Zod 不採用の理由、ブランドエラー型で診断を読みやすくする方針、`@source` 逆引きの仕組み、種族粒度 = 種族値一意・ID キー採用の設計判断、巨大 union 回避の方針。
- **individuals-and-parties.md**: 個体・パーティを「コードとして」検証する考え方、**保証する不変条件の列挙**（覚えない技 / 使えない特性 / 合計66・各32 / 同種族重複 / レギュ解禁 / 体数）、入力言語をファイル単位で宣言する方針、CLI でできること（概念）、coverage 分析が答える問い（弱点集中・技範囲の穴）。

スコープ外: inbound 参照張り替え・旧 architecture.md 撤去（Phase 3）。

## 前提（依存）

- Phase 1 完了（`docs/design/` 骨組み + README が存在し、design の書き方・実装 SoT ポインタ規律が確立済み）。

## タスク

- [ ] `docs/design/type-validation.md` を執筆（書かない: 型シグネチャ・interface・Dex の具体 → [[type-conventions]] / [[tsc-verification]] + `src/types/`）。
- [ ] `docs/design/individuals-and-parties.md` を執筆（書かない: `IndividualSpec` フィールド・YAML 具体例・CLI フラグ・数式 → [[game-spec]] / [[cli-and-io]] + `src/` + `author-individual` / `review-party` skill）。
- [ ] 両ファイル末尾に「実装 SoT ポインタ」節（rule `[[...]]` + `src` パス）を必須化。
- [ ] 不変条件の列挙は自然言語で（数式・閾値 66/32 の実体は [[game-spec]] が SoT・design は「二重 floor に注意」等の設計上の注意のみ）。

## この Phase で育てるハーネス（rule・skill）

- なし（新規 doc 執筆）。

## 受け入れ基準

1. `docs/design/type-validation.md` と `docs/design/individuals-and-parties.md` が存在し、**TS コード・YAML キー網羅・数式の実体を含まない**。
2. 個体・パーティの**保証する不変条件**が自然言語で列挙され、具体値は rule / src を参照。
3. 各ファイル末尾「実装 SoT ポインタ」のリンクが実在へ解決。
4. `pnpm verify` 緑。

## 検証手順

1. `git grep -nE 'interface |Dex|IndividualSpec\b.*\{|=> ' docs/design/type-validation.md docs/design/individuals-and-parties.md` でコード混入ゼロを確認（散文中のシンボル名言及は可・定義は不可）。
2. `harness-review` でセルフレビュー（俯瞰のみ・不変条件の正確性・参照実在）。
3. doc 内で言及するコードシンボル（`@source` 等）が `git grep` で実装に実在することを確認（架空シンボル混入防止）。

## リスク・備考

- 型例の破棄で「具体が分からない」読者には末尾ポインタで src / rule へ誘導する。design は俯瞰、実体は下層、の分担を崩さない。
- `docs/design/` 4 ファイルがこの Phase で揃う。Phase 3 で参照を design へ向け、旧 architecture.md を撤去する。
