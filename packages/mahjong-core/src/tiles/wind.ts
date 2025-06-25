// 風位・方向関連の型定義

import { Tile, Tiles } from "./tile";

/**
 * 相対方向クラス（自家から見た位置）
 */
export class Side {
  readonly code: string;
  readonly name: string;
  readonly ordinal: number;

  private static values: Side[] = [];
  static setValues(values: Side[]): void {
    this.values = values;
  }

  constructor(code: string, name: string, offset: number) {
    this.code = code;
    this.name = name;
    this.ordinal = offset;
  }

  /**
   * この相対方位から見た相対方位の位置を返します（相対方位の合成）
   * @param target 対象の相対方位
   * @returns この相対方位からみた対象相対方位の位置
   */
  of(target: Side): Side {
    return Side.values[(this.ordinal + target.ordinal) % 4];
  }

  /**
   * この相対位置以外の相対位置をリスト形式で返します
   * @returns 残りの相対位置のリスト
   */
  others(): Side[] {
    return [
      Sides.RIGHT.of(this),
      Sides.ACROSS.of(this), 
      Sides.LEFT.of(this)
    ];
  }
}

// 相対方向の定義オブジェクト
export const Sides = {
  SELF: new Side('SELF', '自家', 0),      // 自分
  RIGHT: new Side('RIGHT', '下家', 1),    // 右隣（下家）
  ACROSS: new Side('ACROSS', '対面', 2),  // 対面
  LEFT: new Side('LEFT', '上家', 3)       // 左隣（上家）
} as const;

const SIDE_VALUES = [Sides.SELF, Sides.RIGHT, Sides.ACROSS, Sides.LEFT];
Side.setValues(SIDE_VALUES);

/**
 * 絶対風位クラス（東西南北）
 */
export class Wind {
  readonly code: string;
  readonly name: string;
  readonly ordinal: number;

  private static values: Wind[] = [];
  static setValues(values: Wind[]): void {
    this.values = values;
  }

  constructor(code: string, name: string, ordinal: number) {
    this.code = code;
    this.name = name;
    this.ordinal = ordinal;
  }

  /**
   * 東南西北の順に習い、次の風位を返します
   * @returns 次の風位（東→南→西→北→東...）
   */
  next(): Wind {
    return this.shift(1);
  }

  /**
   * 東南西北の順に習い、指定した数だけ風位を進めます
   * @param n 進める数
   * @returns 移動後の風位
   */
  shift(n: number): Wind {
    if (n < 0) {
      throw new Error(`Shift value must be non-negative: ${n}`);
    }
    return Wind.values[(this.ordinal + n) % 4];
  }

  /**
   * この風位から見た対象風位の相対方位を返します
   * @param target 対象の風位
   * @returns この風位からみた対象風位の相対位置
   */
  from(reference: Wind): Side {
    return SIDE_VALUES[(4 + this.ordinal - reference.ordinal) % 4];
  }

  /**
   * この風位以外の風位をリストで返します
   * @returns 残りの風位のリスト
   */
  others(): Wind[] {
    return [
      this.shift(1),
      this.shift(2),
      this.shift(3)
    ]
  }
}

// 風位の定義オブジェクト
export const Winds = {
  EAST: new Wind('E', '東', 0),
  SOUTH: new Wind('S', '南', 1),
  WEST: new Wind('W', '西', 2),
  NORTH: new Wind('N', '北', 3)
} as const;

const WIND_VALUES = [Winds.EAST, Winds.SOUTH, Winds.WEST, Winds.NORTH];
Wind.setValues(WIND_VALUES);

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
    case Winds.EAST: return Tiles.WE;   // 東
    case Winds.SOUTH: return Tiles.WS;  // 南
    case Winds.WEST: return Tiles.WW;   // 西
    case Winds.NORTH: return Tiles.WN;  // 北
    default: throw new Error(`Invalid wind: ${wind.code}`);
  }
}

/**
 * 風牌に対応する風位を返します
 * @param tile 風牌
 * @returns 対応する風位、風牌でない場合は null
 */
export function tileToWind(tile: Tile): Wind {
  switch (tile) {
    case Tiles.WE: return Winds.EAST;   // 東
    case Tiles.WS: return Winds.SOUTH;  // 南
    case Tiles.WW: return Winds.WEST;   // 西
    case Tiles.WN: return Winds.NORTH;  // 北
    default: throw new Error(`Tile is not a wind tile: ${tile.code}`);
  }
}
