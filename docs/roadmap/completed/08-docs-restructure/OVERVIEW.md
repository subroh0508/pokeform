# 08-docs-restructure — ドキュメント構成の再編 OVERVIEW

## ゴール

度重なる plan 進行で蓄積した「ドリフト債務」を解消し、**知識の種類ごとに正本（SoT）の置き場が一意**で、他層からは再記述せず参照（point, don't repeat）する構成にする。利用者・エージェントから見て「設計の俯瞰はどこを読み、規約・具体値はどこを読み、計画・進捗はどこを見るか」が一意に定まり、仕様変更時の二重更新が消える状態を作る。

具体的には:

1. **設計仕様の昇格**: 規約 spec 正本 `docs/plan/01-mvp/architecture.md`（plan 配下にあり「完了済み plan の一成果物」に見える）を、plan 進捗に左右されない `docs/design/`（コードなし設計俯瞰）へ**テーマ別に分割昇格**する。
2. **plan → roadmap 改名**: `docs/plan/` を `docs/roadmap/` へ改名し、完了計画群を `completed/` に集約して進捗を可視化する。`design`（なぜ・俯瞰）と `roadmap`（何をどの順で・進捗）の語感衝突も解消する。
3. **front matter 規約の導入**: `docs/design/` 配下の Markdown と `.claude/rules/` 配下の Markdown の双方に、`last_modified`（最終更新日時）と `adr`（関連 ADR）の front matter を付与する。
4. **AGENTS.md の刷新**: 陳腐化したコマンド表・skill リストを実態へ追従し、列挙（実体重複）から参照（SoT へポインタ）へ転換する。
5. **SoT 二重管理の解消**: ゲーム仕様・型表現・テスト方針が `architecture.md` と `.claude/rules/*` の双方に実体記述されている二重管理を、design からはリンクのみに寄せて解消する。

## 背景 / 動機

plan 進行（00〜）で蓄積したドリフト債務を、外部文献が独立に同じ結論へ収束した原則で解消する。ハーネスは機能としては健全（責務分離・機械ゲート非再実装・cross-agent パリティ・wikilink dangling なし）だが、放置すると以下が進む:

- `architecture.md` の plan 依存記述・陳腐化型例（ADR 0035 で消滅した `names.ts` 型例など）が「現状事実」として誤読される。
- AGENTS.md のコマンド表・skill リストが当時のまま乖離し続け、エージェントの参照源として誤誘導する。
- 仕様変更のたびに `architecture.md` と rule の両方を直す必要があり、ドリフト死角が増える。

## 設計方針

ドキュメント構成の権威ある文献（Diátaxis / arc42・C4 / DRY・ARID / Anthropic 公式）が収束した「知識の種類ごとに正本を一意化し、他層は参照する」原則を採用する:

- **知識の種類 → 正本 → 他層は参照**（配置マトリクス）:
  - 型・スキーマ・数式・閾値そのもの = **`src/`**（tsc / カバレッジ100% / `check:*` が機械保証）。doc はシンボル名で参照のみ。
  - 規約・具体値・契約 = **`.claude/rules/*`**（1 rule = 1 正本・Reference 象限）。
  - 手順・チェックリスト = **`.claude/skills/*`**（How-to 象限）。
  - 設計の俯瞰・なぜ・データフロー図・層の責務 = **`docs/design/*`**（Explanation 象限・**コードなし**）。
  - いつ・なぜ決めたか・捨てた代替案 = **`docs/adr/*`**（不変ログ）。
  - 指示の入口・常時保持すべき事実 = **`AGENTS.md`**（+ `CLAUDE.md` は import アダプタ・<200 行目標）。
