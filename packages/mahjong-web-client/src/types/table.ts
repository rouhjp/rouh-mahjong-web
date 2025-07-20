import { DiscardGuide, FinishType, GameResult, PaymentResult, RiverWinningResult, SeatStatus, Side, Tile, Wind, WinningResult } from "@mahjong/core";

export type Direction = 'bottom' | 'right' | 'top' | 'left';

const DIRECTIONS: Direction[] = ['bottom', 'right', 'top', 'left'];

export const toDirection = (side: Side): Direction => {
  switch (side) {
    case 'SELF':
      return 'bottom';
    case 'RIGHT':
      return 'right';
    case 'ACROSS':
      return 'top';
    case 'LEFT':
      return 'left';
    default:
      throw new Error(`Unknown side: ${side}`);
  }
}

export const leftOf = (direction: Direction): Direction => {
  return DIRECTIONS[(DIRECTIONS.indexOf(direction) + 1) % 4];
}

export const oppositeOf = (direction: Direction): Direction => {
  return DIRECTIONS[(DIRECTIONS.indexOf(direction) + 2) % 4];
}

export const rightOf = (direction: Direction): Direction => {
  return DIRECTIONS[(DIRECTIONS.indexOf(direction) + 3) % 4];
}

export const isSideways = (direction: Direction): boolean => {
  return direction === 'left' || direction === 'right';
}

export const getAngle = (direction: Direction): number => {
  switch (direction) {
    case 'top':
      return 0;
    case 'bottom':
      return 180;
    case 'left':
      return 270;
    case 'right':
      return 90;
    default:
      return 0;
  }
}

export type MeldData = {
  tiles: Tile[];
  tiltIndex?: number;
  addedTile?: Tile;
}

export const isAddQuad = (meld: MeldData): boolean => {
  return !!meld.addedTile;
}

export const isSelfQuad = (meld: MeldData): boolean => {
  return meld.tiltIndex === undefined;
}

export const isQuad = (meld: MeldData): boolean => {
  return meld.tiles.length + (meld.addedTile ? 1 : 0) === 4;
}


export type Slot = Tile | "back" | null;

/**
 * 呼び出し対象の情報
 */
export interface CallTarget {
  type: "river" | "add-quad" | "self-quad";
  side: Side;
  meldIndex?: number;
}

/**
 * 宣言テキストの情報
 */
export interface Declaration {
  id: string;
  text: string;
  direction: Direction;
  timestamp: number;
}

/**
 * 手牌状況の情報
 */
export interface HandStatus {
  winningTiles: Tile[];
  disqualified: boolean;
}

/**
 * 局情報
 */
export interface RoundInfo {
  roundWind: Wind;
  roundCount: number;
  continueCount: number;
  depositCount: number;
  last: boolean;
}

/**
 * 壁牌データ
 */
export interface WallData {
  top: Slot[][];
  right: Slot[][];
  bottom: Slot[][];
  left: Slot[][];
}

/**
 * 各プレイヤーのテーブル情報
 */
export interface SideTableData {
  seat?: SeatStatus;
  riverTiles: Tile[];
  readyIndex?: number;
  readyBarExists: boolean;
  handSize: number;
  hasDrawnTile: boolean;
  isHandOpen: boolean;
  handTiles?: Tile[];
  drawnTile?: Tile;
  openMelds: MeldData[];
}

/**
 * テーブル全体のデータ
 */
export interface TableData {
  bottom: SideTableData;
  right: SideTableData;
  top: SideTableData;
  left: SideTableData;
  wall: WallData;
  roundInfo?: RoundInfo;
  handStatus?: HandStatus;
  winningResults?: WinningResult[];
  riverWinningResults?: RiverWinningResult[];
  paymentResults?: PaymentResult[];
  drawFinishType?: FinishType;
  gameResults?: GameResult[];
  callTarget?: CallTarget;
  discardGuides?: DiscardGuide[];
}
