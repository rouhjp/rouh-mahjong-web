// 面子関連のユーティリティ関数

import type { Meld } from './types';
import type { Tile } from '../tiles/types';
import type { Side } from '../winds/types';
import { Sides } from '../winds/types';
import { isTripleTiles, isQuadTiles, isStraightTiles } from '../tiles/utils';

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