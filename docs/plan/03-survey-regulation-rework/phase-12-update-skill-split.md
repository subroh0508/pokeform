# Phase 12 — 取得スキルを 2 分割（catalog 取得 / regulations 取得）+ catalog 更新チェックポイント

> データレイアウト整備の 3 本目（全種族投入の直前）。現 `survey-regulation` skill は catalog（PokeAPI 構造データ）
> と regulations（Champions 解禁データ）の**両方**を 1 skill で担っている。取得元・更新頻度・情報源が異なる
> 2 系統を**別スキルに分離**し、regulations 取得時に catalog 更新が要るかの**チェックポイント**を設ける。

## 目的 / スコープ

`survey-regulation` の責務を取得元で 2 つに分割する:

- **catalog 取得 skill（新設）**: PokeAPI 由来の reg 非依存データ（構造データ = 種族値/タイプ/特性/dex/category、
  日本語名 ja、技/特性の名前補完）を `catalog/*.yaml` へ転記する。実体は `fetch:data` → `materialize` +
  特性 id 集約。
- **regulations 取得 skill（`survey-regulation` を refocus）**: Champions 解禁データ（roster/legality/per-species
  `moves`/per-game 技メタ/メガ）を Serebii 第一優先で取得し `regulations/champions/*` へ転記する。層1-3
  （決定論スクレイパー + 自己修復）+ `serebii:catalog`。
- **catalog 更新チェックポイント**: regulations 取得が参照する species/move/item/ability id が **catalog 未登録**
  なら、「catalog 取得 skill を先に実行せよ」と促す（`check:regulation` の参照整合エラーを土台に、不足 id を
  列挙して catalog skill へ誘導する手順を regulations skill に明記）。

- スコープ内:
  - `skill-creator` で **catalog 取得 skill**（仮称 `survey-catalog` / `update-catalog`）を新設
    （canonical `.claude/skills/<name>/` + `.agents/skills` symlink・cross-agent パリティ）。
  - `survey-regulation` SKILL.md を Champions 取得に refocus（catalog 取得手順を catalog skill へ委譲・参照に置換）。
  - regulations skill に **catalog 更新要否チェックポイント**手順を追加（不足 id 検出 → catalog skill 実行誘導）。
  - `.claude/rules/data-pipeline.md` / `references/serebii-sourcing.md` の責務分担記述を 2 skill 体制へ更新。
- スコープ外:
  - 機械ゲート（`check:regulation` 等）の新規実装（既存の参照整合を土台にする・再実装しない）。
  - 全種族投入そのもの（後続計画群 06）。catalog/regulations のデータ内容変更。

## 前提（依存）

- **Phase 10 完了**（regulations ゲームグルーピング）・**Phase 11 完了**（技メタ per-game 化）。2 skill の責務境界が
  最終レイアウトに一致している必要がある（catalog = 名前 + 構造データ / regulations/champions = 解禁 + 技メタ）。
- 確定済み: `survey-regulation` 手順（層1-3 → serebii:catalog → fetch:data → materialize → check:regulation →
  generate → verify）。`materialize` は fail-fast で raw 存在担保は skill 責務（ADR 0027）。
- 確定済み rule: [[skill-authoring]] / [[cross-agent]] / [[data-pipeline]]。

## タスク

- [ ] `skill-creator` で catalog 取得 skill を新設（description = trigger・≤500 行・標準構成）。手順 = catalog の
      新規/更新 id について `fetch:data` → `materialize` + 特性 id 集約 → `generate:data` 緑確認。
- [ ] `survey-regulation` SKILL.md を Champions 取得に refocus（catalog 取得の手順4 相当を catalog skill 委譲へ。
      `[catalog skill](...)` へのポインタに置換し二重記述しない）。
- [ ] regulations skill に **catalog 更新チェックポイント**を追加: roster/moves/items/abilities の id で catalog
      未登録があれば列挙し「catalog 取得 skill を先に回す」よう促す手順（`check:regulation` の参照切れ報告を入口に）。
- [ ] `.claude/rules/data-pipeline.md` / `references/serebii-sourcing.md` の責務分担（catalog = PokeAPI 取得 /
      regulations = Champions 取得）を 2 skill 体制へ更新。cross-agent パリティ（canonical + symlink）確認。
- [ ] cross-agent フォールバック明記（Codex/素 CLI は両 skill の手順を逐次実行で完結）。
- [ ] `pnpm verify` 緑（skill/rule 変更のみ・`.workflow` 構文スモークがあれば実行）。

## この Phase で育てるハーネス（rule・skill）

- **新 skill 作成**（catalog 取得・`skill-creator`）+ `survey-regulation` refocus。両 skill とも canonical +
  `.agents/skills` symlink パリティ（[[cross-agent]] / [[skill-authoring]]）。
- `.claude/rules/data-pipeline.md`: 「raw 存在の担保は survey-regulation skill の責務」を 2 skill 体制
  （catalog 取得 skill が PokeAPI 取得を担い、regulations skill がチェックポイントで誘導）へ更新。
- **ADR は判定**: skill の責務分割が「取得元で分ける」運用方針の確立に当たるなら `adr-new` を検討
  （catalog = reg 非依存 PokeAPI / regulations = Champions 解禁の境界。可逆な手順分割なら rule 更新で足りる）。

## 受け入れ基準

- catalog 取得 skill と regulations 取得 skill が分離され、各々 description=trigger・≤500 行・標準構成・
  cross-agent パリティを満たす。
- regulations skill に catalog 更新チェックポイントが手順として存在し、不足 id 検出 → catalog skill 誘導が明記。
- `.claude/rules/data-pipeline.md` / `serebii-sourcing.md` が 2 skill 体制へ追従。`pnpm verify` 緑。

## 検証手順

1. 2 skill の SKILL.md が `skill-authoring` 基準（description=trigger / ≤500 行 / 標準構成）を満たすことを確認。
2. canonical（`.claude/skills/<name>`）と `.agents/skills/<name>` symlink の一致を確認（cross-agent パリティ）。
3. regulations skill の手順に catalog 更新チェックポイントがあり、`check:regulation` 参照切れを入口にした誘導が
   書かれていることを確認。
4. 5 種スモークで「catalog 未登録 id を含む regulations 取得 → チェックポイントが catalog skill 実行を促す」流れを
   ドライランで確認。
5. `pnpm verify` 緑。

## リスク・備考

- **2 skill の境界**: catalog = reg 非依存（PokeAPI: 構造データ + 名前）、regulations = Champions 解禁
  （Serebii: roster/legality/moves/技メタ/mega）。Phase 11 で技メタが regulations 側へ移ったことで境界が
  明快になっている（名前 = catalog / 技メタ = regulations）。
- **チェックポイントは既存ゲートを土台に**: 新規バリデータを実装せず、`check:regulation` の参照整合（catalog 未登録
  id を非0終了で報告）を入口にして「不足 id → catalog skill を回せ」と誘導する手順にする（機械ゲート非再実装・
  [[skill-authoring]]）。
- **全種族投入（後続計画群 06）はこの 2 skill 体制で行う**: catalog skill で PokeAPI 構造データを揃え、regulations
  skill で Champions 全解禁を投入する。チェックポイントが大量投入時の catalog 取りこぼし（特性追記漏れ等）を防ぐ。
- skill 名は仮称。最終名は `skill-creator` 実行時に description=trigger の観点で確定する。
