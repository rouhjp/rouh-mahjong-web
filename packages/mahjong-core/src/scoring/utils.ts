// 面子関連のユーティリティ関数

import { Waits, PointTypes, type Meld, type Wait, type PointType, type Hand } from './types';
import type { Tile } from '../tiles/types';
import type { Side, Wind } from '../winds/types';
import { Sides } from '../winds/types';
import { isTripleTiles, isQuadTiles, isStraightTiles, sorted, equalsIgnoreRed, isTerminal, isDragon, isWind, isOrphan } from '../tiles/utils';
import { windToTile } from '../winds/utils';

/**
 * この面子が順子であるか検査します
 * @param meld 面子
 * @returns true 順子の場合、false 順子でない場合
 */
export function isStraight(meld: Meld): boolean {
  const allTiles = getAllTiles(meld);
  return isStraightTiles(allTiles);
}

/**
 * この面子が刻子であるか検査します
 * @param meld 面子
 * @returns true 刻子の場合、false 刻子でない場合
 */
export function isTriple(meld: Meld): boolean {
  const allTiles = getAllTiles(meld);
  return isTripleTiles(allTiles);
}

/**
 * この面子が槓子であるか検査します
 * @param meld 面子
 * @returns true 槓子の場合、false 槓子でない場合
 */
export function isQuad(meld: Meld): boolean {
  const allTiles = getAllTiles(meld);
  return isQuadTiles(allTiles);
}

/**
 * この面子が暗面子かどうか検査します
 * この面子が暗槓であれば検査に適合します
 * この面子がロン和了で成立した面子である場合検査に適合しません
 * @param meld 面子
 * @returns true 門前の場合、false 門前でない場合
 */
export function isConcealed(meld: Meld): boolean {
  return meld.calledTile === undefined;
}

/**
 * この面子が暗槓であるか検査します
 * @param meld 面子
 * @returns true 暗槓の場合、false 暗槓でない場合
 */
export function isSelfQuad(meld: Meld): boolean {
  return meld.baseTiles.length === 4;
}

/**
 * この面子が加槓であるか検査します
 * @param meld 面子
 * @returns true 加槓の場合、false 加槓でない場合
 */
export function isAddQuad(meld: Meld): boolean {
  return meld.addedTile !== undefined;
}

/**
 * この面子が大明槓であるか検査します
 * @param meld 面子
 * @returns true 大明槓の場合、false 大明槓でない場合
 */
export function isCallQuad(meld: Meld): boolean {
  return meld.baseTiles.length === 3 && meld.calledTile !== undefined;
}

/**
 * この面子が公開面子でない、点数計算時に並べ替えによって作成された面子か検査します
 * @param meld 面子
 * @returns true 公開面子でない場合、false 公開面子の場合
 */
export function isHandMeld(meld: Meld): boolean {
  return meld.calledTile === undefined && !isSelfQuad(meld);
}

/**
 * 面子のすべての牌を取得します
 * @param meld 面子
 * @returns すべての牌のリスト
 */
export function getAllTiles(meld: Meld): Tile[] {
  const tiles = [...meld.baseTiles];
  if (meld.calledTile) tiles.push(meld.calledTile);
  if (meld.addedTile) tiles.push(meld.addedTile);
  return tiles;
}

/**
 * 面子のソート済み牌を取得します
 * @param meld 面子
 * @returns ソート済みの牌のリスト
 */
export function getSortedTiles(meld: Meld): Tile[] {
  const allTiles = getAllTiles(meld);
  return sorted(allTiles);
}

/**
 * 面子の切り詰められた牌を取得します（最初の3枚のみ）
 * @param meld 面子
 * @returns 最初の3枚の牌のリスト
 */
export function getTruncatedTiles(meld: Meld): Tile[] {
  const allTiles = getAllTiles(meld);
  return allTiles.slice(0, 3);
}

/**
 * 手牌の全ての牌を取得します（手牌 + 公開面子の全牌 + 和了牌）
 * @param hand 手牌情報
 * @returns 全ての牌のリスト（槓子は4枚で計算）
 */
export function getAllHandTiles(hand: Hand): Tile[] {
  const allTiles: Tile[] = [...hand.handTiles];
  
  // 公開面子の全牌を追加
  for (const meld of hand.openMelds) {
    allTiles.push(...getAllTiles(meld));
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
    allTiles.push(...getTruncatedTiles(meld));
  }
  
  // 和了牌を追加
  allTiles.push(hand.winningTile);
  
  return allTiles;
}

