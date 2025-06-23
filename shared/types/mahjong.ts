// 麻雀ゲーム関連の型定義

// 牌タイプの定義
export enum TileType {
  MAN = 'MAN',     // 萬子
  PIN = 'PIN',     // 筒子  
  SOU = 'SOU',     // 索子
  WIND = 'WIND',   // 風牌
  DRAGON = 'DRAGON' // 三元牌
}

// 牌定義オブジェクト - Tiles.M1.suitNumber のような呼び出しが可能
export const Tiles = {
  // 萬子 (M1-M9)
  M1: { code: 'M1', tileType: TileType.MAN, suitNumber: 1, isRed: false } as const,
  M2: { code: 'M2', tileType: TileType.MAN, suitNumber: 2, isRed: false } as const,
  M3: { code: 'M3', tileType: TileType.MAN, suitNumber: 3, isRed: false } as const,
  M4: { code: 'M4', tileType: TileType.MAN, suitNumber: 4, isRed: false } as const,
  M5: { code: 'M5', tileType: TileType.MAN, suitNumber: 5, isRed: false } as const,
  M5R: { code: 'M5R', tileType: TileType.MAN, suitNumber: 5, isRed: true } as const, // 赤ドラ
  M6: { code: 'M6', tileType: TileType.MAN, suitNumber: 6, isRed: false } as const,
  M7: { code: 'M7', tileType: TileType.MAN, suitNumber: 7, isRed: false } as const,
  M8: { code: 'M8', tileType: TileType.MAN, suitNumber: 8, isRed: false } as const,
  M9: { code: 'M9', tileType: TileType.MAN, suitNumber: 9, isRed: false } as const,
  
  // 筒子 (P1-P9)
  P1: { code: 'P1', tileType: TileType.PIN, suitNumber: 1, isRed: false } as const,
  P2: { code: 'P2', tileType: TileType.PIN, suitNumber: 2, isRed: false } as const,
  P3: { code: 'P3', tileType: TileType.PIN, suitNumber: 3, isRed: false } as const,
  P4: { code: 'P4', tileType: TileType.PIN, suitNumber: 4, isRed: false } as const,
  P5: { code: 'P5', tileType: TileType.PIN, suitNumber: 5, isRed: false } as const,
  P5R: { code: 'P5R', tileType: TileType.PIN, suitNumber: 5, isRed: true } as const, // 赤ドラ
  P6: { code: 'P6', tileType: TileType.PIN, suitNumber: 6, isRed: false } as const,
  P7: { code: 'P7', tileType: TileType.PIN, suitNumber: 7, isRed: false } as const,
  P8: { code: 'P8', tileType: TileType.PIN, suitNumber: 8, isRed: false } as const,
  P9: { code: 'P9', tileType: TileType.PIN, suitNumber: 9, isRed: false } as const,
  
  // 索子 (S1-S9)
  S1: { code: 'S1', tileType: TileType.SOU, suitNumber: 1, isRed: false } as const,
  S2: { code: 'S2', tileType: TileType.SOU, suitNumber: 2, isRed: false } as const,
  S3: { code: 'S3', tileType: TileType.SOU, suitNumber: 3, isRed: false } as const,
  S4: { code: 'S4', tileType: TileType.SOU, suitNumber: 4, isRed: false } as const,
  S5: { code: 'S5', tileType: TileType.SOU, suitNumber: 5, isRed: false } as const,
  S5R: { code: 'S5R', tileType: TileType.SOU, suitNumber: 5, isRed: true } as const, // 赤ドラ
  S6: { code: 'S6', tileType: TileType.SOU, suitNumber: 6, isRed: false } as const,
  S7: { code: 'S7', tileType: TileType.SOU, suitNumber: 7, isRed: false } as const,
  S8: { code: 'S8', tileType: TileType.SOU, suitNumber: 8, isRed: false } as const,
  S9: { code: 'S9', tileType: TileType.SOU, suitNumber: 9, isRed: false } as const,
  
  // 風牌 (東南西北)
  WE: { code: 'WE', tileType: TileType.WIND, suitNumber: 0, isRed: false } as const, // 東
  WS: { code: 'WS', tileType: TileType.WIND, suitNumber: 0, isRed: false } as const, // 南
  WW: { code: 'WW', tileType: TileType.WIND, suitNumber: 0, isRed: false } as const, // 西
  WN: { code: 'WN', tileType: TileType.WIND, suitNumber: 0, isRed: false } as const, // 北
  
  // 三元牌 (白發中)
  DW: { code: 'DW', tileType: TileType.DRAGON, suitNumber: 0, isRed: false } as const, // 白
  DG: { code: 'DG', tileType: TileType.DRAGON, suitNumber: 0, isRed: false } as const, // 發
  DR: { code: 'DR', tileType: TileType.DRAGON, suitNumber: 0, isRed: false } as const  // 中
} as const;

// 牌の型定義
export type Tile = typeof Tiles[keyof typeof Tiles];

// 牌の順序定義（順子・ドラの計算に使用）
const TILE_SEQUENCE: Tile[] = [
  Tiles.M1, Tiles.M2, Tiles.M3, Tiles.M4, Tiles.M5, Tiles.M6, Tiles.M7, Tiles.M8, Tiles.M9,
  Tiles.P1, Tiles.P2, Tiles.P3, Tiles.P4, Tiles.P5, Tiles.P6, Tiles.P7, Tiles.P8, Tiles.P9,
  Tiles.S1, Tiles.S2, Tiles.S3, Tiles.S4, Tiles.S5, Tiles.S6, Tiles.S7, Tiles.S8, Tiles.S9,
  Tiles.WE, Tiles.WS, Tiles.WW, Tiles.WN, Tiles.DW, Tiles.DG, Tiles.DR
] as const;

// 牌セット構成定義（136枚の内訳）
const TILE_SET_CONFIG = new Map<Tile, number>([
  // 萬子: 各4枚、M5のみ3枚 + 赤ドラ1枚
  [Tiles.M1, 4], [Tiles.M2, 4], [Tiles.M3, 4], [Tiles.M4, 4], [Tiles.M5, 3], [Tiles.M5R, 1],
  [Tiles.M6, 4], [Tiles.M7, 4], [Tiles.M8, 4], [Tiles.M9, 4],
  // 筒子: 各4枚、P5のみ3枚 + 赤ドラ1枚  
  [Tiles.P1, 4], [Tiles.P2, 4], [Tiles.P3, 4], [Tiles.P4, 4], [Tiles.P5, 3], [Tiles.P5R, 1],
  [Tiles.P6, 4], [Tiles.P7, 4], [Tiles.P8, 4], [Tiles.P9, 4],
  // 索子: 各4枚、S5のみ3枚 + 赤ドラ1枚
  [Tiles.S1, 4], [Tiles.S2, 4], [Tiles.S3, 4], [Tiles.S4, 4], [Tiles.S5, 3], [Tiles.S5R, 1],
  [Tiles.S6, 4], [Tiles.S7, 4], [Tiles.S8, 4], [Tiles.S9, 4],
  // 風牌: 各4枚
  [Tiles.WE, 4], [Tiles.WS, 4], [Tiles.WW, 4], [Tiles.WN, 4],
  // 三元牌: 各4枚
  [Tiles.DW, 4], [Tiles.DG, 4], [Tiles.DR, 4]
]);


// ヘルパー関数

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
