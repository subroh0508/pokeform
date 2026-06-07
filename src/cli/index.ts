#!/usr/bin/env node
import { cac } from "cac";
import type { Lang } from "../types/party.ts";
import { runAnalyzeCoverage } from "./commands/analyze-coverage.ts";
import { runCheckParty } from "./commands/check-party.ts";
import { runCompile, runTypecheck } from "./commands/compile.ts";
import { runStat } from "./commands/stat.ts";

/**
 * pokeform CLI（cac ルータ・薄い配線層・カバレッジ対象外）。各コマンドの実体は
 * commands/ に置き、検証 / 分析は domain に委譲する。問題検出時は非0終了（[[cli-and-io]]）。
 */

const toLang = (raw: unknown): Lang => (raw === "en" ? "en" : "ja");

const cli = cac("pokeform");

cli
  .command("check:party <path>", "パーティ整合性チェック（参照切れ / 同種族重複 / 未解禁 / 体数）")
  .option("--lang <lang>", "表示言語 (ja|en)", { default: "ja" })
  .action(async (path: string, options: { lang?: string }) => {
    process.exitCode = await runCheckParty(path, toLang(options.lang));
  });

cli
  .command("analyze:coverage <path>", "技範囲・防御弱点分析（脆弱時は非0終了）")
  .option("--lang <lang>", "表示言語 (ja|en)", { default: "ja" })
  .action(async (path: string, options: { lang?: string }) => {
    process.exitCode = await runAnalyzeCoverage(path, toLang(options.lang));
  });

cli
  .command("stat <path>", "個体の実数値 / 性格補正 / ポイント配分 / 耐久指数を表示（壁打ち補助）")
  .option("--lang <lang>", "表示言語 (ja|en)", { default: "ja" })
  .action(async (path: string, options: { lang?: string }) => {
    process.exitCode = await runStat(path, toLang(options.lang));
  });

cli
  .command("compile <path>", "個体 YAML / パーティ MD を *.generated.ts へ変換（検証の前処理）")
  .action(async (path: string) => {
    process.exitCode = await runCompile(path, "all");
  });

cli
  .command(
    "check:individual <path>",
    "個体整合: 覚えない技 / 使えない特性 / ポイント66 を tsc で検証",
  )
  .action(async (path: string) => {
    process.exitCode = await runTypecheck(path, "individual");
  });

cli
  .command("typecheck <path>", "個体 + パーティを compile → tsc 検証し診断を YAML/MD 行へ整形")
  .action(async (path: string) => {
    process.exitCode = await runTypecheck(path, "all");
  });

cli.help();
cli.parse();
