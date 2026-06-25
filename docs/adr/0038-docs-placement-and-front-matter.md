---
id: 0038
status: Accepted
date: 2026-06-26
---

# 0038. docs/design 新設・front matter 規約とドキュメント配置・roadmap 改名の責務境界

## Context

pokeform のドキュメントは plan 進行（00〜）の積み重ねで「ドリフト債務」を抱えている:

- 規約 spec の正本（`docs/plan/01-mvp/architecture.md`）が plan 配下に置かれ、「完了済み plan の一成果物」に見えるため、進捗に左右されない設計俯瞰の置き場として誤読される。過去に消滅した型例などが「現状事実」として残り陳腐化する。
- ゲーム仕様・型表現・テスト方針が規約 spec と `.claude/rules/*` の双方に実体記述され、仕様変更のたびに二重更新が要る（ドリフト死角）。
- `docs/plan/` は「計画」と「進捗」の両義で、設計俯瞰（なぜ・どう成り立つか）の置き場と語感が衝突する。

ドキュメント構成の権威ある文献（Diátaxis の 4 象限 / arc42・C4 の抽象度分離 / DRY・ARID / Anthropic 公式の SoT 一意化）は独立に同一の原則へ収束する: **知識の種類ごとに正本（SoT）を一意化し、他層はそれを再記述せず参照する（point, don't repeat）**。この原則を配置規約として確定し、後続の不可逆な構造変更（ディレクトリ新設・改名・ファイル撤去・front matter 付与）の判断基準にする。これらは「なぜ」を失うと誤って覆されやすく不可逆ゆえ、本 ADR で先に確定する。

## Decision

知識の種類ごとに正本を一意化する配置マトリクスを採用し、次を確定する。

### 1. 配置マトリクス（知識の種類 → 正本 → 他層は参照）

| 知識の種類 | 正本（SoT） | 象限 |
|---|---|---|
| 型・スキーマ・数式・閾値そのもの | `src/`（tsc / カバレッジ100% / `check:*` が機械保証） | — |
| 規約・具体値・契約 | `.claude/rules/*`（1 rule = 1 正本） | Reference |
| 手順・チェックリスト | `.claude/skills/*` | How-to |
| 設計の俯瞰・なぜ・データフロー・層の責務 | `docs/design/*`（**コードなし**） | Explanation |
| いつ・なぜ決めたか・捨てた代替案 | `docs/adr/*`（不変ログ） | Explanation |
| 指示の入口・常時保持すべき事実 | `AGENTS.md`（+ `CLAUDE.md` は import アダプタ） | — |

他層は正本を**再記述せず参照（リンク / シンボル名）**する。

### 2. docs/design/ を新設する

設計の俯瞰（目的・設計意図・データフロー図・責務分担・保証する不変条件の自然言語記述・トレードオフ）を `docs/design/` に置く。**TypeScript の具体コードを書かない**（C4「Code レベルは永続ドキュメント化しない」の直接適用）。型・スキーマ・数式・YAML キー・CLI フラグの SoT は `src/` 実装 + path-scoped rule にあり、各 design ファイル末尾の「実装 SoT ポインタ」節で実装へ誘導する。design に持たせるのは「乖離しにくいもの」だけにする。

責務境界を次のとおり言い切る: **design = Explanation の俯瞰（コードなし・可変スナップショット） / rule = Reference の規約・具体値 / ADR = 不変ログ（いつ・なぜ決めたか） / src = 型・数式の機械保証 SoT**。

### 3. ディレクトリ名は design とする

設計俯瞰の置き場は `docs/design/` とし、`architecture/` は採らない。計画・進捗の置き場は `docs/roadmap/` とする。

### 4. docs/plan/ を docs/roadmap/ へ改名し completed/ を運用する

