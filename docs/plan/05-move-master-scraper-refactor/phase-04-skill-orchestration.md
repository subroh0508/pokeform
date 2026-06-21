# Phase 4 — survey-regulation オーケストレーター化（情報種別ごとに分割し本体は実行調整に専念）

## 目的 / スコープ

肥大した `survey-regulation` skill（roster / 種族の全技 / 持ち物 / メガ / 技メタの手順が1スキルに統合）を、**情報種別
ごとに分割**して `survey-regulation` 本体を**オーケストレーターに徹させる**。本体は「どの取得をどの順で実行するか」の
調整に専念し、各データ種別の取得手順はサブスキル / Workflow / references へ委譲する。Phase 2-3 で技マスター取得が独立
経路化・スクレイパーが役割分割されたのを受け、skill 層でも役割を揃える。

- スコープ内:
  - **情報種別ごとの分割**: roster 確定 / 種族が覚える技の一覧 / **技マスター（新・Phase 2 由来）** / 持ち物 を独立単位
    に切り出す。mega（ADR 0033 で決定論自動著述）・move-meta（ADR 0035・旧 ADR 0034 で per-game 移設）は機械化済みのため非分割。
  - **`survey-regulation` SKILL.md を骨子へ縮減**し、詳細を `references/` へ progressive disclosure。本体はオーケストレー
    ション手順（実行順・チェックポイント・各取得の呼び分け）に絞る。
  - サブスキル化 or Workflow 呼び分けのどちらかを Phase 1 確定方針で実装。`update-catalog` との責務分離（PokeAPI 構造
    データ vs Serebii 解禁データ）は維持。
  - **cross-agent パリティ**: canonical（`.claude/skills/*`）+ `.agents/skills/*` symlink の一致・Workflow 不可環境では
    層1 逐次へ縮退して同一成果。`skill-creator` で作成・改修。
- スコープ外: 取得経路・スクレイパーの実装（Phase 2-3 で完了）。全種族投入（XX）。新しいデータ種別の追加。

## 前提（依存）

- **Phase 2-3 完了**（技マスター専用取得経路の実装・スクレイパー役割分割が済み、skill が委譲すべき実装単位が確定）。
- 既存 rule: [[skill-authoring]] / [[cross-agent]] / [[data-pipeline]]。skill は `skill-creator` で改修
  （手書きしない）。Workflow 配置は `.claude/skills/<name>/workflows/*.workflow`。
- 関連 skill: [`update-catalog`](../../../.claude/skills/update-catalog/SKILL.md)（PokeAPI 構造データ・責務分離維持）。

## タスク

- [ ] `skill-creator` で `survey-regulation` を情報種別ごとに再編。roster / 覚える技の一覧 / 技マスター / 持ち物 を独立
      単位として、サブスキル化 or Workflow 呼び分け（Phase 1 確定方針）で実装。
- [ ] `survey-regulation` SKILL.md を骨子（オーケストレーション手順）へ縮減し、各データ種別の詳細・情報源・DOM 仕様を
      `references/` へ分離（progressive disclosure・本文 ≤500 行）。
- [ ] 技マスター取得（Phase 2）を skill 手順に組み込み、`update-catalog`（PokeAPI）との責務分離を維持。catalog 更新
      チェックポイントを保つ。
- [ ] cross-agent パリティを確認（canonical + `.agents/skills` symlink 一致・`references/` も symlink 経由で解決・
      Workflow 不可環境の層1 逐次フォールバックを本文明記）。`.workflow` があれば軽量スモーク構文検証。
- [ ] データパイプライン構造・取得手順の変更を [[data-pipeline]] / `docs/plan/01-mvp/architecture.md` /
      [`serebii-sourcing.md`](../../../.claude/skills/survey-regulation/references/serebii-sourcing.md) へ追従。
- [ ] `survey-regulation` でレギュレーション取得を一通り実行し、サブスキル / Workflow 呼び分けが機能することを実証。

## この Phase で育てるハーネス（rule・skill）

- `survey-regulation` skill の再編（オーケストレーター化）+ 必要なら情報種別ごとのサブスキル新設（canonical +
  `.agents/skills` symlink・`skill-creator`）。[[data-pipeline]] / `serebii-sourcing.md` の取得手順記述を追従。
  `harness-review` で description trigger / cross-agent 整合 / SoT 一貫性を点検対象にする。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome / `check:yaml-style`）が緑（skill 改修自体は機械ゲート対象外だが、
  付随するコード変更があれば緑）。
- `survey-regulation` がオーケストレーターへ再編され、roster / 覚える技の一覧 / 技マスター / 持ち物 が独立単位として
  呼び分けられる。SKILL.md 本文が骨子へ縮減され詳細が `references/` へ分離されている（本文 ≤500 行）。
- cross-agent パリティが保たれる（canonical + symlink 一致・層1 逐次フォールバックで Codex も同一成果・`references/`
  解決）。`update-catalog` との責務分離が維持されている。
- `survey-regulation` でレギュレーション取得が end-to-end で機能する。

## 検証手順

1. `survey-regulation` SKILL.md の行数・構成を確認（骨子 ≤500 行・詳細は `references/`）。description trigger が
   「何を + いつ」で書かれているか確認。
2. canonical（`.claude/skills/survey-regulation`）と `.agents/skills/survey-regulation` symlink の一致を確認
   （`ls -la` / 内容 diff）。`references/` が symlink 経由で解決することを確認。
3. `.workflow` があれば body を `async function` ラップした一時 `.mjs` で `node --check`（軽量スモーク構文検証）。
4. `survey-regulation` でレギュレーション取得を実行し、各情報種別の取得 + `update-catalog` 委譲 + `verify` が回ることを
   実証。`harness-review` で skill 変更を点検。

## リスク・備考

- **過分割を避ける**: mega（ADR 0033）・move-meta（ADR 0035・旧 ADR 0034）は既に機械化済みで、サブスキル化しても効果が薄い。独立
  効果がある roster / 覚える技の一覧 / 技マスター / 持ち物 に絞り、skill 数の増えすぎでオーケストレーションが複雑化
  しないようにする（SKILL.md の references 分離で十分なら無理にサブスキルを増やさない）。
- **cross-agent パリティが要点**: Workflow は Claude 固有。Codex / 素の CLI では層1（テスト済み純関数 + npm script）の
  逐次へ縮退して同一成果を出す、を各 skill 本文で明示する（[[cross-agent]]）。`.workflow` 同士の返り値契約は
  `harness-review` で shape 整合を点検。
- **機械ゲートを skill 内で再実装しない**（[[skill-authoring]]）。検証は `verify` / `generate:data` /
  `check:regulation` へ委譲する。
