# code-review チェックリスト（ソース / データパイプライン）

`code-review` skill が参照する観点の実体。共通基準（健全性の純改善・機械ゲート非再実行・指摘フォーマット・
effort・redaction）の SoT は [`.claude/rules/code-review.md`](../../../rules/code-review.md)。

## 目次

1. Google「What to look for」12 観点
2. AI 生成コード固有観点
3. pokeform 固有規約
4. paths × 重点観点
5. auto-merge ゲート（発火条件）

---

## 1. Google「What to look for」12 観点

基準は **「完璧さでなくコード健全性の純改善」**（[Standard of Code Review](https://google.github.io/eng-practices/review/reviewer/standard.html)）。
各観点は機械ゲートで捕れない**意味**を見る（型が通るか等は再チェックしない）。

| # | 観点 | 見るポイント |
|---|---|---|
| 1 | **Design** | 変更が全体設計に整合するか。責務配置・層の分離（types/domain/io/codegen/cli）が妥当か。 |
| 2 | **Functionality** | 仕様どおり動くか。ユーザー / 呼び出し側にとって挙動が妥当か。エッジで壊れないか。 |
| 3 | **Complexity** | 過剰に複雑でないか。今必要のない一般化（over-engineering）をしていないか。 |
| 4 | **Tests** | 変更に見合うテストがあるか。テストが**意味のある境界**を突いているか（数値カバレッジは機械ゲート）。 |
| 5 | **Naming** | 名前が意図を明確に表すか。`XxxBase`/`XxxDex`/`XxxId` 等の規約に沿うか。 |
| 6 | **Comments** | コメントが「なぜ」を説明するか（「何を」はコードで自明にする）。陳腐化していないか。 |
| 7 | **Style** | スタイルは Biome に委譲。**ここで手スタイル指摘をしない**（機械ゲートの責務）。 |
| 8 | **Consistency** | 既存コード・規約と一貫するか。逸脱に正当な理由があるか。 |
| 9 | **Documentation** | 挙動・規約を変えたなら関連 doc / rule / ADR を更新したか。 |
| 10 | **Every Line** | 変更行を一通り読んだか。理解できない行を素通りしない。 |
| 11 | **Context** | 数行だけでなく周辺・ファイル全体の文脈で妥当か。 |
| 12 | **Good Things** | 良い設計・改善は明示的に認める（レビューは指摘専用ではない）。 |

## 2. AI 生成コード固有観点

AI 生成コードは表面品質が高く落とし穴が見えにくい。次を**既定で疑う**:

- **仕様忠実性（precise ≠ plausible）**: もっともらしく見えるが仕様と微妙にずれていないか。要求仕様・
  既存実装・テスト期待値と**一行ずつ**突き合わせる。テストが緑でも仕様逸脱はありうる。
- **エッジ / エラー処理（最頻の見落とし）**: 空入力・境界値（0 / 最大 / 最小）・null/undefined・例外経路を
  扱うか。正常系だけ通して異常系を握りつぶしていないか。
- **セキュリティ（高リスク既定）**: 外部入力の検証・パス操作・インジェクション・秘匿情報。「安全だろう」と
  仮定せず、**安全でない前提**から見る。
- **前提の安全性**: コード中の暗黙の前提（「常に存在する」「必ずソート済み」等）が崩れたときに壊れないか。
- **表面品質の罠**: 整った命名・コメント・構造に引きずられて中身の検証を省かない。
- **正本変更時の全文同期 / doc-data 乖離**: 正本（rule / `architecture.md` / catalog ヘッダコメント等）や用語を
  変更したら、対象語を**全文 grep して離れた箇所の旧モデル残滓・追従漏れ**を潰したか。**ファイル / 識別子の削除を
  伴う変更は `grep -rn <削除名>` を打ち切らず全 hit を追従確認**する。個体・パーティの自然言語コメントが
  regulations / 種族データの変更に追従しているか（機械ゲート外の doc-data 乖離）。→ learning #31 / #40 / #42 / #73。
- **「grep N 件」系 AC の意図的残置除外**: 「全置換完了」を grep 0 件で機械判定する受け入れ基準には、
  **意図的残置（定義引用・作業説明・その語を論じる doc 自身）を除外する規定**が併記されているか。除外なしの
  0 件 AC は false negative（残すべき記述まで「未完了」扱い）を生む。→ learning #40 / #80 / #85。

## 3. pokeform 固有規約

正本は [`architecture.md`](../../../../docs/plan/01-mvp/architecture.md) と各 rule。レビューでは**規約への
適合**を見る（数値の正しさは tsc + テストが担保。ここでは設計・忠実性を見る）。

- **検証は tsc のみ**: 実行時バリデーション（Zod 等）を持ち込んでいないか。不正は YAML/MD → codegen →
  `tsc --noEmit` の**型エラー**で弾く設計か。→ [`tsc-verification`](../../../rules/tsc-verification.md) / ADR 0010。
- **型パターン**: `XxxBase` + `XxxDex` + `XxxId = keyof XxxDex`。種族粒度は「種族値が一意 = 1 種族」。英名 ID
  キー・**構造 specs（name 無し）と名前 languages（`NameEntry`）の直交**・逆引きは languages forward から実行時導出。
  → [`type-conventions`](../../../rules/type-conventions.md) / ADR 0011 / 0035。
- **テスト**: プロダクションコードと**コロケーション**。ドメインは完全網羅・薄い層は明示除外。AI 生成テストの
  **plausible ≠ correct**（期待値が仕様でなく実装をなぞっていないか）。→ [`testing`](../../../rules/testing.md)。
- **ゲーム数値**: Lv50 / 個体値31 固定、能力ポイント 合計66・各 ≤32、性格 ±10%、実数値は**二重 floor**、
  レギュ M 系。HP / 非HP の計算式分岐。→ [`game-spec`](../../../rules/game-spec.md)。
- **データパイプライン**: PokeAPI は vendor 方式（取得 → 整形 → `src/generated/` をコミット、`raw` のみ
  gitignore）。**生成物への手編集混入**を疑う。**PokeAPI を Champions legality（使える技）/ 技メタ（威力等）の
  信頼源にしない**（Champions 非対応・ADR 0026）。技メタ SoT は `move-specs.yaml`（per-game）・名前 SoT は
  `languages/*.yaml`、技の出自は Serebii 第一優先。`generate.ts` / `check:regulation` が `data/raw` learnset・
  raw 技メタへ回帰していないか、specs / languages / per-reg の 3 軸（ADR 0035 / 0036）から逸れていないか疑う。
  → [`data-pipeline`](../../../rules/data-pipeline.md) / ADR 0012 / ADR 0026 / ADR 0035 / ADR 0036。
- **CLI / IO**: 入力言語はファイル単位 `lang: ja|en` 宣言、表示は `--lang`（独立）。問題検出時は**非0終了**。
  外部入力の検証・エラー処理。→ [`cli-and-io`](../../../rules/cli-and-io.md) / ADR 0014。
- **ブランドエラー型**: codegen の診断・エラーが規約の命名・型表現に沿うか。

## 4. paths × 重点観点

変更パスごとにシグナルの高い観点へ集中する（全観点を機械的に当てない）。

| paths | 重点観点 |
|---|---|
| `src/types/**`, `src/generated/**` | `XxxBase`+`XxxDex`+`XxxId=keyof XxxDex` パターン / 種族粒度 / **生成物への手編集混入** |
| `src/codegen/**` | tsc のみ検証方針 / ブランドエラー型命名 / 合計66 を codegen 算出 / **決定性**（同入力 → 同出力） |
| `src/domain/**` | HP/非HP 計算式（二重 floor）/ ポイント 66・各32 / 性格 ±10% / **境界・エラー処理（AI 見落とし最頻）** |
| `src/cli/**`, `src/io/**` | `lang: ja\|en` / `--lang` / 終了コード / **外部入力検証・エラー処理（高 risk 既定）** |
| `**/*.test.ts`, `__fixtures__/` | コロケーション / カバレッジ100% が**境界を突くか** / AI 生成テストの plausible≠correct |
| `scripts/**`, `data/raw\|champions` catalog | data-pipeline 規約 / vendor 方針（取得元 PokeAPI / SoT catalog / materialize 転記）/ **秘匿情報のプレーンテキスト混入・スコープ** |

## 5. auto-merge ゲート（発火条件）

レビューは**提案的**。auto-merge は次の **2 条件がともに揃ったとき**のみ `gh pr merge --auto --merge` を予約する
（[ADR 0017](../../../../docs/adr/0017-semantic-code-review-skills.md) / phase-03 doc）:

1. **server-side CI（`.github/workflows/ci.yml` の `pnpm verify`）が緑** — 機械ゲート。ローカル Git hooks は
   GitHub の merge を gate しないため、CI が required status check として必須。
2. **ブロッキング指摘なし** — 本レビューで `blocking` が 0 件。

どちらかが欠ければ auto-merge は**止まる**。最終 approve は人間（または branch protection の承認ルール）に置く。
この skill 自身は merge を実行しない（指摘までが責務）。auto-merge コマンドの予約は実装ワークフロー
（Phase 11）が担う。
