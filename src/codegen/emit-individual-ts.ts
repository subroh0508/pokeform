import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { parse as parseYaml } from "yaml";
import type { IndividualFile } from "../types/party.ts";
import { toAbilityId, toItemId, toMoveId, toSpeciesId, toStatKey } from "./normalize.ts";

/**
 * 個体 YAML → `*.individual.generated.ts` を生成する codegen（薄い変換層・カバレッジ対象外）。
 * 生成 TS にはブランド制約（`ValidMoves` / `ValidAbility` / `PointTotalMustBe66` 等）と
 * `// @source <yaml>:<line>` コメントを埋め、後段の `run-tsc` が tsc 診断を YAML 行へ逆引きする。
 * **codegen は常に成功してファイルを吐く**。不正（覚えない技・合計66 違反等）は tsc が型エラーとして
 * 検出する（[[tsc-verification]]）。名称は `lang` 宣言に従って ID へ正規化する（[[cli-and-io]]）。
 */

/** 1 ファイル分の生成結果（出力ファイル名と TS ソース）。 */
export interface EmittedFile {
  readonly outName: string;
  readonly code: string;
}

/** 個体の正規化済みデータ（emit-party がメンバー解決に再利用する）。 */
export interface NormalizedIndividual extends EmittedFile {
  readonly speciesId: string;
}

/** TS 識別子に使えるよう非英数を `_` に正規化する。 */
const ident = (base: string): string => base.replace(/[^A-Za-z0-9]/g, "_");

/** 文字列を TS 文字列リテラルとして安全に埋め込む（二重引用符）。 */
const q = (s: string): string => JSON.stringify(s);

/** トップレベルキー（`species:` 等）の 1-based 行番号を抽出する（フラットな個体 YAML 向け）。 */
const keyLines = (text: string): Record<string, number> => {
  const lines = text.split("\n");
  const out: Record<string, number> = {};
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i]?.match(/^([A-Za-z]+):/);
    if (m?.[1] && out[m[1]] === undefined) out[m[1]] = i + 1;
  }
  return out;
};

/** 個体 YAML を正規化し、生成 TS ソース（ブランド制約 + @source）を組み立てる。 */
export const normalizeIndividual = (yamlPath: string, root: string): NormalizedIndividual => {
  const text = readFileSync(yamlPath, "utf8");
  const ind = parseYaml(text) as IndividualFile;
  const lang = ind.lang ?? "ja";
  const rel = relative(root, yamlPath);
  const lines = keyLines(text);
  const at = (key: string): string => `// @source ${rel}:${lines[key] ?? 1}`;

  const speciesId = toSpeciesId(ind.species, lang) ?? ind.species;
  const abilityId = toAbilityId(ind.ability, lang) ?? ind.ability;
  const itemId = toItemId(ind.item, lang) ?? ind.item;
  const moveIds = (ind.moves ?? []).map((m) => toMoveId(m, lang) ?? m);

  // 能力ポイントを StatKey へ正規化（解決不能キーは生値のまま埋めて tsc に弾かせる）。
  const points: Record<string, number> = {};
  for (const [rawKey, value] of Object.entries(ind.points ?? {})) {
    points[toStatKey(rawKey, lang) ?? rawKey] = value;
  }
  const total = Object.values(points).reduce((sum, v) => sum + v, 0);
  const pointsLit = Object.entries(points)
    .map(([k, value]) => `${k}: ${value}`)
    .join(", ");

  const natureUp = toStatKey(ind.nature.up, lang) ?? ind.nature.up;
  const natureDown = toStatKey(ind.nature.down, lang) ?? ind.nature.down;

  const v = ident(speciesId);
  const movesTuple = `readonly [${moveIds.map(q).join(", ")}]`;
  const movesValue = `[${moveIds.map(q).join(", ")}]`;

  const code = `// 生成物（pokeform compile 出力・手書き編集しない）。
import type { PointTotalMustBe66, ValidAbility, ValidItem, ValidMoves } from "../src/types/individual.ts";
import type { NatureSpec } from "../src/types/nature.ts";
import type { PointAllocation } from "../src/types/stats.ts";

${at("nature")}
const ${v}_nature = { up: ${q(natureUp)}, down: ${q(natureDown)} } satisfies NatureSpec;
${at("ability")}
const ${v}_ability: ValidAbility<${q(speciesId)}, ${q(abilityId)}> = ${q(abilityId)};
${at("item")}
const ${v}_item: ValidItem<${q(speciesId)}, ${q(itemId)}> = ${q(itemId)};
${at("points")}
const ${v}_points = { ${pointsLit} } as const satisfies PointAllocation satisfies PointTotalMustBe66<${total}>;
${at("moves")}
const ${v}_moves: ValidMoves<${q(speciesId)}, ${movesTuple}> = ${movesValue};

export const ${v}Individual = { ${v}_nature, ${v}_ability, ${v}_item, ${v}_points, ${v}_moves };
`;

  return { speciesId, outName: `${ident(rel)}.individual.generated.ts`, code };
};

/** 個体 YAML から `EmittedFile` を生成する。 */
export const emitIndividual = (yamlPath: string, root: string): EmittedFile => {
  const { outName, code } = normalizeIndividual(yamlPath, root);
  return { outName, code };
};
