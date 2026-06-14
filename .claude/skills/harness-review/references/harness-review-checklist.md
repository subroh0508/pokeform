# harness-review チェックリスト（ハーネス資産 = エージェント指示）

`harness-review` skill が参照する観点の実体。共通基準（健全性の純改善・機械ゲート非再実行・指摘フォーマット・
effort・redaction）の SoT は [`.claude/rules/code-review.md`](../../../rules/code-review.md)。各観点に**文献根拠**を
併記する（未知ケースへ汎化させるため「ルール + なぜ」で書く）。

## 目次

1. skills 観点（Agent Skills 公式）
2. AGENTS.md / CLAUDE.md 観点
3. rules 観点（context engineering）
4. 共通観点（cross-agent / redaction / ゲート二重化）
5. paths × 重点観点
6. auto-merge ゲート（発火条件）

---

## 1. skills 観点（Agent Skills 公式）

根拠: [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) /
[Equipping agents with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)。

- **`description` = 「何を + いつ」を三人称**で書く。理由: description は skill 起動の主たる判定材料。「いつ使うか」が
  なければ呼ばれるべき場面で呼ばれない（under-trigger）。少し "pushy" に書いて under-trigger を避ける。
- **≤1024 字・XML タグ不可**。description の機械的制約。超過・XML 混入は blocking。
- **progressive disclosure（本体 ≤500 行）**。長い手順・観点は `references/` に分離する。理由: 本体が肥大すると
  毎回の文脈を圧迫し、シグナルが薄まる。→ [[skill-authoring]]。
- **「ルール + なぜ」を優先し `ALWAYS`/`NEVER`/`MUST` の羅列を避ける**。理由: 理由づきのルールは未知ケースへ汎化
  するが、命令の羅列は文面どおりの状況でしか効かない。
- **allowed-tools 最小権限**。レビュー skill のように「指摘のみ」なら書込ツールを与えない（read-only + git/gh 参照）。
  理由: 過剰な権限は事故と誤用の面積を広げる。

## 2. AGENTS.md / CLAUDE.md 観点

