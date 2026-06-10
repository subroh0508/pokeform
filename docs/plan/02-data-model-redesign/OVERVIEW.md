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

## 実装指針

### data/champions/（手動・コミット）の新構造

```
data/champions/
  rules.yaml                      # 既存（ゲーム計算定数・不変）
  overrides.yaml                  # 既存（習得技/特性の世代差・上書き）
  catalog/                        # ← 新規：append-only エンティティカタログ
    species.yaml                  #   解禁済み種族 slug の一覧（+ megaLinks）
    moves.yaml                    #   解禁済み技 id の一覧
    items.yaml                    #   解禁済み持ち物 id の一覧（+ megaStone メタ）
    abilities.yaml                #   解禁済み特性 id の一覧
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

- **M-B 以降の正確な解禁データ投入**（M-B は未公開。本計画は M-A の全量投入までで、M-B は暫定プレースホルダ維持）。
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
5. レギュレーション M-A の解禁種族・技・持ち物・メガが信頼できる情報源に基づき全量そろう（全186種・各種族の全 learnable 技）。
6. 種族×レギュレーションの技対応が `regulations/<id>.yaml`（block 記法・種族キー = 解禁・per-species `moves`/`mega[]`）で直読できる。
7. `generate.ts` は YAML → TS 変換専任で、妥当性検証は authoring 時ゲート `check:regulation` が担う。

## phase 分割（6 基準の評価サマリ）

データモデル再設計（構造変更）とデータ投入（情報源確定・正確化・全量投入）は性質が異なり、構造変更も「カタログ分離」
「レギュレーションモデル再設計（型機構を含む）」「per-regulation 種族型化」「技記録スキーマ再設計」「generate 責務
縮小 + authoring 検証」で意思決定・不可逆性が分かれる。想定 diff と並行性から **10 phase に分割（直列依存）**。
全量投入（Phase 10）の手前に、**materialize 手順の定型化（Phase 8・harness）と 3 種小データセットでの本格スケール
検証（Phase 9・data）**を挿入し、全186種投入を de-risk する:

| phase | 狙い | 意思決定 | 不可逆性 | 想定 diff | 備考 |
|---|---|---|---|---|---|
| **01 カタログ分離** | roster.yaml → 4 種別 catalog YAML（append-only）。生成出力は等価維持。 | 中 | 中 | ~300-400 | 機械的再編が中心 |
| **02 レギュレーションモデル再設計** | per-reg YAML + period + per-reg 型生成 + A案型機構 + species.regulations[] 廃止。 | 高 | 高 | ~500-700 | 本計画の核・ADR 起票 |
| **03 情報源確定 + 20匹サンプル検証** | 解禁情報取得 skill を作成し、WebSearch で M-A 信頼情報源を確定・全リスト doc 化。無作為20匹で end-to-end 検証。 | 中 | 低 | ~中（大半データ） | 新構造の妥当性確認・skill 化 |
| **04 per-regulation 種族型 + 個体複数レギュ宣言** | global species.ts 廃止 → per-reg `regulations/<id>/species.ts`（per-reg 習得技）を正本化 + reg-aware 型機構 + 個体 `regulations:[]` fan-out + ADR 0021 削除して作り直す。 | 高 | 高 | ~700-1200 | 構造 + 型機構・データ量不変・diff 過大なら 2 PR（型基盤 / 個体 fan-out）分割 |
| **05 技記録スキーマ再設計** | `allow.{...}` 廃止 → 種族キー = 解禁 + per-species `moves`/`mega[]`・block 記法。`mega` 配列化。generate を新スキーマ読取りへ追従（learnset 検証は残す）。出力等価。 | 高 | 高 | ~400-600 | ADR 0022（記録方法）・安全性のため検証は残す |
| **06 generate 変換専任 + 検証ゲート** | `check:regulation` 新設（authoring ゲート）+ generate から learnset 交差・検証を除去し変換専任へ。Git hooks/CI 連携。 | 高 | 中 | ~300-500 | ADR-B（generate 責務 / 検証位置） |
| **07 M-A 現ロスター持ち物・技 正確化（interim）** | 現 `champions-m-a.yaml` 記載済み約27種に限定し、`items`（未解禁除去）と各種族 `moves`（learnset ∩ M-A legal）を実情に正確化。種族追加はしない。 | 低 | 低 | ~300-600 | データ正確化 PR・全量化は 10 に残す |
| **08 survey-regulation skill 全量 materialize 定型化** | Phase 7 で人手実行した「Serebii 第一優先で全 learnable 技 + 解禁持ち物を全量 materialize・投入前 learnset 照合」手順を skill へ恒久化。レギュ更新時 routine 化。 | 中 | 低 | ~中（skill 改修） | harness PR・`skill-creator` 利用・`harness-review` |
| **09 小データセット検証投入（3 種）** | garchomp / charizard / gengar の全 Serebii movepool（各60〜70技）+ M-A 解禁持ち物全件を投入し、パイプラインが本格スケールで通ることを確認。Phase 10 を de-risk。 | 低 | 低 | ~中（データ） | データ投入 PR・skill の実用検証 |
| **10 M-A 全データ投入** | M-A 解禁の全186種・全技・全持ち物・全メガを全量投入し完成（各種族の全 learnable 技）。07 の正確化と 09 の 3 種を起点に拡張。 | 低 | 低 | 大（データ例外） | データ投入 PR |

- **01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 の直列**。01/02/04/05/06 は共に `generate.ts` と生成構造を触り競合しやすいため直列。
- **03 で情報源と全リストを確定 → 04 で生成構造を per-reg へ → 05 で技記録スキーマを確定 → 06 で検証位置を確定 → 07 で現ロスターを正確化 → 08 で materialize 手順を定型化 → 09 で 3 種小データセット検証 → 10 で全量投入**
  （最終構造・定型手順の上で投入しやり直しを避ける）。
- **07 を全量投入の手前に分けた理由**: 現ロスター（記載済み約27種）の持ち物・技は暫定でっち上げで未解禁混入・技サブセット
  化しており、全186種の全量投入（10・大規模）を待たずに**現データを使える状態に正確化**する価値がある。07 は
  現ロスター限定・種族追加なしで scope を絞り、後続が 07 の土台の上で全列挙へ拡張する。
- **08 / 09 を全量投入（10）の手前に挿入した理由**: 全186種・各種族数十技の全量投入は取りこぼし・名称ゆれ・フォルム
  扱い・learnset version_group 差異の事故が起きやすい。**08 で materialize 手順（Serebii 第一優先 / 全量 / 投入前
  learnset 照合）を skill へ恒久化**し、**09 で 3 種（各60〜70技・持ち物100件超）の本格スケールでパイプラインを
  先に通す**ことで、10 を de-risk する。08 は harness 改修（`harness-review`）、09 はデータ投入（`code-review` /
  `pokemon-data-reviewer`）で性質が分かれるため別 phase。
- **04 は構造 + 型機構変更**（データ量不変）。`SpeciesId` の波及が広く reg-aware 化で型引数 `R` が増えるため、
  想定 diff が >1000 行に膨らむ場合は「型基盤（per-reg species 生成 + reg-aware 型機構 + `ConstrainParty` 追従
  + ADR）」と「個体 `regulations:[]` codegen fan-out」へ 2 PR 分割する（[[planning]] の分割）。
- **05/06 を分割した理由**: 記録方法（データ形式・ADR 0022）と generate 責務縮小 + 検証位置（ADR-B）は独立した
  不可逆判断で、ADR も分割して残す。検証の空白を作らないため **05 では generate の learnset 検証を残し、06 で
  `check:regulation` を用意してから除去する**（順序厳守）。
- 10 はデータセット追加で意味ある粒度分割が困難なため、1 PR（>1000 行）を許容する（[[planning]] の例外）。
