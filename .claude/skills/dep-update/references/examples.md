# dep-update — 判定例

判断基準表（SKILL.md「判断基準」節）の適用例。〈可〉は patch/minor/major を問わず「破壊的変更が使用箇所に非該当 + verify/CI 緑」で成立し、〈要人手〉はそのいずれかが欠けたとき。

**〈可〉（patch・影響なし）:**

```
PR #42: chore(deps-dev) biome 2.4.1 → 2.4.2（patch）
- 破壊的変更: なし（CHANGELOG はバグ修正のみ）
- pnpm verify: ✅ 緑 / CI: ✅ 緑
判定: 〈可〉→ サマリをコメントし gh pr merge --merge --delete-branch を実行。
```

**〈可〉（major だが破壊的変更が非該当）:**

```
PR #50: chore(deps-dev) vitest <major bump>（major）
- 破壊的変更: 設定キー名変更ありだが、リポジトリ内に使用箇所なし（Grep で非該当を確認）。
- pnpm verify: ✅ 緑 / CI: ✅ 緑
判定: 〈可〉→ major でも破壊的変更が非該当・緑のため自動マージ（ADR 0008 の最新追従方針）。
```

**〈要人手〉（破壊的変更が使用箇所に該当）:**

```
PR #51: chore(deps) <pkg> <major bump>（major）
- 破壊的変更が、リポジトリ内の使用箇所に該当する（Grep でヒット）。
判定: 〈要人手〉→ リスク要約をコメントしマージせず停止。停止理由は major であることではなく、
      破壊的変更が使用箇所に該当する点。修正方針を添えて人手判断へ。
```
