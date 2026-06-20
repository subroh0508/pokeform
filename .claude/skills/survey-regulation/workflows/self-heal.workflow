/**
 * self-heal.workflow — survey-regulation 層3（Claude 固有・[ADR 0031](../../../../docs/adr/archive/0031-deterministic-serebii-scraper-hybrid-layers.md)）。
 *
 * 層2（[`fetch-fanout.workflow`](./fetch-fanout.workflow)）の **構造化失敗レポート**（exit 3/4 の
 * `{slug, stage, status, missingFields, rawHtmlPath}`）を受けて、**修正 SubAgent（Sonnet+・write 権限）**が
 * 層1 の純関数パーサ（`src/codegen/serebii/parse.ts` / `normalize.ts` / `schema.ts`）を直し、回帰固定の fixture
 * テストを足す → **失敗種のみ層2 へ再 fan-out** する自己修復ループを駆動するオーケストレータ。
 *
 * ループは「取得 → 失敗集約 → 修正 → 失敗種のみ再取得」を **K 回上限（slug 単位の修復試行）** で回し、dedup
 * （同一 slug は 1 ラウンド 1 回計上・K 到達でエスカレーション / 同一パーサ欠陥は 1 修正 SubAgent にバッチ集約）で
 * 無限ループを防ぐ。収束しない種は `escalated` として返し、呼び出し側（SKILL 手順）が roster-source doc へ
 * **未確定として記録**する（人手エスカレーション）。
 *
 * 権限分離（[ADR 0031](../../../../docs/adr/archive/0031-deterministic-serebii-scraper-hybrid-layers.md)）:
 * - **取得 SubAgent = read-only**（層2 が `agentType: "Explore"` で起動・Bash で層1 スクリプトのみ実行）。
 * - **修正 SubAgent = write**（本スクリプトが既定 agentType で起動 = Edit/Write/Bash 可）。パーサ修正とテスト
 *   追加はこの層だけが行う。正しさは層1（テスト済み純関数）に宿るため、修復 = parse.ts/テストの更新であり、
 *   Codex / 素の CLI でも「人が parse.ts を直す」に縮退するだけで成果は同一（cross-agent フォールバック）。
 *
 * これは **Workflow ツール専用スクリプト**であり標準の ES モジュールではない（注入される
 * `agent`/`parallel`/`workflow`/`phase`/`log`/`args` 等のグローバルと top-level `return` を使う）。標準 JS ツール
 * （tsc / biome）の parse 対象ではないため拡張子 `.workflow`（biome `ignoreUnknown`・tsc/coverage は `src/**` のみ）で
 * 機械ゲートの対象外に置く（層2 と同方針）。
 *
 * 使い方（Workflow ツール・Claude のみ）:
 *   Workflow({ scriptPath: ".claude/skills/survey-regulation/workflows/self-heal.workflow",
 *              args: ["garchomp", "salamence", ...] })
 *   args は slug 配列、または { roster: string[], maxRepair?: number, batchSize?: number }。
 *   - roster: 解禁種族 slug 配列（層2 の初回 fan-out 対象）。
 *   - maxRepair: 同一 slug の修復試行上限 K（既定 3・1〜5 にクランプ）。
 *   - batchSize: 層2 fan-out の礼儀バッチサイズ（層2 へ素通し）。
 * 返り値: { ok: string[], escalated: {slug, stage, status, missingFields, rawHtmlPath, attempts}[],
 *           counts: { total, ok, escalated, rounds } }。
 */

export const meta = {
  name: "survey-regulation-self-heal",
  description:
    "Self-healing loop over the layer-2 Serebii fetch fan-out: a write-enabled Sonnet repair sub-agent fixes the layer-1 deterministic parser and adds regression fixtures for each structured failure, then only failed species are re-fanned-out, bounded by a per-slug K-attempt cap with dedup; non-converging species are returned for human escalation.",
  phases: [
    {
      title: "Fetch",
      detail: "reuse layer-2 fetch-fanout (read-only Haiku) to collect exit-0 successes and structured failures",
      model: "haiku",
    },
    {
      title: "Repair",
      detail:
        "batch failures by parser-defect signature; one write-enabled Sonnet sub-agent per group fixes parse.ts/normalize.ts and adds a regression fixture+test (keeps coverage 100%)",
      model: "sonnet",
    },
  ],
};

// 層2（取得 fan-out）への参照。失敗種のみの再取得も同じ層2 を再利用する（重複実装しない）。
const FANOUT = ".claude/skills/survey-regulation/workflows/fetch-fanout.workflow";

