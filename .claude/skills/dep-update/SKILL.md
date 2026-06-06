---
name: dep-update
description: >-
  Dependabot などが作る依存更新 PR を、リリースノート・影響範囲・`pnpm verify`・CI を確認して
  マージ可否を判断し、安全なものだけ自動マージする手順 skill。「依存更新 PR を見て」「この
  Dependabot PR をマージしていい?」「dep-update <PR番号>」「<パッケージ名> の更新を確認して」
  「依存のバージョン上げ PR をレビューして」と言われたとき、または依存追従 PR が来たときに使う。
  引数は PR 番号 または 依存パッケージ名。マージは不可逆なので〈可〉基準を全て満たす場合のみ実行する。
allowed-tools: Bash(gh *) Bash(pnpm *) Read Grep WebFetch
---

# dep-update — 依存更新 PR をレビューしてマージ可否を判断する

Dependabot（`.github/dependabot.yml`）が作る依存更新 PR を **特定 → 影響確認 → 検証 → 可否判断 → アクション**
の順で安全に処理する手順 skill。マージは**不可逆で外部影響のある操作**なので、〈可〉基準を**すべて**満たす
ものだけ自動マージし、1 つでも欠ければ停止して人手へエスカレーションする。

## なぜこの skill があるか

依存追従は放置すると脆弱性・互換性負債が溜まり、無検証で全部マージすると壊れる。pokeform は
**メジャー含め最新追従**する方針（[ADR 0017](../../../docs/adr/0017-toolchain-version-source-of-truth.md)。版を固定せず、
verify / CI 緑で取り込む）。この skill は「どこまで自動で進め、どこから人手に渡すか」の判断を毎回
同じ基準で再現し、判定根拠（バージョン差分・該当する使用箇所・verify 結果）を必ず残す。**メジャーであること自体は
停止理由にしない**——停止するのは「破壊的変更がリポジトリ内の使用箇所に該当する / verify 失敗 / CI 赤」のとき。

## 入力

引数は **PR 番号** または **依存パッケージ名** のいずれか。

- PR 番号（例 `42`）: その PR を直接対象にする。
- 依存名（例 `vitest`）: `gh pr list` で該当する Dependabot PR を検索して対象にする（複数あれば一覧提示）。

## 出力

- 更新パッケージと **from→to**、メジャー/マイナー/パッチ区分。
- 破壊的変更・非推奨・挙動変更の有無と、当該 API の**リポジトリ内使用箇所**（該当 / 非該当）。
- `pnpm verify` 結果と `gh pr checks` の CI 結果。
- **判定**（〈可〉/〈要人手〉）と根拠、実行したアクション（マージ or エスカレーション）。

## 判断基準（明文化）

判定の正本はこの表。後段のアクションはこの判定にのみ従う。

