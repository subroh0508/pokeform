# Phase 7 — レギュレーション取得の author-regulation-data skill 新設

> `author-static-data`（Phase 6・reg 非依存の全件名辞書）と対になる **per-reg 取得オーケストレーション skill** を新設する。`data/` 完全削除からの復元を「全件名辞書（Phase 6・`author-static-data`）」と「reg 取得（本 phase・`author-regulation-data`）」に分離する方針の後段。既存の `showdown-sync.yml` workflow は**据え置き**、本 skill がそれを dispatch する取得層として利用する（skill は手順オーケストレーション・workflow は取得実体という役割分担）。

## 目的 / スコープ

指定レギュレーション 1 つ分の解禁データを、`data/` 完全削除・部分欠損・完成済みのいずれの状態からでも同じ手順で収束させる**冪等な取得 skill** `author-regulation-data <reg>` を新設する。skill は取得実体を再実装せず、確定済みの機械経路（`showdown-sync.yml` / `verify-showdown-pr` / `check:regulation` / `generate:data`）を**オーケストレーション**する。**名前は Phase 6 で全件辞書化済みのため、ja gap 補完は per-reg 取得の主タスクから外れ、PokeAPI 未存在の新規 id が出たときの差分突き合わせ（`author-static-data` へ委譲）に縮小する**。

- スコープ内: skill 新設（canonical + symlink）、前提ゲート（`author-static-data`（全件名辞書）が整備済みか + `rules.yaml`・`type-specs.yaml`（静的コミット）が存在するかの欠落チェックの fail-fast 誘導）、per-reg reset → `showdown-sync.yml` dispatch → `verify-showdown-pr` 照合 → per-reg 著述（`<reg>/index.yaml` の period・`languages/regulations.yaml` エントリ）→ `pokemon-data-reviewer` 依頼、までの手順化。新規 id の名前欠落は `author-static-data`（差分追加）へ委譲。冪等スキップ（存在レコードは append/既存尊重で触れない）の明文化。
- スコープ外: **M-A・M-B の実データ投入そのもの（Phase 8 が本 skill を実行）**。`showdown-sync.yml` workflow の改修（据え置き・本 skill は dispatch するのみ）。名前辞書の全件整備（Phase 6 `author-static-data`）。`rules.yaml`・`type-specs.yaml`（静的コミット・自動化対象外）。`showdown:types` 抽出の新設（OVERVIEW スコープ外の維持）。M-C 以降のレギュレーション。

## 前提（依存）

- **Phase 1-5 完了**: showdown 経路（抽出 + 転記 + `showdown-sync.yml`）/ PokeAPI ja 専任 / Serebii 速報スクレイパー / `verify-showdown-pr` skill が揃っている。
- **Phase 6 完了**: `author-static-data` skill（全件名辞書・[phase-06](./phase-06-author-static-data.md)）が整備され、`languages/*.yaml` が全件で埋まり `generate.ts` が languages ⊋ specs を許容する。これにより per-reg 取得時に大半の名前が既存し ja gap ループが原則不要になる。本 skill は前提ゲートとして `author-static-data` の整備状況を確認する。
- `rules.yaml` / `type-specs.yaml` がコミット済みで存在（静的コミット・本計画では自動化しない）。
- 確定済み rule: [[data-pipeline]]（取得元の権威序列・append/既存尊重・「項目の取得元」表）/ [[skill-authoring]] / [[cross-agent]]。

## タスク

- [ ] `skill-creator` skill（公式）で `author-regulation-data` を新設する（canonical `.claude/skills/author-regulation-data/` + `.agents/skills/author-regulation-data` symlink を同一 PR で追加・[[cross-agent]]）。Anthropic の skill ベストプラクティス（<https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices>）を参照し、description trigger（何を + いつ = 「レギュレーション <reg> の解禁データを取得したい / 全量投入したい」）・progressive disclosure（本文 ≤500 行・詳細は `references/`）・説明型の文体を守る（[[skill-authoring]]）。
- [ ] **前提ゲート**: 取得開始前に `author-static-data`（全件名辞書）の整備 + `rules.yaml`・`type-specs.yaml`（静的コミット）の存在を確認する **fail-fast 誘導**を skill 本文に記す（前提層が欠けていれば先にそれらを実行させる。skill 間の自動連鎖はしない = 明示的オーケストレーションに委ねる）。
- [ ] **取得手順のオーケストレーション**（各段は既存経路へ委譲・再実装しない）:
  - per-reg reset（`<reg>/*` の取得可能面を空スタブ化・値の staleness を排除。共有 specs は append-only ゆえ union）。
  - `showdown-sync.yml` を対象 reg で dispatch（`gh workflow run` or reset ブランチ ref から）→ authoritative PR。**workflow は据え置き**。
  - **新規 id の名前欠落のみ差分追加**: showdown が全件辞書に無い id を導入した場合だけ `author-static-data`（差分追加）で名前を補完。メガ ja 等 PokeAPI 未存在分も同経路（手作業 commit）。全件辞書化（Phase 6）済みゆえ通常はここが空振りする。
  - `verify-showdown-pr` で Serebii 照合 → `check:regulation` → `generate:data` → `pokemon-data-reviewer` 依頼。
