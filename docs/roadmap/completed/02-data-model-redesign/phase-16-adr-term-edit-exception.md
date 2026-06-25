# Phase 16 — ADR 不変ログの「用語整備の例外」確立

## 目的 / スコープ

`adr.md` は「Accepted の ADR は本文を書き換えない」を原則とし、例外は**可変な plan ファイル参照の遡及除去**
（phase-11 で codify した hygiene）だけを許している。一方、後続 phase-18 で `hand-authored → skill-authored`
の**用語 rename を ADR 本文（0025 / 0026 / 0027）へも適用**したい。これは決定内容を一切変えない純粋な表記の
言い換えだが、現行 `adr.md` の文面では本文編集が許されず、phase-18 が宙に浮く。

本 Phase は、`adr.md` に **「決定の本質を変えない用語 rename（表記の言い換え）も、plan 参照除去と同様の
整備例外として許可する」** を追記し、phase-18 の ADR 本文 rename を**正規化**する。あわせて `adr.md` 既存の
英語「hygiene」表記を平易な日本語「整備」へ言い換えて用語を揃える。この方針変更そのものを**新規 ADR**で
記録する（不変ログ運用の決定）。

- スコープ内:
  - `.claude/rules/adr.md` に整備例外（用語 rename）を追記。許可範囲を「機械的・意味保存の言い換えに限る・
    決定文や理由の書き換えは不可・逐一確認」と明示し、不変ログの価値を損なわない線引きを残す。
  - `adr.md` 内の既存「hygiene」表記を「整備」へ言い換え（plan 参照除去の例外説明も同じ語に統一）。
  - **新規 ADR 起票**（`adr-new`・採番は現状最大 0028 の次 = 0029 想定）: 「決定本質を変えない用語 rename を
    ADR 本文の整備例外として許可する」決定。Context に phase-11 の plan 参照除去例外の延長であることを書く。
- スコープ外:
  - 実際の `hand-authored → skill-authored` 置換そのもの（**phase-18** が担う）。本 Phase は**許可の確立のみ**。
  - データ運用方針（skill 著述・人間直編集 NG）の決定（**phase-17**）。

## 前提（依存）

- なし（土台 Phase）。phase-17 と**並行着手可**。
- 踏襲する前例: phase-11（ADR の可変 plan 参照除去 + `adr.md` codify）で確立した整備例外の論理。
- 確定済み rule: [[adr]] / [[cross-agent]]。

## タスク

- [ ] `.claude/rules/adr.md` の「Status と supersede」付近の整備例外節に、**用語 rename（決定本質不変の表記
      言い換え）を整備例外として許可**する記述を追記。許可範囲（機械的・意味保存・逐一確認）と非許可
      （決定文 / 理由の書き換え）の線引きを明記。
- [ ] `adr.md` 既存の「hygiene」表記を「整備」へ言い換え（用語統一）。
- [ ] `adr-new` で新規 ADR を起票（採番は skill に委譲・active + archive を走査した最大 + 1）。Context に
      phase-11 例外の延長である旨、Decision に許可範囲、Consequences に「不変ログの追跡可能性は維持される
      （rename は決定を変えない）」を記す。
- [ ] 検証フェーズ実施（下記「検証手順」）。

## この Phase で育てるハーネス（rule・skill）

- **rule 追従**: [[adr]]（整備例外に用語 rename を追加・「hygiene」→「整備」言い換え）。
- **ADR**: `adr-new` で 1 本起票（不変ログ運用の決定）。本文に可変 plan 参照（phase 番号 / OVERVIEW リンク）を
  書かない（[[adr]] 自身の規約）。
- skill 改修なし。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- `.claude/rules/adr.md` に「用語 rename を整備例外として許可」が明記され、許可範囲（機械的・意味保存・
  逐一確認）と非許可（決定 / 理由の書き換え）の線引きがある。
- `adr.md` 内に英語「hygiene」表記が残らない（「整備」へ統一）。
- 新規 ADR が連番（0028 の次）で作成され、Context が phase-11 例外の延長として書かれている。
- `harness-review` 観点（SoT 一貫性・クロスエージェント整合）で blocking なし。

## 検証手順

1. `adr.md` の整備例外節に用語 rename の許可と線引きが入っていることを確認。
2. `grep -n hygiene .claude/rules/adr.md` が 0 件（言い換え漏れなし）。
3. 新規 ADR の採番が active（`docs/adr/*.md`）+ archive 走査の最大 + 1 であることを確認（[[adr]] の採番規約）。
4. `pnpm verify` 緑を確認。`harness-review` で点検。

## リスク・備考

- **不変ログを緩めすぎない**: 例外は「決定を変えない機械的 rename」に厳に限定する。決定文・理由・Alternatives の
  書き換えは引き続き禁止（覆すときは supersede + 新 ADR）。これを線引きとして ADR・rule の双方に残す。
- phase-18 はこの例外に**依拠**して ADR 本文を編集する。本 Phase が先行しないと phase-18 の ADR 本文 rename が
  規約違反になるため、依存順（16 → 18）を守る。
- ADR 本文は可変 plan ファイル（phase doc / phase 番号 / OVERVIEW リンク）を参照しない（[[adr]]）。
