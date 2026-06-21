# 07-docs-restructure — ドキュメント構成の再編 OVERVIEW

## ゴール

度重なる plan 進行（00〜09）で蓄積した「ドリフト債務」を解消し、**知識の種類ごとに正本（SoT）の置き場が一意**で、他層からは再記述せず参照（point, don't repeat）する構成にする。利用者・エージェントから見て「設計の俯瞰はどこを読み、規約・具体値はどこを読み、計画・進捗はどこを見るか」が一意に定まり、仕様変更時の二重更新が消える状態を作る。

具体的には:

1. **設計仕様の昇格**: 規約 spec 正本 `docs/plan/01-mvp/architecture.md`（plan 配下にあり「完了済み plan の一成果物」に見える）を、plan 進捗に左右されない `docs/design/`（コードなし設計俯瞰）へ**テーマ別に分割昇格**する。
2. **plan → roadmap 改名**: `docs/plan/` を `docs/roadmap/` へ改名し、完了計画群を `completed/` に集約して進捗を可視化する。`design`（なぜ・俯瞰）と `roadmap`（何をどの順で・進捗）の語感衝突も解消する。
3. **AGENTS.md の刷新**: 陳腐化したコマンド表・skill リストを実態へ追従し、列挙（実体重複）から参照（SoT へポインタ）へ転換する。
4. **SoT 二重管理の解消**: ゲーム仕様・型表現・テスト方針が `architecture.md` と `.claude/rules/*` の双方に実体記述されている二重管理を、design からはリンクのみに寄せて解消する。

## 背景 / 動機

調査レポート [`docs/refactor-survey-2026-06-21.md`](../../refactor-survey-2026-06-21.md) が事前調査として、現状コンポーネント・マップ / ドリフト一覧 / リファクタ方向性 / 外部文献（Diátaxis・arc42/C4・DRY/ARID・Anthropic 公式）に基づく配置指針を整理した。本 OVERVIEW はその成果を計画へ昇格したもの（調査レポートは恒久 SoT ではない素材であり、本計画完了後は本 OVERVIEW / `docs/design/` がその知見の置き場になる）。

ハーネスは機能としては健全（責務分離・機械ゲート非再実装・cross-agent パリティ・wikilink dangling なし）だが、放置すると以下が進む:

- `architecture.md` の plan 依存記述・陳腐化型例（ADR 0035 で消滅した `names.ts` 型例など）が「現状事実」として誤読される。
- AGENTS.md のコマンド表・skill リストが MVP 当時のまま乖離し続け、エージェントの参照源として誤誘導する。
- 仕様変更のたびに `architecture.md` と rule の両方を直す必要があり、ドリフト死角が増える。

## 設計方針

外部文献が独立に同じ結論へ収束した原則を採用する（調査レポート §9）:

- **知識の種類 → 正本 → 他層は参照**（配置マトリクス）:
  - 型・スキーマ・数式・閾値そのもの = **`src/`**（tsc / カバレッジ100% / `check:*` が機械保証）。doc はシンボル名で参照のみ。
  - 規約・具体値・契約 = **`.claude/rules/*`**（1 rule = 1 正本・Reference 象限）。
  - 手順・チェックリスト = **`.claude/skills/*`**（How-to 象限）。
  - 設計の俯瞰・なぜ・データフロー図・層の責務 = **`docs/design/*`**（Explanation 象限・**コードなし**）。
  - いつ・なぜ決めたか・捨てた代替案 = **`docs/adr/*`**（不変ログ）。
  - 指示の入口・常時保持すべき事実 = **`AGENTS.md`**（+ `CLAUDE.md` は import アダプタ・<200 行目標）。
- **`docs/design/` には TypeScript の具体コードを書かない**（C4「Code レベルは永続ドキュメント化しない」の直接適用・調査レポート §8）。型・スキーマ・数式・YAML キー・CLI フラグの SoT は `src/` 実装 + path-scoped rule に置き、各 design ファイル末尾の「実装 SoT ポインタ」節で実装へ誘導する。design に持たせるのは「乖離しにくいもの」だけ（目的・設計意図・データフロー図・責務分担・保証する不変条件の自然言語記述・トレードオフ）。
- **design と ADR の二重化回避**: 両者とも Explanation 象限のため二重化しやすい。design は決定根拠を再記述せず ADR を要約・索引する。`design` = 現在どう成り立っているか（可変スナップショット）、ADR = いつ・なぜ決めたか（不変ログ）。
- **既存 rule / ADR / `.githooks/` を SoT として尊重**: 本計画は配置の再編と参照の張り替えが主で、機械ゲート・レビュー観点・規約の実体は再実装しない（[[cross-agent]] / [[skill-authoring]]）。
- **ディレクトリ名の決定**: 置き場は `docs/design/`（`architecture/` は見送り）。理由 = (1) architecture は「構造の正確な仕様」を連想させ reference 寄りに誤誘導、(2) `docs/adr/`（Architecture Decision Records）と語が衝突する。計画・進捗の置き場は `docs/roadmap/`（`docs/plan/` から改名・`design` との語感衝突回避）。

## 実装指針

