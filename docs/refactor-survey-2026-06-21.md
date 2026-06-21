# pokeform ドキュメント / 規約 / Skill 整理調査レポート

> 2026-06-21 作成。ドキュメント構成の整備・Agent Skill・規約リファクタの**事前調査**。
> 本ファイルは調査メモ（後続の `plans-new` で OVERVIEW に昇格する素材）。恒久 SoT ではない。

---

## 0. エグゼクティブサマリ

現状のハーネス資産は **機能としては健全**（責務分離・機械ゲート非再実装・cross-agent パリティ・wikilink dangling なし）。
一方で、度重なる plan 進行（00〜06）に伴い、以下 3 種の「ドリフト債務」が蓄積している:

1. **設計仕様の置き場所** — 規約の spec 正本である `architecture.md` が `docs/plan/01-mvp/` 配下にあり、「完了済み plan の一成果物」のように見えてしまう。plan 進捗に左右されない設計仕様 SoT として **`docs/` 直下へ昇格**するのが妥当。ただし inbound 参照が広範（rules / skills / ADR / AGENTS.md / src コメント等）で追従が必要。
2. **AGENTS.md の陳腐化（影響度: 高）** — コマンド表・skill リストが MVP 当時のまま。現存コマンド・skill の多くが未掲載で、「後続フェーズで追加」注記が事実と乖離。
3. **SoT の二重管理（影響度: 中）** — ゲーム仕様・型表現・テスト方針が `architecture.md` と `.claude/rules/*` の双方に実体記述されている。仕様変更時に両方を直す必要があり、ドリフト死角になっている。

リファクタの難度は **低〜中**。大半は「参照の張り替え」「要約 → ポインタ化」「陳腐化記述の除去」で対応できる。

---

## 1. 現状コンポーネント・マップ

### 1.1 ドキュメント（`docs/`）

| ツリー | 役割 | 状態 |
|---|---|---|
| `docs/plan/` | フェーズ単位の実装指示・進捗・段階的決定（mutable） | 00〜05 完了 / **06-ma-full-data のみ未着手** |
| `docs/plan/01-mvp/architecture.md` | **規約 spec の正本（What/How）** | plan 配下にあるが性質は plan 非依存 |
| `docs/adr/` | 確定決定の理由・代替案（immutable・Why） | Active 33 件 / archive 6 件。連番運用健全 |
| `docs/harness/` | PR learning 蓄積 + 改善ループ | learnings 63 件。INDEX / template 完備 |
| `docs/harness/rules-index.md` | rules の `paths` から生成される索引（Codex 用） | 生成物（手書き禁止） |

plan 進捗（すべて ✅ 完了、06 のみ ⬜ 未着手）:

```
00-harness-setup(11) → 01-mvp(4) → 02-data-model-redesign(19)
→ 03-survey-regulation-rework(12) → 04-generated-layout-redesign(6)
→ 05-move-master-scraper-refactor(4) → 06-ma-full-data(1, 未着手)
```

### 1.2 規約（`.claude/rules/*` 15 ファイル）

| ファイル | paths | 役割 | 行数 |
|---|---|---|---|
| adr.md | （常時） | ADR 採番・supersede・参照ルール | 64 |
| cli-and-io.md | `src/cli`,`src/io` | lang 宣言・終了コード・行逆引き | 38 |
| code-review.md | `src`,`scripts`,`.claude`,`docs`,md | PR 意味的レビュー観点 | 67 |
| cross-agent.md | （常時） | SoT 分担・symlink 共有 | 34 |
| data-pipeline.md | `scripts`,`data` | vendor 方式・3 軸直交・materialize/generate | 93 |
| game-spec.md | `data`,`src/domain` | Lv50/IV31/ポイント66/二重floor/メガ | 57 |
| harness-meta-criteria.md | harness-meta skill | learning 採用/見送り/撤去基準 | 62 |
| implementation-workflow.md | iw skill | Phase 0〜9 詳細手順 | 225 |
| planning.md | `docs/plan` | plans-new 入口・6 基準・renumber 追従 | 140 |
| redaction.md | `docs/harness` | secrets/PII マスキング表 | 67 |
| retrospective-format.md | learnings,pr-retro skill | KPT learning 構造 | 96 |
| skill-authoring.md | `.claude/skills`,`.agents/skills` | skill-creator 必須・≤500行・symlink | 74 |
| testing.md | `*.test.ts` | Vitest・カバレッジ100%・コロケーション | 32 |
| tsc-verification.md | `src/codegen`,`src/types` | tsc-only 検証・ブランドエラー型 | 49 |
| type-conventions.md | `src/types`,`src/generated` | XxxBase+XxxDex+XxxId 統一 | 49 |

### 1.3 Agent Skill（`.claude/skills/*` 16 個）

| 名前 | 行数 | refs | 系統 |
|---|---|---|---|
| plans-new | 116 | ✓ | ワークフロー（入口） |
| start-phase | 81 | ✗ | ワークフロー（着手） |
| implementation-workflow | 96 | ✗ | ワークフロー（統合・Phase 0-9） |
| finish-phase | 136 | ✗ | ワークフロー（締め） |
| verify | 96 | ✗ | ゲート実行 |
| adr-new | 86 | ✗ | ADR 採番 |
| pr-retrospective | 124 | ✗ | learning 生成 |
| harness-meta | 100 | ✗ | learning 集約・書き戻し |
| code-review | 102 | ✓ | レビュー（src/scripts） |
| harness-review | 101 | ✓ | レビュー（ハーネス資産） |
| dep-update | 167 | ✗ | 依存更新 PR |
| author-individual | 86 | ✗ | データ（個体） |
| stat-tuning | 73 | ✗ | データ（配分逆算） |
| review-party | 50 | ✗ | データ（パーティ点検） |
| survey-regulation | 287 | ✓ | データ（Serebii 解禁取得） |
| update-catalog | 117 | ✗ | データ（PokeAPI 構造取込） |

### 1.4 指示・ゲート

- **AGENTS.md**（90 行）= 指示 SoT（コマンド / ディレクトリ / 鉄の規約要約 / 進め方 / skill / ポインタ）。
- **CLAUDE.md** = `@AGENTS.md` import + Claude 固有注記 4 項のみ。**SoT 原則は完全遵守**（規約本文を再掲していない）。
- **`.githooks/`** = 強制ゲート（pre-commit: typecheck/lint/check:individual/check:regulation/check:yaml-style、pre-push: test:cov/party typecheck）。ツール非依存（ADR 0013）。
- **`.claude/hooks/post-edit-biome.sh`** = 補助フィードバック（Edit 直後に biome、常に exit 0）。強制ではない。

