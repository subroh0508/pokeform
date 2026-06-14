---
id: 0033
status: Accepted
date: 2026-06-14
---

# 0033. Serebii メガ関連データを決定論で自動著述する

## Context

[ADR 0031](./archive/0031-deterministic-serebii-scraper-hybrid-layers.md) は Champions 解禁データ取得を決定論
スクレイパー + ハイブリッド3層へ刷新したが、その役割分離の一部として「**メガ linking（megaLinks / メガ種族 id /
per-reg `mega`）は Serebii のメガ名（`Mega Garchomp`）が catalog のメガ id 規約（`garchomp-mega`）へ決定論変換
できないため自動化せず authoring 層へエスカレーションする**」と決めていた。

その後の実データ検証で、この前提は **base slug 既知を前提にすれば誤り**と判明した。`serebii-to-catalog` は処理中の
種族 slug（base）を引数で受け取っており、メガ名から**枝サフィックス（`""` / `"X"` / `"Y"`）だけ**を拾えば
`<baseSlug>-mega[-x|-y]` を決定論で組める（base 表示名をパースしないので en≠slug の地域フォルムでも破綻しない）。
catalog の既存 `megaLinks` 命名規則とも一致する。手動 linking のままだと、クリーンスレート / 新レギュの全量
スクレイプ時にメガが落ち、手当漏れでメガ消失する運用リスクが残る。

## Decision

**Serebii のメガ form 名から、メガ関連データを決定論で自動著述する**。`src/codegen/serebii/to-catalog.ts` の
純関数 `megaSpeciesId(baseSlug, megaName)`（+ ストーン用 `megaStoneSpeciesId` / 集約 `megaAuthoring`）が
`<baseSlug>-mega[-x|-y]` を導出し、`scripts/serebii-to-catalog.ts` が **append/既存尊重**で
`megaLinks` / メガ先種族エントリ（en のみ・構造は `materialize` が後埋め）/ per-reg 種族下 `mega[]` /
メガストーンの `megaSpecies`（[ADR 0031] のストーン→メガ先 `megaStoneFor` とは別の、ストーン→メガ**形態**
リンク）を著述する。

`Mega ` 接頭の無い特殊形（Primal 等）・catalog id 形にならない未知 id だけは**自動著述せず escalation**
（diagnostic）に残す（`normalize.ts` の `normalizeAgainstCatalog` と同思想・誤 id 注入防止）。決定論で確実な
ものだけを自動化する。これにより [ADR 0031](./archive/0031-deterministic-serebii-scraper-hybrid-layers.md) の
「メガ linking は手動」サブ決定を **supersede** する。0031 のハイブリッド3層スクレイパー・役割分離・cheerio
採用・Serebii 第一優先という他の決定はそのまま本 ADR に引き継ぎ、メガ linking のみ自動著述へ改める。仕様の
詳細は [[data-pipeline]] と
[`serebii-sourcing.md`](../../.claude/skills/survey-regulation/references/serebii-sourcing.md)。

## Consequences

- **良い点**:
  - クリーンスレート / 新レギュの全量スクレイプでメガが `megaLinks` / per-reg `mega[]` / `megaEvolvesTo` /
    `megaSpecies` まで自動再構築され、手動 linking の取りこぼし（メガ消失）が構造的に防げる。
  - メガ id 導出がテスト済み純関数（カバレッジ100%）になり、件数・帰属が機械判定できる。正しさが層1（cross-agent
    共有 npm script）にあるため Codex / 素の CLI でも同じ結果に収束する。
  - メガ先 catalog id = PokeAPI pokemon slug のため `fetch:data` / `materialize` / `generate` は無改修
    （実機 404 チェックで slug 一致を担保）。
- **悪い点 / コスト**:
  - メガ名のサフィックス規約（`""` / `X` / `Y`）に依存する。3 文字目以降の枝など未知パターンが将来現れたら
    escalation に落ちる（自動著述しない安全側）。
  - メガストーンの `megaSpecies` 導出はストーン id の `-x` / `-y` サフィックスに依存する（X/Y 区別）。
- **トレードオフ / 留意点**:
  - Primal 等 `Mega ` 接頭の無い特殊形は引き続き authoring 層へ escalation する（決定論で確実なものだけ自動化）。
  - 自動著述は append/既存尊重で、既存の skill-authored 値を上書きしない（冪等・2 回流して関連ファイルの
    git diff が空）。

## Alternatives Considered

- **メガ linking を手動のまま維持（ADR 0031 の前提）**: 実データで base slug 既知前提なら決定論変換が成立すると
  判明したため却下。手動維持はクリーンスレート / 全量スクレイプでのメガ消失リスクを残す。
- **base 表示名をパースしてメガ id を組む**: en≠slug の地域フォルムで破綻するため却下。base slug は呼び出し側が
  既知で渡せるので、メガ名からは枝サフィックスのみ拾う設計が頑健。
- **メガ id を全て自動著述（Primal 等も含む）**: 非 `Mega ` 形・未知 id で誤 id を注入するリスクが高いため却下。
  決定論で確実なものだけ自動化し、残りは escalation に残す。
