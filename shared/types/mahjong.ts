// 麻雀ゲーム関連の型定義

// 牌タイプの定義
export enum TileType {
  MAN = 'MAN',     // 萬子
  PIN = 'PIN',     // 筒子  
  SOU = 'SOU',     // 索子
  WIND = 'WIND',   // 風牌
  DRAGON = 'DRAGON' // 三元牌
}

// 牌定義オブジェクト - Tile.M1.suitNumber のような呼び出しが可能
export const Tile = {
  // 萬子 (M1-M9)
  M1: { tileType: TileType.MAN, suitNumber: 1, isRed: false } as const,
  M2: { tileType: TileType.MAN, suitNumber: 2, isRed: false } as const,
  M3: { tileType: TileType.MAN, suitNumber: 3, isRed: false } as const,
  M4: { tileType: TileType.MAN, suitNumber: 4, isRed: false } as const,
  M5: { tileType: TileType.MAN, suitNumber: 5, isRed: false } as const,
  M5R: { tileType: TileType.MAN, suitNumber: 5, isRed: true } as const, // 赤ドラ
  M6: { tileType: TileType.MAN, suitNumber: 6, isRed: false } as const,
  M7: { tileType: TileType.MAN, suitNumber: 7, isRed: false } as const,
  M8: { tileType: TileType.MAN, suitNumber: 8, isRed: false } as const,
  M9: { tileType: TileType.MAN, suitNumber: 9, isRed: false } as const,
  
  // 筒子 (P1-P9)
  P1: { tileType: TileType.PIN, suitNumber: 1, isRed: false } as const,
  P2: { tileType: TileType.PIN, suitNumber: 2, isRed: false } as const,
  P3: { tileType: TileType.PIN, suitNumber: 3, isRed: false } as const,
  P4: { tileType: TileType.PIN, suitNumber: 4, isRed: false } as const,
  P5: { tileType: TileType.PIN, suitNumber: 5, isRed: false } as const,
  P5R: { tileType: TileType.PIN, suitNumber: 5, isRed: true } as const, // 赤ドラ
  P6: { tileType: TileType.PIN, suitNumber: 6, isRed: false } as const,
  P7: { tileType: TileType.PIN, suitNumber: 7, isRed: false } as const,
  P8: { tileType: TileType.PIN, suitNumber: 8, isRed: false } as const,
  P9: { tileType: TileType.PIN, suitNumber: 9, isRed: false } as const,
  
  // 索子 (S1-S9)
  S1: { tileType: TileType.SOU, suitNumber: 1, isRed: false } as const,
  S2: { tileType: TileType.SOU, suitNumber: 2, isRed: false } as const,
  S3: { tileType: TileType.SOU, suitNumber: 3, isRed: false } as const,
  S4: { tileType: TileType.SOU, suitNumber: 4, isRed: false } as const,
  S5: { tileType: TileType.SOU, suitNumber: 5, isRed: false } as const,
  S5R: { tileType: TileType.SOU, suitNumber: 5, isRed: true } as const, // 赤ドラ
  S6: { tileType: TileType.SOU, suitNumber: 6, isRed: false } as const,
  S7: { tileType: TileType.SOU, suitNumber: 7, isRed: false } as const,
  S8: { tileType: TileType.SOU, suitNumber: 8, isRed: false } as const,
  S9: { tileType: TileType.SOU, suitNumber: 9, isRed: false } as const,
  
  // 風牌 (東南西北)
  WE: { tileType: TileType.WIND, suitNumber: 0, isRed: false } as const, // 東
  WS: { tileType: TileType.WIND, suitNumber: 0, isRed: false } as const, // 南
  WW: { tileType: TileType.WIND, suitNumber: 0, isRed: false } as const, // 西
  WN: { tileType: TileType.WIND, suitNumber: 0, isRed: false } as const, // 北
  
  // 三元牌 (白發中)
  DW: { tileType: TileType.DRAGON, suitNumber: 0, isRed: false } as const, // 白
  DG: { tileType: TileType.DRAGON, suitNumber: 0, isRed: false } as const, // 發
  DR: { tileType: TileType.DRAGON, suitNumber: 0, isRed: false } as const  // 中
} as const;
