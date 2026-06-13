# Phase 9 — 小データセット検証投入（garchomp / charizard / gengar の 3 種）

## 目的 / スコープ

Phase 8 で定型化した `survey-regulation` skill を使い、**まず 3 種だけ**（`garchomp` / `charizard` / `gengar`）の
**全 Serebii movepool** と、**M-A 解禁持ち物プール全件**（一般持ち物 + きのみ + 該当メガストーン）を投入し、
データ更新パイプライン（catalog 追記 → `fetch:data` → `check:regulation` → `generate:data` → `verify`）が
**本格スケール**（各種族60〜70技規模・持ち物100件超）で通ることを**小データセットで先に確認**する。これにより
次の Phase 16（全186種）を de-risk する。全件投入は**やらない**（スコープ外）。

- スコープ内:
  - Phase 8 の skill 手順で 3 種（garchomp / charizard / gengar）の **全 Serebii movepool** を確定・出典付き記録
    （`ma-roster-source.md` に「Phase 9」節を追記）。**投入前に Serebii Champions ページで再確認し、PokeAPI
    learnset へプログラム照合**して覚えない技を排除する。
  - **M-A 解禁持ち物プール全件**を `catalog/items.yaml` へ append-only 追記し、`regulations/champions-m-a.yaml` の
    `items` 予約キーへ全量反映する（一般持ち物30 + きのみ27 + 3 種に必要なメガストーン）。
  - 追加で参照する技 / 持ち物 / メガストーンの id を各 catalog へ append-only 追記。3 種の `megaLinks`
    （charizard → mega-x/mega-y、garchomp → mega、gengar → mega）と per-reg `mega[]` を整合させる。
  - `regulations/champions-m-a.yaml` の 3 種キー下 `moves` を Serebii 全量（各60〜70技規模・block 記法）で投入。
  - `fetch:data`（追加 slug 取得）→ `check:regulation` 0 終了 → `generate:data` 再生成 → `verify` 緑。
- スコープ外:
  - **3 種以外の種族追加・全186種の全量投入**（Phase 16 が担う）。現ロスター26種（Phase 7）の moves 再投入もしない。
  - 非解禁持ち物（`life-orb` / `assault-vest` / `rocky-helmet` / `choice-band` / `choice-specs`）の `items` への投入
    （Serebii リストに無し・catalog からは append-only で消さない）。
  - スキーマ / generate / skill の変更（Phase 5〜6 / Phase 8 で確定済み）。

## 前提（依存）

- **Phase 8（`survey-regulation` skill 全量 materialize 手順の定型化）完了**。本 phase はその定型手順を**最初に
  使う実投入**であり、手順の実用性を 3 種で検証する。
- **Phase 7（現ロスター持ち物・技 正確化）完了**。garchomp / charizard は現ロスター26種に含まれる場合があり、
  既存キーの moves を Serebii 全量へ拡張する（重複種族キーを作らない）。
- 確定済み rule: [[data-pipeline]] / [[cli-and-io]] / [[type-conventions]] / [[testing]]。
- メモリ方針: `serebii-first-priority-champions-data`（Serebii 第一優先）。

## タスク

- [ ] Phase 8 の skill 手順で 3 種の全 Serebii movepool を確定し `ma-roster-source.md` に「Phase 9」節で出典付き記録。
- [ ] 3 種の movepool を **Serebii Champions ページで再確認** → `fetch:data` 取得済み `data/raw` の learnset へ
      **プログラム照合**し、覚えない技を排除（差異は出典 doc に記録）。
- [ ] M-A 解禁持ち物全件（一般持ち物30 + きのみ27 + 該当メガストーン）の **PokeAPI item slug を正確に確認**し
      `catalog/items.yaml` へ append-only 追記（メガストーンは `megaStone` メタ付与）。
- [ ] 3 種の技 / メガストーン / 特性 id を各 catalog へ append-only 追記（特性追記漏れ = 生成エラーに注意）。
- [ ] `catalog/species.yaml` の 3 種に `megaLinks` 配列を付与（charizard → 2 メガ・garchomp / gengar → 1 メガ）。
- [ ] `regulations/champions-m-a.yaml`: 3 種キー下 `moves` を Serebii 全量で投入、メガ種族に `mega[]` 付与、
      `items` 予約キーへ解禁持ち物全件を反映。
