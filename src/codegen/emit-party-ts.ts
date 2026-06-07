import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import matter from "gray-matter";
import type { PartyFrontmatter } from "../types/party.ts";
import { type EmittedFile, normalizeIndividual } from "./emit-individual-ts.ts";

/**
 * パーティ Markdown → `*.party.generated.ts`（+ 各メンバー個体の `*.individual.generated.ts`）を
 * 生成する codegen（薄い変換層・カバレッジ対象外）。パーティ制約（同種族重複・タプル長 ≤6・レギュ整合）を
 * `satisfies ConstrainParty<typeof members, R>` で型表現し、各メンバーの種族 ID を解決してタプルに埋める。
 * 参照切れメンバーは生のパス文字列を埋め、`SpeciesNotFound` ブランドで tsc に弾かせる（[[tsc-verification]]）。
 */

/** 文字列を TS 文字列リテラルとして安全に埋め込む。 */
const q = (s: string): string => JSON.stringify(s);

/** TS 識別子に使えるよう非英数を `_` に正規化する。 */
const ident = (base: string): string => base.replace(/[^A-Za-z0-9]/g, "_");

/** 指定キー（`members:` / `regulation:`）の 1-based 行番号を返す（frontmatter 内）。 */
const keyLine = (text: string, key: string): number => {
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]?.startsWith(`${key}:`)) return i + 1;
  }
  return 1;
};

/** パーティ MD から party ファイル + メンバー個体ファイル群を生成する。 */
export const emitParty = (mdPath: string, root: string): EmittedFile[] => {
  const text = readFileSync(mdPath, "utf8");
  const { data } = matter(text);
  const fm = data as PartyFrontmatter;
  const baseDir = dirname(resolve(mdPath));
  const rel = relative(root, mdPath);
  const regulation = fm.regulation ?? "";
  const memberLine = keyLine(text, "members");

  const memberFiles: EmittedFile[] = [];
  const seen = new Set<string>();
  const speciesIds: string[] = [];

  for (const memberRel of fm.members ?? []) {
    const abs = resolve(baseDir, memberRel);
    if (!existsSync(abs)) {
      // 参照切れ: 生のパスを種族 ID 位置に埋め、SpeciesNotFound ブランドで弾かせる。
      speciesIds.push(memberRel);
      continue;
    }
    const { speciesId, outName, code } = normalizeIndividual(abs, root);
    speciesIds.push(speciesId);
    if (!seen.has(outName)) {
      seen.add(outName);
      memberFiles.push({ outName, code });
    }
  }

  const membersValue = `[${speciesIds.map(q).join(", ")}]`;
  const v = ident(rel);
  const partyCode = `// 生成物（pokeform compile 出力・手書き編集しない）。
import type { ConstrainParty } from "../src/types/party.ts";

const ${v}_members = ${membersValue} as const;
// @source ${rel}:${memberLine}
const ${v}_check: ConstrainParty<typeof ${v}_members, ${q(regulation)}> = ${v}_members;
export { ${v}_check as ${v}Party };
`;

  return [{ outName: `${ident(rel)}.party.generated.ts`, code: partyCode }, ...memberFiles];
};
