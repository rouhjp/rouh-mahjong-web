// Tile class with instance methods

export enum TileType {
  MAN = 'MAN',     // 萬子
  PIN = 'PIN',     // 筒子  
  SOU = 'SOU',     // 索子
  WIND = 'WIND',   // 風牌
  DRAGON = 'DRAGON' // 三元牌
}

/**
 * 麻雀牌クラス
 */
export class Tile {
  readonly code: string;
  readonly tileType: TileType;
  readonly suitNumber: number;
  readonly isRed: boolean;
  readonly tileNumber: number;

  // Static reference to tile sequence (lazy initialization)
  private static _tileSequence: Tile[] | null = null;

  constructor(code: string, tileType: TileType, suitNumber: number, isRed: boolean, tileNumber: number) {
    this.code = code;
    this.tileType = tileType;
    this.suitNumber = suitNumber;
    this.isRed = isRed;
    this.tileNumber = tileNumber;
  }

  /**
   * タイルシーケンスを取得（遅延初期化）
   */
  private static get tileSequence(): Tile[] {
    if (!Tile._tileSequence) {
      // 遅延初期化：初回アクセス時にタイルシーケンスを構築
      Tile._tileSequence = [
        Tiles.M1, Tiles.M2, Tiles.M3, Tiles.M4, Tiles.M5, Tiles.M6, Tiles.M7, Tiles.M8, Tiles.M9,
        Tiles.P1, Tiles.P2, Tiles.P3, Tiles.P4, Tiles.P5, Tiles.P6, Tiles.P7, Tiles.P8, Tiles.P9,
        Tiles.S1, Tiles.S2, Tiles.S3, Tiles.S4, Tiles.S5, Tiles.S6, Tiles.S7, Tiles.S8, Tiles.S9,
        Tiles.WE, Tiles.WS, Tiles.WW, Tiles.WN, Tiles.DW, Tiles.DG, Tiles.DR
      ];
    }
    return Tile._tileSequence;
  }

