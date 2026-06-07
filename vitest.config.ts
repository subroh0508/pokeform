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
        "src/cli/**",
        "src/codegen/**",
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