---

## 2. システム設計仕様（architecture.md）の現状

`docs/plan/01-mvp/architecture.md`（427 行）の節構成: Context / Architecture（型表現・パイプライン）/ ディレクトリ構成 / 入力フォーマット例 / CLI コマンド体系 / 分析アルゴリズム / 実装フェーズ / トレードオフ / 検証方法 / 参考ソース。

### 2.1 実装とのドリフト（清書時に要修正）

| 種別 | 内容 | architecture 側 |
|---|---|---|
| 未記載コマンド | `check:regulation` / `check:yaml-style` | CLI 表に無い |
| 未記載モジュール | `src/codegen/serebii/`（7 ファイル）・`normalize.ts` | 言及なし |
| 名称ドリフト | 表の `legality.ts` は実在せず、実体は `party-analysis.ts`+`regulation-validation.ts` | line 293 |
| 完全陳腐化 | `src/generated/names.ts` 型例（ADR 0035 で languages へ一本化、ファイル消滅） | line 61-67 |
| パス誤り | 生成物は `src/generated/`（`data/generated/` ではない） | line 312-314 |

※ line 110 に「ADR 0025 → 0035/0036 で置換済み」の更新注記があり、§60-106 は既に「歴史記録」として明示されている。清書時は **ADR 正本を本文化 or 附録化**を選択。

### 2.2 plan 依存の可変記述（plan 非依存へ清書する際の除去対象）

- line 26: `00-harness-setup Phase 3` への phase doc リンク
- line 56: 「materialize（Phase 1 で確定）」
- line 376-379: CLI 表の「Phase 2 / MVP / Phase 3」列
- line 391-396: 「実装フェーズ Phase 0〜3」節（**清書時は全削除し `docs/plan/01-mvp/` に委譲**）
- line 212: 「（A 案・ADR 0021）」複数案選択の名残

---

## 3. ドリフト・陳腐化の一覧（優先度付き）

### 🔴 高 — AGENTS.md の陳腐化

| 箇所 | 問題 |
|---|---|
| コマンド表（10-19） | `verify` の中身が古い（`check:yaml-style` 漏れ・順序違い）。`check:party`/`check:individual`/`check:regulation`/`check:yaml-style`/`generate:data`/`fetch:serebii`/`materialize`/`scrape:serebii`/`serebii:catalog` がすべて未掲載 |
| skill リスト（65-78） | 「レビュー skill・implementation-workflow 等は後続フェーズで追加される」注記が事実と乖離（すべて実装済み）。`code-review`/`harness-review`/`implementation-workflow`/`author-individual`/`survey-regulation`/`update-catalog`/`stat-tuning`/`review-party`/`dep-update` が未列挙 |
| ディレクトリ説明（22-43） | `*-specs.yaml` 総称で 6 種別（species/mega/item/ability/move/type）が隠れる。`languages/` の役割が曖昧 |

### 🟡 中 — SoT 二重管理

| 規約領域 | 二重記述箇所 | あるべき姿 |
|---|---|---|
| ゲーム仕様 | `game-spec.md:13-24` ↔ `architecture.md:11-19`（ポイント66/二重floor/性格補正を両方に実体記述） | 値は [[game-spec]]（reference）に一本化、design は参照のみ（§9.2） |
| 型表現パターン | `type-conventions.md:12-22` ↔ `architecture.md:50-57` | 具体型は [[type-conventions]]、design は概要 + リンク |
| テスト方針 | `testing.md:14-16` ↔ `architecture.md:25` | [[testing]] に一本化、design はリンクのみ |

### 🟡 中 — 規約内の plan 参照違反

- `code-review.md:27`: 「Phase 9」phase doc へのリンク → adr.md の「可変 plan ファイルを引かない」に違反。**ADR 0013 へ張り替え**。

### 🟢 低 — skill 内の軽微な陳腐化

- `harness-meta/SKILL.md:29`: 「Phase 7 で新設される skill-authoring.md」→ 既に実在。「確定した」に更新。
- `survey-regulation/references/serebii-sourcing.md:39`: 「過去の人手調査（Phase 7）」文脈補強。
- `start-phase`: implementation-workflow との使い分け（単発着手の用途）が description で曖昧。

---

## 4. リファクタの方向性（提案）

> 以下は方向性の**要約**。**具体の分割設計・命名・配置指針は §7〜§9 が正**（本節と食い違う場合は §7〜§9 を採る）。実施は `plans-new` で OVERVIEW 化し phase 分割してから着手する。

### 4.1 architecture.md を `docs/design/` へテーマ別分割（コードなし）

- 現 `docs/plan/01-mvp/architecture.md` を**単一ファイル移動するのではなく**、`docs/design/` 配下に 3 テーマ（データ取得・管理 / 型バリデーション / 個体・パーティ管理）+ README へ**分割**する（§7）。
- **TypeScript の具体コード（型・interface・スキーマ・数式）は書かない**。型/値の SoT は `src/` 実装 + `.claude/rules/*`、design は俯瞰・なぜ・データフロー図に徹する（§8・配置指針 §9）。
- **清書**: 実装フェーズ（Phase 0-3）節・CLI 表の phase 列・陳腐化型例（names.ts）を除去、ドリフト 5 点（§2.1）修正。design と ADR の二重化回避＝決定根拠は再記述せず ADR へリンク（§9.4）。
- **追従**: inbound 参照を `git grep` で網羅し design の該当ファイル + アンカーへ張り替え（§7.4）。archive ADR 本文は不変なので**触らない**（active な参照のみ）。

### 4.2 `docs/plan/` → `docs/roadmap/` 改名・完了を `completed/` 集約

- design との語感衝突を避け、完了計画群を `docs/roadmap/completed/` にまとめて進捗を可視化（§9.5）。構造・追従コスト（145 ヒット）・運用明文化は §9.5。

### 4.3 AGENTS.md の刷新

- コマンド表を `package.json` scripts に追従（または「正本は package.json」とし要点のみ）。
- skill 節を**列挙（実体重複）から参照（`.claude/skills/` が SoT）へ転換**。「後続フェーズで追加」注記を除去。
- ディレクトリ説明の粒度調整（specs 6 種別・languages の役割を明示 or architecture へポインタ）。

### 4.4 rules / skills の整理

