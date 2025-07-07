// 牌の種類を表すstring union型
export type TileType = 'MAN' | 'PIN' | 'SOU' | 'WIND' | 'DRAGON';

// 牌を表すstring union型
export type Tile = 
  // 萬子 (M1-M9)
  | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M5R' | 'M6' | 'M7' | 'M8' | 'M9'
  // 筒子 (P1-P9) 
  | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P5R' | 'P6' | 'P7' | 'P8' | 'P9'
  // 索子 (S1-S9)
  | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S5R' | 'S6' | 'S7' | 'S8' | 'S9'
  // 風牌 (東南西北)
  | 'WE' | 'WS' | 'WW' | 'WN'
  // 三元牌 (白發中)
  | 'DW' | 'DG' | 'DR';

// 牌の種類情報
export const TileTypeInfo: Record<TileType, { code: string; count: number }> = {
  MAN: { code: 'MAN', count: 9 },
  PIN: { code: 'PIN', count: 9 },
  SOU: { code: 'SOU', count: 9 },
  WIND: { code: 'WIND', count: 4 },
  DRAGON: { code: 'DRAGON', count: 3 }
};

// 牌の詳細情報マップ
export const TileInfo: Record<Tile, {
  code: string;
  tileType: TileType;
  suitNumber: number;
  tileNumber: number;
  red: boolean;
}> = {
  // 萬子 (M1-M9)
  M1: { code: 'M1', tileType: 'MAN', suitNumber: 1, tileNumber: 0, red: false },
  M2: { code: 'M2', tileType: 'MAN', suitNumber: 2, tileNumber: 1, red: false },
  M3: { code: 'M3', tileType: 'MAN', suitNumber: 3, tileNumber: 2, red: false },
  M4: { code: 'M4', tileType: 'MAN', suitNumber: 4, tileNumber: 3, red: false },
  M5: { code: 'M5', tileType: 'MAN', suitNumber: 5, tileNumber: 4, red: false },
  M5R: { code: 'M5R', tileType: 'MAN', suitNumber: 5, tileNumber: 4, red: true },
  M6: { code: 'M6', tileType: 'MAN', suitNumber: 6, tileNumber: 5, red: false },
  M7: { code: 'M7', tileType: 'MAN', suitNumber: 7, tileNumber: 6, red: false },
  M8: { code: 'M8', tileType: 'MAN', suitNumber: 8, tileNumber: 7, red: false },
  M9: { code: 'M9', tileType: 'MAN', suitNumber: 9, tileNumber: 8, red: false },
  
  // 筒子 (P1-P9)
  P1: { code: 'P1', tileType: 'PIN', suitNumber: 1, tileNumber: 9, red: false },
  P2: { code: 'P2', tileType: 'PIN', suitNumber: 2, tileNumber: 10, red: false },
  P3: { code: 'P3', tileType: 'PIN', suitNumber: 3, tileNumber: 11, red: false },
  P4: { code: 'P4', tileType: 'PIN', suitNumber: 4, tileNumber: 12, red: false },
  P5: { code: 'P5', tileType: 'PIN', suitNumber: 5, tileNumber: 13, red: false },
  P5R: { code: 'P5R', tileType: 'PIN', suitNumber: 5, tileNumber: 13, red: true },
  P6: { code: 'P6', tileType: 'PIN', suitNumber: 6, tileNumber: 14, red: false },
  P7: { code: 'P7', tileType: 'PIN', suitNumber: 7, tileNumber: 15, red: false },
  P8: { code: 'P8', tileType: 'PIN', suitNumber: 8, tileNumber: 16, red: false },
  P9: { code: 'P9', tileType: 'PIN', suitNumber: 9, tileNumber: 17, red: false },
  
  // 索子 (S1-S9)
  S1: { code: 'S1', tileType: 'SOU', suitNumber: 1, tileNumber: 18, red: false },
  S2: { code: 'S2', tileType: 'SOU', suitNumber: 2, tileNumber: 19, red: false },
  S3: { code: 'S3', tileType: 'SOU', suitNumber: 3, tileNumber: 20, red: false },
  S4: { code: 'S4', tileType: 'SOU', suitNumber: 4, tileNumber: 21, red: false },
  S5: { code: 'S5', tileType: 'SOU', suitNumber: 5, tileNumber: 22, red: false },
  S5R: { code: 'S5R', tileType: 'SOU', suitNumber: 5, tileNumber: 22, red: true },
  S6: { code: 'S6', tileType: 'SOU', suitNumber: 6, tileNumber: 23, red: false },
  S7: { code: 'S7', tileType: 'SOU', suitNumber: 7, tileNumber: 24, red: false },
  S8: { code: 'S8', tileType: 'SOU', suitNumber: 8, tileNumber: 25, red: false },
  S9: { code: 'S9', tileType: 'SOU', suitNumber: 9, tileNumber: 26, red: false },
  
  // 風牌 (東南西北)
  WE: { code: 'WE', tileType: 'WIND', suitNumber: 1, tileNumber: 27, red: false }, // 東
  WS: { code: 'WS', tileType: 'WIND', suitNumber: 2, tileNumber: 28, red: false }, // 南
  WW: { code: 'WW', tileType: 'WIND', suitNumber: 3, tileNumber: 29, red: false }, // 西
  WN: { code: 'WN', tileType: 'WIND', suitNumber: 4, tileNumber: 30, red: false }, // 北
  
  // 三元牌 (白發中)
  DW: { code: 'DW', tileType: 'DRAGON', suitNumber: 1, tileNumber: 31, red: false }, // 白
  DG: { code: 'DG', tileType: 'DRAGON', suitNumber: 2, tileNumber: 32, red: false }, // 發
  DR: { code: 'DR', tileType: 'DRAGON', suitNumber: 3, tileNumber: 33, red: false }  // 中
};

