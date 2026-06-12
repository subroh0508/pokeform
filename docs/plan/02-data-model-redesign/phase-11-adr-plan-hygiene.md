# Phase 11 — ADR の可変 plan 参照を除去 + adr.md へ方針 codify

## 目的 / スコープ

ADR は**不変の連番ログ**だが、`docs/plan/**` の plan ファイル（phase doc / OVERVIEW / phase 番号）は
work-in-progress で **insert / renumber / archive により番号と内容が移動する**（本計画でも full-data が
phase-10 → 11 → 12 と移動した）。可変な plan を ADR 本文が引くと参照が陳腐化し、「いつ・なぜ決めたか」を辿る
ADR の価値が損なわれる。**過去 ADR を遡及的にクリーンにし、方針を `.claude/rules/adr.md` へ codify** する。
データ phase（10 / 12）とは独立したハーネス hygiene。

- スコープ内:
  - `.claude/rules/adr.md` に方針を追記: **ADR 本文は可変な plan ファイル（phase doc / OVERVIEW / phase 番号）を
    参照しない**。安定 SoT（`.claude/rules/*` / `architecture.md`）・他 ADR の参照は可。「Accepted ADR は本文を
    書き換えない」不変則の**例外として、可変 plan 参照の遡及除去は許可**することを明記。
  - **アクティブ ADR（`docs/adr/*.md`）の本文から plan 参照を除去** / 安定アンカー（rule・`architecture.md`・
    決定内容そのもの）へ置換する。`Phase NN` / `phase-NN-*.md` / `OVERVIEW` / `docs/plan/.../phase-*` 等。
  - **判断ベースで行う（blanket sed しない）**: plan システム自体が主題の ADR（例 `0020 plans-new` /
    `0018 implementation-workflow`）は、概念としての `docs/plan/` 構造の言及は文意保持で残し、**陳腐化する具体 phase
    番号のみ**外す。
  - `docs/adr/template.md` / `docs/adr/README.md` が plan 参照へ誘導していないか点検（テンプレが悪習を再生産しない）。
  - cross-agent パリティを維持（[[cross-agent]]・`rules-index.md` は `prepare` で再生成）。
- スコープ外:
  - **archive ADR（`docs/adr/archive/*`）**: retired のため必須にしない（任意・触れるなら同方針）。
  - **ADR の決定内容そのものの見直し**（参照除去のみ・Decision は不変）。
  - **新規 ADR の起票**（Phase 10 が名前 SoT の ADR を担う・本 phase は既存分の hygiene と rule codify）。

## 前提（依存）

- **独立フェーズ**（データ phase 10 / 12 に依存しない）。Phase 10 の ADR 起票が既に本方針に従う（phase doc に記載済み）
  ため、本 phase は方針を**恒久化（rule 化）し過去分を揃える**位置づけ。順序上は Phase 10 の後・Phase 14（全量投入）の
  前に置くが、データ phase とは並行でも可。
- 確定済み rule: [[adr]] / [[cross-agent]]。

## タスク

- [ ] `.claude/rules/adr.md` に方針追記:
  - [ ] ADR 本文は可変 plan ファイル（phase doc / OVERVIEW / phase 番号）を参照しない。安定 SoT（rules /
        `architecture.md`）・他 ADR は可。
  - [ ] 不変則の**遡及除去例外**（可変 plan 参照は後から外してよい）を明記。
- [ ] アクティブ ADR を走査し plan 参照を列挙（`grep -rn 'Phase [0-9]\|phase-[0-9]\|OVERVIEW\|docs/plan' docs/adr/*.md`）。
  - [ ] 各 ADR で参照を除去 or 安定アンカー置換（決定内容・rule・他 ADR へ）。
  - [ ] plan システム主題 ADR（0020 / 0018 等）は文意を保ち**具体 phase 番号のみ**外す。
  - [ ] 例: `0024` の「Phase 10 で59メガに波及」等の陳腐化した phase 番号参照を一般表現へ。
- [ ] `template.md` / `README.md` を点検し plan 参照誘導が無いことを確認。
- [ ] `harness-review` でレビュー（cross-agent パリティ・不変則の扱い）。

## この Phase で育てるハーネス（rule・skill）

- **`.claude/rules/adr.md`**（方針 codify が本体）。
- 必要なら `adr-new` skill / `template.md` に「plan を参照しない」注記を反映（テンプレが悪習を再生産しないように）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑（doc / rule 変更中心・生成物や型に波及しないこと）。
- `.claude/rules/adr.md` に「ADR は可変 plan ファイルを参照しない」方針 + 遡及除去の例外が明記される。
- アクティブ ADR（`docs/adr/*.md`）の本文に**陳腐化する phase 番号 / phase doc 参照が無い**（plan システムが主題の
  ADR の概念参照を除く）。
- cross-agent パリティ維持（canonical + symlink/copy 一致・`rules-index.md` 整合）。

## 検証手順

1. `grep -rn 'Phase [0-9]\|phase-[0-9]\|OVERVIEW' docs/adr/*.md` で、許容する概念参照を除き具体 phase 参照が
   残らないことを確認。
2. `adr.md` の方針追記が [[cross-agent]] のパリティ（Claude paths 自動ロード / Codex は `rules-index.md`）を壊さない
   ことを確認（`rules-index.md` は `prepare` 再生成）。
3. `harness-review` でレビューし指摘を解消。
4. `pnpm verify` 緑を確認。

## リスク・備考

- **不変則との順序**: Accepted ADR 本文の改変は `adr.md` の「Accepted は書き換えない」則に抵触するため、**先に
  adr.md へ遡及除去の例外を明文化してから**過去 ADR を編集する（順序厳守）。
- **判断が要る**: plan システム自体が主題の ADR（0020 / 0018）は概念参照を残し具体番号のみ外す。**blanket sed 禁止**
  （文意を壊す）。
- **`architecture.md` の扱い**: `docs/plan/01-mvp/architecture.md` は規約の spec 正本（renumber されない安定 SoT）の
  ため、本方針では**参照を許可する既定**とする（禁止対象は renumber されうる phase doc / 番号 / OVERVIEW）。この線引きは
  adr.md codify 時に確定する。
- **README / 採番一覧は対象外**: ADR の index・採番運用は plan 参照ではない（`docs/adr/README.md` の ADR 一覧は維持）。
- **独立 PR**: 本 phase は harness hygiene でデータ変更を含まず、データ phase（10 / 12）と diff が干渉しないため独立 PR。
