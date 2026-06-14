/**
 * fetch-fanout.workflow — survey-regulation 層2（Claude 固有・[ADR 0031](../../../../docs/adr/0031-deterministic-serebii-scraper-hybrid-layers.md)）。
 *
 * roster（解禁種族 slug 配列）を受け、層1 の決定論スクレイパー（`scripts/{fetch,scrape}-serebii.ts`）を
 * Haiku 取得 SubAgent へ **礼儀バッチ + Workflow `parallel()` で fan-out** するオーケストレータ。取得 SubAgent は
 * 「判断するな・スクリプトを呼べ」に縮退し、**HTML を LLM コンテキストに載せず exit code だけで判定**する
 * （read-only = Explore agentType）。成功種（exit 0）は冪等キャッシュ（`data/raw/serebii/`）で再実行 skip され、
 * 失敗種（exit 3/4）は `{slug, stage, missingFields, rawHtmlPath}` の構造化レポートへ集約する（人手 / 修正
 * SubAgent エスカレーションは Phase 5）。正しさは層1（cross-agent 共有 npm script）に宿るため、Codex / 素の CLI は
 * 本スクリプト無しでも層1 を逐次実行 + 人手修正で同じ成果へ収束する（[[cross-agent]]）。
 *
 * これは **Workflow ツール専用スクリプト**であり、標準の ES モジュールではない（実行時に注入される
 * `agent`/`parallel`/`phase`/`log`/`args` 等のグローバルと、結果を返すための top-level `return` を使う）。
 * そのため標準 JS ツール（tsc / biome）が parse できる対象ではなく、拡張子 `.workflow`（biome `ignoreUnknown`・
 * tsc/coverage は `src/**` のみ）で機械ゲートの対象外に置く。
 *
 * 使い方（Workflow ツール）:
 *   Workflow({ scriptPath: ".claude/skills/survey-regulation/workflows/fetch-fanout.workflow",
 *              args: ["garchomp", "salamence", ...] })
 *   args は slug 配列、または { roster: string[], batchSize?: number }。
 * 返り値: { ok: string[], failed: {slug, stage, status, missingFields, rawHtmlPath}[], counts }。
 */

export const meta = {
  name: "survey-regulation-fetch-fanout",
  description:
    "Fan out the deterministic Serebii fetch+scrape (layer 1) across a roster of species slugs via read-only Haiku sub-agents; aggregate exit-0 successes and structured exit 3/4 failure reports without loading HTML into context.",
  phases: [
    {
      title: "Fetch fan-out",
      detail:
        "politeness batches of read-only Haiku Explore agents: run scrape-serebii (fetch-serebii on cache miss), judge exit code only, never read HTML",
      model: "haiku",
    },
  ],
};

// 入力: roster（解禁種族 slug 配列）。args に配列、または { roster, batchSize }。
const input = Array.isArray(args) ? { roster: args } : args || {};
const roster = (input.roster || []).filter((s) => typeof s === "string" && s.length > 0);
// 礼儀バッチの同時実行キャップ（Workflow の global cap に加え、バッチ境界で Serebii への過負荷を抑える）。
const BATCH = Math.max(1, Math.min(8, input.batchSize || 6));

// 取得 SubAgent の構造化返り値（StructuredOutput で強制・自然言語を介さず機械集約する）。
const RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["slug", "exitCode", "status"],
  properties: {
    slug: { type: "string" },
    exitCode: { type: "integer", description: "最終 scrape-serebii の exit code（0/2/3/4）" },
    status: {
      type: "string",
      enum: ["ok", "fetch-failed", "schema-missing", "sanity-failed", "error"],
    },
    stage: { type: "integer", description: "stderr 診断の stage（成功時 0）" },
    missingFields: { type: "array", items: { type: "string" } },
    rawHtmlPath: { type: "string" },
    cached: { type: "boolean", description: "初回 scrape が exit0（=既存キャッシュ命中）だったか" },
  },
};

