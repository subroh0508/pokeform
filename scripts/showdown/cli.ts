/**
 * scripts/showdown/cli.ts — `node tools/showdown/cli.js <regulation> <dataset>` で
 * 指定データセット（species/moves/items/abilities/mega）の中間 JSON を stdout に出す。
 *
 * pokemon-showdown ツリーで `node build` 後に実行する。出力 JSON は pokeform 側の
 * `scripts/sync-showdown.ts` が読み、`src/codegen/showdown/*-fields.ts` で SoT YAML へ転記する。
 */

import { extractAbilities } from "./abilities";
import { resolveRegulation } from "./dex";
import { extractItems } from "./items";
import { extractMega } from "./mega";
import { extractMoves } from "./moves";
import { extractSpecies } from "./species";

const DATASETS = ["species", "moves", "items", "abilities", "mega"] as const;
type Dataset = (typeof DATASETS)[number];

function isDataset(value: string): value is Dataset {
  return (DATASETS as readonly string[]).includes(value);
}

export function extractDataset(regulation: string, dataset: Dataset): unknown {
  const { dex, meta } = resolveRegulation(regulation);
  switch (dataset) {
    case "species":
      return { regulation: meta, species: extractSpecies(dex) };
    case "moves":
      return { regulation: meta, moves: extractMoves(dex) };
    case "items":
      return { regulation: meta, items: extractItems(dex) };
    case "abilities":
      return { regulation: meta, abilities: extractAbilities(dex) };
    case "mega":
      return { regulation: meta, mega: extractMega(dex) };
  }
}

if (require.main === module) {
  const [regulation, dataset] = process.argv.slice(2);
  if (!regulation || !dataset || !isDataset(dataset)) {
    console.error(
      `Usage: node tools/showdown/cli.js <regulation> <dataset>\n  dataset = ${DATASETS.join(" | ")}`,
    );
    process.exit(1);
  }
  console.log(JSON.stringify(extractDataset(regulation, dataset), null, 2));
}