// 牌配列（順序固定）
export const TILE_SEQUENCE: Tile[] = [
  'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9',
  'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9',
  'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9',
  'WE', 'WS', 'WW', 'WN',
  'DW', 'DG', 'DR'
];

// 牌定義オブジェクト（後方互換性のため）
export const Tiles = {
  // 萬子 (M1-M9)
  M1: 'M1' as const, M2: 'M2' as const, M3: 'M3' as const, M4: 'M4' as const,
  M5: 'M5' as const, M5R: 'M5R' as const, M6: 'M6' as const, M7: 'M7' as const,
  M8: 'M8' as const, M9: 'M9' as const,
  
  // 筒子 (P1-P9)
  P1: 'P1' as const, P2: 'P2' as const, P3: 'P3' as const, P4: 'P4' as const,
  P5: 'P5' as const, P5R: 'P5R' as const, P6: 'P6' as const, P7: 'P7' as const,
  P8: 'P8' as const, P9: 'P9' as const,
  
  // 索子 (S1-S9)
  S1: 'S1' as const, S2: 'S2' as const, S3: 'S3' as const, S4: 'S4' as const,
  S5: 'S5' as const, S5R: 'S5R' as const, S6: 'S6' as const, S7: 'S7' as const,
  S8: 'S8' as const, S9: 'S9' as const,
  
  // 風牌 (東南西北)
  WE: 'WE' as const, WS: 'WS' as const, WW: 'WW' as const, WN: 'WN' as const,
  
  // 三元牌 (白發中)
  DW: 'DW' as const, DG: 'DG' as const, DR: 'DR' as const
} as const;

// ユーティリティ関数

/**
 * 字牌かどうか判定
 * @param tile 牌
 * @returns true 字牌の場合、false 字牌でない場合
 */
export function isHonor(tile: Tile): boolean {
  const tileType = TileInfo[tile].tileType;
  return tileType === 'WIND' || tileType === 'DRAGON';
}

/**
 * 老頭牌かどうか判定（1または9の数牌）
 * @param tile 牌
 * @returns true 老頭牌の場合、false 老頭牌でない場合
 */
export function isTerminal(tile: Tile): boolean {
  const info = TileInfo[tile];
  return !isHonor(tile) && (info.suitNumber === 1 || info.suitNumber === 9);
}

/**
 * 么九牌かどうか判定（字牌または老頭牌）
 * @param tile 牌
 * @returns true 么九牌の場合、false 么九牌でない場合
 */
export function isOrphan(tile: Tile): boolean {
  return isHonor(tile) || isTerminal(tile);
}

/**
 * 三元牌かどうか判定
 * @param tile 牌
 * @returns true 三元牌の場合、false 三元牌でない場合
 */
export function isDragon(tile: Tile): boolean {
  return TileInfo[tile].tileType === 'DRAGON';
}

/**
 * 風牌かどうか判定
 * @param tile 牌
 * @returns true 風牌の場合、false 風牌でない場合
 */
export function isWind(tile: Tile): boolean {
  return TileInfo[tile].tileType === 'WIND';
}

