// 風位・方向関連のユーティリティ関数

import { Wind, Winds, Side, Sides, WIND_ORDER, SIDE_ORDER } from './types';
import { Tiles } from '../tiles/types';
import type { Tile } from '../tiles/types';

/**
 * 東南西北の順に習い、次の風位を返します
 * 
 * 例: EAST.next() == SOUTH, NORTH.next() == EAST
 * @param wind 現在の風位
 * @returns 次の風位（東→南→西→北→東...）
 */
export function nextWind(wind: Wind): Wind {
  return shiftWind(wind, 1);
}

/**
 * 東南西北の順に習い、指定した数だけ風位を進めます
 * 
 * 例: EAST.shift(1) == SOUTH, NORTH.shift(1) == EAST
 * @param wind 現在の風位
 * @param n 進める数（負の数で戻る）
 * @returns 移動後の風位
 */
export function shiftWind(wind: Wind, n: number): Wind {
  const newOrder = (wind.order + n + 4) % 4;
  return WIND_ORDER[newOrder];
}

/**
 * 基準風位の相対方位にある風位を返します
 * 
 * 例: getWindAt(Wind.EAST, RIGHT) == Wind.SOUTH
 * @param reference 基準の風位
 * @param side 相対方位
 * @returns 基準の風位からみて相対方位にある風位
 */
export function getWindAt(reference: Wind, side: Side): Wind {
  return shiftWind(reference, side.offset);
}

/**
 * 基準相対方位から見た相対方位の位置を返します（相対方位の合成）
 * 
 * 例: getSideAt(RIGHT, RIGHT) == ACROSS（下家から見た下家は対面）
 * @param reference 基準の相対方位
 * @param target 対象の相対方位
 * @returns 基準相対方位からみた対象相対方位の位置
 */
export function getSideAt(reference: Side, target: Side): Side {
  const newOffset = (reference.offset + target.offset) % 4;
  return SIDE_ORDER[newOffset];
}

/**
 * 基準風位から見た対象風位の相対方位を返します
 * 
 * 例: getSideOf(SOUTH, EAST) == Side.LEFT（南から見た東は左）
 * @param reference 基準の風位
 * @param target 対象の風位
 * @returns 基準の風位からみた対象風位の相対位置
 */
export function getSideOf(reference: Wind, target: Wind): Side {
  const offset = (target.order - reference.order + 4) % 4;
  return SIDE_ORDER[offset];
}

/**
 * この風位以外の風位をリストで返します
 * 
 * 例: SOUTH.others() は [EAST, WEST, NORTH] と等価
 * @param wind 基準の風位
 * @returns 残りの風位のリスト
 */
export function otherWinds(wind: Wind): Wind[] {
  return WIND_ORDER.filter(w => w !== wind);
}

/**
 * この相対位置以外の相対位置をリスト形式で返します
 * 
 * 例: SELF.others() は [RIGHT, ACROSS, LEFT] と等価
 * @param side 基準の相対方位
 * @returns 残りの相対位置のリスト
 */
export function otherSides(side: Side): Side[] {
  return [
    getSideAt(Sides.RIGHT, side),
    getSideAt(Sides.ACROSS, side), 
    getSideAt(Sides.LEFT, side)
  ];
}

/**
 * 風位に対応する風牌を返します
 * @param wind 風位
 * @returns 対応する風牌
 */
export function windToTile(wind: Wind): Tile {
  switch (wind) {
    case Winds.EAST: return Tiles.WE;
    case Winds.SOUTH: return Tiles.WS;
    case Winds.WEST: return Tiles.WW;
    case Winds.NORTH: return Tiles.WN;
    default: throw new Error(`Invalid wind: ${wind}`);
  }
}

/**
 * 風牌に対応する風位を返します
 * @param tile 風牌
 * @returns 対応する風位
 */
export function tileToWind(tile: Tile): Wind | null {
  switch (tile) {
    case Tiles.WE: return Winds.EAST;
    case Tiles.WS: return Winds.SOUTH;
    case Tiles.WW: return Winds.WEST;
    case Tiles.WN: return Winds.NORTH;
    default: return null;
  }
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
  const index = (diceSum - 1) % 4;
  return SIDE_ORDER[index];
}
