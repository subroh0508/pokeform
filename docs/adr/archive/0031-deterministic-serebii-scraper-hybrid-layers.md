---
id: 0031
status: Superseded by ADR-0033
date: 2026-06-14
---

# 0031. Champions 解禁データ取得を決定論スクレイパー + ハイブリッド3層へ刷新する

## Context

`survey-regulation` skill は Champions の Serebii 解禁ページを LLM が WebFetch で目視抽出しており、186 種族規模で
トークン消費が重く、小型モデル抽出ゆえ件数・帰属の誤りも起きやすい（skill 自身が「件数を誤カウントしうる」と
注記していた）。実ページを取得して構造を確認した結果、Champions ページは技テーブルが "Standard Moves" 1 表に
統合されており、種族値 / タイプ / 特性 / dex / 使用可能技（name/type/damageClass/power/accuracy/pp）は**全て
決定論的に抽出可能**と判明した。LLM 目視は不要で、テスト済み純関数に置き換えればトークンと正確性を同時に改善
できる。

この刷新は既存の不変決定（[ADR 0026](./0026-pokeapi-not-champions-legality-source.md) Serebii 第一優先・
PokeAPI を legality / 技メタの信頼源にしない / [ADR 0027](./0027-structural-data-catalog-sot.md) 構造データ
catalog SoT・materialize append/既存尊重 / [ADR 0030](../0030-data-champions-skill-authored.md) skill-authored）
の**上に取得手段だけを差し替える**もので、これらを覆さない。「Serebii から**どう**取るか」を変える決定であり、
何を正とするか（Serebii）は不変である。

## Decision

Champions 解禁データの取得を、LLM の WebFetch 目視抽出から**決定論スクレイパー（cheerio）+ ハイブリッド3層**へ
刷新する。正しさを cross-agent 共有の決定論コードに集約し、その上に Claude 固有の取得 / 修正 SubAgent を
「加速・自動修復」として乗せる。

- **層1（決定論・cross-agent 共有）**: `src/codegen/serebii/*.ts` の純関数パーサ（cheerio・テスト100%）+
  `scripts/{fetch-serebii,scrape-serebii,serebii-to-catalog}.ts` の薄い配線。LLM は HTML を一切読まない。
  自己検証 exit code（2 取得失敗 / 3 schema 欠落 / 4 件数・健全性 / 0 健全）で結果を表す。
- **層2-3（Claude 固有・Workflow で実装）**: Haiku 取得 SubAgent（層1 を多種に fan-out + exit code 判定）と
  修正 SubAgent（exit 3/4 で `parse.ts` を直し fixture を足して再取得・K 回上限でエスカレーション）。層2-3 は
  Workflow スクリプトで実装する（後続 phase）。
- **層分離の原則**: 抽出・転記の正しさは層1（通常 npm script）に宿す。これにより Codex / 素の CLI でも同じ成果が
  出て cross-agent パリティが壊れない（層2-3 は Claude 固有の加速で、無くても層1 を逐次実行 + 人手修正で完結
  できる）。
- **cheerio を依存に追加**する（決定論 DOM パース）。実行は既存どおりネイティブ Node（`node scripts/...`）で、
  Docker は採用しない。
- **転記の役割分離**: `serebii-to-catalog` は Serebii 由来の権威データ（技メタ / メガストーンのメガ先 /
  per-reg 解禁 / エンティティ key）を書き、構造データ・日英名は `materialize`（PokeAPI vendor・append/既存尊重）が
  埋める。Serebii 著述値と PokeAPI 構造データの差異は materialize の conflict 提示で自動クロスチェックされる
  （ADR 0027 の設計がそのまま効く）。メガ linking（megaLinks / メガ種族 id / per-reg `mega`）は Serebii の
  メガ名が catalog のメガ id 規約へ決定論変換できないため自動化せず authoring 層へエスカレーションする。

仕様の詳細は [[data-pipeline]] / [`serebii-sourcing.md`](../../.claude/skills/survey-regulation/references/serebii-sourcing.md)。

## Consequences

- **良い点**:
  - 解禁データ取得のトークン消費を大幅に削減（HTML を LLM コンテキストに載せない）。
  - 抽出が決定論・テスト済み純関数になり、件数・帰属の正確性が上がる（自己検証 exit code で機械判定）。
  - 正しさが層1（cross-agent 共有 npm script）にあるため Codex / 素の CLI でも同じ結果に収束し、パリティが壊れない。
- **悪い点 / コスト**:
  - cheerio 依存が増える。Serebii の DOM 構造変更でパーサが壊れうる（exit 3/4 で検出 → 修正 SubAgent / 人手で追従）。
  - メガ linking は自動化できず authoring 層の手当が残る。
- **トレードオフ / 留意点**:
  - 層2-3（Claude 固有 Workflow）は Claude でのみ加速する。Codex は層1 を逐次 + 人手修正で同じ成果に到達する
    （cross-agent フォールバック）。

## Alternatives Considered

- **LLM 目視抽出の継続（現状）**: トークン重・小型モデル誤抽出のため却下。実ページが決定論抽出可能と判明した
  以上、純関数化が優位。
- **PokeAPI learnset を技の正にする**: Champions 非対応で learnset が実態と一致しない（[ADR 0026](./0026-pokeapi-not-champions-legality-source.md) で却下済み）。本 ADR は Serebii 第一優先を維持する。
- **メガ id を Serebii メガ名から決定論導出**: `Mega Garchomp` → catalog `garchomp-mega` の規約ずれで決定論変換
  できず、誤 id 混入リスクが高いため自動化せず authoring 層へ委ねる。
