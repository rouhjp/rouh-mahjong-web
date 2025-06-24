// 点数計算関連の型定義 - 将来実装予定

import type { Tile } from '../tiles/types';
import type { Side, Wind } from '../winds/types';

// 役の定義
export interface HandType {
  name: string;        // 役の名前
  isLimit: boolean;    // 役満もしくは流し満貫かどうか
  doubles: number;     // 翻数（通常役の場合は1〜、役満の場合は0）
  limitType: LimitType; // 点数区分（役満、ダブル役満、流し満貫の場合に指定、その他はEMPTY）
}

// 面子の定義
export interface Meld {
  baseTiles: Tile[];    // もとになる牌（暗刻・暗槓の場合はすべての牌、副露の場合は手牌から出した牌）
  calledTile?: Tile;    // 副露で追加した牌（ポン・チー・明槓の場合）
  addedTile?: Tile;     // 加槓で追加した牌
  side: Side;           // 副露もと（暗刻・暗槓の場合はSELF）
}

// 待ちの定義
export const Waits = {
  DOUBLE_SIDE_STRAIGHT: {
    name: '両面待ち'
  },
  SINGLE_SIDE_STRAIGHT: {
    name: '辺張待ち'
  },
  MIDDLE_STRAIGHT: {
    name: '嵌張待ち'
  },
  EITHER_HEAD: {
    name: '双碰待ち'
  },
  SINGLE_HEAD: {
    name: '単騎待ち'
  }
} as const;

export type Wait = typeof Waits[keyof typeof Waits];

// 符の詳細定義
export const PointTypes = {
  BASE: {
    name: '副底',
    points: 20
  },
  SEVEN_PAIR_BASE: {
    name: '七対子固定符',
    points: 25
  },
  HEAD_SUIT: {
    name: '雀頭(数牌)',
    points: 0
  },
  HEAD_OTHER_WIND: {
    name: '雀頭(客風牌)',
    points: 0
  },
  HEAD_DRAGON: {
    name: '雀頭(三元牌)',
    points: 2
  },
  HEAD_SEAT_WIND: {
    name: '雀頭(自風牌)',
    points: 2
  },
  HEAD_ROUND_WIND: {
    name: '雀頭(場風牌)',
    points: 2
  },
  DOUBLE_VALUABLE_HEAD: {
    name: '雀頭(連風牌)',
    points: 4
  },
  STRAIGHT: {
    name: '順子',
    points: 0
  },
  TRIPLE: {
    name: '明刻(中張牌)',
    points: 2
  },
  ORPHAN_TRIPLE: {
    name: '明刻(么九牌)',
    points: 4
  },
  CONCEALED_TRIPLE: {
    name: '暗刻(中張牌)',
    points: 4
  },
  ORPHAN_CONCEALED_TRIPLE: {
    name: '暗刻(么九牌)',
    points: 8
  },
  QUAD: {
    name: '明槓(中張牌)',
    points: 8
  },
  ORPHAN_QUAD: {
    name: '明槓(么九牌)',
    points: 16
  },
  CONCEALED_QUAD: {
    name: '暗槓(中張牌)',
    points: 16
  },
  ORPHAN_CONCEALED_QUAD: {
    name: '暗槓(么九牌)',
    points: 32
  },
  DOUBLE_SIDE_STRAIGHT_WAIT: {
    name: '待ち(両面)',
    points: 0
  },
  EITHER_HEAD_WAIT: {
    name: '待ち(双碰)',
    points: 0
  },
  SINGLE_HEAD_WAIT: {
    name: '待ち(単騎)',
    points: 2
  },
  MIDDLE_STRAIGHT_WAIT: {
    name: '待ち(嵌張)',
    points: 2
  },
  SINGLE_SIDE_STRAIGHT_WAIT: {
    name: '待ち(辺張)',
    points: 2
  },
  TSUMO: {
    name: '自摸符',
    points: 2
  },
  CONCEALED_RON: {
    name: '門前加符',
    points: 10
  },
  CALLED_NO_POINT: {
    name: '平和加符',
    points: 10
  }
} as const;

export type PointType = typeof PointTypes[keyof typeof PointTypes];

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
  QUAD_TILE_RON: 'QUAD_TILE_RON'
} as const;

export type WinningOption = typeof WinningOptions[keyof typeof WinningOptions];

