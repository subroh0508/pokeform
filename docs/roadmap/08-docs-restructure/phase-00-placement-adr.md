# Phase 0 — 配置・front matter 規約の ADR 起票（design 新設・命名・roadmap 改名・責務境界）

## 目的 / スコープ

後続の不可逆な配置・front matter 規約を 1 本の ADR に確定する。`adr-new` で採番（現行最大 0037 の次 = 0038 想定だが採番は skill が機械決定）して作成する。決定内容:

- **`docs/design/` の新設**と、既存 `architecture.md`（規約 spec 正本）・rule・ADR との**責務境界**（design = Explanation 俯瞰・コードなし / rule = Reference 規約・具体値 / ADR = 不変ログ / src = 型・数式の機械保証 SoT）。
- **ディレクトリ命名**: `design` 採用・`architecture` 見送りの根拠（reference 誤誘導回避・`docs/adr/` との語衝突回避）。
- **`docs/plan/` → `docs/roadmap/` 改名**と **`completed/` 運用**（完了計画群の集約・番号維持・移動タイミング = 計画群全 phase 完了時）。
- **front matter 規約**: `docs/design/` 配下と `.claude/rules/` 配下の Markdown は、ともに `last_modified`（ISO8601）+ `adr`（関連 ADR 配列）を front matter に持つ。rules は既存 `paths` / `description` に追加する形（Claude 自動ロードは `paths` のみ参照するため `last_modified` / `adr` は独自キーとして許容し、`gen-rules-index.ts` と非干渉）。
- **design と ADR の二重化回避**（両者 Explanation 象限ゆえ。design は決定根拠を再記述せず ADR を索引。front matter `adr` キーが索引を機械的に補強する）。

スコープ外: 実際のファイル移動・分割・改名・front matter の各ファイルへの実適用（Phase 1 以降）。

## 前提（依存）

なし（本計画群の ADR は起点）。実施順としては先行計画 [`07-rules-skills-simplify`](../completed/07-rules-skills-simplify/README.md) を済ませた状態が望ましい（重なるファイルの rework 削減）。Context に外部文献（Diátaxis / arc42・C4 / DRY・ARID / Anthropic 公式）と現状のドリフト債務分析を引く。

## タスク

- [ ] `adr-new "docs/design 新設・front matter 規約とドキュメント配置・roadmap 改名の責務境界"` で ADR を採番・作成。
- [ ] Context: ドリフト債務（architecture が plan 配下・二重管理・AGENTS.md 陳腐化）と、外部文献が収束した「知識の種類ごとに SoT 一意・他層は参照」原則を記述。
- [ ] Decision: design 新設 / 命名（design 採用・architecture 見送り）/ roadmap 改名 + completed/ 運用 / **front matter 規約（design・rules とも `last_modified` + `adr`）** / design↔ADR↔rule↔src の責務境界を能動・断定形で言い切る。front matter スキーマ例を本文に記載する。
- [ ] Alternatives Considered: `architecture/` 命名案・rule 全寄せ案（design を作らない）・2 分割案・front matter を持たない案を却下理由つきで残す。
- [ ] 具体値（design に書かない型・数式の SoT 所在等）は ADR 本文に抱えず rule / src を参照（[[adr]] の「具体値はライブ SoT」）。
- [ ] `docs/adr/README.md` の一覧に追記（`adr-new` が自動化）。

## この Phase で育てるハーネス（rule・skill）

- ADR 1 本の新規作成のみ。rule / skill の新設はなし（Phase 5・6 で既存 rule / skill を是正）。

## 受け入れ基準

1. `docs/adr/NNNN-*.md` が採番規約（active + archive 最大 + 1）に従って作成され、`id` がファイル名と一致。
2. 本文が可変な plan ファイル（phase doc / 「Phase N」表記 / OVERVIEW リンク）を参照していない（[[adr]] の参照ルール）。plan 運用の概念参照は可。
3. `docs/adr/README.md` 一覧に 1 行追加。
4. ADR 本文に design / rules 双方の front matter 規約（`last_modified` + `adr` キー）と スキーマ例が記載されている。
5. `pnpm verify` 緑（doc のみだが規約として確認）。

## 検証手順

1. `ls docs/adr/ docs/adr/archive/` で採番衝突がないことを確認。
2. ADR 本文を `harness-review` でセルフレビュー（参照実在・plan 参照違反なし・Decision 断定形）。
3. `git grep` で本文の `[[wikilink]]` / 相対リンクが実在へ解決することを確認。

## リスク・備考

- ADR は不変ログ。後続 phase で配置が微修正されても ADR 本文は書き換えず、必要なら新 ADR で supersede する（[[adr]]）。
- 本 ADR が Phase 1〜6 すべての設計根拠になるため、責務境界（特に design に「何を書かない」か）を明確に言い切ること。
