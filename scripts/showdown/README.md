# scripts/showdown — pokemon-showdown 抽出層

ポケモンチャンピオンズ（Reg M-A / M-B）の解禁・構造・技メタ・メガ・持ち物を **pokemon-showdown**（`smogon/pokemon-showdown`）の mod から抽出する層。`champions-data.ts`（346 行モノリスのプロトタイプ）をデータセット別に分割したもの。出力は中間 JSON で、pokeform 側の `scripts/sync-showdown.ts` が `src/codegen/showdown/*-fields.ts`（純関数）越しに SoT YAML へ転記する。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `dex.ts` | 共通基盤: mod 解決（`resolveRegulation`）/ `realPP`（calculatePP 適用）/ `isUsable*` フィルタ / メガ判定 / 持ち物 category |
| `species.ts` | base 種族の構造 + 解禁 roster + learnset（メガ除外） |
| `moves.ts` | roster の learnset 和集合の技メタ（PP は実 PP） |
| `items.ts` | 解禁持ち物の category / メガストーン linking |
| `abilities.ts` | roster の特性和集合 |
| `mega.ts` | メガ・ゲンシカイキの構造 + linking |
| `cli.ts` | `node tools/showdown/cli.js <regulation> <dataset>` で中間 JSON を stdout |

## 実行（pokemon-showdown ツリー内）

`scripts/showdown/**` は `../sim/dex` を import するため pokeform の `tsconfig.json` `exclude` 対象（typecheck/coverage 非対象）。実行は showdown ツリーで行う:

```bash
# scripts/showdown/ を pokemon-showdown/tools/showdown/ へ copy
cp -r scripts/showdown <pokemon-showdown>/tools/showdown
cd <pokemon-showdown> && node build
node tools/showdown/cli.js "[Gen 9 Champions] VGC 2026 Reg M-A" species
```

`<regulation>` にはフォーマット名 / 別名（`vgc` / `bss`）/ mod 名（`champions` = M-B 系 / `championsregma` = M-A 系）を渡せる。`<dataset>` は `species | moves | items | abilities | mega`。

## 機構の要点（旧 CHAMPIONS-DATA.md より）

- **mod 継承**: `championsregma`（M-A）は `champions`（M-B）を継承し、解禁状況と一部メガストーンのみ差分で上書きする。技・特性・learnset は同一。
- **PP の落とし穴（最重要）**: champions mod は `calculatePP` を上書きし、実 PP は `(pp/5+1)*4` = 8/12/16/20（`noPPBoosts` は据置）。`move.pp`（基礎値）をそのまま読むのは誤り。`dex.ts` の `realPP` を必ず通す。
- **「使用可能」判定**: 種族 = `exists && num>0 && isNonstandard∉{Past,Future} && tier∉{Illegal,Unreleased}`。持ち物 = `exists && num>=0 && isNonstandard==null`。mod が幻・伝説を事前マーク済みのため team-validator と一致する。
- **メガ判定**: `species.isMega || species.isPrimal || forme∈{Mega,Mega-X,Mega-Y,Primal}`。
- **id 正規化**: 抽出層は showdown の表示名（`name`）と squashed id を両方 JSON に載せるが、**安定 kebab id への正規化は転記層（`src/codegen/showdown/`）が name から行う**（テスト対象）。
- **出典**: Smogon コミュニティによる再現データであり公式データそのものではない。正確性は Serebii 照合で裏取りする（後続 phase の `verify-showdown-pr`）。
