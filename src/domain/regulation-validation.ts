/**
 * レギュレーション YAML（authoring 時ゲート check:regulation）の妥当性検証を行う純関数。
 * I/O 非依存: パース済みの regulation レコードとカタログ集合を受け取り、検出した問題を列挙する。
 * generate.ts は変換専任（ADR 0022・ADR 0023）のため、参照整合 / schema の検出はここが担う。
 * 覚えない技（learnset legality）の照合は PokeAPI が Champions 非対応で実態と一致しないため撤去した
 * （ADR 0026・技の出自は Serebii 第一優先で authoring 段に担保）。
 * ファイル読込・YAML パースは io / cli 層（薄い glue）が担う（[[cli-and-io]]）。
 */

/** 予約キー（種族キーでない）。それ以外のトップレベルキー = 解禁種族（ADR 0022）。
 *  レギュ名は languages（regulations.yaml）が SoT で index.yaml に `name` を持たないため予約キーから外す（ADR 0035）。 */
export const RESERVED_REGULATION_KEYS: ReadonlySet<string> = new Set(["period", "items"]);

/** 検証に必要なカタログの最小集合（id の存在確認用）。 */
export interface RegulationCatalog {
  readonly species: ReadonlySet<string>;
  readonly items: ReadonlySet<string>;
  readonly moves: ReadonlySet<string>;
}

/** check:regulation が検出する問題。 */
export type RegulationIssue =
  | { readonly kind: "bad-species-block"; readonly species: string }
  | { readonly kind: "missing-species"; readonly species: string }
  | { readonly kind: "missing-item"; readonly item: string }
  | { readonly kind: "missing-mega"; readonly species: string; readonly mega: string }
  | { readonly kind: "missing-move"; readonly species: string; readonly move: string };

/** 1 種族キーの解禁内容（moves 必須・mega 任意）。 */
interface SpeciesAllow {
  readonly moves?: unknown;
  readonly mega?: unknown;
}

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");

/**
 * レギュレーション YAML の妥当性を検証し、問題を列挙する（空配列なら OK・CLI は非空で非0終了）。
 * 検証は参照整合（種族 / 持ち物 / メガ / 技が catalog に存在するか）と schema（種族ブロックの形）のみ。
 * 覚えない技（learnset legality）の照合は撤去した（ADR 0026・PokeAPI は Champions 非対応）。
 */
export const validateRegulation = (
  reg: Readonly<Record<string, unknown>>,
  catalog: RegulationCatalog,
): RegulationIssue[] => {
  const issues: RegulationIssue[] = [];

  // 予約 items: 解禁持ち物プールが catalog に存在するか。
  const items = reg.items;
  if (isStringArray(items)) {
    for (const item of items) {
      if (!catalog.items.has(item)) issues.push({ kind: "missing-item", item });
    }
  }

  // 種族キー（予約キー以外）。
  for (const species of Object.keys(reg)) {
    if (RESERVED_REGULATION_KEYS.has(species)) continue;
    const block = reg[species] as SpeciesAllow;
    if (typeof block !== "object" || block === null || !isStringArray(block.moves)) {
      issues.push({ kind: "bad-species-block", species });
      continue;
    }
    if (!catalog.species.has(species)) issues.push({ kind: "missing-species", species });
    for (const move of block.moves) {
      if (!catalog.moves.has(move)) issues.push({ kind: "missing-move", species, move });
    }
    if (block.mega !== undefined) {
      if (!isStringArray(block.mega)) {
        issues.push({ kind: "bad-species-block", species });
      } else {
        for (const mega of block.mega) {
          if (!catalog.species.has(mega)) issues.push({ kind: "missing-mega", species, mega });
        }
      }
    }
  }
  return issues;
};
