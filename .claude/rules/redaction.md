---
paths:
  - "docs/harness/**"
description: docs/harness/ 配下（特に learnings）へ書き出す前に Secrets / 最小 PII を `[REDACTED-*]` へ置換する規約と正規表現。
---

# redaction — Secrets / PII の `[REDACTED-*]` 置換規約

`docs/harness/` 配下（主に `learnings/`）へ生成物を書き出す**前**に、PR diff / レビューコメント / CI ログから混入し得る **Secrets と最小限の PII** を `[REDACTED-<種別>]` へ置換する。`pr-retrospective` / `harness-meta` skill はファイル生成前に本規約を適用する。

> learning の構造は [`retrospective-format.md`](./retrospective-format.md) を参照。

## ルール（なぜ）

- learning は**コミットされ共有される**ため、書き出し**前**に必ず置換する（一度入った Secret は履歴に残る）。
- **Secrets 中心 + 最小 PII**: トークン・鍵・資格情報を最優先。PII はメール程度に絞り、過剰なマスキングで可読性を損なわない（pokeform は OSS 規模で業務 PII を扱わない）。
- 置換は **`[REDACTED-<種別>]`** 形式に統一し、何がマスクされたか種別で追える。
- 誤検出より**見逃しが危険**。迷う高エントロピー文字列は redact する。

## 置換種別と正規表現

検出パターン（ECMAScript 正規表現・`g` フラグ前提）と置換後トークン:

| 種別 | 置換トークン | 正規表現（目安） |
|---|---|---|
| GitHub PAT | `[REDACTED-GH-TOKEN]` | `\bgh[pousr]_[A-Za-z0-9]{36,}\b` |
| AWS Access Key | `[REDACTED-AWS-KEY]` | `\b(?:AKIA\|ASIA)[0-9A-Z]{16}\b` |
| JWT | `[REDACTED-JWT]` | `\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b` |
| OpenAI / sk 系 key | `[REDACTED-API-KEY]` | `\bsk-[A-Za-z0-9_-]{20,}\b` |
| Slack token | `[REDACTED-SLACK-TOKEN]` | `\bxox[baprs]-[A-Za-z0-9-]{10,}\b` |
| Google API key | `[REDACTED-GOOGLE-KEY]` | `\bAIza[0-9A-Za-z_-]{35}\b` |
| Private key block | `[REDACTED-PRIVATE-KEY]` | `-----BEGIN (?:RSA \|EC \|OPENSSH \|DSA \|PGP )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA \|EC \|OPENSSH \|DSA \|PGP )?PRIVATE KEY-----` |
| Bearer ヘッダ値 | `Bearer [REDACTED-TOKEN]` | `\bBearer\s+[A-Za-z0-9._-]{16,}\b` |
| `key=value` 形式の秘匿値 | `<key>=[REDACTED-SECRET]` | `(?i)\b(api[_-]?key\|secret\|token\|password\|passwd\|pwd\|access[_-]?key\|client[_-]?secret)\b\s*[:=]\s*["']?[^\s"']{8,}["']?` |
| 汎用高エントロピー hex/base64（32+桁） | `[REDACTED-SECRET]` | `\b[A-Fa-f0-9]{32,}\b` / `\b[A-Za-z0-9+/]{40,}={0,2}\b` |
| メールアドレス（PII） | `[REDACTED-EMAIL]` | `\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b` |

> **適用順**: 具体的な種別（PAT / AWS / JWT 等）を先に置換し、汎用の高エントロピー / `key=value` パターンを最後に適用する（取りこぼし用の網）。private key は複数行 `[\s\S]` でブロックごと置換。

## 例外・誤検出の扱い

- **コミット SHA**（40 桁 hex）は learning の正規項目なので `commit <sha>` 文脈では redact しない（汎用 hex パターン適用時は SHA 行を除外）。
- 公開 URL・PokeAPI 等の外部公開エンドポイントは redact 不要。
- bot のコミット署名メール（`noreply@anthropic.com` 等の公開アドレス）は文脈上必要なら残してよいが、**人間の個人メール**は `[REDACTED-EMAIL]` にする。

## 検証例（受け入れ基準 5）

入力 `contact: alice@example.com / GH_TOKEN=ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 / Authorization: Bearer abcdef0123456789abcdef` → 置換後 `contact: [REDACTED-EMAIL] / GH_TOKEN=[REDACTED-SECRET] / Authorization: Bearer [REDACTED-TOKEN]`（`ghp_…` は GitHub PAT パターンにも合致するため `[REDACTED-GH-TOKEN]` でも可。`key=value` 網が先に当たれば `[REDACTED-SECRET]`。いずれも生の値がファイルに残らないことが要件）。
