import _ from 'lodash';
import { isQuadTiles, isStraightTiles, isTripleTiles, Side, Sides, sorted, Tile, Wind, windToTile } from '../tiles';
import { PointType, PointTypes } from './score';

/**
 * 待ちクラス
 */
export class Wait {
  readonly name: string;

  private static values: Record<string, Wait> = {};
  static setValues(values: Record<string, Wait>): void {
    this.values = values;
  }

  constructor(name: string) {
    this.name = name;
  }

  /**
   * 待ちに対応する符の種類を取得します
   * @returns 符の種類
   */
  getPointType(): PointType {
    switch (this) {
      case Wait.values.DOUBLE_SIDE_STRAIGHT:
        return PointTypes.DOUBLE_SIDE_STRAIGHT_WAIT;
      case Wait.values.SINGLE_SIDE_STRAIGHT:
        return PointTypes.SINGLE_SIDE_STRAIGHT_WAIT;
      case Wait.values.MIDDLE_STRAIGHT:
        return PointTypes.MIDDLE_STRAIGHT_WAIT;
      case Wait.values.EITHER_HEAD:
        return PointTypes.EITHER_HEAD_WAIT;
      case Wait.values.SINGLE_HEAD:
        return PointTypes.SINGLE_HEAD_WAIT;
      default:
        throw new Error(`Unknown wait type: ${this.name}`);
    }
  }

  /**
   * 待ちに対応する符の点数を取得します
   * @returns 符の点数
   */
  getPoint(): number {
    return this.getPointType().points;
  }
}

// 待ちの定義
export const Waits = {
  DOUBLE_SIDE_STRAIGHT: new Wait('両面待ち'),
  SINGLE_SIDE_STRAIGHT: new Wait('辺張待ち'),
  MIDDLE_STRAIGHT: new Wait('嵌張待ち'),
  EITHER_HEAD: new Wait('双碰待ち'),
  SINGLE_HEAD: new Wait('単騎待ち')
} as const;

Wait.setValues(Waits);

/**
 * 面子クラス
 */
export class Meld {
  sortedTiles: Tile[];
  baseTiles: Tile[];    // もとになる牌（暗刻・暗槓の場合はすべての牌、副露の場合は手牌から出した牌）
  calledTile?: Tile;    // 副露で追加した牌（ポン・チー・明槓の場合）
  addedTile?: Tile;     // 加槓で追加した牌
  side: Side;           // 副露もと（暗刻・暗槓の場合はSELF）

  constructor(baseTiles: Tile[], side: Side, calledTile?: Tile, addedTile?: Tile) {
    this.sortedTiles = sorted(_.compact([...baseTiles, calledTile, addedTile]));
    this.baseTiles = baseTiles;
    this.side = side;
    this.calledTile = calledTile;
    this.addedTile = addedTile;
  }

  /**
   * 面子の切り詰められた牌を取得します（最初の3枚のみ）
   * @returns 最初の3枚の牌のリスト
   */
  getTruncatedTiles(): Tile[] {
    return this.sortedTiles.slice(0, 3);
  }

  /**
   * 面子のソート済み牌を取得します
   * @returns ソート済みの牌のリスト
   */
  getSortedTiles(): Tile[] {
    return this.sortedTiles;
  }

  getFirst(): Tile {
    return this.sortedTiles[0];
  }

  /**
   * この面子が順子であるか検査します
   * @returns true 順子の場合、false 順子でない場合
   */
  isStraight(): boolean {
    return this.sortedTiles.length === 3 && !this.baseTiles[0].equalsIgnoreRed(this.baseTiles[1]);
  }

  /**
   * この面子が刻子であるか検査します
   * @returns true 刻子の場合、false 刻子でない場合
   */
  isTriple(): boolean {
    return this.sortedTiles.length === 3 && this.baseTiles[0].equalsIgnoreRed(this.baseTiles[1]);
  }

