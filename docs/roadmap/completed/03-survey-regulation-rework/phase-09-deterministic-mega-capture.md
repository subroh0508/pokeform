# Phase 9 — メガ関連の決定論自動取り込み（手動 linking 撤廃）

> survey-regulation の動作確認で判明したギャップの是正。決定論スクレイパーは mega form 名を抽出済みなのに
> `serebii-to-catalog` が warn だけで**捨てており**（ADR 0031「mega 名→catalog id は決定論変換できない」前提）、
> クリーンスレート / 新レギュではメガが手動著述しないと再構築されない。実データ検証で**決定論変換は成立する**と
> 判明したため、自動取り込みへ刷新し ADR 0031 を一部 supersede する。

## 目的 / スコープ

スクレイプ済みの mega form 名から、メガ関連データ（`megaLinks` / メガ先種族エントリ / per-reg `mega[]` /
メガストーンの `megaSpecies`）を**決定論で自動著述**する。base slug は既知なので、メガ名の枝サフィックス
（`""`/`"X"`/`"Y"`）だけ拾えば `<baseslug>-mega[-x|-y]` が組める（base 表示名をパースしないので en≠slug の
地域フォルムでも破綻しない）。

- スコープ内:
  - `src/codegen/serebii/to-catalog.ts`（純関数・カバレッジ100%対象）: `megaSpeciesId(baseSlug, megaName)` 等の
    決定論変換を追加。未知 id は自動著述せず diagnostic に残すガード（`normalize.ts` の `normalizeAgainstCatalog` と
    同思想・誤 id 注入防止）。Primal 等 `Mega ` 接頭の無い形は escalation。
  - `src/codegen/serebii/to-catalog.test.ts`: fixture テスト（X/Y 複数メガ・単一メガ・メガ無し・未知 id ガード）。
  - `scripts/serebii-to-catalog.ts`: warn-only を **append/既存尊重の自動著述**へ置換 — `megaLinks`（sortedUnion で
    append-only）/ メガ先種族エントリ（id/枠のみ・構造は materialize が後埋め）/ per-reg 種族下 `mega[]`（既存種族
    保護ロジックと整合）/ メガストーンの `megaSpecies`（Phase 7 で新設したストーン→メガ形態リンク・X/Y 対応）。
- スコープ外:
  - `fetch:data` / `materialize` / `generate.ts` の改修（メガ先 catalog id = PokeAPI slug のため無改修見込み・
    実機 404 チェックで担保）。
  - メガストーンの `megaStoneFor`（base 逆参照）は維持・触らない。
  - M-A 全種族の実投入（後続計画群 09）。

## 前提（依存）

- **Phase 7 完了**（`ItemBase.megaSpecies` フィールドと型接続が存在すること）。本 phase はそのフィールドを
  新規スクレイプ分へ自動付与する。
- 確定済み: メガ関連の保持場所（catalog `megaLinks` / メガ先種族エントリ / `items.megaStoneFor` / per-reg `mega[]`）と
  generate の写し（`megaEvolvesTo` / regulation `mega`）。メガ先の技プールは base 継承
  （[ADR 0024](../../../adr/0024-mega-moves-inherit-base.md)）。
- 確定済み rule: [[data-pipeline]] / [[testing]] / [[cross-agent]] / [[skill-authoring]]。

## タスク

- [x] `src/codegen/serebii/to-catalog.ts`: `megaSpeciesId(baseSlug, megaName)`（"Mega <Base>"→`<slug>-mega`、
      "Mega <Base> X/Y"→`<slug>-mega-x`/`-y`）+ ストーン用 `megaStoneSpeciesId` + 集約 `megaAuthoring` を純関数で追加。
      未知 id ガード（catalog id 形でなければ `null`）・Primal escalation（`Mega ` 接頭なしは `null`）。