- **`docs/design/` には TypeScript の具体コードを書かない**（C4「Code レベルは永続ドキュメント化しない」の直接適用）。型・スキーマ・数式・YAML キー・CLI フラグの SoT は `src/` 実装 + path-scoped rule に置き、各 design ファイル末尾の「実装 SoT ポインタ」節で実装へ誘導する。design に持たせるのは「乖離しにくいもの」だけ（目的・設計意図・データフロー図・責務分担・保証する不変条件の自然言語記述・トレードオフ）。
- **front matter 規約**（本計画で新設・Phase 0 ADR で確定する）:
  - **`docs/design/` 配下の Markdown**: 必ず front matter を持ち、`last_modified`（ISO8601 形式の日時）と `adr`（関連 ADR の配列）を記載する。
    ```yaml
    ---
    last_modified: "2026-06-21T00:00:00+09:00"
    adr:
      - "ADR 0001"
      - "ADR 0002"
    ---
    ```
  - **`.claude/rules/` 配下の Markdown**: 既存 front matter（`paths` / `description`）に加えて `last_modified`（ISO8601 形式の日時）と `adr`（関連 ADR の配列）キーを持つ（design と同体裁）。Claude の自動ロードは `paths` のみ参照するため `last_modified` / `adr` は**独自キーとして許容**する（読み手・ツールが最終更新と規約の決定根拠 ADR へ即たどれるようにする）。`gen-rules-index.ts` の `paths` 解釈と非干渉であることを確認する。
- **design と ADR の二重化回避**: 両者とも Explanation 象限のため二重化しやすい。design は決定根拠を再記述せず ADR を要約・索引する（front matter `adr` キーが索引を機械的に補強する）。`design` = 現在どう成り立っているか（可変スナップショット）、ADR = いつ・なぜ決めたか（不変ログ）。
- **既存 rule / ADR / `.githooks/` を SoT として尊重**: 本計画は配置の再編と参照の張り替え・front matter 付与が主で、機械ゲート・レビュー観点・規約の実体は再実装しない（[[cross-agent]] / [[skill-authoring]]）。
- **ディレクトリ名の決定**: 置き場は `docs/design/`（`architecture/` は見送り）。理由 = (1) architecture は「構造の正確な仕様」を連想させ reference 寄りに誤誘導、(2) `docs/adr/`（Architecture Decision Records）と語が衝突する。計画・進捗の置き場は `docs/roadmap/`（`docs/plan/` から改名・`design` との語感衝突回避）。

## 実装指針

- **実施順は先行計画 [`07-rules-skills-simplify`](../07-rules-skills-simplify/README.md) を先、本計画（08）を後**にする。先に rules / skills の冗長が削られた状態で構造を動かすほうが、参照張り替え・front matter 付与・二重管理解消の対象がスリムになる。両計画は `code-review.md` / `planning.md` 等で一部重なるため 07 → 08 の順で進め後発（本計画）をリベースする（ハードな相互依存はない）。
- **ADR を先頭に置く**（配置・front matter 規約は不可逆 = architecturally significant）。design/ 新設・命名・roadmap 改名・completed/ 運用・**front matter 規約（design・rules とも `last_modified` + `adr`）**・design↔ADR↔rule の責務境界を 1 本の ADR（採番は `adr-new` で機械決定・現行最大 0037 の次）に確定してから着手する。
- **design 分割は「機械移送」ではなく「設計意図の再執筆」**（コードを落とすため単純コピーにならない）。現 `architecture.md` の節からは意図のみ抽出し、型例・YAML 例・数式は破棄する。
- **最終構成（確定形）**:
  ```
  docs/design/
  ├─ README.md                    # 全体像・index（目的 / 方針 / 全体図 / ナビ / トレードオフ）
  ├─ data-pipeline.md             # データ取得・管理の仕組み（図 + なぜ）
  ├─ type-validation.md           # 型バリデーションの仕組み（考え方 + なぜ）
  └─ individuals-and-parties.md   # 個体・パーティ管理の仕組み（保証する不変条件 + なぜ）
  ```
  いずれも front matter（`last_modified` + `adr`）+ 末尾「実装 SoT ポインタ」節を持つ。
- **参照追従は `git grep` で網羅**。`architecture.md` への inbound 参照（rules / skills / ADR / AGENTS.md / CLAUDE.md / src コメント / data/README / learnings）をインライン相対リンク・reference 式リンク定義・素のパス参照まで全走査して張り替える。archive ADR 本文は不変なので触らない（active 参照のみ）。
- 各 PR で `harness-review` セルフレビュー + `git grep` で dangling ゼロを確認してマージする。

## スコープ外

