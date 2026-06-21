# 02-data-model-redesign — ポケモンデータ保持モデルの再設計 OVERVIEW

## ゴール

ポケモンチャンピオンズの**レギュレーションごとに変化する解禁情報**（種族・技・持ち物・メガシンカ）を、
データとして正しく・拡張可能な形で保持できるようにする。利用者（コーディングエージェント / 人）から見て:

- レギュレーションは**期間付き**で管理され（開始日必須・終了日は空＝開催中を許容）、TS 型として参照できる。
- ポケモン名・持ち物・技・特性は**エンティティ種別ごとの独立カタログ YAML** で管理され、一度チャンピオンズ
  に解禁されたものは、後のレギュレーションで没収されても**カタログから消えない**（append-only マスター）。
- 「どのレギュレーションで何が使えるか」は**レギュレーションごとの YAML** で保持し、種族・持ち物・メガは
  per-regulation の TS 型として生成される（技は YAML 記録のみ・型生成しない）。
- レギュレーション M-A の解禁データ（種族・技・持ち物・メガ）が**信頼できる情報源に基づき全量**そろう。

## 背景 / 動機

現状のデータ保持は MVP 用の暫定構造で、再設計が必要:

- **解禁情報が種族に逆張りされている**: `data/generated/species.ts` の各種族が `regulations: RegulationId[]` を
  持ち、`src/types/party.ts` の `ConstrainParty` がそれを参照して型レベル解禁判定をしている。レギュレーション
  ごとに技・持ち物・メガまで変わる実態を表現できない。
- **入力が 1 ファイルに混在**: `data/champions/roster.yaml` が vendor 対象の pokemon / moves / items / megaLinks を
  1 ファイルに持ち、エンティティ種別ごとの append-only 管理ができない。
- **レギュレーションが 1 ファイル集約**: `data/champions/regulation.yaml` が全レギュの `allow`（種族のみ）を
  1 ファイルに持つ。期間情報が無く、技・持ち物・メガの差分も表現できない。
- **M-A データが暫定**: 現状の解禁リストは少数の代表種のみで、メモリにもある通り暫定でっち上げ（不正確）。

## 設計方針

確定した設計判断（本計画の前提・実装中に覆さない）:

1. **解禁判定の正本を per-regulation に一本化（A案）**: レギュレーションごとの生成型が解禁集合
   （species / items / mega）を持ち、`ConstrainParty` 等の型判定はそれを参照する。
   `SpeciesBase.regulations[]` は**廃止**し、解禁情報の SoT を per-regulation に集約する（二重管理を避ける）。
2. **per-regulation の TS 型はレギュレーションごとに別ファイル・別型**: `data/generated/regulations/champions-m-a.ts`
   のように 1 レギュ = 1 ファイルで生成し、解禁集合と**メタdata（name / 期間）**を内包する。
3. **カタログは 4 種別の独立 YAML（append-only マスター）**: 種族 / 技 / 持ち物 / 特性をそれぞれ
   独立 YAML で管理する。チャンピオンズに解禁済みのもののみ記録し、**一度載せたら没収されても消さない**。
   種族 YAML は技・持ち物・特性の **id を参照**する（id は各カタログが定義・二重管理にならない）。
4. **期間は開始必須・終了 nullable**: `period: { start: string; end: string | null }`。終了日空＝開催中。
5. 既存の鉄の規約は不変: 検証は tsc のみ（[[tsc-verification]] / ADR 0010）、vendor 方式（[[data-pipeline]] /
   ADR 0012）、入力言語のファイル単位宣言（[[cli-and-io]] / ADR 0014）、型は `XxxBase + XxxDex + XxxId`
   統一（[[type-conventions]]）、カバレッジ 100%（[[testing]]）。
6. **解禁情報の取得を skill 化**: レギュレーション解禁情報の WebSearch 調査 → 突き合わせ → doc 化 →
   catalog/per-reg YAML 反映を再利用可能な手順 skill に切り出す（Phase 3 で作成、Phase 5 と M-B 以降が再利用）。

### 設計方針の改訂（Phase 4 で導入）

Phase 1〜3 は生成 `species.ts` を **全レギュ共通の単一 `speciesDex`** として実装した。しかし**種族の習得技は
レギュレーションごとに異なる**（同じガブリアスでも M-A と M-B で覚える技が違いうる）。`SpeciesDex[S]["moves"]`
は個体の技合法判定の根拠であり、reg 不変の単一 dex ではこの実態を表現できず、統合 view へフラット化すると
技プールが潰れて過剰許容になる。Phase 4 で次へ改訂する:

7. **種族定義を per-regulation 化し、習得技を per-reg 属性にする**: global 単一 `data/generated/species.ts` を
   **廃止**し、`data/generated/regulations/<id>/species.ts`（per-reg `speciesDex` / `SpeciesId`・そのレギュの
   `moves` を含む）を**生成 species の正本**にする。`regulations/<id>/index.ts` から `RegulationDex[R].speciesDex`
   を引ける。型機構は reg-aware（`SpeciesDexOf<R>` / `ValidMove<R,S,M>` / `IndividualSpec<R,S>`）にする。
