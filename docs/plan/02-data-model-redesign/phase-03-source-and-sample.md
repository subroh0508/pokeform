# Phase 3 — 情報源確定 + 20匹サンプル検証

## 目的 / スコープ

レギュレーション M-A の解禁情報を取得できる**信頼性の高い情報源を WebSearch で確定**し、M-A 解禁種族の
**全リストをドキュメント化**する。そのリストから**無作為に 20 匹を選定**して新データ構造（Phase 1 のカタログ +
Phase 2 の per-reg YAML）へ投入し、生成・型・CLI が**想定通り動くことを end-to-end で検証**する。Phase 4 の全量
投入の前に、新構造の妥当性を 20 匹で先に保証するのが狙い。

- スコープ内: 情報源の WebSearch・信頼性評価（複数ソース突き合わせ）、M-A 全種族リストの doc 化（出典明記）、
  無作為20匹の選定方法の記録、20匹分の catalog 追記 + M-A per-reg allow 投入、end-to-end 検証。
- スコープ外: 残り全種族・全技・全持ち物・全メガの投入（Phase 4）。M-B 以降のデータ。

## 前提（依存）

- **Phase 2（レギュレーションモデル再設計）完了**。catalog + per-reg YAML + per-reg 型 + A案判定が動くこと。
- 確定済み rule: [[data-pipeline]] / [[cli-and-io]] / [[redaction]]（doc 化時の外部書き出し点検）。
- メモリ [[champions-regulation-data-placeholder]]（現行解禁リストは暫定・不正確）を上書きする実データに置換する。

## タスク

- [ ] WebSearch で M-A 解禁情報の情報源を複数収集し信頼性を評価（例: 公式 / serebii / bulbapedia / game8 等を
      突き合わせ、矛盾を洗う）。採用した情報源と検証日を記録。
- [ ] M-A 解禁**種族の全リスト**を `docs/` 配下（例: `docs/plan/02-data-model-redesign/ma-roster-source.md`）に
      出典付きで整理（基本最終進化・メガ可・テラス/ダイマ不可・Restricted 除外などの M-A 条件も明記）。
- [ ] 全リストから**無作為に 20 匹**を選定（選定手順＝再現可能な方法を記録。例: 全リストに通し番号→固定シードで抽出）。
- [ ] 20 匹を新構造へ投入:
  - [ ] catalog/species.yaml（+ 必要な moves / items / abilities / megaLinks）へ追記（append-only）。
  - [ ] regulations/champions-m-a.yaml の allow（species / items / mega / moves）へ反映。
- [ ] `pnpm fetch:data && pnpm generate:data` で再生成し、20 匹が per-reg 型・species 型に正しく現れることを確認。
- [ ] end-to-end 検証: 20 匹のうち数体でパーティ fixture を作り、M-A 解禁判定（A案）・CLI（check-party 等）が
      想定通り動くことを確認。

## この Phase で育てるハーネス（rule・skill）

- なし（データ投入と検証が中心。情報源 doc は計画群配下に置く）。必要なら [[champions-regulation-data-placeholder]]
  メモリを実データ確定に合わせて更新。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- M-A 解禁種族の全リストが信頼できる情報源（複数突き合わせ）に基づき出典付きで doc 化されている。
- 無作為20匹の選定手順が再現可能な形で記録されている。
- 20 匹が catalog + M-A per-reg YAML に投入され、生成・型・CLI が想定通り動く（end-to-end 検証済み）。

## 検証手順

1. doc 化した情報源を複数ソースで突き合わせ、矛盾が解消されていることを確認。
2. 20 匹投入後 `pnpm generate:data` → `data/generated/regulations/champions-m-a.ts` に 20 匹が現れることを確認。
3. M-A 解禁の 20 匹からパーティ fixture を作り型チェックが通る / 未解禁種族はエラーになることを確認。
4. `pnpm verify` 緑を確認。

## リスク・備考

- **情報源の信頼性が要**: 単一ソース依存を避け複数突き合わせる。矛盾は doc に残し採用根拠を明記。
- WebSearch 結果の doc 化・外部リンク掲載時は [[redaction]] を点検（PII / Secrets は対象外だがリンク健全性を確認）。
- 無作為抽出は「無作為であること」より「再現可能であること」を優先（後から検証できるよう手順を残す）。
- ここで新構造の不備が見つかれば Phase 2 へ差し戻して修正する（20匹は安全弁）。