- [x] `src/codegen/serebii/to-catalog.test.ts`: fixture（charizard=X/Y・garchomp=単一・メガ無し・Primal escalation・
      未知 id ガード）で網羅（カバレッジ100%維持）。
- [x] `scripts/serebii-to-catalog.ts`: warn-only を自動著述へ置換 — `megaLinks` / メガ先種族エントリ（en のみ）/
      per-reg `mega[]` / メガストーン `megaSpecies`（`itemCatalogFields` 経由）を append/既存尊重で書く。
- [x] クリーンスレート検証: committed HTML fixture（charizard=X/Y・garchomp）から `scrape:serebii` で中間 JSON を起こし、
      使い捨てレギュへ `serebii:catalog` を通すと per-reg `mega[]`=`[charizard-mega-x, charizard-mega-y]`、`megaLinks` /
      メガ先エントリ / メガストーン `megaSpecies`（floettite→floette-mega 等）が自動著述されること、既存 authored 状態では
      git diff が空（冪等）であることを確認。`charizard-mega-x/-y`・`garchomp-mega` が PokeAPI で HTTP 200（404 なし）を実機確認。
- [x] `pnpm verify` 緑。**冪等**（authored 状態で再著述 → 関連ファイル git diff 空）を確認。

## この Phase で育てるハーネス（rule・skill）

- **新 ADR** で [ADR 0031](../../../adr/archive/0031-deterministic-serebii-scraper-hybrid-layers.md) の「メガ linking は手動」
  決定を supersede（決定論変換可能と判明）。`adr-new` で採番し 0031 を `Superseded by ...` にして archive へ退避。
- **`.claude/skills/survey-regulation/SKILL.md`**: 手順5（手動メガ linking）を「per-reg `mega[]` 確認に縮小」へ、
  Gotchas「メガ linking は手動」を改訂。`references/serebii-sourcing.md` / `.claude/rules/data-pipeline.md` の
  該当記述も追従。cross-agent パリティ（canonical + symlink）を確認。

## 受け入れ基準

- クリーンスレートから決定論パイプラインを通すと、メガが `megaLinks` / per-reg `mega[]` / `megaEvolvesTo` /
  `megaSpecies` まで**自動で再構築**される（手動著述なしでメガが落ちない）。
- **冪等**: 2回流して関連ファイルの git diff が空。`pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- ADR 0031 が supersede され archive へ退避・新 ADR がアクティブ。SKILL.md / references / rule の追従済み・
  cross-agent パリティ維持。

## 検証手順

1. 20種クリーンスレートで `serebii:catalog` 後、`catalog/species.yaml` の `megaLinks` と
   `regulations/champions-m-a.yaml` の該当種族 `mega[]`、`items.yaml` の `megaSpecies` が自動著述されることを確認。
2. `fetch:data`→`materialize`→`generate:data` 後、`megaEvolvesTo` がメガ先を指し、`charizard-mega-x/-y` の
   構造データが埋まることを確認。
3. 同じ取得をもう一度流して関連ファイルの `git diff` が空（冪等）。
4. `check:regulation` 0 終了・`pnpm verify` 緑を確認。

## リスク・備考

- 「Serebii mega 名→catalog id は決定論変換できない」という ADR 0031 / SKILL の前提は、base slug 既知を前提に
  すれば**誤り**（catalog 既存 megaLinks の命名規則と一致）。本 phase はこれを supersede するが、Primal 等
  `Mega ` 接頭の無い特殊形・未知 id は自動著述せず escalation に残し、決定論で確実なものだけ自動化する。
- メガ先 catalog id = PokeAPI pokemon slug のため `fetch:data`/`materialize`/`generate` は無改修見込みだが、
  実機で 404 が無いことを必ず確認する（slug 一致の最終担保）。
- 本 phase 完了で後続計画群 09（M-A 全データ投入）の全量スクレイプ時にメガが自動取り込みされ、手動 linking の
  取りこぼし（メガ消失）を防げる。
