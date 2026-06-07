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
   catalog/per-reg YAML 反映を再利用可能な手順 skill に切り出す（Phase 3 で作成、Phase 4 と M-B 以降が再利用）。

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
    champions-m-a.yaml            #   name / period / allow{ species, items, mega, moves }
    champions-m-b.yaml
```

### data/generated/（生成・コミット）の新構造

```
data/generated/
  types.ts moves.ts abilities.ts items.ts species.ts names.ts   # カタログ由来（species.regulations[] は廃止）
  regulations/
    champions-m-a.ts            # per-reg：name / period / 解禁 species・items・mega の集合 + 派生型
    champions-m-b.ts
    index.ts                    # RegulationId 集約・re-export
```

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

## phase 分割（6 基準の評価サマリ）

データモデル再設計（構造変更）とデータ投入（情報源確定・全量投入）は性質が異なり、構造変更も「カタログ分離」
と「レギュレーションモデル再設計（型機構を含む）」で意思決定・不可逆性が分かれる。想定 diff と並行性から
4 phase に分割（直列依存）:

| phase | 狙い | 意思決定 | 不可逆性 | 想定 diff | 備考 |
|---|---|---|---|---|---|
| **01 カタログ分離** | roster.yaml → 4 種別 catalog YAML（append-only）。生成出力は等価維持。 | 中 | 中 | ~300-400 | 機械的再編が中心 |
| **02 レギュレーションモデル再設計** | per-reg YAML + period + per-reg 型生成 + A案型機構 + species.regulations[] 廃止。 | 高 | 高 | ~500-700 | 本計画の核・ADR 起票 |
| **03 情報源確定 + 20匹サンプル検証** | 解禁情報取得 skill を作成し、WebSearch で M-A 信頼情報源を確定・全リスト doc 化。無作為20匹で end-to-end 検証。 | 中 | 低 | ~中（大半データ） | 新構造の妥当性確認・skill 化 |
| **04 M-A 全データ投入** | M-A 解禁の種族・技・持ち物・メガを全量投入し完成。 | 低 | 低 | 大（データ例外） | データ投入 PR |

- **01 → 02 → 03 → 04 の直列**。01/02 は共に `generate.ts` と `data/champions` を触り競合しやすいため直列。
- **03 で情報源と全リストを確定**してから 04 で全量投入する（20匹で新構造が想定通り動くことを先に保証）。
- 04 はデータセット追加で意味ある粒度分割が困難なため、1 PR（>1000 行）を許容する（[[planning]] の例外）。
