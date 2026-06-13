import { isMap, isSeq, LineCounter, type Node, parseDocument } from "yaml";

/**
 * yaml-block-style — data/ 配下の YAML が flow スタイル（`[ a, b ]` / `{ k: v }` のインライン記法）を
 * 含まないことを保証するための flow コレクション検出純関数。
 *
 * data YAML は skill 著述 SoT（catalog / regulations / rules）であり、flow と block が混在すると diff の
 * 可読性が落ちレビューで値の変化を追いにくくなる。本関数は `yaml` の `parseDocument` で AST を作り、
 * `flow === true` なコレクション（seq / map）を再帰的に検出して位置（path / 行番号）を列挙する。
 * 検出は AST ベースで、文字列値中の `[` / `{` を誤検出しない（正規表現での弾きは不可・[[testing]]）。
 * CLI 配線（`check:yaml-style`）はこの純関数へ委譲する薄い層に徹する（[[cli-and-io]]）。
 */

/** 検出した flow コレクションの位置。`path` はドット / 添字記法・`line` は 1 始まり。 */
export interface FlowLocation {
  /** ルートからのパス（例 `pokemon.garchomp.types` / `items[0]`）。ルート直下は空文字。 */
  path: string;
  /** flow コレクションが始まる 1 始まりの行番号。 */
  line: number;
}

/** YAMLMap の pair から key 名を取り出す（data YAML のキーは常にスカラ）。 */
const keyName = (key: unknown): string => String((key as { value: unknown }).value);

/**
 * YAML ソース文字列を AST に parse し、flow スタイルのコレクション（seq / map）を再帰的に検出して
 * 位置を列挙する。block のみなら空配列。flow seq / flow map / そのネストをいずれも検出する。
 */
export const findFlowCollections = (source: string): FlowLocation[] => {
  const lineCounter = new LineCounter();
  const doc = parseDocument(source, { lineCounter });
  const out: FlowLocation[] = [];

  // 検出対象（flow コレクション）は必ず source 由来で range を持つため、開始オフセットから行を引く。
  const lineOf = (node: Node): number =>
    lineCounter.linePos((node.range as [number, number, number])[0]).line;

  const walk = (node: Node | null, path: string): void => {
    if (isMap(node)) {
      if (node.flow === true) out.push({ path, line: lineOf(node) });
      for (const pair of node.items) {
        const child = path === "" ? keyName(pair.key) : `${path}.${keyName(pair.key)}`;
        walk(pair.value as Node | null, child);
      }
    } else if (isSeq(node)) {
      if (node.flow === true) out.push({ path, line: lineOf(node) });
      node.items.forEach((item, i) => {
        walk(item as Node | null, `${path}[${i}]`);
      });
    }
  };

  walk(doc.contents, "");
  return out;
};