- `code-review.md` の「Phase 9」phase doc 参照 → **ADR 0013 へ張り替え**（§3・plan 参照違反）。
- ゲーム仕様 / 型 / テストの二重記述を **rules（reference）に一本化し、design からはリンク**（§9.2 配置マトリクス）。
- `start-phase` の用途明記、`harness-meta` / `survey-regulation` の陳腐化表記更新。
- **シンプル化余地は §5**（rules 約 230-300 行・skills 約 250-340 行の圧縮余地。ARID に従い実体の重複を削る）。

---

## 5. rules / skills のシンプル化余地（1 件ずつ精読・追加調査 2026-06-21）

15 rules・16 skills を 1 件ずつ全文精読し、「冗長を削るが意味は保つ」線で削減余地を洗い出した。
全体で **rules 約 230〜300 行 / skills 約 250〜340 行**（各 20〜30%）の圧縮余地がある。

### 5.1 横断的に頻出した冗長パターン（5 類型）

| # | パターン | 典型 | 是正 |
|---|---|---|---|
| P1 | **frontmatter description の肥大** | survey-regulation（240字超）・stat-tuning（258字）・update-catalog（250字）が key concept を全部詰め込む | trigger 文を 1〜2 文に。詳細・例は本文へ |
| P2 | **frontmatter ↔ 本文冒頭の重複** | review-party / author-individual / update-catalog で同じ役割説明が 2 回 | 本文冒頭の重複説明を削除 |
| P3 | **「なぜ」を本文に書きすぎ** | rule 本文に長い理由（`code-review.md:21-23`「理由は完璧主義が…」等） | 決定根拠は ADR へ委譲、rule は「何をするか」に絞る |
| P4 | **SoT 実体の再記述（リンクで足りる）** | harness-meta が criteria rule の採用基準を再掲、survey-regulation が references を逐語再掲 | rule / references への参照に置換 |
| P5 | **learning 番号の羅列・散文と表の二重説明** | `planning.md:82-112`・`type-conventions.md:32` に PR/learning 番号の列挙、表の上下に同内容の散文 | 「過去 learning で反復」に集約、表を核に散文を脚注化 |

### 5.2 rules 別 削減目安

| rule | 行数 | 削減目安 | 主因（パターン） | 代表箇所 |
|---|---|---|---|---|
| implementation-workflow.md | 225 | **50-60** | P3,P5 | Phase 別詳細を表化 + 手順は SKILL.md へ / 不変条件まとめ(L175-185)が各Phaseと重複 / ワーカーノート(L187-209)を references 化 |
| data-pipeline.md | 93 | **40-50** | P3,P5 | ディレクトリ巨大ブロック(L44-58)分割 / 項目表の上下散文(L70-93)を脚注化 |
| adr.md | 64 | 15-20 | P3,P5 | 前置き(L7-11)圧縮 / 参照ルール(L22-32)を箇条統一 / learning番号(L62)削除 |
| cross-agent.md | 34 | 15-20 | P5 | 表(L11-16)直下の散文20行を脚注化 |
| code-review.md | 67 | 12-15 | P3 | net improvement の理由(L21-23)・effort段落(L50-54)圧縮 + **L27「Phase 9」phase doc 参照→ADR 0013 へ（§3 既出）** |
| tsc-verification.md | 49 | 12-18 | P3,P4 | ブランド型実装詳細(L19-33)・@source仕組み(L36-42)・合計66算出(L43-49)を圧縮 |
| planning.md | 140 | 15-20 | P5 | 大原則の重複(L14-24) / renumberチェックリスト(L82-112)のlearning羅列統合 |
| skill-authoring.md | 74 | 12-16 | P3,P5 | フォールバック注記・Workflow背景・セルフチェック例の列挙削減 |
| testing.md | 32 | 10-14 | P4,P5 | 除外パス具体例(L15-16)・legality手順(L17)を code-review 参照化 |
| type-conventions.md | 49 | 10-14 | P2,P5 | 定義分散統合 / メガストーン変遷追補(L32)削除 |
| harness-meta-criteria.md | 62 | 8-12 | P5 | 採用/見送り/撤去の粒度均等化・見出し分割 |
| game-spec.md | 57 | 8-12 | P3 | 自己言及(L10)削除 / 計算式コードブロック化 / 逆算詳細(L43-50)を src へ |
| cli-and-io.md | 38 | 8-10 | — | 長い1文(L14-16)分割 / 冗長修飾削除 |
| retrospective-format.md | 96 | 8-12 | P3,P5 | 理由(L19-31)圧縮 / frontmatter説明と本文の二重(L48-49) |
| redaction.md | 67 | 5-8 | P3 | 理由説明(L15-21)削除 / 例外ケース簡潔化 |

### 5.3 skills 別 削減目安

| skill | 行数 | 削減目安 | 主因 | 代表箇所 |
|---|---|---|---|---|
| survey-regulation | 287 | **80-120** | P1,P2,P4 | frontmatter圧縮 / blockquote・「なぜ」節が references を逐語再掲 / Gotchas(L235-265)冗長 / 関連ADR過剰列挙 |
| finish-phase | 136 | 38-50 | P3,P4 | 「なぜ」節(L18-24) / README更新詳細(L58-75) / ADR基準が adr.md と重複(L91-109) |
| plans-new | 116 | 30-40 | P4 | 6基準が概要・rule・split-criteria.md の三重記述(L48-57) / issue作成詳細 |
| implementation-workflow(skill) | 96 | 26-40 | P3,P4 | Generator/Evaluator説明の表↔本文重複 / Gotchasが rule 不変条件と重複 |
| dep-update | 167 | 25-30 | P1,P4 | description短縮 / 入力節→frontmatter / 具体例(L121-148)を references 化 |
| code-review(skill) | 102 | 15-20 | P4 | harness-review と手順1-5がほぼ同構造 → 共通フレームを rule へ |
| harness-meta | 100 | 18-22 | P4 | 判定基準を criteria rule へポインタ化 / 書き戻し手順圧縮 |
| update-catalog | 117 | 15-20 | P1,P2 | frontmatter↔本文の構造データ列挙重複 / 対象id確定ステップ自明 |
| pr-retrospective | 124 | 15-20 | P1,P3 | description短縮 / 前置き削除 / Gotchas重複 |
| start-phase | 81 | 14-20 | P2 | 識別子バリエーション列挙(L25-27) / Gotchasの自明項目 |
| harness-review(skill) | 101 | 10-15 | P4 | code-review と共通の手順・auto-mergeゲートを rule へ |
| verify | 96 | 24-38 | P3,P5 | ゲート説明の反復 / 例セクション(L62-81)削除推奨 |
| adr-new | 86 | 20-32 | P4 | supersede手順(L56-73)が adr.md / README と重複 |
| author-individual | 86 | 12-15 | P2 | frontmatter↔本文重複 / 役割の委譲説明くどい |
| stat-tuning | 73 | 10-12 | P1 | frontmatter過剰 / 役割のメソッド列挙 |
| review-party | 50 | 7-9 | P2 | frontmatter↔本文冒頭の重複（既に短く余地小） |