const fetchPrompt = (slug) =>
  `あなたは Serebii Champions 解禁データの「取得 SubAgent」です。判断・抽出・要約は一切せず、層1スクリプトを呼んで exit code を報告するだけ。**HTML は絶対に読まない**（Read しない / cat しない / stdout の中間 JSON 本文も読まない）。ファイルの編集・生成もしない（read-only）。

対象種族 slug: ${slug}

手順（厳守・順番どおり）:
1. \`node scripts/scrape-serebii.ts species ${slug}; echo "exit=$?"\` を Bash で実行し、exit code を確認する。stdout の中間 JSON 本文は巨大なので読まない（exit code と、失敗時のみ末尾 stderr の 1 行 JSON だけ見る）。
2. exit code で分岐:
   - **0**: 成功。status="ok" / cached=true（fetch せず通った＝キャッシュ命中）/ stage=0 / missingFields=[]。
   - **2**: キャッシュ未取得。\`node scripts/fetch-serebii.ts species ${slug}; echo "exit=$?"\` を実行して取得 → 再度 \`node scripts/scrape-serebii.ts species ${slug}; echo "exit=$?"\` を実行し、その exit code で 0/3/4 を再判定する（再 scrape が 0 なら status="ok"・cached=false）。fetch が exit 2（取得失敗）なら status="fetch-failed"・exitCode=2。再 scrape も 2 なら status="fetch-failed"。
   - **3**: status="schema-missing"。
   - **4**: status="sanity-failed"。
3. status が "ok" 以外のとき**だけ**、直前に実行した scrape / fetch の **stderr** に出ている 1 行 JSON \`{"slug","stage","missingFields","rawHtmlPath"}\`（小さい構造化診断・HTML ではない）を読み、stage / missingFields / rawHtmlPath を結果へ転記する。
4. StructuredOutput で結果オブジェクトを 1 つだけ返す（slug は "${slug}"）。`;

phase("Fetch fan-out");

if (roster.length === 0) {
  log('roster が空です。args に slug 配列を渡してください（例 ["garchomp","salamence"]）。');
}

// 礼儀バッチ: BATCH 件ずつ parallel。バッチ境界の待ち合わせ + 層1 fetch-serebii 内の sleep が Serebii への礼儀を担保。
const results = [];
for (let i = 0; i < roster.length; i += BATCH) {
  const batch = roster.slice(i, i + BATCH);
  log(`batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(roster.length / BATCH)}: ${batch.join(", ")}`);
  const batchResults = await parallel(
    batch.map(
      (slug) => () =>
        agent(fetchPrompt(slug), {
          label: `fetch:${slug}`,
          phase: "Fetch fan-out",
          model: "haiku",
          agentType: "Explore", // read-only（Edit/Write 不可・Bash で層1スクリプトのみ実行）
          schema: RESULT_SCHEMA,
        }),
    ),
  );
  results.push(...batchResults);
}

// agent が落ちた / skip された種は null → dropped に計上（失敗種とは別管理）。
const done = results.filter(Boolean);
const ok = done.filter((r) => r.status === "ok");
const failed = done.filter((r) => r.status !== "ok");
const dropped = roster.length - done.length;

const report = {
  ok: ok.map((r) => r.slug),
  // 失敗種の構造化レポート（修正 SubAgent / 人手エスカレーションの入力契約・Phase 5）。
  failed: failed.map((r) => ({
    slug: r.slug,
    stage: typeof r.stage === "number" ? r.stage : r.exitCode,
    status: r.status,
    missingFields: r.missingFields ?? [],
    rawHtmlPath: r.rawHtmlPath ?? "",
  })),
  counts: { total: roster.length, ok: ok.length, failed: failed.length, dropped },
};

log(
  `fan-out 完了: total=${report.counts.total} ok=${report.counts.ok} failed=${report.counts.failed} dropped=${report.counts.dropped}`,
);
if (failed.length > 0) {
  log(`失敗種（修正 SubAgent / 人手エスカレーション・Phase 5）: ${report.failed.map((f) => f.slug).join(", ")}`);
}
// counts は roster-source doc（docs/plan/<plan>/<id>-roster-source.md）の進捗・成功/失敗記録へ転記する（呼び出し側 = SKILL 手順）。

return report;