8. **個体は対象レギュレーションを複数宣言できる（1 YAML → 複数型定義生成）**: 個体 YAML に
   `regulations: [<id>...]`（1〜N）を持たせ、codegen が宣言レギュごとに `ValidMoves<R,S,...>` 等の `satisfies`
   を fan-out 生成する。**宣言した全レギュで合法**な個体だけが通る（交差）。違反は該当レギュの行で
   `MoveNotLearnedBy<R,S,M>` 等として `@source` 逆引きで弾く。`ConstrainParty` の roster 判定は per-reg dex
   由来になり、メンバー個体の宣言レギュとパーティ宣言レギュの整合を取る。
9. **reg 不変の base データは別経路**: 種族値・タイプ・名前はレギュ不変なので、実数値計算・名前表示・coverage
   はこれらだけを reg 不変の参照経路から引く（型の正本は per-reg のまま）。

この改訂は ADR 0021 の「生成 species を global 単一 dex とし、技は per-reg 型生成しない」決定を覆す。0021 は
本計画 Phase 2 で当日採番された新規 ADR で、その前提を一度も ship しないまま覆るため、Phase 4 では supersede +
archive せず**0021 を削除し per-regulation の確定設計で作り直す**（番号維持・archive しない・Accepted ADR の
不変則に対する意図的な例外として ADR 本文に明記）。roster の per-reg 一本化という 0021 の主旨は踏襲する。

### 設計方針の再々改訂（Phase 5〜6 で導入）

Phase 1〜4 では、各種族の技を `generate.ts` が **`global catalog/moves.yaml ∩ PokeAPI learnset`** から
**その場で導出**し、per-reg YAML の `allow.moves` は記録のみ（生成未使用）だった。この方式には 2 つの問題がある:

- **種族×レギュレーションの技対応が YAML で確認できない**: 「どの種族がそのレギュで何の技を覚えるか」は
  生成された `species.ts` を読むしかなく、入力 YAML からは追えない。
- **各種族に数技しか紐づかない**: catalog が少数技のため、実態（M-A は解禁技467・各種族の全 learnable 技）に
  全く届かない。

これを次の方針へ改訂する（ユーザー合意済み・本計画 Phase 5〜7 の前提）:

10. **per-reg 技記録を species-keyed の明示記録へ**: `regulations/<id>.yaml` の `allow.{species,items,mega,moves}`
    フラット構造を廃し、**トップレベルの種族IDキー（キーの存在 = 解禁）+ per-species `moves`・`mega`** を持つ
    構造にする。`name`/`period`/`items` は予約キー。YAML は **block 記法**で統一する。種族×レギュの技対応が
    YAML で直読できる。
11. **`mega` は配列**: 1 種族が複数メガを持ちうる（リザードン X/Y 等）ため `mega` を `readonly string[]` にし、
    per-reg 種族 dex / `species-base.ts` の `megaEvolvesTo` と `catalog/species.yaml` の `megaLinks` を配列対応にする。
12. **`generate.ts` は YAML → TS 変換専任**: learnset 交差・生成段バリデーションを除去し、YAML の `moves` を
    そのまま `species.ts` へ流す dumb transformer にする。`species.ts` の出力形（`moves: string[]` 等）は不変。
13. **妥当性検証は authoring 時ゲートへ**: 覚えない技の混入・参照切れ・条件違反は新 CLI `check:regulation`
    （`check:individual` と同系）で YAML 作成・更新時点に判断し、Git hooks / CI から駆動する。

この改訂は ADR 0021 の「`allow.moves` はレギュ記録のみ・generate が `catalog ∩ learnset` を導出」という記録方法
の該当箇所を更新する（per-reg species 正本・reg-aware 型機構という 0021 の核は不変＝full supersede ではなく
**改訂**）。記録方法（Phase 5・ADR 0022）と generate 責務縮小 + 検証位置（Phase 6・ADR-B）で **ADR を分割**して残す。

### 設計方針の改訂（Phase 10 で導入）

Phase 1〜6 は、エンティティの **ja/en 名を `generate.ts` が `data/raw`（PokeAPI）の `names` から導出**し、catalog
YAML は id の列挙のみを持っていた。しかしこれは「名前の SoT が PokeAPI 由来の生成物にある」ことを意味し、
(a) チャンピオンズ独自表記・揺れの補正が `overrides` 頼みになる、(b) `generate.ts` が名前のために raw 取得に依存し
続ける、(c) 名前が入力 YAML から直読できない、という弱点がある。Phase 10 で次へ改訂する（ユーザー合意済み）:

14. **ja/en 名の SoT を catalog YAML へ移す**: `catalog/{species,moves,abilities,items,types}.yaml` を
    **`id → { ja, en }` マップ形式**にし、名前を skill-authored の正本にする。`generate.ts` は名前について
    **YAML → TS 変換に専念**し、PokeAPI を名前の取得元にしない。**types はさらに相性倍率（`damageTo`）も
    `catalog/types.yaml` に持たせ**（18 タイプ固定・name + 相性とも YAML）、`generate.ts` は `types.ts` を完全に
    YAML から生成して types について `data/raw` を一切読まない。**species / moves の構造データ（種族値・タイプ・
    `damageClass` 等）の raw 由来は不変**（vendor 方式 ADR 0012 のうち**名前 + types 相性のみ**の改訂）。
15. **abilities / items の生成 TS を id-only 化**: `data/generated/abilities.ts` を `{ id }` のみ・`items.ts` を
    `{ id, category?, megaStoneFor? }` にし、**name オブジェクトを除去**する（`AbilityBase` / `ItemBase` から `name`
    削除）。species / moves / types は name を保持する。生成ファイル自体は**将来の効果（特性・持ち物の効果）定義の
    ため残す**。ja→id 逆引きは `names.ts` を catalog YAML の ja から再生成して維持する。