### 5.4 共通の構造改善（複数ファイルにまたがる施策）

- **レビュー skill の共通手順を rule へ**: `code-review` / `harness-review` の SKILL.md は手順 1-5（diff 収集→paths 絞込→checklist 評価→重大度→PR コメント）がほぼ同一。共通フレームを `code-review.md` rule に置き、両 skill は差分（各 checklist 参照）に集中。auto-merge ゲートも両 references から rule へ一本化。
- **「なぜ」の所在統一**: rule 本文の長い理由説明は ADR へ委譲し、rule は「何をするか」+ ADR リンクに。ただし下記の判断線に注意。
- **frontmatter スリム化を一括適用**: P1/P2 は全 skill 横断。trigger 精度を保ったまま description を 1-2 文へ。

### 5.5 シンプル化の判断線（やりすぎ防止）

調査エージェントの提案には「圧縮しすぎ」のリスクもあるため、実施時は以下を守る:

- **rule の自己完結性は保つ**: 「なぜ」を全部 ADR へ出すと rule 単体で意図が読めなくなる。**1 行要約は残し、詳細のみ ADR 委譲**。
- **learning 番号の削除は慎重に**: 追跡可能性とのトレードオフ。`adr.md` の archive 追従手順など「再発防止の根拠」になっている番号は残す。冗長な羅列のみ「過去 learning で反復」に集約。
- **trigger 精度を落とさない**: description 短縮で under-trigger を招かないか、`skill-creator` の eval で確認してから縮める。
- **手順の安全性記述は削らない**: 機械ゲート委譲・取りこぼし吸収・redaction・idempotent など「踏み外すと壊れる」注意書きは保持。
- **references への移動 ≠ 削除**: SKILL.md からの参照リンクを必ず張り、dangling を作らない。

### 5.6 §4 への追補

§4 の方向性に加え、**「rules/skills シンプル化」を独立した phase 群**として起こせる。粒度の目安:
- rules シンプル化（重量級 2 本: implementation-workflow / data-pipeline を 1 PR、軽量級まとめて 1-2 PR）
- skills シンプル化（survey-regulation 単独 1 PR、ワークフロー系・レビュー系・データ系で各 1 PR）
- レビュー skill 共通フレーム抽出（rule + 2 skill + 2 references の横断 1 PR）

いずれも `harness-review` skill でセルフレビューし、cross-agent パリティ（canonical + symlink）と trigger 精度を検証してからマージする。

---

## 6. 留意点

- **不変ログの保護**: ADR 本文（特に archive）は supersede 手順以外で書き換えない。architecture.md 移動時の参照追従は「整備」の範囲（adr.md の許可 2 例外）で active 参照のみ。
- **cross-agent パリティ**: AGENTS.md / rules / skills を触る変更は canonical + symlink、rules-index 再生成、ゲート非再実装を点検。
- **段階実施**: 「責務境界・命名・roadmap 改名を束ねる ADR（§9.5）」「architecture.md → `docs/design/` 分割（§7-9）」「`docs/plan/` → `docs/roadmap/` 改名 + `completed/` 集約（§9.5）」「AGENTS.md 刷新」「rules/skills 二重管理解消・シンプル化（§5）」は独立性が高く、別 PR に分割可能（1 phase = 1 PR）。ADR を先頭に置く。

---

## 7. architecture.md のテーマ別分割案（初版・**§8 で更新**）

> **注**: 本節 §7 は「コード例を含めてよい」前提の初版。**§8 の制約（design/ 配下に TypeScript の具体コードを一切書かない）で方針を更新する**。ファイル構成（§7.1）と分割先マッピング（§7.2）の骨格は踏襲するが、各ファイルに何を書くか・規約をどこで管理するかは **§8 を正**とする。
>
> **ディレクトリ名**: 当初 `docs/architecture/` で検討したが、(1) architecture は「構造の正確な仕様」を連想させ reference 寄りに誤誘導する、(2) `docs/adr/`（Architecture Decision Records）と語が衝突し棲み分けが曖昧になる、ため **`docs/design/` に決定**（§9.5）。以下のパス表記は `docs/design/` に統一済み。
>
> **用語凡例**: 本文の散文中に単独で「architecture」とある場合、文脈により (a) 現存ファイル `docs/plan/01-mvp/architecture.md`（移動・清書の**対象**＝名前は維持）か、(b) 新設置き場（正式名 `docs/design/`・旧称 architecture/）を指す。結論を示す表は (b) を design に統一済み。

§4.1 の「`docs/` 直下へ昇格」を一歩進め、現 `architecture.md`（427 行・単一ファイル）を
ユーザー指定の 3 テーマ（**データ取得・管理 / 型バリデーション / 個体・パーティ管理**）で
`docs/design/` 配下へ分割する案。1 ファイルが長く、節同士の関心も明確に分かれているため、
分割で「読む側が必要なテーマだけ開ける」「rule との対応が 1:1 に近づき二重管理を解消しやすい」。

### 7.1 ファイル構成案（index + 3 本）

| ファイル | テーマ | 扱う内容 | 対応する主な rule |
|---|---|---|---|
| `docs/design/README.md` | **全体像（index）** | プロジェクト目的・スコープ / ゲーム仕様の概要 / 設計方針 5 点 / システム全体のディレクトリ構成図 / 3 本へのナビ / 主要トレードオフ / 参考ソース | （横断） |
| `docs/design/data-pipeline.md` | **データ取得・管理** | 情報源 3 系統（Serebii / 補助 / PokeAPI）/ skill 著述の辺 ↔ 機械転記の辺 / specs・languages・per-reg の 3 軸直交 / materialize・generate / `data/` 構成 / PokeAPI→要求項目の対応表 / `generate:data`・`fetch:*` 系コマンド | [[data-pipeline]] |
| `docs/design/type-validation.md` | **型バリデーション** | 検証を tsc 単一ゲートにする考え方（YAML/MD→codegen→tsc・mermaid）と Zod 不採用の理由 / ID キーで種族・技等を表す設計判断と巨大 union 回避 / ブランドエラー型で診断を読みやすくする方針 / `@source` 逆引きの仕組み（※具体の型は書かず src/rule へ・§8.3） | [[type-conventions]] / [[tsc-verification]] |
| `docs/design/individuals-and-parties.md` | **個体・パーティ管理** | 個体・パーティを型で検証する考え方と**保証する不変条件**（覚えない技/使えない特性/合計66・各32/同種族重複/レギュ解禁/体数）/ 実数値自動計算の位置づけ / 入力言語をファイル単位で宣言する方針 / CLI でできること（概念）/ coverage 分析が答える問い（弱点集中・技範囲の穴）（※型・YAML例・数式は書かず src/rule へ・§8.3） | [[game-spec]] / [[cli-and-io]] |

