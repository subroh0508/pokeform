# Phase 4 — docs/plan → docs/roadmap 改名 + completed/ 集約 + 参照追従

## 目的 / スコープ

`docs/plan/` を `docs/roadmap/` へ改名し、完了計画群（00〜05）を `docs/roadmap/completed/` へ集約する。active（未着手・進行中）は `docs/roadmap/` 直下に置き、「ひと目で把握」を completed/ ディレクトリと README ロールアップ表で二重に担保する。`docs/plan` への全 inbound 参照（82 ファイル規模）を追従する。

最終構造:
```
docs/roadmap/
├─ README.md              # ロードマップ全体（進捗ロールアップ表 ✅/🚧/⬜）
├─ 08-docs-restructure/   # active（本計画自身・進行中）
├─ XX-ma-full-data/       # active（未着手・採番やり直し回避の XX- 採番）
└─ completed/
   ├─ 00-harness-setup/ … 05-move-master-scraper-refactor/
   └─ 07-rules-skills-simplify/   # 先行計画（全 phase 完了していれば集約）
```

スコープ外: AGENTS.md 刷新（Phase 5）。ただし AGENTS.md / rule / skill 内の `docs/plan` パス参照は本 Phase で `docs/roadmap` へ追従する（改名で dangling を作らないため）。

## 前提（依存）

- Phase 3 完了（旧 architecture.md が docs/plan から撤去済み。改名で architecture.md を二重移動しない）。

## タスク

- [ ] `git mv docs/plan docs/roadmap`。完了計画群を `git mv docs/roadmap/0[0-5]-* docs/roadmap/completed/`。
- [ ] `docs/roadmap/README.md` を更新（旧 docs/plan/README.md）: 進捗ロールアップ表・採番規約・completed 運用の明文化。冒頭に `design` との一行棲み分けを記載。
- [ ] `git grep -n 'docs/plan'` でリポジトリ全体（rule 11・ADR 10・learnings 8・skill・AGENTS.md・CLAUDE.md 等）の参照を `docs/roadmap`（完了計画は `completed/`）へ追従。**インライン相対リンク・reference 式リンク定義・素のパス参照**を全走査。
- [ ] **ADR からの plan 参照を安定 SoT（rule / design）へ寄せる好機**。`docs/adr/` の plan 参照は adr.md の「可変 plan ファイルを引かない」原則に照らし、rule / architecture（design）へ向け直すか ADR 本文で自己完結させる。archive ADR 本文は不変なので触らない。
- [ ] `planning.md` / `finish-phase` に「計画群の全 phase 完了 → `completed/` へ移動 + 参照追従」の運用を明文化（renumber 追従チェックリストと同種）。
- [ ] `docs/harness/rules-index.md` は生成物。`paths` に `docs/plan` を含む rule（`planning.md` の `paths: docs/plan/**`）があれば `docs/roadmap/**` へ更新し、`prepare` / `gen-rules-index.ts` で再生成（手編集しない）。

## この Phase で育てるハーネス（rule・skill）

- `planning.md` rule に `completed/` 移動運用を追記。`finish-phase` skill に完了時の `completed/` 移動を追記（`skill-creator` 利用）。`paths` frontmatter の `docs/plan/**` → `docs/roadmap/**` 更新。

## 受け入れ基準

1. `docs/roadmap/` が存在し `docs/plan/` が存在しない。完了計画（00〜05・先行完了した 07）が `completed/` 配下、active（08・`XX-ma-full-data`）が直下。
2. `git grep -n 'docs/plan'` が active なファイルで dangling ゼロ（archive ADR の歴史言及を除く）。
3. `docs/roadmap/README.md` に進捗ロールアップ表と `completed/` 運用・`design` 棲み分けがある。
4. `planning.md` の `paths` が `docs/roadmap/**` を指し、`rules-index.md` が再生成されてドリフトなし。
5. `pnpm verify` 緑。`harness-review` で dangling ゼロ確認。

## 検証手順

1. `git grep -nE 'docs/plan(/|\b)'` で残存参照を確認（active がすべて roadmap/completed へ向く）。
2. `grep -oE '\]\([^)]*roadmap[^)]*\)'` で改名後リンクの実在を確認。
3. `pnpm prepare`（または `gen-rules-index.ts`）を実行し `rules-index.md` が `docs/roadmap` を反映することを確認。

## リスク・備考

- 82 ファイル規模の追従。`docs/plan` は rule の `paths` frontmatter にも現れるため、自動ロードの paths も更新しないと Claude が rule を読まなくなる（機能影響あり）。
- cross-plan / 完了 doc の素のパス参照漏れに注意（planning.md renumber チェックリストと同じ網羅性）。
- ADR の plan 参照寄せは「整備（adr.md の許可 2 例外 = 可変 plan 参照の遡及除去）」の範囲で active ADR のみ。決定文の意味は変えない。