/**
 * 赤ドラ牌かどうか判定
 * @param tile 牌
 * @returns true 赤ドラ牌の場合、false 赤ドラ牌でない場合
 */
export function isPrisedRed(tile: Tile): boolean {
  return TileInfo[tile].red;
}

/**
 * 前の牌が存在するか判定（順子構成用）
 * @param tile 牌
 * @returns true 前の牌が存在する場合、false 存在しない場合
 */
export function hasPrevious(tile: Tile): boolean {
  const info = TileInfo[tile];
  return !isHonor(tile) && info.suitNumber >= 2 && info.suitNumber <= 9;
}

/**
 * 次の牌が存在するか判定（順子構成用）
 * @param tile 牌
 * @returns true 次の牌が存在する場合、false 存在しない場合
 */
export function hasNext(tile: Tile): boolean {
  const info = TileInfo[tile];
  return !isHonor(tile) && info.suitNumber >= 1 && info.suitNumber <= 8;
}

/**
 * 前の牌を取得
 * @param tile 牌
 * @returns 前の牌
 * @throws Error 前の牌が存在しない場合
 */
export function getPreviousTile(tile: Tile): Tile {
  if (!hasPrevious(tile)) {
    throw new Error(`Previous tile of ${tile} does not exist`);
  }
  const tileNumber = TileInfo[tile].tileNumber;
  return TILE_SEQUENCE[(tileNumber + TILE_SEQUENCE.length - 1) % TILE_SEQUENCE.length];
}

/**
 * 次の牌を取得
 * @param tile 牌
 * @returns 次の牌
 * @throws Error 次の牌が存在しない場合
 */
export function getNextTile(tile: Tile): Tile {
  if (!hasNext(tile)) {
    throw new Error(`Next tile of ${tile} does not exist`);
  }
  const tileNumber = TileInfo[tile].tileNumber;
  return TILE_SEQUENCE[(tileNumber + 1) % TILE_SEQUENCE.length];
}

/**
 * ドラ表示牌からドラ牌を取得
 * @param tile ドラ表示牌
 * @returns ドラ牌
 */
export function getIndicatedTile(tile: Tile): Tile {
  const info = TileInfo[tile];
  const tileType = TileTypeInfo[info.tileType];
  
  if (info.suitNumber === tileType.count) {
    return TILE_SEQUENCE[(info.tileNumber - (tileType.count - 1)) % TILE_SEQUENCE.length];
  }
  return TILE_SEQUENCE[(info.tileNumber + 1) % TILE_SEQUENCE.length];
}

/**
 * 赤ドラを無視した基本牌を取得
 * @param tile 牌
 * @returns 基本牌
 */
export function getSimplifiedTile(tile: Tile): Tile {
  return TILE_SEQUENCE[TileInfo[tile].tileNumber];
}

/**
 * 赤ドラを無視して等価か判定
 * @param tile1 比較対象の牌1
 * @param tile2 比較対象の牌2
 * @returns true 等価の場合、false 等価でない場合
 */
export function equalsIgnoreRed(tile1: Tile, tile2: Tile): boolean {
  return TileInfo[tile1].tileNumber === TileInfo[tile2].tileNumber;
}

/**
 * 同種の牌かどうか判定
 * @param tile1 比較対象の牌1
 * @param tile2 比較対象の牌2
 * @returns true 同種の場合、false 同種でない場合
 */
export function isSameType(tile1: Tile, tile2: Tile): boolean {
  return TileInfo[tile1].tileType === TileInfo[tile2].tileType;
}

/**
 * 指定した牌の次の牌かどうか判定（赤ドラ無視）
 * @param tile 判定対象の牌
 * @param other 比較対象の牌
 * @returns true 次の牌の場合、false 次の牌でない場合
 */
export function isNextOf(tile: Tile, other: Tile): boolean {
  return hasNext(other) && equalsIgnoreRed(tile, getNextTile(other));
}

/**
 * 指定した牌の前の牌かどうか判定（赤ドラ無視）
 * @param tile 判定対象の牌
 * @param other 比較対象の牌
 * @returns true 前の牌の場合、false 前の牌でない場合
 */
export function isPreviousOf(tile: Tile, other: Tile): boolean {
  return hasPrevious(other) && equalsIgnoreRed(tile, getPreviousTile(other));
}

