# Phase 3 — inbound 参照張り替え + 旧 architecture.md 撤去 + 二重管理解消

## 目的 / スコープ

`docs/design/` 4 ファイルが揃った状態で、現 `docs/plan/01-mvp/architecture.md` への **inbound 参照を全走査して design の該当ファイル + アンカーへ張り替え**、旧 architecture.md を撤去する。同時に **SoT 二重管理（ゲーム仕様 / 型表現 / テスト方針が architecture と rule の双方に実体記述）を解消**し、design からは rule へリンクのみにする。

スコープ外: `docs/plan` → `docs/roadmap` 改名（Phase 4）・AGENTS.md 刷新（Phase 5）。本 Phase は architecture.md の撤去と参照確定に集中する（AGENTS.md / CLAUDE.md の architecture 参照だけは本 Phase で design へ張り替える＝撤去で dangling を作らないため）。

## 前提（依存）

- Phase 2 完了（`docs/design/` の README + 3 テーマがすべて存在）。

## タスク

- [ ] `git grep -n 'architecture'` でリポジトリ全体の inbound 参照を全走査（インライン相対リンク・reference 式リンク定義・素のパス参照・節アンカー `architecture.md#...`）。
- [ ] 参照元（rules / skills / ADR active / AGENTS.md / CLAUDE.md / src コメント / data/README / learnings 等）を design の**該当テーマ + アンカー**へ張り替える。**archive ADR 本文は不変なので触らない**（active 参照のみ）。
- [ ] 二重管理の寄せ（design → rule リンク化・調査レポート §3.2 / §7.3）:
  - ゲーム仕様の数式・閾値（66/32・二重 floor）の SoT を [[game-spec]] に一本化、design は要約 + リンク。
  - 型パターンの具体規約を [[type-conventions]] / [[tsc-verification]] に、design は設計意図の散文のみ。
  - テスト方針を [[testing]] に一本化、design はリンクのみ。
- [ ] 旧 `docs/plan/01-mvp/architecture.md` を撤去（`git rm`）。`docs/plan/01-mvp/README.md` に「architecture は `docs/design/` へ分割・移動」の注記を残す。
- [ ] `docs/plan/README.md:14` の「アーキ正本（旧 `plan.md`）→ `01-mvp/architecture.md`」エントリを design へ張り替え。

## この Phase で育てるハーネス（rule・skill）

- rule 側は実体追加なし（design から参照される側として現状維持）。design ↔ rule の二重記述を rule 側に一本化（実体は rule、俯瞰は design）。

## 受け入れ基準

1. `git grep -n 'architecture.md'` が active なファイルで dangling ゼロ（archive ADR・本計画 doc / 調査レポートの歴史言及を除く）。旧 architecture.md は存在しない。
2. design の各テーマからゲーム仕様 / 型 / テストの**実体記述が消え**、rule への `[[...]]` リンクに置き換わっている（二重管理解消）。
3. `docs/plan/01-mvp/README.md` に移動注記がある。
4. `pnpm verify` 緑。`harness-review` で dangling ゼロを確認。

## 検証手順

1. `git grep -nE 'architecture\.md|01-mvp/architecture'` で残存参照を確認し、active 参照がすべて design へ向くことを目視。
2. `grep -oE '\]\(\.\.?/[^)]+\)' docs/design/*.md` でリンク先実在を確認（dangling 検査）。
3. design に数式・型実体が再混入していないか `git grep` で確認（二重管理が解消されたか）。

## リスク・備考

- 参照追従漏れは blocking 級 dangling（learning #104 / #117 / #122 で反復）。`git grep` を `.md` に限らず src コメント・data/README まで打つ。
- 節アンカー（`architecture.md#種族の型表現`）は分割でファイルが変わる。アンカー先テーマを選んで張り直す。
- この Phase 完了で architecture.md は歴史的に design へ昇格完了。Phase 4 の roadmap 改名は architecture.md が docs/plan から消えた後に行う（二重移動回避）。