/**
 * 面子が老頭牌を含んでいるか検査します
 * @param meld 面子
 * @returns true 老頭牌を含む場合、false 含まない場合
 */
export function isTerminalMeld(meld: Meld): boolean {
  const allTiles = getAllTiles(meld);
  return allTiles.some(tile => isTerminal(tile));
}

/**
 * 面子が么九牌を含んでいるか検査します
 * @param meld 面子
 * @returns true 么九牌を含む場合、false 含まない場合
 */
export function isOrphanMeld(meld: Meld): boolean {
  const allTiles = getAllTiles(meld);
  return allTiles.some(tile => isOrphan(tile));
}

/**
 * 面子と和了牌から待ちの種類を判定します
 * @param meld 面子
 * @param winningTile 和了牌
 * @returns 待ちの種類
 * @throws Error 和了牌が面子に含まれていない場合
 */
export function getWait(meld: Meld, winningTile: Tile): Wait {
  if (!getAllTiles(meld).includes(winningTile)) {
    throw new Error(`No winning tile found: ${winningTile.code} in meld`);
  }
  
  if (isStraight(meld)) {
    const sortedTiles = getSortedTiles(meld);
    // 真ん中の牌が和了牌の場合は嵌張待ち
    if (equalsIgnoreRed(sortedTiles[1], winningTile)) {
      return Waits.MIDDLE_STRAIGHT;
    }
    // 面子が老頭牌を含み、和了牌が老頭牌でない場合は辺張待ち
    if (isTerminalMeld(meld) && !isTerminal(winningTile)) {
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
  
  if (isDragon(firstTile)) {
    return PointTypes.HEAD_DRAGON;
  }
  
  if (isWind(firstTile)) {
    const seatWindTile = windToTile(seatWind);
    const roundWindTile = windToTile(roundWind);
    
    const isSeatWindHead = equalsIgnoreRed(firstTile, seatWindTile);
    const isRoundWindHead = equalsIgnoreRed(firstTile, roundWindTile);
    
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
  if (isStraight(meld)) {
    return PointTypes.STRAIGHT;
  }
  
  if (isQuad(meld)) {
    if (isConcealed(meld)) {
      if (isOrphanMeld(meld)) {
        return PointTypes.ORPHAN_CONCEALED_QUAD;
      }
      return PointTypes.CONCEALED_QUAD;
    }
    if (isOrphanMeld(meld)) {
      return PointTypes.ORPHAN_QUAD;
    }
    return PointTypes.QUAD;
  }
  
  // 刻子の場合
  if (isConcealed(meld)) {
    if (isOrphanMeld(meld)) {
      return PointTypes.ORPHAN_CONCEALED_TRIPLE;
    }
    return PointTypes.CONCEALED_TRIPLE;
  }
  
  if (isOrphanMeld(meld)) {
    return PointTypes.ORPHAN_TRIPLE;
  }
  
  return PointTypes.TRIPLE;
}

// 面子作成ファクトリ関数

/**
 * カンによって暗槓を作成します
 * @param tiles 手牌中から提供された構成牌(長さ4)
 * @returns 暗槓
 * @throws Error 構成牌が槓子を構成し得ない場合
 */
export function createSelfQuad(tiles: Tile[]): Meld {
  if (tiles.length !== 4) {
    throw new Error(`Invalid tiles for self quad: expected 4 tiles, got ${tiles.length}`);
  }
  if (!isQuadTiles(tiles)) {
    throw new Error(`Invalid tiles for self quad: tiles do not form a quad`);
  }
  return {
    baseTiles: tiles,
    side: Sides.SELF
  };
}

/**
 * カンによって加槓を作成します
 * @param triple 元となる明刻
 * @param added 加槓宣言牌
 * @returns 加槓
 * @throws Error 明刻以外の面子が指定された場合、または加槓宣言牌が不適合の場合
 */
export function createAddQuad(triple: Meld, added: Tile): Meld {
  if (!isTriple(triple)) {
    throw new Error(`Invalid meld for add quad base: must be triple`);
  }
  const resultTiles = [...triple.baseTiles, added];
  if (triple.calledTile) resultTiles.push(triple.calledTile);
  if (!isQuadTiles(resultTiles)) {
    throw new Error(`Invalid tiles for add quad: resulting tiles do not form a quad`);
  }
  return {
    baseTiles: triple.baseTiles,
    calledTile: triple.calledTile,
    addedTile: added,
    side: triple.side
  };
}

/**
 * カンによって大明槓を作成します
 * @param base 手牌中から提供された構成牌(長さ3)
 * @param claimed 副露牌
 * @param source 副露元の相対方位
 * @returns 大明槓
 * @throws Error 構成牌が槓子を構成し得ない場合、または副露元に自家が指定された場合
 */
export function createCallQuad(base: Tile[], claimed: Tile, source: Side): Meld {
  if (base.length !== 3) {
    throw new Error(`Invalid base tiles for call quad: expected 3 tiles, got ${base.length}`);
  }
  if (source === Sides.SELF) {
    throw new Error(`Invalid source side for call quad: SELF`);
  }
  const resultTiles = [...base, claimed];
  if (!isQuadTiles(resultTiles)) {
    throw new Error(`Invalid tiles for call quad: tiles do not form a quad`);
  }
  return {
    baseTiles: base,
    calledTile: claimed,
    side: source
  };
}

/**
 * ポンによって明刻を作成します
 * @param base 手牌中から提供された構成牌(長さ2)
 * @param claimed 副露牌
 * @param source 副露元の相対方位
 * @returns 明刻
 * @throws Error 構成牌が刻子を構成し得ない場合、または副露元に自家が指定された場合
 */
export function createCallTriple(base: Tile[], claimed: Tile, source: Side): Meld {
  if (base.length !== 2) {
    throw new Error(`Invalid base tiles for call triple: expected 2 tiles, got ${base.length}`);
  }
  if (source === Sides.SELF) {
    throw new Error(`Invalid source side for call triple: SELF`);
  }
  const resultTiles = [...base, claimed];
  if (!isTripleTiles(resultTiles)) {
    throw new Error(`Invalid tiles for call triple: tiles do not form a triple`);
  }
  return {
    baseTiles: base,
    calledTile: claimed,
    side: source
  };
}

/**
 * チーによって明順を作成します
 * @param base 手牌中から提供された構成牌(長さ2)
 * @param claimed 副露牌
 * @returns 明順
 * @throws Error 構成牌が順子を構成し得ない場合
 */
export function createCallStraight(base: Tile[], claimed: Tile): Meld {
  if (base.length !== 2) {
    throw new Error(`Invalid base tiles for call straight: expected 2 tiles, got ${base.length}`);
  }
  const resultTiles = [...base, claimed];
  if (!isStraightTiles(resultTiles)) {
    throw new Error(`Invalid tiles for call straight: tiles do not form a straight`);
  }
  return {
    baseTiles: base,
    calledTile: claimed,
    side: Sides.LEFT  // チーは常に上家から
  };
}

/**
 * 点数計算のため、手牌から暗順もしくは暗刻を作成します
 * @param tiles 手牌中から提供された構成牌(長さ3)
 * @returns 面子
 * @throws Error 構成牌が刻子もしくは順子を構成し得ない場合
 */
export function createHandMeld(tiles: Tile[]): Meld {
  if (tiles.length !== 3) {
    throw new Error(`Invalid tiles for hand meld: expected 3 tiles, got ${tiles.length}`);
  }
  if (!isTripleTiles(tiles) && !isStraightTiles(tiles)) {
    throw new Error(`Invalid tiles for hand meld: tiles do not form a triple or straight`);
  }
  return {
    baseTiles: tiles,
    side: Sides.SELF
  };
}

/**
 * 点数計算のため、手牌中の構成牌とロン牌から明順もしくは明刻を作成します
 * @param base 手牌中から提供された構成牌
 * @param claimed ロン牌
 * @returns 面子
 * @throws Error 構成牌が刻子もしくは順子を構成し得ない場合
 */
export function createHandMeldWithClaimed(base: Tile[], claimed: Tile): Meld {
  const resultTiles = [...base, claimed];
  if (!isTripleTiles(resultTiles) && !isStraightTiles(resultTiles)) {
    throw new Error(`Invalid tiles for hand meld with claimed: tiles do not form a triple or straight`);
  }
  return {
    baseTiles: base,
    calledTile: claimed,
    side: Sides.SELF
  };
}