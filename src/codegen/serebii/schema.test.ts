import { describe, expect, it } from "vitest";
import type { SerebiiAbility } from "./parse-abilities.ts";
import type { SerebiiItem, SerebiiItemName } from "./parse-items.ts";
import type { SerebiiMega } from "./parse-mega.ts";
import type { SerebiiMove } from "./parse-moves.ts";
import type { SerebiiSpecies } from "./parse-species.ts";
import {
  validateAbility,
  validateItem,
  validateItemsRoster,
  validateMega,
  validateMove,
  validateSpecies,
} from "./schema.ts";

const species = (o: Partial<SerebiiSpecies> = {}): SerebiiSpecies => ({
  id: "charizard",
  en: "Charizard",
  ja: "リザードン",
  dex: 6,
  types: ["fire", "flying"],
  abilities: ["blaze"],
  stats: { H: 78, A: 84, B: 78, C: 109, D: 85, S: 100 },
  statTotal: 534,
  moves: ["earthquake"],
  ...o,
});

const move = (o: Partial<SerebiiMove> = {}): SerebiiMove => ({
  id: "earthquake",
  en: "Earthquake",
  ja: "じしん",
  type: "ground",
  damageClass: "physical",
  power: 100,
  accuracy: 100,
  pp: 12,
  priority: 0,
  ...o,
});

const mega = (o: Partial<SerebiiMega> = {}): SerebiiMega => ({
  id: "charizard-mega-x",
  en: "Mega Charizard X",
  ja: "",
  baseSpecies: "charizard",
  types: ["fire", "dragon"],
  ability: "tough-claws",
  stats: { H: 78, A: 130, B: 111, C: 130, D: 85, S: 100 },
  statTotal: 634,
  ...o,
});

describe("validateSpecies", () => {
  it("健全なら stage 0", () => {
    expect(validateSpecies(species()).stage).toBe(0);
  });

  it("必須欄欠落（ja / dex / types / abilities / stats / moves / id / en）は stage 3", () => {
    const r = validateSpecies(
      species({
        id: "",
        en: "",
        ja: "",
        dex: null,
        types: [],
        abilities: [],
        statTotal: null,
        moves: [],
      }),
    );
    expect(r.stage).toBe(3);
    expect(r.missingFields).toContain("ja");
  });

  it("種族値合計不一致 / id 形不適合は stage 4", () => {
    const r = validateSpecies(species({ statTotal: 999, abilities: ["Bad Ability"] }));
    expect(r.stage).toBe(4);
    expect(r.issues.length).toBeGreaterThan(0);
  });
});

describe("validateMove", () => {
  it("健全なら stage 0", () => {
    expect(validateMove(move()).stage).toBe(0);
  });

  it("必須欄欠落は stage 3（id/en/ja/type/damageClass/pp/priority）", () => {
    const r = validateMove(
      move({ id: "", en: "", ja: "", type: "", damageClass: "", pp: null, priority: null }),
    );
    expect(r.stage).toBe(3);
    expect(r.missingFields).toEqual(["id", "en", "ja", "type", "damageClass", "pp", "priority"]);
  });

  it("健全性違反（pp スケール外 / damageClass / 負値 / priority レンジ / id 形）は stage 4", () => {
    const r = validateMove(
      move({ id: "Bad", pp: 7, damageClass: "weird", power: -1, accuracy: -1, priority: 99 }),
    );
    expect(r.stage).toBe(4);
    expect(r.issues.length).toBeGreaterThanOrEqual(5);
  });
});

describe("validateAbility", () => {
  const valid: SerebiiAbility = { id: "blaze", en: "Blaze", ja: "もうか" };
  it("健全 / 欠落 / id 形", () => {
    expect(validateAbility(valid).stage).toBe(0);
    expect(validateAbility({ id: "", en: "", ja: "" }).missingFields).toEqual(["id", "en", "ja"]);
    expect(validateAbility({ id: "Bad Id", en: "X", ja: "y" }).stage).toBe(4);
  });
});

describe("validateItemsRoster", () => {
  const valid: SerebiiItem = {
    id: "leftovers",
    en: "Leftovers",
    slug: "leftovers",
    category: "hold",
    megaStoneFor: null,
  };
  it("空は stage 3、健全は 0", () => {
    expect(validateItemsRoster([]).stage).toBe(3);
    expect(validateItemsRoster([valid]).stage).toBe(0);
  });

  it("id 形 / メガ先欠落 / メガ先形は stage 4", () => {
    const r = validateItemsRoster([
      { ...valid, id: "Bad", slug: "" },
      { id: "stone", en: "Stone", slug: "stone", category: "mega-stone", megaStoneFor: null },
      { id: "s2", en: "S2", slug: "s2", category: "mega-stone", megaStoneFor: "Bad Base" },
    ]);
    expect(r.stage).toBe(4);
    expect(r.issues.length).toBe(3);
  });
});

describe("validateItem", () => {
  const valid: SerebiiItemName = { id: "leftovers", en: "Leftovers", ja: "たべのこし" };
  it("健全 / 欠落 / id 形", () => {
    expect(validateItem(valid).stage).toBe(0);
    expect(validateItem({ id: "", en: "", ja: "" }).missingFields).toEqual(["id", "en", "ja"]);
    expect(validateItem({ id: "Bad Id", en: "x", ja: "y" }).stage).toBe(4);
  });
});

describe("validateMega", () => {
  it("メガ無し（空配列）は健全 stage 0", () => {
    expect(validateMega([]).stage).toBe(0);
  });

  it("健全なメガ群は stage 0", () => {
    expect(validateMega([mega()]).stage).toBe(0);
  });

  it("必須欄欠落は stage 3", () => {
    expect(
      validateMega([
        mega({ id: "", en: "", baseSpecies: "", types: [], ability: "", statTotal: null }),
      ]).stage,
    ).toBe(3);
  });

  it("健全性違反（合計不一致 / id 形 / base 形 / ability 形）は stage 4", () => {
    const r = validateMega([
      mega({ id: "Bad", baseSpecies: "Bad Base", ability: "Bad Ability", statTotal: 999 }),
    ]);
    expect(r.stage).toBe(4);
    expect(r.issues.length).toBeGreaterThanOrEqual(4);
  });
});
