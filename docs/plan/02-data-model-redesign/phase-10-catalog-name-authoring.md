# Phase 10 — catalog 日英名 authoring + generate 名前変換専任化

## 目的 / スコープ

ポケモン名・技・持ち物・特性の**日本語名 / 英名（ja/en）の SoT を `data/champions/catalog/*.yaml` に移す**。
現状これらの名前は `generate.ts` が `data/raw`（PokeAPI キャッシュ）の `names` から導出しており、catalog YAML は
id の列挙しか持たない。これを **catalog YAML に `id → { ja, en }` 形式で手記録する正本**へ変え、`generate.ts` は
名前について **YAML → TS 変換に専念**する（PokeAPI を名前の取得元にしない）。あわせて `data/generated` の
**abilities / items の生成 TS から name オブジェクトを除去**し（species / moves / types は name 保持）、生成
ファイル自体は将来の効果（特性・持ち物の効果）定義のため残す。Phase 15（全量投入）の手前に置き、全186種・
全技・全持ち物・全特性を「ja/en 名を含めて」materialize できるスキーマを先に確定する。

- スコープ内:
  - `catalog/{species,moves,abilities,items}.yaml` を **`id → { ja, en }` マップ形式**へ移行（既存の予約構造
    = `species.megaLinks` / `items.itemMeta` は維持または各エントリへ統合）。
  - **`catalog/types.yaml` を新設**（18 タイプ固定集合・`id → { ja, en, damageTo }`）。type 名**と相性倍率
    （`damageTo`）の両方**を catalog YAML の SoT にし、`generate.ts` は `types.ts` を **完全に YAML から生成**する
    （types について `data/raw` を一切読まない）。`generate.ts` の `TYPES` ハードコード列挙は types.yaml のキー集合へ
    一本化（または突き合わせ検証）。
  - **既存エントリの ja/en は現生成物（`data/generated/*.ts`）から機械抽出して書き戻す**（Web 再調査なし・
    決定論的・lossless）。
  - `generate.ts`: 名前取得を `pickName(raw)` から **catalog YAML の `{ ja, en }`** へ付け替え。
    - `abilities.ts` / `items.ts` 生成から **name フィールドを除去**（abilities = `{ id }` のみ・items =
      `{ id, category?, megaStoneFor? }`）。
    - `names.ts`（逆引き `speciesIdByJa` / `itemIdByJa` / `abilityIdByJa` 等）を **catalog YAML の ja** から生成。
    - `species.ts`（per-reg）/ `moves.ts` の name は **catalog YAML 由来で保持**（出力形は不変）。
    - `types.ts` は **name + 相性倍率（`damageTo`）とも catalog YAML 由来**で生成（types について raw 非依存）。
  - `src/types/ability.ts` / `item.ts` から `name` フィールドを削除し、消費側（`normalize.ts` /
    `load-party.ts` / `party-analysis.ts`）を追従。
  - catalog の ja/en 欠落を検出する authoring ゲート（`generate.ts` / `check:regulation` のいずれか）を追加。
- スコープ外:
  - **M-A 全186種の投入**（Phase 15 が担う）。本 phase は**既存 catalog 分の移行のみ**。
  - 新規 id の ja/en を Web 調査して足すこと（既存分の取得元付け替え + 移行に限定）。
  - **species / moves の構造データ**（種族値・タイプ・`damageClass` 等）の YAML 化（vendor 方式のまま raw 由来を
    維持・ADR 0012）。本 phase で raw 非依存になるのは **types（name + 相性）と全エンティティの名前**に限る。
  - 特性 / 持ち物の**効果定義の中身**（生成ファイルは残すが効果フィールドは後続）。

## 前提（依存）

- **Phase 6（generate 変換専任 + `check:regulation`）完了**。`generate.ts` が YAML → TS 変換専任になっており、
  名前取得元の付け替えを確定構造の上で行えること。
- **Phase 9（3 種小データセット検証投入）完了**。catalog に実データ（3 種 + 技 + 持ち物 + 特性）が入っており、
  移行（既存生成物 → YAML 書き戻し）の lossless 性を実データで検証できること。
