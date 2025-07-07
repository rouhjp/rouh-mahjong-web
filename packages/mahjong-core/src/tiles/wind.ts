import type { Tile } from "./tile";

// Wind型をstring unionに変更
export type Wind = 'EAST' | 'SOUTH' | 'WEST' | 'NORTH';

// Side型をstring unionに変更
export type Side = 'SELF' | 'RIGHT' | 'ACROSS' | 'LEFT';

// 風位の定数定義
export const Winds = {
  EAST: 'EAST' as const,
  SOUTH: 'SOUTH' as const,
  WEST: 'WEST' as const,
  NORTH: 'NORTH' as const
} as const;

// 相対方向の定数定義
export const Sides = {
  SELF: 'SELF' as const,      // 自分
  RIGHT: 'RIGHT' as const,    // 右隣（下家）
  ACROSS: 'ACROSS' as const,  // 対面
  LEFT: 'LEFT' as const       // 左隣（上家）
} as const;

// 風位の情報マップ
export const WindInfo: Record<Wind, { code: string; name: string; ordinal: number }> = {
  EAST: { code: 'E', name: '東', ordinal: 0 },
  SOUTH: { code: 'S', name: '南', ordinal: 1 },
  WEST: { code: 'W', name: '西', ordinal: 2 },
  NORTH: { code: 'N', name: '北', ordinal: 3 }
};

// 相対方向の情報マップ
export const SideInfo: Record<Side, { code: string; name: string; ordinal: number }> = {
  SELF: { code: 'SELF', name: '自家', ordinal: 0 },
  RIGHT: { code: 'RIGHT', name: '下家', ordinal: 1 },
  ACROSS: { code: 'ACROSS', name: '対面', ordinal: 2 },
  LEFT: { code: 'LEFT', name: '上家', ordinal: 3 }
};

// 風位配列（順序固定）
const WIND_VALUES: Wind[] = ['EAST', 'SOUTH', 'WEST', 'NORTH'];
const SIDE_VALUES: Side[] = ['SELF', 'RIGHT', 'ACROSS', 'LEFT'];

// ユーティリティ関数

/**
 * 次の風位を取得します
 * @param wind 現在の風位
 * @returns 次の風位
 */
export function nextWind(wind: Wind): Wind {
  return shiftWind(wind, 1);
}

/**
 * 指定した数だけ風位をシフトします
 * @param wind 現在の風位
 * @param n シフト数（非負の整数）
 * @returns シフト後の風位
 */
export function shiftWind(wind: Wind, n: number): Wind {
  if (n < 0) {
    throw new Error(`Shift value must be non-negative: ${n}`);
  }
  const ordinal = WindInfo[wind].ordinal;
  return WIND_VALUES[(ordinal + n) % 4];
}

/**
 * 基準風位からの相対方位を取得します
 * @param target 対象の風位
 * @param reference 基準の風位
 * @returns 相対方位
 */
export function getRelativeSide(target: Wind, reference: Wind): Side {
  const targetOrdinal = WindInfo[target].ordinal;
  const referenceOrdinal = WindInfo[reference].ordinal;
  return SIDE_VALUES[(4 + targetOrdinal - referenceOrdinal) % 4];
}

/**
 * 他の3つの風位を取得します
 * @param wind 基準の風位
 * @returns 他の3つの風位の配列
 */
export function getOtherWinds(wind: Wind): Wind[] {
  return [
    shiftWind(wind, 1),
    shiftWind(wind, 2),
    shiftWind(wind, 3)
  ];
}

/**
 * 相対方位から実際の風位を取得します
 * @param side 相対方位
 * @param reference 基準の風位
 * @returns 実際の風位
 */
export function getSideTarget(side: Side, reference: Wind): Wind {
  const offset = SideInfo[side].ordinal;
  return shiftWind(reference, offset);
}

/**
 * 他の3つの相対方位を取得します
 * @param side 基準の相対方位
 * @returns 他の3つの相対方位の配列
 */
export function getOtherSides(side: Side): Side[] {
  const ordinal = SideInfo[side].ordinal;
  return [
    SIDE_VALUES[(ordinal + 1) % 4],
    SIDE_VALUES[(ordinal + 2) % 4],
    SIDE_VALUES[(ordinal + 3) % 4]
  ];
}

/**
 * サイコロ2個の目から起家の相対方位を返します
 * @param d1 1つ目のサイコロの目の値(1..6)
 * @param d2 2つ目のサイコロの目の値(1..6)
 * @returns RIGHT  サイコロの目の合計が 2, 6, 10 のとき
 *          ACROSS サイコロの眼の合計が 3, 7, 11 のとき
 *          LEFT   サイコロの眼の合計が 4, 8, 12 のとき
 *          SELF   サイコロの眼の合計が 5, 9 のとき
 * @throws Error 与えられたサイコロの目が1~6の範囲外の場合
 */
export function getSideByDice(d1: number, d2: number): Side {
  if (d1 <= 0 || d2 <= 0 || d1 > 6 || d2 > 6) {
    throw new Error(`Invalid dice value: ${d1}, ${d2}`);
  }
  return getSideByDiceSum(d1 + d2);
}

/**
 * サイコロの合計値から起家の相対方位を返します
 * @param diceSum 2つのサイコロの目の合計値(2..12)
 * @returns RIGHT  サイコロの目の合計が 2, 6, 10 のとき
 *          ACROSS サイコロの眼の合計が 3, 7, 11 のとき
 *          LEFT   サイコロの眼の合計が 4, 8, 12 のとき
 *          SELF   サイコロの眼の合計が 5, 9 のとき
 * @throws Error 与えられたサイコロの目の合計が2~12の範囲外の場合
 */
export function getSideByDiceSum(diceSum: number): Side {
  if (diceSum < 2 || diceSum > 12) {
    throw new Error(`Invalid dice sum: ${diceSum}`);
  }
  return SIDE_VALUES[(diceSum - 1) % 4];
}

/**
 * 風位に対応する風牌を返します
 * @param wind 風位
 * @returns 対応する風牌
 */
export function windToTile(wind: Wind): Tile {
  switch (wind) {
    case 'EAST': return 'WE' as Tile;   // 東
    case 'SOUTH': return 'WS' as Tile;  // 南
    case 'WEST': return 'WW' as Tile;   // 西
    case 'NORTH': return 'WN' as Tile;  // 北
    default: 
      const _exhaustive: never = wind;
      throw new Error(`Invalid wind: ${_exhaustive}`);
  }
}

/**
 * 風牌に対応する風位を返します
 * @param tile 風牌
 * @returns 対応する風位、風牌でない場合は null
 */
export function tileToWind(tile: Tile): Wind {
  switch (tile) {
    case 'WE': return 'EAST';   // 東
    case 'WS': return 'SOUTH';  // 南
    case 'WW': return 'WEST';   // 西
    case 'WN': return 'NORTH';  // 北
    default: throw new Error(`Tile is not a wind tile: ${tile}`);
  }
}