// 和了の組み合わせ（手牌の構成）
export interface HandCombination {
  melds: Meld[];        // 面子のリスト
  headTiles: Tile[];    // 雀頭（2枚）
  wait: Wait;           // 待ちの種類
  winningTile: Tile;    // 和了牌
}

// 和了状況（ゲーム状態）
export interface WinningSituation {
  roundWind: Wind;                    // 場風
  seatWind: Wind;                     // 自風
  supplierSide: Side;                 // 和了牌の供給元（ツモの場合は SELF）
  upperIndicators: Tile[];            // 表ドラ表示牌
  lowerIndicators: Tile[];            // 裏ドラ表示牌
  combinations: HandCombination[];    // 和了の組み合わせリスト
  options: WinningOption[];           // ゲーム状況フラグ
}

// 点数区分の定義
export const LimitTypes = {
  EMPTY: { 
    name: '', 
    baseScore: 0, 
    isHandLimit: false 
  },
  LIMIT: { 
    name: '満貫', 
    baseScore: 2000, 
    isHandLimit: false 
  },
  ONE_HALF_LIMIT: { 
    name: '跳満', 
    baseScore: 3000, 
    isHandLimit: false 
  },
  DOUBLE_LIMIT: { 
    name: '倍満', 
    baseScore: 4000, 
    isHandLimit: false 
  },
  TRIPLE_LIMIT: { 
    name: '三倍満', 
    baseScore: 6000, 
    isHandLimit: false 
  },
  COUNT_HAND_LIMIT: { 
    name: '役満', 
    baseScore: 8000, 
    isHandLimit: false 
  },
  HAND_LIMIT: { 
    name: '役満', 
    baseScore: 8000, 
    isHandLimit: true 
  },
  DOUBLE_HAND_LIMIT: { 
    name: '二倍役満', 
    baseScore: 16000, 
    isHandLimit: true 
  },
  TRIPLE_HAND_LIMIT: { 
    name: '三倍役満', 
    baseScore: 24000, 
    isHandLimit: true 
  },
  QUADRUPLE_HAND_LIMIT: { 
    name: '四倍役満', 
    baseScore: 32000, 
    isHandLimit: true 
  },
  QUINTUPLE_HAND_LIMIT: { 
    name: '五倍役満', 
    baseScore: 40000, 
    isHandLimit: true 
  },
  SEXTUPLE_HAND_LIMIT: { 
    name: '六倍役満', 
    baseScore: 48000, 
    isHandLimit: true 
  },
  SEPTUPLE_HAND_LIMIT: { 
    name: '七倍役満', 
    baseScore: 56000, 
    isHandLimit: true 
  },
  OCTUPLE_HAND_LIMIT: { 
    name: '八倍役満', 
    baseScore: 64000, 
    isHandLimit: true 
  }
} as const;

export type LimitType = typeof LimitTypes[keyof typeof LimitTypes];

// 符と翻数から点数区分を取得する関数
export function getLimitType(points: number, doubles: number): LimitType {
  if (doubles >= 13) return LimitTypes.COUNT_HAND_LIMIT;
  if (doubles >= 11) return LimitTypes.TRIPLE_LIMIT;
  if (doubles >= 8) return LimitTypes.DOUBLE_LIMIT;
  if (doubles >= 6) return LimitTypes.ONE_HALF_LIMIT;
  if (doubles === 5) return LimitTypes.LIMIT;
  if (doubles === 4 && points >= 40) return LimitTypes.LIMIT;
  if (doubles >= 3 && points >= 70) return LimitTypes.LIMIT;
  return LimitTypes.EMPTY;
}

// 役満倍数から点数区分を取得する関数
export function getHandLimitType(multiplier: number): LimitType {
  switch (multiplier) {
    case 1: return LimitTypes.HAND_LIMIT;
    case 2: return LimitTypes.DOUBLE_HAND_LIMIT;
    case 3: return LimitTypes.TRIPLE_HAND_LIMIT;
    case 4: return LimitTypes.QUADRUPLE_HAND_LIMIT;
    case 5: return LimitTypes.QUINTUPLE_HAND_LIMIT;
    case 6: return LimitTypes.SEXTUPLE_HAND_LIMIT;
    case 7: return LimitTypes.SEPTUPLE_HAND_LIMIT;
    case 8: return LimitTypes.OCTUPLE_HAND_LIMIT;
    default: throw new Error(`Invalid limit multiplier: ${multiplier}`);
  }
}