- [ ] `pnpm fetch:data`（追加 slug 取得）→ `node src/cli/index.ts check:regulation data/champions/regulations/champions-m-a.yaml`
      が **0 終了**（覚えない技 / 参照切れ無し）。
- [ ] `pnpm generate:data` で再生成し `data/generated/regulations/champions-m-a/` に反映。
- [ ] 生成データの妥当性を `pokemon-data-reviewer` agent でレビュー（種族値・タイプ・日英名・解禁整合・メガ配列）。

## この Phase で育てるハーネス（rule・skill）

- なし（Phase 8 で定型化した skill を**使う**側・データ投入が中心）。投入中に手順の不備・取りこぼしが見つかれば
  `survey-regulation` を `skill-creator` で追従改修し、Phase 16 へ反映する（小データセットで skill を磨く狙い）。
- [[champions-regulation-data-placeholder]] メモリに 3 種小データセット投入の進捗を反映。

## 受け入れ基準

- `pnpm verify`（型 / カバレッジ100% / Biome）が緑。
- 3 種（garchomp / charizard / gengar）の各 `moves` が **Serebii 全量**（各60〜70技規模）で投入され、手選びサブセット
  ではない。**全技が PokeAPI learnset へのプログラム照合を通っている**（覚えない技なし）。
- M-A 解禁持ち物プールが**全件**（一般持ち物30 + きのみ27 + 該当メガストーン）`items` に反映され、非解禁持ち物が
  混入していない（出典付き）。
- `check:regulation` が **0 終了**（覚えない技混入・参照切れ無し）。全 id が catalog 参照で解決できる。
- パイプライン（catalog 追記 → `fetch:data` → `check:regulation` → `generate:data` → `verify`）が**本格スケール**
  （各種族60〜70技・持ち物100件超）で通ることが確認できる。
- `pokemon-data-reviewer` のレビューで重大な不整合（種族値・タイプ・解禁整合・メガ）が無い。

## 検証手順

1. `ma-roster-source.md` Phase 9 節の出典リストと投入後の 3 種 `moves` / `items` を突き合わせ、Serebii 全量・
   非解禁混入なしを確認。
2. `pnpm fetch:data` 後、`check:regulation` が 0 終了することを確認（learnset full 検証・覚えない技なし）。
3. `pnpm generate:data` 後、3 種の `moves` が各60〜70技で全 learnable 技を含むことをスポット確認。
4. メガ配列の整合（`megaLinks` / per-reg `mega[]` / item `megaStone`）を確認。
5. `pokemon-data-reviewer` agent で生成データをレビューし指摘を解消。
6. `pnpm verify` 緑を確認。

## 引き継ぎデータ（直近スレッド調査・Serebii 主 / Game8 補助・**投入前に Serebii で再確認**）

技は slug 表記。投入前に必ず Serebii Champions ページで全量を再確認し、`data/raw` の PokeAPI learnset へ
プログラム照合すること（過去世代限定技の混入を排除）。

### garchomp（ガブリアス・約56技）
- 物理: earthquake, dragon-claw, outrage, scale-shot, dragon-rush, dragon-tail, breaking-swipe, stone-edge,
  rock-slide, rock-tomb, sand-tomb, stomping-tantrum, bulldoze, dig, poison-jab, iron-head, iron-tail,
  shadow-claw, fire-fang, thunder-fang, crunch, bite, brutal-swing, brick-break, liquidation, aerial-ace,
  body-slam, double-edge, thrash, giga-impact
- 特殊: draco-meteor, dragon-pulse, earth-power, scorching-sands, mud-shot, surf, fire-blast, flamethrower,
  hyper-beam, round, snore
- 変化: swords-dance, stealth-rock, spikes, sandstorm, scary-face, dragon-cheer, helping-hand, protect,
  substitute, endure, rest, sleep-talk, facade, rain-dance, sunny-day
- 注: Serebii SV learnset に nasty-plot / dual-chop / vacuum-wave / false-swipe / metal-claw / twister 等もあり。
  Serebii Champions ページで全量を再確認すること。

