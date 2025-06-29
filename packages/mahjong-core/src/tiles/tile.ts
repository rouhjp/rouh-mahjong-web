export interface TileType {
  code: string;
  count: number; // 牌の枚数
}

export const TileTypes = {
  MAN: { code: 'MAN', count: 9 },
  PIN: { code: 'PIN', count: 9 },
  SOU: { code: 'SOU', count: 9 },
  WIND: { code: 'WIND', count: 4 },
  DRAGON: { code: 'DRAGON', count: 3 }
}

/**
 * 麻雀牌クラス
 */
export class Tile {
  readonly code: string;
  readonly tileType: TileType;
  readonly suitNumber: number;
  readonly tileNumber: number;
  private readonly red: boolean;

  private static tileSequence: Tile[] = [];
  static setTileSequence(tileSequence: Tile[]) {
    Tile.tileSequence = tileSequence;
  }

  constructor(code: string, tileType: TileType, suitNumber: number, isRed: boolean, tileNumber: number) {
    this.code = code;
    this.tileType = tileType;
    this.suitNumber = suitNumber;
    this.red = isRed;
    this.tileNumber = tileNumber;
  }

  /**
   * 字牌かどうか判定
   * @returns true 字牌の場合、false 字牌でない場合
   */
  isHonor(): boolean {
    return this.tileType === TileTypes.WIND || this.tileType === TileTypes.DRAGON;
  }

  /**
   * 老頭牌かどうか判定（1または9）
   * @returns true 老頭牌の場合、false 老頭牌でない場合
   */
  isTerminal(): boolean {
    return this.suitNumber === 1 || this.suitNumber === 9;
  }

  /**
   * 么九牌かどうか判定（字牌または老頭牌）
   * @returns true 么九牌の場合、false 么九牌でない場合
   */
  isOrphan(): boolean {
    return this.isHonor() || this.isTerminal();
  }

  /**
   * 三元牌かどうか判定
   * @returns true 三元牌の場合、false 三元牌でない場合
   */
  isDragon(): boolean {
    return this.tileType === TileTypes.DRAGON;
  }

  /**
   * 風牌かどうか判定
   * @returns true 風牌の場合、false 風牌でない場合
   */
  isWind(): boolean {
    return this.tileType === TileTypes.WIND;
  }

  /**
   * 赤ドラ牌かどうか判定
   */
  isPrisedRed(): boolean {
    return this.red;
  }

  /**
   * 前の牌が存在するか判定（順子構成用）
   * @returns true 前の牌が存在する場合、false 存在しない場合
   */
  hasPrevious(): boolean {
    return this.suitNumber >= 2 && this.suitNumber <= 9;
  }

  /**
   * 次の牌が存在するか判定（順子構成用）
   * @returns true 次の牌が存在する場合、false 存在しない場合
   */
  hasNext(): boolean {
    return this.suitNumber >= 1 && this.suitNumber <= 8;
  }

  /**
   * 前の牌を取得
   * @returns 前の牌
   * @throws Error 前の牌が存在しない場合
   */
  previous(): Tile {
    if (!this.hasPrevious()) {
      throw new Error(`Previous tile of ${this.code} does not exist`);
    }
    return Tile.tileSequence[(this.tileNumber + Tile.tileSequence.length - 1) % Tile.tileSequence.length];
  }

  /**
   * 次の牌を取得
   * @returns 次の牌
   * @throws Error 次の牌が存在しない場合
   */
  next(): Tile {
    if (!this.hasNext()) {
      throw new Error(`Next tile of ${this.code} does not exist`);
    }
    return Tile.tileSequence[(this.tileNumber + 1) % Tile.tileSequence.length];
  }

  /**
   * ドラ表示牌からドラ牌を取得
   * @returns ドラ牌
   */
  indicates(): Tile {
    if (this.suitNumber === this.tileType.count) {
      return Tile.tileSequence[(this.tileNumber - (this.tileType.count - 1)) % Tile.tileSequence.length];
    }
    return Tile.tileSequence[(this.tileNumber + 1) % Tile.tileSequence.length];
  }

  simplify(): Tile {
    return Tile.tileSequence[this.tileNumber];
  }

  /**
   * 赤ドラを無視して等価か判定
   * @param other 比較対象の牌
   * @returns true 等価の場合、false 等価でない場合
   */
  equalsIgnoreRed(other: Tile): boolean {
    return this.tileNumber === other.tileNumber;
  }

  /**
   * 同種の牌かどうか判定
   * @param other 比較対象の牌
   * @returns true 同種の場合、false 同種でない場合
   */
  isSameType(other: Tile): boolean {
    return this.tileType === other.tileType;
  }

  /**
   * 指定した牌の次の牌かどうか判定（赤ドラ無視）
   * @param other 比較対象の牌
   * @returns true 次の牌の場合、false 次の牌でない場合
   */
  isNextOf(other: Tile): boolean {
    return other.hasNext() && this.equalsIgnoreRed(other.next());
  }

  /**
   * 指定した牌の前の牌かどうか判定（赤ドラ無視）
   * @param other 比較対象の牌
   * @returns true 前の牌の場合、false 前の牌でない場合
   */
  isPreviousOf(other: Tile): boolean {
    return other.hasPrevious() && this.equalsIgnoreRed(other.previous());
  }

  /**
   * 牌の比較（ソート用）
   * @param other 比較対象の牌
   * @returns 比較結果（負の数: this < other, 0: this === other, 正の数: this > other）
   */
  compareTo(other: Tile): number {
    return this.tileNumber - other.tileNumber;
  }
}

