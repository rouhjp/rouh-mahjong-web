// Meld class and factory methods

import type { Side, Tile } from '../tiles/tile.js';
import { isTripleTiles, isQuadTiles, isStraightTiles, Sides } from '../tiles/tile.js';

/**
 * 面子クラス
 */
export class Meld {
  baseTiles: Tile[];    // もとになる牌（暗刻・暗槓の場合はすべての牌、副露の場合は手牌から出した牌）
  calledTile?: Tile;    // 副露で追加した牌（ポン・チー・明槓の場合）
  addedTile?: Tile;     // 加槓で追加した牌
  side: Side;           // 副露もと（暗刻・暗槓の場合はSELF）

  constructor(baseTiles: Tile[], side: Side, calledTile?: Tile, addedTile?: Tile) {
    this.baseTiles = baseTiles;
    this.side = side;
    this.calledTile = calledTile;
    this.addedTile = addedTile;
  }

  /**
   * 面子のすべての牌を取得します
   * @returns すべての牌のリスト
   */
  getAllTiles(): Tile[] {
    const tiles = [...this.baseTiles];
    if (this.calledTile) tiles.push(this.calledTile);
    if (this.addedTile) tiles.push(this.addedTile);
    return tiles;
  }

  /**
   * 面子の切り詰められた牌を取得します（最初の3枚のみ）
   * @returns 最初の3枚の牌のリスト
   */
  getTruncatedTiles(): Tile[] {
    const allTiles = this.getAllTiles();
    return allTiles.slice(0, 3);
  }

  /**
   * 面子のソート済み牌を取得します
   * @returns ソート済みの牌のリスト
   */
  getSortedTiles(): Tile[] {
    const allTiles = this.getAllTiles();
    return this._sorted(allTiles);
  }

  /**
   * この面子が順子であるか検査します
   * @returns true 順子の場合、false 順子でない場合
   */
  isStraight(): boolean {
    const allTiles = this.getAllTiles();
    return this._isStraightTiles(allTiles);
  }

  /**
   * この面子が刻子であるか検査します
   * @returns true 刻子の場合、false 刻子でない場合
   */
  isTriple(): boolean {
    const allTiles = this.getAllTiles();
    return this._isTripleTiles(allTiles);
  }

  /**
   * この面子が槓子であるか検査します
   * @returns true 槓子の場合、false 槓子でない場合
   */
  isQuad(): boolean {
    const allTiles = this.getAllTiles();
    return this._isQuadTiles(allTiles);
  }

  /**
   * この面子が暗面子かどうか検査します
   * この面子が暗槓であれば検査に適合します
   * この面子がロン和了で成立した面子である場合検査に適合しません
   * @returns true 門前の場合、false 門前でない場合
   */
  isConcealed(): boolean {
    return this.calledTile === undefined;
  }

  /**
   * この面子が暗槓であるか検査します
   * @returns true 暗槓の場合、false 暗槓でない場合
   */
  isSelfQuad(): boolean {
    return this.baseTiles.length === 4;
  }

  /**
   * この面子が加槓であるか検査します
   * @returns true 加槓の場合、false 加槓でない場合
   */
  isAddQuad(): boolean {
    return this.addedTile !== undefined;
  }

  /**
   * この面子が大明槓であるか検査します
   * @returns true 大明槓の場合、false 大明槓でない場合
   */
  isCallQuad(): boolean {
    return this.baseTiles.length === 3 && this.calledTile !== undefined;
  }

  /**
   * この面子が公開面子でない、点数計算時に並べ替えによって作成された面子か検査します
   * @returns true 公開面子でない場合、false 公開面子の場合
   */
  isHandMeld(): boolean {
    return this.calledTile === undefined && !this.isSelfQuad();
  }

  /**
   * 面子が老頭牌を含んでいるか検査します
   * @returns true 老頭牌を含む場合、false 含まない場合
   */
  isTerminalMeld(): boolean {
    const allTiles = this.getAllTiles();
    return allTiles.some(tile => this._isTerminal(tile));
  }

  /**
   * 面子が么九牌を含んでいるか検査します
   * @returns true 么九牌を含む場合、false 含まない場合
   */
  isOrphanMeld(): boolean {
    const allTiles = this.getAllTiles();
    return allTiles.some(tile => this._isOrphan(tile));
  }

  // Private helper methods (to avoid circular imports)
  private _isStraightTiles(tiles: Tile[]): boolean {
    if (tiles.length !== 3) return false;
    
    // 字牌は順子を構成できない
    if (tiles.some(tile => tile.suitNumber === 0)) return false;
    
    // 同じ種類の牌でなければならない
    const firstType = tiles[0].tileType;
    if (!tiles.every(tile => tile.tileType === firstType)) return false;
    
    // ソートして連続性を確認
    const sortedTiles = [...tiles].sort((a, b) => a.tileNumber - b.tileNumber);
    for (let i = 1; i < sortedTiles.length; i++) {
      if (sortedTiles[i].suitNumber !== sortedTiles[i-1].suitNumber + 1) {
        return false;
      }
    }
    
    return true;
  }

  private _isTripleTiles(tiles: Tile[]): boolean {
    if (tiles.length !== 3) return false;
    const first = tiles[0];
    return tiles.every(tile => tile.tileNumber === first.tileNumber);
  }

  private _isQuadTiles(tiles: Tile[]): boolean {
    if (tiles.length !== 4) return false;
    const first = tiles[0];
    return tiles.every(tile => tile.tileNumber === first.tileNumber);
  }

  private _isTerminal(tile: Tile): boolean {
    return tile.suitNumber === 1 || tile.suitNumber === 9;
  }

  private _isOrphan(tile: Tile): boolean {
    return tile.suitNumber === 0 || tile.suitNumber === 1 || tile.suitNumber === 9;
  }

  private _sorted(tiles: Tile[]): Tile[] {
    return [...tiles].sort((a, b) => a.tileNumber - b.tileNumber);
  }
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
  return new Meld(tiles, Sides.SELF);
}

/**
 * カンによって加槓を作成します
 * @param triple 元となる明刻
 * @param added 加槓宣言牌
 * @returns 加槓
 * @throws Error 明刻以外の面子が指定された場合、または加槓宣言牌が不適合の場合
 */
export function createAddQuad(triple: Meld, added: Tile): Meld {
  if (!triple.isTriple()) {
    throw new Error(`Invalid meld for add quad base: must be triple`);
  }
  const resultTiles = [...triple.baseTiles, added];
  if (triple.calledTile) resultTiles.push(triple.calledTile);
  if (!isQuadTiles(resultTiles)) {
    throw new Error(`Invalid tiles for add quad: resulting tiles do not form a quad`);
  }
  return new Meld(triple.baseTiles, triple.side, triple.calledTile, added);
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
  return new Meld(base, source, claimed);
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
  return new Meld(base, source, claimed);
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
  return new Meld(base, Sides.LEFT, claimed);  // チーは常に上家から
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
  return new Meld(tiles, Sides.SELF);
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
  return new Meld(base, Sides.SELF, claimed);
}