根拠: [agents.md](https://agents.md/) / [How to write a great agents.md（GitHub Blog）](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/) /
[Writing a Good AGENTS.md（Phil Schmid）](https://www.philschmid.de/writing-good-agents)。

- **短さ（目安 ≤300 行）**。指示の信頼上限は ~150–200。詰め込むと全体が希釈される。詳細は別ファイルへ**ポインタ化**。
- **普遍的でない指示を混ぜない**。一部ファイルにしか効かない規約は path-scoped rule（`.claude/rules/*`）へ。理由:
  常時ロードの指示に局所規約を混ぜると、無関係な場面でノイズになり信頼度が落ちる。
- **スタイル規約は linter/formatter（Biome）に委譲**し指示に書かない。理由: 機械が強制できるものを指示に書くと
  二重管理になり、エージェントの注意を浪費する。
- **SoT 一貫性**: `AGENTS.md` = 指示 SoT（実体）/ `CLAUDE.md` = `@AGENTS.md` を import する**薄いアダプタ** +
  Claude 固有注記のみ。規約を `CLAUDE.md` 本文へ再掲していないか（二重管理）。→ [[cross-agent]]。
- **decision table と 3–10 行の実コード片**で曖昧さを解消しているか。「詰まったら確認を求める」が明示されているか。

## 3. rules 観点（context engineering）

根拠: [Effective context engineering for AI agents（Anthropic）](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)。

- **paths スコープの過不足**。`paths` frontmatter が広すぎると無関係な場面で常時ロードされ希釈、狭すぎると必要な
  場面でロードされない。変更対象ファイル群と paths が噛み合うか。
- **既存 rule と非矛盾**。新 rule が既存 rule と衝突・重複していないか。重複は SoT を二つにする。
- **right altitude（Goldilocks ゾーン）**。ハードコード過ぎ（脆い）でも曖昧過ぎ（無力）でもない高さか。
- **要点再記述 + 正本ポインタ**。仕様詳細は `architecture.md` 等の正本に置き、rule からは参照する。最小の
  高シグナルトークン集合になっているか。
- **rules-index は生成物**。`docs/harness/rules-index.md` は `paths` から `scripts/gen-rules-index.ts` で生成。
  手編集の混入を疑う（[[cross-agent]]）。

## 4. 共通観点（cross-agent / redaction / ゲート二重化）

- **クロスエージェント整合（canonical + symlink パリティ）**: skill は `.claude/skills/<name>/`（canonical 実体）+
  `.agents/skills/<name>`（相対 symlink `../../.claude/skills/<name>`）。symlink の指す先が正しいか、copy
  フォールバック時は両側が一致するか。**最重要観点**（ずれると Codex 側だけ壊れる）。→ [[cross-agent]] / ADR 0016 / 0017。
- **redaction**: `docs/harness/` 配下（learning 等）への書き出しで Secrets / 最小 PII が `[REDACTED-*]` 化されて
  いるか。生の token・個人メールが残っていないか。→ [[redaction]]。
- **ゲート二重化チェック**: skill / hook / CI が機械ゲート（型 / テスト / lint）を**再実装**していないか。既存の
  `pnpm verify` / `.githooks/` の再利用になっているか。→ ADR 0013。
- **設定値の妥当性・秘匿情報非混入**: `.claude/settings.json` / `.githooks/` の権限・実行前提・設定値が妥当で、
  秘匿情報がプレーンテキストで混ざっていないか。

## 5. paths × 重点観点

| paths | 重点観点 |
|---|---|
| `.claude/rules/**` | paths スコープ過不足 / 既存 rule 非矛盾 / 要点再記述 + `architecture.md` ポインタ / right altitude |
| `.claude/skills/**`, `.agents/skills/**` | description=「何を + いつ」三人称・under-trigger 回避（≤1024字・XML不可）/ ≤500行・progressive disclosure / 「ルール + なぜ」（`ALWAYS/NEVER` 羅列回避）/ **canonical+symlink パリティ** / allowed-tools 最小権限 |
| `AGENTS.md`, `CLAUDE.md` | 短さ（≤300行目安）・普遍的でない指示の混入なし・スタイルは linter 委譲 / SoT 一貫性（AGENTS=指示 SoT / CLAUDE=`@AGENTS.md` 薄アダプタ）/ 詳細はポインタ化・32KiB 意識 |
| `.githooks/**`, `.claude/settings.json`, `.claude/hooks/**` | **ゲート二重化していないか** / 実行権限前提 / 設定値の妥当性・秘匿情報非混入 |
| `docs/plan/**`, `docs/adr/**`, `docs/harness/**` | phase テンプレ準拠 / 相互参照（前提節）の整合・dangling なし / ADR 採番・supersede 規約 / learning の redaction / 生成物（rules-index）の手編集 / **renumber を含む plan PR は番号整合を機械確認**（`git grep "Phase N"` は**計画ディレクトリ内に限定せず cross-plan = リポジトリ全体**を走査し、他計画 doc / rule / skill からの参照まで dangling を点検 / 表・mermaid・散文の素の番号・完了済み phase の forward 参照まで全 hit 追従 / README リンクが実在ファイルに解決 / ADR・rule リンクは slug を実体照合）。手順 SoT は [[planning]] の「phase の insert/renumber 追従チェックリスト」 |

## 6. auto-merge ゲート（発火条件）

レビューは**提案的**。auto-merge は次の **2 条件がともに揃ったとき**のみ `gh pr merge --auto --merge` を予約する
（[ADR 0017](../../../../docs/adr/0017-semantic-code-review-skills.md) / phase-03 doc）:

1. **server-side CI（`.github/workflows/ci.yml` の `pnpm verify`）が緑** — 機械ゲート（required status check）。
2. **ブロッキング指摘なし** — 本レビューで `blocking` が 0 件。

どちらかが欠ければ auto-merge は**止まる**。最終 approve は人間（または branch protection の承認ルール）に置く。
この skill 自身は merge を実行しない。auto-merge コマンドの予約は実装ワークフロー（Phase 11）が担う。
