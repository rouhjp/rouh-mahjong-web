import _ from 'lodash';
import { sorted, Tile, TileInfo, equalsIgnoreRed, isHonor, hasPrevious, getPreviousTile, getSimplifiedTile, hasNext, getNextTile } from '../tiles';

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
  if (equalsIgnoreRed(left, right)) return true;
  if (isHonor(left) || isHonor(right)) return false;
  return TileInfo[left].tileType === TileInfo[right].tileType && Math.abs(TileInfo[left].suitNumber - TileInfo[right].suitNumber) <= 2;
}

function aroundTilesOf(tile: Tile): Tile[] {
  const aroundTiles: Tile[] = [];
  if (hasPrevious(tile)) {
    aroundTiles.push(getPreviousTile(tile));
  }
  aroundTiles.push(getSimplifiedTile(tile));
  if (hasNext(tile)) {
    aroundTiles.push(getNextTile(tile));
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

const FOURTEEN_HAND_PATTERNS: number[][] = [
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
 * 明らかに完成形ではない手牌かどうかを判定します。
 */
export function isObviouslyNotCompleted(handTiles: Tile[], winningTile: Tile): boolean {
  const blocks = splitByNeighbor(sorted([...handTiles, winningTile]));
  const pattern = blocks.map(block => block.length).sort((a, b) => b - a);
  return !FOURTEEN_HAND_PATTERNS.some(p => _.isEqual(p, pattern));
}

/**
 * 和了牌の可能性のある牌を列挙します。
 * 赤ドラ牌は含まれません。
 */
export function winningTileCandidatesOf(handTiles: Tile[]): Tile[] {
  const blocks = splitByNeighbor(sorted(handTiles));
  // 完成形のパターンを満たすかチェック
  const pattern = blocks.map(block => block.length).sort((a, b) => b - a);
  if (!THIRTEEN_HAND_PATTERNS.some(p => _.isEqual(p, pattern))) {
    return [];
  }
  // すでに4枚使用している牌は除外
  const exhaustedTiles: Tile[] = _.uniq(handTiles.map(tile => getSimplifiedTile(tile)))
    .filter(tile => handTiles.filter(t => equalsIgnoreRed(t, tile)).length === 4);
  const candidates = blocks.filter(block => block.length % 3 !== 0)
    .flatMap(block => block.length === 1 ? [getSimplifiedTile(block[0])] : block.flatMap(tile => aroundTilesOf(tile)))
    .filter(tile => !exhaustedTiles.includes(tile));
  return _.uniq(candidates);
}
