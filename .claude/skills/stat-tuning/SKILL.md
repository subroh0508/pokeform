---
name: stat-tuning
description: >-
  育成済み個体のステータス調整を壁打ちする手順 skill。`pokeform stat` で実数値・性格補正・耐久 / 火力
  指数を確認し、「素早さ □□ 抜き」「攻撃 ○○ の技を確定耐え」等の目標から能力ポイント配分を逆算
  （合計66 / 各≤32 制約・実現不能は報告）して調整案を提案する。「ステータスを調整したい」「耐久ラインを
  逆算して」「素早さ○○抜きの振り方は?」「この技を確定耐えする配分は?」「火力と耐久どっちに振る?」
  「stat-tuning <path>」「実数値を見せて」と言われたとき、または個体の振り直しをブラッシュアップしたい
  ときに使う。実数値計算・逆算は domain 純関数に委譲する。個体の技 / 特性 / 合計66 の妥当性検証は
  `author-individual`、パーティ全体の弱点 / 技範囲は `review-party` を使う。
allowed-tools: Bash(pnpm *), Bash(node src/cli/*), Read, Edit, Write
---

# stat-tuning — ステータス調整を逆算で壁打ちする

pokeform の利用者（コーディングエージェント / 人間）が、**1 体の能力ポイント配分**を目標ラインから
詰める際の入口。`pokeform stat` で現状の実数値・性格補正・耐久 / 火力指数を可視化し、「素早さ □□ 抜き」
「攻撃 ○○ の技を確定耐え」等の目標から**ポイント逆算**（合計66・各 ≤32・[[game-spec]]）して調整案を
出す。実数値計算・ダメージ式・逆算は domain 純関数（`calc-stats` / `damage` / `stat-tuning`・テスト済み）
に委譲し、本 skill は**確認・逆算・提案と要約**に徹する（機械ゲートを再実装しない・[[skill-authoring]]）。

## 役割

- **現状を見る**: `pokeform stat <path>` で 6 実数値・性格補正記号・ポイント配分・耐久指数を表示する
  （`--lang ja|en`）。
- **逆算する**: 目標（素早さライン / 確定耐え）から `src/domain/stat-tuning.ts` の純関数で必要振りを求める
  （関数は手順 3）。**実現不能なら `null`** をそのまま「無理（最大振りでも届かない）」と報告する。
- **提案する**: 余剰ポイントの振り先候補（目標でまだ 32 未満の能力）を添えて、現状からの増減を示す。

## 入力 / 出力

- **入力**: 対象個体ファイル（YAML パス）。任意で目標（抜きたい素早さ / 確定耐えしたい攻撃技と相手の
  攻撃実数値・威力・タイプ補正）。
- **出力**: 現状の実数値 / 指数の要約と、目標を満たす配分案（複数候補 + 余剰振り先）。実現不能なら
  その旨と緩和案（性格補正の振り直し・目標ラインの見直し）。

## 手順

1. **現状確認**: `pnpm pokeform stat <path>`（または `node src/cli/index.ts stat <path>`）で実数値・補正・
   ポイント・耐久指数を表示する。
2. **目標を定める**: 「素早さ □□ 抜き」（相手の素早さ実数値 + 1 を目標に）/「攻撃 ○○ の △△ を確定耐え」
   （相手の攻撃実数値・技威力・STAB / タイプ相性）を確認する。ダメージは確定数判定の範囲に限定
   （急所 / 天候 / 持ち物補正は対象外・[[game-spec]]）。
3. **逆算する**: domain 関数で必要振りを求める。素早さは `solveOutspeed(baseSpeed, natureMod, target)`、
   確定耐えは `solveSurvival({ baseHp, baseDefense, defenseNatureMod, attacker })`。`null` は実現不能。
4. **配分を組む**: 逆算した HP / 防御 / 素早さ振りを置き、余剰を火力等へ。合計が **66**・各 **≤32** を
   満たすこと（`buildTuningReport` の `feasible` / `surplus` / `surplusCandidates` で点検）。
5. **検証する**: 組んだ配分を個体 YAML に反映したら `author-individual` の `check:individual` で覚えない技 /
   合計66 を tsc 検証し、`pokeform stat` で目標ラインの到達を再確認する（往復整合）。

## Gotchas

- **解は一意でない**: 合計66 の中で確定耐えの (HP 振り, 防御振り) は複数成立する。`solveSurvival` は合計振り
  昇順のフロンティアを返すので、**最小合計の候補**を基準に余剰の使い道を壁打ちする。
- **実現不能を握りつぶさない**: `null`（32 振りでも届かない / 耐えられない）は「できない」と明示報告する。
  性格補正の振り直しや目標緩和を案内する。
- **ダメージは近似 / 限定スコープ**: MVP のダメージ式は乱数上下限・STAB・タイプ相性のみ。急所 / 天候 /
  持ち物 / 特性補正は将来計画 `02-<slug>`（[[game-spec]]）。確定数の精密判定は範囲外。
- **指数は無次元の近似**: 耐久 / 火力指数は比較用の目安であり実ダメージではない。確定耐えの可否は
  `solveSurvival`（ダメージ式ベース）で判断する。
- **検証は委譲**: 配分の妥当性（覚えない技 / 合計66 / 性格 up=down）は `author-individual`（tsc）に委譲し、
  本 skill で独自判定しない（[[tsc-verification]] / ADR 0010）。

## 関連

- コマンド: `pokeform stat`（`src/cli/commands/stat.ts`）。
- domain: `src/domain/calc-stats.ts` / `stat-indices.ts` / `damage.ts` / `stat-tuning.ts`（純関数・テスト済み）。
- 規約: [[game-spec]] / [[tsc-verification]] / [[cli-and-io]] / [[type-conventions]]。
- 個体検証: `author-individual` skill / パーティ点検: `review-party` skill。
- skill 作成方針: [[skill-authoring]] / 配置: [[cross-agent]]。
