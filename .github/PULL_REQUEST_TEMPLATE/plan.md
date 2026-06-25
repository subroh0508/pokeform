<!--
計画起票・plan doc PR 用テンプレート（plans-new の複数 phase 出力 / OVERVIEW・README・phase doc の
新規作成・renumber・insert・cross-plan move 等の docs/roadmap 変更）。
harness.md は learning 採用駆動（harness-meta-criteria 対応）の改修向けで「対象 learning / 採用根拠」
節が計画起票には噛み合わないため、learning 非依存の本バリアントを使う。
ソース（src/** 等）の変更は通常テンプレート（pull_request_template.md）を、ハーネス資産改修は harness.md を使う。
利用方法: gh pr create --body-file で本テンプレを複写、または ?template=plan.md を URL に付与。
-->

## 概要

<!-- どの計画群（NN-{slug}）に何を起こす / どう変えるか。1-3 行。 -->

## 計画の骨子

<!-- plans-new の産物の要点。詳細は OVERVIEW / phase doc 本体へポインタ。 -->

- **ゴール / 背景**: …
- **phase 分割（6 基準）**: 全 N phase。主鎖 = …（依存は README の Mermaid 参照）
- **分割しない判断（該当時）**: <!-- 想定 diff >1000 でもデータセット追加等で意味ある分割が困難な場合は 1 PR を許容し理由を明記（planning.md 6 基準⑤ / learning #47 / #72） -->

## renumber / cross-plan 追従（insert・renumber・move を含む場合）

<!-- planning.md「phase の insert / renumber 追従チェックリスト」に従い機械確認した項目。該当しなければ削除。 -->

- [ ] `git mv` でファイル rename + 本体見出し `# Phase N` 更新
- [ ] `git grep "Phase N"` を **リポジトリ全体（cross-plan 含む）** に打ち、表・mermaid・散文の素番号・完了 phase の forward 参照まで全 hit 追従
- [ ] README の mermaid / phase 一覧リンクが実在ファイルに解決・OVERVIEW の総数 / 直列チェーン更新
- [ ] ADR / rule への相対リンクは slug を実体照合
- [ ] cross-plan move 時: 移動元 README / OVERVIEW の索引除去 + 移動注記

## 検証

- [ ] dangling 参照ゼロ（リンク・パスが実在に解決）
- [ ] `pnpm verify` 緑（docs-only でも pre-commit ゲートを通過）

## 関連

- 計画群: `docs/roadmap/NN-{slug}/`（OVERVIEW / README / phase doc）
- 着手: `start-phase` / `implementation-workflow`