> 命名は rule と被らないよう調整可。`data-pipeline.md` は rule と同名（ディレクトリが違うので衝突はしないが紛らわしいなら `data-management.md`）。
> 型は `type-validation.md`（ユーザー語に忠実）/ `type-system.md` どちらでも。個体・パーティは `individuals-and-parties.md` / `authoring.md` 等。

### 7.2 現 architecture.md の節 → 分割先マッピング

| 現節（行） | 分割先 | 備考 |
|---|---|---|
| Context・なぜ作るか（3-9） | README | スコープ。MVP/将来の可変表現は plan 非依存へ清書 |
| 確定しているゲーム仕様（11-18） | README（概要）→ 詳細は [[game-spec]] | 計算式の実体は individuals-and-parties + game-spec rule。README は要約のみ |
| 確定した設計方針 5 点（20-26） | README | line 26 の `00-harness-setup Phase 3` 参照は ADR へ張り替え |
| 検証の単一ゲート・mermaid（30-48） | type-validation | |
| 種族の型表現（50-110） | type-validation | line 61-67 の `names.ts` 陳腐化型例は削除/附録化（ADR 0035 で消滅） |
| 技・タイプ・特性・持ち物の型（112-194） | type-validation | |
| 個体型 `IndividualSpec`（196-212） | individuals-and-parties | |
| 実装値の自動計算（214-216） | individuals-and-parties | |
| データ生成パイプライン（218-267） | data-pipeline | mermaid・PokeAPI 対応表ごと移動 |
| ディレクトリ構成（271-320） | README（全体図）+ 各本（担当部分の詳述） | `data/`→data-pipeline、`src/types`→type-validation、`src/domain`/`io`/`cli`→individuals-and-parties。line 293 `legality.ts` は実体名へ修正 |
| 入力フォーマット例・`lang` 宣言（322-364） | individuals-and-parties | |
| CLI コマンド体系（368-381） | individuals-and-parties（個体/パーティ操作）＋ data 系は data-pipeline | 表の「Phase 2/3」列は削除（plan 非依存化・§2.2） |
| 分析アルゴリズム（383-388） | individuals-and-parties | |
| **実装フェーズ Phase 0-3（391-396）** | **削除** | plan 依存。`docs/roadmap/completed/01-mvp/` に委譲（§2.2・§9.5） |
| 主要トレードオフ（400-405） | README（横断）or 各テーマへ分散 | |
| 検証方法 e2e（409-418） | README（横断確認）→ テスト方針は [[testing]] | |
| 参考ソース（420-427） | README | |

### 7.3 rule との役割分担（二重管理を作り直さない）

分割の機会に §3.2 の二重管理を解消する。原則は **「design = 設計の全体像・図・なぜこの形か（What/How の俯瞰・コードなし）」「rule = path-scoped で作業中に自動ロードされる実務規約・具体値」**（配置マトリクスは §9.2）。

- ゲーム仕様の数式・閾値（66/32・二重 floor）の SoT は [[game-spec]]。design は要約 + リンク。
- 型パターンの具体規約は [[type-conventions]] / [[tsc-verification]]。design は設計意図の散文（型シグネチャは書かない・§8.3）。
- データ転記の具体手順・SoT 表は [[data-pipeline]]。design は情報源の関係図と全体フロー。
- **同じ値を二重に「実体記述」しない**。図・俯瞰は design、具体値・手順は rule、という分担に寄せる。

### 7.4 移動・追従の影響

- §3/§4 で洗い出した inbound 参照（rules 9・skills 数件・ADR 10+・AGENTS.md 3・CLAUDE.md 1・src コメント 4・data/README・learnings 等）は、**単一ファイルへのリンク → 分割後の該当ファイル + アンカー**へ張り替えが必要。粒度が上がるぶん「どのテーマを指すか」を選んで張り直せる利点もある。
- ADR が `architecture.md#種族の型表現` のような節アンカーを引いている場合、分割でアンカー先ファイルが変わる。`git grep -n 'architecture'` で**インライン相対リンク・reference 式リンク定義・素のパス参照**を全走査して追従（adr.md の archive 追従手順と同様の網羅性で）。
- archive ADR 本文は不変。active 参照のみ追従する。
- `docs/plan/01-mvp/README.md` に「architecture は `docs/design/` へ分割・移動」の注記を残す（plan doc の鮮度維持・§5 supersede 追補と同型）。

### 7.5 phase 分割の目安

- **Phase A**: `docs/design/` 骨組み作成（README + 3 本）+ 現 architecture.md の節を機械的に移送（清書は最小限、まず構造を移す）。
- **Phase B**: plan 依存記述の除去・陳腐化型例の削除・rule への二重管理寄せ（§7.2/§7.3 の清書）。
- **Phase C**: inbound 参照の張り替え（rules / skills / ADR / AGENTS.md / src コメント / data/README）+ dangling 検査。

A→B→C は順序依存（構造を移してから清書、清書後に参照確定）。各 PR で `harness-review` セルフレビュー + `git grep` で dangling ゼロを確認してマージ。

### 7.6 代替案

- **2 分割案**: 「データ（取得・管理 + 型バリデーション）」と「利用（個体・パーティ）」の 2 本。ファイル数を抑えたい場合。ただし型バリデーションとデータ取得は関心が異なるため、ユーザー指定の 3 分割を推奨。
- **rule 統合案**: architecture を新設せず、3 テーマを既存 rule（data-pipeline / type-conventions+tsc-verification / game-spec+cli-and-io）へ吸収する。ただし rule は path-scoped の実務規約で「設計の俯瞰図・mermaid・なぜこの形か」を載せる場として最適ではない（rule が肥大化する）。**俯瞰は architecture、実務は rule の分担を維持する 3 分割を推奨**。

---

## 8. 改訂方針: `docs/design/` 配下に TypeScript コードを書かない（§7 を更新）