この改訂は ADR 0012（vendor 方式）の名前 + types 相性部分を改訂する新 ADR を Phase 10 で起票する（species / moves の
構造データの raw 由来は不変であることを ADR に明記）。なお Phase 10 で起こす ADR は、可変な plan ファイル（phase doc /
phase 番号）を参照しない（Phase 11 で codify する方針を先取りする）。

### 設計方針の改訂（Phase 12 で導入）

Phase 1〜11 は、Champions の「使える技」を **raw PokeAPI learnset** に照合して検証し（`check:regulation` の覚えない技
検出）、技の威力等の技メタも `data/raw`（PokeAPI）の move 構造から導出していた。しかし **PokeAPI はポケモン
チャンピオンズに対応しておらず**、Champions の learnset / 技数値が PokeAPI と一致する保証がない。誤った「使える/
使えない」判定や誤った技数値を生む温床になる。Phase 12 で次へ改訂する（ユーザー合意済み）:

16. **PokeAPI を Champions レギュレーション情報・技威力の信頼源にしない**: 解禁種族 / 使用できる技（learnset
    legality）/ 使用できる持ち物 / 技威力等の技メタについて、PokeAPI を信頼源にせず **信頼できる情報源
    （Serebii 第一優先・複数ソース突き合わせ）**で補完する。**`check:regulation` の learnset 照合（覚えない技検出）を
    撤去**し、技メタの SoT を PokeAPI raw から catalog 等へ移設し、`survey-regulation` の投入前 learnset 照合手順と
    関連 rule を追従させる。**種族値・タイプ・特性・持ち物 category 等のレギュ非依存の構造データは ADR 0012 の
    vendor 方式を維持**する。

この改訂は ADR 0012（vendor 方式）の Champions legality + 技メタ部分を改訂する新 ADR を Phase 12 で起票する
（構造データの raw 由来は不変であることを ADR に明記）。**PokeAPI が Champions に正式対応したら本決定を見直せる**
（reversible・ADR の Consequences に見直し条件を明記）。

### 設計方針の改訂（Phase 13 で導入）

Phase 12 までは、レギュ非依存の構造データ（種族値・タイプ・特性 id・全国図鑑番号・持ち物 category）を
`generate.ts` が **`data/raw`（PokeAPI）から直読**して生成物を組んでいた（vendor 方式の構造部分）。しかしこれは
(a) 値が入力 YAML から直読できない、(b) Champions 実態との差分補正が間接レイヤー（`overrides.yaml`）頼みになる、
(c) `generate` が raw 依存のままという弱点を残す。Phase 10 が名前・タイプ相性で解いたのと同じ問題なので、構造
データにも同じ解を当てる。**取得元は PokeAPI のまま**（信頼できる Champions 非依存データなので）次へ改訂する
（ユーザー合意済み）:

17. **構造データの SoT を `data/raw` 直読から catalog YAML へ移す**: `catalog/species.yaml` の各エントリに
    `dex` / `types` / `stats` / `abilities`、`catalog/items.yaml` に `category` を持たせる。`data/raw` → catalog の
    転記は専任スクリプト **`materialize.ts`（新設）**が行い、`generate.ts` は **raw を一切読まず catalog のみを
    変換**する（`species-base.ts` / `items.ts` が catalog 100% 由来に）。**取得元は PokeAPI 継続**（`fetch:data` は
    残し、raw は materialize 元キャッシュに降格）。
18. **責務分離（スクリプト fail-fast / raw 存在担保は skill）**: `materialize.ts` は **raw 必須・不在なら
    fail-fast でエラー**（自前の存在チェック・誘導を持たない）。**raw 存在の担保は `survey-regulation` skill の
    責務**（手順で `fetch:data` → `materialize` の順を保証）。スクリプトに存在チェックを再実装しない。
19. **`overrides.yaml` 廃止**: 参照ゼロ・中身空で、learnset 撤去（Phase 12）と構造データ catalog 化により役割が
    消滅する。Champions 実態との差分は catalog / regulations YAML を直接直して吸収する（補正レイヤー不要）。

この改訂は ADR 0025（catalog name/type SoT）を構造データへ拡張する新 ADR を Phase 13 で起票する（取得元 =
PokeAPI 維持・SoT のみ catalog へ・materialize スクリプト/スキル責務分離・overrides 廃止を明記）。

## 実装指針

### data/champions/（skill 著述・コミット）の新構造

```
data/champions/
  rules.yaml                      # 既存（ゲーム計算定数・不変）
  overrides.yaml                  # 既存（習得技/特性の世代差・上書き）
  catalog/                        # ← 新規：append-only エンティティカタログ（Phase 10: id → { ja, en } 名 SoT）
    species.yaml                  #   解禁済み種族（id → { ja, en }・+ megaLinks）
    moves.yaml                    #   解禁済み技（id → { ja, en }）
    items.yaml                    #   解禁済み持ち物（id → { ja, en }・+ megaStone メタ）
    abilities.yaml                #   解禁済み特性（id → { ja, en }）
    types.yaml                    #   18 タイプ固定（id → { ja, en, damageTo }・名前 + 相性とも YAML）
  regulations/                    # ← 新規：1 レギュ = 1 ファイル
    champions-m-a.yaml            #   name / period / items（予約キー）+ 種族IDキー = 解禁（Phase 5 で改訂）
    champions-m-b.yaml
```

