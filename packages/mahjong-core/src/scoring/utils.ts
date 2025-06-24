// 面子関連のユーティリティ関数

import { Waits, PointTypes, type Wait, type PointType, type Hand } from './types';
import type { Meld } from './meld';
import { Wind, windToTile, type Tile } from '../tiles/tile.js';

/**
 * 手牌の全ての牌を取得します（手牌 + 公開面子の全牌 + 和了牌）
 * @param hand 手牌情報
 * @returns 全ての牌のリスト（槓子は4枚で計算）
 */
export function getAllHandTiles(hand: Hand): Tile[] {
  const allTiles: Tile[] = [...hand.handTiles];
  
  // 公開面子の全牌を追加
  for (const meld of hand.openMelds) {
    allTiles.push(...meld.getAllTiles());
  }
  
  // 和了牌を追加
  allTiles.push(hand.winningTile);
  
  return allTiles;
}

/**
 * 手牌の切り詰められた牌を取得します（手牌 + 公開面子の3枚牌 + 和了牌）
 * @param hand 手牌情報
 * @returns 切り詰められた牌のリスト（槓子は3枚で計算）
 */
export function getTruncatedHandTiles(hand: Hand): Tile[] {
  const allTiles: Tile[] = [...hand.handTiles];
  
  // 公開面子の切り詰められた牌を追加
  for (const meld of hand.openMelds) {
    allTiles.push(...meld.getTruncatedTiles());
  }
  
  // 和了牌を追加
  allTiles.push(hand.winningTile);
  
  return allTiles;
}

/**
 * 面子と和了牌から待ちの種類を判定します
 * @param meld 面子
 * @param winningTile 和了牌
 * @returns 待ちの種類
 * @throws Error 和了牌が面子に含まれていない場合
 */
export function getWait(meld: Meld, winningTile: Tile): Wait {
  if (!meld.getAllTiles().includes(winningTile)) {
    throw new Error(`No winning tile found: ${winningTile.code} in meld`);
  }
  
  if (meld.isStraight()) {
    const sortedTiles = meld.getSortedTiles();
    // 真ん中の牌が和了牌の場合は嵌張待ち
    if (sortedTiles[1].equalsIgnoreRed(winningTile)) {
      return Waits.MIDDLE_STRAIGHT;
    }
    // 面子が老頭牌を含み、和了牌が老頭牌でない場合は辺張待ち
    if (meld.isTerminalMeld() && !winningTile.isTerminal()) {
      return Waits.SINGLE_SIDE_STRAIGHT;
    }
    // それ以外は両面待ち
    return Waits.DOUBLE_SIDE_STRAIGHT;
  }
  
  // 順子でない場合は双碰待ち
  return Waits.EITHER_HEAD;
}

/**
 * 雀頭（2枚組）に対応する符の種類を取得します
 * @param headTiles 雀頭の牌（2枚）
 * @param roundWind 場風
 * @param seatWind 自風
 * @returns 符の種類
 */
export function getPointTypeFromHead(headTiles: Tile[], roundWind: Wind, seatWind: Wind): PointType {
  if (headTiles.length !== 2) {
    throw new Error(`Invalid head tiles: expected 2 tiles, got ${headTiles.length}`);
  }
  
  const firstTile = headTiles[0];
  
  if (firstTile.isDragon()) {
    return PointTypes.HEAD_DRAGON;
  }
  
  if (firstTile.isWind()) {
    const seatWindTile = windToTile(seatWind);
    const roundWindTile = windToTile(roundWind);
    
    const isSeatWindHead = firstTile.equalsIgnoreRed(seatWindTile);
    const isRoundWindHead = firstTile.equalsIgnoreRed(roundWindTile);
    
    if (isSeatWindHead && isRoundWindHead) {
      return PointTypes.DOUBLE_VALUABLE_HEAD;
    }
    if (isSeatWindHead) {
      return PointTypes.HEAD_SEAT_WIND;
    }
    if (isRoundWindHead) {
      return PointTypes.HEAD_ROUND_WIND;
    }
    return PointTypes.HEAD_OTHER_WIND;
  }
  
  return PointTypes.HEAD_SUIT;
}

/**
 * 待ちに対応する符の種類を取得します
 * @param wait 待ち
 * @returns 符の種類
 */
export function getPointTypeFromWait(wait: Wait): PointType {
  switch (wait) {
    case Waits.EITHER_HEAD:
      return PointTypes.EITHER_HEAD_WAIT;
    case Waits.SINGLE_HEAD:
      return PointTypes.SINGLE_HEAD_WAIT;
    case Waits.MIDDLE_STRAIGHT:
      return PointTypes.MIDDLE_STRAIGHT_WAIT;
    case Waits.DOUBLE_SIDE_STRAIGHT:
      return PointTypes.DOUBLE_SIDE_STRAIGHT_WAIT;
    case Waits.SINGLE_SIDE_STRAIGHT:
      return PointTypes.SINGLE_SIDE_STRAIGHT_WAIT;
    default:
      throw new Error(`Unknown wait type: ${wait}`);
  }
}

/**
 * 面子に対応する符の種類を取得します
 * @param meld 面子
 * @returns 符の種類
 */
export function getPointTypeFromMeld(meld: Meld): PointType {
  if (meld.isStraight()) {
    return PointTypes.STRAIGHT;
  }
  
  if (meld.isQuad()) {
    if (meld.isConcealed()) {
      if (meld.isOrphanMeld()) {
        return PointTypes.ORPHAN_CONCEALED_QUAD;
      }
      return PointTypes.CONCEALED_QUAD;
    }
    if (meld.isOrphanMeld()) {
      return PointTypes.ORPHAN_QUAD;
    }
    return PointTypes.QUAD;
  }
  
  // 刻子の場合
  if (meld.isConcealed()) {
    if (meld.isOrphanMeld()) {
      return PointTypes.ORPHAN_CONCEALED_TRIPLE;
    }
    return PointTypes.CONCEALED_TRIPLE;
  }
  
  if (meld.isOrphanMeld()) {
    return PointTypes.ORPHAN_TRIPLE;
  }
  
  return PointTypes.TRIPLE;
}