§7 初版はコード例を含む前提だった。新制約 **「`docs/design/` 配下の .md に TypeScript の具体コード（型シグネチャ・interface・Dex・関数定義）を一切書かない」** を反映し、本節で §7 の「各ファイルに何を書くか」を更新する。

### 8.1 なぜコードを書かないか / 何が SoT か

- 具体の型シグネチャ・スキーマフィールド・数式をドキュメントに書き写すと、実装変更のたびに二重更新が要り**乖離する**。乖離チェックが恒常的な負担になり、ドキュメントが腐る。
- 型・スキーマ・数式の SoT は **実装そのもの（`src/types/*` / `src/domain/*`）** と **path-scoped rule（[[type-conventions]] / [[tsc-verification]] / [[game-spec]] / [[cli-and-io]]）**。これらは既に存在し、tsc・カバレッジ100%・`check:*` で「実装と一致していること」が**機械的に保証**される。
- `docs/design/` には「乖離しにくいもの」だけを置く: **目的・設計意図（なぜ）・データフロー図（構造図＝コードではない）・コンポーネント責務分担・保証する不変条件の自然言語記述・トレードオフ**。

### 8.2 「型・個体の規約をどこで管理するか」3 案比較（ユーザーの問いへの回答）

| 案 | 規約・具体設計の置き場所 | design/ の役割 | 評価 |
|---|---|---|---|
| A: design にコード入りテーマ.md | design が型例ごと規約 SoT を兼ねる | 規約 SoT 兼俯瞰 | ✗ 却下（乖離リスク大＝§7 初版の問題） |
| **B: 規約は rule + src、design は同名テーマの「コードなし俯瞰」** | **rule（type-conventions 等）+ src 実装** | **仕組み・なぜの俯瞰のみ（コードなし）** | **◎ 推奨** |
| C: 型・個体テーマを design に置かず rule へ全寄せ | rule + src のみ | README + data-pipeline だけ | △ 俯瞰をまとめて読む場所が消える。rule は path-scoped 実務で俯瞰に不向き |

→ **案 B 推奨**。型/個体の「規約・具体」は rule + src（既存 SoT・機械保証あり）に置き、`docs/design/` 配下のテーマ .md は「コードを書かない設計俯瞰」に徹する。ユーザーの示唆「別の場所で管理すべき」を**規約 SoT については採用（rule + src へ）**し、**俯瞰だけ design に残す**折衷。

### 8.3 各ファイルに「書く / 書かない」

| ファイル | 書く（乖離しにくい） | 書かない（→ 委譲先） |
|---|---|---|
| **README.md** | 目的・スコープ / 設計方針 5 点の意図 / 全体データフロー図(mermaid) / 3 本へのナビ / 主要トレードオフ / 参考ソース | コマンドフラグ・具体値 |
| **data-pipeline.md** | 情報源 3 系統の関係、skill 著述 ↔ 機械転記の 2 辺、specs/languages/per-reg が「何の SoT か」、generate の決定論性、データの流れ(mermaid) | YAML キー名の網羅・転記コード・型 → [[data-pipeline]] + `scripts/` |
| **type-validation.md** | 「YAML→codegen→tsc を唯一ゲートにする」考え方と Zod 不採用の理由、ブランドエラー型で診断を読みやすくする方針、`@source` 逆引きの仕組み、種族粒度=種族値一意・ID キー採用の設計判断、巨大 union 回避の方針 | 型シグネチャ・interface・Dex の具体 → [[type-conventions]] / [[tsc-verification]] + `src/types/` |
| **individuals-and-parties.md** | 個体・パーティを「コードとして」検証する考え方、**保証する不変条件の列挙**（覚えない技/使えない特性/合計66・各32/同種族重複/レギュ解禁/体数）、入力言語をファイル単位で宣言する方針、CLI でできること(概念)、coverage 分析が答える問い | `IndividualSpec` フィールド・YAML 具体例・CLI フラグ・数式 → [[game-spec]] / [[cli-and-io]] + `src/` + author-individual / review-party skill |

### 8.4 具体物（コード以外）の扱い — §7.2 マッピングの更新

§7.2 のマッピング先は踏襲しつつ、移送時に「具体」を落として設計意図だけ抽出する:

- **型例コード（現 50-194）**: 移送先で**コードは破棄**し、設計判断（なぜ ID キーか・なぜ union を避けるか・親型 + Dex の意図）だけを自然言語化。型の実体は `src/types/` が唯一 SoT。
- **YAML 入力例（現 322-364）**: TS ではないが「実装と乖離しうる具体」。architecture には載せず、`lang` 宣言の**方針**だけ。具体例は author-individual skill / [[cli-and-io]] が持つ。
- **ゲーム計算式（現 15-16）**: 数式も具体。architecture は「二重 floor に注意」等の**設計上の注意**のみ、式の SoT は [[game-spec]]。
- **CLI コマンド表（現 368-381）**: コマンド名と**概念的責務**までは俯瞰として可。フラグ・Phase 列は載せない。網羅と詳細は [[cli-and-io]] / 各 skill。
- **mermaid 図**: コードではない構造図なので可。ただし図中のファイル名・キーは最小限にし、陳腐化しにくい粒度（"specs"/"languages"/"per-reg" レベル）に保つ。

### 8.5 乖離を構造的に防ぐ 2 つの仕掛け

1. **各ファイル末尾に「実装 SoT ポインタ」節を必須化** — 「この設計の具体は `src/types/individual.ts` と [[game-spec]] が SoT」のように rule（`[[...]]`）と src パスを列挙。読者を実装へ誘導し、architecture 側に具体を持たせない規律を構造化する。
2. **図のラベル粒度を固定** — mermaid のノードは陳腐化しにくい抽象語（"specs" 等）に留め、具体ファイル名・キーを埋め込まない。

### 8.6 乖離チェックが軽くなる理由

- architecture を変更せず実装の型を変えても**壊れない**（具体を持たないため）。`harness-review` / `code-review` は「俯瞰の意図がまだ正しいか」だけ見ればよく、型シグネチャの逐一照合が不要。
- 結果として「ドキュメント更新の二重作業」が消え、§0 で挙げたドリフト債務の再発を構造的に抑える。

### 8.7 phase 分割（§7.5 を更新）

§7.5 の「機械移送」を、コードを落とすため **「設計意図の再執筆」** に置き換える:

- **Phase A**: `docs/design/` 骨組み + README + data-pipeline.md を**コードなし俯瞰として執筆**（現データ生成節から図と意図を抽出）。
- **Phase B**: type-validation.md + individuals-and-parties.md を「**保証する不変条件 + 設計意図 + SoT ポインタ**」として執筆（現コード節からは意図のみ抽出、型例は破棄）。
- **Phase C**: inbound 参照の張り替え + 旧 `architecture.md` 撤去 + dangling 検査。

A→B→C は順序依存。§7 初版と違い各ファイルは「新規執筆に近い」（コードを落とすため単純コピーにならない）。各 PR で `harness-review` セルフレビュー + `git grep` で dangling ゼロを確認してマージ。

### 8.8 最終構成（確定形）

```
docs/design/
├─ README.md                    # 全体像・index（目的/方針/全体図/ナビ/トレードオフ）
├─ data-pipeline.md             # データ取得・管理の仕組み（図 + なぜ）
├─ type-validation.md           # 型バリデーションの仕組み（考え方 + なぜ）
└─ individuals-and-parties.md   # 個体・パーティ管理の仕組み（保証する不変条件 + なぜ）
```

いずれも **TypeScript コードなし**。具体（型・スキーマ・数式・YAML キー・CLI フラグ）の SoT は `src/` 実装 + path-scoped rule に置き、各ファイル末尾の「実装 SoT ポインタ」節で実装へ誘導する。

---

## 9. 配置指針 — 何を `.claude/` に、何を `docs/design/` に書くか（外部文献に基づく）

§4・§5・§7・§8 の提案を、ドキュメント構成の権威ある文献（一次ソースを WebSearch/WebFetch で確認）に照らして裏付け・ブラッシュアップする。**4 文献が独立に同じ結論へ収束した**: 知識の種類ごとに正本（SoT）の置き場を一意に決め、他の場所からは**再記述せず参照（point, don't repeat）**する。

### 9.1 参照した文献と核心（一次ソース）

| 文献 | 核心の主張 | pokeform への含意 |
|---|---|---|
| **Diátaxis**（diataxis.fr / D. Procida） | ドキュメントを **reference / how-to / explanation / tutorial** の 4 象限に分け、**境界を混ぜない**。混在すると両方が劣化。値は reference に一意化し、他象限は "refer to" で繋ぐ | rule=reference / skill=how-to / design=explanation に 1:1 対応 |
| **arc42 / C4 model**（arc42.org / c4model.com / S. Brown） | **Code レベルの詳細は永続ドキュメントにしない**（"No, particularly for long-lived documentation"・IDE が生成）。図は Container/Component 粒度で止め、**コードの変化率と図の抽象度を合わせる**。ADR は概要 doc を補完し重複させない | architecture に型/interface を書かない方針（§8）を直接裏付け。mermaid はモジュール責務粒度に保つ |
| **DRY / Living Documentation / SSOT**（Pragmatic Programmer / Martraire / Write the Docs） | DRY=「知識は単一・権威ある表現を 1 つ」。**コード=What/How の SoT、ドキュメント=Why の SoT**。ただし散文には **ARID**（言い換え重複は許すが**正本の置き場は重複させない**） | 型/数式は src（tsc/cov 保証）、なぜは design。散文の重複可否の線引き |
| **Anthropic 公式**（code.claude.com/docs/memory ほか） | **rule=常に真の制約(what)、skill=手順(how-to)**。CLAUDE.md は **<200 行**目標、`@import` はコンテキストを削減しない（削減は path-scoped rule で）。skill は description=trigger + references で progressive disclosure | rule/skill の役割分担と AGENTS.md スリム化（§4.2）の公式根拠 |

### 9.2 配置マトリクス（知識の種類 → 正本 → 他層での扱い）

**判断の起点**: 「その知識は機械検証できるか / コードが語れるか / なぜ・全体像か」。

| 知識の種類 | 正本（書く場所） | Diátaxis 象限 | 他層での扱い | 根拠文献 |
|---|---|---|---|---|
| 型・スキーマ・数式・enum・閾値そのもの | **`src/`**（tsc/カバレッジ100%/check が保証） | （実装・doc 外） | シンボル名で**参照のみ** | C4「Code 非永続化」/ DRY「low-level=code」 |
| 規約・具体値・契約・手順中の値（exit code・閾値・命名） | **`.claude/rules/*`**（1 rule = 1 正本） | Reference | `[[rule]]` リンクで参照 | Diátaxis reference / 公式 rule=what |
| 「〜するとき」の手順・チェックリスト・分岐 | **`.claude/skills/*`** | How-to | rule の値を再記述せず "refer to" | Diátaxis how-to / 公式 skill=how |
| 設計の俯瞰・なぜこの形か・データフロー図・層の責務 | **`docs/design/*`** | Explanation | 値を持たず src/rule を指す | arc42 §4/§8 / Diátaxis explanation |
| いつ・なぜ決めたか・捨てた代替案 | **`docs/adr/*`**（不変ログ） | Explanation（point-in-time） | 具体値は live SoT を参照 | arc42 §9 / Nygard ADR |
| 指示の入口・常時保持すべき事実 | **`AGENTS.md`**（+ `CLAUDE.md` は import アダプタ） | （横断・最小） | 詳細は rule/skill へポインタ | 公式 memory（<200 行） |

### 9.3 重複回避の運用ルール（point, don't repeat + ARID）

文献横断で最も load-bearing な実務指針は **ARID**（Write the Docs）: *コードには DRY を厳守、散文ドキュメントには ARID*。これを pokeform に翻訳:

1. **正本の置き場は決して重複させない**（SoT は一意）。新しい値・規約を書く前に「これは下の層（src の型・rule の規約）で機械検証/一元管理できないか？」を必ず問い、できるなら下の層へ落とす。
2. **散文の言い換え重複は許容**（ARID）。同じ概念に触れる短い導入文が複数 skill にあっても、それが**読みやすさのため**で、かつ**値・規約の実体を再記述していない**なら可。§5 のシンプル化は「実体の重複」を削るのであって、文体上の最小限の重複まで潔癖に消さない。
3. **参照は一方向に揃える**: explanation（architecture / ADR）→ reference（rule）→ 実装、how-to（skill）→ reference（rule）。**reference は他層を参照し返さない**（中立記述を保つ・Diátaxis）。
4. **import ≠ コンテキスト削減**（公式）。AGENTS.md が肥大したら `@import` で割るのではなく、毎セッション不要な内容を **path-scoped rule へ移す**（§4.2 を更新: 「正本は package.json」化に加え、200 行基準で点検）。

### 9.4 各層の「書く / 書かない」境界（文献根拠つき・§8.3 を補強）

