/**
 * ダメージ計算の純関数（I/O 非依存）。MVP では**確定耐え / 確定数の判定に必要な範囲**に絞る
 * （乱数16段の上下限・STAB・タイプ相性のみ。急所 / 天候 / 持ち物 / 特性補正は将来計画 `02-<slug>`）。
 * 計算式は第5世代以降の標準式を Lv 既定 50 で実装する。正本は .claude/rules/game-spec.md（ダメージ式）。
 *
 * 素ダメージ = `floor( floor( (floor(2L/5) + 2) × 威力 × 攻撃 / 防御 ) / 50 ) + 2`
 * → STAB（×1.5 floor）→ タイプ相性（×倍率 floor）→ 乱数（×0.85〜1.00 floor）。
 * 乱数最大（×1.00）が `maxDamage`、最小（×0.85）が `minDamage`。
 */

/** 既定レベル（ポケモンチャンピオンズは Lv50 固定・[[game-spec]]）。 */
export const LEVEL = 50;

/** ダメージ計算の入力（攻撃側の実数値・技威力・防御側の実数値と補正）。 */
export interface DamageInput {
  /** 技威力。 */
  readonly power: number;
  /** 攻撃側の攻撃系実数値（物理 = 攻撃 / 特殊 = 特攻）。 */
  readonly attack: number;
  /** 防御側の防御系実数値（物理 = 防御 / 特殊 = 特防）。 */
  readonly defense: number;
  /** レベル（既定 50）。 */
  readonly level?: number;
  /** タイプ一致（STAB ×1.5）。既定 false。 */
  readonly stab?: boolean;
  /** タイプ相性倍率（×0/0.25/0.5/1/2/4 等）。既定 1。 */
  readonly effectiveness?: number;
}

/** 乱数・STAB・相性補正前の素ダメージ。`floor( floor(C×威力×攻撃 / 防御) / 50 ) + 2`（C = floor(2L/5)+2）。 */
export const baseDamage = (
  power: number,
  attack: number,
  defense: number,
  level = LEVEL,
): number => {
  const numerator = (Math.floor((2 * level) / 5) + 2) * power * attack;
  return Math.floor(Math.floor(numerator / defense) / 50) + 2;
};

/** STAB・タイプ相性を適用した（乱数前の）ダメージ。乱数最大（×1.00）と一致する。 */
const modifiedDamage = (input: DamageInput): number => {
  const { power, attack, defense, level = LEVEL, stab = false, effectiveness = 1 } = input;
  let dmg = baseDamage(power, attack, defense, level);
  if (stab) dmg = Math.floor(dmg * 1.5);
  return Math.floor(dmg * effectiveness);
};

/** 乱数最大（×1.00）のダメージ。確定耐え判定（耐えるには HP > maxDamage）に使う。 */
export const maxDamage = (input: DamageInput): number => modifiedDamage(input);

/** 乱数最小（×0.85）のダメージ。確定数判定（最悪ロールでも倒すか）に使う。 */
export const minDamage = (input: DamageInput): number => Math.floor(modifiedDamage(input) * 0.85);
