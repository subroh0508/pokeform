---
id: 0042
status: Accepted
date: 2026-07-05
---

# 0042. items だけ PokeAPI item-category whitelist で絞る（ADR 0041 の全件辞書不変条件を items のみ refine）

## Context

[ADR 0041](./0041-languages-full-name-dictionary.md) は `data/languages/{species,items,moves,abilities,types}.yaml`
を **reg 非依存の全件名辞書**とし、PokeAPI の list endpoint で各 category の全 id を列挙して ja/en で満たす方針を
確定した。この方針を items にも適用した結果、`data/languages/items.yaml` は PokeAPI `/item` 全件 **2176 件**になった。

しかし items は他 4 種（species / moves / abilities / types）と性質が異なる。**全 item の大半は「対戦で持たせられ
ない / 持たせても意味がない」**（ボール・回復薬・TM・料理素材・進化石・イベント品・料金アイテム等）。名前辞書の用途は
**育成済み個体の持ち物名の逆引き / 表示**であり、持てないアイテム 1800 件超は純粋なノイズで、逆引きの誤マッチ・生成
バンドル肥大・データレビューの負荷を生む。species / moves / abilities / types は「未解禁でも将来使いうる全件」に意味が
あるが、items の「持てないアイテム」には将来も持ち物としての意味がない。

**属性（`holdable` / `holdable-active`）ベースの絞り込みは不採用**。PokeAPI の attribute データは古いアイテムにしか
付与されておらず、`assault-vest`（とつげきチョッキ）・`booster-energy`（ブーストエナジー）・mega-stones は
`attributes: []` で取りこぼす（実測確認済み）。一方 **category は全 item に必ず付与**され `/api/v2/item-category/{cat}`
で堅牢に列挙できる。

ADR 0041 の**中核決定（名前 SoT = languages・reg 非依存・skill-authored が SoT で generate は raw 非依存の変換専任・
generate は superset 判定）は正しく、本 ADR でも不変**である。本 ADR が見直すのは、その中核から派生した
**「languages は list endpoint 全件で満たす」という取得方針を、items だけ category whitelist の union へ差し替える**
一点である。

## Decision

**items（`data/languages/items.yaml`）だけは PokeAPI の list endpoint 全件でなく、対戦で持たせて意味のある持ち物を
表す item-category whitelist の union で列挙する。他 4 種（species / moves / abilities / types）は list endpoint 全件の
まま（変更しない）。**

- **whitelist は category ベース**（属性ベースは上記理由で不採用）。対象カテゴリ・除外カテゴリの正本は
  [[data-pipeline]] に置く。判断基準は「持って対戦効果があるか」で、**reg 解禁 legality（per-reg・別軸）とは切り離す**
  （whitelist は reg で切らない・ADR 0041 の reg 非依存の性質は維持）。
- **取得と剪定**: `scripts/fetch-pokeapi.ts` が各 `/item-category/{cat}` を fetch して union を作り
  （**各 cat が 404 でないこと + union が空でないことを fail-fast**・category endpoint は count/limit ページングを
  持たないため件数照合は list endpoint 用 `listAllIds` のまま維持）、union manifest を raw に残す。offline の
  `scripts/materialize.ts`（`sync:ja-names`）が manifest を読み **items.yaml を union のみへ剪定**する（純関数
  `sortedUnion` / `pruneToKeep` は `src/codegen/materialize.ts`・カバレッジ 100%）。
- **generate は superset のまま**（ADR 0041 不変）。orphan 許容ゆえ剪定後の items.yaml でも 0 終了する。
- **mega-stones はストーン名（`garchompite` 等）を items.yaml に持つ**。メガ種名を持つ `mega.yaml`（`garchomp-mega`
  等）とは id 語源が別（`-ite` / `-mega`）で衝突しない。

仕様の詳細（whitelist カテゴリ・取得/剪定フロー）は [[data-pipeline]] を正本とし、本 ADR は「なぜ」を記録する。
ADR 0041 は中核決定が生きているため **Accepted のまま**（supersede しない・archive しない）で、本 ADR がその派生取得
方針のうち **items の列挙方式のみ**を上書きする。

## Consequences

- **良い点**:
  - items.yaml が対戦持ち物 ~270 件に絞られ、逆引き / 表示の用途に対するノイズ（持てないアイテム 1800 件超）が消える。
    生成バンドル・データレビューの負荷も下がる。
  - category ベースゆえ attribute 欠落の取りこぼし（assault-vest / booster-energy / mega-stones）が無い。全世代の
    対戦持ち物 + メガストーンを堅牢に列挙できる。
- **悪い点 / コスト**:
  - whitelist カテゴリの選定が判断を含む（PokeAPI のカテゴリ分類が用途と完全一致しない箇所がある）。カテゴリ改廃で
    列挙結果が変わりうるため、各 cat 404 + union 空の fail-fast で drift を検知する。
  - languages 5 種のうち items だけ取得方針が非対称になる（他 4 種は list 全件）。この非対称は items の性質差
    （持てないアイテムに将来も意味がない）に由来する意図的なもので、DATASETS 行の `listCategories` 有無で表現する。
- **トレードオフ / 留意点**:
  - PokeAPI の `medicine` カテゴリは概念上の「薬（ポーション類）」ではなく**持ち物として持たせる木の実 10 件**
    （オボンのみ / ラムのみ / オレンのみ / 状態異常回復の木の実）で、ポーション類は `healing` カテゴリに別在する。
    受け入れ基準（オボンのみが残る）と既存個体（lum-berry を持つ）を満たすため `medicine` を whitelist に含める。
    カテゴリ名の額面と実体の乖離に注意（正本の対象カテゴリ一覧は [[data-pipeline]]）。

## Alternatives Considered

| 代替案 | 却下理由 |
|---|---|
| 属性（`holdable` / `holdable-active`）ベースで絞る | PokeAPI の attribute は古いアイテムにしか付与されず assault-vest / booster-energy / mega-stones を取りこぼす（実測確認済み）。category は全 item に付与され堅牢。 |
| items も list endpoint 全件のまま維持（ADR 0041 どおり） | 持てないアイテム 1800 件超が名前辞書のノイズになり逆引き誤マッチ・バンドル肥大を生む。items の用途（持ち物名）に対し全件は過剰。 |
| per-reg 解禁 legality で items.yaml を絞る | 名前辞書は reg 非依存（ADR 0041）。legality（per-reg・`<reg>/items.yaml`）は別軸で、名前辞書を reg で切ると全件辞書の性質を壊す。whitelist は「持てるか」で切り reg では切らない。 |
