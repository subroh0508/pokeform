# Phase 5 — M-A 全データ投入

## 目的 / スコープ

Phase 3 で確定した情報源と全リストに基づき、レギュレーション M-A で解禁されている**種族・技・持ち物・
メガシンカを全量**、新データ構造（catalog + per-reg YAML）へ投入し M-A を完成させる。Phase 3 で投入済みの
20 匹を含め、残りの全解禁エンティティを揃える。

- スコープ内: M-A 解禁の全種族を catalog/species.yaml へ、全技を moves.yaml、全持ち物を items.yaml、特性を
  abilities.yaml、メガリンクを species.yaml/items.yaml へ追記。regulations/champions-m-a.yaml の allow を全量化。
  再生成・整合検証。
- スコープ外: M-B 以降のデータ（未公開・暫定維持）。新機能・新 rule。01-mvp の機能拡張。

## 前提（依存）

- **Phase 3（情報源確定 + 20匹サンプル検証）完了**。情報源・全リスト・選定/投入手順が確立し、**解禁情報取得
  skill** が作成済みで、新構造が 20 匹で end-to-end に動くことが保証されていること。
- **Phase 4（per-regulation 種族/メガ構造化）完了**。生成 species 構造が per-reg
  （`data/generated/regulations/<id>/species.ts`）へ移行済みで、全量投入を**最終構造の上**で行えること。
- 確定済み rule: [[data-pipeline]] / [[cli-and-io]] / [[type-conventions]] / [[testing]]。

## タスク

- [ ] Phase 3 で作成した**解禁情報取得 skill を使って**全量投入を駆動する（取りこぼし・使い勝手の問題が
      あれば `skill-creator` で改修）。
- [ ] M-A 解禁の**全種族**を catalog/species.yaml へ追記（Phase 3 の全リスト doc を正本に）。
- [ ] 各種族に紐づく**技 / 持ち物 / 特性 / メガ**を各 catalog へ追記（append-only）。
- [ ] `fetch-pokeapi.ts` で追加 slug を取得・`data/raw` キャッシュ。
- [ ] regulations/champions-m-a.yaml の `allow.{species, items, mega, moves}` を全量化。
- [ ] `pnpm fetch:data && pnpm generate:data` で再生成。
- [ ] 整合検証: 全 id がカタログに存在・参照切れ無し・per-reg 型に全種族が現れる・M-A 条件（基本最終進化 /
      メガ可 / Restricted 除外）に反する混入が無いことを確認。
- [ ] 生成データの妥当性を `pokemon-data-reviewer` agent でレビュー（種族値・タイプ・日英名・解禁整合）。

## この Phase で育てるハーネス（rule・skill）

- なし（データ投入が中心）。M-A 確定に合わせ [[champions-regulation-data-placeholder]] メモリを更新/解消。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- M-A 解禁の種族・技・持ち物・メガが**全量**投入され、`data/generated/regulations/champions-m-a.ts` に反映される。
- 全 id がカタログ参照で解決でき参照切れが無い。
- `pokemon-data-reviewer` のレビューで重大な不整合（種族値・タイプ・解禁整合）が無い。

## 検証手順

1. Phase 3 の全リスト doc と投入後の per-reg 型を突き合わせ、種族数が一致することを確認。
2. `pnpm generate:data` 後、参照切れ・カタログ未登録 id が無いことを確認（生成段の整合チェック）。
3. `pokemon-data-reviewer` agent で生成データをレビューし指摘を解消。
4. `pnpm verify` 緑を確認。

## リスク・備考

- **データ投入 PR（>1000 行）を許容**: M-A は約 186 種規模で意味ある粒度分割が困難なため 1 PR とする
  （[[planning]] の例外・OVERVIEW に根拠記載）。レビュー容易性のため、生成物と手動カタログの差分を分けて説明する。
- 大量投入で PokeAPI 由来の取りこぼし・名称ゆれ・フォルム扱いの誤りが出やすい。`overrides.yaml` で補正する。
- メガの二重表現（種族 megaEvolvesTo / 持ち物 megaStoneFor / per-reg mega 集合）の整合に注意。
- M-A 完成後、M-B 詳細が公開されたら別計画（`03-*`）で M-B 投入を検討（本計画スコープ外）。