// 入力: roster（解禁種族 slug 配列）。args に配列、または { roster, maxRepair, batchSize }。
const input = Array.isArray(args) ? { roster: args } : args || {};
const roster = (input.roster || []).filter((s) => typeof s === "string" && s.length > 0);
// 同一 slug の修復試行上限 K（無限ループ防止の主軸）。
const MAX_REPAIR = Math.max(1, Math.min(5, input.maxRepair || 3));
// ループ全体のハード上限（各ラウンドで repairable 全 slug の試行回数が +1 されるため round ≤ MAX_REPAIR+1 で
// 必ず収束するが、安全網として明示する）。
const MAX_ROUNDS = MAX_REPAIR + 1;

// 修正 SubAgent の構造化返り値（自然言語を介さず機械集約する）。
const FIX_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["touchedFiles", "addedFixtures", "verifyPass", "generalized", "summary"],
  properties: {
    touchedFiles: {
      type: "array",
      items: { type: "string" },
      description: "編集した層1 ソース（src/codegen/serebii/*.ts）",
    },
    addedFixtures: {
      type: "array",
      items: { type: "string" },
      description: "追加した回帰 fixture / テスト（__fixtures__/*.html・*.test.ts）",
    },
    verifyPass: { type: "boolean", description: "pnpm verify（型/カバレッジ100%/Biome）が緑になったか" },
    generalized: {
      type: "boolean",
      description: "種専用ハックを避け、セレクタ/正規化を一般化して直したか",
    },
    summary: { type: "string", description: "欠陥の原因と修正方針の 1〜2 行要約" },
  },
};

/** 失敗の「パーサ欠陥シグネチャ」= 同じ欠陥で落ちた種を 1 修正 SubAgent にバッチ集約するためのキー。 */
function signatureOf(f) {
  const fields = (f.missingFields || []).slice().sort().join(",");
  return `stage${f.stage}:${f.status || ""}:${fields}`;
}

/** 修正 SubAgent（Sonnet+・write）プロンプト。失敗グループ（同一欠陥）を一括で直させる。 */
const fixPrompt = (signature, failures) => {
  const slugs = failures.map((f) => f.slug);
  const htmlPaths = failures.map((f) => f.rawHtmlPath).filter(Boolean);
  const missing = [...new Set(failures.flatMap((f) => f.missingFields || []))];
  return `あなたは Serebii Champions 決定論パーサの「修正 SubAgent」です。層1 の純関数パーサが取りこぼした欠陥を直し、回帰テストで固定するのが任務です（write 権限あり）。

## 欠陥（同一シグネチャでバッチ）
- シグネチャ: ${signature}
- 失敗種 slug: ${slugs.join(", ")}
- 欠落/不健全フィールド（stage 3=欠落 / stage 4=件数・健全性）: ${missing.join(", ") || "(なし)"}
- 失敗 HTML（latin-1 キャッシュ）: ${htmlPaths.join(", ") || "(rawHtmlPath 不明)"}

## 直す対象（層1・テスト100%の純関数のみ）
- \`src/codegen/serebii/parse.ts\`（DOM 抽出）/ \`normalize.ts\`（id 正規化）/ \`schema.ts\`（自己検証 stage）。
- 取得・配線（\`scripts/*.ts\`）や生成物（\`data/generated/**\`）は触らない。

## 手順（厳守）
1. 失敗 HTML（上記 rawHtmlPath を Read。latin-1）と層1 ソースを読み、なぜ ${missing.join("/") || "当該欄"} が取れない/不健全かを特定する。
2. **セレクタ/正規化を一般化して**直す。地域フォルム・複数セクション種など Serebii のレイアウト揺れに一般対応すること。**その種専用のハック（slug 名で分岐する等）は将来の揺れで破綻するため禁止**。
3. **既存テストを壊さない**。失敗種のうち最低 1 種について、当該ページの**最小化した HTML を \`src/codegen/serebii/__fixtures__/serebii-<slug>.html\`（latin-1 で保存）として追加**し、\`parse.test.ts\` 等に「この欠陥が再発しないこと」を assert するテストを足す（回帰固定）。
4. \`pnpm verify\`（tsc / vitest --coverage 閾値100% / biome）が**緑になるまで**直す。追加した分岐は必ず新規テストで網羅し**カバレッジ100%を維持**する。最後に \`node scripts/scrape-serebii.ts species <slug>\` が当該失敗種で exit 0 になることも確認する。
5. StructuredOutput で結果を 1 つだけ返す（verifyPass / touchedFiles / addedFixtures / generalized / summary）。verify が緑にできなければ verifyPass=false で返す（無理に通したことにしない）。`;
};

phase("Fetch");
if (roster.length === 0) {
  log('roster が空です。args に slug 配列を渡してください（例 ["garchomp","salamence"]）。');
  return { ok: [], escalated: [], counts: { total: 0, ok: 0, escalated: 0, rounds: 0 } };
}