> **Phase 5 で改訂**: `regulations/<id>.yaml` の `allow.{...}` フラット構造を廃し、**種族IDキー = 解禁 +
> per-species `moves`/`mega[]`** の block 記法へ。`name`/`period`/`items` は予約キー。新スキーマの例:

```yaml
# data/champions/regulations/champions-m-a.yaml（Phase 5 以降・block 記法）
name:
  en: "Champions Regulation M-A"
  ja: "チャンピオンズ レギュレーションM-A"
period:
  start: "2026-04-08"
  end: "2026-06-17"
items:                            # レギュ共通の解禁持ち物プール（予約キー）
  - charizardite-x
  - charizardite-y
  - life-orb
garchomp:                         # トップレベル種族IDキー = 解禁（allow）
  moves:
    - earthquake
    - dragon-claw
    - stone-edge
    - swords-dance
charizard:
  moves:
    - flare-blitz
    - dragon-claw
    - earthquake
    - roost
  mega:                           # 1 種族複数メガを許容（配列）
    - charizard-mega-x
    - charizard-mega-y
```

### data/generated/（生成・コミット）の新構造

> **Phase 4 で改訂**: 生成 `species.ts`（global 単一 dex）を廃止し、**per-regulation species 構造**へ移す。
> 詳細は下記「設計方針の改訂（Phase 4）」。

```
data/generated/
  types.ts moves.ts abilities.ts items.ts names.ts              # カタログ由来（ID 集合の universe・species.regulations[] は廃止）
                                                               # Phase 10: types は name+相性とも YAML 由来・moves は name 保持・abilities/items は id-only（name 除去・効果用に存置）・names.ts は catalog の ja 由来
  regulations/
    champions-m-a/
      index.ts                  # per-reg メタ：name / period / 解禁 items・mega + ./species.ts 参照（旧 champions-m-a.ts を寄せる）
      species.ts                # ← Phase 4：per-reg 種族定義の正本（roster + その reg の習得技 moves を含む）
    champions-m-b/
      index.ts
      species.ts
    index.ts                    # RegulationId 集約・RegulationDex[R].speciesDex を引ける形（各 ./<id>/index.ts を import）
```

`data/generated/species.ts`（global 単一 dex）は Phase 4 で**廃止**する。型機構は reg-aware
（`SpeciesDexOf<R>` / `ValidMove<R,S,M>` / `IndividualSpec<R,S>`）になり、個体は `regulations: [<id>...]` を
複数宣言して宣言レギュごとに型検証が fan-out される。reg 不変の base データ（種族値・タイプ・名前）は
reg 不変の参照経路から引く（実数値計算・名前表示・coverage 用）。

### データの流れ（vendor 方式は不変）

`fetch-pokeapi.ts`（catalog の slug を取得 → `data/raw` キャッシュ）→ `generate.ts`（raw + champions/catalog +
champions/regulations を合成 → `data/generated` を出力・Biome 整形）→ `tsc --noEmit` で型検証。

### 型機構の変更

- `RegulationBase` に `period: { start; end: string | null }` を追加。
- per-regulation 生成型が `species` / `items` / `mega` の解禁集合を持つ。
- `src/types/party.ts` の `ConstrainParty` / `NotLegalInRegulation` を per-regulation 解禁集合参照へ付け替え。
- `SpeciesBase.regulations[]` を削除し、参照箇所（party.ts / CLI check-party / 型テスト）を追従。

## スコープ外

- **M-A 全データ投入（全186種・全 movepool）の実施**。本計画はデータ保持モデル再設計と M-A 著述基盤（新スキーマ /
  catalog SoT / 情報源確定 / materialize 経路）の確定までを担い、M-A の全量投入そのものは
  [`04-generated-layout-redesign`](../04-generated-layout-redesign/README.md) の Phase 4 へ移動した（新パイプライン経由）。
- **M-B 以降の正確な解禁データ投入**（M-B は未公開・暫定プレースホルダ維持）。
- ダメージ計算・ステータス調整など `01-mvp` の機能拡張（本計画はデータ保持モデルに限定）。
- PokeAPI に無い独自補正の大幅拡張（既存 `overrides.yaml` の枠組みを踏襲）。
- 全国図鑑の全種族 vendor（チャンピオンズ解禁済みに限定する方針）。

## 受け入れ基準

この計画群全体の客観条件（計画完了の判定基準）:

1. 各フェーズ末で `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
2. レギュレーションが期間（開始必須・終了 nullable）付きで管理され TS 型として参照できる。
3. 種族 / 技 / 持ち物 / 特性が独立カタログ YAML（append-only）で管理され、種族はその id を参照する。
4. 解禁情報の正本が per-regulation に一本化され（`SpeciesBase.regulations[]` 廃止）、型レベル解禁判定が
   per-reg 解禁集合を参照する。
5. レギュレーション M-A の解禁データを全量投入する基盤（新スキーマ・catalog SoT・情報源確定・materialize 経路）が
   整う。**M-A 全186種の全量投入そのものは [`04-generated-layout-redesign`](../04-generated-layout-redesign/README.md) の
   Phase 4 へ移動**した（新パイプライン経由・新レイアウト上で投入）。
6. 種族×レギュレーションの技対応が `regulations/<id>.yaml`（block 記法・種族キー = 解禁・per-species `moves`/`mega[]`）で直読できる。
7. `generate.ts` は YAML → TS 変換専任で、妥当性検証は authoring 時ゲート `check:regulation` が担う。
8. エンティティの ja/en 名の SoT が `catalog/*.yaml`（`id → { ja, en }`）にあり、`generate.ts` は名前を PokeAPI から
   引かず YAML から変換する。types は名前 + 相性倍率（`damageTo`）とも `catalog/types.yaml` 由来で、`generate.ts` は
   types について `data/raw` を読まない。`abilities.ts` / `items.ts` の生成 TS は id-only（+ items 構造）で name を
   持たず、species / moves / types は name を保持する（ja→id 逆引きは維持）。
9. ADR 本文が可変な plan ファイル（phase doc / OVERVIEW / phase 番号）を参照せず、方針が `adr.md` rule に codify される。
10. PokeAPI を Champions の解禁種族 / 使用できる技（learnset legality）/ 持ち物 / 技威力の信頼源にしない決定が ADR
    として残り、`check:regulation` の learnset 照合が撤去され、技メタの SoT が PokeAPI raw から移設され、
    `survey-regulation`/関連 rule がこれに追従する（正式対応時に見直し可）。
11. レギュ非依存の構造データ（種族値 / タイプ / 特性 id / 図鑑番号 / 持ち物 category）の SoT が catalog YAML にあり、
    `data/raw` → catalog の転記を `materialize.ts`（raw 不在なら fail-fast）が担い、`generate.ts` が `data/raw` を
    一切読まず catalog から生成物を等価に出力する。取得元は PokeAPI 継続（`fetch:data` 維持）。raw 存在の担保は
    `survey-regulation` skill の責務で、`overrides.yaml` は廃止される。決定が ADR（0025 拡張）として残る。
12. `data/README.md` が `data/` 配下の各エントリの「何を表す / 取得元 / SoT / 取得・更新 skill・コマンド」を索引化し、
    スキーマ詳細は SoT（rule）へのリンクで委譲する（重複記述を持たないポインタ式）。
13. `data/champions/**`（catalog / regulations / rules.yaml）が **skill 著述・人間直編集 NG・誤りは skill/AI 経由で訂正**と
    方針化され、統一用語 **`skill-authored`** の定義が ADR + `data-pipeline.md` に確定する。`rules.yaml` の改定経路は
    「AI への直接指示」と定義される。
14. ADR 本文不変則に「決定本質を変えない用語 rename を整備例外として許可」が `adr.md` に codify され、`hand-authored` が
    `skill-authored` へ統一される（不変ログ＝learnings / archive を除く）。ADR 本文（0025 / 0026 / 0027）の rename は
    決定本質を変えないことを逐一確認済み。「手動管理 / 手書き編集」等の人間直編集前提文言が方針表現へ解消される。
15. 情報源の役割・関係性（① Serebii 第一優先 / ② 補助 = 件数裏取り / ③ PokeAPI = 構造データ取得元・突き合わせ原則）が
    `serebii-sourcing.md` に **1 か所へ集約 SoT 化**され、`SKILL.md` / `data-pipeline.md` / `data/README.md` はポインタになる。
16. データ取得フロー図（`architecture.md` / `data/README.md`）が **Mermaid** で、3 流入（① / ② / ③）と skill 著述 / 機械転記の
    **2 系統合流**を明示する（図は Mermaid 優先・ASCII は確固たる理由がある場合のみ）。

## phase 分割（6 基準の評価サマリ）

データモデル再設計（構造変更）とデータ投入（情報源確定・正確化・全量投入）は性質が異なり、構造変更も「カタログ分離」
「レギュレーションモデル再設計（型機構を含む）」「per-regulation 種族型化」「技記録スキーマ再設計」「generate 責務
縮小 + authoring 検証」で意思決定・不可逆性が分かれる。想定 diff と並行性から **19 phase に分割（主鎖は直列・16〜19 は一部並行）**。旧 Phase 20（M-A 全量投入）は新パイプラインで投入すべく [`04-generated-layout-redesign`](../04-generated-layout-redesign/README.md) の Phase 4 へ移動した。
全量投入（最終 Phase）の手前に、**materialize 手順の定型化（Phase 8・harness）と 3 種小データセットでの本格スケール
検証（Phase 9・data）、名前 / タイプ相性 SoT を catalog YAML へ移すスキーマ確定（Phase 10・構造）、ADR の
可変 plan 参照を除去する hygiene（Phase 11・harness）、PokeAPI を Champions legality / 技威力の信頼源から外す
決定 + harness 追従（Phase 12・harness/構造）、構造データ（種族値/タイプ/特性/図鑑番号/category）の catalog 化 +
materialize 新設 + overrides 廃止（Phase 13・構造）、および data/ ディレクトリ説明 README の追加（Phase 14・doc）**を
挿入し、全186種投入を de-risk する:

| phase | 狙い | 意思決定 | 不可逆性 | 想定 diff | 備考 |
|---|---|---|---|---|---|
| **01 カタログ分離** | roster.yaml → 4 種別 catalog YAML（append-only）。生成出力は等価維持。 | 中 | 中 | ~300-400 | 機械的再編が中心 |
| **02 レギュレーションモデル再設計** | per-reg YAML + period + per-reg 型生成 + A案型機構 + species.regulations[] 廃止。 | 高 | 高 | ~500-700 | 本計画の核・ADR 起票 |
| **03 情報源確定 + 20匹サンプル検証** | 解禁情報取得 skill を作成し、WebSearch で M-A 信頼情報源を確定・全リスト doc 化。無作為20匹で end-to-end 検証。 | 中 | 低 | ~中（大半データ） | 新構造の妥当性確認・skill 化 |
| **04 per-regulation 種族型 + 個体複数レギュ宣言** | global species.ts 廃止 → per-reg `regulations/<id>/species.ts`（per-reg 習得技）を正本化 + reg-aware 型機構 + 個体 `regulations:[]` fan-out + ADR 0021 削除して作り直す。 | 高 | 高 | ~700-1200 | 構造 + 型機構・データ量不変・diff 過大なら 2 PR（型基盤 / 個体 fan-out）分割 |
| **05 技記録スキーマ再設計** | `allow.{...}` 廃止 → 種族キー = 解禁 + per-species `moves`/`mega[]`・block 記法。`mega` 配列化。generate を新スキーマ読取りへ追従（learnset 検証は残す）。出力等価。 | 高 | 高 | ~400-600 | ADR 0022（記録方法）・安全性のため検証は残す |
| **06 generate 変換専任 + 検証ゲート** | `check:regulation` 新設（authoring ゲート）+ generate から learnset 交差・検証を除去し変換専任へ。Git hooks/CI 連携。 | 高 | 中 | ~300-500 | ADR-B（generate 責務 / 検証位置） |
| **07 M-A 現ロスター持ち物・技 正確化（interim）** | 現 `champions-m-a.yaml` 記載済み約27種に限定し、`items`（未解禁除去）と各種族 `moves`（learnset ∩ M-A legal）を実情に正確化。種族追加はしない。 | 低 | 低 | ~300-600 | データ正確化 PR・全量化は 14 に残す |
| **08 survey-regulation skill 全量 materialize 定型化** | Phase 7 で人手実行した「Serebii 第一優先で全 learnable 技 + 解禁持ち物を全量 materialize・投入前 learnset 照合」手順を skill へ恒久化。レギュ更新時 routine 化。 | 中 | 低 | ~中（skill 改修） | harness PR・`skill-creator` 利用・`harness-review` |
| **09 小データセット検証投入（3 種）** | garchomp / charizard / gengar の全 Serebii movepool（各60〜70技）+ M-A 解禁持ち物全件を投入し、パイプラインが本格スケールで通ることを確認。Phase 20 を de-risk。 | 低 | 低 | ~中（データ） | データ投入 PR・skill の実用検証 |
| **10 catalog 日英名 authoring + generate 名前変換専任化** | catalog YAML を `id → { ja, en }` 形式へ・名前 SoT を catalog YAML へ移し generate を名前について変換専任化。types は名前 + 相性倍率も YAML 化し generate を types について raw 非依存に。abilities/items 生成 TS を id-only 化（species/moves/types は name 保持）。既存分の移行のみ。 | 中 | 高 | ~中（catalog 移行 + 生成物差分） | 構造 + データ移行・ADR 起票（0012 名前部分の改訂） |
| **11 ADR の可変 plan 参照除去 + adr.md codify** | ADR 本文から可変 plan ファイル（phase doc / OVERVIEW / phase 番号）参照を遡及除去し、方針を `adr.md` rule へ codify（不変則の遡及除去例外を明記）。 | 中 | 中 | ~中（rule + ADR 編集） | harness PR・`harness-review`・データ phase と独立 |
| **12 PokeAPI を Champions legality・技威力の信頼源から外す** | PokeAPI は Champions 非対応。解禁種族 / 使える技(learnset legality) / 持ち物 / 技威力の信頼源として使わない決定を ADR 化し、`check:regulation` の learnset 照合を撤去・技メタ SoT を raw から移設・`survey-regulation`/各 rule を追従。構造データ(種族値・タイプ等)は vendor 維持。修正前後の検証フェーズを含む。 | 高 | 高 | ~中-大（src + skill + rule + ADR） | harness/構造 PR・`code-review`/`harness-review`・全量投入の前提 |
| **13 構造データの catalog 化** | レギュ非依存の構造データ（種族値/タイプ/特性 id/図鑑番号/持ち物 category）の SoT を `data/raw` 直読から catalog YAML へ移す。`materialize.ts`（raw→catalog 転記・fail-fast）新設・`generate` raw 非依存化・`overrides.yaml` 廃止・`survey-regulation` に materialize 手順内包。取得元は PokeAPI 継続。生成物は等価。 | 高 | 高 | ~中-大（src + skill + catalog 移行 + 生成物差分） | 構造 PR・`code-review`/`harness-review`・ADR 起票（0025 拡張）・全量投入の前提 |
| **14 data/ ディレクトリ説明 README** | `data/README.md` を 1 枚追加し各エントリの「何を表す / 取得元 / SoT / 取得・更新 skill・コマンド」を索引化。スキーマ詳細は rule へリンク（ポインタ式・重複回避・壁打ちで確定）。 | 低 | 低 | ~小（doc 1 枚） | doc PR・`harness-review`・12/13 の決定を最終形として反映 |
| **15 data/ 全 YAML ブロックスタイル強制ゲート** | `data/**/*.yaml` に flow スタイル混入を弾く CI ゲートを新設（AST ベース検出の純関数 + check コマンド + verify/githooks 配線）。`materialize.ts` を block 出力化・既存 data YAML を block へ再整形。生成物は等価。全量投入(16)の手前でスタイルを確定。 | 中 | 中 | ~中（src + check + データ整形 + 配線） | src/harness PR・`code-review`/`harness-review`・ADR 要否判断・全量投入の前提 |
| **16 ADR 用語整備の例外** | Accepted ADR 本文の「決定本質を変えない用語 rename」を整備例外として許可（adr.md 追記 + 新規 ADR）。phase-18 の ADR 本文 rename を正規化。 | 中 | 中 | ~小（rule + ADR） | harness PR・`harness-review`・11 の例外の延長 |
| **17 データ運用方針 + 統一用語確定** | data/champions/** を skill 著述・人間直編集 NG と定め、統一用語 skill-authored を ADR + data-pipeline.md に確定。rules.yaml の改定経路 = AI 直接指示。 | 中 | 中 | ~小-中（ADR + rule） | harness PR・`harness-review`・16 と並行可 |
| **18 用語 rename + 文言展開** | hand-authored → skill-authored を全資産 + ADR 本文へ機械展開（意味保存・逐一確認）。手動管理 / 手書き編集等の人間直編集前提文言を方針へ改訂。 | 低 | 低 | ~中（多ファイル機械的） | harness PR・`harness-review`・16/17 依存 |
| **19 情報源 SoT + フロー図 Mermaid** | 情報源 3 系統（Serebii 第一優先 / 補助裏取り / PokeAPI 構造データ）の役割を serebii-sourcing.md に集約 SoT 化。両フロー図を Mermaid で 2 系統合流図へ改訂。 | 中 | 低 | ~中（doc + 図） | harness PR・`harness-review`・17 依存 / 18 後推奨 |
| ~~20 M-A 全データ投入~~ | **[`04-generated-layout-redesign`](../04-generated-layout-redesign/README.md) の Phase 4 へ移動**。新パイプライン（決定論スクレイパー + 自己修復）経由で全186種を全量投入する。02 は著述基盤の確定までを担う。 | — | — | 大（03 で投入） | 移動 |

- **01 → 02 → 03 → 04 → 05 → 09 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14 → 15 → 16〜19 の主鎖**（旧 Phase 20 = M-A 全量投入は 04 の Phase 4 へ移動）。01/02/04/05/06/10/12/13 は共に `generate.ts` と生成構造を触り競合しやすいため直列。Phase 11（ADR hygiene）はデータ phase と独立だが順序上は 10 の後・12 の前に置く。著述基盤確定の最後に **16〜19（data 著述方針の明確化・harness/doc）** を置く（**16 ∥ 17 → 18 ⇢ 19**・16/17 は独立着手可・18 後に 19 で churn 最小）。全量投入は 04（Phase 4）で新パイプライン経由・新レイアウト上で実施する。
- **03 で情報源と全リストを確定 → 04 で生成構造を per-reg へ → 05 で技記録スキーマを確定 → 06 で検証位置を確定 → 07 で現ロスターを正確化 → 08 で materialize 手順を定型化 → 09 で 3 種小データセット検証 → 10 で名前 / タイプ相性 SoT を catalog YAML へ確定 → 11 で ADR hygiene → 12 で PokeAPI を Champions legality / 技威力の信頼源から外す決定 + harness 追従 → 13 で構造データを catalog YAML へ（materialize 新設 / generate raw 非依存 / overrides 廃止）→ 14 で data/ ディレクトリ説明 README → 15 で data/ 全 YAML ブロックスタイル強制ゲート → 16〜19 で data 著述方針の明確化（用語整備の例外 / 運用方針 + 統一用語 / 用語 rename + 文言展開 / 情報源 SoT + フロー図 Mermaid）。全量投入（旧 20）は後続計画群 09-ma-full-data で新パイプライン経由で実施**
  （最終構造・定型手順・確定した情報源方針・catalog SoT・著述方針の上で投入しやり直しを避ける）。
- **07 を全量投入の手前に分けた理由**: 現ロスター（記載済み約27種）の持ち物・技は暫定でっち上げで未解禁混入・技サブセット
  化しており、全186種の全量投入（20・大規模）を待たずに**現データを使える状態に正確化**する価値がある。07 は
  現ロスター限定・種族追加なしで scope を絞り、後続が 07 の土台の上で全列挙へ拡張する。
- **08 / 09 を全量投入（20）の手前に挿入した理由**: 全186種・各種族数十技の全量投入は取りこぼし・名称ゆれ・フォルム
  扱いの事故が起きやすい。**08 で materialize 手順（Serebii 第一優先 / 全量）を skill へ恒久化**し、**09 で 3 種
  （各60〜70技・持ち物100件超）の本格スケールでパイプラインを先に通す**ことで、20 を de-risk する。08 は harness
  改修（`harness-review`）、09 はデータ投入（`code-review` / `pokemon-data-reviewer`）で性質が分かれるため別 phase。
- **10 を全量投入（20）の手前に挿入した理由**: 名前（ja/en）と types 相性の SoT を PokeAPI 由来生成から catalog YAML の
  skill-authored へ移すスキーマ変更は、全量投入の**前**に確定しないと全186種を旧スキーマで入れてからやり直す事故に
  なる。10 で catalog を `id → { ja, en }` 形式へ確定し `survey-regulation` に ja/en 記録手順を入れてから、20 で全量を
  ja/en 名込みで materialize する。10 は **catalog 形式・`generate.ts`・型・生成物を同時に変える意味的 atomic な
  1 PR**（途中状態が壊れる）で、既存分の移行のみ・新規 id の Web 調査は 20 が担う。
- **11（ADR hygiene）を分けた理由**: ADR 本文から可変 plan 参照を除去し方針を `adr.md` へ codify する作業は、データ
  モデル変更とは独立した**harness hygiene**で、`harness-review` 観点・diff も別系統。Phase 10 の ADR 起票が本方針に
  従うため、それを恒久化し過去 ADR を揃える位置づけ。データ phase（10 / 13 / 20）と diff が干渉しないため独立 PR とする。
- **04 は構造 + 型機構変更**（データ量不変）。`SpeciesId` の波及が広く reg-aware 化で型引数 `R` が増えるため、
  想定 diff が >1000 行に膨らむ場合は「型基盤（per-reg species 生成 + reg-aware 型機構 + `ConstrainParty` 追従
  + ADR）」と「個体 `regulations:[]` codegen fan-out」へ 2 PR 分割する（[[planning]] の分割）。
- **05/06 を分割した理由**: 記録方法（データ形式・ADR 0022）と generate 責務縮小 + 検証位置（ADR-B）は独立した
  不可逆判断で、ADR も分割して残す。検証の空白を作らないため **05 では generate の learnset 検証を残し、06 で
  `check:regulation` を用意してから除去する**（順序厳守）。
- **12（PokeAPI 除外決定）を全量投入の手前に挿入した理由**: PokeAPI は Champions に対応しておらず、解禁種族 /
  使える技（learnset legality）/ 持ち物 / 技威力の信頼源として使うと実態と乖離する。全186種を「learnset ∩ legal」
  前提で入れてからこの前提を覆すとやり直しになるため、**全量投入の前に決定（ADR）と harness 追従（`check:regulation`
  の learnset 照合撤去・技メタ SoT 移設・`survey-regulation`/各 rule 追従）を確定**する。意思決定 + src/skill/rule の
  不可逆改訂で性質が分かれるため独立 phase。修正前後の検証フェーズを必須にし取り残しを防ぐ。**PokeAPI が Champions
  に正式対応したら本決定は見直せる**（reversible・ADR に明記）。
- **13（構造データ catalog 化）を 12 の後・14 の前に挿入した理由**: 構造データ（種族値/タイプ/特性/図鑑番号/
  category）の SoT を `data/raw` 直読から catalog YAML へ移すスキーマ変更は、Phase 10（名前/相性）と同じく**全量
  投入の前**に確定しないと全186種を旧スキーマ（raw 直読）で入れてからやり直す事故になる。13 で catalog スキーマを
  拡張し `materialize.ts` を新設・`generate` を raw 非依存化・`overrides.yaml` を廃止してから、20 で全量を materialize
  経由で投入する。13 は **catalog スキーマ・`materialize.ts`・`generate.ts`・型・生成物・overrides 廃止を同時に変える
  意味的 atomic な 1 PR**（途中状態が壊れる・既存分の移行のみ）で、Phase 12（技メタ Serebii 化）とは対象（構造データ
  vs 技メタ）が分かれるため別 phase。取得元は PokeAPI 継続で「PokeAPI を使わない」Phase 12 とは方向が異なる。
- **14（data/ 説明 README）を 13 の後・15 の前に挿入した理由**: `data/` の索引（何を表す / 取得元 / SoT / 取得・更新
  skill）は、**12（Serebii 第一優先・PokeAPI 非依存）+ 13（構造データ catalog SoT・materialize・overrides 廃止）の
  確定済み最終形**を反映する必要があるため両者の後に置く（途中状態を索引化するとすぐ陳腐化する）。スキーマ詳細は
  既存 rule（[[data-pipeline]] 等）が SoT で、README は**ポインタ式**にして重複を避ける（壁打ちで確定）。doc 1 枚
  追加で diff も性質も独立するため別 phase（`harness-review`）。
- 20 はデータセット追加で意味ある粒度分割が困難なため、1 PR（>1000 行）を許容する（[[planning]] の例外）。
- **16〜19（data 著述方針の明確化）を全量投入（20）の手前に挿入した理由**: `data/champions` の著述主体（skill/AI）・
  統一用語（`hand-authored` → `skill-authored`）・人間直編集 NG 方針・情報源の役割を、全186種を入れる**前**に確定すると、
  `survey-regulation` 等が新方針・新用語のまま全量投入でき、後から大量データ・文言・図を直し直す churn を避けられる
  （10 / 13 / 15 と同じ「全量の手前で仕組みを確定」論理）。**16（ADR の用語整備例外）∥ 17（運用方針 + 統一用語確定）→
  18（用語 rename + 文言展開）⇢ 19（情報源 SoT + フロー図 Mermaid）** の依存で、16/17 は独立着手可・18 後に 19 で
  churn 最小。いずれも harness/doc で `harness-review` 対象。16 は ADR 本文不変則の整備例外（用語 rename 許可）を
  確立し、18 の ADR 本文 rename を正規化する前提を作る。