### charizard（リザードン・約65技。メガ X/Y も同 movepool）
- 物理: flare-blitz, fire-punch, fire-fang, flame-charge, heat-crash, temper-flare, dragon-claw, outrage,
  dragon-rush, dragon-tail, breaking-swipe, scale-shot, acrobatics, aerial-ace, fly, earthquake, bulldoze, dig,
  brick-break, counter, thunder-punch, shadow-claw, iron-tail, steel-wing, ancient-power, rock-slide, rock-tomb,
  crunch, bite, beat-up, brutal-swing, fling, body-slam, double-edge, facade, mega-kick, belly-drum, giga-impact
- 特殊: fire-blast, flamethrower, heat-wave, overheat, inferno, blast-burn, fire-spin, air-slash, air-cutter,
  hurricane, weather-ball, dragon-pulse, focus-blast, solar-beam, hyper-beam, round, snore
- 変化: dragon-dance, swords-dance, roost, will-o-wisp, roar, scary-face, sandstorm, dragon-cheer, helping-hand,
  protect, substitute, endure, rest, sleep-talk, sunny-day

### gengar（ゲンガー・約71技）
- 物理: poltergeist, phantom-force, shadow-claw, shadow-punch, sucker-punch, knock-off, foul-play, payback,
  thief, fling, brick-break, drain-punch, focus-punch, fire-punch, ice-punch, poison-jab, gunk-shot,
  skitter-smack, body-slam, self-destruct
- 特殊: shadow-ball, hex, night-shade, sludge-bomb, sludge-wave, venoshock, acid-spray, clear-smog, dark-pulse,
  dazzling-gleam, psychic, psychic-noise, energy-ball, thunderbolt, thunder, icy-wind, hyper-beam, round, snore
- 変化: nasty-plot, will-o-wisp, hypnosis, destiny-bond, perish-song, mean-look, curse, confuse-ray, spite,
  disable, taunt, trick, trick-room, wonder-room, skill-swap, imprison, psych-up, reflect-type, pain-split,
  haze, scary-face, corrosive-gas, toxic, toxic-spikes, thunder-wave, rain-dance, sunny-day, protect,
  substitute, endure, rest, sleep-talk

### M-A 解禁持ち物 全件（Serebii・per-reg `items` プール用）
- 一般持ち物(30): black-belt, black-glasses, bright-powder, charcoal, choice-scarf, dragon-fang, fairy-feather,
  focus-band, focus-sash, hard-stone, kings-rock, leftovers, light-ball, magnet, mental-herb, metal-coat,
  miracle-seed, mystic-water, never-melt-ice, poison-barb, quick-claw, scope-lens, sharp-beak, shell-bell,
  silk-scarf, silver-powder, soft-sand, spell-tag, twisted-spoon, white-herb
- きのみ(27): aspear-berry, babiri-berry, charti-berry, cheri-berry, chesto-berry, chilan-berry, chople-berry,
  coba-berry, colbur-berry, haban-berry, kasib-berry, kebia-berry, leppa-berry, lum-berry, occa-berry,
  oran-berry, passho-berry, payapa-berry, pecha-berry, persim-berry, rawst-berry, rindo-berry, roseli-berry,
  shuca-berry, sitrus-berry, tanga-berry, wacan-berry, yache-berry
- メガストーン: 小データセット段では 3 種に必要な charizardite-x（既存）/ charizardite-y / garchompite /
  gengarite を中心に。**PokeAPI item slug を正確に確認**すること。
- 非解禁（投入しない・catalog からは append-only で消さない）: life-orb / assault-vest / rocky-helmet /
  choice-band / choice-specs（Serebii リストに無し）。

## リスク・備考

- **de-risk が主眼**: 本 phase は Phase 16（全186種）の前に、本格スケールのパイプラインを 3 種で先に通すことで
  全量投入の事故（取りこぼし・名称ゆれ・フォルム扱い・learnset version_group 差異）を早期に洗い出す。
- `data/raw` は gitignore・worktree 非共有のため、`fetch:data` を実行してから learnset full 検証を通す
  （[[data-pipeline]]）。未実行だと `check:regulation` が参照整合のみに degrade する。
- learnset ∩ legal の materialize 時、PokeAPI learnset の version_group 差異に注意（過去世代限定技の混入を
  `overrides` / legal フィルタで除外）。
- メガの多重表現（種族 `megaLinks` 配列 / 持ち物 `megaStone` / per-reg `mega[]`）の整合に注意。`check:regulation`
  で担保する。
- 持ち物の PokeAPI slug の正確な綴り（例: `oran-berry`）を `fetch:data` 前に確認する。
