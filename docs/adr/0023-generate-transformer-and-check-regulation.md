---
id: 0023
status: Accepted
date: 2026-06-10
---

# 0023. generate を変換専任にし、レギュレーション妥当性検証を authoring 時ゲート check:regulation へ移設する

## Context

[ADR 0022](./0022-per-regulation-species-keyed-moves.md) で per-regulation の技記録を species-keyed の明示
記録にし、`scripts/generate.ts` を YAML → TS 変換へ寄せると決めたが、**Phase 5 では覚えない技の検出
（per-species `moves` ⊆ learnset）を generate に残した**（安全性の空白を作らないため）。これにより generate は
「変換」と「妥当性検証」の 2 責務を持ったままだった。

検証を generate に残すと、(a) 生成（決定論的変換）と検証（データ妥当性）の関心が混ざる、(b) 検証は
`pnpm generate:data` を走らせないと働かず authoring の早い段階で弾けない、という課題がある。検証は
**YAML 作成・更新の時点**で独立に働くべきで、`check:individual`（個体の覚えない技を tsc で弾く）と対称な
**レギュレーション用の authoring 時ゲート**が要る。仕様の詳細は
[`docs/plan/02-data-model-redesign/phase-06-generator-and-validation.md`](../plan/02-data-model-redesign/phase-06-generator-and-validation.md)
と [[data-pipeline]] / [[cli-and-io]] を正本とし、本 ADR は「なぜ」を記録する。本 ADR は ADR 0022 の
「generate の責務縮小は段階的（Phase 6 で完了）」を実現する後続であり、0022 を supersede しない。

## Decision

**`scripts/generate.ts` を YAML → TS 変換専任にし、レギュレーション妥当性検証を新 CLI `check:regulation`
（authoring 時ゲート）へ移設する。**

- **generate は検証しない**: per-reg 種族 dex の `moves` は YAML 値をそのまま採用する。覚えない技の throw を
  除去し、generate は決定論的な変換のみを行う（参照切れの「catalog に id が無い」生成段エラーは整合担保として残す）。
- **新 CLI `check:regulation <path>`**: レギュレーション YAML を authoring 時に検証する。検証ロジックは純関数
  `src/domain/regulation-validation.ts`（テスト済み・カバレッジ100%）に置き、CLI（`src/cli`）は薄い配線
  （catalog / `data/raw` learnset 読込・終了コード）に徹する（`check:party` と同型）。検出は **参照整合
  （種族 / 持ち物 / メガ / 技の id が catalog にあるか）・schema（種族ブロックの形）・覚えない技
  （`moves` ⊆ learnset）**。問題があれば非0終了。
- **learnset 検証は `data/raw` 依存で degrade する**: 覚えない技の検証は PokeAPI learnset（`data/raw`）が要る。
  未取得時は参照整合 / schema のみに degrade し、その旨を通知する（full 検証は `pnpm fetch:data` 後）。
- **ゲート配置**: ローカル `pre-commit`（`.githooks`）で `check:regulation data/champions/regulations` を走らせる。
  **CI はオフライン維持**（`data/raw` を持たず・本ゲートを課さない）。CI の保証は committed 生成物 + `tsc` +
  カバレッジで、regulation データ編集時の learnset 検証は authoring（ローカル / fetch 済み）で担保する。

## Consequences

- **良い点**:
  - generate の関心が「変換」だけになり、生成と検証が分離される（読みやすく・壊しにくい）。
  - 覚えない技 / 参照切れを `generate:data` 前の authoring 時点で弾ける（`check:individual` と対称）。
  - 検証ロジックが domain の純関数でテスト済みになり、CLI は薄く保てる。
- **悪い点 / コスト**:
  - 覚えない技の検証が `data/raw`（ネットワーク取得キャッシュ）に依存し、未取得環境では degrade する。
  - ゲートが pre-commit（ローカル）中心で、CI ではレギュレーションの learnset 検証が走らない。
- **トレードオフ / 留意点**:
  - CI をオフライン・決定論に保つことを優先し、learnset 検証を CI へ持ち込まない（network 依存を CI に入れない）。
    regulation の `moves` を編集すれば generate:data の再生成に raw が要るため、編集者の手元には raw があり
    pre-commit で full 検証が働く（理論上の抜けは小さい）。
  - 基本最終進化・Restricted 除外などの条件適合検証は進化データが要るため本 phase では対象外（将来拡張）。

## Alternatives Considered

- **検証を generate に残す**: Phase 5 の暫定。生成と検証の関心が混ざり、authoring 早期に弾けない。分離のため却下。
- **check:regulation を tsc 方式（codegen → 型エラー）にする**（`check:individual` と同じ）: レギュレーション
  YAML を型に落として tsc で弾く案。per-species 技 × 種族の組合せを型化すると生成が複雑化し、参照整合や
  degrade 制御が型では表しにくい。データ検証は純関数 + 終了コードの方が単純なため却下。
- **CI でも `fetch:data` してから check:regulation を走らせる**: CI で full 検証できるが、CI に network 依存を
  持ち込み決定論・速度を損なう。CI はオフライン維持を優先して却下（pre-commit で担保）。