- **Phase 15（全量投入）の手前**: 名前を YAML 記録するスキーマを全量投入の前に確定し、`survey-regulation` skill が
  全186種の ja/en も同時に materialize できるようにする（やり直しを避ける）。
- 確定済み rule: [[data-pipeline]] / [[cli-and-io]] / [[type-conventions]] / [[testing]]。
- 関連 ADR: [ADR 0012](../../adr/0012-vendor-pokeapi-data.md)（vendor 方式・本 phase は**名前部分のみ** hand-authored へ
  改訂）/ [ADR 0023](../../adr/0023-generate-transformer-and-check-regulation.md)（generate 変換専任）。

## タスク

- [ ] catalog YAML 5 種を `id → { ja, en }` マップ形式へ移行 / 新設:
  - [ ] `catalog/species.yaml`: `pokemon:` の各 slug を `{ ja, en }` map 化（`megaLinks` は据え置き）。
  - [ ] `catalog/moves.yaml`: 各 id を `{ ja, en }` map 化。
  - [ ] `catalog/abilities.yaml`: 各 id を `{ ja, en }` map 化。
  - [ ] `catalog/items.yaml`: 各 id を `{ ja, en }` map 化（`itemMeta.megaStoneFor` を各エントリへ統合するか据え置くかを
        決定し統一）。
  - [ ] `catalog/types.yaml`: **新設**。18 タイプの `id → { ja, en, damageTo }`（`damageTo` = 攻撃側相性倍率。
        非 1.0 のみ記録し generate が 1.0 を補完する形を推奨）。name・相性とも既存 `types.ts` から移行。
  - [ ] 既存 ja/en は `data/generated/*.ts`（現生成物）から抽出して書き戻す（移行スクリプト or 機械置換 + 突き合わせ）。
- [ ] `generate.ts` を改修:
  - [ ] 名前取得を `pickName(raw.names)` から catalog YAML の `{ ja, en }` 参照へ付け替え。
  - [ ] `abilities.ts` 生成を `{ id }` のみへ・`items.ts` 生成から name を除去（`{ id, category?, megaStoneFor? }`）。
  - [ ] `names.ts` 逆引きマップを catalog YAML の ja から生成。
  - [ ] `species.ts` / `moves.ts` の name を catalog YAML 由来へ（出力形は不変）。
  - [ ] `types.ts` を name + 相性倍率（`damageTo`）とも catalog YAML 由来で生成（types について `data/raw` を読まない・
        非 1.0 のみ記録なら 1.0 補完）。
  - [ ] catalog エントリに ja/en 欠落があれば**非0終了で弾く**（authoring ゲート・`check:regulation` 側でも可）。
- [ ] `src/types/ability.ts` / `item.ts` の `name` フィールド削除 + 消費側追従（`normalize.ts` / `load-party.ts` /
      `party-analysis.ts` ほか型エラー箇所）。
- [ ] `pnpm generate:data` 再生成 → `pnpm verify` 緑。
- [ ] 生成データの妥当性を `pokemon-data-reviewer` agent でレビュー（名前移行が lossless・abilities/items に name
      無し・species/moves/types は name 保持）。

## この Phase で育てるハーネス（rule・skill）

- **`survey-regulation` skill に「ja/en 名も catalog YAML へ記録する」手順を追記**（Phase 15 が全186種で利用）。
  → `skill-creator` で改修・[[skill-authoring]]。
- **ADR を起票**: 名前（ja/en・types 含む）の SoT を「PokeAPI 由来の生成」から「hand-authored catalog YAML」へ移し、
  abilities/items の生成 dex を id-only（+ items 構造）へ縮小する決定。ADR 0012（vendor 方式）の**名前部分の改訂**として
  位置づけ、構造データ（種族値・タイプ相性・分類）の raw 由来は不変であることを明記する。→ `adr-new`・[[adr]]。
  - **ADR は可変な plan ファイルを参照しない**: phase doc / OVERVIEW / phase 番号（renumber されうる）を本文で
    引かず、決定の内容・確定 rule・他 ADR で自己完結させる（plan は work-in-progress で番号も移動するため）。