/**
 * 牌の比較（ソート用）
 * @param tile1 比較対象の牌1
 * @param tile2 比較対象の牌2
 * @returns 比較結果（負の数: tile1 < tile2, 0: tile1 === tile2, 正の数: tile1 > tile2）
 */
export function compareTiles(tile1: Tile, tile2: Tile): number {
  const info1 = TileInfo[tile1];
  const info2 = TileInfo[tile2];
  
  if (info1.tileNumber !== info2.tileNumber) {
    return info1.tileNumber - info2.tileNumber;
  }
  if (info1.red && !info2.red) return 1;
  if (!info1.red && info2.red) return -1;
  return 0;
}

/**
 * 牌をソートする関数
 * @param tiles ソート対象の牌配列
 * @returns ソート後の牌配列
 */
export function sorted(tiles: Tile[]): Tile[] {
  return [...tiles].sort(compareTiles);
}

/**
 * 刻子判定関数（同じ牌が3枚）
 * @param tiles 判定対象の牌配列
 * @returns true 刻子の場合、false 刻子でない場合
 */
export function isTripleTiles(tiles: Tile[]): boolean {
  if (tiles.length !== 3) return false;
  const first = tiles[0];
  return tiles.every(tile => equalsIgnoreRed(tile, first));
}

/**
 * 槓子判定関数（同じ牌が4枚）
 * @param tiles 判定対象の牌配列
 * @returns true 槓子の場合、false 槓子でない場合
 */
export function isQuadTiles(tiles: Tile[]): boolean {
  if (tiles.length !== 4) return false;
  const first = tiles[0];
  return tiles.every(tile => equalsIgnoreRed(tile, first));
}

/**
 * 順子判定関数（連続する3枚の数牌）
 * @param tiles 判定対象の牌配列
 * @returns true 順子の場合、false 順子でない場合
 */
export function isStraightTiles(tiles: Tile[]): boolean {
  if (tiles.length !== 3) return false;
  
  // 字牌は順子を構成できない
  if (tiles.some(tile => isHonor(tile))) return false;
  
  // 同じ種類の牌でなければならない
  const firstType = TileInfo[tiles[0]].tileType;
  if (!tiles.every(tile => TileInfo[tile].tileType === firstType)) return false;
  
  // ソートして連続性を確認
  const sortedTiles = sorted(tiles);
  for (let i = 1; i < sortedTiles.length; i++) {
    if (TileInfo[sortedTiles[i]].suitNumber !== TileInfo[sortedTiles[i-1]].suitNumber + 1) {
      return false;
    }
  }
  
  return true;
}

// 么九牌のリスト
export const ORPHAN_TILES = TILE_SEQUENCE.filter(tile => isOrphan(tile));

// 牌セット構成定義（136枚の内訳）
const TILE_SET_CONFIG = new Map<Tile, number>([
  // 萬子: 各4枚、M5のみ3枚 + 赤ドラ1枚
  ['M1', 4], ['M2', 4], ['M3', 4], ['M4', 4], ['M5', 3], ['M5R', 1],
  ['M6', 4], ['M7', 4], ['M8', 4], ['M9', 4],
  // 筒子: 各4枚、P5のみ3枚 + 赤ドラ1枚  
  ['P1', 4], ['P2', 4], ['P3', 4], ['P4', 4], ['P5', 3], ['P5R', 1],
  ['P6', 4], ['P7', 4], ['P8', 4], ['P9', 4],
  // 索子: 各4枚、S5のみ3枚 + 赤ドラ1枚
  ['S1', 4], ['S2', 4], ['S3', 4], ['S4', 4], ['S5', 3], ['S5R', 1],
  ['S6', 4], ['S7', 4], ['S8', 4], ['S9', 4],
  // 風牌: 各4枚
  ['WE', 4], ['WS', 4], ['WW', 4], ['WN', 4],
  // 三元牌: 各4枚
  ['DW', 4], ['DG', 4], ['DR', 4]
]);

/**
 * 新たにシャッフルした牌のリストを取得します。
 * @returns 牌のリスト
 */
export function generateTileSet(): Tile[] {
  return shuffleTiles(createTileSet());
}

// 牌セット生成関数
function createTileSet(): Tile[] {
  const tiles: Tile[] = [];
  for (const [tile, count] of TILE_SET_CONFIG) {
    for (let i = 0; i < count; i++) {
      tiles.push(tile);
    }
  }
  return tiles;
}

// 牌をシャッフルする関数
function shuffleTiles(tiles: Tile[]): Tile[] {
  const shuffled = [...tiles];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}