- **`docs/design/*`（explanation）**: 書く=俯瞰・なぜ・データフロー図・層の責務。書かない=型/スキーマ/数式/具体値（→ src / rule）。**さらに「決定の根拠と捨てた代替案」も書かず ADR へリンクする**（arc42「Section 4 は ADR を補完し重複させない」/ DRY。`design/` と ADR は**どちらも explanation 象限**なので二重化しやすい — 最大の新規注意点）。`design/` = 現在どう成り立っているか（可変スナップショット）、ADR = いつ・なぜ決めたか（不変ログ）。
- **`.claude/rules/*`（reference）**: 書く=規約・具体値・契約（中立記述）。書かない=長い手順の物語（→ skill）、「なぜその値か」の議論（→ design/ADR）、意見・推測（Diátaxis: reference に opinion/instruction を入れない）。
- **`.claude/skills/*`（how-to）**: 書く=タスク手順・分岐。書かない=規約値の再記述（→ rule を refer）、設計の長い「なぜ」（→ design/ADR）、概念の教示（公式「Claude は既に賢い・既知の文脈を足さない」）。description=trigger を三人称で、本文 <500 行、references は 1 階層（公式）。
- **`AGENTS.md`/`CLAUDE.md`**: 書く=常時保持すべき事実・入口。書かない=マルチステップ手順（→ skill）、一部でしか効かない規約（→ path-scoped rule）。<200 行目標（公式）。

### 9.5 既存提案（§4・§7・§8）への反映

外部文献に照らし、以下を**更新・追加**する:

- **§8 確定**: 「design にコードを書かない」は C4 の明示的推奨そのもの。方針は権威に裏付けられた → **採用確定**。
- **§7.3 / §8 に追加**: design と ADR の二重化回避を明記。**design は決定根拠を再記述せず ADR を要約・索引する**（両者 explanation 象限のため）。
- **ディレクトリ名は `docs/design/` に決定**（`architecture/` は見送り）。理由: (1) architecture は「構造の正確な仕様」を連想させ reference 寄りに誤誘導する、(2) `docs/adr/`（Architecture Decision Records）と語が衝突し棲み分けが曖昧になる。Diátaxis の Explanation 象限を担う「設計意図・俯瞰」の置き場として design が適切。
- **`docs/plan/` を `docs/roadmap/` に改名し、完了計画群を `completed/` にまとめる**（design との混同回避 + 進捗の可視化）。`plan` と `design` は語感が近く混同しやすいため、実装の工程・進捗を表す `roadmap` に改める。構造:
  ```
  docs/roadmap/
  ├─ README.md              # ロードマップ全体（進捗ロールアップ表 ✅/🚧/⬜）
  ├─ 06-ma-full-data/       # active（進行中・未着手）は直下
  └─ completed/             # 完了した計画群をディレクトリ単位でまとめる
     ├─ 00-harness-setup/ … 05-move-master-scraper-refactor/
  ```
  「ひと目で把握」を**二重**に担保する: (1) `completed/` を開けば完了計画が一覧・直下は現在動いているものだけ、(2) README 進捗ロールアップ表。完了置き場は **`completed/`**（`done/` より説明的・`archive/` は ADR で使用済みかつ「退避」ニュアンスのため避ける）。完了計画の**番号は維持**（00〜05 そのまま・再利用しない＝planning.md と整合）。移動タイミングは**計画群の全 phase 完了時**に `git mv`。
- **`design/` と `roadmap/` の棲み分けを明記する**: `docs/roadmap/` = 実装の**計画・進捗・完了履歴**（mutable WIP・phase 単位・「何をどの順で作るか / 作ったか」）、`docs/design/` = 設計の**俯瞰・なぜ**（現在どう成り立っているか・コードなし explanation）。前者は「やること/やったこと」、後者は「なぜこうなっているか」。各 README 冒頭でこの一行棲み分けを示す。
- **roadmap 改名・完了移動の追従コストと好機**: `docs/plan/` は **72 ファイル/145 ヒット**から参照される（ADR 10・rule 11・learnings 8）。改名と完了移動でパスが変わるため追従が要る。これは §3 の「ADR は可変 plan を参照しない」（adr.md）原則に照らした **ADR 整理の好機** — ADR からの plan 参照を安定 SoT（rule / design）へ寄せれば、追従と原則違反解消が同時に片付く。運用として「計画群の全 phase 完了 → `completed/` へ移動 + 参照追従」を [[planning]] / `finish-phase` に明文化する（renumber 追従チェックリストと同種）。
- **新規 ADR を 1 本起こす**: 「`docs/design/` 新設と、既存 `architecture.md`（規約 spec 正本）・rule・ADR との責務境界、ディレクトリ命名（design 採用・architecture 見送り）、および `docs/plan/`→`docs/roadmap/` 改名と `completed/` 運用」は不可逆な配置決定。arc42 のいう architecturally significant な決定であり、`adr-new` で記録すべき（Diátaxis/arc42/SSOT を Context に引く）。
- **§4.2 を補強**: AGENTS.md 刷新は「公式 <200 行・import はコンテキスト非削減」を根拠に、肥大分を path-scoped rule へ移す方針を明記。
- **§5 の線引きを補強**: シンプル化は **ARID** に従い「正本の重複（実体の二重記述）」を削る。文体上の最小限の言い換えは残してよい（過度な圧縮の歯止め・§5.5 と整合）。

### 9.6 一次ソース

- Diátaxis: https://diataxis.fr/ （特に [reference-explanation](https://diataxis.fr/reference-explanation/) / [map](https://diataxis.fr/map/)）
- arc42: https://docs.arc42.org/home/ （[Section 4](https://docs.arc42.org/section-4/) / [Section 8](https://docs.arc42.org/section-8/) / [Section 9](https://docs.arc42.org/section-9/)）
- C4 model: https://c4model.com/ （[Code 図は永続化しない](https://c4model.com/diagrams/code)）
- Martin Fowler, *Who Needs an Architect?*: https://martinfowler.com/ieeeSoftware/whoNeedsArchitect.pdf
- DRY 原典: https://media.pragprog.com/titles/tpp20/dry.pdf
- Write the Docs（ARID / Unique）: https://www.writethedocs.org/guide/writing/docs-principles/ / [Docs as Code](https://www.writethedocs.org/guide/docs-as-code/)
- Living Documentation（Martraire）: https://www.infoq.com/articles/book-review-living-documentation/
- Anthropic 公式: https://code.claude.com/docs/en/memory / [Skill best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) / [Agent Skills（engineering）](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