`docs/plan/` を `docs/roadmap/` へ改名する。完了した計画群は `docs/roadmap/completed/` へ集約し、**番号は維持**（再採番しない）、**移動タイミングは計画群の全 phase 完了時**とする。これにより `design`（なぜ・俯瞰）と `roadmap`（何をどの順で・進捗）で語が分かれ、語感衝突が解消する。

### 5. front matter 規約（design・rules とも last_modified + adr）

`docs/design/` 配下と `.claude/rules/` 配下の Markdown は、ともに front matter に `last_modified`（ISO8601 形式の日時）と `adr`（関連 ADR の配列）を持つ。

design 配下のスキーマ:

```yaml
---
last_modified: "2026-06-21T00:00:00+09:00"
adr:
  - "ADR 0001"
  - "ADR 0002"
---
```

rules 配下のスキーマ（既存 `paths` / `description` に追加する）:

```yaml
---
paths:
  - "src/**"
description: "…既存の説明…"
last_modified: "2026-06-21T00:00:00+09:00"
adr:
  - "ADR 0010"
---
```

Claude の rules 自動ロードは `paths` のみを参照するため、`last_modified` / `adr` は**独自キーとして許容**され、`scripts/gen-rules-index.ts` の `paths` 解釈と**非干渉**である（rules-index 再生成が成功することを確認する）。

### 6. design と ADR の二重化を避ける

design と ADR はともに Explanation 象限のため二重化しやすい。**design は決定根拠（なぜ決めたか）を再記述せず、ADR を要約・索引するに留める**。front matter の `adr` キーがこの索引を機械的に補強する。役割分担を `design` = 現在どう成り立っているか（可変スナップショット）、ADR = いつ・なぜ決めたか（不変ログ）と固定する。

## Consequences

- **良い点**:
  - 知識の種類ごとに正本が一意になり、仕様変更時の二重更新（ドリフト死角）が消える。
  - 設計俯瞰が plan 進捗から独立し、「完了 plan の成果物」という誤読がなくなる。
  - front matter の `last_modified` / `adr` で、読み手・ツールが最終更新と決定根拠 ADR へ即たどれる。
  - design がコードを持たないため、型・数式の変更で design が陳腐化しない（乖離源を src / rule に一元化）。
- **悪い点 / コスト**:
  - 規約 spec の分割・撤去、`docs/plan` → `docs/roadmap` 改名、大量の inbound 参照張り替え、全 rule への front matter 付与という一過性の移行コストが発生する。
  - front matter の `last_modified` は手動更新のため、更新忘れで鮮度がずれうる（機械強制はしない）。
- **トレードオフ / 留意点**:
  - design は「可変スナップショット」ゆえ厳密な最新性を機械保証しない。正確さが要る値は必ず src / rule（機械ゲート下）を正本とし、design はそこへ誘導する。
  - 本 ADR は不変ログ。後続で配置が微修正されても本文は書き換えず、必要なら新 ADR で supersede する（[ADR 方針](../../.claude/rules/adr.md)）。

## Alternatives Considered

- **`architecture/` 命名案** — 却下。architecture は「構造の正確な仕様（reference）」を連想させ、コードなし俯瞰（Explanation）の置き場として誤誘導する。さらに `docs/adr/`（Architecture Decision Records）と語が衝突する。
- **rule 全寄せ案（design を作らない）** — 却下。設計俯瞰（Explanation）を rule（Reference 象限）へ混ぜると「1 rule = 1 正本」が崩れ、規約と俯瞰が同居して読み手の象限が曖昧になる。
- **規約 spec を 2 ファイルに割るだけの案** — 却下。plan 配下に残す限り「完了 plan の成果物」誤読と plan 進捗依存は解消せず、コード混在による陳腐化も残る。テーマ別に Explanation 象限へ昇格させる必要がある。
- **front matter を持たない案** — 却下。最終更新（鮮度）と決定根拠 ADR への追跡手段が失われ、design ↔ ADR の二重化を防ぐ機械的な索引（`adr` キー）も得られない。
