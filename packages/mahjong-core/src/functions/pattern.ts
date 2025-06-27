import _ from 'lodash';
import { sorted, Tile } from '../tiles';

/**
 * 手牌をソートしてブロックサイズのリストを取得
 * @param handTiles 手牌
 * @returns ブロックサイズのリスト
 */
function patternOf(handTiles: Tile[]): number[] {
  const blocks = splitByNeighbor(sorted(handTiles));
  return blocks.map(block => block.length).sort((a, b) => b - a); // 降順
}

/**
 * 隣接していない牌でリストを分割
 * @param tiles ソートされた牌のリスト
 * @returns 分割されたブロックのリスト
 */
function splitByNeighbor(tiles: Tile[]): Tile[][] {
  if (tiles.length === 0) return [];
  
  const blocks: Tile[][] = [];
  let currentBlock = [tiles[0]];
  
  for (let i = 1; i < tiles.length; i++) {
    if (isNeighbour(tiles[i - 1], tiles[i])) {
      currentBlock.push(tiles[i]);
    } else {
      blocks.push(currentBlock);
      currentBlock = [tiles[i]];
    }
  }
  blocks.push(currentBlock);
  
  return blocks;
}

/**
 * 2つの牌が面子を構成しうる近接牌かどうかを判定します
 * @param left 左の牌
 * @param right 右の牌
 * @returns true 隣接している場合
 */
function isNeighbour(left: Tile, right: Tile): boolean {
  if (left.equalsIgnoreRed(right)) return true;
  if (left.isHonor() || right.isHonor()) return false;
  return left.tileType === right.tileType && Math.abs(left.suitNumber - right.suitNumber) <= 2;
}

function aroundTilesOf(tile: Tile): Tile[] {
  const aroundTiles: Tile[] = [];
  if (tile.hasPrevious()) {
    aroundTiles.push(tile.previous());
  }
  aroundTiles.push(tile);
  if (tile.hasNext()) {
    aroundTiles.push(tile.next());
  }
  return aroundTiles;
}

const THIRTEEN_HAND_PATTERNS: number[][] = [
  [1],
  [2, 2],
  [3, 1],
  [4],
  [3, 2, 2],
  [3, 3, 1],
  [4, 3],
  [5, 2],
  [6, 1],
  [7],
  [3, 3, 2, 2],
  [3, 3, 3, 1],
  [4, 3, 3],
  [5, 3, 2],
  [5, 5],
  [6, 2, 2],
  [6, 3, 1],
  [6, 4],
  [7, 3],
  [8, 2],
  [9, 1],
  [10],
  [3, 3, 3, 2, 2],
  [3, 3, 3, 3, 1],
  [4, 3, 3, 3],
  [5, 3, 3, 2],
  [5, 5, 3],
  [6, 3, 2, 2],
  [6, 3, 3, 1],
  [6, 4, 3],
  [6, 5, 2],
  [6, 6, 1],
  [7, 3, 3],
  [7, 6],
  [8, 3, 2],
  [8, 5],
  [9, 2, 2],
  [9, 3, 1],
  [9, 4],
  [10, 3],
  [11, 2],
  [12, 1],
  [13]
];

export const FOURTEEN_HAND_PATTERNS: number[][] = [
  [2],
  [3, 2],
  [5],
  [3, 3, 2],
  [5, 3],
  [6, 2],
  [8],
  [3, 3, 3, 2],
  [5, 3, 3],
  [6, 3, 2],
  [6, 5],
  [8, 3],
  [9, 2],
  [11],
  [3, 3, 3, 3, 2],
  [5, 3, 3, 3],
  [6, 3, 3, 2],
  [6, 5, 3],
  [6, 6, 2],
  [8, 3, 3],
  [8, 6],
  [9, 3, 2],
  [9, 5],
  [11, 3],
  [12, 2],
  [14]
];

/**
 * 聴牌の必要条件を満たすかどうかを判定します
 */
export function isReadyPattern(handTiles: Tile[]): boolean {
  const pattern = patternOf(handTiles);
  return THIRTEEN_HAND_PATTERNS.some(p => _.isEqual(p, pattern));
}

/**
 * 和了形の必要条件を満たすかどうかを判定します
 */
export function isCompletePattern(handTiles: Tile[], winningTile: Tile): boolean {
  const pattern = patternOf([...handTiles, winningTile]);
  return FOURTEEN_HAND_PATTERNS.some(p => _.isEqual(p, pattern));
}

/**
 * 和了牌の候補を取得します
 * 赤ドラ牌は含まれません。
 */
export function winningTileCandidatesOf(handTiles: Tile[]): Tile[] {
  const exhaustedTiles: Tile[] = _.uniq(handTiles.map(tile => tile.simplify()))
    .filter(tile => handTiles.filter(t => t.equalsIgnoreRed(tile)).length === 4);
  const candidates: Tile[] = splitByNeighbor(sorted(handTiles))
    .filter(block => block.length % 3 !== 0)
    .flatMap(block => block)
    .flatMap(tile => aroundTilesOf(tile.simplify()))
    .filter(tile => !exhaustedTiles.includes(tile));
  return _.uniq(candidates);
}
