# Phase 1 — ADR 起票（generated/YAML ディレクトリ再編 + 名前 SoT を languages へ / メガ独立 spec エンティティ）

## 目的 / スコープ

本再編が伴う**不可逆な設計判断**を ADR として確定し、後続の実装（Phase 2）と既存 ADR との整合を先に固める。コード変更はしない（設計確定のみ）。

- スコープ内:
  - **ADR (a)「generated/YAML ディレクトリ再編＋specs/languages 分離」**: 構造（specs・言語非依存）/ 名前（languages・ゲーム非依存）/ レギュ解禁（per-reg 4 オブジェクト）の 3 軸直交、YAML 参照機構＝ディレクトリ同型＋generate 合成（`$ref` 不採用）、名前 SoT の所在を catalog/dex から `data/languages/*` へ移す決定。ADR 0025（名前 SoT を catalog へ）/ 0032（ja 取得元）/ 0034（技メタ per-game SoT・所在）を **supersede/追補**（決定の本質は不変・所在のみ改訂）。
  - **ADR (b)「メガを独立 spec エンティティ化」**: メガを `species-specs` 内エントリ＋`megaLinks` から `mega-specs`（base 種族から構造データを分離・`baseSpecies` 逆参照）へ。per-reg `mega.ts`・`languages/mega.ts` を派生。
- スコープ外: 実装（Phase 2）。ハーネス rule/skill 追従（Phase 3）。技仕様の値是正（後続計画群 05）・全種族投入（後続計画群 06）。

## 前提（依存）

- なし（本計画群の起点）。ただし既存 ADR 0021/0024/0025/0026/0027/0030/0032/0034 と [[type-conventions]] / [[data-pipeline]] を踏まえる。

## タスク

- [ ] `adr-new` で ADR (a)（ディレクトリ再編 + 名前 SoT を languages へ）を採番・起票。Context に「3 軸直交・$ref 不採用（generate 合成）・名前所在移動」を、Decision を断定形で、Alternatives に「$ref リゾルバ / YAML anchor」「名前を dex 埋め込み維持」を記す。
- [ ] `adr-new` で ADR (b)（メガ独立 spec エンティティ）を採番・起票。Alternatives に「species-specs 内維持＋派生ビュー」を記す。
- [ ] 旧 ADR 0025 / 0032 / 0034 の frontmatter `status` を `Superseded by ADR-NNNN`（または追補注記）へ更新し、必要に応じ archive へ退避＋inbound 参照追従（[[adr]] の supersede 手順）。
- [ ] ADR README 一覧に追記。

## この Phase で育てるハーネス（rule・skill）

- ADR 2 本（`adr-new`）。rule 本文（data-pipeline / type-conventions）の追従は Phase 3 で行う（本 phase は ADR 確定のみ）。

## 受け入れ基準

- 新 ADR 2 本が `docs/adr/` に採番・起票され、`docs/adr/README.md` 一覧に載る。
- 旧 ADR 0025/0032/0034 の status が追従し、番号参照の dangling が無い（[[adr]] の archive 追従）。
- `pnpm verify` 緑（doc のみのため型・テストに影響なし）。

## 検証手順

1. `ls docs/adr/` で新 ADR slug の実在を確認、README 一覧と一致。
2. `git grep -n "<旧ADR番号>"` で supersede した ADR への inbound 参照が後継/archive へ向くことを確認。
3. `pnpm verify` 緑。

## リスク・備考

- 名前 SoT 所在の移動は ADR 0025/0032/0034 の所在再決定。**決定の本質（catalog/skill-authored が SoT・raw 非依存）は保つ**点を ADR 本文で明示し、誤って「raw 直読へ戻す」等と読まれないようにする。
- ADR は plan ファイル（可変）を参照しない（[[adr]] の参照規約）。所在・型名は rule / architecture.md を引く。
