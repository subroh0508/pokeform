/**
 * load.ts（テスト用ヘルパ・coverage 除外）— 実 Serebii ページ由来の latin-1 fixture を読み、
 * `decodeSerebiiHtml` でデコードした HTML 文字列を返す。各 `parse-*.test.ts` が共有する。
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { decodeSerebiiHtml } from "../decode.ts";

const DIR = dirname(fileURLToPath(import.meta.url));

/** fixture（latin-1 バイト列）を読み、デコード済み HTML 文字列を返す。 */
export function fixture(name: string): string {
  return decodeSerebiiHtml(new Uint8Array(readFileSync(join(DIR, name))));
}