  /**
   * この面子が槓子であるか検査します
   * @returns true 槓子の場合、false 槓子でない場合
   */
  isQuad(): boolean {
    return this.sortedTiles.length === 4;
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

  isDragon(): boolean {
    return this.sortedTiles.every(tile => tile.isDragon());
  }

  /**
   * 面子が字牌面子かどうか判定
   * @returns true 字牌面子、false 数牌面子
   */
  isHonor(): boolean {
    return this.sortedTiles.some(tile => tile.isHonor());
  }

  /**
   * 面子が老頭牌を含んでいるか検査します
   * @returns true 老頭牌を含む場合、false 含まない場合
   */
  isTerminal(): boolean {
    return this.sortedTiles.some(tile => tile.isTerminal());
  }

  /**
   * 面子が么九牌を含んでいるか検査します
   * @returns true 么九牌を含む場合、false 含まない場合
   */
  isOrphan(): boolean {
    return this.sortedTiles.some(tile => tile.isOrphan());
  }

  /**
   * 面子が老頭牌を含んでいるか検査します（後方互換性のため）
   * @deprecated isTerminal() を使用してください
   */
  isTerminalMeld(): boolean {
    return this.isTerminal();
  }

  /**
   * 面子が么九牌を含んでいるか検査します（後方互換性のため）
   * @deprecated isOrphan() を使用してください
   */
  isOrphanMeld(): boolean {
    return this.isOrphan();
  }

  getPointType(): PointType {
    if (this.isQuad()) {
      if (this.isConcealed()) {
        if (this.isOrphan()) {
          return PointTypes.ORPHAN_CONCEALED_QUAD;
        }
        return PointTypes.CONCEALED_QUAD;
      }
      if (this.isOrphan()) {
        return PointTypes.ORPHAN_QUAD;
      }
      return PointTypes.QUAD;
    }

    if (this.isTriple()) {
      if (this.isConcealed()) {
        if (this.isOrphan()) {
          return PointTypes.ORPHAN_CONCEALED_TRIPLE;
        }
        return PointTypes.CONCEALED_TRIPLE;
      }
      if (this.isOrphan()) {
        return PointTypes.ORPHAN_TRIPLE;
      }
      return PointTypes.TRIPLE;
    }

    return PointTypes.STRAIGHT;
  }

  getPoint(): number {
    return this.getPointType().points;
  }

  getWait(winningTile: Tile): Wait {
    if (this.sortedTiles.every(tile => !tile.equalsIgnoreRed(winningTile))) {
      throw new Error(`No winning tile found: ${winningTile.code} in meld`);
    }

    if (this.isStraight()) {
      const sortedTiles = this.getSortedTiles();
      // 真ん中の牌が和了牌の場合は嵌張待ち
      if (sortedTiles[1].equalsIgnoreRed(winningTile)) {
        return Waits.MIDDLE_STRAIGHT;
      }
      // 面子が老頭牌を含み、和了牌が老頭牌でない場合は辺張待ち
      if (this.isTerminal() && !winningTile.isTerminal()) {
        return Waits.SINGLE_SIDE_STRAIGHT;
      }
      // それ以外は両面待ち
      return Waits.DOUBLE_SIDE_STRAIGHT;
    }
    
    // 順子でない場合は双碰待ち
    return Waits.EITHER_HEAD;
  }

  /**
   * 同等の面子かどうか検査します
   */
  equalsIgnoreSizeAndRed(other: Meld): boolean {
    const thisTiles = this.getTruncatedTiles();
    const otherTiles = other.getTruncatedTiles();
    return thisTiles.every((tile, index) => tile.equalsIgnoreRed(otherTiles[index]));
  }
}

/**
 * 雀頭クラス（2枚組）
 */
export class Head {
  readonly tiles: Tile[];

  constructor(tiles: Tile[]) {
    if (tiles.length !== 2) {
      throw new Error(`Head must have exactly 2 tiles, got ${tiles.length}`);
    }
    this.tiles = tiles;
  }

  /**
   * 雀頭が么九牌かどうか判定
   * @returns true 么九牌雀頭、false 么九牌雀頭でない
   */
  isOrphan(): boolean {
    return this.tiles.some(tile => tile.isOrphan());
  }

  /**
   * 雀頭が字牌かどうか判定
   * @returns true 字牌雀頭、false 字牌雀頭でない
   */
  isHonor(): boolean {
    return this.tiles.some(tile => tile.isHonor());
  }

  /**
   * 雀頭が老頭牌かどうか判定
   * @returns true 老頭牌雀頭、false 老頭牌雀頭でない
   */
  isTerminal(): boolean {
    return this.tiles.some(tile => tile.isTerminal());
  }

  /**
   * 雀頭の牌を取得
   * @returns 雀頭の牌配列
   */
  getTiles(): Tile[] {
    return [...this.tiles];
  }

  /**
   * 雀頭の最初の牌を取得（同じ牌なので代表として）
   * @returns 雀頭の牌
   */
  getTile(): Tile {
    return this.tiles[0];
  }

  /**
   * 雀頭に対応する符の種類を取得します
   * 実装は point.ts の getPointTypeFromHead 関数を参照
   * @param roundWind 場風
   * @param seatWind 自風
   * @returns 符の種類
   */
  getPointType(roundWind: Wind, seatWind: Wind): PointType {
    if (this.tiles[0].isDragon()) {
      return PointTypes.HEAD_DRAGON;
    }
    
    if (this.tiles[0].isWind()) {
      const seatWindTile = windToTile(seatWind);
      const roundWindTile = windToTile(roundWind);

      const isSeatWindHead = this.tiles[0].equalsIgnoreRed(seatWindTile);
      const isRoundWindHead = this.tiles[0].equalsIgnoreRed(roundWindTile);

      if (isSeatWindHead && isRoundWindHead) {
        return PointTypes.DOUBLE_VALUABLE_HEAD;
      }
      if (isSeatWindHead) {
        return PointTypes.HEAD_SEAT_WIND;
      }
      if (isRoundWindHead) {
        return PointTypes.HEAD_ROUND_WIND;
      }
      return PointTypes.HEAD_OTHER_WIND;
    }
    
    return PointTypes.HEAD_SUIT;
  }

  /**
   * 雀頭に対応する符の点数を取得します
   * @param roundWind 場風
   * @param seatWind 自風
   * @returns 符の点数
   */
  getPoint(roundWind: Wind, seatWind: Wind): number {
    return this.getPointType(roundWind, seatWind).points;
  }
}

// 雀頭作成ファクトリ関数

/**
 * 雀頭を作成します
 * @param tiles 雀頭の牌（長さ2）
 * @returns 雀頭
 */
export function createHead(tiles: Tile[]): Head {
  return new Head(tiles);
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
