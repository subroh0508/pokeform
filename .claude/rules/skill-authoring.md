---
paths:
  - ".claude/skills/**"
  - ".agents/skills/**"
description: skill の新規作成・改修は `skill-creator` skill の利用を必須化する方針（手書きで SKILL.md を起こさない・description=trigger・≤500 行・標準構成・canonical + symlink 配置）。.claude/skills/ や .agents/skills/ を扱うとき適用する。
last_modified: "2026-06-26T00:00:00+09:00"
adr:
  - "ADR 0016"
---

# skill 作成の規約

skill（SKILL.md）はエージェントの挙動を左右するプロンプト資産。品質がぶれるとトリガ精度・保守性が落ちるため、作成・改修の手順を標準化する。**本 rule がこの規約の SoT**。

## `skill-creator` の利用を必須化

**skill の新規作成・改修は `skill-creator` skill を使う。手書きで SKILL.md を起こさない。** `skill-creator` に以下を担保させる:

- **`description` = trigger**: 「何を + いつ」を三人称で書き、under-trigger を避ける（呼ばれるべき場面で呼ばれない事故を防ぐ）。
- **本文 ≤500 行**。長い詳細は `references/` へ分離（progressive disclosure）。
- **説明型で書く**: 「ルール + なぜ」を優先し、`ALWAYS` / `NEVER` の羅列を避ける。
- **標準構成**: 役割 / 入力 / 出力 / Gotchas / 関連。

> **`skill-creator` が無い環境のフォールバック**: 本リポジトリにプロジェクト固有の `skill-creator` が無い場合（グローバル汎用版は scaffolding 用途で本規約に最適化されていない）は、**本 rule の基準を直接適用して SKILL.md を編集してよい**。不在を理由に着手を止めない。品質基準（description=trigger / ≤500 行 / progressive disclosure / 説明型 / 標準構成 / canonical+symlink パリティ）は本 rule が SoT で、`skill-creator` はその自動化手段に過ぎない。

## 配置（cross-agent 共有）

- canonical 実体を **`.claude/skills/<name>/SKILL.md`** に置く。
- `.agents/skills/<name>` を **相対 symlink `../../.claude/skills/<name>`** にして Codex と共有する（symlink 不可環境のみ copy フォールバック）。配置・パリティの SoT は [[cross-agent]]。

## Workflow スクリプト（`.workflow`）の配置と検証

skill が **Claude 固有の Workflow**（多段オーケストレーション）を持つ場合の規約（SoT）。この規約は撤去済みの survey-regulation スクレイパー層2-3 で導入した経緯を持つ（[ADR 0031](../../docs/adr/archive/0031-deterministic-serebii-scraper-hybrid-layers.md)（archive）・learning #98 / #100）が、Workflow を持つ将来 skill にも適用する一般規約として残す（現時点で `.workflow` を持つ skill は無い）:

- **配置**: `.claude/skills/<name>/workflows/*.workflow`（canonical skill 配下・`.agents/skills` symlink 経由で Codex からも辿れる）。`Workflow({ scriptPath: ".claude/skills/<name>/workflows/<file>.workflow" })` で呼ぶ。
- **機械ゲート除外**: `.workflow` は未知拡張子で、`biome.json` の `files.ignoreUnknown: true` により Biome 対象外。型チェック・カバレッジの対象にもならない。**機械ゲートに乗らない**前提で最低限の構文ネットを手元で張る。
- **軽量スモーク構文検証**: `.workflow` は `export const meta` + top-level await + 注入グローバル（`agent` / `parallel` / `pipeline` 等）で書かれ、そのままでは `node --check` が通らない。**body を `async function` でラップした一時 `.mjs` へ写して `node --check`** すれば、ランタイム無しで構文崩れ（括弧・カンマ・到達不能）を検出できる（`pnpm verify` の再実装ではなく、ゲート対象外資産への最小ネット）。
- **cross-agent フォールバック**: Workflow は Claude 固有のため、Codex / 素の CLI では層1（テスト済み純関数 + npm script）の**逐次実行 + 人手**へ縮退する。正しさは層1 に宿り Workflow は最適化に過ぎないことを skill 本文で明示する（[[cross-agent]]）。`.workflow` 同士（層2↔層3）の返り値契約はテスト固定できないため、変更時は `harness-review` で shape 整合を点検する。

