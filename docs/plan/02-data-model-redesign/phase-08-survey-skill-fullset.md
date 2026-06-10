# Phase 8 — `survey-regulation` skill の全量 materialize 手順を定型化（harness）

## 目的 / スコープ

Phase 7 で人手で実行した「**Serebii を第一優先**に、レギュ M-A の (a) 各種族の使用可能技 **全件**、
(b) 解禁持ち物 **全件** を取得し、catalog / per-reg へ materialize する」一連の手順を、**レギュ情報更新時に
routine 実行できる定型手順**として `survey-regulation` skill に組み込む。現状の skill はソース突き合わせと投入の
大枠（[[data-pipeline]] / ADR 0021）は持つが、(1) Serebii を一次ソースとする優先順位、(2) curate ではなく
**全 learnable 技を全量** materialize する方針、(3) 投入前に PokeAPI learnset へプログラム照合して覚えない技を
排除する前段、が手順として明文化されていない。Phase 9（小データセット検証投入）と Phase 10（全量投入）が
この定型手順を再利用できるよう、skill を拡張する。

- スコープ内:
  - `survey-regulation` skill（canonical `.claude/skills/survey-regulation/SKILL.md`）の手順を拡張し、次を明文化する:
    - **Serebii 第一優先**: Serebii Champions 図鑑（`serebii.net/pokedex-champions/<species>/`）と
      アイテムページ（`serebii.net/pokemonchampions/items.shtml`）を主ソースにし、Game8 等は補助・件数検証に回す
      （メモリ `serebii-first-priority-champions-data` の方針を skill に固定化）。
    - **curate ではなく全量 materialize**: 各種族の `moves` は手選びサブセットではなく **Serebii Champions ページの
      全 learnable 技を全量**投入する（Phase 7 で確立した方針を恒久化）。
    - **PokeAPI learnset ∩ Serebii の差異の扱い**: Serebii 全量を起点に、PokeAPI learnset に無い技の扱い
      （version_group 差異・過去世代限定技・`overrides.yaml` 補正）を判断基準として記録する。
    - **投入前のプログラム照合（check:regulation 前段）**: per-reg YAML 投入後 `check:regulation` を通す前に、
      `data/raw` の learnset へプログラム照合して覚えない技を機械的に洗い出す段を明示する。
  - 手順の routine 化（レギュ更新時に同じ順序で再実行できる形）。Serebii ページ URL パターン・件数検証の所作を記す。
- スコープ外:
  - データの実投入そのもの（Phase 9 = 3 種小データセット / Phase 10 = 全量投入が担う）。本 phase は **skill 改修のみ**。
  - 機械ゲート（型 / カバレッジ / Biome）・`check:regulation` ロジックの再実装（既存に委譲・[[skill-authoring]]）。
  - 新 CLI / 新 rule の追加（既存 skill 手順の明文化に留める）。

## 前提（依存）

- **Phase 7（現ロスター持ち物・技 正確化）完了**（マージ済み）。人手で実行した materialize 手順が `survey-regulation`
  改修の素材として揃っている（`ma-roster-source.md` Phase 7 節が出典記録の参考形）。
- **Phase 6（generate 変換専任 + `check:regulation`）完了**。skill が委譲する authoring ゲートが確立済み。
- 確定済み rule: [[data-pipeline]] / [[cli-and-io]] / [[skill-authoring]] / [[cross-agent]]。
- メモリ方針: `serebii-first-priority-champions-data`（Serebii 第一優先）。

## タスク

- [ ] `skill-creator` skill で `survey-regulation` を改修する（手書きで SKILL.md を起こさない・[[skill-authoring]]）。
- [ ] 手順に **Serebii 第一優先**の主ソース指定を追加（Champions 図鑑 `pokedex-champions/<species>/` / アイテムページ
      `pokemonchampions/items.shtml`・Game8 等は補助・件数検証）。
- [ ] 各種族 `moves` は **curate せず全 learnable 技を全量** materialize する方針を明文化（Phase 7 の恒久化）。
- [ ] **PokeAPI learnset ∩ Serebii の差異**の判断基準（version_group 差異・過去世代限定技・`overrides` 補正）を記す。
- [ ] **投入前プログラム照合**（`check:regulation` 前段で learnset へ機械照合し覚えない技を排除）の段を追加。
- [ ] 解禁持ち物 **全件**（一般持ち物 + きのみ + 該当メガストーン）を Serebii アイテムページから取得する所作を記す。
- [ ] cross-agent パリティを確認（canonical `.claude/skills/survey-regulation/` + `.agents/skills/survey-regulation`
      symlink が同一実体を指す・[[cross-agent]]）。
- [ ] `description`（trigger）が「全量 materialize / Serebii 第一優先 / レギュ更新時 routine」を含み under-trigger
      しないことを確認。

## この Phase で育てるハーネス（rule・skill）

- **skill**: `survey-regulation`（canonical + symlink）を `skill-creator` で改修。SoT は skill 本体。Serebii 第一優先・
  全量 materialize・learnset 照合前段を手順として固定化する。
- **rule**: 既存 [[data-pipeline]] / [[cli-and-io]] への参照を保つ（仕様の二重記述はしない）。新 rule は追加しない。
- メモリ `serebii-first-priority-champions-data` の方針を skill 手順へ反映（追従漏れがないこと）。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑（skill 改修は src を触らないため等価維持）。
- `survey-regulation` skill 手順に、(1) Serebii 第一優先の主ソース指定、(2) 全 learnable 技の全量 materialize、
  (3) PokeAPI learnset ∩ Serebii 差異の扱い、(4) 投入前 learnset プログラム照合（`check:regulation` 前段）、
  (5) 解禁持ち物全件取得、が明文化されている。
- cross-agent パリティが保たれている（canonical + symlink 一致・機械ゲートを skill 内で再実装していない）。
- `description` が全量 materialize / Serebii 第一優先 / レギュ更新時 routine を含み trigger 精度が落ちていない。
- `harness-review` のレビューで重大な指摘（trigger 精度 / SoT 一貫性 / cross-agent 整合 / ゲート二重化）が無い。

## 検証手順

1. 改修後 SKILL.md を読み、5 つの明文化項目（Serebii 第一優先 / 全量 / 差異の扱い / learnset 照合前段 / 持ち物全件）が
   揃っていることを確認。
2. `ls -l .agents/skills/survey-regulation` で symlink が canonical を指していることを確認（copy フォールバック時はパリティ）。
3. `pnpm verify` 緑を確認（skill 改修で機械ゲートが壊れていないこと）。
4. `harness-review` skill で skill 改修 PR をレビューし指摘を解消。

## リスク・備考

- **harness PR**: 本 phase は skill 資産の改修のみで src を触らない。レビューは `code-review` ではなく `harness-review` を使う
  （[[cross-agent]] / [[skill-authoring]]）。PR テンプレは `.github/PULL_REQUEST_TEMPLATE/harness.md`。
- **本文 ≤500 行 / progressive disclosure**: 手順詳細が膨らむ場合は `references/` へ分離する（[[skill-authoring]]）。
  Serebii URL パターン・件数検証の所作が長くなるなら reference 化を検討。
- **機械ゲートを再実装しない**: learnset 照合の「前段」は手順としての所作（`data/raw` を引いて差分を洗う指針）であり、
  検出の本体は `check:regulation`（ADR 0023）に委譲する。skill 内に検証ロジックを書かない。
- skill が materialize 方針を固定化することで、Phase 9 / Phase 10 が同じ手順で再現でき、レギュ更新（M-B 以降）でも
  routine 実行できる。