- **ADR を先頭に置く**（配置決定は不可逆 = architecturally significant）。design/ 新設・命名・roadmap 改名・completed/ 運用・design↔ADR↔rule の責務境界を 1 本の ADR（採番は `adr-new` で機械決定・現行最大 0037 の次）に確定してから着手する。
- **design 分割は「機械移送」ではなく「設計意図の再執筆」**（コードを落とすため単純コピーにならない）。現 `architecture.md` の節からは意図のみ抽出し、型例・YAML 例・数式は破棄する。
- **最終構成（確定形）**:
  ```
  docs/design/
  ├─ README.md                    # 全体像・index（目的 / 方針 / 全体図 / ナビ / トレードオフ）
  ├─ data-pipeline.md             # データ取得・管理の仕組み（図 + なぜ）
  ├─ type-validation.md           # 型バリデーションの仕組み（考え方 + なぜ）
  └─ individuals-and-parties.md   # 個体・パーティ管理の仕組み（保証する不変条件 + なぜ）
  ```
- **参照追従は `git grep` で網羅**。`architecture.md` への inbound 参照（rules / skills / ADR / AGENTS.md / CLAUDE.md / src コメント / data/README / learnings）をインライン相対リンク・reference 式リンク定義・素のパス参照まで全走査して張り替える。archive ADR 本文は不変なので触らない（active 参照のみ）。
- 各 PR で `harness-review` セルフレビュー + `git grep` で dangling ゼロを確認してマージする。

## スコープ外

- **rules / skills の純シンプル化（文体圧縮・約 20〜30% 削減）** = 後続計画群 [`08-rules-skills-simplify`](../08-rules-skills-simplify/README.md)。本計画は配置再編と、その機会に生じる **SoT 実体の二重記述解消**（design ↔ rule のリンク化）までを扱い、行数圧縮そのものはしない。
- **M-A 全種族投入**（[`09-ma-full-data`](../09-ma-full-data/README.md)）。データ投入は本計画と独立。
- 機械ゲート（型 / カバレッジ / Biome）・レビュー観点の変更。本計画は再実装しない。
- archive ADR 本文の書き換え（不変ログ。active 参照の張り替えのみ）。

## 受け入れ基準

この計画群全体の客観条件:

1. 各フェーズ末で `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
2. `docs/design/` に README + 3 テーマ（data-pipeline / type-validation / individuals-and-parties）が存在し、**TypeScript の具体コードを含まない**。各ファイル末尾に「実装 SoT ポインタ」節がある。
3. 旧 `docs/plan/01-mvp/architecture.md` が撤去され、inbound 参照がすべて `docs/design/` の該当ファイル + アンカーへ解決する（`git grep architecture` で dangling ゼロ）。
4. `docs/plan/` → `docs/roadmap/` 改名と完了計画群の `completed/` 集約が完了し、全 inbound 参照（82 ファイル規模）が解決する。`docs/roadmap/README.md` に進捗ロールアップ表がある。
5. AGENTS.md のコマンド表・skill リストが実態に追従し、列挙から参照（SoT ポインタ）へ転換されている。
6. ゲーム仕様・型表現・テスト方針の二重記述が解消され、design からは rule へリンクのみ（実体は rule / src が SoT）。
7. `code-review.md:27` の plan doc 参照違反が ADR 0013 へ張り替えられ、skill の軽微な陳腐化表記が更新されている。
8. 各フェーズで `harness-review` セルフレビュー済み、cross-agent パリティ（canonical + symlink）維持。

## phase 分割（6 基準の評価サマリ）

調査レポート §6 が「独立性の高いストリーム」に整理した通り、配置決定（ADR）を先頭に、design 分割（A→B→C）・roadmap 改名・AGENTS.md 刷新・規約/skill 是正へ分割する。6 基準の評価:

- **意思決定の数**: design 命名・roadmap 運用・二重管理の寄せ先など独立判断が複数 → 分割（ADR で先に確定）。
- **不可逆性**: ディレクトリ新設・改名・ファイル撤去は不可逆 → ADR を先頭、各構造変更を独立 PR に。
- **スコープの広さ**: docs / rules / skills / ADR / AGENTS.md / src コメントを横断 → レイヤ別に分割。
- **想定 diff**: design 3 本執筆・82 ファイル参照追従などで合計 1000 行超 → 積極分割。
- **並行実装**: AGENTS.md 刷新・規約是正は design 分割と独立に進められる（ただし最終パスを拾うため roadmap 改名後に置く）。

→ **7 phase = 7 PR**:

| Phase | テーマ | 主因 |
|---|---|---|
| 0 | 配置 ADR 起票（design 新設・命名・roadmap 改名・責務境界） | 不可逆決定を先頭に確定 |
| 1 | `docs/design/` 骨組み + README + data-pipeline.md（コードなし俯瞰） | 設計意図の再執筆 A |
| 2 | type-validation.md + individuals-and-parties.md（コードなし俯瞰） | 設計意図の再執筆 B |
| 3 | inbound 参照張り替え + 旧 architecture.md 撤去 + 二重管理解消 | 参照確定 C |
| 4 | `docs/plan` → `docs/roadmap` 改名 + completed/ 集約 + 参照追従 | 82 ファイル追従 |
| 5 | AGENTS.md 刷新（コマンド / skill 参照化 / ディレクトリ説明） | 陳腐化是正 |
| 6 | 規約 / skill の plan 参照違反・陳腐化是正 | dangling / 表記是正 |

直列鎖: 0 → 1 → 2 → 3 → 4 → 5 → 6（5・6 は内容独立だが最終パスを拾うため 4 の後）。
