# Phase 5 — AGENTS.md 刷新

## 目的 / スコープ

陳腐化した AGENTS.md（指示 SoT）を実態へ追従し、**列挙（実体重複）から参照（SoT へポインタ）へ転換**する。Anthropic 公式の「memory は <200 行目標・import はコンテキスト非削減（削減は path-scoped rule で）」を根拠に、肥大分は path-scoped rule へ寄せる。

是正対象（調査レポート §3 高 / §4.2）:
- **コマンド表**: `verify` の中身が古い（`check:yaml-style` 漏れ・順序違い）。`check:party` / `check:individual` / `check:regulation` / `check:yaml-style` / `generate:data` / `fetch:serebii` / `materialize` / `scrape:serebii` / `serebii:catalog` 等が未掲載 → `package.json` scripts に追従、または「正本は package.json」とし要点のみ。
- **skill リスト**: 「レビュー skill・implementation-workflow 等は後続フェーズで追加される」注記が事実と乖離（すべて実装済み）。未列挙 skill が多数 → 列挙から `.claude/skills/` が SoT の参照へ転換し、注記を除去。
- **ディレクトリ説明**: `*-specs.yaml` 総称で 6 種別（species / mega / item / ability / move / type）が隠れる。`languages/` の役割が曖昧 → 粒度調整、または design / rule へポインタ。

スコープ外: rule / skill 本体の文体圧縮（後続計画 08）。本 Phase は AGENTS.md 1 ファイルの刷新。

## 前提（依存）

- Phase 4 完了（`docs/roadmap` 改名・design 確定）。AGENTS.md が参照する docs パスが最終形になっている（再刷新を避ける）。

## タスク

- [ ] コマンド表を現行 `package.json` scripts に追従（または「正本は package.json」とし `pnpm verify` / `typecheck` 等の要点のみ残す）。
- [ ] skill 節を列挙から参照（`.claude/skills/` が SoT）へ転換。「後続フェーズで追加」注記を除去し、現行 skill の実態に合わせる。
- [ ] ディレクトリ説明の粒度調整（specs 6 種別・languages の役割を明示、または `docs/design/data-pipeline.md` へポインタ）。
- [ ] CLAUDE.md = `@AGENTS.md` の SoT 原則を維持（規約本文を CLAUDE.md へ再掲しない）。<200 行目標で点検。
- [ ] cross-agent パリティ確認（AGENTS.md は Codex ネイティブ / Claude は CLAUDE.md 経由・[[cross-agent]]）。

## この Phase で育てるハーネス（rule・skill）

- AGENTS.md（指示 SoT）の刷新。rule / skill は変更しない（参照先として現状維持）。

## 受け入れ基準

1. AGENTS.md のコマンド表が `package.json` scripts と整合（または package.json を正本とし要点参照）。
2. skill 節が `.claude/skills/` 参照へ転換され、「後続フェーズで追加」等の陳腐化注記がない。実在しない / 未列挙 skill の乖離がゼロ。
3. ディレクトリ説明が specs 6 種別・languages を正しく示す（または design へポインタ）。
4. AGENTS.md 内のリンク・skill 名がすべて実在へ解決（`ls .claude/skills/` と突合）。
5. `pnpm verify` 緑。`harness-review` でセルフレビュー済み。

## 検証手順

1. `cat package.json | jq '.scripts'` と AGENTS.md コマンド表を突合（差分ゼロ or 参照化）。
2. `ls .claude/skills/` と AGENTS.md skill 言及を突合（未列挙・架空ゼロ）。
3. AGENTS.md の行数を確認（肥大なら path-scoped rule へ寄せる検討）。

## リスク・備考

- AGENTS.md は両ツール（Claude / Codex）の指示入口。誤記は両方に波及する。skill 名・コマンド名は `ls` / `package.json` で実在確認してから書く。
- 「参照化」しすぎて入口の自己説明性を失わない線を守る（入口に必要な要点は残す）。