## 何を書き / 書かないか

- skill には**手順とトリガ**を書く。仕様の細部（数値・型パターン）は正本（各 rule / `src/`）に置き、skill からは**参照**する。
- **機械ゲート（型 / テスト / lint）やレビュー観点を skill 内で再実装しない**。既存の `pnpm verify` / Git hooks / レビュー skill を**再利用**する。
- 決定論的・小規模な手順 skill では eval 駆動の重い反復は簡素化してよい（`skill-creator` の重い検証は任意）。

## 圧縮（文体シンプル化）PR の規約

rule / skill の**意味・trigger 精度・安全性記述を保ったまま冗長を削る**圧縮 PR は、踏み外すと根拠脱落・trigger 劣化・dangling を生む。下記を守る（plan 07 の rules/skills 圧縮で反復した learning #161-166 を集約）:

- **一次指標は冗長量（重複した実体）で、生の行数ではない**。可読性のため行が増えること自体は許容する（行数だけで圧縮判断しない）。「何行削る」目標は逐語再掲・重複分に限り、手順 skill の操作手順・安全 Gotchas は削減対象外。
- **trigger 句は圧縮 PR で変更しない**（trigger の意味変更は別 PR）。本文 wrap 整形で description の trigger 語句を欠落させない。description の capability を本文へ移すときも、対応する**検索面の trigger 語句は description に残す**（capability 脱落で under-trigger になるのを防ぐ）。
- **learning / ADR / PR 番号が「その判断の唯一の根拠」なら削除しない**。複数行に反復する冗長な番号羅列のみ末尾の集約行へ寄せ、集約先へ番号が漏れなく移ったか確認する（追跡可能性とのトレードオフ）。
- **ポインタ化（references / rule へ委譲）した内容は、参照先に行レベルで実在するか自己点検する**。dangling の機械チェックを超えて「移動先実体が同等か」を確認する（リンクは解決するが内容が痩せている死角を防ぐ）。例セクションは本文で再現可能なら削除可、出力フォーマット等の再現困難な具体像は references へ退避する。
- **多数ファイル一括圧縮では横断整合を `git grep` で確認する**。ある資産で削った根拠が他資産の引用先になっていないか（片肺脱落）を点検する。
- **散在する不変条件は末尾の「唯一の正本」へ集約し、各節はそこを参照する**形を推奨する（手順 SoT 兼任で本文が肥大するのを防ぐ）。
- 圧縮 PR の独立レビューは [[harness-review]]（ハーネス資産）で「圧縮系 PR の保護対象 / リンク非劣化」観点を点検する。

## セルフチェック（SKILL.md 作成・改修後に確認）

機械ゲートで捕れない skill 固有の事故を防ぐため、編集後に次を確認する（理由づき）:

- **参照の実在確認**: ADR / rule / ファイルへのリンクは `ls` / grep で**実在を確認してから**書く。`[[wikilink]]` は実在する rule / memory の slug のみ（dangling 防止・learning #42/#58）。推測でファイル名を書かない（ADR は採番が紛らわしく slug を取り違えやすい）。**コードシンボル（関数 / dex / 型名・例 `ItemNotHoldableBy`）も `git grep` で実装 SoT に実在確認する**（tsc は doc 内の架空シンボルを捕れず、`reverseEn` のような実在しない名前が紛れ込む・learning #133 / #135 / #139 反復）。
- **ファイル参照は markdown リンク**: skill 内のファイル参照は `[表示名](./path)` で書く。`[[...]]` は rule / memory 名の wikilink 専用で、ファイルパスに使わない（記法の混同を避ける）。
- **`description` は文字数で ≤1024**: 日本語は 3 バイト/字で `wc -c`（バイト数）が誤判定する。**文字数**（rendered）で 1024 以内を確認する。
- **cross-agent パリティ**: canonical（`.claude/skills/<name>`）と `.agents/skills/<name>` symlink（または copy）が一致し、`references/` も symlink 経由で参照できるか（[[cross-agent]]）。
