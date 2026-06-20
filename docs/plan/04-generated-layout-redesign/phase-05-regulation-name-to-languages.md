# Phase 5 — レギュ名 `name:{ja,en}` を `data/languages/` へ移し名前 SoT を一本化

## 目的 / スコープ

`m-*/index.yaml` に period と同居している **レギュ名 `name:{ja,en}`**（plan 04 Phase 2 で「languages 列挙の
例外」として意図的に残した同居）を `data/languages/` へ移し、**名前 SoT を完全に languages へ一本化**する。
これにより「名前はすべて languages・構造はすべて specs」の直交が例外なく成立する。

- スコープ内:
  - **新 `data/languages/regulations.yaml`**（reg id→`{ ja, en }`・block）を追加し、`m-a` / `m-b` のレギュ名を移す。
  - `m-*/index.yaml` から `name` を**除去**（`period` のみ残す）。
  - `scripts/generate.ts`: languages 集約に `regulations` を追加し、`regulationDex` の `name` を **languages 由来**で
    合成（`languages/regulations.ts` → `regulationNames`）。`languages/index.ts` 集約に追加。
  - 型レイヤ（`src/types/regulation.ts` 等）: `RegulationBase.name` の由来を languages forward に揃える
    （名前は specs/per-reg dex に持たせない）。
  - consumer（レギュ名を表示・参照する箇所）を languages 由来へ。逆引き（ja→reg id）が要るなら languages
    forward から導出。
  - `check:regulation` の予約キー `RESERVED_REGULATION_KEYS`（現 `name`/`period`/`items`）と schema 検証を
    新構成（index.yaml は `period`（+ `items` 等）のみ・`name` 不在）へ追従。
- スコープ外: 生成物の配置（Phase 4）。items の型 legality（Phase 6）。レギュ名の文言変更。

## 前提（依存）

- **Phase 4 完了**（生成物が `src/generated/` 配置・パス安定）。
- ADR 0035（名前 SoT を languages へ）の射程。[[type-conventions]] / [[data-pipeline]]（名前 SoT = languages）。

## タスク

- [ ] `data/languages/regulations.yaml` を新規作成（`champions-m-a` / `champions-m-b` → `{ ja, en }`・block）。
- [ ] `m-a/index.yaml` / `m-b/index.yaml` から `name` を除去（`period` 等のみ残す）。
- [ ] `scripts/generate.ts`: `languages/regulations.ts`（`regulationNames`）を emit、`languages/index.ts` 集約に追加、
      `regulationDex` の `name` を languages 由来で合成。
- [ ] `src/types/regulation.ts` ほか型の `name` 由来を languages forward へ。`RESERVED_REGULATION_KEYS` から
      `name` を外す（schema が index.yaml の `name` 不在を許容）。
- [ ] レギュ名を参照する consumer を languages 由来へ更新。
- [ ] `pnpm generate:data` → `pnpm check:regulation data/champions` → `pnpm verify` 緑。

## この Phase で育てるハーネス（rule・skill）

- [[data-pipeline]] / [[type-conventions]] の「名前 SoT = languages（レギュ名を含む例外なし）」追従。
- レギュ名所在の移動が ADR 0035 の本質（名前 SoT を languages へ）の**射程内の精緻化**か、追補が要る独立判断かを
  見極め、必要なら `adr-new`（ADR 0035 追補注記）。判断は finish-phase で促す。

## 受け入れ基準

- `data/languages/regulations.yaml` がレギュ名 SoT になり、`m-*/index.yaml` に `name` が無い。
- `pnpm generate:data` が決定論的に出力し、`regulationDex[R].name` が languages 由来で解決される（値不変）。
- `pnpm check:regulation data/champions` が 0 終了（`name` 不在の index.yaml を schema が許容）。
- `pnpm verify`（型 / カバレッジ100% / Biome / `check:yaml-style`）が緑。
- `node src/cli/index.ts check:party <party.md>` でレギュ名表示が従来どおり（値不変）。

## 検証手順

1. `pnpm generate:data` 後、`src/generated/.../languages/regulations.ts`（`regulationNames`）が出力され、
   `regulationDex` の `name` が languages 由来で合成されることを確認。
2. `m-*/index.yaml` に `name` キーが無いこと（`grep -n "^name" data/champions/m-*/index.yaml` が 0）。
3. `pnpm check:regulation data/champions` 0 終了・`pnpm verify` 緑。
4. CLI でレギュ名表示が Before/After で不変。

## リスク・備考

- **値を変えない**（所在移動のみ）。レギュ名の ja/en 文言は現 index.yaml の値をそのまま languages へ移す。
- レギュ名は plan 04 Phase 2 時点で「languages 列挙の例外」として **意図的に** index.yaml に残された
  （ADR 0035 / index.yaml コメント）。本 phase はその例外を解消する精緻化であり、ADR 0035 の決定の本質
  （名前 SoT を languages へ）と整合する。所在再決定が ADR 級と判断したら ADR 0035 追補を起票する。
- `RESERVED_REGULATION_KEYS` から `name` を外すと、index.yaml に `name` を書いても予約キー扱いされなくなる。
  schema/参照整合（`check:regulation`）が `name` 不在を正しく許容するか回帰確認する。