// 牌定義オブジェクト - Tiles.M1.suitNumber のような呼び出しが可能
export const Tiles = {
  // 萬子 (M1-M9)
  M1: new Tile('M1', TileTypes.MAN, 1, false, 0),
  M2: new Tile('M2', TileTypes.MAN, 2, false, 1),
  M3: new Tile('M3', TileTypes.MAN, 3, false, 2),
  M4: new Tile('M4', TileTypes.MAN, 4, false, 3),
  M5: new Tile('M5', TileTypes.MAN, 5, false, 4),
  M5R: new Tile('M5R', TileTypes.MAN, 5, true, 4), // 赤ドラ
  M6: new Tile('M6', TileTypes.MAN, 6, false, 5),
  M7: new Tile('M7', TileTypes.MAN, 7, false, 6),
  M8: new Tile('M8', TileTypes.MAN, 8, false, 7),
  M9: new Tile('M9', TileTypes.MAN, 9, false, 8),
  
  // 筒子 (P1-P9)
  P1: new Tile('P1', TileTypes.PIN, 1, false, 9),
  P2: new Tile('P2', TileTypes.PIN, 2, false, 10),
  P3: new Tile('P3', TileTypes.PIN, 3, false, 11),
  P4: new Tile('P4', TileTypes.PIN, 4, false, 12),
  P5: new Tile('P5', TileTypes.PIN, 5, false, 13),
  P5R: new Tile('P5R', TileTypes.PIN, 5, true, 13), // 赤ドラ
  P6: new Tile('P6', TileTypes.PIN, 6, false, 14),
  P7: new Tile('P7', TileTypes.PIN, 7, false, 15),
  P8: new Tile('P8', TileTypes.PIN, 8, false, 16),
  P9: new Tile('P9', TileTypes.PIN, 9, false, 17),
  
  // 索子 (S1-S9)
  S1: new Tile('S1', TileTypes.SOU, 1, false, 18),
  S2: new Tile('S2', TileTypes.SOU, 2, false, 19),
  S3: new Tile('S3', TileTypes.SOU, 3, false, 20),
  S4: new Tile('S4', TileTypes.SOU, 4, false, 21),
  S5: new Tile('S5', TileTypes.SOU, 5, false, 22),
  S5R: new Tile('S5R', TileTypes.SOU, 5, true, 22), // 赤ドラ
  S6: new Tile('S6', TileTypes.SOU, 6, false, 23),
  S7: new Tile('S7', TileTypes.SOU, 7, false, 24),
  S8: new Tile('S8', TileTypes.SOU, 8, false, 25),
  S9: new Tile('S9', TileTypes.SOU, 9, false, 26),
  
  // 風牌 (東南西北)
  WE: new Tile('WE', TileTypes.WIND, 1, false, 27), // 東
  WS: new Tile('WS', TileTypes.WIND, 2, false, 28), // 南
  WW: new Tile('WW', TileTypes.WIND, 3, false, 29), // 西
  WN: new Tile('WN', TileTypes.WIND, 4, false, 30), // 北
  
  // 三元牌 (白發中)
  DW: new Tile('DW', TileTypes.DRAGON, 1, false, 31), // 白
  DG: new Tile('DG', TileTypes.DRAGON, 2, false, 32), // 發
  DR: new Tile('DR', TileTypes.DRAGON, 3, false, 33)  // 中
} as const;

const TILE_SEQUENCE: Tile[] = [
  Tiles.M1, Tiles.M2, Tiles.M3, Tiles.M4, Tiles.M5, Tiles.M5R, Tiles.M6, Tiles.M7, Tiles.M8, Tiles.M9,
  Tiles.P1, Tiles.P2, Tiles.P3, Tiles.P4, Tiles.P5, Tiles.P5R, Tiles.P6, Tiles.P7, Tiles.P8, Tiles.P9,
  Tiles.S1, Tiles.S2, Tiles.S3, Tiles.S4, Tiles.S5, Tiles.S5R, Tiles.S6, Tiles.S7, Tiles.S8, Tiles.S9,
  Tiles.WE, Tiles.WS, Tiles.WW, Tiles.WN,
  Tiles.DW, Tiles.DG, Tiles.DR
] as const;

Tile.setTileSequence(TILE_SEQUENCE);

// 么九牌のリスト
export const ORPHAN_TILES = TILE_SEQUENCE.filter(tile => tile.isOrphan());

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
function compareTiles(a: Tile, b: Tile): number {
  return a.compareTo(b);
}

// 牌をソートする関数
export function sorted(tiles: Tile[]): Tile[] {
  return [...tiles].sort(compareTiles);
}

// 刻子判定関数（同じ牌が3枚）
export function isTripleTiles(tiles: Tile[]): boolean {
  if (tiles.length !== 3) return false;
  const first = tiles[0];
  return tiles.every(tile => tile.equalsIgnoreRed(first));
}

// 槓子判定関数（同じ牌が4枚）
export function isQuadTiles(tiles: Tile[]): boolean {
  if (tiles.length !== 4) return false;
  const first = tiles[0];
  return tiles.every(tile => tile.equalsIgnoreRed(first));
}

// 順子判定関数（連続する3枚の数牌）
export function isStraightTiles(tiles: Tile[]): boolean {
  if (tiles.length !== 3) return false;
  
  // 字牌は順子を構成できない
  if (tiles.some(tile => tile.isHonor())) return false;
  
  // 同じ種類の牌でなければならない
  const firstType = tiles[0].tileType;
  if (!tiles.every(tile => tile.tileType === firstType)) return false;
  
  // ソートして連続性を確認
  const sortedTiles = sorted(tiles);
  for (let i = 1; i < sortedTiles.length; i++) {
    if (sortedTiles[i].suitNumber !== sortedTiles[i-1].suitNumber + 1) {
      return false;
    }
  }
  
  return true;
}
