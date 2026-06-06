---
paths:
  - ".claude/skills/harness-meta/**"
description: harness-meta skill が learning の改善提案を「採用 / 見送り / 撤去」へ振り分ける判定基準。
---

# harness-meta-criteria — 採用 / 見送り / 撤去の判定基準

`harness-meta` skill が `docs/harness/learnings/*.md` の `🤖 ハーネス改善提案`（未処理 `[ ]`）を
集約し、各提案を **採用 / 見送り / 撤去** のいずれかへ振り分けるための基準。pokeform 規模に簡素化している。

> learning の構造は [`retrospective-format.md`](./retrospective-format.md)、ループ全体像は
> [`docs/harness/README.md`](../../docs/harness/README.md) を参照。

## ルール（なぜ）

判定を機械化しきらず**人間の最終 approve を必須**にするのは、ハーネス資産（rule / skill / template）の
変更が後続の全フェーズに波及するため。基準は「**採用すべき強いシグナル**」を列挙し、迷ったら見送る。

## 採用（いずれか 1 つ以上を満たす）

1. **複数 PR（≥2）で反復**している提案（同種の Problem / Try が異なる learning に再出）。
2. 明確な **Problem を解消**する（⚠️ で記録された制約・つまずきへの直接的な対処）。
3. 既存の **rule / ADR と直接対応**する（既存方針の補強・具体化であり矛盾しない）。
4. **コスト < 効果**（小さな変更で繰り返しの手間が減る）。
5. **人間が採用を明示**した。

→ 採用時の処理:
- `[rule]` … 対応 rule を編集（無ければ新設は慎重に。リスキー変更は dry-run メモを先行）。
- `[skill]` … `skill-creator` 経由で対象 SKILL.md を改修。
- `[template]` … テンプレ（PR テンプレ / learning template 等）を編集。
- `[adr]` … アーキ決定は `adr-new`（Phase 4）で ADR 起票。
- `[remove]` … 「撤去」基準（後述・2 段階）に従う。
- いずれも `harness/<purpose>` ブランチで改修 PR を作成し、**merge は人間 approve 後**。
- 採用した提案を learning 内で `[ ]`→`[x]` に更新し、採用先 PR リンクを `📝 feedback > 採用` に追記。

## 見送り（いずれか 1 つ以上を満たす）

1. **後続フェーズへ移行**すべき内容（今のフェーズの責務外で、別 phase doc が扱う）。
2. 既存提案と**重複**（別 learning で既に採用 / 起票済み）。
3. **コスト過大**で、現状の運用で十分回る。
4. **人間が見送りを明示**した。

→ 見送り時の処理: 元 learning の `📝 feedback > 見送り` に**理由を追記**（提案は `[ ]` のまま残し、
将来の再評価余地を残す。または合意の上 `[x]` にして「見送り済」と明記）。

## 撤去（**全て**を満たす・2 段階運用必須）

1. 一定期間（**既定 3 ヶ月**）**未参照**の rule / skill / template。
2. その資産への **dangling 参照がゼロ**（他 rule / skill / doc / コードから参照されていない）。
3. **人間の事前承認**がある。

→ 撤去は必ず **2 段階**で行う（1 段階での物理削除は禁止）:
- **段階 1**: 当該資産に `status: removed`（または明示の deprecation メモ）を付け、cooldown 期間に入れる。
- **段階 2**: cooldown 経過後、dangling 参照ゼロを再確認してから物理削除し、撤去を ADR / learning に記録。

## 不変条件

- **merge は人間 approve**。`harness-meta` は PR を作る／feedback を追記するまでで、自動マージしない。
- リスキー変更（rule 全文書換 / skill 新規 / template 構造変更）は**軽量 dry-run メモ**
  （想定 before/after を記述し妥当性を確認）を先行させる。
- 判定で迷ったら**見送り**を既定とする（採用は強いシグナルがあるときのみ）。