- **rules / skills の純シンプル化（文体圧縮・約 20〜30% 削減）** = 先行計画 [`07-rules-skills-simplify`](../07-rules-skills-simplify/README.md)。本計画は配置再編・front matter 付与と、その機会に生じる **SoT 実体の二重記述解消**（design ↔ rule のリンク化）までを扱い、本文の行数圧縮そのものはしない。
- **M-A 全種族投入**（[`09-champions-data-rollout`](../../09-champions-data-rollout/README.md)）。データ投入は本計画と独立。
- 機械ゲート（型 / カバレッジ / Biome）・レビュー観点の変更。本計画は再実装しない。
- archive ADR 本文の書き換え（不変ログ。active 参照の張り替えのみ）。

## 受け入れ基準

この計画群全体の客観条件:

1. 各フェーズ末で `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
2. `docs/design/` に README + 3 テーマ（data-pipeline / type-validation / individuals-and-parties）が存在し、**TypeScript の具体コードを含まない**。各ファイルが front matter（`last_modified` + `adr`）と末尾「実装 SoT ポインタ」節を持つ。
3. 旧 `docs/plan/01-mvp/architecture.md` が撤去され、inbound 参照がすべて `docs/design/` の該当ファイル + アンカーへ解決する（`git grep architecture` で dangling ゼロ）。
4. `docs/plan/` → `docs/roadmap/` 改名と完了計画群の `completed/` 集約が完了し、全 inbound 参照（82 ファイル規模）が解決する。`docs/roadmap/README.md` に進捗ロールアップ表がある。
5. `.claude/rules/` 配下の全 Markdown が front matter に `last_modified` + `adr` キーを持ち、`gen-rules-index.ts` の `paths` 解釈と非干渉（rules-index 再生成が成功）。
6. AGENTS.md のコマンド表・skill リストが実態に追従し、列挙から参照（SoT ポインタ）へ転換されている。
7. ゲーム仕様・型表現・テスト方針の二重記述が解消され、design からは rule へリンクのみ（実体は rule / src が SoT）。
8. `code-review.md:27` の plan doc 参照違反が ADR 0013 へ張り替えられ、skill の軽微な陳腐化表記が更新されている。
9. 各フェーズで `harness-review` セルフレビュー済み、cross-agent パリティ（canonical + symlink）維持。

## phase 分割（6 基準の評価サマリ）

配置決定（ADR）を先頭に、design 分割（A→B→C）・roadmap 改名・AGENTS.md 刷新・規約/skill 是正へ分割する。6 基準の評価:

- **意思決定の数**: design 命名・roadmap 運用・front matter 規約・二重管理の寄せ先など独立判断が複数 → 分割（ADR で先に確定）。
- **不可逆性**: ディレクトリ新設・改名・ファイル撤去・front matter 規約は不可逆 → ADR を先頭、各構造変更を独立 PR に。
- **スコープの広さ**: docs / rules / skills / ADR / AGENTS.md / src コメントを横断 → レイヤ別に分割。
- **想定 diff**: design 3 本執筆・82 ファイル参照追従・全 rule への front matter 付与などで合計 1000 行超 → 積極分割。
- **並行実装**: AGENTS.md 刷新・規約是正は design 分割と独立に進められる（ただし最終パスを拾うため roadmap 改名後に置く）。

→ **7 phase = 7 PR**:

| Phase | テーマ | 主因 |
|---|---|---|
| 0 | 配置・front matter 規約の ADR 起票（design 新設・命名・roadmap 改名・front matter 規約・責務境界） | 不可逆決定を先頭に確定 |
| 1 | `docs/design/` 骨組み + README + data-pipeline.md（コードなし俯瞰・front matter 付き） | 設計意図の再執筆 A |
| 2 | type-validation.md + individuals-and-parties.md（コードなし俯瞰・front matter 付き） | 設計意図の再執筆 B |
| 3 | inbound 参照張り替え + 旧 architecture.md 撤去 + 二重管理解消 | 参照確定 C |
| 4 | `docs/plan` → `docs/roadmap` 改名 + completed/ 集約 + 参照追従 | 82 ファイル追従 |
| 5 | AGENTS.md 刷新（コマンド / skill 参照化 / ディレクトリ説明） | 陳腐化是正 |
| 6 | 規約 / skill の plan 参照違反・陳腐化是正 + rules への front matter（`last_modified` + `adr`）付与 | dangling / 表記是正 + 規約適用 |

直列鎖: 0 → 1 → 2 → 3 → 4 → 5 → 6（5・6 は内容独立だが最終パスを拾うため 4 の後）。
