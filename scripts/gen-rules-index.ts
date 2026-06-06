/**
 * gen-rules-index.ts — `.claude/rules/*.md` の paths frontmatter から
 * `docs/harness/rules-index.md`（glob → rule 対応表）を生成する。
 *
 * 目的: path-scoped rules を自動ロードしないツール（Codex 等）が、
 * ファイル編集前に「どの glob でどの rule を読むべきか」を辿れるようにする。
 * Claude Code は paths を自動ロードするため、この索引は @AGENTS.md には含めない。
 *
 * SoT は各 rule の paths frontmatter。本ファイルは生成物なので手書き編集しない。
 * 実行: `node scripts/gen-rules-index.ts`（prepare / CI で再生成してドリフト防止）。
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RULES_DIR = join(ROOT, ".claude", "rules");
const OUT = join(ROOT, "docs", "harness", "rules-index.md");

type Rule = { file: string; paths: string[]; description: string };

/** rule 1 ファイルの frontmatter から paths と description を取り出す（簡易パーサ）。 */
function parseRule(file: string): Rule {
  const text = readFileSync(join(RULES_DIR, file), "utf8");
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  const body = fm ? fm[1] : "";
  const lines = body.split("\n");

  const paths: string[] = [];
  let description = "";
  let inPaths = false;
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    const desc = line.match(/^description:\s*(.*)$/);
    if (desc) {
      description = desc[1].trim();
      inPaths = false;
      continue;
    }
    if (/^paths:\s*$/.test(line)) {
      inPaths = true;
      continue;
    }
    if (inPaths) {
      const item = line.match(/^\s*-\s*(.*)$/);
      if (item) {
        paths.push(item[1].trim().replace(/^["']|["']$/g, ""));
        continue;
      }
      if (line.trim() !== "") inPaths = false;
    }
  }
  return { file, paths, description };
}

const rules: Rule[] = readdirSync(RULES_DIR)
  .filter((f) => f.endsWith(".md"))
  .sort()
  .map(parseRule);

// glob → rules（複数 rule が同一 glob を担当しうる）。
const byGlob = new Map<string, string[]>();
for (const r of rules) {
  for (const g of r.paths) {
    const list = byGlob.get(g) ?? [];
    list.push(r.file);
    byGlob.set(g, list);
  }
}

const globRows = [...byGlob.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([glob, files]) => `| \`${glob}\` | ${files.map((f) => `\`${f}\``).join(", ")} |`)
  .join("\n");

const always = rules.filter((r) => r.paths.length === 0);
const alwaysRows = always.map((r) => `| \`${r.file}\` | ${r.description} |`).join("\n");

const ruleRows = rules
  .map((r) => {
    const scope = r.paths.length === 0 ? "_常時_" : r.paths.map((p) => `\`${p}\``).join("<br>");
    return `| \`${r.file}\` | ${scope} | ${r.description} |`;
  })
  .join("\n");

const out = `<!-- 生成物: scripts/gen-rules-index.ts が .claude/rules/*.md の paths frontmatter から生成。
     手書き編集しない。rule の paths を変えたら \`node scripts/gen-rules-index.ts\` で再生成する。 -->

# rules インデックス（Codex 等・path-scoped rules 非対応ツール向け）

このリポジトリの規約・知識は \`.claude/rules/*.md\` に置かれ、各 rule の \`paths\` frontmatter が
「どのファイルを編集するとき読むべきか」を宣言している。**Claude Code は \`paths\` を自動ロードする
ため本索引は不要**。path-scoped rules を自動ロードしないツール（Codex 等）は、ファイルを編集する前に
下表で対応 rule を確認して読むこと。クロスエージェント方針は \`.claude/rules/cross-agent.md\`。

## glob → 該当 rule

ファイルパスがこの glob にマッチしたら、対応 rule を読んでから編集する。

| glob | 該当 rule |
|---|---|
${globRows}

## 常時参照する rule（paths なし）

| rule | 概要 |
|---|---|
${alwaysRows}

## 全 rule 一覧

| rule | スコープ | 概要 |
|---|---|---|
${ruleRows}
`;

writeFileSync(OUT, out);
console.log(`[gen-rules-index] wrote ${OUT} (${rules.length} rules, ${byGlob.size} globs)`);
