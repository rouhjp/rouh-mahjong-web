import { Side, Sides, Tile, Wind } from "../tiles";

// 和了オプション（ゲーム状況フラグ）
export const WinningOptions = {
  // 立直
  READY: 'READY',
  // ダブル立直
  FIRST_AROUND_READY: 'FIRST_AROUND_READY',
  // 第一巡ツモ(天和/地和)
  FIRST_AROUND_TSUMO: 'FIRST_AROUND_TSUMO',
  // 一発
  READY_AROUND_WIN: 'READY_AROUND_WIN',
  // 海底摸月
  LAST_TILE_TSUMO: 'LAST_TILE_TSUMO',
  // 河底撈魚
  LAST_TILE_RON: 'LAST_TILE_RON',
  // 嶺上開花
  QUAD_TURN_TSUMO: 'QUAD_TURN_TSUMO',
  // 槍槓
  QUAD_TILE_RON: 'QUAD_TILE_RON',
  // 八連荘
  EIGHT_CONSEQUTIVE_WIN: 'EIGHT_CONSEQUTIVE_WIN',
} as const;

export type WinningOption = typeof WinningOptions[keyof typeof WinningOptions];

// 和了状況（ゲーム状態）
export class WinningSituation {
  readonly roundWind: Wind;                    // 場風
  readonly seatWind: Wind;                     // 自風
  readonly supplierSide: Side;                 // 和了牌の供給元（ツモの場合は SELF）
  readonly upperIndicators: Tile[];            // 表ドラ表示牌
  readonly lowerIndicators: Tile[];            // 裏ドラ表示牌
  readonly options: WinningOption[];           // ゲーム状況フラグ

  constructor(
    roundWind: Wind,
    seatWind: Wind,
    supplierSide: Side,
    upperIndicators: Tile[],
    lowerIndicators: Tile[],
    options: WinningOption[]
  ) {
    this.roundWind = roundWind;
    this.seatWind = seatWind;
    this.supplierSide = supplierSide;
    this.upperIndicators = upperIndicators;
    this.lowerIndicators = lowerIndicators;
    this.options = options;
  }

  /**
   * 立直状態かどうか判定
   * @returns true 立直中、false 立直していない
   */
  isReady(): boolean {
    return this.options.includes(WinningOptions.READY) || 
           this.options.includes(WinningOptions.FIRST_AROUND_READY);
  }

  /**
   * ダブル立直かどうか判定
   * @returns true ダブル立直、false ダブル立直でない
   */
  isFirstAroundReady(): boolean {
    return this.options.includes(WinningOptions.FIRST_AROUND_READY);
  }

  /**
   * 一発状態かどうか判定
   * @returns true 一発中、false 一発でない
   */
  isReadyAroundWin(): boolean {
    return this.options.includes(WinningOptions.READY_AROUND_WIN);
  }

  /**
   * 第一巡ツモ（天和・地和）かどうか判定
   * @returns true 第一巡ツモ、false 第一巡ツモでない
   */
  isFirstAroundTsumo(): boolean {
    return this.options.includes(WinningOptions.FIRST_AROUND_TSUMO);
  }

  /**
   * 海底摸月かどうか判定
   * @returns true 海底摸月、false 海底摸月でない
   */
  isLastTileTsumo(): boolean {
    return this.options.includes(WinningOptions.LAST_TILE_TSUMO);
  }

  /**
   * 河底撈魚かどうか判定
   * @returns true 河底撈魚、false 河底撈魚でない
   */
  isLastTileRon(): boolean {
    return this.options.includes(WinningOptions.LAST_TILE_RON);
  }

  /**
   * 嶺上開花かどうか判定
   * @returns true 嶺上開花、false 嶺上開花でない
   */
  isQuadTurnTsumo(): boolean {
    return this.options.includes(WinningOptions.QUAD_TURN_TSUMO);
  }

  /**
   * 槍槓かどうか判定
   * @returns true 槍槓、false 槍槓でない
   */
  isQuadTileRon(): boolean {
    return this.options.includes(WinningOptions.QUAD_TILE_RON);
  }

  /**
   * 八連荘かどうか判定
   * @returns true 八連荘、false 八連荘でない
   */
  isEightConsecutiveWin(): boolean {
    return this.options.includes(WinningOptions.EIGHT_CONSEQUTIVE_WIN);
  }

  /**
   * ツモ和了かどうか判定
   * @returns true ツモ和了、false ロン和了
   */
  isTsumo(): boolean {
    return this.supplierSide === Sides.SELF;
  }

  /**
   * ロン和了かどうか判定
   * @returns true ロン和了、false ツモ和了
   */
  isRon(): boolean {
    return this.supplierSide !== Sides.SELF;
  }

  /**
   * 親かどうか判定
   * @returns true 親、false 子
   */
  isDealer(): boolean {
    return this.seatWind === this.roundWind;
  }
}