// 初回 fan-out（層2 を再利用）。
let report = await workflow({ scriptPath: FANOUT }, { roster, batchSize: input.batchSize });
let failed = (report && report.failed) || [];

// 累積成功種（再 fan-out は失敗種のみなので report.ok を都度マージする）。
const succeeded = new Set((report && report.ok) || []);
// slug → 修復試行回数（dedup + K 回上限の状態）。
const attempts = new Map();
// 収束しなかった失敗種（K 到達 / 修復不能）。
const escalated = [];
const escalate = (f) => {
  if (!escalated.some((e) => e.slug === f.slug)) escalated.push(f);
};

let round = 0;
while (failed.length > 0 && round < MAX_ROUNDS) {
  round++;

  // dedup + K 回上限: 既に K 回試行した slug はエスカレーションへ。残りを修復対象にする。
  const repairable = [];
  for (const f of failed) {
    if ((attempts.get(f.slug) || 0) >= MAX_REPAIR) escalate(f);
    else repairable.push(f);
  }
  if (repairable.length === 0) {
    log(`修復対象なし（全失敗種が K=${MAX_REPAIR} 回上限に到達 → エスカレーション）。`);
    break;
  }

  // 同一パーサ欠陥シグネチャでグループ化（複数種で出る同じ欠陥を 1 修正 SubAgent に集約）。
  const groups = new Map();
  for (const f of repairable) {
    const sig = signatureOf(f);
    if (!groups.has(sig)) groups.set(sig, []);
    groups.get(sig).push(f);
    attempts.set(f.slug, (attempts.get(f.slug) || 0) + 1);
  }

  phase("Repair");
  log(
    `round ${round}/${MAX_ROUNDS}: 修復 ${repairable.length} 種 / ${groups.size} 欠陥グループ（K=${MAX_REPAIR}）`,
  );
  const fixResults = await parallel(
    [...groups.entries()].map(
      ([sig, failures]) =>
        () =>
          agent(fixPrompt(sig, failures), {
            label: `fix:${sig}`,
            phase: "Repair",
            model: "sonnet", // 修正は判断を要するため Sonnet+（取得 Haiku と非対称）。
            schema: FIX_SCHEMA,
          }),
    ),
  );

  // 1 グループも verify 緑にできなければ、これ以上収束しないため停止（無限ループ防止）。
  const progressed = fixResults.filter(Boolean).some((r) => r.verifyPass);
  if (!progressed) {
    log("修正 SubAgent が verify 緑の修復を生成できませんでした → 収束しないため停止・エスカレーション。");
    for (const f of repairable) escalate(f);
    break;
  }

  // 失敗種のみ層2 へ再 fan-out（成功種は冪等キャッシュで skip・取得 SubAgent は read-only）。
  phase("Fetch");
  const retrySlugs = repairable.map((f) => f.slug);
  report = await workflow({ scriptPath: FANOUT }, { roster: retrySlugs, batchSize: input.batchSize });
  for (const slug of (report && report.ok) || []) succeeded.add(slug);
  failed = (report && report.failed) || [];
}

// ループ後に残った失敗種（ハード上限到達等）もエスカレーションへ。
for (const f of failed) escalate(f);
// 最終的に成功した種はエスカレーションから除く（再 fan-out で緑化したケース）。
const finalEscalated = escalated.filter((f) => !succeeded.has(f.slug));

const result = {
  ok: [...succeeded],
  // 収束しない種（修正 SubAgent / 人手エスカレーション・roster-source doc へ未確定として記録する入力契約）。
  escalated: finalEscalated.map((f) => ({
    slug: f.slug,
    stage: f.stage,
    status: f.status,
    missingFields: f.missingFields ?? [],
    rawHtmlPath: f.rawHtmlPath ?? "",
    attempts: attempts.get(f.slug) || 0,
  })),
  counts: {
    total: roster.length,
    ok: succeeded.size,
    escalated: finalEscalated.length,
    rounds: round,
  },
};

log(
  `self-heal 完了: total=${result.counts.total} ok=${result.counts.ok} escalated=${result.counts.escalated} rounds=${result.counts.rounds}`,
);
if (finalEscalated.length > 0) {
  log(
    `収束しない種（roster-source doc に未確定として記録・人手エスカレーション）: ${result.escalated
      .map((f) => f.slug)
      .join(", ")}`,
  );
}
// ok / escalated / counts は roster-source doc（docs/plan/<plan>/<id>-roster-source.md）の進捗・成功/失敗 +
// 未確定種の記録へ転記する（呼び出し側 = SKILL 手順）。

return result;