  /**
   * 字牌かどうか判定
   * @returns true 字牌の場合、false 字牌でない場合
   */
  isHonor(): boolean {
    return this.suitNumber === 0;
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
   * 緑一色の構成牌かどうか判定
   * @returns true 緑一色構成牌の場合、false 緑一色構成牌でない場合
   */
  isGreen(): boolean {
    // S2, S3, S4, S6, S8, DG
    return (this.tileType === TileType.SOU && [2, 3, 4, 6, 8].includes(this.suitNumber)) ||
           (this.tileType === TileType.DRAGON && this.code === 'DG');
  }

  /**
   * 三元牌かどうか判定
   * @returns true 三元牌の場合、false 三元牌でない場合
   */
  isDragon(): boolean {
    return this.tileType === TileType.DRAGON;
  }

  /**
   * 風牌かどうか判定
   * @returns true 風牌の場合、false 風牌でない場合
   */
  isWind(): boolean {
    return this.tileType === TileType.WIND;
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
  getPrevious(): Tile {
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
  getNext(): Tile {
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
    
    // 特殊ケース
    if (this.tileNumber === 8) return Tile.tileSequence[0];   // M9 -> M1
    if (this.tileNumber === 17) return Tile.tileSequence[9];  // P9 -> P1
    if (this.tileNumber === 26) return Tile.tileSequence[18]; // S9 -> S1
    if (this.tileNumber === 33) return Tile.tileSequence[31]; // DR -> DW
    if (this.tileNumber === 30) return Tile.tileSequence[27]; // WN -> WE
    
    return Tile.tileSequence[(this.tileNumber + 1) % Tile.tileSequence.length];
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
    return other.hasNext() && this.equalsIgnoreRed(other.getNext());
  }

  /**
   * 指定した牌の前の牌かどうか判定（赤ドラ無視）
   * @param other 比較対象の牌
   * @returns true 前の牌の場合、false 前の牌でない場合
   */
  isPreviousOf(other: Tile): boolean {
    return other.hasPrevious() && this.equalsIgnoreRed(other.getPrevious());
  }

  /**
   * 牌の比較（ソート用）
   * @param other 比較対象の牌
   * @returns 比較結果（負の数: this < other, 0: this === other, 正の数: this > other）
   */
  compareTo(other: Tile): number {
    return this.tileNumber - other.tileNumber;
  }

  /**
   * 文字列表現を取得
   * @returns 牌のコード
   */
  toString(): string {
    return this.code;
  }
}

// 牌定義オブジェクト - Tiles.M1.suitNumber のような呼び出しが可能
export const Tiles = {
  // 萬子 (M1-M9)
  M1: new Tile('M1', TileType.MAN, 1, false, 0),
  M2: new Tile('M2', TileType.MAN, 2, false, 1),
  M3: new Tile('M3', TileType.MAN, 3, false, 2),
  M4: new Tile('M4', TileType.MAN, 4, false, 3),
  M5: new Tile('M5', TileType.MAN, 5, false, 4),
  M5R: new Tile('M5R', TileType.MAN, 5, true, 4), // 赤ドラ
  M6: new Tile('M6', TileType.MAN, 6, false, 5),
  M7: new Tile('M7', TileType.MAN, 7, false, 6),
  M8: new Tile('M8', TileType.MAN, 8, false, 7),
  M9: new Tile('M9', TileType.MAN, 9, false, 8),
  
  // 筒子 (P1-P9)
  P1: new Tile('P1', TileType.PIN, 1, false, 9),
  P2: new Tile('P2', TileType.PIN, 2, false, 10),
  P3: new Tile('P3', TileType.PIN, 3, false, 11),
  P4: new Tile('P4', TileType.PIN, 4, false, 12),
  P5: new Tile('P5', TileType.PIN, 5, false, 13),
  P5R: new Tile('P5R', TileType.PIN, 5, true, 13), // 赤ドラ
  P6: new Tile('P6', TileType.PIN, 6, false, 14),
  P7: new Tile('P7', TileType.PIN, 7, false, 15),
  P8: new Tile('P8', TileType.PIN, 8, false, 16),
  P9: new Tile('P9', TileType.PIN, 9, false, 17),
  
  // 索子 (S1-S9)
  S1: new Tile('S1', TileType.SOU, 1, false, 18),
  S2: new Tile('S2', TileType.SOU, 2, false, 19),
  S3: new Tile('S3', TileType.SOU, 3, false, 20),
  S4: new Tile('S4', TileType.SOU, 4, false, 21),
  S5: new Tile('S5', TileType.SOU, 5, false, 22),
  S5R: new Tile('S5R', TileType.SOU, 5, true, 22), // 赤ドラ
  S6: new Tile('S6', TileType.SOU, 6, false, 23),
  S7: new Tile('S7', TileType.SOU, 7, false, 24),
  S8: new Tile('S8', TileType.SOU, 8, false, 25),
  S9: new Tile('S9', TileType.SOU, 9, false, 26),
  
  // 風牌 (東南西北)
  WE: new Tile('WE', TileType.WIND, 0, false, 27), // 東
  WS: new Tile('WS', TileType.WIND, 0, false, 28), // 南
  WW: new Tile('WW', TileType.WIND, 0, false, 29), // 西
  WN: new Tile('WN', TileType.WIND, 0, false, 30), // 北
  
  // 三元牌 (白發中)
  DW: new Tile('DW', TileType.DRAGON, 0, false, 31), // 白
  DG: new Tile('DG', TileType.DRAGON, 0, false, 32), // 發
  DR: new Tile('DR', TileType.DRAGON, 0, false, 33)  // 中
} as const;

// 緑一色の構成牌
export const GREEN_TILES: Set<Tile> = new Set([
  Tiles.S2, Tiles.S3, Tiles.S4, Tiles.S6, Tiles.S8, Tiles.DG
]);

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


// 風位・方向関連の型定義

/**
 * 絶対風位クラス（東西南北）
 */
export class Wind {
  readonly code: string;
  readonly name: string;
  readonly order: number;

  constructor(code: string, name: string, order: number) {
    this.code = code;
    this.name = name;
    this.order = order;
  }

  /**
   * 東南西北の順に習い、次の風位を返します
   * @returns 次の風位（東→南→西→北→東...）
   */
  next(): Wind {
    return this.shift(1);
  }

  /**
   * 東南西北の順に習い、指定した数だけ風位を進めます
   * @param n 進める数（負の数で戻る）
   * @returns 移動後の風位
   */
  shift(n: number): Wind {
    const newOrder = (this.order + n + 4) % 4;
    return WIND_ORDER[newOrder];
  }

  /**
   * この風位から見た相対方位にある風位を返します
   * @param side 相対方位
   * @returns この風位からみて相対方位にある風位
   */
  at(side: Side): Wind {
    return this.shift(side.offset);
  }

  /**
   * この風位から見た対象風位の相対方位を返します
   * @param target 対象の風位
   * @returns この風位からみた対象風位の相対位置
   */
  sideOf(target: Wind): Side {
    const offset = (target.order - this.order + 4) % 4;
    return SIDE_ORDER[offset];
  }

  /**
   * この風位以外の風位をリストで返します
   * @returns 残りの風位のリスト
   */
  others(): Wind[] {
    return WIND_ORDER.filter(w => w !== this);
  }

  /**
   * 風位に対応する風牌を返します
   * @returns 対応する風牌
   */
  toTile(): any {
    return windToTile(this);
  }

  /**
   * 文字列表現を取得
   * @returns 風位のコード
   */
  toString(): string {
    return this.code;
  }
}

/**
 * 相対方向クラス（自家から見た位置）
 */
export class Side {
  readonly code: string;
  readonly name: string;
  readonly offset: number;

  constructor(code: string, name: string, offset: number) {
    this.code = code;
    this.name = name;
    this.offset = offset;
  }

  /**
   * この相対方位から見た相対方位の位置を返します（相対方位の合成）
   * @param target 対象の相対方位
   * @returns この相対方位からみた対象相対方位の位置
   */
  at(target: Side): Side {
    const newOffset = (this.offset + target.offset) % 4;
    return SIDE_ORDER[newOffset];
  }

  /**
   * この相対位置以外の相対位置をリスト形式で返します
   * @returns 残りの相対位置のリスト
   */
  others(): Side[] {
    return [
      Sides.RIGHT.at(this),
      Sides.ACROSS.at(this), 
      Sides.LEFT.at(this)
    ];
  }

  /**
   * 文字列表現を取得
   * @returns 相対方位のコード
   */
  toString(): string {
    return this.code;
  }
}

// 風位の定義オブジェクト
export const Winds = {
  EAST: new Wind('E', '東', 0),
  SOUTH: new Wind('S', '南', 1),
  WEST: new Wind('W', '西', 2),
  NORTH: new Wind('N', '北', 3)
} as const;

// 相対方向の定義オブジェクト
export const Sides = {
  SELF: new Side('SELF', '自家', 0),      // 自分
  RIGHT: new Side('RIGHT', '下家', 1),    // 右隣（下家）
  ACROSS: new Side('ACROSS', '対面', 2),  // 対面
  LEFT: new Side('LEFT', '上家', 3)       // 左隣（上家）
} as const;

// 風位の順序配列（東→南→西→北）
export const WIND_ORDER: Wind[] = [
  Winds.EAST,
  Winds.SOUTH, 
  Winds.WEST,
  Winds.NORTH
] as const;

// 相対方向の順序配列（自家→下家→対面→上家）
export const SIDE_ORDER: Side[] = [
  Sides.SELF,
  Sides.RIGHT,
  Sides.ACROSS,
  Sides.LEFT
] as const;


/**
 * サイコロ2個の目から起家の相対方位を返します
 * @param d1 1つ目のサイコロの目の値(1..6)
 * @param d2 2つ目のサイコロの目の値(1..6)
 * @returns RIGHT  サイコロの目の合計が 2, 6, 10 のとき
 *          ACROSS サイコロの眼の合計が 3, 7, 11 のとき
 *          LEFT   サイコロの眼の合計が 4, 8, 12 のとき
 *          SELF   サイコロの眼の合計が 5, 9 のとき
 * @throws Error 与えられたサイコロの目が1~6の範囲外の場合
 */
export function getSideByDice(d1: number, d2: number): Side {
  if (d1 <= 0 || d2 <= 0 || d1 > 6 || d2 > 6) {
    throw new Error(`Invalid dice value: ${d1}, ${d2}`);
  }
  return getSideByDiceSum(d1 + d2);
}

/**
 * サイコロの合計値から起家の相対方位を返します
 * @param diceSum 2つのサイコロの目の合計値(2..12)
 * @returns RIGHT  サイコロの目の合計が 2, 6, 10 のとき
 *          ACROSS サイコロの眼の合計が 3, 7, 11 のとき
 *          LEFT   サイコロの眼の合計が 4, 8, 12 のとき
 *          SELF   サイコロの眼の合計が 5, 9 のとき
 * @throws Error 与えられたサイコロの目の合計が2~12の範囲外の場合
 */
export function getSideByDiceSum(diceSum: number): Side {
  if (diceSum < 2 || diceSum > 12) {
    throw new Error(`Invalid dice sum: ${diceSum}`);
  }
  const index = (diceSum - 1) % 4;
  return SIDE_ORDER[index];
}

/**
 * 風位に対応する風牌を返します
 * @param wind 風位
 * @returns 対応する風牌
 */
export function windToTile(wind: Wind): Tile {
  switch (wind) {
    case Winds.EAST: return Tiles.WE;   // 東
    case Winds.SOUTH: return Tiles.WS;  // 南
    case Winds.WEST: return Tiles.WW;   // 西
    case Winds.NORTH: return Tiles.WN;  // 北
    default: throw new Error(`Invalid wind: ${wind.code}`);
  }
}

/**
 * 風牌に対応する風位を返します
 * @param tile 風牌
 * @returns 対応する風位、風牌でない場合は null
 */
export function tileToWind(tile: Tile): Wind {
  switch (tile) {
    case Tiles.WE: return Winds.EAST;   // 東
    case Tiles.WS: return Winds.SOUTH;  // 南
    case Tiles.WW: return Winds.WEST;   // 西
    case Tiles.WN: return Winds.NORTH;  // 北
    default: throw new Error(`Tile is not a wind tile: ${tile.code}`);
  }
}