| 判定 | 条件（〈可〉は **AND**、すべて満たす） |
|---|---|
| **〈可〉= 自動マージ** | ① `pnpm verify` 緑 ② 破壊的変更が**リポジトリ内の使用箇所に該当しない** ③ `gh pr checks` の CI 緑（patch/minor/**major を問わない**） |
| **〈要人手〉= 停止** | 破壊的変更が使用箇所に該当 / `verify` 失敗 / CI 赤 の**いずれか 1 つでも**該当（major でも、破壊的変更が使用箇所に該当せず verify/CI 緑なら〈可〉） |

少しでも不確実なら〈要人手〉に倒す。「たぶん大丈夫」では自動マージしない。

## 手順

### 1. 対象特定

```bash
gh pr view <PR>                # 単一 PR を直接見る
# 依存名で来た場合は Dependabot PR を検索する:
gh pr list --author "app/dependabot" --search "<依存名>"
```

`gh pr view` の本文・コミットメッセージ（`chore(deps)` プレフィックス）から、更新パッケージと
**from→to** のバージョン、メジャー/マイナー/パッチ区分を読み取る。複数パッケージをまとめた
group PR（`production-dependencies` / `dev-dependencies` / `github-actions` / `docker`）なら、
含まれる**全パッケージ**を列挙して 1 つずつ評価する。

### 2. リリースノート / 影響確認

`from..to` の変更点を調べ、**破壊的変更・非推奨・挙動変更**を抽出する。

```bash
gh api repos/<owner>/<repo>/releases   # GitHub Releases を取得
```

GitHub Releases で足りなければ `WebFetch` で CHANGELOG・リリースノートを取得する。
破壊的変更が挙げられていたら、その API がリポジトリで使われているかを `Grep` で洗う:

```
Grep: 当該 API 名 / 削除された関数名 / 変更された設定キー
```

**該当**（使用箇所がある）なら影響あり、**非該当**（使われていない）なら影響なし、と切り分ける。
docker エコシステムの Node ベースイメージ更新は、メジャー含め追従（[ADR 0017]）。更新時は `.node-version`
（Node の SoT）を合わせて更新し、`Dockerfile` のタグと整合させる（破壊的変更は verify / CI で検出）。

### 3. 検証

PR をチェックアウトして緑のゲートを通す。**検証ロジックは再実装せず `pnpm verify` を再利用**する
（→ [`verify`](../verify/SKILL.md) と同じゲート）。

```bash
gh pr checkout <PR>
pnpm install
pnpm verify          # tsc --noEmit → vitest --coverage(100%) → biome check
gh pr checks <PR>    # サーバ側 CI の結果も確認
```

`pnpm verify` 緑かつ CI 緑を確認する。どちらかが赤なら〈要人手〉。

### 4. マージ可否判断

上の**判断基準**表に照らして〈可〉/〈要人手〉を確定する。group PR は**含まれる全パッケージが〈可〉**
の場合のみ PR 全体を〈可〉とする（1 つでも破壊的変更が使用箇所に該当すれば PR 全体を〈要人手〉。major か否かは停止理由にしない）。

### 5. アクション

**〈可〉のとき** — 影響サマリ（バージョン差分・該当なしの確認・verify/CI 結果）をコメントしてから
通常マージ（merge commit）する:

```bash
gh pr comment <PR> --body "<判定根拠の要約>"
gh pr merge <PR> --merge --delete-branch
```

**〈要人手〉のとき** — リスク要約（major である / 破壊的変更が該当する使用箇所 / verify or CI の失敗内容）
と推奨対応をコメントし、**マージせず停止**する:

```bash
gh pr comment <PR> --body "<リスク要約と推奨対応・人手判断が必要な理由>"
```

## 例

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
判定: 〈可〉→ major でも破壊的変更が非該当・緑のため自動マージ（ADR 0017 の最新追従方針）。
```

**〈要人手〉（破壊的変更が使用箇所に該当）:**

```
PR #51: chore(deps) <pkg> <major bump>（major）
- 破壊的変更が、リポジトリ内の使用箇所に該当する（Grep でヒット）。
判定: 〈要人手〉→ リスク要約をコメントしマージせず停止。停止理由は major であることではなく、
      破壊的変更が使用箇所に該当する点。修正方針を添えて人手判断へ。
```

## Gotchas

- **マージは不可逆**: 〈可〉基準を**すべて**満たす場合のみ自動マージ。1 つでも欠けたら必ず停止する。
  曖昧なまま `gh pr merge` しない。
- **ゲートを再実装しない**: 型 / テスト / カバレッジ / Lint の判定は `pnpm verify`（[`verify`](../verify/SKILL.md)）
  と Git hooks（`.githooks/`）が正本。この skill は結果を読むだけ。
- **group PR は全パッケージを評価**: まとめ PR は 1 つでも破壊的変更が使用箇所に該当すれば PR 全体を〈要人手〉（major か否かは停止理由にしない）。
- **破壊的変更は「該当するか」で判断**: 破壊的変更が列挙されていても、使用箇所が無ければ影響なし。
  `Grep` で必ず使用箇所を確認してから該当 / 非該当を切り分ける。
- **判定根拠を必ず残す**: マージ可否にかかわらず、根拠（バージョン差分・該当箇所・verify/CI 結果）を
  PR コメントに明示する。後から「なぜマージした/しなかったか」を追えるようにする。

## 関連

- 設定: `.github/dependabot.yml`（npm / github-actions / docker・weekly・`chore(deps)` プレフィックス）。
- 検証ゲート: [`verify`](../verify/SKILL.md) / `.githooks/`（ツール非依存の強制ゲート）。
- バージョン方針: [ADR 0017](../../../docs/adr/0017-toolchain-version-source-of-truth.md)（SoT=package.json/lockfile/.node-version・メジャー含め最新追従）。
- バージョン整合: `Dockerfile` のタグ / `.node-version` / `engines.node`（docker ベースイメージ更新時に合わせる）。
