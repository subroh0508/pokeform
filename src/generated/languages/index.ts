// 生成物（scripts/generate.ts 出力）。手書き編集しない。data/champions・data/languages を直し再生成する。

import { abilityNames } from "./abilities.ts";
import { itemNames } from "./items.ts";
import { megaNames } from "./mega.ts";
import { moveNames } from "./moves.ts";
import { speciesNames } from "./species.ts";
import { typeNames } from "./types.ts";

export { abilityNames, itemNames, megaNames, moveNames, speciesNames, typeNames };

// base + メガ名を統合した forward マップ（種族表示名の実行時ルックアップ用）。
export const speciesNamesAll = { ...speciesNames, ...megaNames };