- 必要に応じて [[data-pipeline]] / [[type-conventions]] の記述を追従更新（名前 SoT・XxxBase の name 有無の差）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- `catalog/{species,moves,abilities,items,types}.yaml` が **`id → { ja, en }` 形式**で、ja/en 名が catalog を SoT に記録される。
- `generate.ts` が名前を `data/raw`（PokeAPI）から引かず **catalog YAML から変換**する（名前について Web/PokeAPI 非依存）。
- `types.ts` が **name + 相性倍率（`damageTo`）とも `catalog/types.yaml` 由来**で生成され、`generate.ts` は types に
  ついて `data/raw` を一切読まない（タイプ相性が PokeAPI 非依存）。
- 生成 `abilities.ts` / `items.ts` に **name オブジェクトが無い**（abilities = `{ id }` のみ・items =
  `{ id, category?, megaStoneFor? }`）。`species.ts` / `moves.ts` / `types.ts` は name を保持する。
- `names.ts` 逆引きが catalog YAML 由来で再生成され、**ja 名入力 → id 正規化が従来どおり機能**する
  （`check:individual` / `load-party` が壊れない）。
- 生成物差分が「名前の取得元変更」と「abilities/items の name 除去」に限定され、**種族値・タイプ・解禁・技プールは不変**。

## 検証手順

1. 移行前後で `species.ts` / `moves.ts` / `types.ts` の name 集合が一致することを確認（移行が lossless・全角等の文字化け無し）。
2. 生成 `abilities.ts` / `items.ts` に name が無いこと、`species.ts` / `moves.ts` / `types.ts` に name が在ることを確認。
   `types.ts` の `damageTo` 相性表が移行前後で一致することも確認（18×18 の倍率が lossless）。
3. catalog の ja/en を 1 件わざと欠落させ、`generate:data`（or `check:regulation`）が**非0終了**することを確認（ゲート）。
4. ja 名（例「いのちのたま」「さめはだ」）入力で `check:individual` / `load-party` が id 解決できることを確認。
5. `pokemon-data-reviewer` agent でレビューし指摘を解消。
6. `pnpm verify` 緑を確認。

## リスク・備考

- **移行の lossless 性**: 既存生成物からの抽出ミスで名前欠落・全角文字化け（例「リザードナイトＸ」の全角 X）が起き
  やすい。移行前後で name 集合を機械的に突き合わせて担保する（検証手順 1）。
- **abilities/items の name 除去の波及**: 直接 `.name` 消費は src に無く（調査済み）、ja→id 逆引きは `names.ts` 経由
  のため、`names.ts` を catalog 由来で再生成すれば正規化は維持される。`party-analysis.ts` の `ItemInfo` が name を
  参照していないか着手時に再確認する。
- **types の完全 YAML 化**: types は name + 相性倍率（`damageTo`）とも `catalog/types.yaml` を SoT にし、`generate.ts`
  は types について `data/raw` を読まない。18 タイプ固定集合のため id 欠落・相性の左右非対称（攻撃側/防御側）に注意し、
  移行前後で 18×18 倍率を機械突き合わせする。`TYPES` ハードコード列挙は types.yaml のキー集合へ一本化する。
- **意味的に atomic な 1 PR**: catalog 形式・`generate.ts`・型（`AbilityBase`/`ItemBase`）・生成物は同時に変えないと
  ビルドが通らない（途中状態が壊れる）ため、分割せず 1 PR とする（[[planning]] の意味的完結性優先）。生成物の
  大量差分はレビュー容易性のため「手動カタログ差分」「`generate.ts` 差分」「生成物差分」を分けて説明する。
- **Phase 15 への申し送り**: 全量投入時は catalog 各エントリに ja/en を含めて materialize する。`survey-regulation`
  skill にその手順が入っていること（本 phase で追記）を前提にする。
