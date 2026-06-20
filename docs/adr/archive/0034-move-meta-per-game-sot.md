---
id: 0034
status: Superseded by ADR-0035
date: 2026-06-15
---

# 0034. 技メタの SoT を per-game `regulations/champions/moves.yaml` にする（ADR 0026 改訂）

## Context

[ADR 0026](./0026-pokeapi-not-champions-legality-source.md) は **PokeAPI を Champions の
legality / 技メタの信頼源にしない**と決め、技メタ（type / damageClass / power / accuracy / pp / priority）の
SoT を skill-authored の **`data/champions/catalog/moves.yaml`** へ置いた。この「PokeAPI を技メタの信頼源に
しない・技メタは skill-authored」という**核は正しく、本 ADR でも不変**である。

しかし技メタの**所在を catalog に置いたこと**には齟齬がある。catalog は本来 **reg / ゲーム非依存の名前 SoT**
（id → ja/en・append-only マスター）であり、ゲームをまたいで共有される。一方、**技の数値（威力・命中・PP 等）
は Champions 独自調整があり得るゲーム固有値**で、将来 champions 以外のゲームを足すと同一技 id でも数値が
変わりうる。ゲーム固有値を reg / ゲーム非依存の catalog に置くと、マルチゲーム化で同一 id の技メタが衝突する。

[Phase 10](../../plan/03-survey-regulation-rework/) で regulations をゲームでグルーピング
（`regulations/<game>/<reg>.yaml`）したことで、**per-game 共有データの置き場**が確定した。名前はゲーム非依存
なので catalog に残し、技メタは Champions 固有値なのでゲーム単位で持つのが正しい所在である。

## Decision

**技メタ（type / damageClass / power / accuracy / pp / priority）の SoT を、per-game の
`data/champions/regulations/champions/moves.yaml`（m-a / m-b 横断で共有）へ移す。** 技名（id → ja/en）は
ゲーム非依存なので **`data/champions/catalog/moves.yaml`** に名前 SoT として残す。ADR 0026 の核
（**PokeAPI を技メタ / legality の信頼源にしない・技メタは Serebii 第一優先の skill-authored**）は不変で、
本 ADR は技メタ SoT の**所在**を catalog → per-game regulations へ精緻化する改訂である。具体的には:

- **型を分離する**: `src/types/move.ts` の `MoveBase` を **id + name のみ**に縮小し、per-game 技メタを
  `MoveStats`（type / damageClass / power / accuracy / pp / priority）へ分離・export する。生成 dex は
  `moves.ts`（名前・catalog 由来）と `regulations/champions/moves.ts`（`moveStatsDex`・per-game 技メタ）の
  2 系統になる。技メタ欠落は `satisfies MoveStats` で生成段 tsc が弾く（[[tsc-verification]]）。
- **技メタ消費側を per-game 技メタ dex 参照へ repoint する**: 攻撃範囲分析（coverage = type / damageClass 参照）・
  ダメージ / 火力指数（power 参照）は `moveStatsDex` を引く。名前ルックアップ / 名称正規化は引き続き `moveDex`
  （catalog 由来）を引く。
- **per-reg ではなく per-game とする**: 現状 champions 内で m-a / m-b の技メタは共通とみなし per-game で 1 ファイル
  （`regulations/champions/moves.yaml`）。将来 m-a と m-b で技メタが分岐したら per-reg override を別途検討する。
- **learnset 照合は撤去のまま不変**（ADR 0026 維持）。`check:regulation` は参照整合（種族 / 持ち物 / メガ / 技が
  catalog に存在）と schema のみで `data/raw` 非依存。技が実ゲームで覚えるかの担保は authoring 段
  （`survey-regulation` skill・Serebii 第一優先）に置く。

仕様の詳細は [[data-pipeline]] / [[type-conventions]] を正本とし、本 ADR は「なぜ」を記録する。

## Consequences

- **良い点**:
  - 技メタが**ゲーム固有値として正しい所在**（per-game）に置かれ、マルチゲーム化で同一技 id の数値衝突を
    避けられる。名前（ゲーム非依存）と技メタ（ゲーム固有）の境界が明快になる。
  - 名前 SoT（catalog）と技メタ SoT（per-game regulations）が分離され、catalog が「reg / ゲーム非依存の
    名前マスター」という本来の責務に純化する。
  - 技メタ移設は値の出自を移す変更で、生成 `moveStatsDex` の値は移設前と等価（決定論性は不変）。
- **悪い点 / コスト**:
  - 技の情報が catalog（名前）と regulations/champions（技メタ）の 2 ファイルに分かれ、新規技の追加時は
    両方へ記入する責任が生じる（generate が id 集合の不一致を生成段で弾いて authoring 漏れを検出する）。
  - 技メタ消費側（coverage / 火力指数）の import が `moveDex` → `moveStatsDex` へ移り、参照切替が必要になる。
- **トレードオフ / 留意点**:
  - **reversible**: 技メタの所在は可逆。将来 per-reg で技メタが分岐したら per-reg override を足せる。
  - per-game 技メタ dex は generate がゲームサブディレクトリの共有 `moves.yaml` から生成する。レギュ列挙は
    この共有ファイルを除外する（reg ではないため）。

## Alternatives Considered

| 代替案 | 却下理由 |
|---|---|
| 技メタ SoT を catalog のまま残す（ADR 0026 現状） | catalog は reg / ゲーム非依存の名前マスター。Champions 固有値の技メタを置くとマルチゲーム化で同一 id が衝突する。 |
| ADR 0026 に補注追記で済ませる | SoT の所在変更は決定の意味変更に当たる。adr.md の規約どおり補注ではなく supersede で行う（不変ログの追跡性を保つ）。 |
| 技メタを per-reg（m-a / m-b 個別）に持つ | 現状 champions 内で技メタは共通。per-reg は重複を生む。分岐が生じたら per-reg override を別途検討する（YAGNI）。 |
| 名前も per-game regulations へ移す | 名前はゲーム非依存（同じ技は別ゲームでも同名）。catalog に置くのが正しく、per-game へ移す理由がない。 |
