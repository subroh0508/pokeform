# Phase 6 — 規約 / skill の plan 参照違反・陳腐化是正 + rules への front matter

## 目的 / スコープ

事前精読で挙がった構造的な参照違反・軽微な陳腐化を是正し、あわせて Phase 0 ADR で定めた rules の front matter（`last_modified` + `adr`）を全 rule に適用する（**文体圧縮ではない** = 先行計画 07 とは別の「正しさの是正・規約適用」）。

- **plan 参照違反**: `code-review.md:27` の「Phase 9」phase doc 参照は adr.md の「可変 plan ファイルを引かない」に違反 → **ADR 0013 へ張り替え**。
- **rules への front matter 付与**: 全 `.claude/rules/*.md` の front matter に、`last_modified`（最終更新日時）と関連 ADR を列挙する `adr` キーを追加（Phase 0 ADR の規約・design と同体裁）。Claude の自動ロードは `paths` のみ参照するため `last_modified` / `adr` は独自キーとして許容し、`gen-rules-index.ts` の `paths` 解釈と非干渉であることを確認する。
- **skill の軽微な陳腐化**:
  - `harness-meta/SKILL.md`: 「Phase 7 で新設される skill-authoring.md」→ 既に実在。「確定した」に更新。
  - `survey-regulation/references/serebii-sourcing.md`: 「過去の人手調査（Phase 7）」文脈補強。
  - `start-phase`: implementation-workflow との使い分け（単発着手の用途）が description で曖昧 → 明確化。

スコープ外: rules / skills の純シンプル化（文体圧縮・先行計画 07）。本 Phase は「誤った参照・陳腐化表記の是正・front matter 規約適用」のみで、本文の文体は縮めない。

## 前提（依存）

- Phase 4 完了（`docs/roadmap` 改名後の最終パスで張り替える）。Phase 5 と内容独立だが、最終パス確定後に行う。

## タスク

- [ ] `code-review.md:27` の「Phase 9」phase doc 参照を [ADR 0013](../../adr/0013-git-hooks-over-claude-hooks.md) 参照へ張り替え（plan 参照違反解消）。
- [ ] 全 `.claude/rules/*.md` の front matter に `last_modified`（ISO8601）+ `adr`（関連 ADR 配列）キーを追加し、`pnpm prepare`（`gen-rules-index.ts`）で rules-index が正しく再生成される（`paths` 解釈非干渉）ことを確認。
- [ ] `harness-meta/SKILL.md` の「Phase 7 で新設される skill-authoring.md」を「確定済み skill-authoring.md」へ更新。
- [ ] `survey-regulation/references/serebii-sourcing.md` の「過去の人手調査（Phase 7）」表記を文脈補強（plan phase 番号への依存を外す）。
- [ ] `start-phase` の description / 本文に implementation-workflow との使い分け（単発着手 vs 端から端まで駆動）を明確化（`skill-creator` 利用）。
- [ ] cross-agent パリティ確認（skill は canonical + symlink）。

## この Phase で育てるハーネス（rule・skill）

- `code-review.md` rule の参照是正。`harness-meta` / `start-phase` / `survey-regulation` skill の陳腐化是正（`skill-creator` 利用・[[skill-authoring]]）。

## 受け入れ基準

1. `code-review.md` に plan doc（phase-NN / 「Phase N」）への参照がなく、ADR 0013 参照に置き換わっている。
2. 全 `.claude/rules/*.md` が front matter に `last_modified` + `adr` キーを持ち、`rules-index.md` の再生成が成功（`paths` 解釈非干渉）。
3. `harness-meta` / `survey-regulation` の陳腐化表記が現状事実に更新されている。
3. `start-phase` の description が implementation-workflow との使い分けを示す（under/over-trigger を招かない）。
4. skill の canonical + `.agents/skills` symlink が一致（cross-agent パリティ）。
5. `pnpm verify` 緑。`harness-review` でセルフレビュー済み。

## 検証手順

1. `git grep -nE 'Phase [0-9]|phase-[0-9]' .claude/rules/code-review.md` で plan 参照ゼロを確認。
2. 是正した skill の description を `skill-creator` の trigger 観点で点検（精度を落としていないか）。
3. `ls -l .agents/skills/<name>` で symlink が canonical を指すことを確認。

## リスク・備考

- description 変更は trigger 精度に直結する。短縮ではなく明確化に徹し、under-trigger を招かない（文体圧縮は先行計画 07 で eval 付きで行う）。
- 本 Phase 完了で計画 08（ドキュメント構成再編）が完了。文体圧縮は先行計画 [`07-rules-skills-simplify`](../07-rules-skills-simplify/README.md)。
