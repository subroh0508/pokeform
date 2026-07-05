import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // ドメイン純関数は完全網羅。薄い層（CLI 配線 / codegen / I/O / 公開集約 / 型のみ）は明示除外する
      // （取り繕いでなく層の性質による除外・[[testing]]）。vitest v4 は include 全体を既定で計上する。
      include: ["src/**/*.ts"],
      exclude: [
        "**/*.test.ts",
        "**/__fixtures__/**",
        // 生成物（scripts/generate.ts 出力）。値の写しでありロジックを持たないため
        // カバレッジ対象外（[[testing]] の「生成物は明示除外」・配置は data/generated → src/generated）。
        "src/generated/**",
        "src/cli/**",
        // codegen のトップレベルは薄い配線で個別除外。判断分岐を持つ純関数（serebii/** の parse 等 /
        // materialize.ts の名前抽出・whitelist union・剪定計画）は 100% ゲートで網羅する（[[testing]]）。
        // `materialize.ts` は除外せず gate に載せる（除外を狭めて純関数をゲート死角に落とさない）。
        "src/codegen/normalize.ts",
        "src/codegen/run-tsc.ts",
        "src/codegen/emit-individual-ts.ts",
        "src/codegen/emit-party-ts.ts",
        "src/io/**",
        "src/index.ts",
      ],
      thresholds: {
        lines: 100,
        branches: 100,
        functions: 100,
        statements: 100,
      },
    },
  },
});
