import { Tile, Tiles, TILE_SEQUENCE, GREEN_TILES, TILE_SET_CONFIG } from './types.js';

// 字牌かどうか判定
export function isHonor(tile: Tile): boolean {
  return tile.suitNumber === 0;
}

// 老頭牌かどうか判定（1または9）
export function isTerminal(tile: Tile): boolean {
  return tile.suitNumber === 1 || tile.suitNumber === 9;
}

// 么九牌かどうか判定（字牌または老頭牌）
export function isOrphan(tile: Tile): boolean {
  return isHonor(tile) || isTerminal(tile);
}

// 緑一色の構成牌かどうか判定
export function isGreen(tile: Tile): boolean {
  return GREEN_TILES.has(tile);
}

// 前の牌が存在するか判定（順子構成用）
export function hasPrevious(tile: Tile): boolean {
  return tile.suitNumber >= 2 && tile.suitNumber <= 9;
}

// 次の牌が存在するか判定（順子構成用）
export function hasNext(tile: Tile): boolean {
  return tile.suitNumber >= 1 && tile.suitNumber <= 8;
}

// 指定した牌の次の牌かどうか判定（赤ドラ無視）
export function isNextOf(tile: Tile, other: Tile): boolean {
  return hasNext(other) && equalsIgnoreRed(tile, getNext(other));
}

// 指定した牌の前の牌かどうか判定（赤ドラ無視）
export function isPreviousOf(tile: Tile, other: Tile): boolean {
  return hasPrevious(other) && equalsIgnoreRed(tile, getPrevious(other));
}

// 赤ドラを無視して等価か判定
export function equalsIgnoreRed(tile1: Tile, tile2: Tile): boolean {
  return tile1.tileType === tile2.tileType && tile1.suitNumber === tile2.suitNumber;
}

// 同種の牌かどうか判定
export function isSameTypeOf(tile1: Tile, tile2: Tile): boolean {
  return tile1.tileType === tile2.tileType;
}

// 前の牌を取得
export function getPrevious(tile: Tile): Tile {
  if (!hasPrevious(tile)) {
    throw new Error(`Previous tile of ${tile.code} does not exist`);
  }
  const index = TILE_SEQUENCE.indexOf(tile);
  return TILE_SEQUENCE[index - 1];
}

// 次の牌を取得
export function getNext(tile: Tile): Tile {
  if (!hasNext(tile)) {
    throw new Error(`Next tile of ${tile.code} does not exist`);
  }
  const index = TILE_SEQUENCE.indexOf(tile);
  return TILE_SEQUENCE[index + 1];
}

// ドラ表示牌からドラ牌を取得
export function getDoraFromIndicator(indicator: Tile): Tile {
  if (indicator === Tiles.M9) return Tiles.M1;
  if (indicator === Tiles.P9) return Tiles.P1;
  if (indicator === Tiles.S9) return Tiles.S1;
  if (indicator === Tiles.DR) return Tiles.DW;
  if (indicator === Tiles.WN) return Tiles.WE;
  
  const index = TILE_SEQUENCE.indexOf(indicator);
  return TILE_SEQUENCE[(index + 1) % TILE_SEQUENCE.length];
}

// 牌セット生成関数
export function createTileSet(): Tile[] {
  const tiles: Tile[] = [];
  
  for (const [tile, count] of TILE_SET_CONFIG) {
    for (let i = 0; i < count; i++) {
      tiles.push(tile);
    }
  }
  
  return tiles;
}

// 牌をシャッフルする関数
export function shuffleTiles(tiles: Tile[]): Tile[] {
  const shuffled = [...tiles];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 牌の比較関数
export function compareTiles(a: Tile, b: Tile): number {
  const indexA = TILE_SEQUENCE.indexOf(a);
  const indexB = TILE_SEQUENCE.indexOf(b);
  return indexA - indexB;
}

// 牌をソートする関数
export function sorted(tiles: Tile[]): Tile[] {
  return [...tiles].sort(compareTiles);
}