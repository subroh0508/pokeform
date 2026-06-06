# 0001. アーキテクチャ決定を ADR として記録する

- **Status**: Accepted
- **Date**: 2026-06-07

## Context

pokeform はコーディングエージェント（Claude Code / Codex）が繰り返し実装していく前提のプロジェクトであり、「なぜそう決めたか」が時間とともに失われると、エージェントも人間も過去の判断を誤って覆しやすい。仕様の詳細は `docs/plan/01-mvp/architecture.md` と `.claude/rules/*` が正本として保持するが、それらは「現在どうなっているか（What）」を記すもので、「なぜそうしたか・何を捨てたか（Why）」の履歴は残らない。

技術選定・パターン・不可逆なトレードオフを伴う決定を、後から追跡できる**不変の連番ログ**として残す仕組みが必要になった。広く確立された Markdown ADR 形式を採用し、特定の社内事情に依存しない汎用運用に限定する。

## Decision

重要なアーキテクチャ決定を `docs/adr/NNNN-<slug>.md` に連番で記録する。各 ADR は `# NNNN. <タイトル>` / Status / Context / Decision / Consequences（+ 任意で Considered Options）を持つ（`docs/adr/template.md`）。採番・supersede 手順・「いつ書くか」は `docs/adr/README.md` と `.claude/rules/adr.md` を正本とし、新規作成は `adr-new` skill で行う。

## Consequences

- **良い点**: 決定の「なぜ」が連番ログとして残り、後続フェーズ（Docker・Git hooks・ツールチェーン等）で決定をその場で ADR 化できる（バックフィル不要の「決めてから作る」流れ）。
- **悪い点 / コスト**: 決定ごとに ADR を書く軽い手間が増える。記録漏れを防ぐ運用規律が要る。
- **トレードオフ / 留意点**: ADR は「なぜ」の記録に徹し、仕様の詳細は重複させない（正本は architecture.md / rules）。Accepted の ADR は書き換えず、覆す場合は新 ADR + 旧 Status 更新（追記のみ）とする。
