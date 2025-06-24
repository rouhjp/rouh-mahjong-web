// 麻雀牌の基本型定義

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
  M1: { code: 'M1', tileType: TileType.MAN, suitNumber: 1, isRed: false, tileNumber: 0 } as const,
  M2: { code: 'M2', tileType: TileType.MAN, suitNumber: 2, isRed: false, tileNumber: 1 } as const,
  M3: { code: 'M3', tileType: TileType.MAN, suitNumber: 3, isRed: false, tileNumber: 2 } as const,
  M4: { code: 'M4', tileType: TileType.MAN, suitNumber: 4, isRed: false, tileNumber: 3 } as const,
  M5: { code: 'M5', tileType: TileType.MAN, suitNumber: 5, isRed: false, tileNumber: 4 } as const,
  M5R: { code: 'M5R', tileType: TileType.MAN, suitNumber: 5, isRed: true, tileNumber: 4 } as const, // 赤ドラ
  M6: { code: 'M6', tileType: TileType.MAN, suitNumber: 6, isRed: false, tileNumber: 5 } as const,
  M7: { code: 'M7', tileType: TileType.MAN, suitNumber: 7, isRed: false, tileNumber: 6 } as const,
  M8: { code: 'M8', tileType: TileType.MAN, suitNumber: 8, isRed: false, tileNumber: 7 } as const,
  M9: { code: 'M9', tileType: TileType.MAN, suitNumber: 9, isRed: false, tileNumber: 8 } as const,
  
  // 筒子 (P1-P9)
  P1: { code: 'P1', tileType: TileType.PIN, suitNumber: 1, isRed: false, tileNumber: 9 } as const,
  P2: { code: 'P2', tileType: TileType.PIN, suitNumber: 2, isRed: false, tileNumber: 10 } as const,
  P3: { code: 'P3', tileType: TileType.PIN, suitNumber: 3, isRed: false, tileNumber: 11 } as const,
  P4: { code: 'P4', tileType: TileType.PIN, suitNumber: 4, isRed: false, tileNumber: 12 } as const,
  P5: { code: 'P5', tileType: TileType.PIN, suitNumber: 5, isRed: false, tileNumber: 13 } as const,
  P5R: { code: 'P5R', tileType: TileType.PIN, suitNumber: 5, isRed: true, tileNumber: 13 } as const, // 赤ドラ
  P6: { code: 'P6', tileType: TileType.PIN, suitNumber: 6, isRed: false, tileNumber: 14 } as const,
  P7: { code: 'P7', tileType: TileType.PIN, suitNumber: 7, isRed: false, tileNumber: 15 } as const,
  P8: { code: 'P8', tileType: TileType.PIN, suitNumber: 8, isRed: false, tileNumber: 16 } as const,
  P9: { code: 'P9', tileType: TileType.PIN, suitNumber: 9, isRed: false, tileNumber: 17 } as const,
  
  // 索子 (S1-S9)
  S1: { code: 'S1', tileType: TileType.SOU, suitNumber: 1, isRed: false, tileNumber: 18 } as const,
  S2: { code: 'S2', tileType: TileType.SOU, suitNumber: 2, isRed: false, tileNumber: 19 } as const,
  S3: { code: 'S3', tileType: TileType.SOU, suitNumber: 3, isRed: false, tileNumber: 20 } as const,
  S4: { code: 'S4', tileType: TileType.SOU, suitNumber: 4, isRed: false, tileNumber: 21 } as const,
  S5: { code: 'S5', tileType: TileType.SOU, suitNumber: 5, isRed: false, tileNumber: 22 } as const,
  S5R: { code: 'S5R', tileType: TileType.SOU, suitNumber: 5, isRed: true, tileNumber: 22 } as const, // 赤ドラ
  S6: { code: 'S6', tileType: TileType.SOU, suitNumber: 6, isRed: false, tileNumber: 23 } as const,
  S7: { code: 'S7', tileType: TileType.SOU, suitNumber: 7, isRed: false, tileNumber: 24 } as const,
  S8: { code: 'S8', tileType: TileType.SOU, suitNumber: 8, isRed: false, tileNumber: 25 } as const,
  S9: { code: 'S9', tileType: TileType.SOU, suitNumber: 9, isRed: false, tileNumber: 26 } as const,
  
  // 風牌 (東南西北)
  WE: { code: 'WE', tileType: TileType.WIND, suitNumber: 0, isRed: false, tileNumber: 27 } as const, // 東
  WS: { code: 'WS', tileType: TileType.WIND, suitNumber: 0, isRed: false, tileNumber: 28 } as const, // 南
  WW: { code: 'WW', tileType: TileType.WIND, suitNumber: 0, isRed: false, tileNumber: 29 } as const, // 西
  WN: { code: 'WN', tileType: TileType.WIND, suitNumber: 0, isRed: false, tileNumber: 30 } as const, // 北
  
  // 三元牌 (白發中)
  DW: { code: 'DW', tileType: TileType.DRAGON, suitNumber: 0, isRed: false, tileNumber: 31 } as const, // 白
  DG: { code: 'DG', tileType: TileType.DRAGON, suitNumber: 0, isRed: false, tileNumber: 32 } as const, // 發
  DR: { code: 'DR', tileType: TileType.DRAGON, suitNumber: 0, isRed: false, tileNumber: 33 } as const  // 中
} as const;

// 牌の型定義
export type Tile = typeof Tiles[keyof typeof Tiles];

// 牌の順序定義（順子・ドラの計算に使用）
export const TILE_SEQUENCE: Tile[] = [
  Tiles.M1, Tiles.M2, Tiles.M3, Tiles.M4, Tiles.M5, Tiles.M6, Tiles.M7, Tiles.M8, Tiles.M9,
  Tiles.P1, Tiles.P2, Tiles.P3, Tiles.P4, Tiles.P5, Tiles.P6, Tiles.P7, Tiles.P8, Tiles.P9,
  Tiles.S1, Tiles.S2, Tiles.S3, Tiles.S4, Tiles.S5, Tiles.S6, Tiles.S7, Tiles.S8, Tiles.S9,
  Tiles.WE, Tiles.WS, Tiles.WW, Tiles.WN, Tiles.DW, Tiles.DG, Tiles.DR
] as const;

// 緑一色の構成牌
export const GREEN_TILES: Set<Tile> = new Set([
  Tiles.S2, Tiles.S3, Tiles.S4, Tiles.S6, Tiles.S8, Tiles.DG
] as const);

// 牌セット構成定義（136枚の内訳）
export const TILE_SET_CONFIG = new Map<Tile, number>([
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

// 牌定義リスト - Object.valuesで配列として利用可能
export const TILE_DEFINITIONS = Object.values(Tiles);