- [ ] **per-reg 静的著述**: `<reg>/index.yaml` の period（公式スケジュール・ユーザー確認）と `languages/regulations.yaml` の当該 reg エントリ（命名規約から導出）を著述する手順を含める（reg 依存ゆえ author-static-data スコープ外・データ単位の境界）。
- [ ] **冪等スキップの明文化**: 取得層は append/既存尊重（roster は sorted union・値は空欄のみ補完）ゆえ再実行が安全で、「存在するレコードはスキップ」は転記側で自然に実現される旨を skill 本文に記す。値を疑って全取り直しする場合は先に該当ファイルを削除する = 再取得の明示的意思表示、も明記する。
- [ ] [[data-pipeline]] に本 skill を per-reg 取得の著述経路として指すポインタを追記する（`author-static-data`（reg 非依存の全件名辞書）/ `author-regulation-data`（reg 取得）の対の skill 群として一貫させる）。

## この Phase で育てるハーネス（rule・skill）

- **新設 skill**: `author-regulation-data`（canonical + `.agents/skills` symlink・`skill-creator` 利用・[[skill-authoring]]）。
- **rule 追記**: [[data-pipeline]]（per-reg 取得の著述経路として本 skill を指す）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome / yaml-style）が緑（本 phase は skill + rule 追記のみで src / data 変更なし）。
- `author-regulation-data` skill が新設され、前提ゲート / reset / dispatch / 照合 / per-reg 静的著述 / 新規 id 差分追加（`author-static-data` 委譲）/ 冪等スキップ が本文に定式化されている。
- 既存経路（`showdown-sync.yml` / `verify-showdown-pr` / `check:regulation` / `generate:data`）を**再実装せず参照**している（機械ゲート・取得実体の二重化がない・[[skill-authoring]]）。
- `showdown-sync.yml` workflow に変更が無い（据え置き確認）。
- canonical と `.agents/skills` symlink のパリティが取れている（[[cross-agent]]）。`description` は文字数 ≤1024。

## 検証手順

1. `.claude/skills/author-regulation-data/SKILL.md` が存在し、description trigger が per-reg 取得の起動場面を三人称で明示していることを確認。
2. skill 本文が各取得段を既存 npm script / workflow / skill へ委譲していること（再実装なし）を確認。
3. `git status` で `showdown-sync.yml` に差分が無いことを確認。
4. `ls -la .agents/skills/author-regulation-data` が相対 symlink で canonical を指すことを確認。
5. `pnpm verify` 緑。

## リスク・備考

- **ja gap は原則解消済み**: 名前は Phase 6（`author-static-data` 全件名辞書）で事前整備されるため、per-reg 取得時の ja gap は原則出ない。showdown が全件辞書に無い**新規 id**（新登場ポケモン等）を導入した稀なケースのみ `author-static-data`（差分追加・手作業 commit 可）で補い再 generate する。従来の「投入のたびに ja を埋める」ループは不要になった。
- **skill と投入の分離**: 本 phase は harness 資産（skill + rule 追記）のみ、実データ投入は Phase 8。Phase 6/7 で前提層 + skill を確定し Phase 8 でデータ投入する構造で、harness-review 対象（skill）と pokemon-data-reviewer 対象（データ）の PR を分離しレビュー性を保つ。
- **cross-agent フォールバック**: 本 skill は `gh` / GitHub Actions dispatch を含むため、Claude / Codex いずれからも `gh workflow run` で駆動できる。dispatch 不可環境では各 npm script の逐次実行 + 人手へ縮退する旨を skill 本文に明示する（[[cross-agent]]）。
- 独立レビューは `harness-review`（ハーネス資産）。
